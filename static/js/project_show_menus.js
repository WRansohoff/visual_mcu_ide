check_selected_menu_tool = function() {
  var menu_tool_selected = false;
  // 'Boot' node.
  if (selected_menu_tool == 'Boot' && loaded_textures['Boot']) {
    cur_tool_node_tex = loaded_textures['Boot'];
    cur_tool_node_type = 'Boot';
    cur_tool_node_color = 'green';
    menu_tool_selected = true;
  }
  // 'Label' node.
  else if (selected_menu_tool == 'Label' && loaded_textures['Label']) {
    cur_tool_node_tex = loaded_textures['Label'];
    cur_tool_node_type = 'Label';
    cur_tool_node_color = 'pink';
    menu_tool_selected = true;
  }
  // 'Jump' node.
  else if (selected_menu_tool == 'Jump' && loaded_textures['Jump']) {
    cur_tool_node_tex = loaded_textures['Jump'];
    cur_tool_node_type = 'Jump';
    cur_tool_node_color = 'pink';
    menu_tool_selected = true;
  }
  // 'Delay' node.
  else if (selected_menu_tool == 'Delay' && loaded_textures['Delay']) {
    cur_tool_node_tex = loaded_textures['Delay'];
    cur_tool_node_type = 'Delay';
    cur_tool_node_color = 'blue';
    menu_tool_selected = true;
  }
  // 'GPIO Init' node; setup a GPIO pin.
  else if (selected_menu_tool == 'Setup GPIO Pin' && loaded_textures['GPIO_Init']) {
    cur_tool_node_tex = loaded_textures['GPIO_Init'];
    cur_tool_node_type = 'GPIO_Init';
    cur_tool_node_color = 'green';
    menu_tool_selected = true;
  }
  // 'GPIO Output' node; set a previously-setup GPIO output pin to 0 or 1.
  else if (selected_menu_tool == 'Write Output Pin' && loaded_textures['GPIO_Output']) {
    cur_tool_node_tex = loaded_textures['GPIO_Output'];
    cur_tool_node_type = 'GPIO_Output';
    cur_tool_node_color = 'blue';
    menu_tool_selected = true;
  }
  // 'RCC Enable' node; enable a peripheral clock.
  else if (selected_menu_tool == 'Enable Peripheral Clock' && loaded_textures['RCC_Enable']) {
    cur_tool_node_tex = loaded_textures['RCC_Enable'];
    cur_tool_node_type = 'RCC_Enable';
    cur_tool_node_color = 'green';
    menu_tool_selected = true;
  }
  // 'RCC Disable' node; turn off a peripheral clock.
  else if (selected_menu_tool == 'Disable Peripheral Clock' && loaded_textures['RCC_Disable']) {
    cur_tool_node_tex = loaded_textures['RCC_Disable'];
    cur_tool_node_type = 'RCC_Disable';
    cur_tool_node_color = 'pink';
    menu_tool_selected = true;
  }
  // 'New variable' node; define a variable. It's not 'new' as in
  // 'malloc', the C equivalent is just defining a variable in a
  // scope higher than the 'main' function. A 'global'
  else if (selected_menu_tool == 'Define Variable' && loaded_textures['New_Variable']) {
    cur_tool_node_tex = loaded_textures['New_Variable'];
    cur_tool_node_type = 'New_Variable';
    cur_tool_node_color = 'green';
    menu_tool_selected = true;
  }
  // 'Set variable' node; set a variable which was previously defined
  // with a 'Define Variable' node. TODO: support multiple variable scopes.
  // But that's a pretty long-term goal.
  else if (selected_menu_tool == 'Set Variable' && loaded_textures['Set_Variable']) {
    cur_tool_node_tex = loaded_textures['Set_Variable'];
    cur_tool_node_type = 'Set_Variable';
    cur_tool_node_color = 'blue';
    menu_tool_selected = true;
  }
  // 'Variable modification' nodes; for now, just add a 'logic not'
  // node for testing the concept with a simple 'blink' example.
  // TODO: others.
  else if (selected_menu_tool == 'Logical Not' && loaded_textures['Set_Var_Logic_Not']) {
    cur_tool_node_tex = loaded_textures['Set_Var_Logic_Not'];
    cur_tool_node_type = 'Set_Var_Logic_Not';
    cur_tool_node_color = 'blue';
    menu_tool_selected = true;
  }
  // 'No-op' node; do nothing.
  else if (selected_menu_tool == 'No-op (Do Nothing)' && loaded_textures['Nop_Node']) {
    cur_tool_node_tex = loaded_textures['Nop_Node'];
    cur_tool_node_type = 'Nop_Node';
    cur_tool_node_color = 'blue';
    menu_tool_selected = true;
  }
  // 'Branching' nodes; for now, just add an 'is truth-y?' node to check
  // if a bool is true, an int/float is not 0, or a char is not '' or 0x00.
  else if (selected_menu_tool == 'Is Variable Truth-y?' && loaded_textures['Check_Truthy']) {
    cur_tool_node_tex = loaded_textures['Check_Truthy'];
    cur_tool_node_type = 'Check_Truthy';
    cur_tool_node_color = 'canary';
    menu_tool_selected = true;
  }
  // No match.
  else {
    cur_tool_node_tex = -1;
  }
  return menu_tool_selected;
};

/*
 * Additional listeners for options panels.
 * These should be applied after filling the 'options' cell with...well, options.
 */
// Common 'connectors' table options.
var apply_node_io_table_listeners = function(node_type) {
  // The 'boot' node is a special type which has no inputs.
  if (node_type == 'Boot') {
    document.getElementById('node_io_options_top_mid_input').hidden = true;
    document.getElementById('node_io_options_mid_left_input').hidden = true;
    document.getElementById('node_io_options_mid_right_input').hidden = true;
    document.getElementById('node_io_options_bot_mid_input').hidden = true;
  }
  // The 'jump' node is a special type which has no outputs.
  if (node_type == 'Jump') {
    document.getElementById('node_io_options_top_mid_output').hidden = true;
    document.getElementById('node_io_options_mid_left_output').hidden = true;
    document.getElementById('node_io_options_mid_right_output').hidden = true;
    document.getElementById('node_io_options_bot_mid_output').hidden = true;
  }
  var cur_node = fsm_nodes[selected_node_id];
  var top_select_tag = document.getElementById('node_io_options_top_sel');
  var left_select_tag = document.getElementById('node_io_options_left_sel');
  var right_select_tag = document.getElementById('node_io_options_right_sel');
  var bot_select_tag = document.getElementById('node_io_options_bot_sel');
  if (cur_node && cur_node.connections) {
    if (cur_node.connections.up == 'input') {
      top_select_tag.value = 'Input';
    }
    else if (cur_node.connections.up == 'output') {
      top_select_tag.value = 'Output';
    }
    if (cur_node.connections.left == 'input') {
      left_select_tag.value = 'Input';
    }
    else if (cur_node.connections.left == 'output') {
      left_select_tag.value = 'Output';
    }
    if (cur_node.connections.right == 'input') {
      right_select_tag.value = 'Input';
    }
    else if (cur_node.connections.right == 'output') {
      right_select_tag.value = 'Output';
    }
    if (cur_node.connections.down == 'input') {
      bot_select_tag.value = 'Input';
    }
    else if (cur_node.connections.down == 'output') {
      bot_select_tag.value = 'Output';
    }
  }
  top_select_tag.onchange = function() {
    if (top_select_tag.value == 'None') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.up = 'none';
      }
    }
    else if (top_select_tag.value == 'Input') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.up = 'input';
      }
    }
    else if (top_select_tag.value == 'Output') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.up = 'output';
        // Only allow one 'output' for non-branch nodes. (TODO: branches)
        if (cur_node.connections.down == 'output') {
          cur_node.connections.down = 'none';
          bot_select_tag.value = 'None';
        }
        if (cur_node.connections.left == 'output') {
          cur_node.connections.left = 'none';
          left_select_tag.value = 'None';
        }
        if (cur_node.connections.right == 'output') {
          cur_node.connections.right = 'none';
          right_select_tag.value = 'None';
        }
      }
    }
    redraw_canvas();
  };
  left_select_tag.onchange = function() {
    if (left_select_tag.value == 'None') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.left = 'none';
      }
    }
    else if (left_select_tag.value == 'Input') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.left = 'input';
      }
    }
    else if (left_select_tag.value == 'Output') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.left = 'output';
        // Only allow one 'output' for non-branch nodes. (TODO: branches)
        if (cur_node.connections.down == 'output') {
          cur_node.connections.down = 'none';
          bot_select_tag.value = 'None';
        }
        if (cur_node.connections.up == 'output') {
          cur_node.connections.up = 'none';
          top_select_tag.value = 'None';
        }
        if (cur_node.connections.right == 'output') {
          cur_node.connections.right = 'none';
          right_select_tag.value = 'None';
        }
      }
    }
    redraw_canvas();
  };
  right_select_tag.onchange = function() {
    if (right_select_tag.value == 'None') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.right = 'none';
      }
    }
    else if (right_select_tag.value == 'Input') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.right = 'input';
      }
    }
    else if (right_select_tag.value == 'Output') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.right = 'output';
        // Only allow one 'output' for non-branch nodes. (TODO: branches)
        if (cur_node.connections.down == 'output') {
          cur_node.connections.down = 'none';
          bot_select_tag.value = 'None';
        }
        if (cur_node.connections.up == 'output') {
          cur_node.connections.up = 'none';
          top_select_tag.value = 'None';
        }
        if (cur_node.connections.left == 'output') {
          cur_node.connections.left = 'none';
          left_select_tag.value = 'None';
        }
      }
    }
    redraw_canvas();
  };
  bot_select_tag.onchange = function() {
    if (bot_select_tag.value == 'None') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.down = 'none';
      }
    }
    else if (bot_select_tag.value == 'Input') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.down = 'input';
      }
    }
    else if (bot_select_tag.value == 'Output') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.down = 'output';
        // Only allow one 'output' for non-branch nodes. (TODO: branches)
        if (cur_node.connections.right == 'output') {
          cur_node.connections.right = 'none';
          right_select_tag.value = 'None';
        }
        if (cur_node.connections.up == 'output') {
          cur_node.connections.up = 'none';
          top_select_tag.value = 'None';
        }
        if (cur_node.connections.left == 'output') {
          cur_node.connections.left = 'none';
          left_select_tag.value = 'None';
        }
      }
    }
    redraw_canvas();
  };
};

var apply_branching_node_io_table_listeners = function(node_type) {
  var cur_node = fsm_nodes[selected_node_id];
  var top_select_tag = document.getElementById('node_io_options_top_sel');
  var left_select_tag = document.getElementById('node_io_options_left_sel');
  var right_select_tag = document.getElementById('node_io_options_right_sel');
  var bot_select_tag = document.getElementById('node_io_options_bot_sel');
  if (cur_node && cur_node.connections) {
    if (cur_node.connections.up == 'input') {
      top_select_tag.value = 'Input';
    }
    else if (cur_node.connections.up == 'output_T') {
      top_select_tag.value = 'Output_True';
    }
    else if (cur_node.connections.up == 'output_F') {
      top_select_tag.value = 'Output_False';
    }
    if (cur_node.connections.left == 'input') {
      left_select_tag.value = 'Input';
    }
    else if (cur_node.connections.left == 'output_T') {
      left_select_tag.value = 'Output_True';
    }
    else if (cur_node.connections.left == 'output_F') {
      left_select_tag.value = 'Output_False';
    }
    if (cur_node.connections.right == 'input') {
      right_select_tag.value = 'Input';
    }
    else if (cur_node.connections.right == 'output_T') {
      right_select_tag.value = 'Output_True';
    }
    else if (cur_node.connections.right == 'output_F') {
      right_select_tag.value = 'Output_False';
    }
    if (cur_node.connections.down == 'input') {
      bot_select_tag.value = 'Input';
    }
    else if (cur_node.connections.down == 'output_T') {
      bot_select_tag.value = 'Output_True';
    }
    else if (cur_node.connections.down == 'output_F') {
      bot_select_tag.value = 'Output_False';
    }
  }
  top_select_tag.onchange = function() {
    if (top_select_tag.value == 'None') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.up = 'none';
      }
    }
    else if (top_select_tag.value == 'Input') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.up = 'input';
      }
    }
    else if (top_select_tag.value == 'Output_True') {
      // Only one of each type of output arrow.
      if (cur_node && cur_node.connections) {
        cur_node.connections.up = 'output_T';
        if (cur_node.connections.down == 'output_T') {
          cur_node.connections.down = 'none';
          bot_select_tag.value = 'None';
        }
        if (cur_node.connections.left == 'output_T') {
          cur_node.connections.left = 'none';
          left_select_tag.value = 'None';
        }
        if (cur_node.connections.right == 'output_T') {
          cur_node.connections.right = 'none';
          right_select_tag.value = 'None';
        }
      }
    }
    else if (top_select_tag.value == 'Output_False') {
      // Only one of each type of output arrow.
      if (cur_node && cur_node.connections) {
        cur_node.connections.up = 'output_F';
        if (cur_node.connections.down == 'output_F') {
          cur_node.connections.down = 'none';
          bot_select_tag.value = 'None';
        }
        if (cur_node.connections.left == 'output_F') {
          cur_node.connections.left = 'none';
          left_select_tag.value = 'None';
        }
        if (cur_node.connections.right == 'output_F') {
          cur_node.connections.right = 'none';
          right_select_tag.value = 'None';
        }
      }
    }
    redraw_canvas();
  };
  left_select_tag.onchange = function() {
    if (left_select_tag.value == 'None') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.left = 'none';
      }
    }
    else if (left_select_tag.value == 'Input') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.left = 'input';
      }
    }
    else if (left_select_tag.value == 'Output_True') {
      // Only one of each type of output arrow.
      if (cur_node && cur_node.connections) {
        cur_node.connections.left = 'output_T';
        if (cur_node.connections.down == 'output_T') {
          cur_node.connections.down = 'none';
          bot_select_tag.value = 'None';
        }
        if (cur_node.connections.up == 'output_T') {
          cur_node.connections.up = 'none';
          up_select_tag.value = 'None';
        }
        if (cur_node.connections.right == 'output_T') {
          cur_node.connections.right = 'none';
          right_select_tag.value = 'None';
        }
      }
    }
    else if (left_select_tag.value == 'Output_False') {
      // Only one of each type of output arrow.
      if (cur_node && cur_node.connections) {
        cur_node.connections.left = 'output_F';
        if (cur_node.connections.down == 'output_F') {
          cur_node.connections.down = 'none';
          bot_select_tag.value = 'None';
        }
        if (cur_node.connections.up == 'output_F') {
          cur_node.connections.up = 'none';
          up_select_tag.value = 'None';
        }
        if (cur_node.connections.right == 'output_F') {
          cur_node.connections.right = 'none';
          right_select_tag.value = 'None';
        }
      }
    }
    redraw_canvas();
  };
  right_select_tag.onchange = function() {
    if (right_select_tag.value == 'None') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.right = 'none';
      }
    }
    else if (right_select_tag.value == 'Input') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.right = 'input';
      }
    }
    else if (right_select_tag.value == 'Output_True') {
      // Only one of each type of output arrow.
      if (cur_node && cur_node.connections) {
        cur_node.connections.right = 'output_T';
        if (cur_node.connections.down == 'output_T') {
          cur_node.connections.down = 'none';
          bot_select_tag.value = 'None';
        }
        if (cur_node.connections.left == 'output_T') {
          cur_node.connections.left = 'none';
          left_select_tag.value = 'None';
        }
        if (cur_node.connections.up == 'output_T') {
          cur_node.connections.up = 'none';
          up_select_tag.value = 'None';
        }
      }
    }
    else if (right_select_tag.value == 'Output_False') {
      // Only one of each type of output arrow.
      if (cur_node && cur_node.connections) {
        cur_node.connections.right = 'output_F';
        if (cur_node.connections.down == 'output_F') {
          cur_node.connections.down = 'none';
          bot_select_tag.value = 'None';
        }
        if (cur_node.connections.left == 'output_F') {
          cur_node.connections.left = 'none';
          left_select_tag.value = 'None';
        }
        if (cur_node.connections.up == 'output_F') {
          cur_node.connections.up = 'none';
          up_select_tag.value = 'None';
        }
      }
    }
    redraw_canvas();
  };
  bot_select_tag.onchange = function() {
    if (bot_select_tag.value == 'None') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.down = 'none';
      }
    }
    else if (bot_select_tag.value == 'Input') {
      if (cur_node && cur_node.connections) {
        cur_node.connections.down = 'input';
      }
    }
    else if (bot_select_tag.value == 'Output_True') {
      // Only one of each type of output arrow.
      if (cur_node && cur_node.connections) {
        cur_node.connections.down = 'output_T';
        if (cur_node.connections.right == 'output_T') {
          cur_node.connections.right = 'none';
          right_select_tag.value = 'None';
        }
        if (cur_node.connections.left == 'output_T') {
          cur_node.connections.left = 'none';
          left_select_tag.value = 'None';
        }
        if (cur_node.connections.up == 'output_T') {
          cur_node.connections.up = 'none';
          up_select_tag.value = 'None';
        }
      }
    }
    else if (bot_select_tag.value == 'Output_False') {
      // Only one of each type of output arrow.
      if (cur_node && cur_node.connections) {
        cur_node.connections.down = 'output_F';
        if (cur_node.connections.right == 'output_F') {
          cur_node.connections.right = 'none';
          right_select_tag.value = 'None';
        }
        if (cur_node.connections.left == 'output_F') {
          cur_node.connections.left = 'none';
          left_select_tag.value = 'None';
        }
        if (cur_node.connections.up == 'output_F') {
          cur_node.connections.up = 'none';
          up_select_tag.value = 'None';
        }
      }
    }
    redraw_canvas();
  };
};

var apply_boot_node_options_listeners = function() {
  var cur_node = fsm_nodes[selected_node_id];
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

var apply_delay_node_options_listeners = function() {
  var cur_node = fsm_nodes[selected_node_id];
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
var apply_label_node_options_listeners = function() {
  var cur_node = fsm_nodes[selected_node_id];
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
var apply_jump_node_options_listeners = function() {
  var cur_node = fsm_nodes[selected_node_id];
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
var apply_rcc_enable_node_options_listeners = function () {
  var cur_node = fsm_nodes[selected_node_id];
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
var apply_rcc_disable_node_options_listeners = function () {
  var cur_node = fsm_nodes[selected_node_id];
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

var apply_gpio_init_options_listeners = function() {
  var cur_node = fsm_nodes[selected_node_id];
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

var apply_gpio_output_options_listeners = function() {
  var cur_node = fsm_nodes[selected_node_id];
  var gpio_bank_tag = document.getElementById('set_gpio_out_options_pin_bank_tag');
  var gpio_pin_tag = document.getElementById('set_gpio_out_options_pin_number_tag');
  var gpio_value_tag = document.getElementById('set_gpio_out_options_value_tag');

  // Set values according to node options.
  if (cur_node.options.gpio_bank) {
    gpio_bank_tag.value = cur_node.options.gpio_bank;
  }
  if (cur_node.options.gpio_pin) {
    gpio_pin_tag.value = cur_node.options.gpio_pin;
  }
  if (cur_node.options.gpio_val) {
    gpio_value_tag.value = 'On';
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
    }
    else {
      cur_node.options.gpio_val = 0;
    }
  }
};

// 'Define New Variable' Global node.
var apply_new_var_node_options_listeners = function() {
  var cur_node = fsm_nodes[selected_node_id];
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
var apply_set_var_node_options_listeners = function() {
  var cur_node = fsm_nodes[selected_node_id];
  var var_name_tag = document.getElementById('set_var_options_var_list_tag');
  // (Needs to be created based on var type.)
  var var_val_tag = null;
  var var_val_cell = document.getElementById('set_var_options_var_new_value_cell');
  // Populate the dropdown select menu with currently-defined variables.
  var sel_html_opts = `
    <option value="(None)" id="set_var_options_var_list_n/a" class="set_var_options_var_list_option">
      (None defined)
    </option>
  `;
  var var_defined = false;
  for (var var_name in defined_vars) {
    var var_def = defined_vars[var_name];
    var selected_val = '';
    if (cur_node.options && cur_node.options.var_name == var_name) {
      var_defined = true;
      selected_val = 'selected="true" ';
    }
    sel_html_opts += `
      <option ` + selected_val + `value="` + var_def.name + `" id="set_var_options_var_list_` + var_def.name + `" class="set_var_options_var_list_option">
        ` + var_def.name + `
      </option>
    `;
  }
  var_name_tag.innerHTML = sel_html_opts;

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
  };
  // Fire the change tag off once for the initial selection.
  var_name_tag.onchange();
};

// No-op node - currently no options, sort of by definition...
var apply_nop_node_options_listeners = function() {
  // Currently none.
};

var apply_check_truthy_options_listeners = function() {
  var cur_node = fsm_nodes[selected_node_id];
  var var_name_tag = document.getElementById('check_truthy_options_var_list_tag');
  var sel_html_opts = `
    <option value="(None)" id="check_truthy_options_var_list_n/a" class="check_truthy_options_var_list_option">
      (None defined)
    </option>
  `;
  var var_defined = false;
  for (var var_name in defined_vars) {
    var var_def = defined_vars[var_name];
    var selected_val = '';
    if (cur_node.options && cur_node.options.var_name == var_name) {
      selected_val = 'selected="true" ';
    }
    sel_html_opts += `
      <option ` + selected_val + `value="` + var_def.name + `" id="check_truthy_options_var_list_` + var_def.name + `" class="set_truthy_options_var_list_option">
        ` + var_def.name + `
      </option>
    `;
  }
  var_name_tag.innerHTML = sel_html_opts;
  var_name_tag.onchange = function() {
    cur_node.options.var_name = var_name_tag.value;
  }
};

// Common 'new node selected' call.
var apply_selected_node_option_listeners = function(node_type) {
  // 'Global' nodes have no I/O connections table.
  if (node_type != 'New_Variable') {
    // A 'branching' node has 1-many inputs and 1-2 outputs.
    if (node_type == 'Check_Truthy') {
      apply_branching_node_io_table_listeners(node_type);
    }
    // A 'standard' node has 1-many inputs and 1 output.
    else {
      apply_node_io_table_listeners(node_type);
    }
  }

  // 'Boot' node.
  if (node_type == 'Boot') {
    apply_boot_node_options_listeners();
  }
  else if (node_type == 'Delay') {
    apply_delay_node_options_listeners();
  }
  else if (node_type == 'Label') {
    apply_label_node_options_listeners();
  }
  else if (node_type == 'Jump') {
    apply_jump_node_options_listeners();
  }
  else if (node_type == 'GPIO_Init') {
    apply_gpio_init_options_listeners();
  }
  else if (node_type == 'GPIO_Output') {
    apply_gpio_output_options_listeners();
  }
  else if (node_type == 'RCC_Enable') {
    apply_rcc_enable_node_options_listeners();
  }
  else if (node_type == 'RCC_Disable') {
    apply_rcc_disable_node_options_listeners();
  }
  else if (node_type == 'New_Variable') {
    apply_new_var_node_options_listeners();
  }
  else if (node_type == 'Set_Variable') {
    apply_set_var_node_options_listeners();
  }
  else if (node_type == 'Nop_Node') {
    apply_nop_node_options_listeners();
  }
  else if (node_type == 'Check_Truthy') {
    apply_check_truthy_options_listeners();
  }
};

var default_options_for_type = function(type) {
  if (type == 'Boot') {
    return {
      chip_type: 'STM32F030F4',
    };
  }
  else if (type == 'Delay') {
    return {
      delay_units: 'cycles',
      delay_value: 0,
    };
  }
  else if (type == 'Label') {
    return {
      label_name: '',
      label_display_name: '',
    };
  }
  else if (type == 'Jump') {
    return {
      label_name: '(None)',
    };
  }
  else if (type == 'GPIO_Init') {
    return {
      gpio_bank: 'GPIOA',
      gpio_pin: 0,
      gpio_func: 'Output',
      gpio_otype: 'Push-Pull',
      gpio_ospeed: 'H',
      gpio_pupdr: 'PU',
    };
  }
  else if (type == 'GPIO_Output') {
    return {
      gpio_bank: 'GPIOA',
      gpio_pin: 0,
      gpio_val: 0,
    };
  }
  else if (type == 'RCC_Enable' || type == 'RCC_Disable') {
    return {
      periph_clock: 'GPIOA',
    };
  }
  else if (type == 'New_Variable') {
    return {
      var_name: '',
      var_display_name: '',
      var_type: 'int',
      var_val: 0,
    };
  }
  else if (type == 'Set_Variable') {
    return {
      var_name: '(None)',
    };
  }
  else if (type == 'Check_Truthy') {
    return {
      var_name: '(None)',
    };
  }
  else {
    return {};
  }
};

