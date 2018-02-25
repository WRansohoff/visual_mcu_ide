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

var std_opts_tr_id_tag = function(tag_class) {
  return `<tr id="` + tag_class + `_row_tag" class="` + tag_class + `">`;
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

var std_opts_input_letter_tag = function(tag_prefix) {
  return `<input type="text" maxlength="1" id="` + tag_prefix + `_tag" class="` + tag_prefix + `_input">`;
};

var std_opts_input_number_tag = function(tag_prefix) {
  return `<input type="number" value="0" id="` + tag_prefix + `_tag" class="` + tag_prefix + `_input">`;
};

var std_opts_input_float_tag = function(tag_prefix) {
  return `<input type="number" value="0" id="` + tag_prefix + `_tag" class="` + tag_prefix + `_input" step="0.000001">`;
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
        std_opts_option_tag(tag_prefix + '_pin_bank', 'GPIOA', 'GPIOA') +
        std_opts_option_tag(tag_prefix + '_pin_bank', 'GPIOB', 'GPIOB') +
        std_opts_option_tag(tag_prefix + '_pin_bank', 'GPIOC', 'GPIOC') +
        std_opts_option_tag(tag_prefix + '_pin_bank', 'GPIOD', 'GPIOD') +
        std_opts_option_tag(tag_prefix + '_pin_bank', 'GPIOE', 'GPIOE') +
        std_opts_option_tag(tag_prefix + '_pin_bank', 'GPIOF', 'GPIOF') +
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
  return std_opts_tr_id_tag(tag_prefix + '_periph_clocks') +
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
    </td>` +
      defined_variables_list_table_cell(tag_prefix, label_text) +
  `</tr>`;
};

var defined_variables_list_table_cell = function(tag_prefix, label_text) {
  return `
    <td class="` + tag_prefix + `_var_list_opt">
      <select id="` + tag_prefix + `_var_list_tag" class="` + tag_prefix + `_var_list_select">
        <option selected="true" value="(None)" id="` + tag_prefix + `_var_list_n/a" class="` + tag_prefix + `_var_list_option">
          (None defined)
        </option>
      </select>
    </td>
  `;
};

var defined_labels_list_table_row = function(tag_prefix) {
  return `
  <tr id="` + tag_prefix + `_label_list_row_tag" class="` + tag_prefix + `_label_list_row">
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

// ADC Channel selection. Currently only one option.
var adc_channel_select_table_row = function(tag_prefix) {
  var cur_tag_prefix = tag_prefix + '_adc_channel_select';
  return std_opts_tr_tag(cur_tag_prefix) +
    std_opts_td_full_tag(cur_tag_prefix + '_text', 'ADC Channel:') +
    std_opts_td_tag(cur_tag_prefix + '_opt') +
      std_opts_select_tag(cur_tag_prefix) +
      std_opts_option_tag(cur_tag_prefix, '1', 'ADC1') +
  `</select></td></tr>
  `;
};

/*
 * Node-specific option HTML autogenerators.
 */
var gen_options_html_for_types = function() {
  for (var tn_ind in tool_node_types) {
    var cur_type = tool_node_types[tn_ind];
    var cur_type_prefix = cur_type.base_name + '_options';
    var cur_type_html = std_opts_table_tag(cur_type_prefix);
    for (var opt_name in cur_type.options) {
      var cur_opt = cur_type.options[opt_name];
      // Add option HTML depending on the type.
      if (cur_opt.type == 'select') {
        // A 'select' dropdown.
        var tag_prefix = cur_type_prefix + '_' + opt_name;
        var tag_to_add = std_opts_tr_id_tag(tag_prefix) +
          std_opts_td_full_tag(tag_prefix + '_text', cur_opt.label) +
          std_opts_td_tag(tag_prefix + '_opt') +
            std_opts_select_tag(tag_prefix);
        for (var opt_opt_ind in cur_opt.options) {
          var opt_opt = cur_opt.options[opt_opt_ind];
          tag_to_add = tag_to_add + std_opts_option_tag(tag_prefix,
                       opt_opt.value, opt_opt.name);
        }
        tag_to_add = tag_to_add + '</select></td></tr>\n';
        cur_type_html = cur_type_html + tag_to_add;
      }
      else if (cur_opt.type == 'rcc_select') {
        // A special sort of 'select' dropdown with available
        // peripheral clocks depending on the selected chip.
        var tag_prefix = cur_type_prefix + '_' + opt_name;
        cur_type_html = cur_type_html + rcc_clock_list_table_row(tag_prefix);
      }
      else if (cur_opt.type == 'input_number') {
        // A numeric input field.
        var tag_prefix = cur_type_prefix + '_' + opt_name;
        var tag_to_add = std_opts_tr_id_tag(tag_prefix) +
          std_opts_td_full_tag(tag_prefix + '_text', cur_opt.label) +
          std_opts_td_tag(tag_prefix + '_opt') +
            std_opts_input_number_tag(tag_prefix);
        tag_to_add = tag_to_add + '</td></tr>\n';
        cur_type_html = cur_type_html + tag_to_add;
      }
      else if (cur_opt.type == 'input_text') {
        // A text input field.
        var tag_prefix = cur_type_prefix + '_' + opt_name;
        var tag_to_add = std_opts_tr_id_tag(tag_prefix) +
          std_opts_td_full_tag(tag_prefix + '_text', cur_opt.label) +
          std_opts_td_tag(tag_prefix + '_opt') +
            std_opts_input_text_tag(tag_prefix);
        tag_to_add = tag_to_add + '</td></tr>\n';
        cur_type_html = cur_type_html + tag_to_add;
      }
      else if (cur_opt.type == 'input_text_def') {
        // A text input field that verifies its input is
        // unique across a set of nodes' options.
        // TODO: Same HTML as 'input_text'?
        var tag_prefix = cur_type_prefix + '_' + opt_name;
        var tag_to_add = std_opts_tr_id_tag(tag_prefix) +
          std_opts_td_full_tag(tag_prefix + '_text', cur_opt.label) +
          std_opts_td_tag(tag_prefix + '_opt') +
            std_opts_input_text_tag(tag_prefix);
        tag_to_add = tag_to_add + '</td></tr>\n';
        cur_type_html = cur_type_html + tag_to_add;
      }
      else if (cur_opt.type == 'defined_var_select') {
        var tag_prefix = cur_type_prefix + '_' + opt_name;
        cur_type_html = cur_type_html + defined_variables_list_table_row(tag_prefix, cur_opt.label);
      }
      else if (cur_opt.type == 'defined_label_select') {
        var tag_prefix = cur_type_prefix + '_' + opt_name;
        cur_type_html = cur_type_html + defined_labels_list_table_row(tag_prefix, cur_opt.label);
      }
      else if (cur_opt.type == 'TBD' ||
               cur_opt.type == 'TBD_Var') {
        // Fill out an empty table row for a 'To-Be-Determined'
        // option input tag.
        var tag_prefix = cur_type_prefix + '_' + opt_name;
        var tbd_empty_row = std_opts_tr_id_tag(tag_prefix) +
          std_opts_td_full_tag(tag_prefix + '_text', cur_opt.label) +
          std_opts_td_id_tag(tag_prefix);
        tbd_empty_row = tbd_empty_row + '</td></tr>';
        cur_type_html = cur_type_html + tbd_empty_row;
      }
      else if (cur_opt.type == 'background') {
      }
    }
    cur_type_html = cur_type_html + `</table>`;
    tool_node_types[tn_ind].options_gen_html = cur_type_html;
  }
};

/*
 * Node listener function autogenerators.
 */
var gen_tag_onchange = function(cur_node, opt_tags, opt_name, opts) {
  var cur_opt = opts[opt_name];
  return function() {
    // (Apply linked 'TBD' option settings.)
    if (cur_opt.determines) {
      var cell_tag = opt_tags[cur_opt.determines + '_cell'];
      if (cell_tag) {
        for (var o_ind in opts) {
          if (o_ind == cur_opt.determines) {
            var mod_opt = opts[o_ind];
            for (var t_ind in mod_opt.types) {
              var m_type = mod_opt.types[t_ind];
              if (m_type.val == opt_tags[opt_name].value) {
                // Set the cell's option tag HTML and listener.
                // TODO: Support all option types, and reduce
                // code re-use across the if/elses.
                if (m_type.type == 'select') {
                  var prefix = cur_node.node_type + '_options_' + o_ind;
                  var new_inner_html = std_opts_select_tag(prefix);
                  for (var opt_ind in m_type.options) {
                    var optopt = m_type.options[opt_ind];
                    new_inner_html = new_inner_html +
                      std_opts_option_tag(prefix, optopt.value, optopt.name);
                  }
                  new_inner_html = new_inner_html + '</select>';
                  cell_tag.innerHTML = new_inner_html;
                  opt_tags[cur_opt.determines] = document.getElementById(prefix + '_tag');
                  if (cur_node.options[opt_name] == m_type.val) {
                    opt_tags[cur_opt.determines].value = cur_node.options[o_ind];
                  }
                  else {
                    opt_tags[cur_opt.determines].value = m_type.default;
                  }
                  opt_tags[cur_opt.determines].onchange = gen_tag_onchange(cur_node, opt_tags, o_ind, opts);
                  opt_tags[cur_opt.determines].onchange();
                }
                else if (m_type.type == 'defined_var_select') {
                  var prefix = cur_node.node_type + '_options_' + o_ind;
                  cell_tag.innerHTML = defined_variables_list_table_cell(prefix, opts[cur_opt.determines].label);
                  opt_tags[cur_opt.determines] = document.getElementById(prefix + '_var_list_tag');
                  populate_defined_vars_dropdown(prefix + '_var_list_tag', cur_node, cur_node.options[opt_ind]);
                  if (cur_node.options[opt_name] == m_type.val) {
                    opt_tags[cur_opt.determines].value = cur_node.options[o_ind];
                  }
                  else {
                    opt_tags[cur_opt.determines].value = m_type.default;
                  }
                  opt_tags[cur_opt.determines].onchange = gen_tag_onchange(cur_node, opt_tags, o_ind, opts);
                  opt_tags[cur_opt.determines].onchange();
                }
                else if (m_type.type == 'input_number') {
                  var prefix = cur_node.node_type + '_options_' + o_ind;
                  cell_tag.innerHTML = std_opts_input_number_tag(prefix);
                  opt_tags[cur_opt.determines] = document.getElementById(prefix + '_tag');
                  if (cur_node.options[opt_name] == m_type.val) {
                    opt_tags[cur_opt.determines].value = cur_node.options[o_ind];
                  }
                  else {
                    opt_tags[cur_opt.determines].value = m_type.default;
                  }
                  opt_tags[cur_opt.determines].onchange = gen_tag_onchange(cur_node, opt_tags, o_ind, opts);
                  opt_tags[cur_opt.determines].onchange();
                }
                else if (m_type.type == 'input_float') {
                  var prefix = cur_node.node_type + '_options_' + o_ind;
                  cell_tag.innerHTML = std_opts_input_float_tag(prefix);
                  opt_tags[cur_opt.determines] = document.getElementById(prefix + '_tag');
                  if (cur_node.options[opt_name] == m_type.val) {
                    opt_tags[cur_opt.determines].value = cur_node.options[o_ind];
                  }
                  else {
                    opt_tags[cur_opt.determines].value = m_type.default;
                  }
                  opt_tags[cur_opt.determines].onchange = gen_tag_onchange(cur_node, opt_tags, o_ind, opts);
                  opt_tags[cur_opt.determines].onchange();
                }
                else if (m_type.type == 'input_letter') {
                  var prefix = cur_node.node_type + '_options_' + o_ind;
                  cell_tag.innerHTML = std_opts_input_letter_tag(prefix);
                  opt_tags[cur_opt.determines] = document.getElementById(prefix + '_tag');
                  if (cur_node.options[opt_name] == m_type.val) {
                    opt_tags[cur_opt.determines].value = cur_node.options[o_ind];
                  }
                  else {
                    opt_tags[cur_opt.determines].value = m_type.default;
                  }
                  opt_tags[cur_opt.determines].onchange = gen_tag_onchange(cur_node, opt_tags, o_ind, opts);
                  opt_tags[cur_opt.determines].onchange();
                }
              }
            }
            break;
          }
        }
      }
    }
    else if (cur_opt.determines_var) {
      var cell_tag = opt_tags[cur_opt.determines_var + '_cell'];
      if (cell_tag) {
        // Get the type of variable selected (if any), and
        // add an appropriate type of input tag.
        var chosen_var = defined_vars[opt_tags[opt_name].value];
        var prefix = cur_node.node_type + '_options_' + cur_opt.determines_var;
        if (chosen_var.type == 'int') {
          cell_tag.innerHTML = std_opts_input_number_tag(prefix);
          opt_tags[cur_opt.determines_var] = document.getElementById(prefix + '_tag');
          if (cur_node.options[opt_name] == opt_tags[opt_name].value) {
            opt_tags[cur_opt.determines_var].value = cur_node.options[cur_opt.determines_var];
          }
          else {
            opt_tags[cur_opt.determines_var].value = '0';
          }
          opt_tags[cur_opt.determines_var].onchange = gen_tag_onchange(cur_node, opt_tags, cur_opt.determines_var, opts);
          opt_tags[cur_opt.determines_var].onchange();
        }
        else if (chosen_var.type == 'float') {
          cell_tag.innerHTML = std_opts_input_float_tag(prefix);
          opt_tags[cur_opt.determines_var] = document.getElementById(prefix + '_tag');
          if (cur_node.options[opt_name] == opt_tags[opt_name].value) {
            opt_tags[cur_opt.determines_var].value = cur_node.options[cur_opt.determines_var];
          }
          else {
            opt_tags[cur_opt.determines_var].value = '0';
          }
          opt_tags[cur_opt.determines_var].onchange = gen_tag_onchange(cur_node, opt_tags, cur_opt.determines_var, opts);
          opt_tags[cur_opt.determines_var].onchange();
        }
        else if (chosen_var.type == 'bool') {
          var bool_opt_html = std_opts_select_tag(prefix) +
            std_opts_option_tag(prefix, 'true', 'True') +
            std_opts_option_tag(prefix, 'false', 'False') +
          '</select>';
          cell_tag.innerHTML = bool_opt_html;
          opt_tags[cur_opt.determines_var] = document.getElementById(prefix + '_tag');
          if (cur_node.options[opt_name] == opt_tags[opt_name].value) {
            opt_tags[cur_opt.determines_var].value = cur_node.options[cur_opt.determines_var];
          }
          else {
            opt_tags[cur_opt.determines_var].value = 'true';
          }
          opt_tags[cur_opt.determines_var].onchange = gen_tag_onchange(cur_node, opt_tags, cur_opt.determines_var, opts);
          opt_tags[cur_opt.determines_var].onchange();
        }
        else if (chosen_var.type == 'char') {
          cell_tag.innerHTML = std_opts_input_letter_tag(prefix);
          opt_tags[cur_opt.determines_var] = document.getElementById(prefix + '_tag');
          if (cur_node.options[opt_name] == opt_tags[opt_name].value) {
            opt_tags[cur_opt.determines_var].value = cur_node.options[cur_opt.determines_var];
          }
          else {
            opt_tags[cur_opt.determines_var].value = 'c';
          }
          opt_tags[cur_opt.determines_var].onchange = gen_tag_onchange(cur_node, opt_tags, cur_opt.determines_var, opts);
          opt_tags[cur_opt.determines_var].onchange();
        }
        else {
          // Meh.
          cell_tag.innerHTML = '';
        }
      }
    }

    // (Actually change the value.)
    cur_node.options[opt_name] = opt_tags[opt_name].value;
  };
};

// Generate the 'onchange' function for a text input which
// should update a uniquely-named field.
var gen_name_def_tag_onchange = function(cur_node, tag, opt_name, cur_opt) {
  return function() {
    cur_node.options[cur_opt.def_backup] = tag.value;
    var defs_type = cur_opt.def_type;
    if (defs_type == 'labels') {
      cur_node.options[opt_name] = update_label_names(cur_node.options[opt_name], cur_node.options[cur_opt.def_backup]);
    }
    else if (defs_type == 'variables') {
      cur_node.options[opt_name] = update_var_names(cur_node.options[opt_name], cur_node.options[cur_opt.def_backup]);
      refresh_defined_vars();
    }
    else {
      // Eh, screw it.
      console.log("Warning: unsure of what is being defined with " + opt_name + ".\n");
      cur_node.options[opt_name] = tag.value;
    }
  };
};

var gen_hide_show_onchange = function(cur_node, opt_tags, opt_name, cur_opt) {
  return function() {
    cur_node.options[opt_name] = opt_tags[opt_name].value;
    // Check the 'hide_on' and 'display_on' arrays for each
    // 'hides' option.
    for (var h_opt_ind in cur_opt.hides) {
      var should_hide = false;
      var should_show = false;
      var hide_opt = cur_opt.hides[h_opt_ind];
      for (var h_ind in hide_opt.hide_on) {
        if (hide_opt.hide_on[h_ind] == opt_tags[opt_name].value) {
          should_hide = true;
        }
      }
      for (var h_ind in hide_opt.display_on) {
        if (hide_opt.display_on[h_ind] == opt_tags[opt_name].value) {
          should_show = true;
        }
      }
      if (should_hide && !should_show) {
        // Hide the referenced opt.
        if (opt_tags[hide_opt.opt + '_row']) {
          opt_tags[hide_opt.opt + '_row'].hidden = true;
        }
        else {
          opt_tags[hide_opt.opt].hidden = true;
        }
      }
      else if (should_show && !should_hide) {
        // Show the referenced opt.
        if (opt_tags[hide_opt.opt + '_row']) {
          opt_tags[hide_opt.opt + '_row'].hidden = false;
        }
        else {
          opt_tags[hide_opt.opt].hidden = false;
        }
      }
      else {
        // Bad state; do nothing?
      }
    }
  };
};

var gen_type_listener_func = function(cur_type) {
  return function(cur_node) {
    var cur_type_prefix = cur_type.base_name + '_options';
    var opt_tags = {};
    // (First pass: fetch all relevant option HTML tags.)
    // (TODO: Make this a separate method?)
    for (var opt_name in cur_type.options) {
      var cur_opt = cur_type.options[opt_name];
      var tag_prefix = cur_type_prefix + '_' + opt_name;
      if (cur_opt.type == 'select' ||
          cur_opt.type == 'input_number' ||
          cur_opt.type == 'input_text' ||
          cur_opt.type == 'input_text_def') {
        opt_tags[opt_name] = document.getElementById(tag_prefix + '_tag');
        opt_tags[opt_name + '_row'] = document.getElementById(tag_prefix + '_row_tag');
      }
      else if (cur_opt.type == 'rcc_select') {
        opt_tags[opt_name] = document.getElementById(tag_prefix + '_periph_clocks_tag');
        opt_tags[opt_name + '_row'] = document.getElementById(tag_prefix + '_periph_clocks_row_tag');
        // Figure out what chip type is being used.
        // TODO: Move to its own method?
        var chip_type = null;
        for (var fsm_ind in fsm_nodes) {
          var c_node = fsm_nodes[fsm_ind];
          if (c_node && c_node.node_type == 'Boot') {
            chip_type = c_node.options.chip_type;
            break;
          }
        }
        var periph_clocks = {};
        if (chip_type == 'STM32F030F4' || chip_type == 'STM32F031F6') {
          periph_clocks = rcc_opts.STM32F03xFx;
          var select_tag_html = '';
          for (var periph_val in periph_clocks) {
            select_tag_html += `
              <option value="` + periph_val + `" class="` + tag_prefix + `_periph_clocks_option">` + periph_clocks[periph_val] + `</option>
            `;
          }
          opt_tags[opt_name].innerHTML = select_tag_html;
        }
      }
      else if (cur_opt.type == 'defined_label_select') {
        opt_tags[opt_name] = document.getElementById(tag_prefix + '_label_list_tag');
        opt_tags[opt_name + '_row'] = document.getElementById(tag_prefix + '_label_list_row_tag');
        // Populate the dropdown select menu with currently-defined label names. TODO: New method?
        var sel_html_opts = '';
        for (var index in fsm_nodes) {
          var p_node = fsm_nodes[index];
          if (p_node && p_node.options && p_node.node_type == 'Label') {
            var sel_text = '';
            var any_selected = false;
            if (p_node.options.label_name && p_node.options.label_name != '') {
              if (cur_node.options && cur_node.options[opt_name] == p_node.options.label_name) {
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
        opt_tags[opt_name].innerHTML = sel_html_opts;
      }
      else if (cur_opt.type == 'defined_var_select') {
        opt_tags[opt_name] = document.getElementById(tag_prefix + '_var_list_tag');
        opt_tags[opt_name + '_row'] = document.getElementById(tag_prefix + '_var_list_row_tag');
        populate_defined_vars_dropdown(tag_prefix + '_var_list_tag', cur_node, cur_node.options[opt_name]);
      }
      else if (cur_opt.type == 'TBD' ||
               cur_opt.type == 'TBD_Var') {
        opt_tags[opt_name + '_row'] = document.getElementById(tag_prefix + '_row_tag');
        opt_tags[opt_name + '_cell'] = document.getElementById(tag_prefix + '_cell');
      }
    }
    // (Second pass: Apply listeners to each tag.)
    for (var opt_name in cur_type.options) {
      var cur_opt = cur_type.options[opt_name];
      // Add HTML options listeners depending on the type,
      // and any other options or node-specific stuff.
      if (cur_opt.type == 'select' ||
          cur_opt.type == 'rcc_select' ||
          cur_opt.type == 'input_number' ||
          cur_opt.type == 'input_text' ||
          cur_opt.type == 'defined_var_select' ||
          cur_opt.type == 'defined_label_select') {
        // For now, just simple 'fetch/save' logic.
        if (cur_node.options[opt_name]) {
          opt_tags[opt_name].value = cur_node.options[opt_name];
        }
        if (cur_opt.hides) {
          opt_tags[opt_name].onchange = gen_hide_show_onchange(cur_node, opt_tags, opt_name, cur_opt);
          opt_tags[opt_name].onchange();
        }
        else {
          opt_tags[opt_name].onchange = gen_tag_onchange(cur_node, opt_tags, opt_name, cur_type.options);
          opt_tags[opt_name].onchange();
        }
      }
      else if (cur_opt.type == 'input_text_def') {
        // An input whose value represents a unique identifier.
        // It should not save or apply a new value if the string
        // is already used by another node, and it should
        // update references pointing to it when its
        // name is successfully changed.
        if (cur_node.options[opt_name]) {
          opt_tags[opt_name].value = cur_node.options[opt_name];
        }
        opt_tags[opt_name].onchange = gen_name_def_tag_onchange(cur_node, opt_tags[opt_name], opt_name, cur_opt);
        opt_tags[opt_name].onchange();
      }
      else if (cur_opt.type == 'TBD' ||
               cur_opt.type == 'TBD_Var') {
        // An input whose type depends on another tag's value,
        // or on the type of a selected variable.
        // Its listeners should actually get set up by the
        // linked option.
      }
      else if (cur_opt.type == 'background') {
        // A 'background' option. Currently, this means that
        // it should have no input field at all.
      }
    }
  };
};

var gen_options_listeners_for_types = function() {
  for (var tn_ind in tool_node_types) {
    tool_node_types[tn_ind].options_gen_listeners =
      gen_type_listener_func(tool_node_types[tn_ind]);
  }
};
