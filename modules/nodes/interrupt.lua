local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Hardware Interrupt Entry Point' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- These entry/exit nodes are mostly just organizational.
  return true
end

-- ('Hardware Interrupt Entry Point' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  return true
end

return node_reqs
