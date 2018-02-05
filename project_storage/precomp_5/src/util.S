#ifndef _VVC_UTIL_ASM
#define _VVC_UTIL_ASM

/*
 * Utility functions, for better legibility.
 */

.syntax unified
#ifdef VVC_F0
    .cpu cortex-m0
#elif  VVC_F3
    .cpu cortex-m4
#endif
.fpu softvfp
.thumb

// Instead of #include'ing this file everywhere, we can
// just declare the methods 'global' and make sure our
// Makefile compiles/links with this source file.
//UTIL_S_DELAY_CYCLES_DEC_START:
.global delay_cycles
//UTIL_S_DELAY_CYCLES_DEC_DONE:
// ASM_GLOBAL_UTIL_DECLARES:

//UTIL_S_DELAY_CYCLES_DEF_START:
/*
 * Delay a given number of MCU cycles.
 * Expects:
 *  r0 contains the number of cycles to wait.
 */
.type delay_cycles,%function
.section .text.delay_cycles,"ax",%progbits
delay_cycles:
  // TODO: Currently delays (r0+4) cycles, I think.
  // PUSH/LSRS/CMP/BEQ (no branch) in the beginning.
  PUSH { r0, lr }
  // Divide the number of cycles by 4 (loop takes 4 cycles)
  LSRS r0, r0, #2
  // (Pre-loop cycle, in case 0-3 is passed in)
  // CMP, BEQ (no branch) = 2 cycles.
  CMP  r0, #0
  BEQ  delay_cycles_done
  cycle_delay_loop:
  // Subtract takes 1 instruction
  SUBS r0, r0, #1
  // SUBS already sets condition flags, but this CMP makes
  // it an even four cycles per loop.
  CMP  r0, #0
  // Branch takes 2 instructions (except the last time)
  BNE  cycle_delay_loop
  delay_cycles_done:
  POP  { r0, pc }
.size delay_cycles, .-delay_cycles

//UTIL_S_DELAY_CYCLES_DEF_DONE:
// ASM_GLOBAL_UTIL_DEFINES:

#endif
