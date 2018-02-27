#ifndef _VVC_INTERRUPTS_C_H
#define _VVC_INTERRUPTS_C_H

#include "global.h"

// C-language hardware interrupt method signatures.
// EXTI handler for interrupt lines 0-1.
void EXTI0_1_IRQ_handler(void);

// EXTI handler for interrupt lines 2-3.
void EXTI2_3_IRQ_handler(void);

// EXTI handler for interrupt lines 4-15.
void EXTI4_15_IRQ_handler(void);

// EXTI_INTERRUPTS_C_DECLARES:

#endif
