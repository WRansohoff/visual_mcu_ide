local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Delay' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- The 'Delay' node requires a 'delay' assembly method, depending on
  -- the chosen units. We want to add the method to the 'util.S' method,
  -- define it in the 'global.h' file, and ... well I think that's it.
  -- 'util.S' declares.
  local util_s_insert_path = 'static/node_code/delay/src/util_S.insert'
  local global_h_insert_path = 'static/node_code/delay/src/global_h.insert'
  if not varm_util.copy_block_into_file(util_s_insert_path,
             proj_state.base_dir .. 'src/util.S',
             'UTIL_S_DELAYS_DEC_START:',
             'UTIL_S_DELAYS_DEC_DONE:',
             '/ ASM_GLOBAL_UTIL_DECLARES:') then
    return nil
  end
  -- 'util.S' defines.
  if not varm_util.copy_block_into_file(util_s_insert_path,
             proj_state.base_dir .. 'src/util.S',
             'UTIL_S_DELAYS_DEF_START:',
             'UTIL_S_DELAYS_DEF_DONE:',
             '/ ASM_GLOBAL_UTIL_DEFINES:') then
    return nil
  end
  -- 'global.h' declare.
  if not varm_util.copy_block_into_file(global_h_insert_path,
             proj_state.base_dir .. 'src/global.h',
             'GLOBAL_EXTERN_DELAYS_START:',
             'GLOBAL_EXTERN_DELAYS_DONE:',
             '/ ASM_METHOD_DEFINES:') then
    return nil
  end
  return true
end

-- ('Delay' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("Delay" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- Get the number of cycles to delay.
  node_text = node_text .. '  delay_cycles('
  if node.options and node.options.delay_value then
    -- TODO: Support differend clock frequencies. For now, assume 48MHz.
    local delay_scale = 1
    if node.options.delay_units == 'us' then
      -- 48,000,000 cycles per second = 48 cycles per microsecond.
      delay_scale = 48
    elseif node.options.delay_units == 'ms' then
      -- 48,000,000 cycles per second = 48,000 cycles per millisecond.
      delay_scale = 48000
    elseif node.options.delay_units == 's' then
      -- 48,000,000 cycles per second.
      delay_scale = 48000000
    end
    local delay_cyc = tonumber(node.options.delay_value) * delay_scale
    node_text = node_text .. delay_cyc .. ');\n'
  else
    node_text = node_text .. '0);\n'
  end
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Delay" node)\n\n'
  if not varm_util.code_node_lode(node, node_text, proj_state) then
    return nil
  end
  return true
end

return node_reqs
