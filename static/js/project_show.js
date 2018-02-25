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
  var grid_max_x = cur_fsm_grid_x + parseInt(canvas.width/64) + 2;
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
        else if (fsm_nodes[node_ind].connections.up == 'output_T') {
          gl.bindTexture(gl.TEXTURE_2D, loaded_textures['up_arrow_green']);
          gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'tex_sampler'), loaded_textures['up_arrow_green']);
          // Draw.
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        else if (fsm_nodes[node_ind].connections.up == 'output_F') {
          gl.bindTexture(gl.TEXTURE_2D, loaded_textures['up_arrow_pink']);
          gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'tex_sampler'), loaded_textures['up_arrow_pink']);
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
        else if (fsm_nodes[node_ind].connections.down == 'output_T') {
          gl.bindTexture(gl.TEXTURE_2D, loaded_textures['down_arrow_green']);
          gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'tex_sampler'), loaded_textures['down_arrow_green']);
          // Draw.
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        else if (fsm_nodes[node_ind].connections.down == 'output_F') {
          gl.bindTexture(gl.TEXTURE_2D, loaded_textures['down_arrow_pink']);
          gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'tex_sampler'), loaded_textures['down_arrow_pink']);
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
        else if (fsm_nodes[node_ind].connections.left == 'output_T') {
          gl.bindTexture(gl.TEXTURE_2D, loaded_textures['left_arrow_green']);
          gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'tex_sampler'), loaded_textures['left_arrow_green']);
          // Draw.
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        else if (fsm_nodes[node_ind].connections.left == 'output_F') {
          gl.bindTexture(gl.TEXTURE_2D, loaded_textures['left_arrow_pink']);
          gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'tex_sampler'), loaded_textures['left_arrow_pink']);
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
        else if (fsm_nodes[node_ind].connections.right == 'output_T') {
          gl.bindTexture(gl.TEXTURE_2D, loaded_textures['right_arrow_green']);
          gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'tex_sampler'), loaded_textures['right_arrow_green']);
          // Draw.
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        else if (fsm_nodes[node_ind].connections.right == 'output_F') {
          gl.bindTexture(gl.TEXTURE_2D, loaded_textures['right_arrow_pink']);
          gl.uniform1i(gl.getUniformLocation(conn_shader_prog, 'tex_sampler'), loaded_textures['right_arrow_pink']);
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
      refresh_selected_menu_tool();
    }
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
            document.getElementById("hobb_options_header").innerHTML = ("Options: (" + sel_type + ", " + fsm_nodes[node_ind].pn_index + ")");
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
                  sel_type == 'Check_Equals') {
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
                  // (TODO: Enable for all nodes)
                  // For specified nodes, use auto-generated
                  // attributes instead of hand-written ones.
                  if (cur_type.base_name == 'Boot' ||
                      cur_type.base_name == 'Delay' ||
                      cur_type.base_name == 'Label' ||
                      cur_type.base_name == 'Jump' ||
                      cur_type.base_name == 'RCC_Enable' ||
                      cur_type.base_name == 'RCC_Disable' ||
                      cur_type.base_name == 'GPIO_Init' ||
                      cur_type.base_name == 'Set_Var_Logic_Not' ||
                      cur_type.base_name == 'Nop_Node') {
                    selected_node_options_html += cur_type.options_gen_html;
                  }
                  else {
                    selected_node_options_html += cur_type.options_html;
                  }
                  break;
                }
              }
            }
            document.getElementById("hobb_options_content").innerHTML = selected_node_options_html;
            // Apply click listeners.
            apply_selected_node_option_listeners(fsm_nodes[node_ind]);
            break;
          }
        }
      }
      // If not, Deselect.
      if (!node_selected) {
        selected_node_id = -1;
        document.getElementById("hobb_options_header").innerHTML = ("Options: (None)");
        $("#hobb_options_content").empty();
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
        fsm_nodes[index_to_use].options = default_options_for_type(cur_tool_node_type);
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
              $("#hobb_options_content").empty();
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
      cur_node.pn_index = prog_node_ind;
      // Insert the node's information (minus 'output[s]') into the
      // JSON object to send to the controller action.
      // Do not add 'No-op', 'Label', or 'Jump' nodes.
      if (cur_node.node_type != 'Nop_Node' &&
          cur_node.node_type != 'Label' &&
          cur_node.node_type != 'Jump') {
        program_nodes.push({
          node_ind: prog_node_ind,
          node_type: cur_node.node_type,
          grid_coord_x: cur_node.grid_coord_x,
          grid_coord_y: cur_node.grid_coord_y,
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
    // Now, enter the main node processing loop.
    var cur_proc_node = boot_node;
    var visited_nodes = [];
    visited_nodes["("+boot_node.grid_coord_x+","+boot_node.grid_coord_y+")"] = true;
    var done_processing = false;
    var remaining_branches = [boot_node];
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
          pre_pre_process_error += "Error: Node at (" + grid_x + ", " + grid_y + ") has no 'output' connection.\n";
          return false;
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
          proc_node.node_type == 'Check_Equals') {
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

          // Check that both 'if/else' branches exist.
          if (!next_node_t || !next_node_f) {
            pre_pre_process_error += "Error: Branching node at (" + cur_grid_node_x + ", " + cur_grid_node_y + ") does not point to valid 'input' arrows with both of its outputs.\n";
            return false;
          }
          else {
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
            pre_pre_process_error += "Error: Node at (" + cur_grid_node_x + ", " + cur_grid_node_y + ") has no 'output' connection.\n";
            return false;
          }
          var next_node = find_input_node(cur_grid_node_x, cur_grid_node_y);
          if (!next_node) {
            pre_pre_process_error += "Error: Grid coordinate (" + cur_grid_node_x + ", " + cur_grid_node_y + ") does not point to any 'input' arrows. If an output is pointing directly at a node, move that node over and give it an 'input' arrow.\n";
            return false;
          }
          else {
            program_nodes[proc_node.pn_index].output = {
              single: next_node.pn_index
            };
            if (!visited_nodes["("+next_node.grid_coord_x+","+next_node.grid_coord_y+")"]) {
              visited_nodes["("+next_node.grid_coord_x+","+next_node.grid_coord_y+")"] = true;
              remaining_branches.push(next_node);
            }
            return true;
          }
        }
        else {
          pre_pre_process_error += "Unknown: Node 'connections' invalid\n";
          return false;
        }
      }
    };

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
