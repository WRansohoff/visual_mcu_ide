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
const frag_sh = `#version 300 es
  // Struct definitions.
  struct FSM_Node {
    sampler2D tex_sampler;
    int node_status;
    int grid_coord_x;
    int grid_coord_y;
  };
  struct FSM_Conn {
    int start_coord_x;
    int start_coord_y;
    int end_coord_x;
    int end_coord_y;
  };
  // Inputs.
  precision mediump float;
  uniform   float canvas_w;
  uniform   float canvas_h;
  uniform   vec2 cur_view_coords;
  uniform   FSM_Node nodes[256];
  uniform   FSM_Node cur_tool_node;
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

    // Next, draw the 'currently-selected' tool if necessary.
    if (cur_tool_node.node_status != -1) {
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
        cur_tool_s /= 64.0;
        cur_tool_t /= 64.0;
        cur_tool_t = 1.0 - cur_tool_t;
        vec2 cur_tool_st = vec2(cur_tool_s, cur_tool_t);
        out_color = texture(cur_tool_node.tex_sampler, cur_tool_st);
      }
    }
  }
`;

// 'Global' variables to use.
var selected_tool = "pan";
var selected_menu_tool = "";
var is_currently_panning = false;
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
var shader_prog = null;
// Array for keeping track of FSM node structs to send to the shader.
var fsm_nodes = [];
var fsm_node_locs = [];
var fsm_node_struct_fields = [
  "tex_sampler",
  "node_status",
  "grid_coord_x",
  "grid_coord_y",
];
// 'currently-selected preview' node info.
var cur_tool_node_tex = -1;
var cur_tool_node_grid_x = 0;
var cur_tool_node_grid_y = 0;
// Preloaded textures
var loaded_textures = [];

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

preload_textures = function() {
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
    gl.texImage2D(gl.TEXTURE_2D, mip_level, format, format, src_type, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    loaded_textures["Boot"] = tex;
  };
  img.src = "/static/fsm_assets/boot_node.png";
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
  const fs = load_shader(gl, gl.FRAGMENT_SHADER, frag_sh);
  shader_prog = gl.createProgram();
  gl.attachShader(shader_prog, vs);
  gl.attachShader(shader_prog, fs);
  gl.linkProgram(shader_prog);
  if (!gl.getProgramParameter(shader_prog, gl.LINK_STATUS)) {
    alert("Couldn't initialize shader program - log:\n" + gl.getProgramInfoLog(shader_prog));
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
  gl.vertexAttribPointer(gl.getAttribLocation(shader_prog, 'vp'),
                         2, // number of components
                         gl.FLOAT,
                         false, // normalize?
                         0, 0);
  gl.enableVertexAttribArray(gl.getAttribLocation(shader_prog, 'vp'));

  // Use the current shader program.
  gl.useProgram(shader_prog);

  // Pre-fill FSM node arrays with null/default values.
  for (var node_ind = 0; node_ind < 256; ++node_ind) {
    fsm_nodes[node_ind] = null;
    fsm_node_locs[node_ind] = [];
    fsm_node_locs[node_ind]["tex_sampler"] = gl.getUniformLocation(shader_prog, "nodes[" + node_ind + "].tex_sampler");
    fsm_node_locs[node_ind]["node_status"] = gl.getUniformLocation(shader_prog, "nodes[" + node_ind + "].node_status");
    fsm_node_locs[node_ind]["grid_coord_x"] = gl.getUniformLocation(shader_prog, "nodes[" + node_ind + "].grid_coord_x");
    fsm_node_locs[node_ind]["grid_coord_y"] = gl.getUniformLocation(shader_prog, "nodes[" + node_ind + "].grid_coord_y");
  }

  // Draw.
  redraw_canvas();
};

redraw_canvas = function() {
  const canvas = document.getElementById("fsm_layout_canvas");
  // Send uniform values.
  gl.uniform1f(gl.getUniformLocation(shader_prog, 'canvas_w'), canvas.width);
  gl.uniform1f(gl.getUniformLocation(shader_prog, 'canvas_h'), canvas.height);
  gl.uniform2fv(gl.getUniformLocation(shader_prog, 'cur_view_coords'), [cur_fsm_x, cur_fsm_y]);
  // Send 'node' uniform values. If a node doesn't exist,
  // set sampler to -1 and coords to (0, 0).
  for (var node_ind = 0; node_ind < 256; ++node_ind) {
    if (fsm_nodes[node_ind] == null) {
      // Find/send empty uniform values.
      //gl.uniform1i(fsm_node_locs[node_ind]["tex_sampler"], 0);
      gl.uniform1i(fsm_node_locs[node_ind]["node_status"], -1);
      gl.uniform1i(fsm_node_locs[node_ind]["grid_coord_x"], 0);
      gl.uniform1i(fsm_node_locs[node_ind]["grid_coord_y"], 0);
    }
    else {
      if (fsm_nodes[node_ind]["node_status"] == -1) {
        //gl.uniform1i(fsm_node_locs[node_ind]["tex_sampler"], fsm_nodes[node_ind]["tex_sampler"]);
        gl.uniform1i(fsm_node_locs[node_ind]["node_status"], fsm_nodes[node_ind]["node_status"]);
      }
      else {
        gl.uniform1i(fsm_node_locs[node_ind]["tex_sampler"], fsm_nodes[node_ind]["tex_sampler"]);
        gl.uniform1i(fsm_node_locs[node_ind]["node_status"], fsm_nodes[node_ind]["node_status"]);
      }
      gl.uniform1i(fsm_node_locs[node_ind]["grid_coord_x"], fsm_nodes[node_ind]["grid_coord_x"]);
      gl.uniform1i(fsm_node_locs[node_ind]["grid_coord_y"], fsm_nodes[node_ind]["grid_coord_y"]);
    }
  }
  // Send 'current tool' node if necessary.
  if (selected_tool == 'tool') {
    if (cur_tool_node_tex == -1) {
      //gl.uniform1i(gl.getUniformLocation(shader_prog, 'cur_tool_node.tex_sampler'), 0);
      gl.uniform1i(gl.getUniformLocation(shader_prog, 'cur_tool_node.node_status'), -1);
    }
    else {
      gl.uniform1i(gl.getUniformLocation(shader_prog, 'cur_tool_node.tex_sampler'), cur_tool_node_tex);
      gl.uniform1i(gl.getUniformLocation(shader_prog, 'cur_tool_node.node_status'), 0);
    }
    gl.uniform1i(gl.getUniformLocation(shader_prog, 'cur_tool_node.grid_coord_x'), cur_tool_node_grid_x);
    gl.uniform1i(gl.getUniformLocation(shader_prog, 'cur_tool_node.grid_coord_y'), cur_tool_node_grid_y);
  }
  else {
    //gl.uniform1i(gl.getUniformLocation(shader_prog, 'cur_tool_node.tex_sampler'), 0);
    gl.uniform1i(gl.getUniformLocation(shader_prog, 'cur_tool_node.node_status'), -1);
    gl.uniform1i(gl.getUniformLocation(shader_prog, 'cur_tool_node.grid_coord_x'), 0);
    gl.uniform1i(gl.getUniformLocation(shader_prog, 'cur_tool_node.grid_coord_y'), 0);
  }

  // Draw.
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

project_show_onload = function() {
  init_fsm_layout_canvas();

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
    $("#fsm_canvas_div").addClass("hobb_layout_pointer_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_pan_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_pan_tool_down");
    $("#fsm_canvas_div").removeClass("hobb_layout_tool_tool");
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
    $("#fsm_canvas_div").removeClass("hobb_layout_pointer_tool");
    $("#fsm_canvas_div").addClass("hobb_layout_pan_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_pan_tool_down");
    $("#fsm_canvas_div").removeClass("hobb_layout_tool_tool");
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
    $("#fsm_canvas_div").removeClass("hobb_layout_pointer_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_pan_tool");
    $("#fsm_canvas_div").removeClass("hobb_layout_pan_tool_down");
    $("#fsm_canvas_div").addClass("hobb_layout_tool_tool");
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
        document.getElementById("list_current_fsm_coords").innerHTML = ("FSM Co-ords (bottom-left): (" + cur_fsm_x + ", " + cur_fsm_y + ")");
        document.getElementById("list_current_fsm_grid_coords").innerHTML = ("= Grid Coordinates: (" + cur_fsm_grid_x + ", " + cur_fsm_grid_y + ")");
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
      var menu_tool_selected = false;
      // 'Boot' node, for testing.
      if (selected_menu_tool == 'Boot' && loaded_textures["Boot"]) {
        cur_tool_node_tex = loaded_textures['Boot'];
        menu_tool_selected = true;
      }
      else {
        cur_tool_node_tex = -1;
      }
      // If there is a texture for the selection, find its grid coord.
      // (So, x/y coordinates / 64. (or whatever dot distance if it changes)
      if (menu_tool_selected) {
        var half_grid = 32;
        if (cur_fsm_x+cur_fsm_mouse_x < 0) { half_grid = -32; }
        cur_tool_node_grid_x = parseInt((cur_fsm_x+cur_fsm_mouse_x+half_grid)/64);
        if (cur_fsm_y+cur_fsm_mouse_y < 0) { half_grid = -32; }
        else { half_grid = 32; }
        cur_tool_node_grid_y = parseInt((cur_fsm_y+cur_fsm_mouse_y+half_grid)/64);
        document.getElementById("list_last_fsm_tool_coords").innerHTML = ("Last FSM tool grid coordinates: (" + cur_tool_node_grid_x + ", " + cur_tool_node_grid_y + ")");
      }
    }
    document.getElementById("list_last_fsm_mouse_coords").innerHTML = ("Last FSM grid mouse coordinates: (" + cur_fsm_mouse_x + ", " + cur_fsm_mouse_y + ")");
    // Redraw the canvas.
    redraw_canvas();
  };
};
