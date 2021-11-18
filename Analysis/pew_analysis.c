#include <unicode/utf8.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include <analysis.h>

// #define LOG

#ifdef LOG

#include <unicode/ustdio.h>
UFILE *log_file;

#endif

uint32_t receive_message(UChar32** msg);
uint8_t *get_message_frame(UChar32* msg, uint32_t msg_length, uint32_t frame_length);
void message_to_metadata(UChar32* msg, uint32_t msg_length);

void notify_unsafe(uint64_t _start, uint64_t _end, uint16_t _x, uint16_t _y, bool _is_red);
void request_next_frame();

uint64_t buffer_size = 0;

/*------------------------------------------------------------------------------------------*/

int main(int argc, char const *argv[])
{
#ifdef LOG
	log_file = u_fopen("/tmp/log.txt", "a", NULL, "UTF_8");
#endif

	// Setup pete
	pete_notify_over_three_flashes = &notify_unsafe;

	// Get metadata
	UChar32 *msg;
	uint32_t msg_length;
	msg_length = receive_message(&msg);
	message_to_metadata(msg, msg_length);
	free(msg);
	fflush(stdin);

	buffer_size = video->width * video->height;
	buffer_size *= video->has_alpha ? 4 : 3;

	for(;;)
	{
		UChar32 *msg;
		uint32_t msg_length;
		msg_length = receive_message(&msg);

		if(msg_length == 1) break;

		uint8_t *frame = get_message_frame(msg, msg_length, buffer_size);
		free(msg);

		pete_receive_frame(frame);
		free(frame);

		request_next_frame();

		fflush(stdin);
	}

#ifdef LOG
	u_fflush(log_file);
	u_fclose(log_file);
#endif

	return 0;
}

/*------------------------------------------------------------------------------------------*/

void notify_unsafe(uint64_t _start, uint64_t _end, uint16_t _x, uint16_t _y, bool _is_red)
{
	putchar(0x01);
	putchar(0x00);
	putchar(0x00);
	putchar(0x00);
	putchar('1');
	fflush(stdout);
}

void request_next_frame()
{
	putchar(0x01);
	putchar(0x00);
	putchar(0x00);
	putchar(0x00);
	putchar('2');
	fflush(stdout);
}

/*------------------------------------------------------------------------------------------*/

uint32_t receive_message(UChar32** msg)
{
	uint32_t msg_raw_length;
	fread(&msg_raw_length, 4, 1, stdin);

#ifdef LOG
	u_fprintf(log_file, "Receiving raw message of length: %d\n", msg_raw_length);
#endif

	uint8_t *msg_raw = (uint8_t*) malloc(msg_raw_length * sizeof(uint8_t));
	fread(msg_raw, 1, msg_raw_length, stdin);

	*msg = (UChar32*) malloc(msg_raw_length * sizeof(UChar32));

	uint32_t i = 0, msg_length = 0;
	while(i < msg_raw_length)
	{
		UChar32 c;
		U8_NEXT(msg_raw, i, msg_raw_length, c);
		(*msg)[msg_length++] = c;
	}

#ifdef LOG
	for(i = 0; i < msg_length; ++i)
	{
		u_fputc((*msg)[i], log_file);
	}
	u_fprintf(log_file, "\n");
	u_fflush(log_file);
#endif

	free(msg_raw);

	return msg_length;
}

// Frame is encoded as a comma separated string of hexadecimal values
uint8_t *get_message_frame(UChar32* msg, uint32_t msg_length, uint32_t frame_length)
{
	// Overshoot the allocation and shrink later
	uint8_t *frame = (uint8_t*) malloc(msg_length * sizeof(uint8_t));

	frame[0] = 0;

	int j = 0;
	// Skip first and last since they are quotation marks
	for(uint32_t i = 1; i < msg_length-1; ++i)
	{
		if(msg[i] == ',')
		{
			frame[++j] = 0;
			continue;
		}

		// Read the frame in decimal because converting to hex in JS is slower
		frame[j] *= 10;

		frame[j] += msg[i] - '0';
	}
	
	frame = realloc(frame, frame_length * sizeof(uint8_t));

	return frame;
}

// Metadata is encoded as "width(16b hex),height(16b hex),fps(8b hex),has_alpha(t or f)"
void message_to_metadata(UChar32* msg, uint32_t msg_length)
{
	uint16_t width = 0, height = 0;
	uint8_t fps = 0;
	bool has_alpha;

	uint32_t i = 1;
	while(msg[i] != ',')
	{
		width = width << 4 & 0xfff0;

		if(msg[i] >= '0' && msg[i] <= '9')
		{
			width |= msg[i] - '0';
		}
		else if(msg[i] >= 'a' && msg[i] <= 'f')
		{
			width |= msg[i] - 'a' + 0xa;
		}

		++i;
	}
	++i; // Skip comma
	while(msg[i] != ',')
	{
		height = height << 4 & 0xfff0;

		if(msg[i] >= '0' && msg[i] <= '9')
		{
			height |= msg[i] - '0';
		}
		else if(msg[i] >= 'a' && msg[i] <= 'f')
		{
			height |= msg[i] - 'a' + 0xa;
		}

		++i;
	}
	++i; // Skip comma
	while(msg[i] != ',')
	{
		fps = fps << 4 & 0xf0;

		if(msg[i] >= '0' && msg[i] <= '9')
		{
			fps |= msg[i] - '0';
		}
		else if(msg[i] >= 'a' && msg[i] <= 'f')
		{
			fps |= msg[i] - 'a' + 0xa;
		}

		++i;
	}
	++i; // Skip comma
	has_alpha = (msg[i] == 't');

	pete_set_metadata(width, height, fps, has_alpha);

#ifdef LOG
	u_fprintf(log_file, "w: %d, h: %d, f: %d, a: %d\n", video->width, video->height, fps, video->has_alpha);
	u_fflush(log_file);
#endif
}