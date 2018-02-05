/*
 * Test program to blink an LED for confirming that Thumb/C
 * code mixing works.
 *
 * Copyright William Ransohoff, Vivonomicon, LLC, 2017
 *
 * Open source under the MIT License
 */

.syntax unified
#ifdef VVC_F0
    .cpu cortex-m0
#elif  VVC_F3
    .cpu cortex-m4
#endif
.fpu softvfp
.thumb

// Global values.
.global reset_handler
.global main

/*
 * Addresses defined in linker script; see files
 * in 'ld/' for definitions of these values, which
 * depend on the specific chip.
 */
// Start of initialization values for the .data section.
.word _sidata
// Start / end of .data section.
.word _sdata
.word _edata
// Start / end of .bss section.
.word _sbss
.word _ebss
// Start/end of heap section
.word _sheap
.word _eheap

/*
 * The Reset handler. Called on reset.
 */
.section .text.reset_handler
.weak reset_handler
.type reset_handler, %function
reset_handler:
    BL   boot_sequence

    // Branch to the main program.
    B    main
.size reset_handler, .-reset_handler

/*
 * A 'main' method to branch to after initialization stuff is
 * completed by the Reset handler. This is the core program.
 */
.section .text.main
.weak main
.type main, %function
main:
    // Dummy 'main looop.'
    // This should never actually be called, as long as another 'main'
    // method is present. Like the one in our 'main.c' file.
    // (Set some 'dummy main loop reached' values.)
    LDR  r7, =0xDEADBEEF
    MOVS r0, #0
    main_loop:
        ADDS r0, r0, #1
        // Loop back.
        B    main_loop
.size main, .-main
