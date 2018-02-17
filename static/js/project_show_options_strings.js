// This probably isn't the best way of doing things, but for now,
// I'm just going to dump the HTML for various tools' "Options"
// panel into this file.
// Should I just be using .etlua templates for this?
// It sort of feels that way, but this is all dynamically-rendered...

/*
 * Some very basic 'tag population' methods.
 */
var std_opts_table_tag = function(tag_prefix) {
  return `<table class="` + tag_prefix + `_table" cellpadding="0" cellspacing="0" border="0">`;
};

var std_opts_tr_tag = function(tag_class) {
  return `<tr class="` + tag_class + `">`;
};

var std_opts_td_tag = function(tag_class) {
  return `<td class="` + tag_class + `">`;
};

var std_opts_td_id_tag = function(tag_prefix) {
  return `<td id="` + tag_prefix + `_cell" class="` + tag_prefix + `_opt">`;
};

var std_opts_td_full_tag = function(tag_class, tag_contents) {
  return `<td class="` + tag_class + `">` + tag_contents + `</td>`;
};

var std_opts_select_tag = function(tag_prefix) {
  return `<select id="` + tag_prefix + `_tag" class="` + tag_prefix + `_select">`;
};

var std_opts_option_tag = function(tag_prefix, tag_value, tag_label) {
  return `<option value="` + tag_value + `" class="` + tag_prefix + `_option">
  ` + tag_label + `
</option>`;
};

var std_opts_input_text_tag = function(tag_prefix) {
  return `<input type="text" id="` + tag_prefix + `_tag" class="` + tag_prefix + `_input">`;
};

var std_opts_input_number_tag = function(tag_prefix) {
  return `<input type="number" value="0" id="` + tag_prefix + `_tag" class="` + tag_prefix + `_input">`;
};

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
  return std_opts_tr_tag(tag_prefix + '_pin_bank_row') +
    std_opts_td_full_tag(tag_prefix + '_pin_bank_text', 'GPIO Pin Bank') +
    std_opts_td_tag(tag_prefix + '_pin_bank_opt') +
      std_opts_select_tag(tag_prefix + '_pin_bank') +
        std_opts_option_tag(tag_prefix + '_pink_bank', 'GPIOA', 'GPIOA') +
        std_opts_option_tag(tag_prefix + '_pink_bank', 'GPIOB', 'GPIOB') +
        std_opts_option_tag(tag_prefix + '_pink_bank', 'GPIOC', 'GPIOC') +
        std_opts_option_tag(tag_prefix + '_pink_bank', 'GPIOD', 'GPIOD') +
        std_opts_option_tag(tag_prefix + '_pink_bank', 'GPIOE', 'GPIOE') +
        std_opts_option_tag(tag_prefix + '_pink_bank', 'GPIOF', 'GPIOF') +
  `</select></td></tr>`;
};

var select_gpio_pin_table_row = function(tag_prefix) {
  return std_opts_tr_tag(tag_prefix + '_pin_number_row') +
    std_opts_td_full_tag(tag_prefix + '_pin_number_text', 'GPIO Pin Number') +
    std_opts_td_tag(tag_prefix + '_pin_number_opt') +
    std_opts_select_tag(tag_prefix + '_pin_number') +
    std_opts_option_tag(tag_prefix + '_pin_number', '0', '0') +
    std_opts_option_tag(tag_prefix + '_pin_number', '1', '1') +
    std_opts_option_tag(tag_prefix + '_pin_number', '2', '2') +
    std_opts_option_tag(tag_prefix + '_pin_number', '3', '3') +
    std_opts_option_tag(tag_prefix + '_pin_number', '4', '4') +
    std_opts_option_tag(tag_prefix + '_pin_number', '5', '5') +
    std_opts_option_tag(tag_prefix + '_pin_number', '6', '6') +
    std_opts_option_tag(tag_prefix + '_pin_number', '7', '7') +
    std_opts_option_tag(tag_prefix + '_pin_number', '8', '8') +
    std_opts_option_tag(tag_prefix + '_pin_number', '9', '9') +
    std_opts_option_tag(tag_prefix + '_pin_number', '10', '10') +
    std_opts_option_tag(tag_prefix + '_pin_number', '11', '11') +
    std_opts_option_tag(tag_prefix + '_pin_number', '12', '12') +
    std_opts_option_tag(tag_prefix + '_pin_number', '13', '13') +
    std_opts_option_tag(tag_prefix + '_pin_number', '14', '14') +
    std_opts_option_tag(tag_prefix + '_pin_number', '15', '15') + `
      </select>
    </td>
  </tr>
  `;
};

/*
 * List RCC 'peripheral clocks'.
 */
var rcc_clock_list_table_row = function(tag_prefix) {
  return std_opts_tr_tag(tag_prefix + '_periph_clocks_row') +
    std_opts_td_tag(tag_prefix + '_periph_clocks_text', 'Peripheral Clock:') +
    std_opts_td_tag(tag_prefix + '_periph_clocks_opt') +
    std_opts_select_tag(tag_prefix + '_periph_clocks') + `
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

// I2C Channel selection. Currently only one option, on these small chips.
var i2c_channel_select_table_row = function(tag_prefix) {
  var cur_tag_prefix = tag_prefix + '_i2c_channel_select';
  return std_opts_tr_tag(cur_tag_prefix) +
    std_opts_td_full_tag(cur_tag_prefix + '_text', 'I2C Channel:') +
    std_opts_td_tag(cur_tag_prefix + '_opt') +
      std_opts_select_tag(cur_tag_prefix) +
      std_opts_option_tag(cur_tag_prefix, 'I2C1_A9A10', 'I2C1 (A9/A10)') +
  `</select></td></tr>
  `;
};

// I2C Speed selection.
var i2c_speed_select_table_row = function(tag_prefix) {
  var cur_tag_prefix = tag_prefix + '_i2c_speed_select';
  return std_opts_tr_tag(cur_tag_prefix) +
    std_opts_td_full_tag(cur_tag_prefix + '_text', 'I2C Speed:') +
    std_opts_td_tag(cur_tag_prefix + '_opt') +
      std_opts_select_tag(cur_tag_prefix) +
      std_opts_option_tag(cur_tag_prefix, '10KHz', '10KHz') +
      std_opts_option_tag(cur_tag_prefix, '100KHz', '100KHz') +
      std_opts_option_tag(cur_tag_prefix, '400KHz', '400KHz') +
      std_opts_option_tag(cur_tag_prefix, '1MHz', '1MHz') +
  `</select></td></tr>
  `;
};

/*
 * Node-specific options.
 */
// 'Boot' node options.
var boot_node_options_html = std_opts_table_tag('boot_options') +
  std_opts_tr_tag('boot_options_mcu_chip_row') +
    std_opts_td_full_tag('boot_options_mcu_chip_text',
                         'Microcontroller chip type:') +
    std_opts_td_tag('boot_options_mcu_chip_opt') +
      std_opts_select_tag('boot_options_mcu_chip') +
        std_opts_option_tag('boot_options_mcu_chip',
                            'STM32F030F4',
                            'STM32F030F4') +
        std_opts_option_tag('boot_options_mcu_chip',
                            'STM32F031F6',
                            'STM32F031F6') +
  `</select></td></tr></table>
`;

// 'Label' node options.
var label_node_options_html = std_opts_table_tag('define_label_options') +
  std_opts_tr_tag('define_label_options_label_name_row') +
    std_opts_td_full_tag('define_label_options_label_name_text',
                         'Label name:') +
    std_opts_td_tag('define_label_options_label_name_opt') +
      std_opts_input_text_tag('define_label_options_label_name') +
  `</td></tr></table>
`;

// 'Jump' node options.
var jump_node_options_html = `
  ` + defined_labels_list_table_row('jump_options') + `
`;

// 'Delay' node options.
var delay_node_options_html = std_opts_table_tag('delay_options') +
  std_opts_tr_tag('delay_options_unit_row') +
    std_opts_td_full_tag('delay_options_unit_text', 'Delay units:') +
    std_opts_td_tag('delay_options_unit_opt') +
      std_opts_select_tag('delay_options_unit') +
        std_opts_option_tag('delay_options_unit', 'Cycles', 'Cycles') +
        std_opts_option_tag('delay_options_unit',
                            'Microseconds', 'Microseconds') +
        std_opts_option_tag('delay_options_unit',
                            'Milliseconds', 'Milliseconds') +
        std_opts_option_tag('delay_options_unit',
                            'Seconds', 'Seconds') +
  `</select></td></tr>` +
  std_opts_tr_tag('delay_options_value_row') +
    std_opts_td_full_tag('delay_options_value_text', 'Units to delay:') +
    std_opts_td_tag('delay_options_value_opt') +
      std_opts_input_number_tag('delay_options_value') +
  `</td></tr></table>
`;

// 'Setup GPIO Pin' node options.
var init_gpio_node_options_html = std_opts_table_tag('init_gpio_options') +
  select_gpio_bank_table_row('init_gpio_options') +
  select_gpio_pin_table_row('init_gpio_options') +
  std_opts_tr_tag('init_gpio_options_pin_func_row') +
    std_opts_td_full_tag('init_gpio_options_pin_func_text',
                         'Pin Function:') +
    std_opts_td_tag('init_gpio_options_pin_func_opt') +
      std_opts_select_tag('init_gpio_options_pin_func') +
        std_opts_option_tag('init_gpio_options_pin_func',
                            'Output', 'Output') +
        std_opts_option_tag('init_gpio_options_pin_func',
                            'Input', 'Input') +
        std_opts_option_tag('init_gpio_options_pin_func',
                            'Analog', 'Analog') +
        std_opts_option_tag('init_gpio_options_pin_func',
                            'AF', 'Alternate Function') +
  `</select></td></tr>` +
  std_opts_tr_tag('init_gpio_options_otype_row') +
    std_opts_td_full_tag('init_gpio_options_otype_text', 'Output Type:') +
    std_opts_td_tag('init_gpio_options_otype_opt') +
      std_opts_select_tag('init_gpio_options_otype') +
        std_opts_option_tag('init_gpio_options_otype',
                            'Push-Pull', 'Push-Pull') +
        std_opts_option_tag('init_gpio_options_otype',
                            'Open-Drain', 'Open-Drain') +
  `</select></td></tr>` +
  std_opts_tr_tag('init_gpio_options_ospeed_row') +
    std_opts_td_full_tag('init_gpio_options_ospeed_text', 'Output Speed:') +
    std_opts_td_tag('init_gpio_options_ospeed_opt') +
      std_opts_select_tag('init_gpio_options_ospeed') +
        std_opts_option_tag('init_gpio_options_ospeed',
                            'H', 'High (50MHz)') +
        std_opts_option_tag('init_gpio_options_ospeed',
                            'M', 'Medium (10MHz)') +
        std_opts_option_tag('init_gpio_options_ospeed',
                            'L', 'Low (2MHz)') +
  `</select></td></tr>` +
  std_opts_tr_tag('init_gpio_options_pupdr_row') +
    std_opts_td_full_tag('init_gpio_options_pupdr_text',
                         'Pull-up / Pull-down') +
    std_opts_td_tag('init_gpio_options_pupdr_opt') +
      std_opts_select_tag('init_gpio_options_pupdr') +
        std_opts_option_tag('init_gpio_options_pupdr',
                            'PU', 'Enable Pull-up') +
        std_opts_option_tag('init_gpio_options_pupdr',
                            'PD', 'Enable Pull-down') +
        std_opts_option_tag('init_gpio_options_pupdr',
                            'None', 'No Pull-up/down') +
  `</select></td></tr></table>
`;

// 'Set GPIO Output' node options.
var set_gpio_out_node_options_html = std_opts_table_tag('set_gpio_out_options') +
  select_gpio_bank_table_row('set_gpio_out_options') +
  select_gpio_pin_table_row('set_gpio_out_options') +
  std_opts_tr_tag('set_gpio_out_options_value_row') +
    std_opts_td_full_tag('set_gpio_out_options_value_text',
                         'Output value:') +
    std_opts_td_tag('set_gpio_out_options_value_opt') +
      std_opts_select_tag('set_gpio_out_options_value') +
        std_opts_option_tag('set_gpio_out_options_value', 'On', 'On') +
        std_opts_option_tag('set_gpio_out_options_value', 'Off', 'Off') +
        std_opts_option_tag('set_gpio_out_options_value', 'Var', 'Variable') +
  `</select></td></tr>` +
  defined_variables_list_table_row('set_gpio_out_options', 'Variable:') +
  `</table>
`;

// 'Read GPIO_Input' node options.
var read_gpio_in_node_options_html = std_opts_table_tag('read_gpio_in_options') +
  select_gpio_bank_table_row('read_gpio_in_options') +
  select_gpio_pin_table_row('read_gpio_in_options') +
  defined_variables_list_table_row('read_gpio_in_options', 'Store in Variable:') +
  `</table>
`;

// 'Enable peripheral clock' node options.
var rcc_enable_node_options_html = std_opts_table_tag('rcc_enable_options') +
  rcc_clock_list_table_row('rcc_enable_options') +
  `</table>
`;

// 'Disable peripheral clock' node options.
var rcc_disable_node_options_html = std_opts_table_tag('rcc_disable_options') +
  rcc_clock_list_table_row('rcc_disable_options') +
  `</table>
`;

// 'Define variable' node options.
var define_var_node_options_html = std_opts_table_tag('define_var_options') +
  std_opts_tr_tag('define_var_options_var_name_row') +
    std_opts_td_full_tag('define_var_options_var_name_text',
                       'Variable Name:') +
    std_opts_td_tag('define_var_options_var_name_opt') +
      std_opts_input_text_tag('define_var_options_var_name') +
  `</td></tr>` +
  std_opts_tr_tag('define_var_options_var_type_row') +
    std_opts_td_full_tag('define_var_options_var_type_text',
                       'Variable Type:') +
    std_opts_td_tag('define_var_options_var_type_opt') +
      std_opts_select_tag('define_var_options_var_type') +
        std_opts_option_tag('define_var_options_var_type',
                            'int', 'Integer') +
        std_opts_option_tag('define_var_options_var_type',
                            'float', 'Floating-point') +
        std_opts_option_tag('define_var_options_var_type',
                            'bool', 'Boolean') +
        std_opts_option_tag('define_var_options_var_type',
                            'char', 'Letter') +
  `</select></td></tr>` +
  std_opts_tr_tag('define_var_options_var_val_row') +
    std_opts_td_full_tag('define_var_options_var_val_text',
                         'Starting Value:') +
    std_opts_td_id_tag('define_var_options_var_val') +
  `</td></tr></table>
`;

// 'Set variable' node options.
var set_var_node_options_html = std_opts_table_tag('set_var_options') +
  defined_variables_list_table_row('set_var_options', 'Variable:') +
  std_opts_tr_tag('set_var_options_var_new_value_row') +
    std_opts_td_full_tag('set_var_options_var_new_value_text',
                         'New Value:') +
    std_opts_td_id_tag('set_var_options_var_new_value') +
  `</td></tr></table>
`;

// 'Modify Variable: Logic Not' node options.
var set_var_logic_not_node_options_html = std_opts_table_tag('set_var_logic_not_options') +
  defined_variables_list_table_row('set_var_logic_not_options_A', 'Variable A:') +
  defined_variables_list_table_row('set_var_logic_not_options_B', 'Variable B:') +
  `</table>
`;

// 'Modify Variable: Addition or Subtraction' node options.
// TODO: The 'C' in 'A = B + C'
var set_var_addition_node_options_html = std_opts_table_tag('set_var_addition_options') +
  defined_variables_list_table_row('set_var_addition_options_A',
                                   'Variable A:') +
  defined_variables_list_table_row('set_var_addition_options_B',
                                   'Variable B:') +
  std_opts_tr_tag('set_var_addition_options_C_type_row') +
    std_opts_td_full_tag('set_var_addition_options_C_type_text',
                         "'C' Variable Type:") +
    std_opts_td_id_tag('set_var_addition_options_C_type') +
      std_opts_select_tag('set_var_addition_options_C_type') +
        std_opts_option_tag('set_var_addition_options_C_type',
                            'val', 'Constant Value') +
        std_opts_option_tag('set_var_addition_options_C_type',
                            'var', 'Defined Variable') +
  `</select></td></tr>` +
  std_opts_tr_tag('set_var_addition_options_C_val_row') +
    std_opts_td_full_tag('set_var_addition_options_C_val_text',
                         "'C' Variable Value:") +
    std_opts_td_id_tag('set_var_addition_options_C_val') +
  `</td></tr></table>
`;

// 'No-op' node options.
// Currently there are none, besides the input/output connections table.
var nop_node_options_html = `
`;

// 'Initialize I2C Peripheral' options.
var i2c_init_node_options_html = std_opts_table_tag('i2c_init_options') +
  i2c_channel_select_table_row('i2c_init_options') +
  i2c_speed_select_table_row('i2c_init_options') +
  `</table>
`;

// 'Deinitialize I2C Peripheral' options.
var i2c_deinit_node_options_html = std_opts_table_tag('i2c_deinit_options') +
  i2c_channel_select_table_row('i2c_deinit_options') +
  `</table>
`;

// 'Initialize SSD1306 OLED Screen' options.
var ssd1306_init_node_options_html = std_opts_table_tag('ssd1306_init_options') +
  i2c_channel_select_table_row('ssd1306_init_options') +
  `</table>
`;

// 'SSD1306 Screen Draw Pixel' options.
var ssd1306_draw_pixel_node_options_html = std_opts_table_tag('ssd1306_draw_px_options') +
  i2c_channel_select_table_row('ssd1306_draw_px_options') +
  std_opts_tr_tag('ssd1306_draw_px_options_xc_row') +
    std_opts_td_full_tag('ssd1306_draw_px_options_xc_text',
                         'X-Coordinate:') +
    std_opts_td_tag('ssd1306_draw_px_options_xc_opt') +
      std_opts_input_number_tag('ssd1306_draw_px_options_xc') +
  `</td></tr>` +
  std_opts_tr_tag('ssd1306_draw_px_options_yc_row') +
    std_opts_td_full_tag('ssd1306_draw_px_options_yc_text',
                         'Y-Coordinate:') +
    std_opts_td_tag('ssd1306_draw_px_options_yc_opt') +
      std_opts_input_number_tag('ssd1306_draw_px_options_yc') +
  `</td></tr>` +
  std_opts_tr_tag('ssd1306_draw_px_options_col_row') +
    std_opts_td_full_tag('ssd1306_draw_px_options_col_text',
                         '"Color":') +
    std_opts_td_tag('ssd1306_draw_px_options_col_opt') +
      std_opts_select_tag('ssd1306_draw_px_options_col') +
        std_opts_option_tag('ssd1306_draw_px_options_col', 'On', 'On') +
        std_opts_option_tag('ssd1306_draw_px_options_col', 'Off', 'Off') +
  `</select></td></tr></table>
`;

// 'SSD1306 Screen Draw Rectangle' options.
var ssd1306_draw_rect_node_options_html = std_opts_table_tag('ssd1306_draw_rect_options') +
  i2c_channel_select_table_row('ssd1306_draw_rect_options') +
  std_opts_tr_tag('ssd1306_draw_rect_options_xc_row') +
    std_opts_td_full_tag('ssd1306_draw_rect_options_xc_text',
                         'X-Coordinate:') +
    std_opts_td_tag('ssd1306_draw_rect_options_xc_opt') +
      std_opts_input_number_tag('ssd1306_draw_rect_options_xc') +
  `</td></tr>` +
  std_opts_tr_tag('ssd1306_draw_rect_options_yc_row') +
    std_opts_td_full_tag('ssd1306_draw_rect_options_yc_text',
                         'Y-Coordinate:') +
    std_opts_td_tag('ssd1306_draw_rect_options_yc_opt') +
      std_opts_input_number_tag('ssd1306_draw_rect_options_yc') +
  `</td></tr>` +
  std_opts_tr_tag('ssd1306_draw_rect_options_wc_row') +
    std_opts_td_full_tag('ssd1306_draw_rect_options_wc_text',
                         'Rect Width:') +
    std_opts_td_tag('ssd1306_draw_rect_options_wc_opt') +
      std_opts_input_number_tag('ssd1306_draw_rect_options_wc') +
  `</td></tr>` +
  std_opts_tr_tag('ssd1306_draw_rect_options_hc_row') +
    std_opts_td_full_tag('ssd1306_draw_rect_options_hc_text',
                         'Rect Height:') +
    std_opts_td_tag('ssd1306_draw_rect_options_hc_opt') +
      std_opts_input_number_tag('ssd1306_draw_rect_options_hc') +
  `</td></tr>` +
  std_opts_tr_tag('ssd1306_draw_rect_options_col_row') +
    std_opts_td_full_tag('ssd1306_draw_rect_options_col_text',
                         '"Color":') +
    std_opts_td_tag('ssd1306_draw_rect_options_col_opt') +
      std_opts_select_tag('ssd1306_draw_rect_options_col') +
        std_opts_option_tag('ssd1306_draw_rect_options_col', 'On', 'On') +
        std_opts_option_tag('ssd1306_draw_rect_options_col', 'Off', 'Off') +
  `</select></td></tr>` +
  std_opts_tr_tag('ssd1306_draw_rect_options_type_row') +
    std_opts_td_full_tag('ssd1306_draw_rect_options_type_text',
                         'Fill Type:') +
    std_opts_td_tag('ssd1306_draw_rect_options_type_opt') +
      std_opts_select_tag('ssd1306_draw_rect_options_type') +
        std_opts_option_tag('ssd1306_draw_rect_options_type',
                            'Fill', 'Fill') +
        std_opts_option_tag('ssd1306_draw_rect_options_type',
                            'Outline', 'Outline') +
  `</select></td></tr>` +
  std_opts_tr_tag('ssd1306_draw_rect_options_outline_row') +
    std_opts_td_full_tag('ssd1306_draw_rect_options_outline_text',
                         'Outline Pixels:') +
    std_opts_td_tag('ssd1306_draw_rect_options_outline_opt') +
      std_opts_input_number_tag('ssd1306_draw_rect_options_outline') +
  `</td></tr></table>
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
  var var_c_type_tag = document.getElementById('set_var_addition_options_C_type_tag');
  var var_c_val_cell_tag = document.getElementById('set_var_addition_options_C_val_cell');
  var var_c_val_tag = null;
  populate_defined_vars_dropdown('set_var_addition_options_A_var_list_tag', cur_node, cur_node.options.var_a_name);
  populate_defined_vars_dropdown('set_var_addition_options_B_var_list_tag', cur_node, cur_node.options.var_b_name);
  // Populate the 'C' variable's type.
  var_c_type_tag.value = cur_node.options.add_val_type;
  var_a_name_tag.onchange = function() {
    cur_node.options.var_a_name = var_a_name_tag.value;
  };
  var_b_name_tag.onchange = function() {
    cur_node.options.var_b_name = var_b_name_tag.value;
  };
  var_c_type_tag.onchange = function() {
    var type_changed = false;
    var old_type = cur_node.options.add_val_type;
    cur_node.options.add_val_type = var_c_type_tag.value;
    if (cur_node.options.add_val_type != old_type) {
      type_changed = true;
    }
    // TODO: Type checking/matching.
    if (cur_node.options.add_val_type == 'val') {
      // Constant value; set/populate an input tag.
      if (type_changed) { cur_node.options.add_val_val = '0'; }
      var_c_val_cell_tag.innerHTML = `
        <input id="set_var_addition_options_C_val_tag" class="define_var_options_int_input" type="number" value="` + cur_node.options.add_val_val + `">
      `;
      var_c_val_tag = document.getElementById('set_var_addition_options_C_val_tag');
    }
    else if (cur_node.options.add_val_type == 'var') {
      if (type_changed) { cur_node.options.add_val_val = '(None)'; }
      // Variable value; set/populate a variable selection tag.
      var_c_val_cell_tag.innerHTML = `
        <select id="set_var_addition_options_C_var_list_tag" class="set_var_addition_options_C_var_list_select">
        </select>
      `;
      populate_defined_vars_dropdown('set_var_addition_options_C_var_list_tag', cur_node, cur_node.options.add_val_val);
      var_c_val_tag = document.getElementById('set_var_addition_options_C_var_list_tag');
    }
    // Set the new tag's listener.
    var_c_val_tag.onchange = function() {
      cur_node.options.add_val_val = var_c_val_tag.value;
    };
  };
  // Fire the change tag off once to apply initial changes.
  var_c_type_tag.onchange();
};

// No-op node - currently no options, sort of by definition...
var apply_nop_node_options_listeners = function(cur_node) {
  // Currently none.
};

// 'Initialize I2C Peripheral' options listeners.
var apply_i2c_init_node_options_listeners = function(cur_node) {
  var i2c_channel_tag = document.getElementById('i2c_init_options_i2c_channel_select_tag');
  var i2c_speed_tag = document.getElementById('i2c_init_options_i2c_speed_select_tag');
  if (cur_node && cur_node.options.i2c_periph_num && cur_node.options.scl_pin && cur_node.options.sda_pin) {
    if (cur_node.options.i2c_periph_num == '1' &&
        cur_node.options.scl_pin == 'A9' &&
        cur_node.options.sda_pin == 'A10') {
      i2c_channel_tag.value = 'I2C1_A9A10';
    }
  }
  if (cur_node && cur_node.options.i2c_periph_speed) {
    i2c_speed_tag.value = cur_node.options.i2c_periph_speed;
  }

  i2c_channel_tag.onchange = function() {
    if (i2c_channel_tag.value == 'I2C1_A9A10') {
      // I2C1 peripheral on GPIOA 9/10 Alt. Func. #4.
      cur_node.options.i2c_periph_num = '1';
      cur_node.options.scl_pin = 'A9';
      cur_node.options.sda_pin = 'A10';
      cur_node.options.gpio_af = 'AF_4';
    }
  };
  i2c_speed_tag.onchange = function() {
    cur_node.options.i2c_periph_speed = i2c_speed_tag.value;
  };
};

// 'Deinitialize I2C Peripheral' options listeners.
// TODO
var apply_i2c_deinit_node_options_listeners = function(cur_node) {
};

// 'Initialize SSD1306 OLED Screen' options listeners.
var apply_ssd1306_init_node_options_listeners = function(cur_node) {
  var i2c_channel_tag = document.getElementById('ssd1306_init_options_i2c_channel_select_tag');
  if (cur_node && cur_node.options.i2c_periph_num) {
    if (cur_node.options.i2c_periph_num == '1') {
      i2c_channel_tag.value = 'I2C1_A9A10';
    }
  }
  i2c_channel_tag.onchange = function() {
    if (i2c_channel_tag.value == 'I2C1_A9A10') {
      cur_node.options.i2c_periph_num = '1';
    }
  };
};

// 'SSD1306 Screen Draw Pixel' options listeners.
var apply_ssd1306_draw_pixel_node_options_listeners = function(cur_node) {
  var i2c_channel_tag = document.getElementById('ssd1306_draw_px_options_i2c_channel_select_tag');
  var x_coord_tag = document.getElementById('ssd1306_draw_px_options_xc_tag');
  var y_coord_tag = document.getElementById('ssd1306_draw_px_options_yc_tag');
  var color_tag = document.getElementById('ssd1306_draw_px_options_col_tag');
  // Set loaded values.
  if (cur_node) {
    if (cur_node.options.i2c_periph_num) {
      if (cur_node.options.i2c_periph_num == '1') {
        i2c_channel_tag.value = 'I2C1_A9A10';
      }
    }
    if (cur_node.options.px_x) {
      x_coord_tag.value = cur_node.options.px_x;
    }
    if (cur_node.options.px_y) {
      y_coord_tag.value = cur_node.options.px_y;
    }
    if (cur_node.options.px_color) {
      color_tag.value = cur_node.options.px_color;
    }
  }
  // Set listeners.
  i2c_channel_tag.onchange = function() {
    if (i2c_channel_tag.value == 'I2C1_A9A10') {
      cur_node.options.i2c_periph_num = '1';
    }
  };
  x_coord_tag.onchange = function() {
    cur_node.options.px_x = x_coord_tag.value;
  };
  y_coord_tag.onchange = function() {
    cur_node.options.px_y = y_coord_tag.value;
  };
  color_tag.onchange = function() {
    cur_node.options.px_color = color_tag.value;
  };
};

// 'SSD1306 Screen Draw Rect' options listeners.
var apply_ssd1306_draw_rect_node_options_listeners = function(cur_node) {
  var i2c_channel_tag = document.getElementById('ssd1306_draw_rect_options_i2c_channel_select_tag');
  var x_coord_tag = document.getElementById('ssd1306_draw_rect_options_xc_tag');
  var y_coord_tag = document.getElementById('ssd1306_draw_rect_options_yc_tag');
  var w_coord_tag = document.getElementById('ssd1306_draw_rect_options_wc_tag');
  var h_coord_tag = document.getElementById('ssd1306_draw_rect_options_hc_tag');
  var color_tag = document.getElementById('ssd1306_draw_rect_options_col_tag');
  var fill_type_tag = document.getElementById('ssd1306_draw_rect_options_type_tag');
  var outline_tag = document.getElementById('ssd1306_draw_rect_options_outline_tag');
  outline_tag.hidden = true;
  if (cur_node) {
    if (cur_node.options.i2c_periph_num) {
      if (cur_node.options.i2c_periph_num == '1') {
        i2c_channel_tag.value = 'I2C1_A9A10';
      }
    }
    if (cur_node.options.rect_x) {
      x_coord_tag.value = cur_node.options.rect_x;
    }
    if (cur_node.options.rect_y) {
      y_coord_tag.value = cur_node.options.rect_y;
    }
    if (cur_node.options.rect_w) {
      w_coord_tag.value = cur_node.options.rect_w;
    }
    if (cur_node.options.rect_h) {
      h_coord_tag.value = cur_node.options.rect_h;
    }
    if (cur_node.options.rect_color) {
      color_tag.value = cur_node.options.rect_color;
    }
    if (cur_node.options.rect_style) {
      fill_type_tag.value = cur_node.options.rect_style;
      if (cur_node.options.rect_style == 'Outline') {
        outline_tag.hidden = false;
      }
    }
    if (cur_node.options.outline) {
      outline_tag.value = cur_node.options.outline;
    }
  }
  i2c_channel_tag.onchange = function() {
    if (i2c_channel_tag.value == 'I2C1_A9A10') {
      cur_node.options.i2c_periph_num = '1';
    }
  };
  x_coord_tag.onchange = function() {
    cur_node.options.rect_x = x_coord_tag.value;
  };
  y_coord_tag.onchange = function() {
    cur_node.options.rect_y = y_coord_tag.value;
  };
  w_coord_tag.onchange = function() {
    cur_node.options.rect_w = w_coord_tag.value;
  };
  h_coord_tag.onchange = function() {
    cur_node.options.rect_h = h_coord_tag.value;
  };
  color_tag.onchange = function() {
    cur_node.options.rect_color = color_tag.value;
  };
  fill_type_tag.onchange = function() {
    cur_node.options.rect_style = fill_type_tag.value;
    if (cur_node.options.rect_style == 'Outline') {
      outline_tag.hidden = false;
    }
    else {
      outline_tag.hidden = true;
    }
  };
  outline_tag.onchange = function() {
    cur_node.options.outline = outline_tag.value;
  };
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
