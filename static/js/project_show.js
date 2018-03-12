project_show_onload = function() {
  // Create the 'Texture generation' canvas tag.
  img_gen = document.createElement("canvas").getContext("2d");

  init_fsm_layout_canvas();
  // Generate 'options' HTML and js listeners
  gen_options_html_for_types();
  gen_options_listeners_for_types();

  // Calculate number of images to load. Since they're string-keyed.
  for (var key in imgs_to_load) {
    if (imgs_to_load[key]) {
      num_imgs += 1;
    }
  }

  // TODO: Geez javascript, be more asynchronous...
  var interval_id = setInterval(function() {
    // TODO: Constant for number of images to load.
    if (imgs_loaded == num_imgs) {
      // Load the initial program.
      fsm_nodes = node_array_from_json(loaded_fsm_nodes);
      refresh_defined_vars();
      redraw_canvas();
      clearInterval(interval_id);
    }
  }, 50);

  // Input handling from HTML GUI.
  // Main 'tool select' buttons.
  var pointer_tool_btn = document.getElementById("pointer_tool_select");
  pointer_tool_btn.addEventListener('click', function(e) {
    selected_tool = 'pointer';
    // Update stylings.
    $("#pointer_tool_select").removeClass("btn-primary");
    $("#pointer_tool_select").addClass("btn-success");
    $("#pan_tool_select").addClass("btn-primary");
    $("#pan_tool_select").removeClass("btn-success");
    $("#tool_tool_select").addClass("btn-primary");
    $("#tool_tool_select").removeClass("btn-success");
    $("#move_tool_select").addClass("btn-primary");
    $("#move_tool_select").removeClass("btn-success");
    $("#delete_tool_select").addClass("btn-primary");
    $("#delete_tool_select").removeClass("btn-success");
    $("#fsm_canvas_div").addClass("hobb_layout_pointer_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_pan_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_pan_tool_down");
    $("#fsm_canvas_div").removeClass("hobb_layout_tool_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_move_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_move_tool_grabbed");
    $("#fsm_canvas_div").removeClass("hobb_layout_delete_tool");
    last_pan_mouse_x = -1;
    last_pan_mouse_y = -1;
    cur_fsm_mouse_x = 0;
    cur_fsm_mouse_y = 0;
    move_grabbed_node_id = -1;
    redraw_canvas();
  });
  document.getElementById("pan_tool_select").addEventListener("click", function(e) {
    selected_tool = 'pan';
    // Update stylings.
    $("#pan_tool_select").removeClass("btn-primary");
    $("#pan_tool_select").addClass("btn-success");
    $("#pointer_tool_select").addClass("btn-primary");
    $("#pointer_tool_select").removeClass("btn-success");
    $("#tool_tool_select").addClass("btn-primary");
    $("#tool_tool_select").removeClass("btn-success");
    $("#move_tool_select").addClass("btn-primary");
    $("#move_tool_select").removeClass("btn-success");
    $("#delete_tool_select").addClass("btn-primary");
    $("#delete_tool_select").removeClass("btn-success");
    $("#fsm_canvas_div").removeClass("hobb_layout_pointer_tool");
    $("#fsm_canvas_div").addClass("hobb_layout_pan_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_pan_tool_down");
    $("#fsm_canvas_div").removeClass("hobb_layout_tool_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_move_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_move_tool_grabbed");
    $("#fsm_canvas_div").removeClass("hobb_layout_delete_tool");
    last_pan_mouse_x = -1;
    last_pan_mouse_y = -1;
    cur_fsm_mouse_x = 0;
    cur_fsm_mouse_y = 0;
    move_grabbed_node_id = -1;
    redraw_canvas();
  });
  document.getElementById("tool_tool_select").addEventListener("click", function(e) {
    selected_tool = 'tool';
    // Update stylings.
    $("#tool_tool_select").removeClass("btn-primary");
    $("#tool_tool_select").addClass("btn-success");
    $("#pan_tool_select").addClass("btn-primary");
    $("#pan_tool_select").removeClass("btn-success");
    $("#pointer_tool_select").addClass("btn-primary");
    $("#pointer_tool_select").removeClass("btn-success");
    $("#move_tool_select").addClass("btn-primary");
    $("#move_tool_select").removeClass("btn-success");
    $("#delete_tool_select").addClass("btn-primary");
    $("#delete_tool_select").removeClass("btn-success");
    $("#fsm_canvas_div").removeClass("hobb_layout_pointer_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_pan_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_pan_tool_down");
    $("#fsm_canvas_div").addClass("hobb_layout_tool_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_move_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_move_tool_grabbed");
    $("#fsm_canvas_div").removeClass("hobb_layout_delete_tool");
    last_pan_mouse_x = -1;
    last_pan_mouse_y = -1;
    cur_fsm_mouse_x = 0;
    cur_fsm_mouse_y = 0;
    move_grabbed_node_id = -1;
    refresh_selected_menu_tool();
    redraw_canvas();
  });
  document.getElementById("move_tool_select").addEventListener("click", function(e) {
    selected_tool = 'move';
    // Update stylings.
    $("#tool_tool_select").addClass("btn-primary");
    $("#tool_tool_select").removeClass("btn-success");
    $("#pan_tool_select").addClass("btn-primary");
    $("#pan_tool_select").removeClass("btn-success");
    $("#pointer_tool_select").addClass("btn-primary");
    $("#pointer_tool_select").removeClass("btn-success");
    $("#move_tool_select").removeClass("btn-primary");
    $("#move_tool_select").addClass("btn-success");
    $("#delete_tool_select").addClass("btn-primary");
    $("#delete_tool_select").removeClass("btn-success");
    $("#fsm_canvas_div").removeClass("hobb_layout_pointer_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_pan_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_pan_tool_down");
    $("#fsm_canvas_div").removeClass("hobb_layout_tool_tool");
    $("#fsm_canvas_div").addClass("hobb_layout_move_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_move_tool_grabbed");
    $("#fsm_canvas_div").removeClass("hobb_layout_delete_tool");
    last_pan_mouse_x = -1;
    last_pan_mouse_y = -1;
    cur_fsm_mouse_x = 0;
    cur_fsm_mouse_y = 0;
    move_grabbed_node_id = -1;
    redraw_canvas();
  });
  document.getElementById("delete_tool_select").addEventListener("click", function(e) {
    selected_tool = 'delete';
    // Update stylings.
    $("#tool_tool_select").addClass("btn-primary");
    $("#tool_tool_select").removeClass("btn-success");
    $("#pan_tool_select").addClass("btn-primary");
    $("#pan_tool_select").removeClass("btn-success");
    $("#pointer_tool_select").addClass("btn-primary");
    $("#pointer_tool_select").removeClass("btn-success");
    $("#move_tool_select").addClass("btn-primary");
    $("#move_tool_select").removeClass("btn-success");
    $("#delete_tool_select").removeClass("btn-primary");
    $("#delete_tool_select").addClass("btn-success");
    $("#fsm_canvas_div").removeClass("hobb_layout_pointer_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_pan_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_pan_tool_down");
    $("#fsm_canvas_div").removeClass("hobb_layout_tool_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_move_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_move_tool_grabbed");
    $("#fsm_canvas_div").addClass("hobb_layout_delete_tool");
    last_pan_mouse_x = -1;
    last_pan_mouse_y = -1;
    cur_fsm_mouse_x = 0;
    cur_fsm_mouse_y = 0;
    move_grabbed_node_id = -1;
    redraw_canvas();
  });

  // Add a global 'resize' event for the whole window.
  document.getElementById("varm_body_tag").onresize = function() {
    // Update uniform values and send to the shader.
    const canvas = document.getElementById("fsm_layout_canvas");
    const canvas_container = document.getElementById("fsm_canvas_div");
    canvas.width = canvas_container.offsetWidth;
    canvas.height = canvas_container.offsetHeight;
    // Re-draw.
    redraw_canvas();
  };

  // Add a 'mouse up' event on the whole window.
  document.getElementById("varm_body_tag").onmouseup = function(e) {
    if (selected_tool == 'pan') {
      is_currently_panning = false;
      $("#fsm_canvas_div").addClass("hobb_layout_pan_tool");
      $("#fsm_canvas_div").removeClass("hobb_layout_pan_tool_down");
      last_pan_mouse_x = -1;
      last_pan_mouse_y = -1;
      // Un-select any text that may have been selected if panning
      // dragged outside of the WebGL window.
      if (document.selected) {
        document.selected.empty();
      }
      else if (window.getSelection()) {
        window.getSelection().removeAllRanges();
      }
    }
  };

  // Add a 'mouse down' event for the FSM webGL div.
  document.getElementById("fsm_canvas_div").onmousedown = function(e) {
    if (selected_tool == 'pan') {
      is_currently_panning = true;
      $("#fsm_canvas_div").removeClass("hobb_layout_pan_tool");
      $("#fsm_canvas_div").addClass("hobb_layout_pan_tool_down");
      last_pan_mouse_x = e.clientX;
      last_pan_mouse_y = e.clientY;
    }
  }

  // Add a 'mouse moved' event on the whole window.
  document.getElementById("varm_body_tag").onmousemove = function(e) {
    if (selected_tool == 'pan' && is_currently_panning) {
      if (last_pan_mouse_x != -1 && last_pan_mouse_y != -1) {
        var diff_x = e.clientX - last_pan_mouse_x;
        var diff_y = e.clientY - last_pan_mouse_y;
        cur_fsm_x += (diff_x * pan_scale_factor);
        cur_fsm_y -= (diff_y * pan_scale_factor);
        var hg_base = zoom_base * cur_zoom;
        cur_fsm_grid_x = parseInt(cur_fsm_x / hg_base);
        cur_fsm_grid_y = parseInt(cur_fsm_y / hg_base);

        // Submit the 'moved' coordinates to the shaders and re-draw.
        redraw_canvas();
        // Debug:
        //document.getElementById("list_current_fsm_coords").innerHTML = ("FSM Co-ords (bottom-left): (" + cur_fsm_x + ", " + cur_fsm_y + ")");
        //document.getElementById("list_current_fsm_grid_coords").innerHTML = ("= Grid Coordinates: (" + cur_fsm_grid_x + ", " + cur_fsm_grid_y + ")");
      }
      last_pan_mouse_x = e.clientX;
      last_pan_mouse_y = e.clientY;
    }
  };

  // Add a 'mouse moved' event on the webGL view. For now, this will just
  // be used for the tool tool, to render the prospective node before
  // placement.
  document.getElementById("fsm_canvas_div").onmousemove = function(e) {
    // Record current mouse dimensions. Use bottom-left as origin,
    // to match the WebGL conventions.
    cur_fsm_mouse_x = e.clientX;
    cur_fsm_mouse_y = e.clientY;
    var canvas_bounding_box = document.getElementById("fsm_canvas_div").getBoundingClientRect();
    cur_fsm_mouse_x -= canvas_bounding_box.left;
    cur_fsm_mouse_y -= canvas_bounding_box.bottom;
    cur_fsm_mouse_x = parseInt(cur_fsm_mouse_x);
    cur_fsm_mouse_y = parseInt(-cur_fsm_mouse_y);

    if (selected_tool == 'tool') {
      refresh_selected_menu_tool();
    }
    // Redraw the canvas.
    redraw_canvas();
  };

  // Add a master 'on click' function for the FSM canvas.
  document.getElementById("fsm_canvas_div").onclick = function(e) {
    if (selected_tool == 'pointer') {
      // Get the grid coordinate closest to the current cursor.
      var hg_base = zoom_base*cur_zoom;
      var half_grid = hg_base/2;
      if (cur_fsm_x+cur_fsm_mouse_x < 0) { half_grid = -(hg_base/2); }
      var cur_node_grid_x = parseInt((cur_fsm_x+cur_fsm_mouse_x+half_grid)/hg_base);
      if (cur_fsm_y+cur_fsm_mouse_y < 0) { half_grid = -(hg_base/2); }
      else { half_grid = hg_base/2; }
      var cur_node_grid_y = parseInt((cur_fsm_y+cur_fsm_mouse_y+half_grid)/hg_base);
      // If there is a node underneath the cursor, select it.
      var selected_node_ind = get_node_ind_at_grid_coords(cur_node_grid_x, cur_node_grid_y);
      if (selected_node_ind) {
        // 'ID' vs 'ind'[ex] - the former is global.
        selected_node_id = selected_node_ind;
        var sel_type = fsm_nodes[selected_node_id].node_type;
        document.getElementById("hobb_options_header").innerHTML = ("Options: (" + sel_type + ", " + fsm_nodes[selected_node_id].pn_index + ")");
        $("hobb_options_content").empty();
        // In/Out connections table. The only case where this
        // won't be added is a 'global' node that affects
        // the entire program. Currently, that is only the
        // 'Define new variable' node.
        var selected_node_options_html = "";
        // Most nodes have input/output connections to other nodes.
        // But 'New Variable' nodes are globally scoped and not part
        // of the program flow.
        if (sel_type != 'New_Variable') {
          // A 'branching' node has 1-many inputs and 1-2 outputs.
          if (sel_type == 'Check_Truthy' ||
              sel_type == 'Check_Equals' ||
              sel_type == 'Check_GT' ||
              sel_type == 'Check_GT_EQ' ||
              sel_type == 'Check_LT' ||
              sel_type == 'Check_LT_EQ') {
            selected_node_options_html += branching_node_io_options_html;
          }
          // A 'standard' node has 1-many inputs and 1 output.
          else {
            selected_node_options_html += node_io_options_html;
          }
        }
        // Type-specific options:
        for (var tn_ind in tool_node_types) {
          var cur_type = tool_node_types[tn_ind];
          if (cur_type) {
            if (sel_type == cur_type.base_name) {
              selected_node_options_html += cur_type.options_gen_html;
              break;
            }
          }
        }
        document.getElementById("hobb_options_content").innerHTML = selected_node_options_html;
        // Apply click listeners.
        apply_selected_node_option_listeners(fsm_nodes[selected_node_ind]);
      }
      else {
        // If not, Deselect.
        selected_node_id = -1;
        document.getElementById("hobb_options_header").innerHTML = ("Options: (None)");
        $("#hobb_options_content").empty();
      }
    }
    else if (selected_tool == 'tool') {
      refresh_selected_menu_tool();
      // Add the current tool node to the list, unless there is a
      // node in the proposed coordinates already.
      var already_populated = false;
      var tool_type = get_node_type_def_by_name(cur_tool_node_type);
      if (tool_type && tool_type.new_gfx) {
        for (check_x = 0; check_x < tool_type.node_w; ++check_x) {
          for (check_y = 0; check_y < tool_type.node_h; ++check_y) {
            var existing_node_id = get_node_ind_at_grid_coords(cur_tool_node_grid_x+check_x, cur_tool_node_grid_y+check_y);
            if (existing_node_id) {
              already_populated = true;
            }
          }
        }
      }
      else {
        var existing_node_id = get_node_ind_at_grid_coords(cur_tool_node_grid_x, cur_tool_node_grid_y);
        if (existing_node_id) {
          already_populated = true;
        }
      }
      for (var node_ind in fsm_nodes) {
        if (fsm_nodes[node_ind]) {
          // Only allow one 'Boot' node. TODO: How to handle this?
          // For now, just don't place any more than one 'Boot' node.
          if (fsm_nodes[node_ind].node_type == 'Boot' &&
              cur_tool_node_type == 'Boot') {
            already_populated = true;
          }
        }
      }
      if (!already_populated) {
        // Place a new node.
        var p_node = [];
        p_node.node_type = cur_tool_node_type;
        p_node.node_status = 0;
        p_node.node_color = cur_tool_node_color;
        p_node.connections = {
          left: 'none',
          right: 'none',
          up: 'none',
          down: 'none',
        };
        p_node.options = default_options_for_type(cur_tool_node_type);
        p_node.grid_coord_x = cur_tool_node_grid_x;
        p_node.grid_coord_y = cur_tool_node_grid_y;
        //p_node.tex_sampler = cur_tool_node_tex;
        p_node.tex_sampler = generate_node_texture(p_node);
        fsm_nodes.push(p_node);
      }

      // Re-draw the canvas to show the placed node.
      redraw_canvas();
    }
    else if (selected_tool == 'delete') {
      var hg_base = zoom_base*cur_zoom;
      var half_grid = hg_base/2;
      if (cur_fsm_x+cur_fsm_mouse_x < 0) { half_grid = -(hg_base/2); }
      var cur_node_grid_x = parseInt((cur_fsm_x+cur_fsm_mouse_x+half_grid)/hg_base);
      if (cur_fsm_y+cur_fsm_mouse_y < 0) { half_grid = -(hg_base/2); }
      else { half_grid = hg_base/2; }
      var cur_node_grid_y = parseInt((cur_fsm_y+cur_fsm_mouse_y+half_grid)/hg_base);
      // If there is a node on the current grid coordinate, delete it.
      var selected_node_ind = get_node_ind_at_grid_coords(cur_node_grid_x, cur_node_grid_y);
      if (selected_node_ind) {
        // (Un-select the node if deleting the current selection.)
        if (selected_node_id == selected_node_ind) {
          selected_node_id = -1;
          document.getElementById("hobb_options_header").innerHTML = ("Options: (None)");
          $("#hobb_options_content").empty();
        }
        fsm_nodes[selected_node_ind] = null;
        // Squash the array of nodes.
        fsm_nodes = fsm_nodes.filter(array_filter_nulls);
        refresh_defined_vars();

        // Re-draw the canvas.
        redraw_canvas();
      }
    }
    else if (selected_tool == 'move') {
      var hg_base = zoom_base*cur_zoom;
      var half_grid = hg_base/2;
      if (cur_fsm_x+cur_fsm_mouse_x < 0) { half_grid = -(hg_base/2); }
      var cur_node_grid_x = parseInt((cur_fsm_x+cur_fsm_mouse_x+half_grid)/hg_base);
      if (cur_fsm_y+cur_fsm_mouse_y < 0) { half_grid = -(hg_base/2); }
      else { half_grid = hg_base/2; }
      var cur_node_grid_y = parseInt((cur_fsm_y+cur_fsm_mouse_y+half_grid)/hg_base);
      // If there is a node on the currently-selected grid node, pick it up.
      var node_to_grab = get_node_ind_at_grid_coords(cur_node_grid_x, cur_node_grid_y);
      if (node_to_grab) {
        move_grabbed_node_id = node_to_grab;
        selected_tool = 'move_grabbed';
        $("#fsm_canvas_div").removeClass("hobb_layout_move_tool");
        $("#fsm_canvas_div").addClass("hobb_layout_move_tool_grabbed");
        // Re-draw the canvas.
        redraw_canvas();
      }
    }
    else if (selected_tool == 'move_grabbed') {
      var hg_base = zoom_base*cur_zoom;
      var half_grid = hg_base/2;
      if (cur_fsm_x+cur_fsm_mouse_x < 0) { half_grid = -(hg_base/2); }
      var cur_node_grid_x = parseInt((cur_fsm_x+cur_fsm_mouse_x+half_grid)/hg_base);
      if (cur_fsm_y+cur_fsm_mouse_y < 0) { half_grid = -(hg_base/2); }
      else { half_grid = hg_base/2; }
      var cur_node_grid_y = parseInt((cur_fsm_y+cur_fsm_mouse_y+half_grid)/hg_base);
      var node_dropped = true;
      if (move_grabbed_node_id >= 0) {
        // If there is a 'grabbed' node, and if the currently-selected
        // grid node is empty, drop the grabbed node. Allow re-dropping
        // a node on the square that it previously occupied.
        var grabbed_node_type = get_node_type_def_by_name(fsm_nodes[move_grabbed_node_id].node_type);
        if (grabbed_node_type && grabbed_node_type.new_gfx) {
          for (check_x = 0; check_x < grabbed_node_type.node_w; ++check_x) {
            for (check_y = 0; check_y < grabbed_node_type.node_h; ++check_y) {
              var existing_node_id = get_node_ind_at_grid_coords(cur_node_grid_x+check_x, cur_node_grid_y+check_y);
              if (existing_node_id && existing_node_id != move_grabbed_node_id) {
                node_dropped = false;
              }
            }
          }
        }
        else {
          var existing_node_id = get_node_ind_at_grid_coords(cur_node_grid_x, cur_node_grid_y);
          if (existing_node_id && existing_node_id != move_grabbed_node_id) {
            node_dropped = false;
          }
        }
      }
      if (node_dropped) {
        if (move_grabbed_node_id >= 0 && fsm_nodes[move_grabbed_node_id]) {
          fsm_nodes[move_grabbed_node_id].grid_coord_x = cur_node_grid_x;
          fsm_nodes[move_grabbed_node_id].grid_coord_y = cur_node_grid_y;
        }
        selected_tool = 'move'
        move_grabbed_node_id = -1;
        $("#fsm_canvas_div").addClass("hobb_layout_move_tool");
        $("#fsm_canvas_div").removeClass("hobb_layout_move_tool_grabbed");
        // Re-draw the canvas.
        redraw_canvas();
      }
    }
  };

  // Add a click listener for the 'save' button/link.
  document.getElementById('save_fsm_project_link').onclick = function() {
    var nodes_string = node_array_to_json(fsm_nodes);
    submit_project_save_request(nodes_string);
  };

  // Add a click listener for the 'precompile' button/link.
  document.getElementById('precompile_button').onclick = function(e) {
    json_fsm_nodes = precompile_project();
    if (json_fsm_nodes) {
      submit_precompile_request(json_fsm_nodes);
    }
  };

  // Add a click listener for the 'compile' button/link.
  document.getElementById('compile_button').onclick = function(e) {
    submit_compile_request();
  };

  // Add a click listener for the 'flash/upload' button/link.
  document.getElementById('flash_button').onclick = function(e) {
    submit_flash_request();
  };

  // TODO: Combine common verify/build code.
  document.getElementById('verify_button').onclick = function(e) {
    build_flow_status = 'None';
    console.log('--- Begin Verify ---');
    var save_check_interval = null;
    var precompile_check_interval = null;
    var compile_check_interval = null;
    // Compile step.
    var compile_check_func = function() {
      if (build_flow_status == 'Compiled') {
        clearInterval(compile_check_interval);
        // Done!
        console.log('--- Project Built! ---');
      }
      else if (build_flow_status == 'Error') {
        clearInterval(compile_check_interval);
        console.log('--- Build Failed :( ---');
      }
    };
    // Precompile step.
    var precomp_check_func = function() {
      if (build_flow_status == 'Precompiled') {
        clearInterval(precompile_check_interval);
        // Start the next step - compilation.
        compile_check_interval = setInterval(compile_check_func, 50);
        submit_compile_request();
      }
      else if (build_flow_status == 'Error') {
        clearInterval(precompile_check_interval);
        console.log('--- Build Failed :( ---');
      }
    };
    // Save step.
    var save_check_func = function() {
      if (build_flow_status == 'Saved') {
        clearInterval(save_check_interval);
        // Start the next step - precompilation.
        precompile_check_interval = setInterval(precomp_check_func, 50);
        var json_fsm_nodes = precompile_project();
        if (json_fsm_nodes) {
          submit_precompile_request(json_fsm_nodes);
        }
        else { build_flow_status = 'Error'; }
      }
      else if (build_flow_status == 'Error') {
        clearInterval(save_check_interval);
        console.log('--- Build Failed :( ---');
      }
    };
    // Kick everything off by saving the project.
    var nodes_string = node_array_to_json(fsm_nodes);
    save_check_interval = setInterval(save_check_func, 50);
    submit_project_save_request(nodes_string);
  };

  document.getElementById('build_button').onclick = function(e) {
    build_flow_status = 'None';
    console.log('--- Start Build ---');
    var save_check_interval = null;
    var precompile_check_interval = null;
    var compile_check_interval = null;
    var flash_check_interval = null;
    // Flash step.
    var flash_check_func = function() {
      if (build_flow_status == 'Uploaded') {
        clearInterval(flash_check_interval);
        // All done!
        console.log('--- Built and Uploaded! ---');
      }
      else if (build_flow_status == 'Error') {
        clearInterval(flash_check_interval);
        console.log('--- Build Success! ---');
      }
    };
    // Compile step.
    var compile_check_func = function() {
      if (build_flow_status == 'Compiled') {
        clearInterval(compile_check_interval);
        // Start the next step - flashing.
        flash_check_interval = setInterval(flash_check_func, 50);
        submit_flash_request();
      }
      else if (build_flow_status == 'Error') {
        clearInterval(compile_check_interval);
        console.log('--- Build Failed :( ---');
      }
    };
    // Precompile step.
    var precomp_check_func = function() {
      if (build_flow_status == 'Precompiled') {
        clearInterval(precompile_check_interval);
        // Start the next step - compilation.
        compile_check_interval = setInterval(compile_check_func, 50);
        submit_compile_request();
      }
      else if (build_flow_status == 'Error') {
        clearInterval(precompile_check_interval);
        console.log('--- Build Failed :( ---');
      }
    };
    // Save step.
    var save_check_func = function() {
      if (build_flow_status == 'Saved') {
        clearInterval(save_check_interval);
        // Start the next step - precompilation.
        precompile_check_interval = setInterval(precomp_check_func, 50);
        var json_fsm_nodes = precompile_project();
        if (json_fsm_nodes) {
          submit_precompile_request(json_fsm_nodes);
        }
        else { build_flow_status = 'Error'; }
      }
      else if (build_flow_status == 'Error') {
        clearInterval(save_check_interval);
        console.log('--- Build Failed :( ---');
      }
    };
    // Kick everything off by saving the project.
    var nodes_string = node_array_to_json(fsm_nodes);
    save_check_interval = setInterval(save_check_func, 50);
    submit_project_save_request(nodes_string);
  };

};

// 'Precompile' the project, and save a .zip file with code and a
// Makefile for use with the arm-none-eabi-gcc toolchain.
var precompile_project = function() {
  // So the basic idea is, we start at the 'Boot' node, and follow
  // the 'output' arrows until all branches reach a previously-
  // visited node.
  // Process 'Define variable' nodes first - for now, variable
  // initialization is all in a 'global' scope.
  // Failure happens if/when:
  //   - No 'Boot' node.
  //   - An 'output' arrow points to grid node without an 'input' arrow.
  //   - A node has no 'output' arrow (except with special node types).
  //   - Multiple 'input' arrows lead away from the grid coordinate
  //     pointed to by an 'output' arrow.
  //   - More than one variable with the same name is defined.
  //   - Hardware interrupts' program flows mix with each other or
  //     the main program. Without scoping, they must remain separate.
  // Produce warning messages if/when (TODO):
  //   - A node will never be reached.
  //   - A defined variable is never used.
  // Otherwise, each 'node' begins with a label, and can be branched to
  // with 'GOTO'. I know that's bad practice for human coders, but it
  // should work for now with simple single-scope auto-generated code.
  // With the addition of segmented hardware interrupts, however, this is
  // beginning to feel complicated. I'd like to look into user-defined
  // nodes which use separate 'grids' and pages/editors. TODO.
  var source_nodes = [];
  source_nodes['Boot'] = null;
  // TODO: Maybe update/use existing 'defined_vars' variable?
  var global_vars = [];
  var pre_pre_process_error = "";
  // First pass through the nodes, to gather variable definitions and
  // make sure that basic conditions are met (exactly one 'Boot' node, etc)
  // For ease of lookup, we will also use this first pass to generate a
  // set of nodes indexed on grid coordinates.
  // One will be [x][y], the other [y][x].
  var grid_nodes_xy = [];
  var grid_nodes_yx = [];
  // Also keep an array of processed nodes and their output[s].
  var program_nodes = [];
  for (var node_index in fsm_nodes) {
    if (fsm_nodes[node_index]) {
      cur_node = fsm_nodes[node_index];
      // Insert the node into the 'indexed-by-grid coordinates' structure.
      if (!grid_nodes_xy[cur_node.grid_coord_x]) {
        grid_nodes_xy[cur_node.grid_coord_x] = [];
      }
      if (!grid_nodes_yx[cur_node.grid_coord_y]) {
        grid_nodes_yx[cur_node.grid_coord_y] = [];
      }
      if (grid_nodes_xy[cur_node.grid_coord_x][cur_node.grid_coord_y] ||
          grid_nodes_yx[cur_node.grid_coord_y][cur_node.grid_coord_x]) {
        pre_pre_process_error += "Error: Multiple nodes on the same grid coordinate: (" + cur_node.grid_coord_x + ", " + cur_node.grid_coord_y + ").\n";
      }
      // (Store both the node and info about its 'program_node' location.)
      var prog_node_ind = program_nodes.length;
      grid_nodes_xy[cur_node.grid_coord_x][cur_node.grid_coord_y] = cur_node;
      grid_nodes_xy[cur_node.grid_coord_x][cur_node.grid_coord_y].pn_index = prog_node_ind;
      grid_nodes_yx[cur_node.grid_coord_y][cur_node.grid_coord_x] = cur_node;
      grid_nodes_yx[cur_node.grid_coord_y][cur_node.grid_coord_x].pn_index = prog_node_ind;
      cur_node.pn_index = prog_node_ind;
      // Insert the node's information (minus 'output[s]') into the
      // JSON object to send to the controller action.
      // Do not add 'No-op', 'Label', or 'Jump' nodes.
      if (cur_node.node_type != 'Nop_Node' &&
          cur_node.node_type != 'Label' &&
          cur_node.node_type != 'Jump') {
        var start_dest = 'none';
        if (cur_node.node_type == 'Boot') {
          start_dest = 'main';
        }
        else if (cur_node.node_type == 'Interrupt' &&
                 cur_node.options.interrupt_chan) {
          start_dest = cur_node.options.interrupt_chan;
        }
        program_nodes.push({
          node_ind: prog_node_ind,
          node_type: cur_node.node_type,
          grid_coord_x: cur_node.grid_coord_x,
          grid_coord_y: cur_node.grid_coord_y,
          code_destination: start_dest,
          options: cur_node.options,
        });
      }
      // Specific logic for individual node types.
      if (cur_node.node_type == 'New_Variable') {
        global_vars.push({
          var_name: cur_node.options.var_name,
          var_type: cur_node.options.var_type,
          var_val: cur_node.options.var_val,
        });
        // Global variable definition. TODO.
      }
      else if (cur_node.node_type == 'Boot' ||
               cur_node.node_type == 'Interrupt') {
        // 'Boot' node. There should only be one of these.
        // This behavior is also shared by 'Enter Interrupt'
        // nodes.
        var node_ind = cur_node.node_type;
        if (node_ind == 'Interrupt') {
          node_ind = node_ind + '_' + cur_node.options.interrupt_chan;
        }
        if (source_nodes[node_ind]) {
          pre_pre_process_error += "Error: More than one '" + node_ind + "' node defined. There can only be one '" + node_ind + "' node,";
          if (node_ind == 'Boot') {
            pre_pre_process_error += " where the program starts.\n";
          }
          else {
            pre_pre_process_error += " where the hardware interrupt starts.\n";
          }
        }
        else {
          source_nodes[node_ind] = grid_nodes_xy[cur_node.grid_coord_x][cur_node.grid_coord_y];
        }
      }
    }
  }
  if (!source_nodes['Boot']) {
    pre_pre_process_error += "Error: No 'Boot' node - the program has no starting point.\n";
  }

  // First pass is complete. Now, start at the boot node and process the
  // output path. As we proceed from node to node, store the nodes which
  // we have previously visited. When we reach an already-visited node,
  // we are done. If we run into an error condition, we can stop early.
  // In the future, when I add branching, this process will break off
  // into multiple subprocesses at branch points, each of which must
  // complete cleanly on its own.
  if (!pre_pre_process_error) {
    // Now, enter the main node processing loop.
    // TODO: One entry per source node?
    var cur_proc_node = source_nodes['Boot'];
    var visited_nodes = [];
    visited_nodes["("+cur_proc_node.grid_coord_x+","+cur_proc_node.grid_coord_y+")"] = true;
    var done_processing = false;
    var remaining_branches = [cur_proc_node];
    for (var source_ind in source_nodes) {
      if (source_ind != 'Boot') {
        var s_node = source_nodes[source_ind];
        var s_dest = program_nodes[s_node.pn_index].code_destination;
        if (s_dest && s_dest != 'none') {
          visited_nodes["("+s_node.grid_coord_x+","+s_node.grid_coord_y+")"] = true;
          remaining_branches.push(s_node);
        }
      }
    }
    // In-scope method for finding the next node in a chain;
    // it assumes that it will not operate on branching nodes.
    // Currently used for cleanly removing 'no-op' nodes.
    // Input: Current 'next node' (no-op node)
    // Output: The next node in the chain, or false-y if failed.
    var find_next_input_node = function(cur_input_node) {
      var grid_x = cur_input_node.grid_coord_x;
      var grid_y = cur_input_node.grid_coord_y;
      if (cur_input_node.connections) {
        if (cur_input_node.connections.up == 'output') {
          grid_y += 1;
        }
        else if (cur_input_node.connections.down == 'output') {
          grid_y -= 1;
        }
        else if (cur_input_node.connections.left == 'output') {
          grid_x -= 1;
        }
        else if (cur_input_node.connections.right == 'output') {
          grid_x += 1;
        }
        else {
          // Special case: 'End Interrupt' nodes terminate
          // a hardware interrupt flow, and don't have outputs.
          if (cur_input_node.node_type == 'Interrupt_End') {
            return true;
          }
          else {
            pre_pre_process_error += "Error: Node at (" + grid_x + ", " + grid_y + ") has no 'output' connection.\n";
          return false;
          }
        }
        var next_node = find_input_node(grid_x, grid_y);
        if (!next_node) {
          pre_pre_process_error += "Error: Grid coordinate (" + grid_x + ", " + grid_y + ") does not point to any 'input' arrows. If an output is pointing directly at a node, move that node over and give it an 'input' arrow.\n";
          return false;
        }
        return next_node;
      }
      else {
        pre_pre_process_error += "Error: Grid coordinate (" + grid_x + ", " + grid_y + ") does not have a 'connections' table.\n";
        return false;
      }
    };
    // In-scope method for finding a 'next node' from a given
    // 'output' connection grid coordinate.
    // Input: (x, y) coordinates to look for an 'input' connection at.
    // Output: 'next_node' if one was found, false-y otherwise.
    var find_input_node = function(grid_x, grid_y) {
      // Find any nodes which have 'input' arrows originating from
      // the current grid coordinate. There should be exactly one.
      // If there are 0 or >1, error.
      var next_node = null;
      // 'Left'
      var temp_node = null;
      var temp_grid = grid_nodes_xy[grid_x-1];
      if (temp_grid) {
        temp_node = temp_grid[grid_y];
      }
      else { temp_node = null; }
      if (temp_node &&
          temp_node.connections &&
          temp_node.connections.right == 'input') {
        if (!next_node) {
          next_node = temp_node;
        }
        else {
          pre_pre_process_error += "Error: Grid coordinate (" + grid_x + ", " + grid_y + ") points to multiple 'input' arrows. Each 'output' arrow can only lead to one 'input' arrow.\n";
          return false;
        }
      }
      // 'Right'
      temp_grid = grid_nodes_xy[grid_x+1];
      if (temp_grid) {
        temp_node = temp_grid[grid_y];
      }
      else { temp_node = null; }
      if (temp_node &&
          temp_node.connections &&
          temp_node.connections.left == 'input') {
        if (!next_node) {
          next_node = temp_node;
        }
        else {
          pre_pre_process_error += "Error: Grid coordinate (" + grid_x + ", " + grid_y + ") points to multiple 'input' arrows. Each 'output' arrow can only lead to one 'input' arrow.\n";
          return false;
        }
      }
      // 'Up'
      temp_grid = grid_nodes_xy[grid_x];
      if (temp_grid) {
        temp_node = temp_grid[grid_y+1];
      }
      else { temp_node = null; }
      if (temp_node &&
          temp_node.connections &&
          temp_node.connections.down == 'input') {
        if (!next_node) {
          next_node = temp_node;
        }
        else {
          pre_pre_process_error += "Error: Grid coordinate (" + grid_x + ", " + grid_y + ") points to multiple 'input' arrows. Each 'output' arrow can only lead to one 'input' arrow.\n";
          return false;
        }
      }
      // 'Down'
      temp_grid = grid_nodes_xy[grid_x];
      if (temp_grid) {
        temp_node = temp_grid[grid_y-1];
      }
      else { temp_node = null; }
      if (temp_node &&
          temp_node.connections &&
          temp_node.connections.up == 'input') {
        if (!next_node) {
          next_node = temp_node;
        }
        else {
          pre_pre_process_error += "Error: Grid coordinate (" + grid_x + ", " + grid_y + ") points to multiple 'input' arrows. Each 'output' arrow can only lead to one 'input' arrow.\n";
          return false;
        }
      }
      if (!next_node) {
        return false;
      }
      // Skip 'No-op' nodes and follow Jump/Label nodes.
      while (next_node &&
             (next_node.node_type == 'Nop_Node' ||
              next_node.node_type == 'Label' ||
              next_node.node_type == 'Jump')) {
        if (next_node.node_type == 'Nop_Node' ||
            next_node.node_type == 'Label') {
          next_node = find_next_input_node(next_node);
        }
        else if (next_node.node_type == 'Jump') {
          var pot_next_node = null;
          for (var index in fsm_nodes) {
            var cur_node = fsm_nodes[index];
            if (cur_node && cur_node.node_type == 'Label') {
              if (cur_node.options && cur_node.options.label_name == next_node.options.label_name) {
                pot_next_node = cur_node;
                break;
              }
            }
          }
          if (pot_next_node) {
            next_node = pot_next_node;
          }
          else {
            pre_pre_process_error += "Error: cannot find 'Label' node: " + next_node.options.label_name + "\n";
            return false;
          }
        }
        else {
          pre_pre_process_error += "Error: ??\n";
          return false;
        }
      }
      return next_node;
    };
    // In-scope method for processing a single node in the chain.
    // Input: Node to preprocess.
    // Output: true/false-y to indicate success/failure.
    // Writes to previously-defined node arrays.
    var process_node_func = function(proc_node) {
      var cur_grid_node_x = proc_node.grid_coord_x;
      var cur_grid_node_y = proc_node.grid_coord_y;
      // 'Branching' node.
      if (proc_node.node_type == 'Check_Truthy' ||
          proc_node.node_type == 'Check_Equals' ||
          proc_node.node_type == 'Check_GT' ||
          proc_node.node_type == 'Check_GT_EQ' ||
          proc_node.node_type == 'Check_LT' ||
          proc_node.node_type == 'Check_LT_EQ') {
        if (proc_node.connections) {
          // 'If-True' output
          if (proc_node.connections.up == 'output_T') {
            cur_grid_node_y += 1;
          }
          else if (proc_node.connections.down == 'output_T') {
            cur_grid_node_y -= 1;
          }
          else if (proc_node.connections.left == 'output_T') {
            cur_grid_node_x -= 1;
          }
          else if (proc_node.connections.right == 'output_T') {
            cur_grid_node_x += 1;
          }
          else {
            pre_pre_process_error += "Error: Branching node at (" + cur_grid_node_x + ", " + cur_grid_node_y + ") has no 'If True' output connection.\n";
            return false;
          }
          var next_node_t = find_input_node(cur_grid_node_x, cur_grid_node_y);

          // 'Else-False' output
          cur_grid_node_x = proc_node.grid_coord_x;
          cur_grid_node_y = proc_node.grid_coord_y;
          if (proc_node.connections.up == 'output_F') {
            cur_grid_node_y += 1;
          }
          else if (proc_node.connections.down == 'output_F') {
            cur_grid_node_y -= 1;
          }
          else if (proc_node.connections.left == 'output_F') {
            cur_grid_node_x -= 1;
          }
          else if (proc_node.connections.right == 'output_F') {
            cur_grid_node_x += 1;
          }
          else {
            pre_pre_process_error += "Error: Branching node at (" + cur_grid_node_x + ", " + cur_grid_node_y + ") has no 'Else (False)' output connection.\n";
            return false;
          }
          var next_node_f = find_input_node(cur_grid_node_x, cur_grid_node_y);

          // Check that both 'if/else' branches exist and
          // that they do not violate scope.
          if (!next_node_t || !next_node_f) {
            pre_pre_process_error += "Error: Branching node at (" + cur_grid_node_x + ", " + cur_grid_node_y + ") does not point to valid 'input' arrows with both of its outputs.\n";
            return false;
          }
          else {
            // Verify matching scopes. (TODO: Method for this?)
            var cur_scope = program_nodes[proc_node.pn_index].code_destination;
            var next_scope_t = program_nodes[next_node_t.pn_index].code_destination;
            var next_scope_f = program_nodes[next_node_f.pn_index].code_destination;
            if (next_scope_t == 'none') {
              program_nodes[next_node_t.pn_index].code_destination = cur_scope;
              next_scope_t = cur_scope;
            }
            if (next_scope_f == 'none') {
              program_nodes[next_node_f.pn_index].code_destination = cur_scope;
              next_scope_f = cur_scope;
            }
            // TODO: Remove when hw interrupts work reliably.
            //alert("scope:\n" + cur_scope + " -> " + next_scope_t + "\n" + cur_scope + " -> " + next_scope_f);
            if (next_scope_t != cur_scope) {
              // Scope-jumping violation.
              pre_pre_process_error += "Error: Grid coordinate(" + cur_grid_node_x + ", " + cur_grid_node_y + ") points to a node outside of its scope on its 'True' branch. Hardware interrupts must not 'flow into' other hardware interrupts or the main 'Boot' node's program flow, and vice-versa.\n";
              return false;
            }
            if (next_scope_f != cur_scope) {
              // Scope-jumping violation.
              pre_pre_process_error += "Error: Grid coordinate(" + cur_grid_node_x + ", " + cur_grid_node_y + ") points to a node outside of its scope on its 'False' branch. Hardware interrupts must not 'flow into' other hardware interrupts or the main 'Boot' node's program flow, and vice-versa.\n";
              return false;
            }
            // Mark the node's outputs.
            program_nodes[proc_node.pn_index].output = {
              branch_t: next_node_t.pn_index,
              branch_f: next_node_f.pn_index
            };
            // 'Enqueue' both branch nodes.
            if (!visited_nodes["("+next_node_t.grid_coord_x+","+next_node_t.grid_coord_y+")"]) {
              visited_nodes["("+next_node_t.grid_coord_x+","+next_node_t.grid_coord_y+")"] = true;
              remaining_branches.push(next_node_t);
            }
            if (!visited_nodes["("+next_node_f.grid_coord_x+","+next_node_f.grid_coord_y+")"]) {
              visited_nodes["("+next_node_f.grid_coord_x+","+next_node_f.grid_coord_y+")"] = true;
              remaining_branches.push(next_node_f);
            }
            return true;
          }
        }
        else {
          pre_pre_process_error += "Unknown: Node 'connections' invalid\n";
          return false;
        }
      }
      // 'Normal' node.
      else {
        if (proc_node.connections) {
          if (proc_node.connections.up == 'output') {
            cur_grid_node_y += 1;
          }
          else if (proc_node.connections.down == 'output') {
            cur_grid_node_y -= 1;
          }
          else if (proc_node.connections.left == 'output') {
            cur_grid_node_x -= 1;
          }
          else if (proc_node.connections.right == 'output') {
            cur_grid_node_x += 1;
          }
          else {
            // Special case: 'End Interrupt' nodes terminate
            // a hardware interrupt flow, and don't have outputs.
            if (proc_node.node_type == 'Interrupt_End') {
              return true;
            }
            else {
              pre_pre_process_error += "Error: Node at (" + cur_grid_node_x + ", " + cur_grid_node_y + ") has no 'output' connection.\n";
              return false;
            }
          }
          var next_node = find_input_node(cur_grid_node_x, cur_grid_node_y);
          if (!next_node) {
            pre_pre_process_error += "Error: Grid coordinate (" + cur_grid_node_x + ", " + cur_grid_node_y + ") does not point to any 'input' arrows. If an output is pointing directly at a node, move that node over and give it an 'input' arrow.\n";
            return false;
          }
          else {
            // If the next node's 'code_destination' is 'none',
            // set it to this node's value. Otherwise,
            // ensure that it matches this node's value.
            // If there is a mismatch, it indicates an invalid
            // jump between scopes; mark that as an error.
            var cur_scope = program_nodes[proc_node.pn_index].code_destination;
            var next_scope = program_nodes[next_node.pn_index].code_destination;
            if (next_scope == 'none') {
              program_nodes[next_node.pn_index].code_destination = cur_scope;
              next_scope = cur_scope;
            }
            // TODO: Remove when hw interrupts work reliably.
            //alert("scope:\n" + cur_scope + " -> " + next_scope);
            if (next_scope != cur_scope) {
              // Scope-jumping violation.
              pre_pre_process_error += "Error: Grid coordinate(" + cur_grid_node_x + ", " + cur_grid_node_y + ") points to a node outside of its scope. Hardware interrupts must not 'flow into' other hardware interrupts or the main 'Boot' node's program flow, and vice-versa.\n";
              return false;
            }
            if (!visited_nodes["("+next_node.grid_coord_x+","+next_node.grid_coord_y+")"]) {
              visited_nodes["("+next_node.grid_coord_x+","+next_node.grid_coord_y+")"] = true;
              remaining_branches.push(next_node);
            }
            // Now we know which node is 'next'.
            // So, mark the node's output.
            program_nodes[proc_node.pn_index].output = {
              single: next_node.pn_index
            };
            return true;
          }
        }
        else {
          pre_pre_process_error += "Unknown: Node 'connections' invalid\n";
          return false;
        }
      }
    };

    // Perform the actual preprocessing.
    while (!done_processing) {
      var next_proc_node = remaining_branches.pop();
      if (next_proc_node) {
        var okay = process_node_func(next_proc_node);
        if (!okay && !done_processing) {
          pre_pre_process_error += "Unknown error in node processing function.\n";
          done_processing = true;
        }
      }
      else {
        done_processing = true;
      }
    }
  }

  // 'Finished' - alert to any error messages.
  if (pre_pre_process_error) {
    alert("Precompilation error messages: " + pre_pre_process_error);
    return null;
  }
  else {
    // If there weren't any errors, report the program's collected JSON.
    //alert("No errors! program_nodes:\n" + JSON.stringify(program_nodes));
    return {
      nodes: program_nodes,
      g_vars: global_vars,
    };
  }
};
