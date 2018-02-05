#ifndef _VVC_GLOBAL_H
#define _VVC_GLOBAL_H

#include "stm32f0xx.h"

// Assembly methods.

//GLOBAL_EXTERN_DELAY_CYCLES_START:
extern void delay_cycles(unsigned int d);
//GLOBAL_EXTERN_DELAY_CYCLES_DONE:
// ASM_METHOD_DEFINES: ^

// ----------------------

// User-defined global variables.

// GLOBAL_VAR_DEFINES: ^

// ----------------------

// System-defined global variables.

//SYS_GLOBAL_GPIO_INIT_STRUCT_START:
// Define a glocal 'GPIO_Init' struct for code autogenerators
// to use with the GPIO standard peripherals library.
GPIO_InitTypeDef global_gpio_init_struct;
//SYS_GLOBAL_GPIO_INIT_STRUCT_DONE:
// SYS_GLOBAL_VAR_DEFINES: ^

#endif
