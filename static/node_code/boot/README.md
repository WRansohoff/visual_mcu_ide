# 'Boot' node code

The 'Boot' node dictates initialization settings for the microcontroller and generates a comparatively large amount of code, compared to most nodes.

For now, there are minimal options available; it can only provide a common project skeleton for one of two highly similar chips. They are both ARM Cortex-M0 MCU cores made by ST, in small 20-pin TSSOP packages:

- STM32F030F4
- STM32F031F6

# Generated code structure

The following files/directories will be generated:

## Makefile

The Makefile is a GNU Make recipe which builds the project using the arm-none-eabi-gcc toolchain.

## boot/

The 'boot/' directory contains a boot script written in assembly. It performs some basic setup logic on a reset, and initializes the system to use an external 8MHz oscillator to source a 48MHz clock signal. In the future, those values will be configurable, as will the oscillator source.

## vector_tables/

The 'vector_tables/' directory contains an NVIC interrupt table setup to handle all available hardware interrupts with an 'infinite loop' default handler.

## ld/

The 'ld/' directory contains a linker script describing how much RAM and Flash storage is available on the target chip.

## src/

The 'src/' directory contains source files. The 'boot' node will just make empty .c/.h/.S 'utilities' files (which future nodes will put methods they need into) and a 'main' .c/.h file which will have an empty 'main' method and a 'boot' label at the very beginning of that method. Future code will be inserted there.

Note that it will also add some vendor-provided files such as 'stm32f0xx.h'. These files are not strictly necessary and may be removed in the future, but for now they provide a nice and easy way to produce legible machine-generated code. Essentially, they break out common register addresses/operations into C definitions and small methods. They do cause severe code bloat, sadly; the C libraries are very large compared to a library-less C skeleton which calls critical components written in assembly, and these chips have very limited space.

But for now, they're more useful than harmful and they might allow adding support for a lot of peripherals quickly.
