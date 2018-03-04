local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('SSD1306 Refresh Display' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  local util_s_insert_path = 'static/node_code/ssd1306_refresh/src/util_S.insert'
  local global_h_insert_path = 'static/node_code/ssd1306_refresh/src/global_h.insert'
  -- Just the 'display framebuffer' method declare/defines from 'util.S'.
  -- (Along with its supporting I2C communication methods.)
  if not varm_util.copy_block_into_file(util_s_insert_path,
             proj_state.base_dir .. 'src/util.S',
             'UTIL_S_I2C_COMMS_DEC_START:',
             'UTIL_S_I2C_COMMS_DEC_DONE:',
             '/ ASM_GLOBAL_UTIL_DECLARES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
             proj_state.base_dir .. 'src/util.S',
             'UTIL_S_I2C_DC_COMMS_DEC_START:',
             'UTIL_S_I2C_DC_COMMS_DEC_DONE:',
             '/ ASM_GLOBAL_UTIL_DECLARES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
             proj_state.base_dir .. 'src/util.S',
             'UTIL_S_SSD1306_DRAW_FB_DEC_START:',
             'UTIL_S_SSD1306_DRAW_FB_DEC_DONE:',
             '/ ASM_GLOBAL_UTIL_DECLARES:') then
    return nil
  end
  if not varm_util.copy_block_into_file(util_s_insert_path,
             proj_state.base_dir .. 'src/util.S',
             'UTIL_S_I2C_COMMS_DEF_START:',
             'UTIL_S_I2C_COMMS_DEF_DONE:',
             '/ ASM_GLOBAL_UTIL_DEFINES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
             proj_state.base_dir .. 'src/util.S',
             'UTIL_S_I2C_DC_COMMS_DEF_START:',
             'UTIL_S_I2C_DC_COMMS_DEF_DONE:',
             '/ ASM_GLOBAL_UTIL_DEFINES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
             proj_state.base_dir .. 'src/util.S',
             'UTIL_S_SSD1306_DRAW_FB_DEF_START:',
             'UTIL_S_SSD1306_DRAW_FB_DEF_DONE:',
             '/ ASM_GLOBAL_UTIL_DEFINES:') then
    return nil
  end
  -- (Also the extern and framebuffer memory in 'global.h')
  if not varm_util.copy_block_into_file(global_h_insert_path,
             proj_state.base_dir .. 'src/global.h',
             'GLOBAL_EXTERN_SSD1306_DRAW_FB_START:',
             'GLOBAL_EXTERN_SSD1306_DRAW_FB_DONE:',
             '/ ASM_METHOD_DEFINES:') then
    return nil
  end
  if not varm_util.copy_block_into_file(global_h_insert_path,
             proj_state.base_dir .. 'src/global.h',
             'GLOBAL_EXTERN_SSD1306_FB_VAR_START:',
             'GLOBAL_EXTERN_SSD1306_FB_VAR_DONE:',
             '/ SYS_GLOBAL_VAR_DEFINES:') then
    return nil
  end
  return true
end

-- ('SSD1306 Refresh Display' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("SSD1306 Refresh Display" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- Refresh the display.
  local i2c_base_addr = nil
  if node.options and node.options.i2c_periph_num then
    local i2c_port = tostring(node.options.i2c_periph_num)
    if i2c_port == '1' then
      i2c_base_addr = '0x40005400'
    else
      return nil
    end
  else
    return nil
  end
  node_text = node_text .. '  i2c_display_framebuffer(' ..
                           i2c_base_addr .. ', &oled_fb);\n'
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "SSD1306 Refresh Display" node)\n\n'
  if not varm_util.code_node_lode(node, node_text, proj_state) then
    return nil
  end
  return true
end

return node_reqs
