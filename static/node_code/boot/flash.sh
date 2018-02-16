#!/bin/bash

arm-none-eabi-gdb << EOF
target extended-remote :4242
load main.elf
disconnect
quit
EOF
