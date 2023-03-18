#include <string.h>

#include "GestureDetect.h"
#include "MAX25405.h"
#include "board.h"
#include "max20303.c"
#include "max20303.h"
#include "mxc.h"
#include "mxc_device.h"
#include "nvic_table.h"

static int isNewGestureSensorDataAvailable = 0;
static int isTimeToCheckSensorFailure = 0;
static int framesReceivedSinceLastCheck = 0;

#define MAX25405_INT_GPIO MXC_GPIO0
#define MAX25405_INT_PIN MXC_GPIO_PIN_20
#define MAX25405_INT_IRQn GPIO0_IRQn

void MAX25405_HandleInterrupt() {
    MXC_GPIO_ClearFlags(MXC_GPIO0, MXC_GPIO_PIN_20);
    isNewGestureSensorDataAvailable = 1;
}

void MAX25405_InitInterrupt() {
    int status;

    mxc_gpio_cfg_t intLine;
    intLine.port = MAX25405_INT_GPIO;
    intLine.mask = MAX25405_INT_PIN;
    intLine.func = MXC_GPIO_FUNC_IN;
    intLine.pad = MXC_GPIO_PAD_PULL_UP;
    intLine.vssel = MXC_GPIO_VSSEL_VDDIOH;

    status = MXC_GPIO_Config(&intLine);
    if (status) {
        __BKPT(0);
    }

    NVIC_ClearPendingIRQ(MAX25405_INT_IRQn);
    NVIC_SetPriority(MAX25405_INT_IRQn, 0);
    MXC_NVIC_SetVector(MAX25405_INT_IRQn, MAX25405_HandleInterrupt);

    status = MXC_GPIO_IntConfig(&intLine, MXC_GPIO_INT_FALLING);
    if (status) {
        __BKPT(0);
    }

    MXC_GPIO_EnableInt(MAX25405_INT_GPIO, MAX25405_INT_PIN);
}

void Timer_InterruptHandler() {
    isTimeToCheckSensorFailure = 1;
    MXC_TMR_ClearFlags(MXC_TMR0);
    MXC_GPIO_OutToggle(MXC_GPIO2, MXC_GPIO_PIN_2);
}

void Timer_Init() {
    int status;

    mxc_gpio_cfg_t led;
    led.port = MXC_GPIO2;
    led.mask = MXC_GPIO_PIN_2;
    led.func = MXC_GPIO_FUNC_OUT;
    led.pad = MXC_GPIO_PAD_NONE;
    led.vssel = MXC_GPIO_VSSEL_VDDIO;

    status = MXC_GPIO_Config(&led);
    if (status) {
        __BKPT(0);
    }

    MXC_GPIO_OutSet(MXC_GPIO2, MXC_GPIO_PIN_2);

    NVIC_ClearPendingIRQ(TMR0_IRQn);
    NVIC_SetPriority(TMR0_IRQn, 3);
    NVIC_EnableIRQ(TMR0_IRQn);
    MXC_NVIC_SetVector(TMR0_IRQn, Timer_InterruptHandler);

    mxc_tmr_cfg_t cfg;
    cfg.bitMode = TMR_BIT_MODE_32;
    cfg.clock = MXC_TMR_8M_CLK;
    cfg.mode = TMR_MODE_CONTINUOUS;
    cfg.cmp_cnt = 750000;
    cfg.pol = 0;
    cfg.pres = TMR_PRES_8;

    status = MXC_TMR_Init(MXC_TMR0, &cfg, 0);
    if (status) {
        __BKPT(0);
    }

    MXC_TMR_EnableInt(MXC_TMR0);
    MXC_TMR_Start(MXC_TMR0);
}

int main() {
    int iStatus;
    MAX25405_Status mStatus;
    MAX25405_Device max25405dev;
    int lastGesture;

    printf("Init started\r\n");

    MXC_Delay(10000);

    // select MAX25405 interface: SPI (SEL pin LOW, HIGH mean I2C)
    mxc_gpio_cfg_t sel;
    sel.port = MXC_GPIO1;
    sel.mask = MXC_GPIO_PIN_9;
    sel.func = MXC_GPIO_FUNC_OUT;
    sel.pad = MXC_GPIO_PAD_NONE;
    sel.vssel = MXC_GPIO_VSSEL_VDDIOH;
    iStatus = MXC_GPIO_Config(&sel);
    if (iStatus) {
        printf("MXC_GPIO_Config failed.\r\n");
        __BKPT(0);
    }
    MXC_GPIO_OutClr(sel.port, sel.mask);

    // LED GREEN
    mxc_gpio_cfg_t ledGreen;
    ledGreen.port = MXC_GPIO0;
    ledGreen.mask = MXC_GPIO_PIN_19;
    ledGreen.func = MXC_GPIO_FUNC_OUT;
    ledGreen.pad = MXC_GPIO_PAD_NONE;
    ledGreen.vssel = MXC_GPIO_VSSEL_VDDIOH;
    iStatus = MXC_GPIO_Config(&ledGreen);
    if (iStatus) {
        printf("MXC_GPIO_Config failed.\r\n");
        __BKPT(0);
    }
    MXC_GPIO_OutSet(ledGreen.port, ledGreen.mask);

    // LED RED
    mxc_gpio_cfg_t ledRed;
    ledRed.port = MXC_GPIO0;
    ledRed.mask = MXC_GPIO_PIN_18;
    ledRed.func = MXC_GPIO_FUNC_OUT;
    ledRed.pad = MXC_GPIO_PAD_NONE;
    ledRed.vssel = MXC_GPIO_VSSEL_VDDIOH;
    iStatus = MXC_GPIO_Config(&ledRed);
    if (iStatus) {
        __BKPT(0);
    }
    MXC_GPIO_OutSet(ledRed.port, ledRed.mask);

    mStatus = MAX25405_InitSPI(&max25405dev, 0);
    if (mStatus) {
        printf("MAX25405_InitSPI failed.\r\n");
        MXC_GPIO_OutSet(ledGreen.port, ledGreen.mask);
        MXC_GPIO_OutClr(ledRed.port, ledRed.mask);
        MXC_Delay(3000000);
        NVIC_SystemReset();
        __BKPT(0);
    }

    mStatus = MAX25405_Reset(&max25405dev);
    if (mStatus) {
        printf("MAX25405_Reset failed.\r\n");
        MXC_GPIO_OutSet(ledGreen.port, ledGreen.mask);
        MXC_GPIO_OutClr(ledRed.port, ledRed.mask);
        MXC_Delay(3000000);
        NVIC_SystemReset();
        __BKPT(0);
    }

    // waste possible Power on Reset interrupt
    MAX25405_Interrupt ints;
    MAX25405_GetPendingInterrupts(&max25405dev, &ints);

    MAX25405_Configuration config;
    MAX25405_GetDefaultConfiguration(&config);
    config.mainConfig.modeOfOperation = MAX25405_ModeOfOperation_TrackingMode;
    config.ledConfig.ledDrive = MAX25405_LedDrive_PWM_16_16;
    config.ledConfig.enableDrivePwmOutput = 1;
    config.ledConfig.columnGainMode = MAX25405_ColumnGainModeSelection_Internal;
    config.mainConfig.enableEndOfConversionInterrupt = 1;
    config.sequencingConfig.endOfConversionDelay = MAX25405_EndOfConversionDelay_3_12ms;
    config.sequencingConfig.integrationTime = MAX25405_IntegrationTime_25us;
    config.sequencingConfig.numberOfCoherentDoubleSamples = MAX25405_NumberOfCoherentDoubleSamples_8;

    mStatus = MAX25405_SetConfiguration(&max25405dev, &config);
    if (mStatus) {
        printf("MAX25405_SetConfiguration failed.\r\n");
        MXC_GPIO_OutSet(ledGreen.port, ledGreen.mask);
        MXC_GPIO_OutClr(ledRed.port, ledRed.mask);
        MXC_Delay(3000000);
        NVIC_SystemReset();
        __BKPT(0);
    }

    MAX25405_Configuration configCheck;
    mStatus = MAX25405_GetConfiguration(&max25405dev, &configCheck);
    if (mStatus) {
        printf("MAX25405_GetConfiguration failed.\r\n");
        MXC_GPIO_OutSet(ledGreen.port, ledGreen.mask);
        MXC_GPIO_OutClr(ledRed.port, ledRed.mask);
        MXC_Delay(3000000);
        NVIC_SystemReset();
        __BKPT(0);
    }

    MAX25405_InitInterrupt();

    Timer_Init();

    GestureDetect_Init();

    printf("Init successfull\r\n");

    while (1) {
        if (isNewGestureSensorDataAvailable) {
            isNewGestureSensorDataAvailable = 0;

            int16_t data[60];

            mStatus = MAX25405_GetAllPixelData(&max25405dev, data);
            if (mStatus) {
                __BKPT(0);
            }

            lastGesture = GestureDetect_AddDataAndGetGesture(data);

            if (lastGesture != -1) {
                if (lastGesture == DIRECTION_UP) {
                    printf("up\r\n");
                } else if (lastGesture == DIRECTION_DOWN) {
                    printf("down\r\n");
                } else if (lastGesture == DIRECTION_LEFT) {
                    printf("left\r\n");
                } else if (lastGesture == DIRECTION_RIGHT) {
                    printf("right\r\n");
                }
            }

            framesReceivedSinceLastCheck++;
        }

        if (isTimeToCheckSensorFailure) {
            isTimeToCheckSensorFailure = 0;

            if (framesReceivedSinceLastCheck == 0) {
                MXC_GPIO_OutSet(ledGreen.port, ledGreen.mask);
                MXC_GPIO_OutClr(ledRed.port, ledRed.mask);
                MXC_Delay(100000);
                NVIC_SystemReset();
            } else {
                MXC_GPIO_OutClr(ledGreen.port, ledGreen.mask);
                MXC_GPIO_OutSet(ledRed.port, ledRed.mask);
            }

            framesReceivedSinceLastCheck = 0;
        }
    }
}
