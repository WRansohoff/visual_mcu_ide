#include "interrupts_c.h"

// C-language hardware interrupt method definitions.
/*
 * Each EXTI line between 0-15 can map to a GPIO pin.
 * The EXTI line number is the same as the pin number, and
 * each pin number can only have its interrupt active on
 * ONE (1) of its GPIO banks. So for example, you can have
 * an interrupt on pin A0 (EXTI line 0) and pin B1 (EXTI line 1)
 * at the same time, but not on pins A1 (EXTI line 1)
 * and B1 (EXTI line 1), since they share the same interrupt line.
 */
/*
 * EXTI0_1: Handle interrupt lines 0 and 1.
 */
void EXTI0_1_IRQ_handler(void) {
if (EXTI_GetITStatus(EXTI_Line0) != RESET) {
  EXTI_ClearITPendingBit(EXTI_Line0);
  // EXTI0_ENTRY:
  // TODO: Better way of handling 'end hardware interrupt' nodes.
  // For one thing, this extra 'goto' is wasteful. But it prevents
  // compiler warnings.
  goto EXTI0_DONE;
  EXTI0_DONE:
  ;
}
if (EXTI_GetITStatus(EXTI_Line1) != RESET) {
  EXTI_ClearITPendingBit(EXTI_Line1);
  // EXTI1_ENTRY:
  goto EXTI1_DONE;
  EXTI1_DONE:
  ;
}
return;
}

/*
 * EXTI2_3: Handle interrupt lines 2 and 3.
 */
void EXTI2_3_IRQ_handler(void) {
if (EXTI_GetITStatus(EXTI_Line2) != RESET) {
  EXTI_ClearITPendingBit(EXTI_Line2);
  // EXTI2_ENTRY:
  goto EXTI2_DONE;
  EXTI2_DONE:
  ;
}
if (EXTI_GetITStatus(EXTI_Line3) != RESET) {
  EXTI_ClearITPendingBit(EXTI_Line3);
  // EXTI3_ENTRY:
  goto EXTI3_DONE;
  EXTI3_DONE:
  ;
}
return;
}

/*
 * EXTI4_15: Handle interrupt lines between [4:15], inclusive.
 * TODO: To keep things fast, should this only add line checks
 * for interrupts in the preprocessor, if/when they get activated?
 */
void EXTI4_15_IRQ_handler(void) {
if (EXTI_GetITStatus(EXTI_Line4) != RESET) {
  EXTI_ClearITPendingBit(EXTI_Line4);
  // EXTI4_ENTRY:
  goto EXTI4_DONE;
  EXTI4_DONE:
  ;
}
if (EXTI_GetITStatus(EXTI_Line5) != RESET) {
  EXTI_ClearITPendingBit(EXTI_Line5);
  // EXTI5_ENTRY:
  goto EXTI5_DONE;
  EXTI5_DONE:
  ;
}
if (EXTI_GetITStatus(EXTI_Line6) != RESET) {
  EXTI_ClearITPendingBit(EXTI_Line6);
  // EXTI6_ENTRY:
  goto EXTI6_DONE;
  EXTI6_DONE:
  ;
}
if (EXTI_GetITStatus(EXTI_Line7) != RESET) {
  EXTI_ClearITPendingBit(EXTI_Line7);
  // EXTI7_ENTRY:
  goto EXTI7_DONE;
  EXTI7_DONE:
  ;
}
if (EXTI_GetITStatus(EXTI_Line8) != RESET) {
  EXTI_ClearITPendingBit(EXTI_Line8);
  // EXTI8_ENTRY:
  goto EXTI8_DONE;
  EXTI8_DONE:
  ;
}
if (EXTI_GetITStatus(EXTI_Line9) != RESET) {
  EXTI_ClearITPendingBit(EXTI_Line9);
  // EXTI9_ENTRY:
  goto EXTI9_DONE;
  EXTI9_DONE:
  ;
}
if (EXTI_GetITStatus(EXTI_Line10) != RESET) {
  EXTI_ClearITPendingBit(EXTI_Line10);
  // EXTI10_ENTRY:
  goto EXTI10_DONE;
  EXTI10_DONE:
  ;
}
if (EXTI_GetITStatus(EXTI_Line11) != RESET) {
  EXTI_ClearITPendingBit(EXTI_Line11);
  // EXTI11_ENTRY:
  goto EXTI11_DONE;
  EXTI11_DONE:
  ;
}
if (EXTI_GetITStatus(EXTI_Line12) != RESET) {
  EXTI_ClearITPendingBit(EXTI_Line12);
  // EXTI12_ENTRY:
  goto EXTI12_DONE;
  EXTI12_DONE:
  ;
}
if (EXTI_GetITStatus(EXTI_Line13) != RESET) {
  EXTI_ClearITPendingBit(EXTI_Line13);
  // EXTI13_ENTRY:
  goto EXTI13_DONE;
  EXTI13_DONE:
  ;
}
if (EXTI_GetITStatus(EXTI_Line14) != RESET) {
  EXTI_ClearITPendingBit(EXTI_Line14);
  // EXTI14_ENTRY:
  goto EXTI14_DONE;
  EXTI14_DONE:
  ;
}
if (EXTI_GetITStatus(EXTI_Line15) != RESET) {
  EXTI_ClearITPendingBit(EXTI_Line15);
  // EXTI15_ENTRY:
  goto EXTI15_DONE;
  EXTI15_DONE:
  ;
}
return;
}

// EXTI_INTERRUPTS_C_DEFINES:
