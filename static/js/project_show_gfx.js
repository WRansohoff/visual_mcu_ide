// Shaders.
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
  uniform float zoom_factor;
  // Output color.
  out       vec4 out_color;
  void main() {
    // Draw a 'pegboard' view.
    int grid_spacing = int(64.0 * zoom_factor);
    int cur_x = int(cur_view_coords.x);
    int cur_y = int(cur_view_coords.y);
    int x_mod = cur_x % grid_spacing;
    int y_mod = cur_y % grid_spacing;
    int cur_px_x = int(gl_FragCoord.x);
    int cur_px_x_mod = cur_px_x % grid_spacing;
    cur_px_x_mod = grid_spacing-cur_px_x_mod;
    int cur_px_y = int(gl_FragCoord.y);
    int cur_px_y_mod = cur_px_y % grid_spacing;
    cur_px_y_mod = grid_spacing-cur_px_y_mod;
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
        if ((x_mod+x_prog == cur_px_x_mod || x_mod+x_prog+grid_spacing == cur_px_x_mod)
            && (y_mod+y_prog == cur_px_y_mod || y_mod+y_prog+grid_spacing == cur_px_y_mod)) {
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
    int node_w;
    int node_h;
  };
  // Inputs.
  uniform   float canvas_w;
  uniform   float canvas_h;
  uniform   vec2 cur_view_coords;
  uniform   FSM_Node cur_tool_node;
  uniform   float zoom_factor;
  // Output color.
  out       vec4 out_color;
  void main() {
    // Gather grid/view information.
    int grid_spacing = int(64.0 * zoom_factor);
    int half_grid = grid_spacing/2;
    int cur_x = int(cur_view_coords.x);
    int cur_y = int(cur_view_coords.y);
    int cur_px_x = int(gl_FragCoord.x);
    int cur_px_y = int(gl_FragCoord.y);

    // Draw the supplied node.
    if (cur_tool_node.node_status >= 0) {
      // Find the current node's lower-left grid coordinate,
      // relative to the current viewport.
      int cur_tool_node_local_x = cur_tool_node.grid_coord_x * grid_spacing;
      cur_tool_node_local_x -= int(cur_view_coords.x);
      int cur_tool_node_local_y = cur_tool_node.grid_coord_y * grid_spacing;
      cur_tool_node_local_y -= int(cur_view_coords.y);
      int cur_tool_node_min_x = cur_tool_node_local_x - half_grid;
      int cur_tool_node_max_x = cur_tool_node_local_x + half_grid + ((cur_tool_node.node_w-1) * grid_spacing);
      int cur_tool_node_min_y = cur_tool_node_local_y - half_grid;
      int cur_tool_node_max_y = cur_tool_node_local_y + half_grid + ((cur_tool_node.node_h-1) * grid_spacing);
      if (cur_px_x >= cur_tool_node_min_x &&
          cur_px_x <= cur_tool_node_max_x &&
          cur_px_y >= cur_tool_node_min_y &&
          cur_px_y <= cur_tool_node_max_y) {
        // Texture coordinates are [0:1]; stretch to the pixel
        // range given by (max-min) X/Y values.
        float cur_tool_s = float(cur_px_x - cur_tool_node_min_x);
        float cur_tool_t = float(cur_px_y - cur_tool_node_min_y);
        int stripes_check = int(cur_tool_s+cur_tool_t);
        const int stripes_w = 16;
        const int stripes_s = 4;
        cur_tool_s /= float(grid_spacing * cur_tool_node.node_w);
        cur_tool_t /= float(grid_spacing * cur_tool_node.node_h);
        cur_tool_t = 1.0 - cur_tool_t;
        vec2 cur_tool_st = vec2(cur_tool_s, cur_tool_t);
        if (cur_tool_node.node_status == 1) {
          // Apply a 'striping' transparency effect to indicate
          // that this node is in a temporary or transient state.
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
  uniform float zoom_factor;
  // [0:3] = [top, left, bottom, right].
  uniform int  conn_position;
  // Output color.
  out     vec4 out_color;
  void main() {
    // Gather grid/view information.
    int grid_spacing = int(64.0 * zoom_factor);
    int pacman_spacing = 3*(grid_spacing/4);
    int w_tex_mult = int(float(conn_tex_w) * zoom_factor);
    int h_tex_mult = int(float(conn_tex_h) * zoom_factor);
    int cur_x = int(cur_view_coords.x);
    int cur_y = int(cur_view_coords.y);
    int cur_px_x = int(gl_FragCoord.x);
    int cur_px_y = int(gl_FragCoord.y);
    // Find the right grid coordinate's location relative to the window.
    int cur_node_conn_local_x = node_grid_x * grid_spacing;
    cur_node_conn_local_x -= int(cur_view_coords.x);
    int cur_node_conn_local_y = node_grid_y * grid_spacing;
    cur_node_conn_local_y -= int(cur_view_coords.y);
    int cur_node_conn_min_x = cur_node_conn_local_x - (w_tex_mult/2);
    int cur_node_conn_max_x = cur_node_conn_local_x + (w_tex_mult/2);
    int cur_node_conn_min_y = cur_node_conn_local_y - (h_tex_mult/2);
    int cur_node_conn_max_y = cur_node_conn_local_y + (h_tex_mult/2);
    // TODO: Constants.
    if (conn_position == 0) {
      // 'up'
      cur_node_conn_min_y += pacman_spacing;
      cur_node_conn_max_y += pacman_spacing;
    }
    else if (conn_position == 1) {
      // 'left'
      cur_node_conn_min_x -= pacman_spacing;
      cur_node_conn_max_x -= pacman_spacing;
    }
    else if (conn_position == 2) {
      // 'down'
      cur_node_conn_min_y -= pacman_spacing;
      cur_node_conn_max_y -= pacman_spacing;
    }
    else if (conn_position == 3) {
      // 'right'
      cur_node_conn_min_x += pacman_spacing;
      cur_node_conn_max_x += pacman_spacing;
    }
    if (cur_px_x >= cur_node_conn_min_x &&
        cur_px_x <= cur_node_conn_max_x &&
        cur_px_y >= cur_node_conn_min_y &&
        cur_px_y <= cur_node_conn_max_y) {
      float cur_conn_s = float(cur_px_x - cur_node_conn_min_x);
      float cur_conn_t = float(cur_px_y - cur_node_conn_min_y);
      cur_conn_s /= float(w_tex_mult);
      cur_conn_t /= float(h_tex_mult);
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
  const node_detail_fs = load_shader(gl, gl.FRAGMENT_SHADER, node_frag_sh);
  const conn_fs = load_shader(gl, gl.FRAGMENT_SHADER, conn_frag_sh);
  grid_shader_prog = gl.createProgram();
  node_shader_prog = gl.createProgram();
  conn_shader_prog = gl.createProgram();
  gl.attachShader(grid_shader_prog, vs);
  gl.attachShader(grid_shader_prog, grid_fs);
  gl.linkProgram(grid_shader_prog);
  gl.attachShader(node_shader_prog, vs);
  gl.attachShader(node_shader_prog, node_detail_fs);
  gl.linkProgram(node_shader_prog);
  gl.attachShader(conn_shader_prog, vs);
  gl.attachShader(conn_shader_prog, conn_fs);
  gl.linkProgram(conn_shader_prog);
  if (!gl.getProgramParameter(grid_shader_prog, gl.LINK_STATUS)) {
    alert("Couldn't initialize grid shader program - log:\n" + gl.getProgramInfoLog(grid_shader_prog));
    return;
  }
  if (!gl.getProgramParameter(node_shader_prog, gl.LINK_STATUS)) {
    alert("Couldn't initialize 'new GFX' node shader program - log:\n" + gl.getProgramInfoLog(node_shader_prog));
    return;
  }
  if (!gl.getProgramParameter(conn_shader_prog, gl.LINK_STATUS)) {
    alert("Couldn't initialize connections shader program - log:\n" + gl.getProgramInfoLog(conn_shader_prog));
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

  // Setup 'on scroll' listener to zoom in/out.
  canvas.onmousewheel = function(e) {
    var dy = null;
    if (e.wheelDelta) {
      dy = e.wheelDelta;
    }
    else {
      dy = -1 * e.deltaY;
    }

    // Attenuate the raw delta value a bit.
    dy /= 1000;
    if (dy > 10.0) { dy = 10.0; }
    else if (dy < -10.0) { dy = -10.0; }
    var old_zoom_w = cur_zoom * canvas.width;
    var old_zoom_h = cur_zoom * canvas.height;
    cur_zoom += dy;
    // Enforce a maximum 'zoomed-out' level.
    if (cur_zoom < 0.2) { cur_zoom = 0.2; }
    var new_zoom_w = cur_zoom * canvas.width;
    var new_zoom_h = cur_zoom * canvas.height;
    // Zoom on a point determined by the mouse position...?
    // So, get the difference in w/h caused by zoom levels,
    // and then shift viewport x/y depending on the % across
    // the canvas the mouse is.
    // This works-ish, but is pretty rough. TODO
    var mouse_x_ratio = cur_fsm_mouse_x / canvas.width;
    var mouse_y_ratio = cur_fsm_mouse_y / canvas.height;
    cur_fsm_x += (new_zoom_w - old_zoom_w) * mouse_x_ratio;
    cur_fsm_y += (new_zoom_h - old_zoom_h) * mouse_y_ratio;
    var hg_base = zoom_base * cur_zoom;
    cur_fsm_grid_x = parseInt(cur_fsm_x / hg_base);
    cur_fsm_grid_y = parseInt(cur_fsm_y / hg_base);
    redraw_canvas();
    //console.log("Zoom: " + cur_zoom);
  };

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
  gl.uniform1f(gl.getUniformLocation(grid_shader_prog, 'zoom_factor'), cur_zoom);

  // Draw.
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // Next, draw any nodes that are within the current view.
  // TODO: Don't assume that nodes are 1x1 anymore.
  var grid_min_x = cur_fsm_grid_x - 2;
  var grid_min_y = cur_fsm_grid_y - 1;
  var hg_base = zoom_base*cur_zoom;
  var grid_max_x = cur_fsm_grid_x + parseInt(canvas.width/hg_base) + 2;
  var grid_max_y = cur_fsm_grid_y + parseInt(canvas.height/hg_base) + 1;
  for (var node_ind in fsm_nodes) {
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
      gl.uniform1f(gl.getUniformLocation(node_shader_prog, 'zoom_factor'), cur_zoom);
      // TODO: Handle 'node_status' properly...
      if (move_grabbed_node_id == node_ind) {
        gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.node_status'), 1);
      }
      else {
        gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.node_status'), fsm_nodes[node_ind].node_status);
      }
      gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.grid_coord_x'), fsm_nodes[node_ind].grid_coord_x);
      gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.grid_coord_y'), fsm_nodes[node_ind].grid_coord_y);
      var node_grid_w = 1;
      var node_grid_h = 1;
      var n_type = get_node_type_def_by_name(fsm_nodes[node_ind].node_type);
      if (n_type && n_type.new_gfx) {
        node_grid_w = n_type.node_w;
        node_grid_h = n_type.node_h;
      }
      gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.node_w'), node_grid_w);
      gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.node_h'), node_grid_h);
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
        gl.uniform1f(gl.getUniformLocation(conn_shader_prog, 'zoom_factor'), cur_zoom);
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
    var node_grid_w = 1;
    var node_grid_h = 1;
    var n_type = get_node_type_def_by_name(cur_tool_node_type);
    if (n_type && n_type.new_gfx) {
      node_grid_w = n_type.node_w;
      node_grid_h = n_type.node_h;
    }
    gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.node_w'), node_grid_w);
    gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.node_h'), node_grid_h);
    // Draw.
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  else if (selected_tool == 'move_grabbed') {
    if (move_grabbed_node_id >= 0 &&
        fsm_nodes[move_grabbed_node_id]) {
      var hg_base = zoom_base*cur_zoom;
      var half_grid = hg_base/2;
      if (cur_fsm_x+cur_fsm_mouse_x < 0) { half_grid = -(hg_base/2); }
      var cur_node_grid_x = parseInt((cur_fsm_x+cur_fsm_mouse_x+half_grid)/hg_base);
      if (cur_fsm_y+cur_fsm_mouse_y < 0) { half_grid = -(hg_base/2); }
      else { half_grid = hg_base/2; }
      var cur_node_grid_y = parseInt((cur_fsm_y+cur_fsm_mouse_y+half_grid)/hg_base);
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
      var node_grid_w = 1;
      var node_grid_h = 1;
      var n_type = get_node_type_def_by_name(fsm_nodes[move_grabbed_node_id].node_type);
      if (n_type && n_type.new_gfx) {
        node_grid_w = n_type.node_w;
        node_grid_h = n_type.node_h;
      }
      gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.node_w'), node_grid_w);
      gl.uniform1i(gl.getUniformLocation(node_shader_prog, 'cur_tool_node.node_h'), node_grid_h);
      // Draw.
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
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

// Instead of loading .png images, generate Textures of the
// appropriate sizes.
preload_node_textures = function() {
  for (var node_type in tool_node_types) {
    var cur_type = tool_node_types[node_type];
    if (cur_type && cur_type.new_gfx) {
      // img_gen_canvas
      var tex_w = zoom_base * cur_type.node_w;
      var tex_h = zoom_base * cur_type.node_h;
      var arc_w = tex_w - zoom_base;
      var arc_h = tex_h - zoom_base;
      img_gen.canvas.width = tex_w;
      img_gen.canvas.height = tex_h;
      // Generate a Texture 'background'.
      // Outline
      var arc_x = zoom_base/2;
      var arc_y = zoom_base/2;
      img_gen.strokeStyle = 'black';
      img_gen.lineWidth = 4;
      img_gen.beginPath();
      img_gen.arc(arc_x, arc_y, zoom_base/2, Math.PI, 3*Math.PI/2, false);
      arc_x = arc_x + arc_w;
      img_gen.lineTo(arc_x, arc_y-zoom_base/2);
      img_gen.arc(arc_x, arc_y, zoom_base/2, 3*Math.PI/2, 0, false);
      arc_y = arc_y + arc_h;
      img_gen.lineTo(arc_x+zoom_base/2, arc_y);
      img_gen.arc(arc_x, arc_y, zoom_base/2, 0, Math.PI/2, false);
      arc_x = zoom_base/2;
      img_gen.lineTo(arc_x, arc_y+zoom_base/2);
      img_gen.arc(arc_x, arc_y, zoom_base/2, Math.PI/2, Math.PI, false);
      arc_y = zoom_base/2;
      img_gen.lineTo(arc_x-zoom_base/2, arc_y);
      img_gen.stroke();
      // Fill
      // (Inlay a bit to allow for the outline to show through.)
      var inlay = 2;
      img_gen.fillStyle = cur_type.node_rgb;
      img_gen.fillRect(inlay,
                       (zoom_base/2) + inlay,
                       tex_w - (inlay*2),
                       arc_h - (inlay*2));
      img_gen.fillRect((zoom_base/2) + inlay,
                       inlay,
                       arc_w - (inlay*2),
                       tex_h - (inlay*2));
      img_gen.strokeStyle = cur_type.node_rgb;
      // (Rounded corners.)
      arc_x = zoom_base/2;
      arc_y = zoom_base/2;
      img_gen.beginPath();
      img_gen.arc(arc_x, arc_y, (zoom_base/2)-inlay, 0, Math.PI*2, false);
      img_gen.fill();
      arc_x = arc_x + arc_w;
      img_gen.beginPath();
      img_gen.arc(arc_x, arc_y, (zoom_base/2)-inlay, 0, Math.PI*2, false);
      img_gen.fill();
      arc_y = arc_y + arc_h;
      img_gen.beginPath();
      img_gen.arc(arc_x, arc_y, (zoom_base/2)-inlay, 0, Math.PI*2, false);
      img_gen.fill();
      arc_x = zoom_base/2;
      img_gen.beginPath();
      img_gen.arc(arc_x, arc_y, (zoom_base/2)-inlay, 0, Math.PI*2, false);
      img_gen.fill();
      // 'Node name' text.

      // Generate the texture.
      var new_tex = gl.createTexture();
      const mip_level = 0;
      const format = gl.RGBA;
      const src_type = gl.UNSIGNED_BYTE;
      gl.bindTexture(gl.TEXTURE_2D, new_tex);
      gl.texImage2D(gl.TEXTURE_2D, mip_level, format, format, src_type, img_gen.canvas);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      loaded_textures[cur_type.base_name] = new_tex;
    }
  }
};
