#ifndef GESTUREDETECT_H_
#define GESTUREDETECT_H_

#include <stdint.h>

#define DECTION_FRAME_COUNT 50
#define OUTPUT_STATE_FILTERING_MEMORY 30

#define DIRECTION_UP    	0
#define DIRECTION_DOWN  	1
#define DIRECTION_LEFT  	2
#define DIRECTION_RIGHT 	3
#define DIRECTION_UNKNOWN 	4

void GestureDetect_Init();
int GestureDetect_AddDataAndGetGesture(int16_t* data);
void GestureDetect_RenderDebugScreen();

#endif
