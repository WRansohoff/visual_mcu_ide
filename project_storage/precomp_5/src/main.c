#include "main.h"

/**
 * Main program.
 */
int main(void) {
  // ("Boot" node, program entry point)
  goto NODE_0;
  NODE_0:
  // TODO: boot code?
  goto NODE_6;
  // (End "Boot" node)

  // ("Enable Clock" (RCC) node)
  NODE_6:
  RCC_AHBPeriphClockCmd(RCC_AHBPeriph_GPIOA, ENABLE);
  goto NODE_1;
  // (End "Enable Clock" (RCC) node)

  // ("Setup GPIO Pin" node)
  NODE_1:
  // TODO: GPIO pin initialization code
  global_gpio_init_struct.GPIO_Pin = GPIO_Pin_2;
  global_gpio_init_struct.GPIO_Mode = GPIO_Mode_OUT;
  global_gpio_init_struct.GPIO_OType = GPIO_OType_PP;
  global_gpio_init_struct.GPIO_Speed = GPIO_Speed_Level_3;
  global_gpio_init_struct.GPIO_PuPd = GPIO_PuPd_UP;
  GPIO_Init(GPIOA, &global_gpio_init_struct);
  goto NODE_2;
  // (End "Setup GPIO Pin" node)

  // ("Set GPIO Output" node)
  NODE_2:
  GPIOA->ODR &= ~GPIO_ODR_2;
  goto NODE_5;
  // (End "Set GPIO Output" node)

  // ("Delay" node)
  NODE_5:
  delay_cycles(10000000);
  goto NODE_3;
  // (End "Delay" node)

  // ("Set GPIO Output" node)
  NODE_3:
  GPIOA->ODR |= GPIO_ODR_2;
  goto NODE_4;
  // (End "Set GPIO Output" node)

  // ("Delay" node)
  NODE_4:
  delay_cycles(5000000);
  goto NODE_2;
  // (End "Delay" node)

  // MAIN_ENTRY:

  // MAIN_RETURN_END:
  return 0;
}
