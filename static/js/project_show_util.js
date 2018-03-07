array_filter_nulls = function(x) {
  return (x != null);
};

// Refresh the current set of 'defined variables' from the current FSM nodes.
refresh_defined_vars = function() {
  // Empty the storage array...
  defined_vars = [];
  // ...and fill it with the current values.
  for (var node_ind in fsm_nodes) {
    if (fsm_nodes[node_ind]) {
      cur_node = fsm_nodes[node_ind];
      if (cur_node && cur_node.node_type == 'New_Variable') {
        // Add the variable name & options.
        if (cur_node.options.var_name) {
          // (Default values)
          var var_type = 'int';
          var var_init = 0;
          // (Set values)
          if (cur_node.options.var_type) {
            var_type = cur_node.options.var_type;
          }
          if (cur_node.options.var_init) {
            var_init = cur_node.options.var_init;
          }
          // (Add variable)
          defined_vars[cur_node.options.var_name] = {
            name: cur_node.options.var_name,
            type: var_type,
            init: var_init,
          };
        }
      }
    }
  }
};

var update_var_names = function(old_name, new_name) {
  // Cycle through the array of nodes, and make sure that no other
  // 'New Variable' nodes have the same name. If one does, retain old name.
  for (var index in fsm_nodes) {
    var cur_node = fsm_nodes[index];
    if (cur_node) {
      if (cur_node.node_type == 'New_Variable') {
        if (cur_node.options.var_name == new_name) {
          return old_name;
        }
      }
    }
  }
  // If the name can change, rename any other nodes that were using
  // the old variable name.
  for (var index in fsm_nodes) {
    var cur_node = fsm_nodes[index];
    if (cur_node) {
      var cur_node_type = get_node_type_def_by_name(cur_node.node_type);
      if (cur_node_type) {
        for (var opt_ind in cur_node_type.options) {
          if (cur_node_type.options[opt_ind].type == 'defined_var_select') {
            if (cur_node.options[opt_ind] == old_name) {
              cur_node.options[opt_ind] = new_name;
            }
          }
        }
      }
    }
  }
  return new_name;
};

var update_label_names = function(old_name, new_name) {
  // Check that no other 'Label' nodes have the proposed name already.
  for (var index in fsm_nodes) {
    var cur_node = fsm_nodes[index];
    if (cur_node) {
      if (cur_node.node_type == 'Label') {
        if (cur_node.options.label_name == new_name) {
          return old_name;
        }
      }
    }
  }
  // If the name is about to change, rename 'Jump' nodes that point to it.
  for (var index in fsm_nodes) {
    var cur_node = fsm_nodes[index];
    if (cur_node) {
      if (cur_node.node_type == 'Jump' && cur_node.options.label_name == old_name) {
        cur_node.options.label_name = new_name;
      }
    }
  }
  return new_name;
};

// Convert a node array (like the global 'fsm_nodes' one) into a
// JSON object which can be easily stringified.
node_array_to_json = function(node_arr) {
  var nodes_json = {
    nodes: []
  };
  for (var node_ind in node_arr) {
    var cur_node = node_arr[node_ind];
    if (cur_node && cur_node.connections) {
      var node_json = {
        node_type:    cur_node.node_type,
        grid_coord_x: cur_node.grid_coord_x,
        grid_coord_y: cur_node.grid_coord_y,
        connections: {
          left:  cur_node.connections.left,
          right: cur_node.connections.right,
          up:    cur_node.connections.up,
          down:  cur_node.connections.down
        },
      };
      node_json.options = cur_node.options
      nodes_json.nodes.push(node_json);
    }
  }
  nodes_json.nodes_str = JSON.stringify(nodes_json.nodes, null, 2)
  return nodes_json;
};

// Create a node array from an imported JSON value.
node_array_from_json = function(node_arr_json) {
  var nodes_map = [];
  var cur_node_index = 0;
  for (var index in node_arr_json) {
    var cur_node = node_arr_json[index];
    if (cur_node) {
      // Add the loaded node to the FSM array.
      var valid_node = true;
      var cur_fsm_node = [];
      cur_fsm_node.node_type = cur_node.node_type;
      cur_fsm_node.grid_coord_x = cur_node.grid_coord_x;
      cur_fsm_node.grid_coord_y = cur_node.grid_coord_y;
      if (cur_node.connections) {
        cur_fsm_node.connections = {
          left: cur_node.connections.left,
          right: cur_node.connections.right,
          up: cur_node.connections.up,
          down: cur_node.connections.down
        };
      }
      else {
        cur_fsm_node.connections = {
          left: 'none',
          right: 'none',
          up: 'none',
          down: 'none'
        };
      }
      cur_fsm_node.node_status = 0;
      // Apply texture/node color depending on selected node type.
      var node_type_found = false;
      for (var tn_ind in tool_node_types) {
        var cur_type = tool_node_types[tn_ind];
        if (cur_type) {
          if (cur_fsm_node.node_type == cur_type.base_name &&
              loaded_textures[cur_type.base_name]) {
            cur_fsm_node.tex_sampler = loaded_textures[cur_type.base_name];
            cur_fsm_node.node_color = cur_type.node_color;
            node_type_found = true;
            break;
          }
        }
      }
      if (!node_type_found) {
        valid_node = false;
      }
      if (valid_node) {
        if (cur_node.options) {
          cur_fsm_node.options = cur_node.options;
        }
        else {
          cur_fsm_node.options = {}
        }
        nodes_map[cur_node_index] = cur_fsm_node;
        cur_node_index += 1;
      }
    }
  }
  return nodes_map;
};

submit_post_as_file = function(req_url, req_body, on_done, on_fail) {
    var boundary = '--------------03j9grbf9Nui5Egrlj34kaGrj';
    var body = '--' + boundary + '\r\n'
               + 'Content-Disposition: form-data; name="file";'
               + 'filename="project.json"\r\n'
               + 'Content-type: plain/text\r\n\r\n'
               + req_body + '\r\n'
               + '--' + boundary + '--';
    $.ajax({
      contentType: "multipart/form-data; boundary="+boundary,
      data: body,
      type: 'POST',
      url: req_url,
    }).done(on_done).fail(on_fail);
};
