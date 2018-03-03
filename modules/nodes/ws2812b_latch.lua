local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Latch NeoPixels' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  return true
end

-- ('Latch NeoPixels' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("Latch WS2812B LEDs" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Latch WS2812B LEDs" node)\n\n'
  if not varm_util.code_node_lode(node, node_text, proj_state) then
    return nil
  end
  return true
end

return node_reqs
