local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Set Variable' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- Only primitive types, so no required includes to check.
  return true
end

-- ('Set Variable' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("Set Variable" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- (The actual variable setting.)
  local var_c_val = tostring(node.options.var_val)
  if var_c_val == 'false' then
    var_c_val = '0';
  elseif var_c_val == 'true' then
    var_c_val = '1';
  elseif not tonumber(var_c_val) then
    -- If it doesn't translate to a number, assume it's a char.
    -- (Since we don't support strings yet.)
    var_c_val = "'" .. var_c_val .. "'"
  end
  node_text = node_text .. '  ' .. node.options.var_name .. ' = ' .. var_c_val .. ';\n'
  -- (Done.)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Set Variable" node)\n\n'
  if not varm_util.code_node_lode(node, node_text, proj_state) then
    return nil
  end
  return true
end

return node_reqs
