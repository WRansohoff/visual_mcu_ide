#Overview

Using Lapis as a web framework and Postgres as a database, try some simple ideas for a visual programming IDE. Currently nothing functional, but I am hoping to make a portable way to visually program small microcontrollers. To start with, I'd settle for a visual method of producing a .elf file. So currently, flashing/debugging is out of scope.

Why an IDE to program microcontrollers, instead of something like a game or website?

A) MCU programming involves a lot of code which is modularized by its nature - hardware peripherals setup, chip configuration, various communication protocols...embedded development is a natural fit for breaking actions into discrete FSM 'Nodes'.

B) Microcontrollers are good for education - they can easily interact with the real world which helps to keep students interested, and they do a good job of introducing the core concept of a computer program as a step-by-step list of instructions.
