local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('SSD1306 Draw Pixel' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- This uses a common set of I2C communication methods, and a C
  -- framebuffer drawing metod. Also an I2C screen drawing method.
  if not varm_util.ensure_i2c_comms_included('static/node_code/ssd1306_draw_px/', proj_state) then
    return nil
  end
  if not varm_util.ensure_i2c_dc_comms_included('static/node_code/ssd1306_draw_px/', proj_state) then
    return nil
  end
  if not varm_util.ensure_ssd1306_fb_included('static/node_code/ssd1306_draw_px/', proj_state) then
    return nil
  end
  local util_c_h_insert_path = 'static/node_code/ssd1306_draw_px/src/util_c_h.insert'
  local util_c_c_insert_path = 'static/node_code/ssd1306_draw_px/src/util_c_c.insert'
  -- 'util_c.h' declares.
  if not varm_util.copy_block_into_file(util_c_h_insert_path,
             proj_state.base_dir .. 'src/util_c.h',
             'UTIL_C_H_SSD1306_DRAW_PX_START:',
             'UTIL_C_H_SSD1306_DRAW_PX_DONE:',
             '/ UTIL_C_DECLARATIONS:') then
    return nil
  end
  -- 'util_c.c' defines.
  if not varm_util.copy_block_into_file(util_c_c_insert_path,
             proj_state.base_dir .. 'src/util_c.c',
             'UTIL_C_C_SSD1306_DRAW_PX_START:',
             'UTIL_C_C_SSD1306_DRAW_PX_DONE:',
             '/ UTIL_C_DEFINITIONS:') then
    return nil
  end
  return true
end

-- ('SSD1306 Draw Pixel' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("SSD1306 Draw Pixel" node)\n'
  -- TODO: 'refresh display after' option, or delete i2c stuff.
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  if node.options and node.options.i2c_periph_num and
     node.options.px_x and node.options.px_y and
     node.options.px_color then
    local i2c_port = tostring(node.options.i2c_periph_num)
    local i2c_base_addr = nil
    if i2c_port == '1' then
      i2c_base_addr = '0x40005400'
    else
      return nil
    end
    local px_x = tostring(node.options.px_x)
    local px_y = tostring(node.options.px_y)
    -- Default to 'On'.
    local px_col = '1'
    if node.options.px_color == 'Off' then
      px_col = '0'
    end
    node_text = node_text .. '  oled_write_pixel(' .. px_x .. ', ' ..
                px_y .. ', ' .. px_col .. ');\n'
  end
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "SSD1306 Draw Pixel" node)\n\n'
  if not varm_util.code_node_lode(node, node_text, proj_state) then
    return nil
  end
  return true
end

return node_reqs
