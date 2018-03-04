local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('SSD1306 Draw Text' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  if not varm_util.ensure_i2c_comms_included('static/node_code/ssd1306_draw_text/', proj_state) then
    return nil
  end
  if not varm_util.ensure_i2c_dc_comms_included('static/node_code/ssd1306_draw_text/', proj_state) then
    return nil
  end
  if not varm_util.ensure_ssd1306_fb_included('static/node_code/ssd1306_draw_text/', proj_state) then
    return nil
  end
  local util_c_h_insert_path = 'static/node_code/ssd1306_draw_text/src/util_c_h.insert'
  local util_c_c_insert_path = 'static/node_code/ssd1306_draw_text/src/util_c_c.insert'
  local global_h_insert_path = 'static/node_code/ssd1306_draw_text/src/global_h.insert'
  -- 'util_c.h' declares.
  if not varm_util.copy_block_into_file(util_c_h_insert_path,
             proj_state.base_dir .. 'src/util_c.h',
             'UTIL_C_H_SSD1306_DRAW_PX_START:',
             'UTIL_C_H_SSD1306_DRAW_PX_DONE:',
             '/ UTIL_C_DECLARATIONS:') then
    return nil
  end
  if not varm_util.copy_block_into_file(util_c_h_insert_path,
             proj_state.base_dir .. 'src/util_c.h',
             'UTIL_C_H_SSD1306_DRAW_RECT_START:',
             'UTIL_C_H_SSD1306_DRAW_RECT_DONE:',
             '/ UTIL_C_DECLARATIONS:') then
    return nil
  end
  if not varm_util.copy_block_into_file(util_c_h_insert_path,
             proj_state.base_dir .. 'src/util_c.h',
             'UTIL_C_H_SSD1306_DRAW_TEXT_START:',
             'UTIL_C_H_SSD1306_DRAW_TEXT_DONE:',
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
  if not varm_util.copy_block_into_file(util_c_c_insert_path,
             proj_state.base_dir .. 'src/util_c.c',
             'UTIL_C_C_SSD1306_DRAW_RECT_START:',
             'UTIL_C_C_SSD1306_DRAW_RECT_DONE:',
             '/ UTIL_C_DEFINITIONS:') then
    return nil
  end
  if not varm_util.copy_block_into_file(util_c_c_insert_path,
             proj_state.base_dir .. 'src/util_c.c',
             'UTIL_C_C_SSD1306_DRAW_TEXT_START:',
             'UTIL_C_C_SSD1306_DRAW_TEXT_DONE:',
             '/ UTIL_C_DEFINITIONS:') then
    return nil
  end
  -- 'global.h' definitions.
  if not varm_util.copy_block_into_file(global_h_insert_path,
             proj_state.base_dir .. 'src/global.h',
             'GLOBAL_DEFS_SSD1306_SMALL_TEXT_CHARS_START:',
             'GLOBAL_DEFS_SSD1306_SMALL_TEXT_CHARS_DONE',
             '/ SYS_GLOBAL_VAR_DEFINES:') then
    return nil
  end
  if not varm_util.copy_block_into_file(global_h_insert_path,
             proj_state.base_dir .. 'src/global.h',
             'GLOBAL_DEFS_SSD1306_TEXT_LINE_BUF_START:',
             'GLOBAL_DEFS_SSD1306_TEXT_LINE_BUF_DONE:',
             '/ SYS_GLOBAL_VAR_DEFINES:') then
    return nil
  end
  return true
end

-- ('SSD1306 Draw Text' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("SSD1306 Draw Text" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- TODO: 'refresh display after' option, or delete i2c stuff.
  if node.options and node.options.i2c_periph_num and
     node.options.text_x and node.options.text_y and
     node.options.text_type and node.options.text_size and
     node.options.text_color then
    local i2c_port = tostring(node.options.i2c_periph_num)
    local i2c_base_addr = nil
    if i2c_port == '1' then
      i2c_base_addr = '0x40005400'
    else
      return nil
    end
    local text_x = tostring(node.options.text_x)
    local cur_char_x = tonumber(text_x)
    local text_y = tostring(node.options.text_y)
    local text_type = node.options.text_type
    local text_str = node.options.text_line
    local text_var = node.options.text_var
    -- Default to 'small' text.
    local char_width = '6'
    if node.options.text_size == 'L' then
      char_width = '12'
    end
    -- Default to 'On'.
    local text_color = '1'
    if node.options.text_color == 'Off' then
      text_color = '0'
    end
    -- Draw the text string.
    -- TODO: Use the C 'draw_text' methods.
    if text_type == 'val' then
      text_str = text_str:sub(1, 23)
      node_text = node_text .. '  snprintf(oled_line_buf, 23, "%s", "' ..
                  text_str .. '");\n'
      node_text = node_text .. "  oled_line_buf[23] = '\\0';\n"
      node_text = node_text .. '  oled_draw_text(' ..
                  text_x .. ', ' .. text_y .. ', oled_line_buf, ' ..
                  text_color .. ", '" .. node.options.text_size:sub(1,1) .. "');\n"
    elseif text_type == 'var' then
      -- Draw a variable as a string.
      -- Get the variable's type.
      local var_type = ''
      local type_str = ''
      for i, val in pairs(proj_state.global_decs) do
        if val and val.var_name == text_var then
          var_type = val.var_type
        end
      end
      if (not var_type) or var_type == '' then
        return nil
      end
      if var_type == 'int' then
        node_text = node_text .. '  oled_draw_letter_i(' ..
                    text_x .. ', ' .. text_y .. ', ' .. text_var ..
                    ', ' .. text_color .. ", '" .. node.options.text_size .. "');\n"
      elseif var_type == 'float' then
        -- TODO
        return nil
      elseif var_type == 'char' then
        node_text = node_text .. '  oled_draw_letter_c(' ..
                    text_x .. ', ' .. text_y .. ', ' .. text_var ..
                    ', ' .. text_color .. ", '" .. node.options.text_size .. "');\n"
      elseif var_type == 'bool' then
        -- TODO
        return nil
      else
        return nil
      end
    else
      return nil
    end
  else
    return nil
  end
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "SSD1306 Draw Text" node)\n\n'
  if not varm_util.code_node_lode(node, node_text, proj_state) then
    return nil
  end
  return true
end

return node_reqs
