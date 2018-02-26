local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Check if Variables are Equal' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- (No required supporting code)
  return true
end

-- ('Check if Variables are Equal' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("If variables are equal" branching node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  if node.output and node.output.branch_t and node.output.branch_f and
     node.options.var_a_name and node.options.var_b_name then
    -- Branching logic. TODO: Type checking?
    node_text = node_text .. '  if (' .. node.options.var_a_name ..
                             ' == ' .. node.options.var_b_name .. ') {\n'
    node_text = node_text .. '    goto NODE_' .. node.output.branch_t .. ';\n  }\n'
    node_text = node_text .. '  else {\n    goto NODE_' .. node.output.branch_f .. ';\n  }\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "If variables are equal" branching node)\n\n'
  if not varm_util.code_node_lode(node, node_text, proj_state) then
    return nil
  end
  return true
end

return node_reqs
