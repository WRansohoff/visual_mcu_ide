// This probably isn't the best way of doing things, but for now,
// I'm just going to dump the HTML for various tools' "Options"
// panel into this file.
// Should I just be using .etlua templates for this?
// It sort of feels that way, but this is all dynamically-rendered...

/*
 * Common 'connection selection' options. (input/output arrow[s])
 */
var node_io_options_html = `
<table class="node_io_options_table" cellpadding="0" cellspacing="0" border="0">
  <tr class="node_io_options_top_row">
    <td class="node_io_options_top_left">
    </td>
    <td class="node_io_options_top_mid">
      <select id="node_io_options_top_sel" class="node_io_options_select">
        <option value="None" selected="true" id="node_io_options_top_mid_none" class="node_io_options_opt">
          None
        </option>
        <option value="Input" id="node_io_options_top_mid_input" class="node_io_options_opt">
          Input
        </option>
        <option value="Output" id="node_io_options_top_mid_output" class="node_io_options_opt">
          Output
        </option>
      </select>
    </td>
    <td class="node_io_options_top_right">
    </td>
  </tr>
  <tr class="node_io_options_mid_row">
    <td class="node_io_options_mid_left">
      <select id="node_io_options_left_sel" class="node_io_options_select">
        <option value="None" selected="true" id="node_io_options_mid_left_none" class="node_io_options_opt">
          None
        </option>
        <option value="Input" id="node_io_options_mid_left_input" class="node_io_options_opt">
          Input
        </option>
        <option value="Output" id="node_io_options_mid_left_output" class="node_io_options_opt">
          Output
        </option>
      </select>
    </td>
    <td class="node_io_options_mid_mid">
    </td>
    <td class="node_io_options_mid_right">
      <select id="node_io_options_right_sel" class="node_io_options_select">
        <option value="None" selected="true" id="node_io_options_mid_right_none" class="node_io_options_opt">
          None
        </option>
        <option value="Input" id="node_io_options_mid_right_input" class="node_io_options_opt">
          Input
        </option>
        <option value="Output" id="node_io_options_mid_right_output" class="node_io_options_opt">
          Output
        </option>
      </select>
    </td>
  </tr>
  <tr class="node_io_options_bot_row">
    <td class="node_io_options_bot_left">
    </td>
    <td class="node_io_options_bot_mid">
      <select id="node_io_options_bot_sel" class="node_io_options_select">
        <option value="None" selected="true" id="node_io_options_bot_mid_none" class="node_io_options_opt">
          None
        </option>
        <option value="Input" id="node_io_options_bot_mid_input" class="node_io_options_opt">
          Input
        </option>
        <option value="Output" id="node_io_options_bot_mid_output" class="node_io_options_opt">
          Output
        </option>
      </select>
    </td>
    <td class="node_io_options_bot_right">
    </td>
  </tr>
</table>
`;

/*
 * Common options values used by multiple nodes.
 */
var select_gpio_bank_table_row = function(tag_prefix) {
  return `
  <tr class="` + tag_prefix + `_pin_bank_row">
    <td class="` + tag_prefix + `_pin_bank_text">
      GPIO Pin Bank
    </td>
    <td class="` + tag_prefix + `_pin_bank_opt">
      <select id="` + tag_prefix + `_pin_bank_tag" class="` + tag_prefix + `_pin_bank_select">
        <option selected="true" value="GPIOA" class="` + tag_prefix + `_pin_bank_option">
          GPIOA
        </option>
        <option value="GPIOB" class="` + tag_prefix + `_pin_bank_option">
          GPIOB
        </option>
        <option value="GPIOC" class="` + tag_prefix + `_pin_bank_option">
          GPIOC
        </option>
        <option value="GPIOD" class="` + tag_prefix + `_pin_bank_option">
          GPIOD
        </option>
        <option value="GPIOE" class="` + tag_prefix + `_pin_bank_option">
          GPIOE
        </option>
        <option value="GPIOF" class="` + tag_prefix + `_pin_bank_option">
          GPIOF
        </option>
        <option value="GPIOG" class="` + tag_prefix + `_pin_bank_option">
          GPIOG
        </option>
      </select>
    </td>
  </tr>
  `;
};

var select_gpio_pin_table_row = function(tag_prefix) {
  return `
  <tr class="` + tag_prefix + `_pin_number_row">
    <td class="` + tag_prefix + `_pin_number_text">
      GPIO Pin Number
    </td>
    <td class="` + tag_prefix + `_pin_number_opt">
      <select id="` + tag_prefix + `_pin_number_tag" class="` + tag_prefix + `_pin_number_select">
        <option selected="true" value="0" class="` + tag_prefix + `_pin_number_option">0</option>
        <option value="1" class="` + tag_prefix + `_pin_number_option">1</option>
        <option value="2" class="` + tag_prefix + `_pin_number_option">2</option>
        <option value="3" class="` + tag_prefix + `_pin_number_option">3</option>
        <option value="4" class="` + tag_prefix + `_pin_number_option">4</option>
        <option value="5" class="` + tag_prefix + `_pin_number_option">5</option>
        <option value="6" class="` + tag_prefix + `_pin_number_option">6</option>
        <option value="7" class="` + tag_prefix + `_pin_number_option">7</option>
        <option value="8" class="` + tag_prefix + `_pin_number_option">8</option>
        <option value="9" class="` + tag_prefix + `_pin_number_option">9</option>
        <option value="10" class="` + tag_prefix + `_pin_number_option">10</option>
        <option value="11" class="` + tag_prefix + `_pin_number_option">11</option>
        <option value="12" class="` + tag_prefix + `_pin_number_option">12</option>
        <option value="13" class="` + tag_prefix + `_pin_number_option">13</option>
        <option value="14" class="` + tag_prefix + `_pin_number_option">14</option>
        <option value="15" class="` + tag_prefix + `_pin_number_option">15</option>
      </select>
    </td>
  </tr>
  `;
};

/*
 * List RCC 'peripheral clocks'.
 */
var rcc_clock_list_table_row = function(tag_prefix) {
  return `
  <tr class="` + tag_prefix + `_periph_clocks_row">
    <td class="` + tag_prefix + `_periph_clocks_text">
      Peripheral Clock:
    </td>
    <td class="` + tag_prefix + `_periph_clocks_opt">
      <select id="` + tag_prefix + `_periph_clocks_tag" class="` + tag_prefix + `_periph_clocks_select">
        <option selected="true" value="TODO" class="` + tag_prefix + `_periph_clocks_option">(None Available)</option>
      </select>
    </td>
  </tr>
  `;
};

var defined_variables_list_table_row = function(tag_prefix) {
  return `
  <tr class="` + tag_prefix + `_var_list_row">
    <td class="` + tag_prefix + `_var_list_text">
      Variable:
    </td>
    <td class="` + tag_prefix + `_var_list_opt">
      <select id="` + tag_prefix + `_var_list_tag" class="` + tag_prefix + `_var_list_select">
        <option selected="true" value="(None)" id="` + tag_prefix + `_var_list_n/a" class="` + tag_prefix + `_var_list_option">
          (None defined)
        </option>
      </select>
    </td>
  </tr>
  `;
};

/*
 * Node-specific options.
 */
// 'Boot' node options.
var boot_node_options_html = `
<table class="boot_options_table" cellpadding="0" cellspacing="0" border="0">
  <tr class="boot_options_mcu_chip_row">
    <td class="boot_options_mcu_chip_text">
      Microcontroller chip type:
    </td>
    <td class="boot_options_mcu_chip_opt">
      <select id="boot_options_mcu_chip_tag" class="boot_options_mcu_chip_select">
        <option value="STM32F030F4" selected="true" class="boot_options_mcu_chip_option">
          STM32F030F4
        </option>
        <option value="STM32F031F6" class="boot_options_mcu_chip_option">
          STM32F031F6
        </option>
      </select>
    </td>
  </tr>
</table>
`;

// 'Delay' node options.
var delay_node_options_html = `
<table class="delay_options_table" cellpadding="0" cellspacing="0" border="0">
  <tr class="delay_options_unit_row">
    <td class="delay_options_unit_text">
      Delay units:
    </td>
    <td class="delay_options_unit_opt">
      <select id="delay_options_unit_tag" class="delay_options_unit_select">
        <option selected="true" value="Cycles" class="delay_options_unit_option">
          Cycles
        </option>
        <option value="Microseconds" class="delay_options_unit_option">
          Microseconds
        </option>
        <option value="Milliseconds" class="delay_options_unit_option">
          Milliseconds
        </option>
        <option value="Seconds" class="delay_options_unit_option">
          Seconds
        </option>
      </select>
    </td>
  </tr>
  <tr class="delay_options_value_row">
    <td class="delay_options_value_text">
      Units to delay:
    </td>
    <td class="delay_options_value_opt">
      <input id="delay_options_value_tag" class="delay_options_value_input" type="number" value="0">
    </td>
  </tr>
</table>
`;

// 'Setup GPIO Pin' node options.
var init_gpio_node_options_html = `
<table class="init_gpio_options_table" cellpadding="0" cellspacing="0" border="0">
  ` + select_gpio_bank_table_row('init_gpio_options')
    + select_gpio_pin_table_row('init_gpio_options') + `
  <tr class="init_gpio_options_pin_func_row">
    <td class="init_gpio_options_pin_func_text">
      Pin function:
    </td>
    <td class="init_gpio_options_pin_func_opt">
      <select id="init_gpio_options_pin_func_tag" class="init_gpio_options_pin_func_select">
        <option selected="true" value="Output" class="init_gpio_options_pin_func_option">
          Output
        </option>
        <option value="Input" class="init_gpio_options_pin_func_option">
          Input
        </option>
        <option value="Analog" class="init_gpio_options_pin_func_option">
          Analog
        </option>
        <option value="AF" class="init_gpio_options_pin_func_option">
          Alternate Function
        </option>
      </select>
    </td>
  </tr>
  <tr class="init_gpio_options_otype_row">
    <td class="init_gpio_options_otype_text">
      Output Type:
    </td>
    <td class="init_gpio_options_otype_opt">
      <select id="init_gpio_options_otype_tag" class="init_gpio_options_otype_select">
        <option selected="true" value="Push-Pull" class="init_gpio_options_otype_option">
          Push-Pull
        </option>
        <option value="Open-Drain" class="init_gpio_options_otype_option">
          Open-Drain
        </option>
      </select>
    </td>
  </tr>
  <tr class="init_gpio_options_ospeed_row">
    <td class="init_gpio_options_ospeed_text">
      Output Speed:
    </td>
    <td class="init_gpio_options_ospeed_opt">
      <select id="init_gpio_options_ospeed_tag" class="init_gpio_options_ospeed_select">
        <option selected="true" value="H" class="init_gpio_options_ospeed_option">
          High (50MHz)
        </option>
        <option value="M" class="init_gpio_options_ospeed_option">
          Medium (10MHz)
        </option>
        <option value="L" class="init_gpio_options_ospeed_option">
          Low (2MHz)
        </option>
      </select>
    </td>
  </tr>
  <tr class="init_gpio_options_pupdr_row">
    <td class="init_gpio_options_pupdr_text">
      Pull-up / Pull-down:
    </td>
    <td class="init_gpio_options_pupdr_opt">
      <select id="init_gpio_options_pupdr_tag" class="init_gpio_options_pupdr_select">
        <option selected="true" value="PU" class="init_gpio_options_pupdr_option">
          Enable Pull-up
        </option>
        <option value="PD" class="init_gpio_options_pupdr_option">
          Enable Pull-down
        </option>
        <option value="None" class="init_gpio_options_pupdr_option">
          No Pull-up/down
        </option>
      </select>
    </td>
  </tr>
</table>
`;

// 'Disable GPIO Pin' node options.
var deinit_gpio_node_options_html = `
<table class="deinit_gpio_options_table" cellpadding="0" cellspacing="0" border="0">
  ` + select_gpio_bank_table_row('deinit_gpio_options')
    + select_gpio_pin_table_row('deinit_gpio_options') + `
</table>
`;

// 'Set GPIO Output' node options.
var set_gpio_out_node_options_html = `
<table class="set_gpio_out_options_table" cellpadding="0" cellspacing="0" border="0">
  ` + select_gpio_bank_table_row('set_gpio_out_options')
    + select_gpio_pin_table_row('set_gpio_out_options') + `
  <tr class="set_gpio_out_options_value_row">
    <td class="set_gpio_out_options_value_text">
      Output value:
    </td>
    <td class="set_gpio_out_options_value_opt">
      <select id="set_gpio_out_options_value_tag" class="set_gpio_out_options_value_select">
        <option selected="true" value="On" class="set_gpio_out_options_value_option">
          On
        </option>
        <option value="Off" class="set_gpio_out_options_value_option">
          Off
        </option>
      </select>
    </td>
  </tr>
</table>
`;

// 'Enable peripheral clock' node options.
var rcc_enable_node_options_html = `
<table class="rcc_enable_options_table" cellpadding="0" cellspacing="0" border="0">
  ` + rcc_clock_list_table_row('rcc_enable_options') + `
</table>
`;

// 'Disable peripheral clock' node options.
var rcc_disable_node_options_html = `
<table class="rcc_disable_options_table" cellpadding="0" cellspacing="0" border="0">
  ` + rcc_clock_list_table_row('rcc_disable_options') + `
</table>
`;

// 'Define variable' node options.
var define_var_node_options_html = `
<table class="define_var_options_table" cellpadding="0" cellspacing="0" border="0">
  <tr class="define_var_options_var_name_row">
    <td class="define_var_options_var_name_text">
      Variable name:
    </td>
    <td class="define_var_options_var_name_opt">
      <input type="text" id="define_var_options_var_name_tag" class="define_var_options_var_name_input">
    </td>
  </tr>
  <tr class="define_var_options_var_type_row">
    <td class="define_var_options_var_type_text">
      Variable type:
    </td>
    <td class="define_var_options_var_type_opt">
      <select id="define_var_options_var_type_tag" class="define_var_options_var_type_select">
        <option selected="true" value="int" class="define_var_options_var_type_option">
          Integer
        </option>
        <option value="float" class="define_var_options_var_type_option">
          Floating-point
        </option>
        <option value="bool" class="define_var_options_var_type_option">
          Boolean
        </option>
        <option value="char" class="define_var_options_var_type_option">
          Letter
        </option>
      </select>
    </td>
  </tr>
  <tr class="define_var_options_var_val_row">
    <td class="define_var_options_var_val_text">
      Starting value:
    </td>
    <td id="define_var_options_var_val_cell" class="define_var_options_var_val_opt">
    </td>
  </tr>
</table>
`;

// 'Set variable' node options.
var set_var_node_options_html = `
<table class="set_var_options_table" cellpadding="0" cellspacing="0" border="0">
  ` + defined_variables_list_table_row('set_var_options') + `
  <tr class="set_var_options_var_new_value_row">
    <td class="set_var_options_var_new_value_text">
      New value:
    </td>
    <td id="set_var_options_var_new_value_cell" class="set_var_options_var_new_value_opt">
    </td>
  </tr>
</table>
`;

// 'Modify Variable: Logic Not' node options.
var set_var_logic_not_node_options_html = `
<table class="set_var_logic_not_options_table" cellpadding="0" cellspacing="0" border="0">
  ` + defined_variables_list_table_row('set_var_logic_not_options_A') + `
  ` + defined_variables_list_table_row('set_var_options_B') + `
</table>
`;
