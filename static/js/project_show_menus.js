check_selected_menu_tool = function() {
  var menu_tool_selected = false;
  for (var tn_ind in tool_node_types) {
    var cur_type = tool_node_types[tn_ind];
    if (cur_type) {
      if (selected_menu_tool == cur_type.menu_name &&
          loaded_textures[cur_type.base_name]) {
        cur_tool_node_tex = loaded_textures[cur_type.base_name];
        cur_tool_node_type = cur_type.base_name;
        cur_tool_node_color = cur_type.node_color;
        menu_tool_selected = true;
        break;
      }
    }
  }
  // Ensure a match; otherwise, no texture.
  if (!menu_tool_selected) {
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
var apply_selected_node_option_listeners = function(type_node) {
  var type = type_node.node_type; // hehe
  // 'Global' nodes have no I/O connections table.
  if (type != 'New_Variable') {
    // A 'branching' node has 1-many inputs and 2 outputs.
    if (type == 'Check_Truthy' ||
        type == 'Check_Equals') {
      apply_branching_node_io_table_listeners(type);
    }
    // A 'standard' node has 1-many inputs and 1 output.
    else {
      apply_node_io_table_listeners(type);
    }
  }

  for (var tn_ind in tool_node_types) {
    var cur_type = tool_node_types[tn_ind];
    if (cur_type) {
      if (type == cur_type.base_name) {
        cur_type.options_listeners(type_node);
        break;
      }
    }
  }
};

var default_options_for_type = function(type) {
  for (var tn_ind in tool_node_types) {
    var cur_type = tool_node_types[tn_ind];
    if (cur_type) {
      if (type == cur_type.base_name) {
        return JSON.parse(JSON.stringify(cur_type.default_options));
      }
    }
  }
  return {};
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

// Common methods for 'apply node options listeners' methods.
var populate_defined_vars_dropdown = function(sel_id, cur_node, set_name) {
  var var_name_tag = document.getElementById(sel_id);
  // Populate the dropdown select menu with currently-defined variables.
  var sel_html_opts = '';
  var var_defined = false;
  for (var var_name in defined_vars) {
    var var_def = defined_vars[var_name];
    var selected_val = '';
    if (set_name == var_name) {
      var_defined = true;
      selected_val = 'selected="true" ';
    }
    sel_html_opts += `
      <option ` + selected_val + `value="` + var_def.name + `" id="set_var_options_var_list_` + var_def.name + `" class="set_var_options_var_list_option">
        ` + var_def.name + `
      </option>
    `;
  }
  if (var_defined) { sel_text = ''; }
  else { sel_text = 'selected="true"'; }
  sel_html_opts = `
    <option value="(None)" ` + sel_text + ` id="set_var_options_var_list_n/a" class="set_var_options_var_list_option">
      (None defined)
    </option>
  ` + sel_html_opts;
  var_name_tag.innerHTML = sel_html_opts;
};
