// Shaders. We're only doing simple 2D drawing, so
// why even make separate files for them
const vert_sh = `#version 300 es
  precision mediump float;
  in vec2 vp;
  uniform   vec2 cur_view_coords;
  void main() {
    gl_Position = vec4(vp.x, vp.y, 0.0, 1.0);
  }
`;
const grid_frag_sh = `#version 300 es
  precision mediump float;
  // Inputs.
  uniform   float canvas_w;
  uniform   float canvas_h;
  uniform   vec2 cur_view_coords;
  // Output color.
  out       vec4 out_color;
  void main() {
    // Draw a 'pegboard' view. For now, no DPI settings or anything.
    // Just 64px per grid square.
    const int grid_spacing = 64;
    int cur_x = int(cur_view_coords.x);
    int cur_y = int(cur_view_coords.y);
    int x_mod = cur_x & 0x0000003F;
    int y_mod = cur_y & 0x0000003F;
    int cur_px_x = int(gl_FragCoord.x);
    int cur_px_x_mod = cur_px_x & 0x0000003F;
    cur_px_x_mod = 64-cur_px_x_mod;
    int cur_px_y = int(gl_FragCoord.y);
    int cur_px_y_mod = cur_px_y & 0x0000003F;
    cur_px_y_mod = 64-cur_px_y_mod;
    int is_grid_px = 0;
    const int grid_dot_size = 2;
    // Draw a larger dot at (0, 0) to get the coordinate system straight.
    // So, if x and y are within say, [-5, 5] including the offset.
    const int origin_dot = 5;
    if ((cur_x+cur_px_x >= -origin_dot && cur_x+cur_px_x <= origin_dot) &&
        (cur_y+cur_px_y >= -origin_dot && cur_y+cur_px_y <= origin_dot)) {
      is_grid_px = 1;
    }
    // For x,y in [0:dot_size], draw dot color if (cur_x % grid_size)
    // is within (dot_offset)+[0:dot_size].
    for (int x_prog = 0; x_prog < grid_dot_size; ++x_prog) {
      for (int y_prog = 0; y_prog < grid_dot_size; ++y_prog) {
        if ((x_mod+x_prog == cur_px_x_mod || x_mod+x_prog+64 == cur_px_x_mod)
            && (y_mod+y_prog == cur_px_y_mod || y_mod+y_prog+64 == cur_px_y_mod)) {
          is_grid_px = 1;
        }
      }
    }
    if (is_grid_px == 1) {
      out_color = vec4(0.5, 0.5, 0.5, 1.0);
    }
    else {
      out_color = vec4(1.0, 1.0, 1.0, 1.0);
    }
  }
`;

const node_frag_sh = `#version 300 es
  precision mediump float;
  // Struct definitions.
  struct FSM_Node {
    sampler2D tex_sampler;
    int node_status;
    int grid_coord_x;
    int grid_coord_y;
  };
  // Inputs.
  uniform   float canvas_w;
  uniform   float canvas_h;
  uniform   vec2 cur_view_coords;
  uniform   FSM_Node cur_tool_node;
  // Output color.
  out       vec4 out_color;
  void main() {
    // Gather grid/view information.
    int cur_x = int(cur_view_coords.x);
    int cur_y = int(cur_view_coords.y);
    int cur_px_x = int(gl_FragCoord.x);
    int cur_px_y = int(gl_FragCoord.y);
    // Draw the supplied node.
    if (cur_tool_node.node_status >= 0) {
      // Find the right grid coordinate's location relative to the window.
      // The center will be at global (x*64, y*64), so:
      // (global_x-cur_view_x) = local center.
      int cur_tool_node_local_x = cur_tool_node.grid_coord_x * 64;
      cur_tool_node_local_x -= int(cur_view_coords.x);
      int cur_tool_node_local_y = cur_tool_node.grid_coord_y * 64;
      cur_tool_node_local_y -= int(cur_view_coords.y);
      int cur_tool_node_min_x = cur_tool_node_local_x - 32;
      int cur_tool_node_max_x = cur_tool_node_local_x + 32;
      int cur_tool_node_min_y = cur_tool_node_local_y - 32;
      int cur_tool_node_max_y = cur_tool_node_local_y + 32;
      if (cur_px_x >= cur_tool_node_min_x &&
          cur_px_x <= cur_tool_node_max_x &&
          cur_px_y >= cur_tool_node_min_y &&
          cur_px_y <= cur_tool_node_max_y) {
        // Texture coordinates are [0:1]; treat (grid_coord-32) as the 
        // '0' and (grid_coord+32) as the '1', for a 64-px grid.
        float cur_tool_s = float(cur_px_x - cur_tool_node_min_x);
        float cur_tool_t = float(cur_px_y - cur_tool_node_min_y);
        int stripes_check = int(cur_tool_s+cur_tool_t);
        const int stripes_w = 16;
        const int stripes_s = 4;
        cur_tool_s /= 64.0;
        cur_tool_t /= 64.0;
        cur_tool_t = 1.0 - cur_tool_t;
        vec2 cur_tool_st = vec2(cur_tool_s, cur_tool_t);
        if (cur_tool_node.node_status == 1) {
          // Apply a 'striping' transparency effect to indicate that this
          // node is in a temporary or transient state.
          if (stripes_check % stripes_w <= (stripes_w-stripes_s)/2 ||
              stripes_check % stripes_w >= stripes_w-(stripes_w-stripes_s)/2) {
            out_color = texture(cur_tool_node.tex_sampler, cur_tool_st);
          }
          else { discard; }
        }
        else {
          out_color = texture(cur_tool_node.tex_sampler, cur_tool_st);
        }
      }
      else { discard; }
    }
    else { discard; }
  }
`;

const conn_frag_sh = `#version 300 es
  precision mediump float;
  // Inputs.
  uniform sampler2D tex_sampler;
  uniform int  conn_tex_w;
  uniform int  conn_tex_h;
  uniform vec2 cur_view_coords;
  uniform int  node_grid_x;
  uniform int  node_grid_y;
  // [0:3] = [top, left, bottom, right].
  uniform int  conn_position;
  // Output color.
  out     vec4 out_color;
  void main() {
    // Gather grid/view information.
    int cur_x = int(cur_view_coords.x);
    int cur_y = int(cur_view_coords.y);
    int cur_px_x = int(gl_FragCoord.x);
    int cur_px_y = int(gl_FragCoord.y);
    // Find the right grid coordinate's location relative to the window.
    int cur_node_conn_local_x = node_grid_x * 64;
    cur_node_conn_local_x -= int(cur_view_coords.x);
    int cur_node_conn_local_y = node_grid_y * 64;
    cur_node_conn_local_y -= int(cur_view_coords.y);
    int cur_node_conn_min_x = cur_node_conn_local_x - (conn_tex_w/2);
    int cur_node_conn_max_x = cur_node_conn_local_x + (conn_tex_w/2);
    int cur_node_conn_min_y = cur_node_conn_local_y - (conn_tex_h/2);
    int cur_node_conn_max_y = cur_node_conn_local_y + (conn_tex_h/2);
    // TODO: Constants.
    if (conn_position == 0) {
      // 'up'
      cur_node_conn_min_y += 48;
      cur_node_conn_max_y += 48;
    }
    else if (conn_position == 1) {
      // 'left'
      cur_node_conn_min_x -= 48;
      cur_node_conn_max_x -= 48;
    }
    else if (conn_position == 2) {
      // 'down'
      cur_node_conn_min_y -= 48;
      cur_node_conn_max_y -= 48;
    }
    else if (conn_position == 3) {
      // 'right'
      cur_node_conn_min_x += 48;
      cur_node_conn_max_x += 48;
    }
    if (cur_px_x >= cur_node_conn_min_x &&
        cur_px_x <= cur_node_conn_max_x &&
        cur_px_y >= cur_node_conn_min_y &&
        cur_px_y <= cur_node_conn_max_y) {
      float cur_conn_s = float(cur_px_x - cur_node_conn_min_x);
      float cur_conn_t = float(cur_px_y - cur_node_conn_min_y);
      cur_conn_s /= float(conn_tex_w);
      cur_conn_t /= float(conn_tex_h);
      cur_conn_t = 1.0 - cur_conn_t;
      vec2 cur_conn_st = vec2(cur_conn_s, cur_conn_t);
      // Pofolk transparency: discard ~(1,1,1) or ~alpha==0 colors.
      vec4 tex_color = texture(tex_sampler, cur_conn_st);
      if (tex_color.a <= 0.01 ||
          (tex_color.r > 0.99 && tex_color.g > 0.99 && tex_color.b > 0.99)) {
        discard;
      }
      else {
        out_color = texture(tex_sampler, cur_conn_st);
      }
      //out_color = vec4(0.5, 0.8, 0.2, 1.0);
    }
    else { discard; }
  }
`;

// 'Global' variables to use.
var selected_tool = "pan";
var selected_menu_tool = "";
var is_currently_panning = false;
var move_grabbed_node_id = -1;
var selected_node_id = -1;
var last_pan_mouse_x = -1;
var last_pan_mouse_y = -1;
var pan_scale_factor = 1.5;
var cur_fsm_x = 0;
var cur_fsm_y = 0;
var cur_fsm_grid_x = 0;
var cur_fsm_grid_y = 0;
var cur_fsm_mouse_x = 0;
var cur_fsm_mouse_y = 0;
var gl = null;
var grid_shader_prog = null;
var node_shader_prog = null;
var img_lock = false;
var imgs_loaded = 0;
// Array for keeping track of FSM node structs to send to the shader.
var fsm_nodes = [];
// (Fields sent to the shaders)
var fsm_node_struct_fields = [
  "tex_sampler",
  "node_status",
  "grid_coord_x",
  "grid_coord_y",
];
// 'currently-selected preview' node info.
var cur_tool_node_tex = -1;
var cur_tool_node_color = 'green';
var cur_tool_node_type = '';
var cur_tool_node_grid_x = 0;
var cur_tool_node_grid_y = 0;
// Preloaded textures
var loaded_textures = [];
// Global FSM program variables.
var mcu_chip = 'STM32F030F4';
var defined_vars = [];
// JSON struct representing a precompiled program.
var json_fsm_nodes = null;
// TODO: Shouldn't this be an array of strings, and a .length()?
var imgs_to_load = {
  Boot:              '/static/fsm_assets/boot_node.png',
  Delay:             '/static/fsm_assets/delay_node.png',
  GPIO_Init:         '/static/fsm_assets/init_gpio_node.png',
  GPIO_Deinit:       '/static/fsm_assets/disable_pin_node.png',
  GPIO_Output:       '/static/fsm_assets/set_output_pin_node.png',
  RCC_Enable:        '/static/fsm_assets/enable_clock_node.png',
  RCC_Disable:       '/static/fsm_assets/disable_clock_node.png',
  New_Variable:      '/static/fsm_assets/new_var_node.png',
  Set_Variable:      '/static/fsm_assets/set_variable_node.png',
  Set_Var_Logic_Not: '/static/fsm_assets/set_not_node.png',
  // Sooo I mixed up 'LtoR' and 'RtoL' in the png filenames. But long-term,
  // these should be svg files anyways so just...ugh, TODO
  left_arrow_blue:   '/static/fsm_assets/conn_LtoR_blue.png',
  right_arrow_blue:  '/static/fsm_assets/conn_RtoL_blue.png',
  up_arrow_blue:     '/static/fsm_assets/conn_BtoT_blue.png',
  down_arrow_blue:   '/static/fsm_assets/conn_TtoB_blue.png',
  left_arrow_green:   '/static/fsm_assets/conn_LtoR_green.png',
  right_arrow_green:  '/static/fsm_assets/conn_RtoL_green.png',
  up_arrow_green:     '/static/fsm_assets/conn_BtoT_green.png',
  down_arrow_green:   '/static/fsm_assets/conn_TtoB_green.png',
  left_arrow_canary:   '/static/fsm_assets/conn_LtoR_canary.png',
  right_arrow_canary:  '/static/fsm_assets/conn_RtoL_canary.png',
  up_arrow_canary:     '/static/fsm_assets/conn_BtoT_canary.png',
  down_arrow_canary:   '/static/fsm_assets/conn_TtoB_canary.png',
  left_arrow_pink:   '/static/fsm_assets/conn_LtoR_pink.png',
  right_arrow_pink:  '/static/fsm_assets/conn_RtoL_pink.png',
  up_arrow_pink:     '/static/fsm_assets/conn_BtoT_pink.png',
  down_arrow_pink:   '/static/fsm_assets/conn_TtoB_pink.png',
};
var num_imgs = 0;

// Global FSM program constants.
const rcc_opts = {
  STM32F03xFx: {
    GPIOA:   'GPIO Bank A',
    GPIOB:   'GPIO Bank B',
    GPIOC:   'GPIO Bank C',
    GPIOD:   'GPIO Bank D',
    // (GPIO Bank E only available on F072 devices.)
    GPIOF:   'GPIO Bank F',
    TS:      'Touch-Sensing Controller',
    CRC:     'Cyclic Redundancy Check',
    FLITF:   'Sleep-Mode Flash Programming',
    SRAM:    'Static RAM Controller',
    DMA1:    'Direct Memory Access, Channel 1',
    DMA2:    'Direct Memory Access, Channel 2',
    SYSCFG:  'System Configuration',
    USART6:  'USART Bus 6',
    // TODO: USART 7-8 are on F031, but not F030.
    ADC1:    'Analog-Digital Converter, Channel 1',
    TIM1:    'Timer 1',
    SPI1:    'Serial Peripheral Interface 1',
    USART1:  'USART Bus 1',
    TIM15:   'Timer 15',
    TIM16:   'Timer 16',
    TIM17:   'Timer 17',
    DBGMCU:  'Debug Controller',
    TIM3:    'Timer 3',
    TIM6:    'Timer 6',
    TIM14:   'Timer 14',
    WWDG:    'Window-Watchdog Timer',
    SPI2:    'Serial Peripheral Interface 2',
    USART2:  'USART Bus 2',
    I2C1:    'Inter-IC Communication 1',
    I2C2:    'Inter-IC Communication 2',
    PWR:     'Power Controller',
    // TODO: CRS, CEC, DAC are on F031, but not F030.
  },
};

load_shader = function(gl, sh_type, sh_source) {
  const sh = gl.createShader(sh_type);
  gl.shaderSource(sh, sh_source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    alert("Error compiling shaders: " + gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
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

array_filter_nulls = function(x) {
  return (x != null);
};

preload_textures = function() {
  for (var key in imgs_to_load) {
    load_one_texture(key, imgs_to_load[key]);
  }
};

// Refresh the current set of 'defined variables' from the current FSM nodes.
refresh_defined_vars = function() {
  // Empty the storage array...
  defined_vars.length = 0;
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
      // TODO: node-specific 'options' hash.
      node_json.options = {}
      nodes_json.nodes.push(node_json);
    }
  }
  nodes_json.nodes_str = JSON.stringify(nodes_json.nodes, null, 2)
  return nodes_json;
};

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
      else {
        valid_node = false;
      }
      if (valid_node) {
        // TODO: Node-specific options hash.
        cur_fsm_node.options = {};
        nodes_map[cur_node_index] = cur_fsm_node;
        cur_node_index += 1;
      }
    }
  }
  return nodes_map;
};

check_selected_menu_tool = function() {
  var menu_tool_selected = false;
  // 'Boot' node.
  if (selected_menu_tool == 'Boot' && loaded_textures['Boot']) {
    cur_tool_node_tex = loaded_textures['Boot'];
    cur_tool_node_type = 'Boot';
    cur_tool_node_color = 'green';
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
  // 'GPIO Deinit' node; disable a previously-initialized GPIO pin.
  else if (selected_menu_tool == 'Disable GPIO Pin' && loaded_textures['GPIO_Deinit']) {
    cur_tool_node_tex = loaded_textures['GPIO_Deinit'];
    cur_tool_node_type = 'GPIO_Deinit';
    cur_tool_node_color = 'pink';
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
  // No match.
  else {
    cur_tool_node_tex = -1;
  }
  return menu_tool_selected;
};

init_fsm_layout_canvas = function() {
  const canvas = document.getElementById("fsm_layout_canvas");
  const canvas_container = document.getElementById("fsm_canvas_div");
  // Resize canvas to its parent div dimensions.
  canvas.width = canvas_container.offsetWidth;
  canvas.height = canvas_container.offsetHeight;

  // Initialize WebGL
  gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("Cannot initialize WebGL context");
    return;
  }

  // Clear to sea-green.
  gl.clearColor(0.0, 0.9, 0.7, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Preload textures.
  preload_textures();

  // Load shaders.
  const vs = load_shader(gl, gl.VERTEX_SHADER, vert_sh);
  const grid_fs = load_shader(gl, gl.FRAGMENT_SHADER, grid_frag_sh);
  const node_fs = load_shader(gl, gl.FRAGMENT_SHADER, node_frag_sh);
  const conn_fs = load_shader(gl, gl.FRAGMENT_SHADER, conn_frag_sh);
  grid_shader_prog = gl.createProgram();
  node_shader_prog = gl.createProgram();
  conn_shader_prog = gl.createProgram();
  gl.attachShader(grid_shader_prog, vs);
  gl.attachShader(grid_shader_prog, grid_fs);
  gl.linkProgram(grid_shader_prog);
  gl.attachShader(node_shader_prog, vs);
  gl.attachShader(node_shader_prog, node_fs);
  gl.linkProgram(node_shader_prog);
  gl.attachShader(conn_shader_prog, vs);
  gl.attachShader(conn_shader_prog, conn_fs);
  gl.linkProgram(conn_shader_prog);
  if (!gl.getProgramParameter(grid_shader_prog, gl.LINK_STATUS)) {
    alert("Couldn't initialize grid shader program - log:\n" + gl.getProgramInfoLog(grid_shader_prog));
    return;
  }
  if (!gl.getProgramParameter(node_shader_prog, gl.LINK_STATUS)) {
    alert("Couldn't initialize node shader program - log:\n" + gl.getProgramInfoLog(node_shader_prog));
    return;
  }
  if (!gl.getProgramParameter(node_shader_prog, gl.LINK_STATUS)) {
    alert("Couldn't initialize node shader program - log:\n" + gl.getProgramInfoLog(node_shader_prog));
    return;
  }

  // Initialize buffer objects.
  const pos_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pos_buffer);
  const pos_pts = [
    1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
    -1.0, -1.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(pos_pts),
                gl.STATIC_DRAW);

  // Setup the scene.
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Define positions buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, pos_buffer);
  gl.vertexAttribPointer(gl.getAttribLocation(grid_shader_prog, 'vp'),
                         2, // number of components
                         gl.FLOAT,
                         false, // normalize?
                         0, 0);
  gl.enableVertexAttribArray(gl.getAttribLocation(grid_shader_prog, 'vp'));
  gl.vertexAttribPointer(gl.getAttribLocation(node_shader_prog, 'vp'),
                         2, // number of components
                         gl.FLOAT,
                         false,
                         0, 0);
  gl.enableVertexAttribArray(gl.getAttribLocation(node_shader_prog, 'vp'));
  gl.vertexAttribPointer(gl.getAttribLocation(conn_shader_prog, 'vp'),
                         2, // number of components
                         gl.FLOAT,
                         false,
                         0, 0);
  gl.enableVertexAttribArray(gl.getAttribLocation(conn_shader_prog, 'vp'));

  // Use the current shader program.
  gl.useProgram(grid_shader_prog);

  // Pre-fill FSM node arrays with null values.
  for (var node_ind = 0; node_ind < 256; ++node_ind) {
    fsm_nodes[node_ind] = null;
  }

  // Draw.
  redraw_canvas();
};

redraw_canvas = function() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  const canvas = document.getElementById("fsm_layout_canvas");

  // First, draw the 'grid' view.
  gl.useProgram(grid_shader_prog);

  // Send uniform values.
  gl.uniform1f(gl.getUniformLocation(grid_shader_prog, 'canvas_w'), canvas.width);
  gl.uniform1f(gl.getUniformLocation(grid_shader_prog, 'canvas_h'), canvas.height);
  gl.uniform2fv(gl.getUniformLocation(grid_shader_prog, 'cur_view_coords'), [cur_fsm_x, cur_fsm_y]);

  // Draw.
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Next, draw any nodes that are within the current view.
  var grid_min_x = cur_fsm_grid_x - 1;
  var grid_min_y = cur_fsm_grid_y - 1;
  var grid_max_x = cur_fsm_grid_x + parseInt(canvas.width/64) + 1;
  var grid_max_y = cur_fsm_grid_y + parseInt(canvas.height/64) + 1;
  for (var node_ind = 0; node_ind < 256; ++node_ind) {
    if (fsm_nodes[node_ind] && fsm_nodes[node_ind].node_status != -1 &&
        (fsm_nodes[node_ind].grid_coord_x >= grid_min_x &&
         fsm_nodes[node_ind].grid_coord_x <= grid_max_x &&
         fsm_nodes[node_ind].grid_coord_y >= grid_min_y &&
         fsm_nodes[node_ind].grid_coord_y <= grid_max_y)) {
      gl.useProgram(node_shader_prog);
      // Bind texture.
      gl.bindTexture(gl.TEXTURE_2D, fsm_nodes[node_ind].tex_sampler);
      // Send uniform values.
      gl.uniform1f(gl.getUniformLocation(node_shader_prog, 'canvas_w'), canvas.width);
      gl.uniform1f(gl.getUniformLocation(node_shader_prog, 'canvas_h'), canvas.height);
      gl.uniform2fv(gl.getUniformLocation(node_shader_prog, 'cur_view_coords'), [cur_fsm_x, cur_fsm_y]);
      gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.tex_sampler'), fsm_nodes[node_ind].tex_sampler);
      // TODO: Handle 'node_status' properly...
      if (move_grabbed_node_id == node_ind) {
        gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.node_status'), 1);
      }
      else {
        gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.node_status'), fsm_nodes[node_ind].node_status);
      }
      gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.grid_coord_x'), fsm_nodes[node_ind].grid_coord_x);
      gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.grid_coord_y'), fsm_nodes[node_ind].grid_coord_y);
      // Draw.
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Draw connections, if any. (TODO: loop?)
      if (fsm_nodes[node_ind].connections) {
        gl.useProgram(conn_shader_prog);
        // Send common uniform values.
        gl.uniform2fv(gl.getUniformLocation(conn_shader_prog, 'cur_view_coords'), [cur_fsm_x, cur_fsm_y]);
        gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'node_grid_x'), fsm_nodes[node_ind].grid_coord_x);
        gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'node_grid_y'), fsm_nodes[node_ind].grid_coord_y);
        // Top
        gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'conn_position'), 0);
        gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'conn_tex_w'), 8);
        gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'conn_tex_h'), 32);
        if (fsm_nodes[node_ind].connections.up == 'input') {
          gl.bindTexture(gl.TEXTURE_2D, loaded_textures['down_arrow_' + fsm_nodes[node_ind].node_color]);
          gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'tex_sampler'), loaded_textures['down_arrow_' + fsm_nodes[node_ind].node_color]);
          // Draw.
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        else if (fsm_nodes[node_ind].connections.up == 'output') {
          gl.bindTexture(gl.TEXTURE_2D, loaded_textures['up_arrow_' + fsm_nodes[node_ind].node_color]);
          gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'tex_sampler'), loaded_textures['up_arrow_' + fsm_nodes[node_ind].node_color]);
          // Draw.
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        // Bottom
        gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'conn_position'), 2);
        if (fsm_nodes[node_ind].connections.down == 'input') {
          gl.bindTexture(gl.TEXTURE_2D, loaded_textures['up_arrow_' + fsm_nodes[node_ind].node_color]);
          gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'tex_sampler'), loaded_textures['up_arrow_' + fsm_nodes[node_ind].node_color]);
          // Draw.
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        else if (fsm_nodes[node_ind].connections.down == 'output') {
          gl.bindTexture(gl.TEXTURE_2D, loaded_textures['down_arrow_' + fsm_nodes[node_ind].node_color]);
          gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'tex_sampler'), loaded_textures['down_arrow_' + fsm_nodes[node_ind].node_color]);
          // Draw.
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        // Left
        gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'conn_position'), 1);
        gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'conn_tex_w'), 32);
        gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'conn_tex_h'), 8);
        if (fsm_nodes[node_ind].connections.left == 'input') {
          gl.bindTexture(gl.TEXTURE_2D, loaded_textures['right_arrow_' + fsm_nodes[node_ind].node_color]);
          gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'tex_sampler'), loaded_textures['right_arrow_' + fsm_nodes[node_ind].node_color]);
          // Draw.
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        else if (fsm_nodes[node_ind].connections.left == 'output') {
          gl.bindTexture(gl.TEXTURE_2D, loaded_textures['left_arrow_' + fsm_nodes[node_ind].node_color]);
          gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'tex_sampler'), loaded_textures['left_arrow_' + fsm_nodes[node_ind].node_color]);
          // Draw.
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        // Right
        gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'conn_position'), 3);
        if (fsm_nodes[node_ind].connections.right == 'input') {
          gl.bindTexture(gl.TEXTURE_2D, loaded_textures['left_arrow_' + fsm_nodes[node_ind].node_color]);
          gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'tex_sampler'), loaded_textures['left_arrow_' + fsm_nodes[node_ind].node_color]);
          // Draw.
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        else if (fsm_nodes[node_ind].connections.right == 'output') {
          gl.bindTexture(gl.TEXTURE_2D, loaded_textures['right_arrow_' + fsm_nodes[node_ind].node_color]);
          gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'tex_sampler'), loaded_textures['right_arrow_' + fsm_nodes[node_ind].node_color]);
          // Draw.
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
      }
    }
  }

  // Finally, draw the currently-selected tool node if applicable.
  if (selected_tool == 'tool' && cur_tool_node_tex != -1) {
    gl.useProgram(node_shader_prog);
    // Bind texture.
    gl.bindTexture(gl.TEXTURE_2D, cur_tool_node_tex);
    // Send uniform values.
    gl.uniform1f(gl.getUniformLocation(node_shader_prog, 'canvas_w'), canvas.width);
    gl.uniform1f(gl.getUniformLocation(node_shader_prog, 'canvas_h'), canvas.height);
    gl.uniform2fv(gl.getUniformLocation(node_shader_prog, 'cur_view_coords'), [cur_fsm_x, cur_fsm_y]);
    gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.tex_sampler'), cur_tool_node_tex);
    gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.node_status'), 1);
    gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.grid_coord_x'), cur_tool_node_grid_x);
    gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.grid_coord_y'), cur_tool_node_grid_y);
    // Draw.
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  else if (selected_tool == 'move_grabbed') {
    if (move_grabbed_node_id >= 0 &&
        fsm_nodes[move_grabbed_node_id]) {
      var half_grid = 32;
      if (cur_fsm_x+cur_fsm_mouse_x < 0) { half_grid = -32; }
      var cur_node_grid_x = parseInt((cur_fsm_x+cur_fsm_mouse_x+half_grid)/64);
      if (cur_fsm_y+cur_fsm_mouse_y < 0) { half_grid = -32; }
      else { half_grid = 32; }
      var cur_node_grid_y = parseInt((cur_fsm_y+cur_fsm_mouse_y+half_grid)/64);
      gl.useProgram(node_shader_prog);
      // Bind texture.
      gl.bindTexture(gl.TEXTURE_2D, fsm_nodes[move_grabbed_node_id].tex_sampler);
      // Send uniform values.
      gl.uniform1f(gl.getUniformLocation(node_shader_prog, 'canvas_w'), canvas.width);
      gl.uniform1f(gl.getUniformLocation(node_shader_prog, 'canvas_h'), canvas.height);
      gl.uniform2fv(gl.getUniformLocation(node_shader_prog, 'cur_view_coords'), [cur_fsm_x, cur_fsm_y]);
      gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.tex_sampler'), fsm_nodes[move_grabbed_node_id].tex_sampler);
      gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.node_status'), 1);
      gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.grid_coord_x'), cur_node_grid_x);
      gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.grid_coord_y'), cur_node_grid_y);
      // Draw.
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
};

project_show_onload = function() {
  init_fsm_layout_canvas();

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
      fsm_nodes = node_array_from_json(loaded_fsm_nodes);
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
        cur_fsm_grid_x = parseInt(cur_fsm_x / 64);
        cur_fsm_grid_y = parseInt(cur_fsm_y / 64);

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
        //document.getElementById("list_last_fsm_tool_coords").innerHTML = ("Last FSM tool grid coordinates: (" + cur_tool_node_grid_x + ", " + cur_tool_node_grid_y + ")");
      }
    }
    //document.getElementById("list_last_fsm_mouse_coords").innerHTML = ("Last FSM grid mouse coordinates: (" + cur_fsm_mouse_x + ", " + cur_fsm_mouse_y + ")");
    // Redraw the canvas.
    redraw_canvas();
  };

  // Add a master 'on click' function for the FSM canvas.
  document.getElementById("fsm_canvas_div").onclick = function(e) {
    if (selected_tool == 'pointer') {
      // Get the grid coordinate closest to the current cursor.
      var half_grid = 32;
      if (cur_fsm_x+cur_fsm_mouse_x < 0) { half_grid = -32; }
      var cur_node_grid_x = parseInt((cur_fsm_x+cur_fsm_mouse_x+half_grid)/64);
      if (cur_fsm_y+cur_fsm_mouse_y < 0) { half_grid = -32; }
      else { half_grid = 32; }
      var cur_node_grid_y = parseInt((cur_fsm_y+cur_fsm_mouse_y+half_grid)/64);
      // If there is a node underneath the cursor, select it.
      var node_selected = false;
      for (var node_ind = 0; node_ind < 256; ++node_ind) {
        if (fsm_nodes[node_ind]) {
          if (fsm_nodes[node_ind].grid_coord_x == cur_node_grid_x &&
              fsm_nodes[node_ind].grid_coord_y == cur_node_grid_y) {
            node_selected = true;
            selected_node_id = node_ind;
            var sel_type = fsm_nodes[selected_node_id].node_type;
            document.getElementById("hobb_options_header").innerHTML = ("Options: (" + sel_type + ")");
            // In/Out connections table. The only case where this
            // won't be added is a 'global' node that affects
            // the entire program. Currently, that is only the
            // 'Define new variable' node.
            var selected_node_options_html = ""
            if (sel_type != 'New_Variable') {
              selected_node_options_html += node_io_options_html;
            }
            // Type-specific options:
            if (sel_type == 'Boot') {
              selected_node_options_html += boot_node_options_html;
            }
            else if (sel_type == 'Delay') {
              selected_node_options_html += delay_node_options_html;
            }
            else if (sel_type == 'GPIO_Init') {
              selected_node_options_html += init_gpio_node_options_html;
            }
            else if (sel_type == 'GPIO_Deinit') {
              selected_node_options_html += deinit_gpio_node_options_html;
            }
            else if (sel_type == 'GPIO_Output') {
              selected_node_options_html += set_gpio_out_node_options_html;
            }
            else if (sel_type == 'RCC_Enable') {
              selected_node_options_html += rcc_enable_node_options_html;
            }
            else if (sel_type == 'RCC_Disable') {
              selected_node_options_html += rcc_disable_node_options_html;
            }
            else if (sel_type == 'New_Variable') {
              selected_node_options_html += define_var_node_options_html;
            }
            else if (sel_type == 'Set_Variable') {
              selected_node_options_html += set_var_node_options_html;
            }
            else if (sel_type == 'Set_Var_Logic_Not') {
              selected_node_options_html += set_var_logic_not_node_options_html;
            }
            document.getElementById("hobb_options_content").innerHTML = selected_node_options_html;
            // Apply click listeners.
            apply_selected_node_option_listeners(sel_type);
            break;
          }
        }
      }
      // If not, Deselect.
      if (!node_selected) {
        selected_node_id = -1;
        document.getElementById("hobb_options_header").innerHTML = ("Options: (None)");
        document.getElementById("hobb_options_content").innerHTML = "";
      }
    }
    else if (selected_tool == 'tool') {
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
        //document.getElementById("list_last_fsm_tool_coords").innerHTML = ("Last FSM tool grid coordinates: (" + cur_tool_node_grid_x + ", " + cur_tool_node_grid_y + ")");
      }
      // Add the current tool node to the list, unless there is a
      // node in the proposed coordinates already.
      var already_populated = false;
      var index_to_use = -1;
      for (var node_ind = 0; node_ind < 256; ++node_ind) {
        if (fsm_nodes[node_ind]) {
          if (fsm_nodes[node_ind].grid_coord_x == cur_tool_node_grid_x &&
              fsm_nodes[node_ind].grid_coord_y == cur_tool_node_grid_y) {
            already_populated = true;
          }
          // Only allow one 'Boot' node. TODO: How to handle this?
          // For now, just don't place any more than one 'Boot' node.
          if (fsm_nodes[node_ind].node_type == 'Boot' &&
              cur_tool_node_type == 'Boot') {
            already_populated = true;
          }
        }
        else {
          if (index_to_use == -1) {
            index_to_use = node_ind;
          }
        }
      }
      if (!already_populated) {
        // Place a new node.
        fsm_nodes[index_to_use] = [];
        fsm_nodes[index_to_use].tex_sampler = cur_tool_node_tex;
        fsm_nodes[index_to_use].node_type = cur_tool_node_type;
        fsm_nodes[index_to_use].node_status = 0;
        fsm_nodes[index_to_use].node_color = cur_tool_node_color;
        fsm_nodes[index_to_use].connections = {
          left: 'none',
          right: 'none',
          up: 'none',
          down: 'none',
        };
        fsm_nodes[index_to_use].options = {};
        fsm_nodes[index_to_use].grid_coord_x = cur_tool_node_grid_x;
        fsm_nodes[index_to_use].grid_coord_y = cur_tool_node_grid_y;
      }

      // Re-draw the canvas to show the placed node.
      redraw_canvas();
    }
    else if (selected_tool == 'delete') {
      var half_grid = 32;
      if (cur_fsm_x+cur_fsm_mouse_x < 0) { half_grid = -32; }
      var cur_node_grid_x = parseInt((cur_fsm_x+cur_fsm_mouse_x+half_grid)/64);
      if (cur_fsm_y+cur_fsm_mouse_y < 0) { half_grid = -32; }
      else { half_grid = 32; }
      var cur_node_grid_y = parseInt((cur_fsm_y+cur_fsm_mouse_y+half_grid)/64);
      // If there is a node on the current grid coordinate, delete it.
      for (var node_ind = 0; node_ind < 256; ++node_ind) {
        if (fsm_nodes[node_ind]) {
          if (fsm_nodes[node_ind].grid_coord_x == cur_node_grid_x &&
              fsm_nodes[node_ind].grid_coord_y == cur_node_grid_y) {
            // (Un-select the node if deleting the current selection.)
            if (selected_node_id == node_ind) {
              selected_node_id = -1;
              document.getElementById("hobb_options_header").innerHTML = ("Options: (None)");
              document.getElementById("hobb_options_content").innerHTML = "";
            }
            fsm_nodes[node_ind] = null;
            // Squash the array of nodes.
            fsm_nodes = fsm_nodes.filter(array_filter_nulls);
            refresh_defined_vars();
          }
        }
      }

      // Re-draw the canvas.
      redraw_canvas();
    }
    else if (selected_tool == 'move') {
      var half_grid = 32;
      if (cur_fsm_x+cur_fsm_mouse_x < 0) { half_grid = -32; }
      var cur_node_grid_x = parseInt((cur_fsm_x+cur_fsm_mouse_x+half_grid)/64);
      if (cur_fsm_y+cur_fsm_mouse_y < 0) { half_grid = -32; }
      else { half_grid = 32; }
      var cur_node_grid_y = parseInt((cur_fsm_y+cur_fsm_mouse_y+half_grid)/64);
      // If there is a node on the currently-selected grid node, pick it up.
      var node_to_grab = -1;
      for (var node_ind = 0; node_ind < 256; ++node_ind) {
        if (fsm_nodes[node_ind]) {
          if (fsm_nodes[node_ind].grid_coord_x == cur_node_grid_x &&
              fsm_nodes[node_ind].grid_coord_y == cur_node_grid_y) {
            node_to_grab = node_ind;
            break;
          }
        }
      }
      if (node_to_grab != -1) {
        move_grabbed_node_id = node_to_grab;
        selected_tool = 'move_grabbed';
        $("#fsm_canvas_div").removeClass("hobb_layout_move_tool");
        $("#fsm_canvas_div").addClass("hobb_layout_move_tool_grabbed");
        // Re-draw the canvas.
        redraw_canvas();
      }
    }
    else if (selected_tool == 'move_grabbed') {
      var half_grid = 32;
      if (cur_fsm_x+cur_fsm_mouse_x < 0) { half_grid = -32; }
      var cur_node_grid_x = parseInt((cur_fsm_x+cur_fsm_mouse_x+half_grid)/64);
      if (cur_fsm_y+cur_fsm_mouse_y < 0) { half_grid = -32; }
      else { half_grid = 32; }
      var cur_node_grid_y = parseInt((cur_fsm_y+cur_fsm_mouse_y+half_grid)/64);
      var node_dropped = true;
      if (move_grabbed_node_id >= 0) {
        // If there is a 'grabbed' node, and if the currently-selected
        // grid node is empty, drop the grabbed node. Allow re-dropping
        // a node on the square that it previously occupied.
        for (var node_ind = 0; node_ind < 256; ++node_ind) {
          if (fsm_nodes[node_ind]) {
            if (fsm_nodes[node_ind].grid_coord_x == cur_node_grid_x &&
                fsm_nodes[node_ind].grid_coord_y == cur_node_grid_y &&
                node_ind != move_grabbed_node_id) {
              node_dropped = false;
            }
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

  // Add a click listener for the 'precompile' button/link.
  document.getElementById('precompile_button').onclick = function(e) {
    json_fsm_nodes = precompile_project();
    submit_precompile_request(json_fsm_nodes);
  };

  document.getElementById('save_fsm_project_link').onclick = function() {
    var nodes_string = node_array_to_json(fsm_nodes);
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
  // TODO: Branching nodes, like if/else.
  // Failure happens if/when:
  //   - No 'Boot' node.
  //   - An 'output' arrow points to grid node without an 'input' arrow.
  //   - A node has no 'output' arrow (except with special node types).
  //   - Multiple 'input' arrows lead away fron the grid coordinate
  //     pointed to by an 'output' arrow.
  //   - More than one variable with the same name is defined.
  // Produce warning messages if/when (TODO):
  //   - A node will never be reached.
  //   - A defined variable is never used.
  // Otherwise, each 'node' begins with a label, and can be branched to
  // with 'GOTO'. I know that's bad practice for human coders, but it
  // should work for now with simple single-scope auto-generated code.
  var boot_node = null;
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
      // Insert the node's information (minus 'output[s]') into the
      // JSON object to send to the controller action.
      // TODO: Method to set default node options?
      program_nodes.push({
        node_ind: prog_node_ind,
        node_type: cur_node.node_type,
        grid_coord_x: cur_node.grid_coord_x,
        grid_coord_y: cur_node.grid_coord_y,
        options: cur_node.options
      });
      // Specific logic for individual node types.
      if (cur_node.node_type == 'New_Variable') {
        // Global variable definition. TODO.
      }
      else if (cur_node.node_type == 'Boot') {
        // 'Boot' node. There should only be one of these.
        if (boot_node) {
          pre_pre_process_error += "Error: More than one 'Boot' node defined. There can only be one 'Boot' node, where the program starts.\n";
        }
        else {
          boot_node = grid_nodes_xy[cur_node.grid_coord_x][cur_node.grid_coord_y];
        }
      }
    }
  }
  if (!boot_node) {
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
    var cur_grid_x = boot_node.grid_coord_x;
    var cur_grid_y = boot_node.grid_coord_y;
    if (boot_node.connections.up == 'output') {
      cur_grid_y += 1;
    }
    else if (boot_node.connections.down == 'output') {
      cur_grid_y -= 1;
    }
    else if (boot_node.connections.left == 'output') {
      cur_grid_x -= 1;
    }
    else if (boot_node.connections.right == 'output') {
      cur_grid_x += 1;
    }
    else {
      pre_pre_process_error += "Error: 'Boot' node has no 'output' connection.\n";
    }

    // Now, enter the main node processing loop.
    var visited_nodes = [];
    visited_nodes["("+boot_node.grid_coord_x+","+boot_node.grid_coord_y+")"] = true;
    var cur_proc_node = boot_node;
    var done_processing = false;
    while (!done_processing) {
      // Find any nodes which have 'input' arrows originating from
      // the current grid coordinate. There should be exactly one.
      // If there are 0 or >1, error.
      var next_node = null;
      // 'Left'
      var temp_node = null;
      var temp_grid = grid_nodes_xy[cur_grid_x-1];
      if (temp_grid) {
        temp_node = temp_grid[cur_grid_y];
      }
      else { temp_node = null; }
      if (temp_node &&
          temp_node.connections &&
          temp_node.connections.right == 'input') {
        if (!next_node) {
          next_node = temp_node;
        }
        else {
          pre_pre_process_error += "Error: Grid coordinate (" + cur_grid_x + ", " + cur_grid_y + ") points to multiple 'input' arrows. Each 'output' arrow can only lead to one 'input' arrow.\n";
          done_processing = true;
        }
      }
      // 'Right'
      temp_grid = grid_nodes_xy[cur_grid_x+1];
      if (temp_grid) {
        temp_node = temp_grid[cur_grid_y];
      }
      else { temp_node = null; }
      if (temp_node &&
          temp_node.connections &&
          temp_node.connections.left == 'input') {
        if (!next_node) {
          next_node = temp_node;
        }
        else {
          pre_pre_process_error += "Error: Grid coordinate (" + cur_grid_x + ", " + cur_grid_y + ") points to multiple 'input' arrows. Each 'output' arrow can only lead to one 'input' arrow.\n";
          done_processing = true;
        }
      }
      // 'Up'
      temp_grid = grid_nodes_xy[cur_grid_x];
      if (temp_grid) {
        temp_node = temp_grid[cur_grid_y+1];
      }
      else { temp_node = null; }
      if (temp_node &&
          temp_node.connections &&
          temp_node.connections.down == 'input') {
        if (!next_node) {
          next_node = temp_node;
        }
        else {
          pre_pre_process_error += "Error: Grid coordinate (" + cur_grid_x + ", " + cur_grid_y + ") points to multiple 'input' arrows. Each 'output' arrow can only lead to one 'input' arrow.\n";
          done_processing = true;
        }
      }
      // 'Down'
      temp_grid = grid_nodes_xy[cur_grid_x];
      if (temp_grid) {
        temp_node = temp_grid[cur_grid_y-1];
      }
      else { temp_node = null; }
      if (temp_node &&
          temp_node.connections &&
          temp_node.connections.up == 'input') {
        if (!next_node) {
          next_node = temp_node;
        }
        else {
          pre_pre_process_error += "Error: Grid coordinate (" + cur_grid_x + ", " + cur_grid_y + ") points to multiple 'input' arrows. Each 'output' arrow can only lead to one 'input' arrow.\n";
          done_processing = true;
        }
      }
      if (!next_node) {
        pre_pre_process_error += "Error: Grid coordinate (" + cur_grid_x + ", " + cur_grid_y + ") does not point to any 'input' arrows. If an output is pointing directly at a node, move that node over and give it an 'input' arrow.\n";
        done_processing = true;
      }
      else {
        program_nodes[cur_proc_node.pn_index].output = {
          single: next_node.pn_index
        };
        if (visited_nodes["("+next_node.grid_coord_x+","+next_node.grid_coord_y+")"]) {
          done_processing = true;
        }
        else {
          cur_grid_x = next_node.grid_coord_x;
          cur_grid_y = next_node.grid_coord_y;
          // TODO: Process the next node.
          cur_proc_node = next_node;
          visited_nodes["("+next_node.grid_coord_x+","+next_node.grid_coord_y+")"] = true;
          if (next_node.connections.up == 'output') {
            cur_grid_y += 1;
          }
          else if (next_node.connections.down == 'output') {
            cur_grid_y -= 1;
          }
          else if (next_node.connections.left == 'output') {
            cur_grid_x -= 1;
          }
          else if (next_node.connections.right == 'output') {
            cur_grid_x += 1;
          }
          else {
            pre_pre_process_error += "Error: Node at coordinates (" + cur_grid_x + ", " + cur_grid_y + ") has no 'output' connection.\n";
            done_processing = true;
          }
        }
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
    };
  }
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
      var cur_node = fsm_nodes[selected_node_id];
      if (cur_node && cur_node.connections) {
        cur_node.connections.up = 'none';
      }
    }
    else if (top_select_tag.value == 'Input') {
      var cur_node = fsm_nodes[selected_node_id];
      if (cur_node && cur_node.connections) {
        cur_node.connections.up = 'input';
      }
    }
    else if (top_select_tag.value == 'Output') {
      var cur_node = fsm_nodes[selected_node_id];
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
      var cur_node = fsm_nodes[selected_node_id];
      if (cur_node && cur_node.connections) {
        cur_node.connections.left = 'none';
      }
    }
    else if (left_select_tag.value == 'Input') {
      var cur_node = fsm_nodes[selected_node_id];
      if (cur_node && cur_node.connections) {
        cur_node.connections.left = 'input';
      }
    }
    else if (left_select_tag.value == 'Output') {
      var cur_node = fsm_nodes[selected_node_id];
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
      var cur_node = fsm_nodes[selected_node_id];
      if (cur_node && cur_node.connections) {
        cur_node.connections.right = 'none';
      }
    }
    else if (right_select_tag.value == 'Input') {
      var cur_node = fsm_nodes[selected_node_id];
      if (cur_node && cur_node.connections) {
        cur_node.connections.right = 'input';
      }
    }
    else if (right_select_tag.value == 'Output') {
      var cur_node = fsm_nodes[selected_node_id];
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
      var cur_node = fsm_nodes[selected_node_id];
      if (cur_node && cur_node.connections) {
        cur_node.connections.down = 'none';
      }
    }
    else if (bot_select_tag.value == 'Input') {
      var cur_node = fsm_nodes[selected_node_id];
      if (cur_node && cur_node.connections) {
        cur_node.connections.down = 'input';
      }
    }
    else if (bot_select_tag.value == 'Output') {
      var cur_node = fsm_nodes[selected_node_id];
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

var apply_boot_node_options_listeners = function() {
  var cur_node = fsm_nodes[selected_node_id];
  var chip_sel_tag = document.getElementById("boot_options_mcu_chip_tag");
  if (mcu_chip == 'STM32F030F4') {
    chip_sel_tag.value = 'STM32F030F4';
    cur_node.options.chip_type = 'STM32F030F4';
  }
  else if (mcu_chip == 'STM32F031F6') {
    chip_sel_tag.value = 'STM32F031F6';
    cur_node.options.chip_type = 'STM32F031F6';
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

var apply_gpio_deinit_options_listeners = function() {
  var cur_node = fsm_nodes[selected_node_id];
  var gpio_bank_tag = document.getElementById('deinit_gpio_options_pin_bank_tag');
  var gpio_pin_tag = document.getElementById('deinit_gpio_options_pin_number_tag');

  // Set values according to node options.
  if (cur_node.options.gpio_bank) {
    gpio_bank_tag.value = cur_node.options.gpio_bank;
  }
  if (cur_node.options.gpio_pin) {
    gpio_pin_tag.value = cur_node.options.gpio_pin;
  }

  // Set click listener functions.
  gpio_bank_tag.onchange = function() {
    cur_node.options.gpio_bank = gpio_bank_tag.value;
  };
  gpio_pin_tag.onchange = function() {
    cur_node.options.gpio_pin = gpio_pin_tag.value;
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
      <input id="define_var_options_int_tag" class="define_var_options_int_input" type="number" value="0">
    `;
    var_val_tag = document.getElementById('define_var_options_int_tag');
  }
  else if (var_type_tag.value == 'float') {
    var_val_cell.innerHTML = `
      <input id="define_var_options_float_tag" class="define_var_options_float_input" type="number" value="0" step="0.000001">
    `;
    var_val_tag = document.getElementById('define_var_options_float_tag');
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
  }

  // Set 'var value' type according to node option.
  if (cur_node.options.var_val && var_val_tag) {
    var_val_tag.value = cur_node.options.var_val;
  }

  // Set click listener functions.
  var_name_tag.oninput = function() {
    cur_node.options.var_name = var_name_tag.value;
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
  var var_val_cell = document.getElementById('set_var_options_var_new_value_cel');
  // Populate the dropdown select menu with currently-defined variables.
  var sel_html_opts = `
    <option selected="true" value="(None)" id="set_var_options_var_list_n/a" class="set_var_options_var_list_option">
      (None defined)
    </option>
  `;
  for (var var_name in defined_vars) {
    var var_def = defined_vars[var_name];
    sel_html_opts += `
      <option selected="true" value="` + var_def.name + `" id="set_var_options_var_list_` + var_def.name + `" class="set_var_options_var_list_option">
        ` + var_def.name + `
      </option>
    `;
  }
  var_name_tag.innerHTML = sel_html_opts;
};

// Common 'new node selected' call.
var apply_selected_node_option_listeners = function(node_type) {
  // 'Global' nodes have no I/O connections table.
  if (node_type != 'New_Variable') {
    apply_node_io_table_listeners(node_type);
  }

  // 'Boot' node.
  if (node_type == 'Boot') {
    apply_boot_node_options_listeners();
  }
  else if (node_type == 'Delay') {
    apply_delay_node_options_listeners();
  }
  else if (node_type == 'GPIO_Init') {
    apply_gpio_init_options_listeners();
  }
  else if (node_type == 'GPIO_Deinit') {
    apply_gpio_deinit_options_listeners();
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
};
