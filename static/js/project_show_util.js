array_filter_nulls = function(x) {
  return (x != null);
};

load_one_texture = function(tex_key, tex_path) {
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  var img = new Image();
  const mip_level = 0;
  const format = gl.RGBA;
  const src_type = gl.UNSIGNED_BYTE;
  // Dummy 1-pixel texture.
  gl.texImage2D(gl.TEXTURE_2D, mip_level, format, 1, 1, 0, format, src_type, new Uint8Array([0, 0, 255, 255]));
  img.onload = function() {
    while (!img.complete) {}
    while (img_lock) {}
    img_lock = true;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, mip_level, format, format, src_type, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    loaded_textures[tex_key] = tex;
    img_lock = false;
    imgs_loaded += 1;
  };
  img.src = tex_path;
};

preload_textures = function() {
  for (var key in imgs_to_load) {
    load_one_texture(key, imgs_to_load[key]);
  }
};

// Refresh the current set of 'defined variables' from the current FSM nodes.
refresh_defined_vars = function() {
  // Empty the storage array...
  defined_vars = [];
  // ...and fill it with the current values.
  for (var node_ind = 0; node_ind < 256; ++node_ind) {
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
      if (cur_node.node_type == 'Set_Variable') {
        if (cur_node.options.var_name == old_name) {
          cur_node.options.var_name = new_name;
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
      if (cur_fsm_node.node_type == 'Boot' && loaded_textures['Boot']) {
        cur_fsm_node.tex_sampler = loaded_textures['Boot'];
        cur_fsm_node.node_color = 'green';
      }
      else if (cur_fsm_node.node_type == 'Delay' && loaded_textures['Delay']) {
        cur_fsm_node.tex_sampler = loaded_textures['Delay'];
        cur_fsm_node.node_color = 'blue';
      }
      else if (cur_fsm_node.node_type == 'Label' && loaded_textures['Label']) {
        cur_fsm_node.tex_sampler = loaded_textures['Label'];
        cur_fsm_node.node_color = 'pink';
      }
      else if (cur_fsm_node.node_type == 'Jump' && loaded_textures['Jump']) {
        cur_fsm_node.tex_sampler = loaded_textures['Jump'];
        cur_fsm_node.node_color = 'pink';
      }
      else if (cur_fsm_node.node_type == 'GPIO_Init' && loaded_textures['GPIO_Init']) {
        cur_fsm_node.tex_sampler = loaded_textures['GPIO_Init'];
        cur_fsm_node.node_color = 'green';
      }
      else if (cur_fsm_node.node_type == 'GPIO_Output' && loaded_textures['GPIO_Output']) {
        cur_fsm_node.tex_sampler = loaded_textures['GPIO_Output'];
        cur_fsm_node.node_color = 'blue';
      }
      else if (cur_fsm_node.node_type == 'RCC_Enable' && loaded_textures['RCC_Enable']) {
        cur_fsm_node.tex_sampler = loaded_textures['RCC_Enable'];
        cur_fsm_node.node_color = 'green';
      }
      else if (cur_fsm_node.node_type == 'RCC_Disable' && loaded_textures['RCC_Disable']) {
        cur_fsm_node.tex_sampler = loaded_textures['RCC_Disable'];
        cur_fsm_node.node_color = 'pink';
      }
      else if (cur_fsm_node.node_type == 'New_Variable' && loaded_textures['New_Variable']) {
        cur_fsm_node.tex_sampler = loaded_textures['New_Variable'];
        cur_fsm_node.node_color = 'green';
      }
      else if (cur_fsm_node.node_type == 'Set_Variable' && loaded_textures['Set_Variable']) {
        cur_fsm_node.tex_sampler = loaded_textures['Set_Variable'];
        cur_fsm_node.node_color = 'blue';
      }
      else if (cur_fsm_node.node_type == 'Nop_Node' && loaded_textures['Nop_Node']) {
        cur_fsm_node.tex_sampler = loaded_textures['Nop_Node'];
        cur_fsm_node.node_color = 'blue';
      }
      // (Branching nodes)
      else if (cur_fsm_node.node_type == 'Check_Truthy' && loaded_textures['Check_Truthy']) {
        cur_fsm_node.tex_sampler = loaded_textures['Check_Truthy'];
        cur_fsm_node.node_color = 'canary';
      }
      else {
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

