// This probably isn't the best way of doing things, but for now,
// I'm just going to dump the HTML for various tools' "Options"
// panel into this file.

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
        <option value="None" id="node_io_options_bot_mid_input" class="node_io_options_opt">
          Input
        </option>
        <option value="None" id="node_io_options_bot_mid_output" class="node_io_options_opt">
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
 * Node-specific options.
 */
// 'Boot' node options.
var boot_node_options_html = `
<table class="boot_options_table" cellpadding="0" cellspacing="0" border="0">
  <tr class="boot_options_mcu_chip">
    <td class="boot_options_mcu_chip_text">
      Microcontroller chip type:
    </td>
    <td class="boot_options_mcu_chip_opt">
      <select class="boot_options_mcu_chip_select">
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

`;

// 'Setup GPIO Pin' node options.
var init_gpio_node_options_html = `
`;

// 'Disable GPIO Pin' node options.
var deinit_gpio_node_options_html = `
`;

// 'Set GPIO Output' node options.
var set_gpio_out_node_options_html = `
`;

// 'Enable peripheral clock' node options.
var rcc_enable_node_options_html = `
`;

// 'Disable peripheral clock' node options.
var rcc_disable_node_options_html = `
`;

// 'Define variable' node options.
var define_var_node_options_html = `
`;

// 'Set variable' node options.
var set_var_node_options_html = `
`;
