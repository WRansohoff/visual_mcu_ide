local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Boot' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- The 'Boot' mode doesn't really need any supporting methods, right now.
  -- Everything is included in the 'init_project_state' method.
  return true
end

-- ('Boot' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  -- There's no real code needed for the 'Boot' node, but we still have
  -- to add a label for the node and a GOTO to make sure that the
  -- program starts with the right node.
  -- (Start with 'goto Boot', to avoid compiler warnings for an unused label.
  local node_text = '  // ("Boot" node, program entry point)\n'
  node_text = node_text .. '  goto NODE_' .. node.node_ind .. ';\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Boot" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    '/ MAIN_ENTRY:',
                                    node_text) then
    return nil
  end
  return true
end

return node_reqs
