local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Hardware Interrupt Entry Point' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- These entry/exit nodes are mostly just organizational.
  return true
end

-- ('Hardware Interrupt Entry Point' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  -- Place a 'goto', to avoid compiler warnings.
  local node_text = '  // ("Enter Hardware Interrupt" node.)\n'
  node_text = node_text .. '  // (No label to avoid compiler warnings.)\n'
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Enter Hardware Interrupt" node)\n\n'
  return varm_util.code_node_lode(node, node_text, proj_state)
end

return node_reqs
