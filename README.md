# Overview

Using Lapis as a web framework and Postgres as a database, try some simple ideas for a visual programming IDE. Currently only extremely basic functionality, and only one type of chip is supported (a TSSOP-20 STM32F03xFx with external HSE oscillator), but it can produce working code for a few basic programs such as a blinking LED, an automatic plant waterer, or a stopwatch/clock using SSD1306 OLED screens. I'm adding functionality on a pretty sporadic basis, but I'm hoping to wind up with fairly comprehensive coverage of the STM32 peripherals, with some useful external features.

Hardware interrupts are not currently supported in any capacity, but I'm also hoping to add that functionality.

Buttons for 'verify' and 'build' are provided, but they make some big assumptions - basically, the 'build' button should upload a program if you have a debugging connection open to the chip on localhost port 4242, and if you have the 'arm-none-eabi' GCC toolchain setup. They're just conveniences for local development, though; they rely on host OS calls, and will not function if this is run as a remote web service.

Why an IDE to program microcontrollers, instead of something like a game or website?

A) MCU programming involves a lot of code which is modularized by its nature - hardware peripherals setup, chip configuration, various communication protocols...embedded development is a natural fit for breaking actions into discrete FSM 'Nodes'.

B) Microcontrollers are good for education - they can easily interact with the real world which helps to keep students interested, and they do a good job of introducing the core concept of a computer program as a step-by-step list of instructions.
