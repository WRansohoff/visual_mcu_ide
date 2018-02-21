local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  return false
end

-- ('' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  return false
end

return node_reqs
