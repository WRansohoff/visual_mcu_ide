// 'Global' variables to use.
var selected_tool = "pan";
var selected_menu_tool = "";
var is_currently_panning = false;
var move_grabbed_node_id = -1;
var selected_node_id = -1;
var last_pan_mouse_x = -1;
var last_pan_mouse_y = -1;
var pan_scale_factor = 1.5;
var zoom_base = 64.0;
var cur_zoom = 1.0;
var cur_fsm_x = 0;
var cur_fsm_y = 0;
var cur_fsm_grid_x = 0;
var cur_fsm_grid_y = 0;
var cur_fsm_mouse_x = 0;
var cur_fsm_mouse_y = 0;
var gl = null;
var grid_shader_prog = null;
var node_shader_prog = null;
var img_lock = false;
var imgs_loaded = 0;
var img_gen = null;
// Array for keeping track of FSM node structs to send to the shader.
var fsm_nodes = [];
// (Fields sent to the shaders)
var fsm_node_struct_fields = [
  "tex_sampler",
  "node_status",
  "grid_coord_x",
  "grid_coord_y",
];
// 'currently-selected preview' node info.
var cur_tool_node_tex = -1;
var cur_tool_node_color = 'green';
var cur_tool_node_type = '';
var cur_tool_node_grid_x = 0;
var cur_tool_node_grid_y = 0;
// Preloaded textures
var loaded_textures = [];
// Global FSM program variables.
var mcu_chip = 'STM32F030F4';
var defined_vars = [];
// JSON struct representing a precompiled program.
var json_fsm_nodes = null;
// Value to track build status.
var build_flow_status = 'None';
// TODO: Shouldn't this be an array of strings, and a .length()?
var imgs_to_load = {
  Boot:              '/static/fsm_assets/boot_node.png',
  Delay:             '/static/fsm_assets/delay_node.png',
  Label:             '/static/fsm_assets/label_node.png',
  Jump:              '/static/fsm_assets/jump_node.png',
  Interrupt_Enable:  '/static/fsm_assets/enable_interrupt_node.png',
  Interrupt:         '/static/fsm_assets/interrupt_node.png',
  Interrupt_End:     '/static/fsm_assets/interrupt_end_node.png',
  GPIO_Init:         '/static/fsm_assets/init_gpio_node.png',
  GPIO_Output:       '/static/fsm_assets/set_output_pin_node.png',
  GPIO_Input:        '/static/fsm_assets/read_input_pin_node.png',
  RCC_Enable:        '/static/fsm_assets/enable_clock_node.png',
  RCC_Disable:       '/static/fsm_assets/disable_clock_node.png',
  New_Variable:      '/static/fsm_assets/new_var_node.png',
  Set_Variable:      '/static/fsm_assets/set_variable_node.png',
  Set_Var_Logic_Not: '/static/fsm_assets/set_not_node.png',
  Set_Var_Addition:  '/static/fsm_assets/set_addition_node.png',
  Nop_Node:          '/static/fsm_assets/no_op_node.png',
  // Peripherals:
  I2C_Init:          '/static/fsm_assets/init_i2c_node.png',
  I2C_Deinit:        '/static/fsm_assets/deinit_i2c_node.png',
  ADC_Init:          '/static/fsm_assets/init_adc_node.png',
  ADC_Read:          '/static/fsm_assets/read_adc_node.png',
  RTC_Init:          '/static/fsm_assets/init_rtc_node.png',
  RTC_Read_Time:     '/static/fsm_assets/read_rtc_time_node.png',
  RTC_Read_Date:     '/static/fsm_assets/read_rtc_date_node.png',
  RTC_Set_Time:      '/static/fsm_assets/set_rtc_time_node.png',
  RTC_Set_Date:      '/static/fsm_assets/set_rtc_date_node.png',
  // External device communications:
  SSD1306_Init:      '/static/fsm_assets/init_oled_screen_node.png',
  SSD1306_Draw_Px:   '/static/fsm_assets/oled_draw_pixel_node.png',
  SSD1306_Draw_HL:   '/static/fsm_assets/oled_draw_horiz_line_node.png',
  SSD1306_Draw_VL:   '/static/fsm_assets/oled_draw_vert_line_node.png',
  SSD1306_Draw_Rect: '/static/fsm_assets/oled_draw_rect_node.png',
  SSD1306_Draw_Text: '/static/fsm_assets/oled_draw_text_node.png',
  SSD1306_Refresh:   '/static/fsm_assets/oled_refresh_display_node.png',
  WS2812B_Write:      '/static/fsm_assets/write_ws2812.png',
  WS2812B_Latch:      '/static/fsm_assets/latch_ws2812.png',
  // Branching nodes:
  Check_Truthy:      '/static/fsm_assets/check_truthy_node.png',
  Check_Equals:      '/static/fsm_assets/check_equals_node.png',
  Check_GT:          '/static/fsm_assets/check_greater_node.png',
  Check_GT_EQ:       '/static/fsm_assets/check_greater_equals_node.png',
  Check_LT:          '/static/fsm_assets/check_lesser_node.png',
  Check_LT_EQ:       '/static/fsm_assets/check_lesser_equals_node.png',
  // Sooo I mixed up 'LtoR' and 'RtoL' in the png filenames. But long-term,
  // these should be svg files anyways so just...ugh, TODO
  left_arrow_blue:   '/static/fsm_assets/conn_LtoR_blue.png',
  right_arrow_blue:  '/static/fsm_assets/conn_RtoL_blue.png',
  up_arrow_blue:     '/static/fsm_assets/conn_BtoT_blue.png',
  down_arrow_blue:   '/static/fsm_assets/conn_TtoB_blue.png',
  left_arrow_green:   '/static/fsm_assets/conn_LtoR_green.png',
  right_arrow_green:  '/static/fsm_assets/conn_RtoL_green.png',
  up_arrow_green:     '/static/fsm_assets/conn_BtoT_green.png',
  down_arrow_green:   '/static/fsm_assets/conn_TtoB_green.png',
  left_arrow_canary:   '/static/fsm_assets/conn_LtoR_canary.png',
  right_arrow_canary:  '/static/fsm_assets/conn_RtoL_canary.png',
  up_arrow_canary:     '/static/fsm_assets/conn_BtoT_canary.png',
  down_arrow_canary:   '/static/fsm_assets/conn_TtoB_canary.png',
  left_arrow_pink:   '/static/fsm_assets/conn_LtoR_pink.png',
  right_arrow_pink:  '/static/fsm_assets/conn_RtoL_pink.png',
  up_arrow_pink:     '/static/fsm_assets/conn_BtoT_pink.png',
  down_arrow_pink:   '/static/fsm_assets/conn_TtoB_pink.png',
};
var num_imgs = 0;

// Global FSM program constants.
// (Available 'tool' nodes. These are the FSM building blocks.)
// TODO: Namespace menu names so that different menus can re-use names.
const tool_node_types = [
{
  base_name: 'Boot',
  menu_name: 'Boot',
  node_color: 'green',
  node_rgb: 'rgb(89,237,103)',
  node_w: 2,
  node_h: 1,
  new_gfx: true,
  options: {
    chip_type: {
      type: 'select',
      label: 'MCU Core:',
      options: [{
        name: 'STM32F030F4',
        value: 'STM32F030F4',
      },
      {
        name: 'STM32F031F6',
        value: 'STM32F031F6',
      },
      {
        name: 'STM32F030K6',
        value: 'STM32F030K6',
      }],
      default: 'STM32F030F4',
    },
  },
},
{
  base_name: 'Delay',
  menu_name: 'Delay',
  node_color: 'blue',
  node_rgb: 'rgb(112,130,239)',
  node_w: 2,
  node_h: 2,
  new_gfx: true,
  options: {
    delay_units: {
      type: 'select',
      label: 'Delay Units:',
      options: [{
        name: 'Cycles',
        value: 'cycles',
      },
      {
        name: 'Microseconds',
        value: 'us',
      },
      {
        name: 'Milliseconds',
        value: 'ms',
      },
      {
        name: 'Seconds',
        value: 's',
      }],
      default: 'cycles',
    },
    delay_value: {
      type: 'input_number',
      label: 'Units to Delay:',
      default: 0,
    },
  },
},
{
  base_name: 'Label',
  menu_name: 'Label',
  node_color: 'pink',
  node_rgb: 'rgb(255,87,233)',
  options: {
    label_name: {
      type: 'input_text_def',
      def_type: 'labels',
      def_backup: 'label_display_name',
      label: 'Label Name:',
      default: '',
    },
    label_display_name: {
      type: 'background',
      default: '',
    },
  },
},
{
  base_name: 'Jump',
  menu_name: 'Jump',
  node_color: 'pink',
  options: {
    label_name: {
      type: 'defined_label_select',
      label: 'Label Name:',
      default: '(None)',
    }
  },
},
{
  base_name: 'Interrupt_Enable',
  menu_name: 'Enable Hardware Interrupt',
  node_color: 'green',
  options: {
    interrupt_chan: {
      type: 'nvic_select',
      label: 'Interrupt Channel:',
      default: 'EXTI0',
      hides: [
        {
          opt: 'exti_gpio_bank',
          hide_on: [
            // TODO: Pending non-gpio interrupt lines.
          ],
          display_on: [
            'EXTI0',
            'EXTI1',
            'EXTI2',
            'EXTI3',
            'EXTI4',
            'EXTI5',
            'EXTI6',
            'EXTI7',
            'EXTI8',
            'EXTI9',
            'EXTI10',
            'EXTI11',
            'EXTI12',
            'EXTI13',
            'EXTI14',
            'EXTI15',
          ],
        },
      ],
    },
    exti_gpio_bank: {
      type: 'select',
      label: 'Interrupt GPIO Bank:',
      options: [
        { name: 'GPIOA', value: 'GPIOA', },
        { name: 'GPIOB', value: 'GPIOB', },
        { name: 'GPIOC', value: 'GPIOC', },
        { name: 'GPIOD', value: 'GPIOD', },
        { name: 'GPIOE', value: 'GPIOE', },
        { name: 'GPIOF', value: 'GPIOF', },
      ],
      default: 'GPIOA',
    },
  },
},
{
  base_name: 'Interrupt',
  menu_name: 'Hardware Interrupt (Start)',
  node_color: 'green',
  options: {
    interrupt_chan: {
      type: 'nvic_select',
      label: 'Interrupt Channel:',
      default: 'EXTI0',
    },
  },
},
{
  base_name: 'Interrupt_End',
  menu_name: 'Hardware Interrupt (Finish)',
  node_color: 'pink',
  options: {
  },
},
{
  base_name: 'GPIO_Init',
  menu_name: 'Setup GPIO Pin',
  node_color: 'green',
  options: {
    gpio_bank: {
      type: 'select',
      label: 'GPIO Pin Bank:',
      options: [
        { name: 'GPIOA', value: 'GPIOA', },
        { name: 'GPIOB', value: 'GPIOB', },
        { name: 'GPIOC', value: 'GPIOC', },
        { name: 'GPIOD', value: 'GPIOD', },
        { name: 'GPIOE', value: 'GPIOE', },
        { name: 'GPIOF', value: 'GPIOF', },
      ],
      default: 'GPIOA',
    },
    gpio_pin: {
      type: 'select',
      label: 'GPIO Pin Number:',
      options: [
        { name: '0', value: '0', },
        { name: '1', value: '1', },
        { name: '2', value: '2', },
        { name: '3', value: '3', },
        { name: '4', value: '4', },
        { name: '5', value: '5', },
        { name: '6', value: '6', },
        { name: '7', value: '7', },
        { name: '8', value: '8', },
        { name: '9', value: '9', },
        { name: '10', value: '10', },
        { name: '11', value: '11', },
        { name: '12', value: '12', },
        { name: '13', value: '13', },
        { name: '14', value: '14', },
        { name: '15', value: '15', },
      ],
      default: '0',
    },
    gpio_func: {
      type: 'select',
      label: 'Pin Function:',
      options: [
        { name: 'Output', value: 'Output', },
        { name: 'Input', value: 'Input', },
        { name: 'Analog', value: 'Analog', },
        { name: 'Alternate Function', value: 'AF', },
      ],
      default: 'Output',
    },
    gpio_otype: {
      type: 'select',
      label: 'Output Type:',
      options: [
        { name: 'Push-Pull', value: 'Push-Pull', },
        { name: 'Open-Drain', value: 'Open-Drain', },
      ],
      default: 'Push-Pull',
    },
    gpio_ospeed: {
      type: 'select',
      label: 'Output Speed',
      options: [
        { name: 'High (50MHz)', value: 'H', },
        { name: 'Medium (10MHz)', value: 'M', },
        { name: 'Low (2MHz)', value: 'L', },
      ],
      default: 'H',
    },
    gpio_pupdr: {
      type: 'select',
      label: 'Pull-up / Pull-down',
      options: [
        { name: 'Enable Pull-up', value: 'PU', },
        { name: 'Enable Pull-down', value: 'PD', },
        { name: 'No Pull-up/down', value: 'None', },
      ],
      default: 'PU',
    },
  },
},
{
  base_name: 'GPIO_Output',
  menu_name: 'Write Output Pin',
  node_color: 'blue',
  options: {
    gpio_bank: {
      type: 'select',
      label: 'GPIO Pin Bank:',
      options: [
        { name: 'GPIOA', value: 'GPIOA', },
        { name: 'GPIOB', value: 'GPIOB', },
        { name: 'GPIOC', value: 'GPIOC', },
        { name: 'GPIOD', value: 'GPIOD', },
        { name: 'GPIOE', value: 'GPIOE', },
        { name: 'GPIOF', value: 'GPIOF', },
      ],
      default: 'GPIOA',
    },
    gpio_pin: {
      type: 'select',
      label: 'GPIO Pin Number:',
      options: [
        { name: '0', value: '0', },
        { name: '1', value: '1', },
        { name: '2', value: '2', },
        { name: '3', value: '3', },
        { name: '4', value: '4', },
        { name: '5', value: '5', },
        { name: '6', value: '6', },
        { name: '7', value: '7', },
        { name: '8', value: '8', },
        { name: '9', value: '9', },
        { name: '10', value: '10', },
        { name: '11', value: '11', },
        { name: '12', value: '12', },
        { name: '13', value: '13', },
        { name: '14', value: '14', },
        { name: '15', value: '15', },
      ],
      default: '0',
    },
    gpio_val: {
      type: 'select',
      label: 'Output Value:',
      hides: [
        {
          opt: 'gpio_var_name',
          hide_on: [
            '0',
            '1',
          ],
          display_on: [
            'Var',
          ],
        },
      ],
      options: [
        { name: 'On', value: '1', },
        { name: 'Off', value: '0', },
        { name: 'Variable', value: 'Var', },
      ],
      default: '0',
    },
    gpio_var_name: {
      type: 'defined_var_select',
      label: 'Variable:',
      default: '(None)',
    },
  },
},
{
  base_name: 'GPIO_Input',
  menu_name: 'Read Input Pin',
  node_color: 'blue',
  options: {
    gpio_bank: {
      type: 'select',
      label: 'GPIO Pin Bank:',
      options: [
        { name: 'GPIOA', value: 'GPIOA', },
        { name: 'GPIOB', value: 'GPIOB', },
        { name: 'GPIOC', value: 'GPIOC', },
        { name: 'GPIOD', value: 'GPIOD', },
        { name: 'GPIOE', value: 'GPIOE', },
        { name: 'GPIOF', value: 'GPIOF', },
      ],
      default: 'GPIOA',
    },
    gpio_pin: {
      type: 'select',
      label: 'GPIO Pin Number:',
      options: [
        { name: '0', value: '0', },
        { name: '1', value: '1', },
        { name: '2', value: '2', },
        { name: '3', value: '3', },
        { name: '4', value: '4', },
        { name: '5', value: '5', },
        { name: '6', value: '6', },
        { name: '7', value: '7', },
        { name: '8', value: '8', },
        { name: '9', value: '9', },
        { name: '10', value: '10', },
        { name: '11', value: '11', },
        { name: '12', value: '12', },
        { name: '13', value: '13', },
        { name: '14', value: '14', },
        { name: '15', value: '15', },
      ],
      default: '0',
    },
    gpio_var_name: {
      type: 'defined_var_select',
      label: 'Store in Variable:',
      default: '(None)',
    },
  },
},
{
  base_name: 'RCC_Enable',
  menu_name: 'Enable Peripheral Clock',
  node_color: 'green',
  options: {
    periph_clock: {
      type: 'rcc_select',
      label: 'Peripheral Clock:',
      default: 'GPIOA',
    }
  },
},
{
  base_name: 'RCC_Disable',
  menu_name: 'Disable Peripheral Clock',
  node_color: 'pink',
  options: {
    periph_clock: {
      type: 'rcc_select',
      label: 'Peripheral Clock:',
      default: 'GPIOA',
    }
  },
},
{
  // TODO: This should probably be a separate menu, not a node.
  base_name: 'New_Variable',
  menu_name: 'Define Variable',
  node_color: 'green',
  options: {
    var_name: {
      type: 'input_text_def',
      def_type: 'variables',
      def_backup: 'var_display_name',
      label: 'Variable Name:',
      default: '',
    },
    var_display_name: {
      type: 'background',
      default: '',
    },
    var_type: {
      type: 'select',
      label: 'Variable Type:',
      determines: 'var_val',
      options: [
        { name: 'Integer', value: 'int', },
        { name: 'Floating-point', value: 'float', },
        { name: 'Boolean', value: 'bool', },
        { name: 'Letter', value: 'char', },
      ],
      default: 'int',
    },
    var_val: {
      // (This input depends on the value of 'var_type'.)
      type: 'TBD',
      label: 'Starting Value:',
      depends_on: 'var_type',
      types: [
        {
          val: 'int',
          type: 'input_number',
          default: '0',
        },
        {
          val: 'float',
          type: 'input_float',
          default: '0',
        },
        {
          val: 'bool',
          type: 'select',
          options: [
            { name: 'True', value: 1, },
            { name: 'False', value: 0, },
          ],
          default: 1,
        },
        {
          val: 'char',
          type: 'input_letter',
          default: 'c',
        },
      ],
      default: '0',
    },
  },
},
{
  base_name: 'Set_Variable',
  menu_name: 'Set Variable',
  node_color: 'blue',
  options: {
    var_name: {
      type: 'defined_var_select',
      label: 'Variable:',
      determines_var: 'var_val',
      default: '(None)',
    },
    var_val: {
      type: 'TBD_Var',
      label: 'New Value:',
      depends_on: 'var_name',
      default: '0',
    }
  },
},
{
  base_name: 'Set_Var_Logic_Not',
  menu_name: 'Logical Not',
  node_color: 'blue',
  options: {
    var_a_name: {
      type: 'defined_var_select',
      label: 'Variable A:',
      default: '(None)',
    },
    var_b_name: {
      type: 'defined_var_select',
      label: 'Variable B:',
      default: '(None)',
    },
  },
},
{
  base_name: 'Set_Var_Addition',
  menu_name: 'Add or Subtract',
  node_color: 'blue',
  options: {
    var_a_name: {
      type: 'defined_var_select',
      label: 'Variable A:',
      default: '(None)',
    },
    var_b_name: {
      type: 'defined_var_select',
      label: 'Variable B:',
      default: '(None)',
    },
    add_val_type: {
      type: 'select',
      label: "'C' Variable Type:",
      determines: 'add_val_val',
      options: [
        { name: 'Constant Value', value: 'val', },
        { name: 'Defined Variable', value: 'var', },
      ],
      default: 'val',
    },
    add_val_val: {
      // (This input depends on the value of 'add_val_type'.)
      type: 'TBD',
      label: "'C' Variable Value:",
      depends_on: 'add_val_type',
      types: [
        {
          val: 'val',
          type: 'input_number',
          default: '0',
        },
        {
          val: 'var',
          type: 'defined_var_select',
          default: '(None)',
        },
      ],
      default: '0',
    },
  },
},
{
  base_name: 'Nop_Node',
  menu_name: 'No-op (Do Nothing)',
  node_color: 'blue',
  options: {
  },
},
{
  base_name: 'I2C_Init',
  menu_name: 'Initialize I2C',
  node_color: 'green',
  options: {
    i2c_periph_num: {
      type: 'select',
      label: 'I2C Channel:',
      options: [
        { name: 'I2C (A9/A10)', value: '1', },
      ],
      default: '1',
    },
    scl_pin: {
      type: 'background',
      default: 'A9',
    },
    sda_pin: {
      type: 'background',
      default: 'A10',
    },
    gpio_af: {
      type: 'background',
      default: 'AF_4',
    },
    i2c_periph_speed: {
      type: 'select',
      label: 'I2C Speed:',
      options: [
        { name: '10KHz', value: '10KHz', },
        { name: '100KHz', value: '100KHz', },
        { name: '400KHz', value: '400KHz', },
        { name: '1MHz', value: '1MHz', },
      ],
      default: '100KHz',
    },
  },
},
{
  base_name: 'I2C_Deinit',
  menu_name: 'Deinitialize I2C',
  node_color: 'pink',
  options: {
    i2c_periph_num: {
      type: 'select',
      label: 'I2C Channel:',
      options: [
        { name: 'I2C1 (A9/A10)', value: '1', },
      ],
      default: '1',
    }
  },
},
{
  base_name: 'ADC_Init',
  menu_name: 'Initialize ADC',
  node_color: 'green',
  options: {
    adc_channel: {
      type: 'select',
      label: 'ADC Channel:',
      options: [
        { name: 'ADC1', value: '1', },
      ],
      default: '1',
    },
  },
},
{
  base_name: 'ADC_Read',
  menu_name: 'Read ADC Pin',
  node_color: 'blue',
  options: {
    adc_channel: {
      type: 'select',
      label: 'ADC Channel:',
      options: [
        { name: 'ADC1', value: '1', },
      ],
      default: '1',
    },
    gpio_bank: {
      type: 'select',
      label: 'GPIO Pin Bank:',
      options: [
        { name: 'GPIOA', value: 'GPIOA', },
        { name: 'GPIOB', value: 'GPIOB', },
        { name: 'GPIOC', value: 'GPIOC', },
        { name: 'GPIOD', value: 'GPIOD', },
        { name: 'GPIOE', value: 'GPIOE', },
        { name: 'GPIOF', value: 'GPIOF', },
      ],
      default: 'GPIOA',
    },
    gpio_pin: {
      type: 'select',
      label: 'GPIO Pin Number:',
      options: [
        { name: '0', value: '0', },
        { name: '1', value: '1', },
        { name: '2', value: '2', },
        { name: '3', value: '3', },
        { name: '4', value: '4', },
        { name: '5', value: '5', },
        { name: '6', value: '6', },
        { name: '7', value: '7', },
        { name: '8', value: '8', },
        { name: '9', value: '9', },
        { name: '10', value: '10', },
        { name: '11', value: '11', },
        { name: '12', value: '12', },
        { name: '13', value: '13', },
        { name: '14', value: '14', },
        { name: '15', value: '15', },
      ],
      default: '0',
    },
    adc_var: {
      type: 'defined_var_select',
      label: 'Read to Variable:',
      default: '(None)',
    },
  },
},
{
  base_name: 'RTC_Init',
  menu_name: 'Initialize RTC',
  node_color: 'green',
  options: {
    clock_source: {
      type: 'select',
      label: 'RTC Oscillator:',
      options: [
        { name: 'Internal Oscillator ~32KHz', value: 'LSI', },
        { name: 'External Oscillator @32.768KHz', value: 'LSE', },
      ],
      default: 'LSI',
    },
  },
},
{
  base_name: 'RTC_Read_Time',
  menu_name: 'Read RTC Time',
  node_color: 'blue',
  options: {
    seconds_read_var: {
      type: 'defined_var_select',
      label: "'Seconds' Variable:",
      default: '(None)',
    },
    minutes_read_var: {
      type: 'defined_var_select',
      label: "'Minutes' Variable:",
      default: '(None)',
    },
    hours_read_var: {
      type: 'defined_var_select',
      label: "'Hours' Variable:",
      default: '(None)',
    },
  },
},
{
  base_name: 'RTC_Read_Date',
  menu_name: 'Read RTC Date',
  node_color: 'blue',
  // (TODO)
  options: {
    days_read_var: {
      type: 'defined_var_select',
      default: '(None)',
    },
    day_of_week_read_var: {
      type: 'defined_var_select',
      default: '(None)',
    },
    month_read_var: {
      type: 'defined_var_select',
      default: '(None)',
    },
    year_read_var: {
      type: 'defined_var_select',
      default: '(None)',
    },
  },
},
{
  base_name: 'RTC_Set_Time',
  menu_name: 'Set RTC Time',
  node_color: 'blue',
  options: {
    // TODO
  },
  default_options: {
    seconds_type: 'val',
    seconds_val: '0',
    seconds_var: '(None)',
    minutes_type: 'val',
    minutes_val: '0',
    minutes_var: '(None)',
    hours_type: 'val',
    hours_val: '0',
    hours_var: '(None)',
  },
},
{
  base_name: 'RTC_Set_Date',
  menu_name: 'Set RTC Date',
  node_color: 'blue',
  options: {
    // TODO
  },
  default_options: {
    days_type: 'val',
    days_val: '1',
    days_var: '(None)',
    day_of_week_type: 'val',
    day_of_week_val: '1',
    day_of_week_var: '(None)',
    month_type: 'val',
    month_val: '1',
    month_var: '(None)',
    year_type: 'val',
    year_val: '1',
    year_var: '(None)',
  },
},
{
  base_name: 'SSD1306_Init',
  menu_name: 'Initialize Screen',
  node_color: 'green',
  options: {
    i2c_periph_num: {
      type: 'select',
      label: 'I2C Channel:',
      options: [
        { name: 'I2C1 (A9/A10)', value: '1', },
      ],
      default: '1',
    },
  },
},
{
  base_name: 'SSD1306_Draw_Px',
  menu_name: 'Draw Pixel',
  node_color: 'blue',
  options: {
    i2c_periph_num: {
      type: 'select',
      label: 'I2C Channel:',
      options: [
        { name: 'I2C1 (A9/A10)', value: '1', },
      ],
      default: '1',
    },
    px_x: {
      type: 'input_number',
      label: 'X-Coordinate:',
      default: 0
    },
    px_y: {
      type: 'input_number',
      label: 'Y-Coordinate:',
      default: 0
    },
    px_color: {
      type: 'select',
      label: '"Color":',
      options: [
        { name: 'On', value: 'On', },
        { name: 'Off', value: 'Off', },
      ],
      default: 'On',
    },
  },
},
{
  base_name: 'SSD1306_Draw_HL',
  menu_name: 'Draw Horizontal Line',
  node_color: 'blue',
  options: {
    i2c_periph_num: {
      type: 'select',
      label: 'I2C Channel:',
      options: [
        { name: 'I2C1 (A9/A10)', value: '1', },
      ],
      default: '1',
    },
    line_x: {
      type: 'input_number',
      label: 'X-Coordinate',
      default: 0
    },
    line_y: {
      type: 'input_number',
      label: 'Y-Coordinate',
      default: 0
    },
    line_length: {
      type: 'input_number',
      label: 'Line Length:',
      default: 0
    },
    line_color: {
      type: 'select',
      label: '"Color":',
      options: [
        { name: 'On', value: 'On', },
        { name: 'Off', value: 'Off', },
      ],
      default: 'On',
    },
  },
},
{
  base_name: 'SSD1306_Draw_VL',
  menu_name: 'Draw Vertical Line',
  node_color: 'blue',
  options: {
    i2c_periph_num: {
      type: 'select',
      label: 'I2C Channel:',
      options: [
        { name: 'I2C1 (A9/A10)', value: '1', },
      ],
      default: '1',
    },
    line_x: {
      type: 'input_number',
      label: 'X-Coordinate:',
      default: 0
    },
    line_y: {
      type: 'input_number',
      label: 'Y-Coordinate:',
      default: 0
    },
    line_length: {
      type: 'input_number',
      label: 'Line Length:',
      default: 0
    },
    line_color: {
      type: 'select',
      label: '"Color":',
      options: [
        { name: 'On', value: 'On', },
        { name: 'Off', value: 'Off', },
      ],
      default: 'On',
    },
  },
},
{
  base_name: 'SSD1306_Draw_Rect',
  menu_name: 'Draw Rectangle',
  node_color: 'blue',
  options: {
    i2c_periph_num: {
      type: 'select',
      label: 'I2C Channel:',
      options: [
        { name: 'I2C1 (A9/A10)', value: '1', },
      ],
      default: '1',
    },
    rect_x_type: {
      type: 'select',
      label: 'X-Coordinate Type:',
      options: [
        { name: 'Constant Number', value: 'val', },
        { name: 'Variable', value: 'var', },
      ],
      default: 'val',
      hides: [
        {
          opt: 'rect_x',
          hide_on: [
            'var',
          ],
          display_on: [
            'val',
          ],
        },
        {
          opt: 'rect_x_var',
          hide_on: [
            'val',
          ],
          display_on: [
            'var',
          ],
        },
      ],
    },
    rect_x: {
      type: 'input_number',
      label: 'X-Coordinate:',
      default: 0
    },
    rect_x_var: {
      type: 'defined_var_select',
      label: 'X-Coordinate Variable:',
      default: '(None)',
    },
    rect_y_type: {
      type: 'select',
      label: 'Y-Coordinate Type:',
      options: [
        { name: 'Constant Number', value: 'val', },
        { name: 'Variable', value: 'var', },
      ],
      default: 'val',
      hides: [
        {
          opt: 'rect_y',
          hide_on: [
            'var',
          ],
          display_on: [
            'val',
          ],
        },
        {
          opt: 'rect_y_var',
          hide_on: [
            'val',
          ],
          display_on: [
            'var',
          ],
        },
      ],
    },
    rect_y: {
      type: 'input_number',
      label: 'Y-Coordinate:',
      default: 0
    },
    rect_y_var: {
      type: 'defined_var_select',
      label: 'Y-Coordinate Variable:',
      default: '(None)',
    },
    rect_w_type: {
      type: 'select',
      label: 'Width Value Type:',
      options: [
        { name: 'Constant Number', value: 'val', },
        { name: 'Variable', value: 'var', },
      ],
      default: 'val',
      hides: [
        {
          opt: 'rect_w',
          hide_on: [
            'var',
          ],
          display_on: [
            'val',
          ],
        },
        {
          opt: 'rect_w_var',
          hide_on: [
            'val',
          ],
          display_on: [
            'var',
          ],
        },
      ],
    },
    rect_w: {
      type: 'input_number',
      label: 'Rect Width:',
      default: 0,
    },
    rect_w_var: {
      type: 'defined_var_select',
      label: 'Width Variable:',
      default: '(None)',
    },
    rect_h_type: {
      type: 'select',
      label: 'Height Value Type:',
      options: [
        { name: 'Constant Number', value: 'val', },
        { name: 'Variable', value: 'var', },
      ],
      default: 'val',
      hides: [
        {
          opt: 'rect_h',
          hide_on: [
            'var',
          ],
          display_on: [
            'val',
          ],
        },
        {
          opt: 'rect_h_var',
          hide_on: [
            'val',
          ],
          display_on: [
            'var',
          ],
        },
      ],
    },
    rect_h: {
      type: 'input_number',
      label: 'Rect Height:',
      default: 0
    },
    rect_h_var: {
      type: 'defined_var_select',
      label: 'Height Variable:',
      default: '(None)',
    },
    rect_color: {
      type: 'select',
      label: '"Color":',
      options: [
        { name: 'On', value: 'On', },
        { name: 'Off', value: 'Off', },
      ],
      default: 'On',
    },
    rect_style: {
      type: 'select',
      label: 'Fill Type:',
      hides: [
        {
          opt: 'outline',
          hide_on: [
            'Fill',
          ],
          display_on: [
            'Outline',
          ],
        },
      ],
      options: [
        { name: 'Fill', value: 'Fill', },
        { name: 'Outline', value: 'Outline', },
      ],
      default: 'Fill',
    },
    outline: {
      type: 'input_number',
      label: 'Outline Pixels:',
      default: 1
    },
  },
},
{
  base_name: 'SSD1306_Draw_Text',
  menu_name: 'Draw Text',
  node_color: 'blue',
  options: {
    i2c_periph_num: {
      type: 'select',
      label: 'I2C Channel:',
      options: [
        { name: 'I2C1 (A9/A10)', value: '1', },
      ],
      default: '1',
    },
    text_x: {
      type: 'input_number',
      label: 'X-Coordinate:',
      default: 0
    },
    text_y: {
      type: 'input_number',
      label: 'Y-Coordinate:',
      default: 0
    },
    text_type: {
      type: 'select',
      label: '"Text Source":',
      hides: [
        {
          opt: 'text_var',
          hide_on: [
            'val',
          ],
          display_on: [
            'var',
          ],
        },
        {
          opt: 'text_line',
          hide_on: [
            'var',
          ],
          display_on: [
            'val',
          ],
        },
      ],
      options: [
        { name: 'Constant Text', value: 'val', },
        { name: 'Variable', value: 'var', },
      ],
      default: 'val',
    },
    text_var: {
      type: 'defined_var_select',
      label: 'Display Text:',
      default: '(None)',
    },
    text_line: {
      type: 'input_text',
      label: 'Variable to Draw:',
      default: '',
    },
    text_size: {
      type: 'select',
      label: 'Text Size:',
      options: [
        { name: 'Small (6x8)', value: 'S', },
        { name: 'Large (12x16)', value: 'L', },
      ],
      default: 'S'
    },
    text_color: {
      type: 'select',
      label: '"Color":',
      options: [
        { name: 'On', value: 'On', },
        { name: 'Off', value: 'Off', },
      ],
      default: 'On',
    },
  },
},
{
  base_name: 'SSD1306_Refresh',
  menu_name: 'Refresh Display',
  node_color: 'blue',
  options: {
    i2c_periph_num: {
      type: 'select',
      label: 'I2C Channel:',
      options: [
        { name: 'I2C1 (A9/A10)', value: '1', },
      ],
      default: '1',
    },
  },
},
{
  base_name: 'WS2812B_Write',
  menu_name: 'Write NeoPixel',
  node_color: 'blue',
  options: {
    color_type_r: {
      type: 'select',
      label: 'Red Color Type:',
      options: [
          { name: 'Constant Number', value: 'val', },
          { name: 'Variable', value: 'var', },
      ],
      default: 'val',
      hides: [
        {
          opt: 'color_val_r',
          hide_on: [ 'var', ],
          display_on: [ 'val', ],
        },
        {
          opt: 'color_var_r',
          hide_on: [ 'val', ],
          display_on: [ 'var', ],
        },
      ],
    },
    color_type_g: {
      type: 'select',
      label: 'Green Color Type:',
      options: [
          { name: 'Constant Number', value: 'val', },
          { name: 'Variable', value: 'var', },
      ],
      default: 'val',
      hides: [
        {
          opt: 'color_val_g',
          hide_on: [ 'var', ],
          display_on: [ 'val', ],
        },
        {
          opt: 'color_var_g',
          hide_on: [ 'val', ],
          display_on: [ 'var', ],
        },
      ],
    },
    color_type_b: {
      type: 'select',
      label: 'Blue Color Type:',
      options: [
          { name: 'Constant Number', value: 'val', },
          { name: 'Variable', value: 'var', },
      ],
      default: 'val',
      hides: [
        {
          opt: 'color_val_b',
          hide_on: [ 'var', ],
          display_on: [ 'val', ],
        },
        {
          opt: 'color_var_b',
          hide_on: [ 'val', ],
          display_on: [ 'var', ],
        },
      ],
    },
    color_val_r: {
      type: 'input_number',
      label: 'Red Color (0-255):',
      default: 0,
    },
    color_var_r: {
      type: 'defined_var_select',
      label: 'Red Color Variable:',
      default: '(None)',
    },
    color_val_g: {
      type: 'input_number',
      label: 'Green Color (0-255):',
      default: 0,
    },
    color_var_g: {
      type: 'defined_var_select',
      label: 'Green Color Variable:',
      default: '(None)',
    },
    color_val_b: {
      type: 'input_number',
      label: 'Blue Color (0-255):',
      default: 0,
    },
    color_var_b: {
      type: 'defined_var_select',
      label: 'Blue Color Variable:',
      default: '(None)',
    },
    gpio_bank: {
      type: 'select',
      label: 'GPIO Pin Bank:',
      options: [
        { name: 'GPIOA', value: 'GPIOA', },
        { name: 'GPIOB', value: 'GPIOB', },
        { name: 'GPIOC', value: 'GPIOC', },
        { name: 'GPIOD', value: 'GPIOD', },
        { name: 'GPIOE', value: 'GPIOE', },
        { name: 'GPIOF', value: 'GPIOF', },
      ],
      default: 'GPIOA',
    },
    gpio_pin: {
      type: 'select',
      label: 'GPIO Pin Number:',
      options: [
        { name: '0', value: '0', },
        { name: '1', value: '1', },
        { name: '2', value: '2', },
        { name: '3', value: '3', },
        { name: '4', value: '4', },
        { name: '5', value: '5', },
        { name: '6', value: '6', },
        { name: '7', value: '7', },
        { name: '8', value: '8', },
        { name: '9', value: '9', },
        { name: '10', value: '10', },
        { name: '11', value: '11', },
        { name: '12', value: '12', },
        { name: '13', value: '13', },
        { name: '14', value: '14', },
        { name: '15', value: '15', },
      ],
      default: '0',
    },
  },
},
{
  base_name: 'WS2812B_Latch',
  menu_name: 'Latch NeoPixels',
  node_color: 'blue',
  options: {
    gpio_bank: {
      type: 'select',
      label: 'GPIO Pin Bank:',
      options: [
        { name: 'GPIOA', value: 'GPIOA', },
        { name: 'GPIOB', value: 'GPIOB', },
        { name: 'GPIOC', value: 'GPIOC', },
        { name: 'GPIOD', value: 'GPIOD', },
        { name: 'GPIOE', value: 'GPIOE', },
        { name: 'GPIOF', value: 'GPIOF', },
      ],
      default: 'GPIOA',
    },
    gpio_pin: {
      type: 'select',
      label: 'GPIO Pin Number:',
      options: [
        { name: '0', value: '0', },
        { name: '1', value: '1', },
        { name: '2', value: '2', },
        { name: '3', value: '3', },
        { name: '4', value: '4', },
        { name: '5', value: '5', },
        { name: '6', value: '6', },
        { name: '7', value: '7', },
        { name: '8', value: '8', },
        { name: '9', value: '9', },
        { name: '10', value: '10', },
        { name: '11', value: '11', },
        { name: '12', value: '12', },
        { name: '13', value: '13', },
        { name: '14', value: '14', },
        { name: '15', value: '15', },
      ],
      default: '0',
    },
  },
},
{
  base_name: 'Check_Truthy',
  menu_name: 'Is Variable Truth-y?',
  node_color: 'canary',
  node_rgb: 'rgb(223,234,105)',
  options: {
    var_name: {
      type: 'defined_var_select',
      label: 'Variable to Check:',
      default: '(None)',
    },
  },
},
// TODO: Consolidate 'check <logic>' nodes into one node with
// multiple 'check_type' options ('==', '>', '>=', etc.)
{
  base_name: 'Check_Equals',
  menu_name: 'Are Variables Equal?',
  node_color: 'canary',
  options: {
    var_a_name: {
      type: 'defined_var_select',
      label: 'Variable A:',
      default: '(None)',
    },
    var_b_name: {
      type: 'defined_var_select',
      label: 'Variable B:',
      default: '(None)',
    },
  },
},
{
  base_name: 'Check_GT',
  menu_name: 'Is A Greater than B?',
  node_color: 'canary',
  options: {
    var_a_name: {
      type: 'defined_var_select',
      label: 'Variable A:',
      default: '(None)',
    },
    var_b_name: {
      type: 'defined_var_select',
      label: 'Variable B:',
      default: '(None)',
    },
  },
},
{
  base_name: 'Check_GT_EQ',
  menu_name: 'Is A Greater or Equal to B?',
  node_color: 'canary',
  options: {
    var_a_name: {
      type: 'defined_var_select',
      label: 'Variable A:',
      default: '(None)',
    },
    var_b_name: {
      type: 'defined_var_select',
      label: 'Variable B:',
      default: '(None)',
    },
  },
},
{
  base_name: 'Check_LT',
  menu_name: 'Is A Less than B?',
  node_color: 'canary',
  options: {
    var_a_name: {
      type: 'defined_var_select',
      label: 'Variable A:',
      default: '(None)',
    },
    var_b_name: {
      type: 'defined_var_select',
      label: 'Variable B:',
      default: '(None)',
    },
  },
},
{
  base_name: 'Check_LT_EQ',
  menu_name: 'Is A Lesser or Equal to B?',
  node_color: 'canary',
  options: {
    var_a_name: {
      type: 'defined_var_select',
      label: 'Variable A:',
      default: '(None)',
    },
    var_b_name: {
      type: 'defined_var_select',
      label: 'Variable B:',
      default: '(None)',
    },
  },
},
/* 9
{
  base_name: 'Delay',
  menu_name: 'Delay',
  node_color: 'blue',
  options: {
  },
},
*/
];

// TODO: Hash instead of using an array?
get_node_type_def_by_name = function(type_name) {
  for (var tn_ind in tool_node_types) {
    var cur_type = tool_node_types[tn_ind];
    if (cur_type) {
      if (type_name == cur_type.base_name &&
          (loaded_textures[cur_type.base_name] ||
           cur_type.new_gfx)) {
        return cur_type;
      }
    }
  }
  return false;
};

// (Available RCC peripheral clocks.)
const rcc_opts = {
  STM32F03xFx: {
    GPIOA:   'GPIO Bank A',
    GPIOB:   'GPIO Bank B',
    GPIOC:   'GPIO Bank C',
    GPIOD:   'GPIO Bank D',
    // (GPIO Bank E only available on F072 devices.)
    GPIOF:   'GPIO Bank F',
    TS:      'Touch-Sensing Controller',
    CRC:     'Cyclic Redundancy Check',
    FLITF:   'Sleep-Mode Flash Programming',
    SRAM:    'Static RAM Controller',
    DMA1:    'Direct Memory Access, Channel 1',
    DMA2:    'Direct Memory Access, Channel 2',
    SYSCFG:  'System Configuration',
    USART6:  'USART Bus 6',
    // TODO: USART 7-8 are on F031, but not F030.
    ADC1:    'Analog-Digital Converter, Channel 1',
    TIM1:    'Timer 1',
    SPI1:    'Serial Peripheral Interface 1',
    USART1:  'USART Bus 1',
    TIM15:   'Timer 15',
    TIM16:   'Timer 16',
    TIM17:   'Timer 17',
    DBGMCU:  'Debug Controller',
    TIM3:    'Timer 3',
    TIM6:    'Timer 6',
    TIM14:   'Timer 14',
    WWDG:    'Window-Watchdog Timer',
    SPI2:    'Serial Peripheral Interface 2',
    USART2:  'USART Bus 2',
    I2C1:    'Inter-IC Communication 1',
    I2C2:    'Inter-IC Communication 2',
    PWR:     'Power Controller',
    // TODO: CRS, CEC, DAC are on F031, but not F030.
  },
};

// (Available NVIC/EXTI interrupt channels/lines.)
const interrupt_opts = {
  STM32F03xFx: {
    // (TODO: Other interrupts.)
    // (EXTI0_1)
    EXTI0:         'EXTI Line 0 (GPIOx pin 0)',
    EXTI1:         'EXTI Line 1 (GPIOx pin 1)',
    // (EXTI2_3)
    EXTI2:         'EXTI Line 2 (GPIOx pin 2)',
    EXTI3:         'EXTI Line 3 (GPIOx pin 3)',
    // (EXTI4_15)
    EXTI4:         'EXTI Line 4 (GPIOx pin 4)',
    EXTI5:         'EXTI Line 5 (GPIOx pin 5)',
    EXTI6:         'EXTI Line 6 (GPIOx pin 6)',
    EXTI7:         'EXTI Line 7 (GPIOx pin 7)',
    EXTI8:         'EXTI Line 8 (GPIOx pin 8)',
    EXTI9:         'EXTI Line 9 (GPIOx pin 9)',
    EXTI10:         'EXTI Line 10 (GPIOx pin 10)',
    EXTI11:         'EXTI Line 11 (GPIOx pin 11)',
    EXTI12:         'EXTI Line 12 (GPIOx pin 12)',
    EXTI13:         'EXTI Line 13 (GPIOx pin 13)',
    EXTI14:         'EXTI Line 14 (GPIOx pin 14)',
    EXTI15:         'EXTI Line 15 (GPIOx pin 15)',
  },
};
