local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('SSD1306 Draw Rectangle' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- This uses both a specific screen framebuffer drawing method,
  -- and a common set of I2C communication methods.
  local util_c_h_insert_path = 'static/node_code/ssd1306_draw_rect/src/util_c_h.insert'
  local util_c_c_insert_path = 'static/node_code/ssd1306_draw_rect/src/util_c_c.insert'
  if not varm_util.ensure_i2c_comms_included('static/node_code/ssd1306_draw_rect/', proj_state) then
    return nil
  end
  if not varm_util.ensure_i2c_dc_comms_included('static/node_code/ssd1306_draw_rect/', proj_state) then
    return nil
  end
  if not varm_util.ensure_ssd1306_fb_included('static/node_code/ssd1306_draw_rect/', proj_state) then
    return nil
  end
  -- 'util_c.h' declares.
  if not varm_util.copy_block_into_file(util_c_h_insert_path,
                                        proj_state.base_dir .. 'src/util_c.h',
                                        'UTIL_C_H_SSD1306_DRAW_RECT_START:',
                                        'UTIL_C_H_SSD1306_DRAW_RECT_DONE:',
                                        '/ UTIL_C_DECLARATIONS:') then
    return nil
  end
  -- 'util_c.c' defines.
  if not varm_util.copy_block_into_file(util_c_c_insert_path,
                                        proj_state.base_dir .. 'src/util_c.c',
                                        'UTIL_C_C_SSD1306_DRAW_RECT_START:',
                                        'UTIL_C_C_SSD1306_DRAW_RECT_DONE:',
                                        '/ UTIL_C_DEFINITIONS:') then
    return nil
  end
  return true
end

-- ('SSD1306 Draw Rectangle' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("SSD1306 Draw Rect" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  if node.options and node.options.i2c_periph_num and
     node.options.rect_x and node.options.rect_y and
     node.options.rect_color and node.options.rect_style and
     node.options.rect_w and node.options.rect_h then
    local i2c_port = tostring(node.options.i2c_periph_num)
    local i2c_base_addr = nil
    if i2c_port == '1' then
      i2c_base_addr = '0x40005400'
    else
      return nil
    end
    local rect_x = tostring(node.options.rect_x)
    local rect_y = tostring(node.options.rect_y)
    local rect_w = tostring(node.options.rect_w)
    local rect_h = tostring(node.options.rect_h)
    -- Default to 'On'.
    local rect_col = '1'
    if node.options.rect_color == 'Off' then
      rect_col = '0'
    end
    local rect_style = tostring(node.options.rect_style)
    -- Default to 'Fill'.
    local outline_w = '0'
    if rect_style == 'Outline' and node.options.outline then
      outline_w = tostring(node.options.outline)
    end
    node_text = node_text .. '  oled_draw_rect(' .. rect_x .. ', ' ..
                rect_y .. ', ' .. rect_w .. ', ' .. rect_h .. ', ' ..
                outline_w .. ', ' .. rect_col .. ');\n'
  else
    return nil
  end
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "SSD1306 Draw Rect" node)\n\n'
  if not varm_util.code_node_lode(node, node_text, proj_state) then
    return nil
  end
  return true
end

return node_reqs
