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
    -- Set the output color; 8 bits per color, in '0x00GGRRBB' order, MSB.
    -- TODO: Warnings for color values that are out of range?
    local g_color_logic = '0x00FF0000 & '
    local r_color_logic = '0x0000FF00 & '
    local b_color_logic = '0x000000FF & '
    -- Green color byte.
    if node.options.color_type_g == 'val' then
      local g_color_val = '0x00'
      local g_color_num = tonumber(node.options.color_val_g)
      if g_color_num then
        if g_color_num < 0 then
          g_color_num = 0
        elseif g_color_num > 255 then
          g_color_num = 255
        end
        g_color_val = g_color_val .. string.format("%02X", g_color_num) .. '0000'
        g_color_logic = g_color_logic .. g_color_val
      else
        return nil
      end
    elseif node.options.color_type_g == 'var' then
    else
      return nil
    end
    if node.options.color_type_r == 'val' then
      local r_color_val = '0x0000'
      local r_color_num = tonumber(node.options.color_val_r)
      if r_color_num then
        if r_color_num < 0 then
          r_color_num = 0
        elseif r_color_num > 255 then
          r_color_num = 255
        end
        r_color_val = r_color_val .. string.format("%02X", r_color_num) .. '00'
        r_color_logic = r_color_logic .. r_color_val
      else
        return nil
      end
    elseif node.options.color_type_r == 'var' then
    else
      return nil
    end
    if node.options.color_type_b == 'val' then
      local b_color_val = '0x000000'
      local b_color_num = tonumber(node.options.color_val_b)
      if b_color_num then
        if b_color_num < 0 then
          b_color_num = 0
        elseif b_color_num > 255 then
          b_color_num = 255
        end
        b_color_val = b_color_val .. string.format("%02X", b_color_num)
        b_color_logic = b_color_logic .. b_color_val
      else
        return nil
      end
    elseif node.options.color_type_b == 'var' then
    else
      return nil
    end
    local write_color = '((' .. g_color_logic .. ') | (' .. r_color_logic .. ') | (' .. b_color_logic .. '))'
    node_text = node_text .. '  ws2812b_write_color(' .. gpiox_odr .. ', ' .. tostring(2^node.options.gpio_pin) .. ', ' .. write_color .. ');\n'
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
