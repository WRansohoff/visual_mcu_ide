local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Latch NeoPixels' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- This node requires methods from the 'Delay' node.
  local delay_util_s_insert_path = 'static/node_code/delay/src/util_S.insert'
  local delay_global_h_insert_path = 'static/node_code/delay/src/global_h.insert'
  local util_s_insert_path = 'static/node_code/ws2812b_latch/src/util_S.insert'
  local global_h_insert_path = 'static/node_code/ws2812b_latch/src/global_h.insert'
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
  -- 'util.S' WS2812B latching declares.
  if not varm_util.copy_block_into_file(util_s_insert_path,
             proj_state.base_dir .. 'src/util.S',
             'UTIL_S_WS2812B_LATCH_DEC_START:',
             'UTIL_S_WS2812B_LATCH_DEC_DONE:',
             '/ ASM_GLOBAL_UTIL_DECLARES:') then
    return nil
  end
  -- 'util.S' WS2812B latching defines.
  if not varm_util.copy_block_into_file(util_s_insert_path,
             proj_state.base_dir .. 'src/util.S',
             'UTIL_S_WS2812B_LATCH_DEF_START:',
             'UTIL_S_WS2812B_LATCH_DEF_DONE:',
             '/ ASM_GLOBAL_UTIL_DEFINES:') then
    return nil
  end
  -- 'global.h' WS2812B latching declares.
  if not varm_util.copy_block_into_file(global_h_insert_path,
             proj_state.base_dir .. 'src/global.h',
             'GLOBAL_EXTERN_WS2812B_LATCH_START:',
             'GLOBAL_EXTERN_WS2812B_LATCH_DONE:',
             '/ ASM_METHOD_DEFINES:') then
    return nil
  end
  return true
end

-- ('Latch NeoPixels' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("Latch WS2812B LEDs" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- Latch the given pin.
  if node.options and node.options.gpio_bank and
     node.options.gpio_pin then
    -- Set the GPIO 'output' register address.
    local gpiox_odr = '0x4800'
    if node.options.gpio_bank == 'GPIOA' then
      gpiox_odr = gpiox_odr .. '00'
    elseif node.options.gpio_bank == 'GPIOB' then
      gpiox_odr = gpiox_odr .. '04'
    elseif node.options.gpio_bank == 'GPIOC' then
      gpiox_odr = gpiox_odr .. '08'
    elseif node.options.gpio_bank == 'GPIOD' then
      gpiox_odr = gpiox_odr .. '0C'
    elseif node.options.gpio_bank == 'GPIOE' then
      gpiox_odr = gpiox_odr .. '10'
    elseif node.options.gpio_bank == 'GPIOF' then
      gpiox_odr = gpiox_odr .. '14'
    else
      return nil
    end
    gpiox_odr = gpiox_odr .. '14'
    node_text = node_text .. '  ws2812b_latch(' .. gpiox_odr .. ',  ' .. tostring(2^node.options.gpio_pin) .. ');\n'
  else
    return nil
  end
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Latch WS2812B LEDs" node)\n\n'
  if not varm_util.code_node_lode(node, node_text, proj_state) then
    return nil
  end
  return true
end

return node_reqs
