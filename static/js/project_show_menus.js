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

var refresh_selected_menu_tool = function() {
  var menu_tool_selected = check_selected_menu_tool();
  // If there is a texture for the selection, find its grid coord.
  // (So, x/y coordinates / 64. (or whatever dot distance if it changes)
  if (menu_tool_selected) {
    var half_grid = 32;
    if (cur_fsm_x+cur_fsm_mouse_x < 0) { half_grid = -32; }
    cur_tool_node_grid_x = parseInt((cur_fsm_x+cur_fsm_mouse_x+half_grid)/64);
    if (cur_fsm_y+cur_fsm_mouse_y < 0) { half_grid = -32; }
    else { half_grid = 32; }
    cur_tool_node_grid_y = parseInt((cur_fsm_y+cur_fsm_mouse_y+half_grid)/64);
  }
};
