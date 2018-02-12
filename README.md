# Overview

Using Lapis as a web framework and Postgres as a database, try some simple ideas for a visual programming IDE. Currently only extremely basic functionality, and only one type of chip is supported (a TSSOP-20 STM32F03xFx with external HSE oscillator), but it can produce working code for a 'blinking LED' program. Currently, flashing/debugging is out of scope, but I am thinking of adding an 'upload program' button if the web server is running locally on a machine which has a debugger/programmer connected.

Why an IDE to program microcontrollers, instead of something like a game or website?

A) MCU programming involves a lot of code which is modularized by its nature - hardware peripherals setup, chip configuration, various communication protocols...embedded development is a natural fit for breaking actions into discrete FSM 'Nodes'.

B) Microcontrollers are good for education - they can easily interact with the real world which helps to keep students interested, and they do a good job of introducing the core concept of a computer program as a step-by-step list of instructions.
