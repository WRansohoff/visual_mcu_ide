local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Check if Variable is Truthy' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- (No required supporting code)
  return true
end

-- ('Check if Variable is Truthy' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("If variable is truth-y" branching node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  if node.output and node.output.branch_t and node.output.branch_f then
    -- Branching logic.
    node_text = node_text .. '  if (' .. node.options.var_name .. ') {\n'
    node_text = node_text .. '    goto NODE_' .. node.output.branch_t .. ';\n  }\n'
    node_text = node_text .. '  else {\n    goto NODE_' .. node.output.branch_f .. ';\n  }\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "If variable is truth-y" branching node)\n\n'
  if not varm_util.code_node_lode(node, node_text, proj_state) then
    return nil
  end
  return true
end

return node_reqs
