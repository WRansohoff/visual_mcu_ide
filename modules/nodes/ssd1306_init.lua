local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('SSD1306 Initialize Screen' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- This uses both a specific screen initialization method, and a common
  -- set of I2C communication methods.
  local util_s_insert_path = 'static/node_code/ssd1306_init/src/util_S.insert'
  local global_h_insert_path = 'static/node_code/ssd1306_init/src/global_h.insert'
  -- 'util.S' declares.
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
                                        'UTIL_S_SSD1306_INIT_DEC_START:',
                                        'UTIL_S_SSD1306_INIT_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') then
    return nil
  end
  -- 'util.S' defines.
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
                                        'UTIL_S_SSD1306_INIT_DEF_START:',
                                        'UTIL_S_SSD1306_INIT_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') then
    return nil
  end
  -- 'global.h' declare.
  if not varm_util.copy_block_into_file(global_h_insert_path,
                                        proj_state.base_dir .. 'src/global.h',
                                        'GLOBAL_EXTERN_SSD1306_INIT_START:',
                                        'GLOBAL_EXTERN_SSD1306_INIT_DONE:',
                                        '/ ASM_METHOD_DEFINES:') then
    return nil
  end
  return true
end

-- ('SSD1306 Initialize Screen' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("SSD1306 Monochrome OLED Screen Initialization" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  if node.options and node.options.i2c_periph_num then
    if node.options.i2c_periph_num == '1' or node.options.i2c_periph_num == 1 then
      i2c_base_addr = '0x40005400'
      node_text = node_text .. '  i2c_init_ssd1306(' .. i2c_base_addr .. ');\n'
    else
      -- (Currently only support I2C1)
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
  node_text = node_text .. '  // (End "SSD1306 Screen Initialization" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

return node_reqs
