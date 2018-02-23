// 'Global' variables to use.
var selected_tool = "pan";
var selected_menu_tool = "";
var is_currently_panning = false;
var move_grabbed_node_id = -1;
var selected_node_id = -1;
var last_pan_mouse_x = -1;
var last_pan_mouse_y = -1;
var pan_scale_factor = 1.5;
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
  // Branching nodes:
  Check_Truthy:      '/static/fsm_assets/check_truthy_node.png',
  Check_Equals:      '/static/fsm_assets/check_equals_node.png',
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
  default_options: {
    chip_type: 'STM32F030F4',
  },
  options_listeners: apply_boot_node_options_listeners,
  options_html: boot_node_options_html,
},
{
  base_name: 'Delay',
  menu_name: 'Delay',
  node_color: 'blue',
  default_options: {
    delay_units: 'cycles',
    delay_value: 0,
  },
  options_listeners: apply_delay_node_options_listeners,
  options_html: delay_node_options_html,
},
{
  base_name: 'Label',
  menu_name: 'Label',
  node_color: 'pink',
  default_options: {
    label_name: '',
    label_display_name: '',
  },
  options_listeners: apply_label_node_options_listeners,
  options_html: label_node_options_html,
},
{
  base_name: 'Jump',
  menu_name: 'Jump',
  node_color: 'pink',
  default_options: {
    label_name: '(None)',
  },
  options_listeners: apply_jump_node_options_listeners,
  options_html: jump_node_options_html,
},
{
  base_name: 'GPIO_Init',
  menu_name: 'Setup GPIO Pin',
  node_color: 'green',
  default_options: {
    gpio_bank:   'GPIOA',
    gpio_pin:    0,
    gpio_func:   'Output',
    gpio_otype:  'Push-Pull',
    gpio_ospeed: 'H',
    gpio_pupdr:  'PU',
  },
  options_listeners: apply_gpio_init_options_listeners,
  options_html: init_gpio_node_options_html,
},
{
  base_name: 'GPIO_Output',
  menu_name: 'Write Output Pin',
  node_color: 'blue',
  default_options: {
    gpio_bank: 'GPIOA',
    gpio_pin:  0,
    gpio_val:  0,
    gpio_var_name: '(None)',
  },
  options_listeners: apply_gpio_output_options_listeners,
  options_html: set_gpio_out_node_options_html,
},
{
  base_name: 'GPIO_Input',
  menu_name: 'Read Input Pin',
  node_color: 'blue',
  default_options: {
    gpio_bank: 'GPIOA',
    gpio_pin:  0,
    gpio_var_name: '(None)',
  },
  options_listeners: apply_gpio_input_options_listeners,
  options_html: read_gpio_in_node_options_html,
},
{
  base_name: 'RCC_Enable',
  menu_name: 'Enable Peripheral Clock',
  node_color: 'green',
  default_options: {
    periph_clock: 'GPIOA',
  },
  options_listeners: apply_rcc_enable_node_options_listeners,
  options_html: rcc_enable_node_options_html,
},
{
  base_name: 'RCC_Disable',
  menu_name: 'Disable Peripheral Clock',
  node_color: 'pink',
  default_options: {
    periph_clock: 'GPIOA',
  },
  options_listeners: apply_rcc_disable_node_options_listeners,
  options_html: rcc_disable_node_options_html,
},
{
  base_name: 'New_Variable',
  menu_name: 'Define Variable',
  node_color: 'green',
  default_options: {
    var_name: '',
    var_display_name: '',
    var_type: 'int',
    var_val: 0,
  },
  options_listeners: apply_new_var_node_options_listeners,
  options_html: define_var_node_options_html,
},
{
  base_name: 'Set_Variable',
  menu_name: 'Set Variable',
  node_color: 'blue',
  default_options: {
    var_name: '(None)',
  },
  options_listeners: apply_set_var_node_options_listeners,
  options_html: set_var_node_options_html,
},
{
  base_name: 'Set_Var_Logic_Not',
  menu_name: 'Logical Not',
  node_color: 'blue',
  default_options: {
    var_a_name: '(None)',
    var_b_name: '(None)',
  },
  options_listeners: apply_set_var_logic_not_node_options_listeners,
  options_html: set_var_logic_not_node_options_html,
},
{
  base_name: 'Set_Var_Addition',
  menu_name: 'Add or Subtract',
  node_color: 'blue',
  default_options: {
    var_a_name: '(None)',
    var_b_name: '(None)',
    add_val_type: 'val',
    add_val_val: '0',
  },
  options_listeners: apply_set_var_addition_node_options_listeners,
  options_html: set_var_addition_node_options_html,
},
{
  base_name: 'Nop_Node',
  menu_name: 'No-op (Do Nothing)',
  node_color: 'blue',
  default_options: {
  },
  options_listeners: apply_nop_node_options_listeners,
  options_html: nop_node_options_html,
},
{
  base_name: 'I2C_Init',
  menu_name: 'Initialize I2C',
  node_color: 'green',
  default_options: {
    i2c_periph_num: '1',
    scl_pin: 'A9',
    sda_pin: 'A10',
    gpio_af: 'AF_4',
    i2c_periph_speed: '100KHz',
    // TODO: More I2C options.
  },
  options_listeners: apply_i2c_init_node_options_listeners,
  options_html: i2c_init_node_options_html,
},
{
  base_name: 'I2C_Deinit',
  menu_name: 'Deinitialize I2C',
  node_color: 'pink',
  default_options: {
    i2c_periph_num: '1',
  },
  options_listeners: apply_i2c_deinit_node_options_listeners,
  options_html: i2c_deinit_node_options_html,
},
{
  base_name: 'ADC_Init',
  menu_name: 'Initialize ADC',
  node_color: 'green',
  default_options: {
    adc_channel: '1',
    // TODO: More ADC options. (Resolution, etc)
  },
  options_listeners: apply_adc_init_node_options_listeners,
  options_html: adc_init_node_options_html,
},
{
  base_name: 'ADC_Read',
  menu_name: 'Read ADC Pin',
  node_color: 'blue',
  default_options: {
    adc_channel: '1',
    gpio_bank: 'GPIOA',
    gpio_pin: '0',
    adc_var: '(None)',
  },
  options_listeners: apply_adc_read_node_options_listeners,
  options_html: adc_read_node_options_html,
},
{
  base_name: 'RTC_Init',
  menu_name: 'Initialize RTC',
  node_color: 'green',
  default_options: {
    clock_source: 'LSI',
  },
  options_listeners: function(){},
  options_html: '',
},
{
  base_name: 'RTC_Read_Time',
  menu_name: 'Read RTC Time',
  node_color: 'blue',
  default_options: {
    seconds_read_var: '(None)',
    minutes_read_var: '(None)',
    hours_read_var: '(None)',
  },
  options_listeners: function(){},
  options_html: '',
},
{
  base_name: 'RTC_Read_Date',
  menu_name: 'Read RTC Date',
  node_color: 'blue',
  default_options: {
    days_read_var: '(None)',
    day_of_week_read_var: '(None)',
    month_read_var: '(None)',
    year_read_var: '(None)',
  },
  options_listeners: function(){},
  options_html: '',
},
{
  base_name: 'RTC_Set_Time',
  menu_name: 'Set RTC Time',
  node_color: 'blue',
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
  options_listeners: function(){},
  options_html: '',
},
{
  base_name: 'RTC_Set_Date',
  menu_name: 'Set RTC Date',
  node_color: 'blue',
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
  options_listeners: function(){},
  options_html: '',
},
{
  base_name: 'SSD1306_Init',
  menu_name: 'Initialize Screen',
  node_color: 'green',
  default_options: {
    i2c_periph_num: '1',
  },
  options_listeners: apply_ssd1306_init_node_options_listeners,
  options_html: ssd1306_init_node_options_html,
},
{
  base_name: 'SSD1306_Draw_Px',
  menu_name: 'Draw Pixel',
  node_color: 'blue',
  default_options: {
    i2c_periph_num: '1',
    px_x: '0',
    px_y: '0',
    px_color: 'On',
  },
  options_listeners: apply_ssd1306_draw_pixel_node_options_listeners,
  options_html: ssd1306_draw_pixel_node_options_html,
},
{
  base_name: 'SSD1306_Draw_HL',
  menu_name: 'Draw Horizontal Line',
  node_color: 'blue',
  default_options: {
    i2c_periph_num: '1',
    line_x: '0',
    line_y: '0',
    line_length: '0',
    line_color: 'On',
  },
  options_listeners: apply_ssd1306_draw_horiz_line_node_options_listeners,
  options_html: ssd1306_draw_horiz_line_options_html,
},
{
  base_name: 'SSD1306_Draw_VL',
  menu_name: 'Draw Vertical Line',
  node_color: 'blue',
  default_options: {
    i2c_periph_num: '1',
    line_x: '0',
    line_y: '0',
    line_length: '0',
    line_color: 'On',
  },
  options_listeners: apply_ssd1306_draw_vert_line_node_options_listeners,
  options_html: ssd1306_draw_vert_line_options_html,
},
{
  base_name: 'SSD1306_Draw_Rect',
  menu_name: 'Draw Rectangle',
  node_color: 'blue',
  default_options: {
    i2c_periph_num: '1',
    rect_x: '0',
    rect_y: '0',
    rect_w: '1',
    rect_h: '1',
    rect_color: 'On',
    rect_style: 'Fill',
    outline: '1',
  },
  options_listeners: apply_ssd1306_draw_rect_node_options_listeners,
  options_html: ssd1306_draw_rect_node_options_html,
},
{
  base_name: 'SSD1306_Draw_Text',
  menu_name: 'Draw Text',
  node_color: 'blue',
  default_options: {
    i2c_periph_num: '1',
    text_x: '0',
    text_y: '0',
    text_type: 'val',
    text_var: '(None)',
    text_line: '',
    text_size: 'S',
    text_color: 'On',
  },
  options_listeners: apply_ssd1306_draw_text_node_options_listeners,
  options_html: ssd1306_draw_text_options_html,
},
{
  base_name: 'SSD1306_Refresh',
  menu_name: 'Refresh Display',
  node_color: 'blue',
  default_options: {
    i2c_periph_num: '1',
  },
  options_listeners: apply_ssd1306_refresh_node_options_listeners,
  options_html: ssd1306_refresh_options_html,
},
{
  base_name: 'Check_Truthy',
  menu_name: 'Is Variable Truth-y?',
  node_color: 'canary',
  default_options: {
    var_name: '(None)',
  },
  options_listeners: apply_check_truthy_options_listeners,
  options_html: check_truthy_node_options_html,
},
{
  base_name: 'Check_Equals',
  menu_name: 'Are Variables Equal?',
  node_color: 'canary',
  default_options: {
    var_a_name: '(None)',
    var_b_name: '(None)',
  },
  options_listeners: apply_check_equals_options_listeners,
  options_html: check_equals_node_options_html,
},
/* 9
{
  base_name: 'Delay',
  menu_name: 'Delay',
  node_color: 'blue',
  default_options: {
  },
  options_listeners: null,
  options_html: null,
},
*/
];

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
