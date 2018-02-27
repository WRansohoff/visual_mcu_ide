local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Exit Hardware Interrupt' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- These entry/exit nodes are mostly just organizational.
  return true
end

-- ('Exit Hardware Interrupt' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  -- Place a label, so that other nodes can jump here.
  local node_text = '  // ("Exit Hardware Interrupt" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  node_text = node_text .. '  goto ' .. node.code_destination .. '_DONE;\n'
  node_text = node_text .. '  ;\n'
  node_text = node_text .. '  // (End "Exit Hardware Interrupt" node)\n\n'
  return varm_util.code_node_lode(node, node_text, proj_state)
end

return node_reqs
