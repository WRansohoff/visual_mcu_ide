local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Set Variable: A = !B' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- Only primitive types, so no required includes to check.
  return true
end

-- ('Set Variable: A = !B' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("Set Variable logical-not" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- (The actual variable setting.)
  if node.options.var_a_name ~= '(None)' and node.options.var_b_name ~= '(None)' then
    node_text = node_text .. '  ' .. node.options.var_a_name .. ' = !' .. node.options.var_b_name .. ';\n'
  else
    return nil
  end
  -- (Done.)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Set Variable logical-not" node)\n\n'
  if not varm_util.code_node_lode(node, node_text, proj_state) then
    return nil
  end
  return true
end

return node_reqs
