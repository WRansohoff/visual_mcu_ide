local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Set Variable: A = B + C' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- Only primitive types, so no required includes to check.
  return true
end

-- ('Set Variable: A = B + C' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("Set Variable by addition" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- (The actual variable setting.)
  -- TODO: type checking/verification? Or do that JS-side?
  if node.options.var_a_name and node.options.var_b_name then
    node_text = node_text .. '  ' .. node.options.var_a_name .. ' = ' ..
                node.options.var_b_name .. ' + '
    if node.options.add_val_type == 'val' and 
       (node.options.add_val_val or node.options.add_val_val == 0) then
      node_text = node_text .. tostring(node.options.add_val_val) .. ';\n'
    elseif node.options.add_val_type == 'var' then
      if node.options.add_val_val and node.options.add_val_val ~= '(None)' then
        node_text = node_text .. node.options.add_val_val .. ';\n'
      else
        return nil
      end
    else
      return nil
    end
  end
  -- (Done.)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Set Variable by addition" node)\n\n'
  if not varm_util.code_node_lode(node, node_text, proj_state) then
    return nil
  end
  return true
end

return node_reqs
