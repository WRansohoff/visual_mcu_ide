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
// ASM_GLOBAL_UTIL_DECLARES:

// ASM_GLOBAL_UTIL_DEFINES:

#endif
