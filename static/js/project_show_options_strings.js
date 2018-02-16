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

// Special version for 'if-else' branching nodes. They have
// two potential outputs connections.
var branching_node_io_options_html = `
<table class="branching_node_io_options_table" cellpadding="0" cellspacing="0" border="0">
  <tr class="branching_node_io_options_top_row">
    <td class="branching_node_io_options_top_left">
    </td>
    <td class="branching_node_io_options_top_mid">
      <select id="node_io_options_top_sel" class="branching_node_io_options_select">
        <option value="None" selected="true" id="branching_node_io_options_top_mid_none" class="branching_node_io_options_opt">
          None
        </option>
        <option value="Input" id="node_io_options_top_mid_input" class="branching_node_io_options_opt">
          Input
        </option>
        <option value="Output_True" id="node_io_options_top_mid_output_true" class="branching_node_io_options_opt">
          Output (If-true)
        </option>
        <option value="Output_False" id="node_io_options_top_mid_output_false" class="branching_node_io_options_opt">
          Output (Else-false)
        </option>
      </select>
    </td>
    <td class="branching_node_io_options_top_right">
    </td>
  </tr>
  <tr class="branching_node_io_options_mid_row">
    <td class="branching_node_io_options_mid_left">
      <select id="node_io_options_left_sel" class="branching_node_io_options_select">
        <option value="None" selected="true" id="node_io_options_mid_left_none" class="branching_node_io_options_opt">
          None
        </option>
        <option value="Input" id="node_io_options_mid_left_input" class="branching_node_io_options_opt">
          Input
        </option>
        <option value="Output_True" id="node_io_options_mid_left_output_true" class="branching_node_io_options_opt">
          Output (If-true)
        </option>
        <option value="Output_False" id="node_io_options_mid_left_output_false" class="branching_node_io_options_opt">
          Output (Else-false)
        </option>
      </select>
    </td>
    <td class="branching_node_io_options_mid_mid">
    </td>
    <td class="branching_node_io_options_mid_right">
      <select id="node_io_options_right_sel" class="branching_node_io_options_select">
        <option value="None" selected="true" id="node_io_options_mid_right_none" class="branching_node_io_options_opt">
          None
        </option>
        <option value="Input" id="node_io_options_mid_right_input" class="branching_node_io_options_opt">
          Input
        </option>
        <option value="Output_True" id="node_io_options_mid_right_output_true" class="branching_node_io_options_opt">
          Output (If-true)
        </option>
        <option value="Output_False" id="node_io_options_mid_right_output_false" class="branching_node_io_options_opt">
          Output (Else-false)
        </option>
      </select>
    </td>
  </tr>
  <tr class="branching_node_io_options_bot_row">
    <td class="branching_node_io_options_bot_left">
    </td>
    <td class="branching_node_io_options_bot_mid">
      <select id="node_io_options_bot_sel" class="branching_node_io_options_select">
        <option value="None" selected="true" id="node_io_options_bot_mid_none" class="branching_node_io_options_opt">
          None
        </option>
        <option value="Input" id="node_io_options_bot_mid_input" class="branching_node_io_options_opt">
          Input
        </option>
        <option value="Output_True" id="node_io_options_bot_mid_output_true" class="branching_node_io_options_opt">
          Output (If-true)
        </option>
        <option value="Output_False" id="node_io_options_bot_mid_output_false" class="branching_node_io_options_opt">
          Output (Else-false)
        </option>
      </select>
    </td>
    <td class="branching_node_io_options_bot_right">
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

var defined_variables_list_table_row = function(tag_prefix, label_text) {
  return `
  <tr id="` + tag_prefix + `_var_list_row_tag" class="` + tag_prefix + `_var_list_row">
    <td class="` + tag_prefix + `_var_list_text">
      ` + label_text + `
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

var defined_labels_list_table_row = function(tag_prefix) {
  return `
  <tr class="` + tag_prefix + `_label_list_row">
    <td class="` + tag_prefix + `_label_list_text">
      Label name:
    </td>
    <td class="` + tag_prefix + `_label_list_opt">
      <select id="` + tag_prefix + `_label_list_tag" class="` + tag_prefix + `_label_list_select">
        <option selected="true" value="(None)" id="` + tag_prefix + `_label_list_n/a" class="` + tag_prefix + `_label_list_option">
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

// 'Label' node options.
var label_node_options_html = `
<table class="define_label_options_table" cellpadding="0" cellspacing="0" border="0">
  <tr class="define_label_options_label_name_row">
    <td class="define_label_options_label_name_text">
      Label name:
    </td>
    <td class="define_label_options_label_name_opt">
      <input type="text" id="define_label_options_label_name_tag" class="define_label_options_label_name_input">
    </td>
  </tr>
</table>
`;

// 'Jump' node options.
var jump_node_options_html = `
  ` + defined_labels_list_table_row('jump_options') + `
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
        <option value="Var" class="set_gpio_out_options_value_option">
          Variable
        </option>
      </select>
    </td>
  </tr>
  ` + defined_variables_list_table_row('set_gpio_out_options', 'Variable:') + `
</table>
`;

// 'Read GPIO_Input' node options.
var read_gpio_in_node_options_html = `
<table class="read_gpio_in_options_table" cellpadding="0" cellspacing="0" border="0">
  ` + select_gpio_bank_table_row('read_gpio_in_options')
    + select_gpio_pin_table_row('read_gpio_in_options')
    + defined_variables_list_table_row('read_gpio_in_options', 'Store in Variable:') + `
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
  ` + defined_variables_list_table_row('set_var_options', 'Variable:') + `
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
  ` + defined_variables_list_table_row('set_var_logic_not_options_A', 'Variable A:') + `
  ` + defined_variables_list_table_row('set_var_logic_not_options_B', 'Variable B:') + `
</table>
`;

// 'Modify Variable: Addition or Subtraction' node options.
// TODO: The 'C' in 'A = B + C'
var set_var_addition_node_options_html = `
<table class="set_var_addition_options_table" cellpadding="0" cellspacing="0" border="0">
  ` + defined_variables_list_table_row('set_var_addition_options_A', 'Variable A:') + `
  ` + defined_variables_list_table_row('set_var_addition_options_B', 'Variable B:') + `
  <tr class="set_var_addition_options_C_type_row">
    <td class="set_var_addition_options_C_type_text">
      'C' Variable Type:
    </td>
    <td id="set_var_addition_options_C_type_cell" class="set_var_addition_options_C_type_opt">
      <select id="set_var_addition_options_C_type_tag" class="set_var_addition_options_C_type_opt">
        <option selected="true" value="val">Constant Value</option>
        <option value="var">Defined Variable</option>
      </select>
    </td>
  </tr>
  <tr class="set_var_addition_options_C_val_row">
    <td class="set_var_addition_options_C_val_text">
      'C' Variable Value:
    </td>
    <td id="set_var_addition_options_C_val_cell" class="set_var_addition_options_C_val_opt">
    </td>
  </tr>
</table>
`;

// 'No-op' node options.
// Currently there are none, besides the input/output connections table.
var nop_node_options_html = `
`;

// 'Is Variable Truth-y?' branching node options.
var check_truthy_node_options_html = `
<table class="check_truthy_options_table" cellpadding="0" cellspacing="0" border="0">
  ` + defined_variables_list_table_row('check_truthy_options', 'Variable to check:') + `
</table>
`;

// 'Are variables Equal?' branching node options.
var check_equals_node_options_html = `
<table class="check_equals_options_table" cellpadding="0" cellspacing="0" border="0">
  ` + defined_variables_list_table_row('check_equals_options_A', 'Variable A:') + `
  ` + defined_variables_list_table_row('check_equals_options_B', 'Variable B:') + `
</table>
`;

/*
 * Node listener functions.
 */
var apply_boot_node_options_listeners = function(cur_node) {
  var chip_sel_tag = document.getElementById("boot_options_mcu_chip_tag");
  if (cur_node.options && cur_node.options.chip_type == 'STM32F030F4') {
    chip_sel_tag.value = 'STM32F030F4';
    cur_node.options.chip_type = 'STM32F030F4';
  }
  else if (cur_node.options && cur_node.options.chip_type == 'STM32F031F6') {
    chip_sel_tag.value = 'STM32F031F6';
    cur_node.options.chip_type = 'STM32F031F6';
  }
  else {
    // Set a default value.
    chip_sel_tag.value = 'STM32F030F4';
    cur_node.options.chip_type = 'STM32F030F4';
  }
  // 'MCU Chip Type' selection listener.
  chip_sel_tag.onchange = function() {
    mcu_chip = chip_sel_tag.value;
    cur_node.options.chip_type = chip_sel_tag.value;
  };
};

var apply_delay_node_options_listeners = function(cur_node) {
  var delay_units_tag = document.getElementById('delay_options_unit_tag');
  var delay_value_tag = document.getElementById('delay_options_value_tag');
  if (cur_node.options) {
    // Set values according to previously-selected options.
    if (cur_node.options.delay_units && cur_node.options.delay_units != '') {
      if (cur_node.options.delay_units == 'cycles') {
        delay_units_tag.value = 'Cycles';
      }
      else if (cur_node.options.delay_units == 'us') {
        delay_units_tag.value = 'Microseconds';
      }
      else if (cur_node.options.delay_units == 'ms') {
        delay_units_tag.value = 'Milliseconds';
      }
      else if (cur_node.options.delay_units == 's') {
        delay_units_tag.value = 'Seconds';
      }
    }
    if (cur_node.options.delay_value) {
      delay_value_tag.value = parseInt(cur_node.options.delay_value);
    }
  }
  // Listeners to set option values.
  delay_units_tag.onchange = function() {
    var new_delay_type = delay_units_tag.value;
    if (new_delay_type == 'Cycles') {
      cur_node.options.delay_units = 'cycles';
    }
    else if (new_delay_type == 'Microseconds') {
      cur_node.options.delay_units = 'us';
    }
    else if (new_delay_type == 'Milliseconds') {
      cur_node.options.delay_units = 'ms';
    }
    else if (new_delay_type == 'Seconds') {
      cur_node.options.delay_units = 's';
    }
  };
  delay_value_tag.onchange = function() {
    var new_delay_value = parseInt(delay_value_tag.value);
    if (new_delay_value >= 0) {
      cur_node.options.delay_value = new_delay_value;
    }
  };
};

// Apply option input listeners for a 'Label' node.
var apply_label_node_options_listeners = function(cur_node) {
  var label_name_tag = document.getElementById('define_label_options_label_name_tag');

  // Set to current node options.
  if (cur_node.options.label_name) {
    label_name_tag.value = cur_node.options.label_name;
  }

  // Set listener functions.
  label_name_tag.oninput = function() {
    cur_node.options.label_display_name = label_name_tag.value;
    cur_node.options.label_name = update_label_names(cur_node.options.label_name, cur_node.options.label_display_name);
  };
};

// Apply option input listeners for a 'Jump' node.
var apply_jump_node_options_listeners = function(cur_node) {
  var label_name_tag = document.getElementById('jump_options_label_list_tag');
  // Populate the dropdown select menu with currently-defined label names.
  var sel_html_opts = '';
  for (var index in fsm_nodes) {
    var p_node = fsm_nodes[index];
    if (p_node && p_node.options && p_node.node_type == 'Label') {
      var sel_text = '';
      var any_selected = false;
      if (p_node.options.label_name && p_node.options.label_name != '') {
        if (cur_node.options && cur_node.options.label_name == p_node.options.label_name) {
          sel_text = 'selected="true"';
          any_selected = true;
        }
        sel_html_opts += `
          <option ` + sel_text + ` value="` + p_node.options.label_name + `" id="jump_options_label_list_` + p_node.options.label_name + `" class="jump_options_label_list_option">
            ` + p_node.options.label_name + `
          </option>
        `;
      }
    }
  }
  if (any_selected) { sel_text = ''; }
  else { sel_text = 'selected="true"'; }
  sel_html_opts = `
    <option value="(None)" ` + sel_text + ` id="jump_options_label_list_n/a" class="jump_options_label_list_option">
      (None defined)
    </option>
  ` + sel_html_opts;
  label_name_tag.innerHTML = sel_html_opts;

  label_name_tag.onchange = function() {
    cur_node.options.label_name = label_name_tag.value;
  };
};

// 'Enable RCC Peripheral Clock' node options.
var apply_rcc_enable_node_options_listeners = function (cur_node) {
  // Here, we need to set the options based on what is available in the
  // target MCU chip. From an RCC perspective, the 'F03xFx' chips look identical.
  var rcc_en_dropdown_tag = document.getElementById('rcc_enable_options_periph_clocks_tag');
  var periph_clocks = {};
  if (mcu_chip == 'STM32F030F4' || mcu_chip == 'STM32F031F6') {
    periph_clocks = rcc_opts.STM32F03xFx;
    var select_tag_html = '';
    for (var periph_val in periph_clocks) {
      select_tag_html += `
        <option value="` + periph_val + `" class="rcc_enable_options_periph_clocks_option">` + periph_clocks[periph_val] + `</option>
      `;
    }
    rcc_en_dropdown_tag.innerHTML = select_tag_html;
  }

  // Set selected value based on options, if applicable.
  if (cur_node.options.periph_clock && cur_node.options.periph_clock != '') {
    rcc_en_dropdown_tag.value = cur_node.options.periph_clock;
  }

  // Set click listener functions for each available clock.
  rcc_en_dropdown_tag.onchange = function() {
    cur_node.options.periph_clock = rcc_en_dropdown_tag.value;
  };
};

// 'Disable RCC Peripheral Clock' node options. Similar to 'Enable'
var apply_rcc_disable_node_options_listeners = function (cur_node) {
  // Here, we need to set the options based on what is available in the
  // target MCU chip. From an RCC perspective, the 'F03xFx' chips look identical.
  var rcc_dis_dropdown_tag = document.getElementById('rcc_disable_options_periph_clocks_tag');
  var periph_clocks = {};
  if (mcu_chip == 'STM32F030F4' || mcu_chip == 'STM32F031F6') {
    periph_clocks = rcc_opts.STM32F03xFx;
    var select_tag_html = '';
    for (var periph_val in periph_clocks) {
      select_tag_html += `
        <option value="` + periph_val + `" class="rcc_disable_options_periph_clocks_option">` + periph_clocks[periph_val] + `</option>
      `;
    }
    rcc_dis_dropdown_tag.innerHTML = select_tag_html;
  }

  // Set selected value based on options, if applicable.
  if (cur_node.options.periph_clock && cur_node.options.periph_clock != '') {
    rcc_dis_dropdown_tag.value = cur_node.options.periph_clock;
  }

  // Set click listener functions for each available clock.
  rcc_dis_dropdown_tag.onchange = function() {
    cur_node.options.periph_clock = rcc_dis_dropdown_tag.value;
  };
};

var apply_gpio_init_options_listeners = function(cur_node) {
  var gpio_bank_tag = document.getElementById('init_gpio_options_pin_bank_tag');
  var gpio_pin_tag = document.getElementById('init_gpio_options_pin_number_tag');
  var gpio_func_tag = document.getElementById('init_gpio_options_pin_func_tag');
  var gpio_otype_tag = document.getElementById('init_gpio_options_otype_tag');
  var gpio_ospeed_tag = document.getElementById('init_gpio_options_ospeed_tag');
  var gpio_pupdr_tag = document.getElementById('init_gpio_options_pupdr_tag');

  // Set values according to node options.
  if (cur_node.options.gpio_bank) {
    gpio_bank_tag.value = cur_node.options.gpio_bank;
  }
  if (cur_node.options.gpio_pin) {
    gpio_pin_tag.value = cur_node.options.gpio_pin;
  }
  if (cur_node.options.gpio_func) {
    gpio_func_tag.value = cur_node.options.gpio_func;
  }
  if (cur_node.options.gpio_otype) {
    gpio_otype_tag.value = cur_node.options.gpio_otype;
  }
  if (cur_node.options.gpio_ospeed) {
    gpio_ospeed_tag.value = cur_node.options.gpio_ospeed;
  }
  if (cur_node.options.gpio_pupdr) {
    gpio_pupdr_tag.value = cur_node.options.gpio_pupdr;
  }

  // Set click listener functions.
  gpio_bank_tag.onchange = function() {
    cur_node.options.gpio_bank = gpio_bank_tag.value;
  };
  gpio_pin_tag.onchange = function() {
    cur_node.options.gpio_pin = gpio_pin_tag.value;
  };
  gpio_func_tag.onchange = function() {
    cur_node.options.gpio_func = gpio_func_tag.value;
  };
  gpio_otype_tag.onchange = function() {
    cur_node.options.gpio_otype = gpio_otype_tag.value;
  };
  gpio_ospeed_tag.onchange = function() {
    cur_node.options.gpio_ospeed = gpio_ospeed_tag.value;
  };
  gpio_pupdr_tag.onchange = function() {
    cur_node.options.gpio_pupdr = gpio_pupdr_tag.value;
  };
};

// 'GPIO_Output' node listeners.
var apply_gpio_output_options_listeners = function(cur_node) {
  var gpio_bank_tag = document.getElementById('set_gpio_out_options_pin_bank_tag');
  var gpio_pin_tag = document.getElementById('set_gpio_out_options_pin_number_tag');
  var gpio_value_tag = document.getElementById('set_gpio_out_options_value_tag');
  var gpio_var_row_tag = document.getElementById('set_gpio_out_options_var_list_row_tag');
  gpio_var_row_tag.hidden = true;
  var gpio_var_name_tag = document.getElementById('set_gpio_out_options_var_list_tag');

  // Set values according to node options.
  if (cur_node.options.gpio_bank) {
    gpio_bank_tag.value = cur_node.options.gpio_bank;
  }
  if (cur_node.options.gpio_pin) {
    gpio_pin_tag.value = cur_node.options.gpio_pin;
  }
  if (cur_node.options.gpio_val == 1 || cur_node.options.gpio_val == '1') {
    gpio_value_tag.value = 'On';
  }
  else if (cur_node.options.gpio_val == 'variable') {
    gpio_value_tag.value = 'Var';
    gpio_var_row_tag.hidden = false;
    populate_defined_vars_dropdown('set_gpio_out_options_var_list_tag', cur_node, cur_node.options.gpio_var_name);
  }
  else {
    gpio_value_tag.value = 'Off';
  }

  // Set click listener functions.
  gpio_bank_tag.onchange = function() {
    cur_node.options.gpio_bank = gpio_bank_tag.value;
  };
  gpio_pin_tag.onchange = function() {
    cur_node.options.gpio_pin = gpio_pin_tag.value;
  };
  gpio_value_tag.onchange = function() {
    if (gpio_value_tag.value == 'On') {
      cur_node.options.gpio_val = 1;
      gpio_var_row_tag.hidden = true;
    }
    else if (gpio_value_tag.value == 'Var') {
      cur_node.options.gpio_val = 'variable';
      gpio_var_row_tag.hidden = false;
      populate_defined_vars_dropdown('set_gpio_out_options_var_list_tag', cur_node, cur_node.options.gpio_var_name);
      gpio_var_name_tag.onchange = function() {
        cur_node.options.gpio_var_name = gpio_var_name_tag.value;
      };
    }
    else {
      cur_node.options.gpio_val = 0;
      gpio_var_row_tag.hidden = true;
    }
  };
};

// 'GPIO_Input' node listeners.
// TODO
var apply_gpio_input_options_listeners = function(cur_node) {
  var gpio_bank_tag = document.getElementById('read_gpio_in_options_pin_bank_tag');
  var gpio_pin_tag = document.getElementById('read_gpio_in_options_pin_number_tag');
  var gpio_var_name_tag = document.getElementById('read_gpio_in_options_var_list_tag');

  // Set values according to node options.
  if (cur_node.options.gpio_bank) {
    gpio_bank_tag.value = cur_node.options.gpio_bank;
  }
  if (cur_node.options.gpio_pin) {
    gpio_pin_tag.value = cur_node.options.gpio_pin;
  }
  populate_defined_vars_dropdown('read_gpio_in_options_var_list_tag', cur_node, cur_node.options.gpio_var_name);

  // Set click listener functions.
  gpio_bank_tag.onchange = function() {
    cur_node.options.gpio_bank = gpio_bank_tag.value;
  };
  gpio_pin_tag.onchange = function() {
    cur_node.options.gpio_pin = gpio_pin_tag.value;
  };
  gpio_var_name_tag.onchange = function() {
    cur_node.options.gpio_var_name = gpio_var_name_tag.value;
  };
}

// 'Define New Variable' Global node.
var apply_new_var_node_options_listeners = function(cur_node) {
  var var_name_tag = document.getElementById('define_var_options_var_name_tag');
  var var_type_tag = document.getElementById('define_var_options_var_type_tag');
  var var_val_cell = document.getElementById('define_var_options_var_val_cell');

  // Set values according to node options.
  if (cur_node.options.var_name) {
    var_name_tag.value = cur_node.options.var_name;
  }
  if (cur_node.options.var_type) {
    var_type_tag.value = cur_node.options.var_type;
  }

  // Fill 'var value' cell based on current type.
  var var_val_tag = null;
  if (var_type_tag.value == 'int') {
    var_val_cell.innerHTML = `
      <input id="define_var_options_int_tag" class="define_var_options_int_input" type="number" value="` + cur_node.options.var_val + `">
    `;
    var_val_tag = document.getElementById('define_var_options_int_tag');
  }
  else if (var_type_tag.value == 'float') {
    var_val_cell.innerHTML = `
      <input id="define_var_options_float_tag" class="define_var_options_float_input" type="number" value="` + cur_node.options.var_val + `" step="0.000001">
    `;
    var_val_tag = document.getElementById('define_var_options_float_tag');
  }
  else if (var_type_tag.value == 'bool') {
    var is_true_opts = 'selected="true"';
    var is_false_opts = '';
    if (!cur_node.options.var_val || cur_node.options.var_val == 'false') {
      is_false_opts = 'selected="true"';
      is_true_opts = '';
    }
    var_val_cell.innerHTML = `
      <select id="define_var_options_bool_tag" class="define_var_options_bool_input">
        <option ` + is_true_opts + ` value="true">True</option>
        <option ` + is_false_opts + ` value="false">False</option>
      </select>
    `;
    var_val_tag = document.getElementById('define_var_options_bool_tag');
  }
  else if (var_type_tag.value == 'char') {
    var_val_cell.innerHTML = `
      <input id="define_var_options_char_tag" class="define_var_options_char_input" type="text" maxlength="1" value="` + cur_node.options.var_val + `">
    `;
    var_val_tag = document.getElementById('define_var_options_char_tag');
  }

  // Set 'var value' type according to node option.
  if (cur_node.options.var_val && var_val_tag) {
    var_val_tag.value = cur_node.options.var_val;
  }

  // Set listener functions.
  var_name_tag.oninput = function() {
    cur_node.options.var_display_name = var_name_tag.value;
    cur_node.options.var_name = update_var_names(cur_node.options.var_name, cur_node.options.var_display_name);
    refresh_defined_vars();
  };
  var_type_tag.onchange = function() {
    cur_node.options.var_type = var_type_tag.value;
    var var_val_tag = null;
    if (var_type_tag.value == 'int') {
      var_val_cell.innerHTML = `
        <input id="define_var_options_int_tag" class="define_var_options_int_input" type="number" value="0">
      `;
      var_val_tag = document.getElementById('define_var_options_int_tag');
      var_val_tag.value = 0;
    }
    else if (var_type_tag.value == 'float') {
      var_val_cell.innerHTML = `
        <input id="define_var_options_float_tag" class="define_var_options_float_input" type="number" value="0" step="0.000001">
      `;
      var_val_tag = document.getElementById('define_var_options_float_tag');
      var_val_tag.value = 0.0;
    }
    else if (var_type_tag.value == 'bool') {
      var_val_cell.innerHTML = `
        <select id="define_var_options_bool_tag" class="define_var_options_bool_input">
          <option selected="true" value="true">True</option>
          <option value="false">False</option>
        </select>
      `;
      var_val_tag = document.getElementById('define_var_options_bool_tag');
    }
    else if (var_type_tag.value == 'char') {
      var_val_cell.innerHTML = `
        <input id="define_var_options_char_tag" class="define_var_options_char_input" type="text" maxlength="1">
      `;
      var_val_tag = document.getElementById('define_var_options_char_tag');
      var_val_tag.value = 'c';
    }
  };
  var_val_tag.onchange = function() {
    cur_node.options.var_val = var_val_tag.value;
  };
};

// 'Set Variable' node.
var apply_set_var_node_options_listeners = function(cur_node) {
  var var_name_tag = document.getElementById('set_var_options_var_list_tag');
  // (Needs to be created based on var type.)
  var var_val_tag = null;
  var var_val_cell = document.getElementById('set_var_options_var_new_value_cell');
  populate_defined_vars_dropdown('set_var_options_var_list_tag', cur_node, cur_node.options.var_name);

  var_name_tag.onchange = function() {
    var sel_var = null;
    // Find the corresponding 'New Variable' node.
    for (var node_ind in fsm_nodes) {
      var p_node = fsm_nodes[node_ind];
      if (p_node && p_node.node_type == 'New_Variable' && p_node.options.var_name == var_name_tag.value) {
        sel_var = p_node;
        break;
      }
    }
    if (sel_var) {
      cur_node.options.var_name = sel_var.options.var_name;
      if (!cur_node.options.var_val || cur_node.options.var_type != sel_var.options.var_type) {
        // Defaults.
        if (sel_var.options.var_type == 'int') {
          cur_node.options.var_val = 0;
        }
        else if (sel_var.options.var_type == 'float') {
          cur_node.options.var_val = 0.0;
        }
        else if (sel_var.options.var_type == 'bool') {
          cur_node.options.var_val = true;
        }
        else if (sel_var.options.var_type == 'char') {
          cur_node.options.var_val = 'c';
        }
      }
      cur_node.options.var_type = sel_var.options.var_type;
      var val_input_defined = false;
      if (cur_node.options.var_type == 'int') {
        var_val_cell.innerHTML = `
          <input id="define_var_options_int_tag" class="define_var_options_int_input" type="number" value="` + cur_node.options.var_val + `">
        `;
        var var_val_in = document.getElementById('define_var_options_int_tag');
        var_val_in.onchange = function() {
          cur_node.options.var_val = var_val_in.value;
        };
      }
      else if (cur_node.options.var_type == 'float') {
        var_val_cell.innerHTML = `
          <input id="define_var_options_float_tag" class="define_var_options_float_input" type="number" value="` + cur_node.options.var_val + `" step="0.000001">
        `;
        var var_val_in = document.getElementById('define_var_options_float_tag');
        var_val_in.onchange = function() {
          cur_node.options.var_val = var_val_in.value;
        };
      }
      else if (cur_node.options.var_type == 'bool') {
        var is_true_sel = 'selected="true"';
        var is_false_sel = '';
        if (!cur_node.options.var_val || cur_node.options.var_val == 'false') {
          is_false_sel = 'selected="true"';
          is_true_sel = '';
        }
        var_val_cell.innerHTML = `
          <select id="define_var_options_bool_tag" class="define_var_options_bool_input">
            <option ` + is_true_sel + ` value="true">True</option>
            <option ` + is_false_sel + ` value="false">False</option>
          </select>
        `;
        var var_val_in = document.getElementById('define_var_options_bool_tag');
        var_val_in.onchange = function() {
          cur_node.options.var_val = var_val_in.value;
        };
      }
      else if (cur_node.options.var_type == 'char') {
        var_val_cell.innerHTML = `
          <input id="define_var_options_char_tag" class="define_var_options_char_input" type="text" maxlength="1" value = "` + cur_node.options.var_val + `">
        `;
        var var_val_in = document.getElementById('define_var_options_char_tag');
        var_val_in.onchange = function() {
          cur_node.options.var_val = var_val_in.value;
        };
      }
    }
    else if (var_name_tag.value == '(None)') {
      cur_node.options.var_name = '(None)';
      var_val_cell.innerHTML = '';
    }
  };
  // Fire the change tag off once for the initial selection.
  var_name_tag.onchange();
};

var apply_set_var_logic_not_node_options_listeners = function(cur_node) {
  var var_a_name_tag = document.getElementById('set_var_logic_not_options_A_var_list_tag');
  var var_b_name_tag = document.getElementById('set_var_logic_not_options_B_var_list_tag');
  populate_defined_vars_dropdown('set_var_logic_not_options_A_var_list_tag', cur_node, cur_node.options.var_a_name);
  populate_defined_vars_dropdown('set_var_logic_not_options_B_var_list_tag', cur_node, cur_node.options.var_b_name);
  var_a_name_tag.onchange = function() {
    cur_node.options.var_a_name = var_a_name_tag.value;
  };
  var_b_name_tag.onchange = function() {
    cur_node.options.var_b_name = var_b_name_tag.value;
  };
};

// Set options tag listeners for an 'addition' node.
// TODO: The 'C' in 'A = B + C'
var apply_set_var_addition_node_options_listeners = function(cur_node) {
  var var_a_name_tag = document.getElementById('set_var_addition_options_A_var_list_tag');
  var var_b_name_tag = document.getElementById('set_var_addition_options_B_var_list_tag');
  populate_defined_vars_dropdown('set_var_addition_options_A_var_list_tag', cur_node, cur_node.options.var_a_name);
  populate_defined_vars_dropdown('set_var_addition_options_B_var_list_tag', cur_node, cur_node.options.var_b_name);
  var_a_name_tag.onchange = function() {
    cur_node.options.var_a_name = var_a_name_tag.value;
  };
  var_b_name_tag.onchange = function() {
    cur_node.options.var_b_name = var_b_name_tag.value;
  };
};

// No-op node - currently no options, sort of by definition...
var apply_nop_node_options_listeners = function(cur_node) {
  // Currently none.
};

var apply_check_truthy_options_listeners = function(cur_node) {
  var var_name_tag = document.getElementById('check_truthy_options_var_list_tag');
  populate_defined_vars_dropdown('check_truthy_options_var_list_tag', cur_node, cur_node.options.var_name);
  var_name_tag.onchange = function() {
    cur_node.options.var_name = var_name_tag.value;
  }
};

var apply_check_equals_options_listeners = function(cur_node) {
  var var_a_name_tag = document.getElementById('check_equals_options_A_var_list_tag');
  var var_b_name_tag = document.getElementById('check_equals_options_B_var_list_tag');
  populate_defined_vars_dropdown('check_equals_options_A_var_list_tag', cur_node, cur_node.options.var_a_name);
  populate_defined_vars_dropdown('check_equals_options_B_var_list_tag', cur_node, cur_node.options.var_b_name);
  var_a_name_tag.onchange = function() {
    cur_node.options.var_a_name = var_a_name_tag.value;
  }
  var_b_name_tag.onchange = function() {
    cur_node.options.var_b_name = var_b_name_tag.value;
  }
};
