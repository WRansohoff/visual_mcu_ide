local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Write Color to NeoPixel' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- This node requires methods from the 'Delay' node.
  local delay_util_s_insert_path = 'static/node_code/delay/src/util_S.insert'
  local delay_global_h_insert_path = 'static/node_code/delay/src/global_h.insert'
  local util_s_insert_path = 'static/node_code/ws2812b_write/src/util_S.insert'
  local global_h_insert_path = 'static/node_code/ws2812b_write/src/global_h.insert'
  -- 'util.S' delay declares.
  if not varm_util.copy_block_into_file(delay_util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_DELAYS_DEC_START:',
                                        'UTIL_S_DELAYS_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') then
    return nil
  end
  -- 'util.S' delay defines.
  if not varm_util.copy_block_into_file(delay_util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_DELAYS_DEF_START:',
                                        'UTIL_S_DELAYS_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') then
    return nil
  end
  -- 'global.h' delay declares.
  if not varm_util.copy_block_into_file(delay_global_h_insert_path,
                                        proj_state.base_dir .. 'src/global.h',
                                        'GLOBAL_EXTERN_DELAYS_START:',
                                        'GLOBAL_EXTERN_DELAYS_DONE:',
                                        '/ ASM_METHOD_DEFINES:') then
    return nil
  end
  -- 'util.S' WS2812B color-writing declares.
  if not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_WS2812B_WRITE_DEC_START:',
                                        'UTIL_S_WS2812B_WRITE_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') then
    return nil
  end
  -- 'util.S' WS2812B color-writing defines.
  if not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_WS2812B_WRITE_DEF_START:',
                                        'UTIL_S_WS2812B_WRITE_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') then
    return nil
  end
  -- 'global.h' WS2812B color-writing declares.
  if not varm_util.copy_block_into_file(global_h_insert_path,
                                        proj_state.base_dir .. 'src/global.h',
                                        'GLOBAL_EXTERN_WS2812B_WRITE_START:',
                                        'GLOBAL_EXTERN_WS2812B_WRITE_DONE:',
                                        '/ ASM_METHOD_DEFINES:') then
    return nil
  end
  return true
end

-- ('Write Color to NeoPixel' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("Write Color to WS2812B" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- Write the given color to the given pin.
  if node.options and node.options.gpio_bank and
     node.options.gpio_pin and node.options.color_type_r and
     node.options.color_type_g and node.options.color_type_b then
    local write_color = '0x00'
    node_text = node_text .. '  ws2812b_write_color(' .. node.options.gpio_bank .. '->ODR, (1<<' .. tostring(node.options.gpio_pin) .. '), ' .. write_color .. ');\n'
  else
    return nil
  end
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Write Color to WS2812B" node)\n\n'
  if not varm_util.code_node_lode(node, node_text, proj_state) then
    return nil
  end
  return true
end

return node_reqs
