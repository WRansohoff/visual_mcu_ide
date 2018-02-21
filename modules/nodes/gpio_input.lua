local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Read GPIO Input' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- GPIO input shouldn't require any standard peripheral libraries
  -- or supporting code. It's just setting a single register.
  return true
end

-- ('Read GPIO Input' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("Set GPIO Input" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- (Default values)
  local gpio_bank = 'GPIOA'
  local gpio_pin_num = 0
  -- Set GPIO bank and pin number.
  if node.options.gpio_bank then
    if node.options.gpio_bank == 'GPIOA' or
       node.options.gpio_bank == 'GPIOB' or
       node.options.gpio_bank == 'GPIOC' or
       node.options.gpio_bank == 'GPIOD' or
       node.options.gpio_bank == 'GPIOE' or
       node.options.gpio_bank == 'GPIOF' or
       node.options.gpio_bank == 'GPIOG' then
      gpio_bank = node.options.gpio_bank
    end
  end
  if node.options.gpio_pin and tonumber(node.options.gpio_pin) then
    gpio_pin_num = tonumber(node.options.gpio_pin)
  end
  -- Find variable type.
  if not node.options or not node.options.gpio_var_name then
    return nil
  end
  local gpio_var_type = ''
  for i, val in pairs(proj_state.global_decs) do
    if val and val.var_name == node.options.gpio_var_name then
      gpio_var_type = val.var_type
    end
  end
  if (not gpio_var_type) or gpio_var_type == '' then
    return nil
  end
  -- Set the values to set a variable of that type to.
  local truthy_var_val = ''
  local falsey_var_val = ''
  if gpio_var_type == 'int' then
    truthy_var_val = '1'
    falsey_var_val = '0'
  elseif gpio_var_type == 'float' then
    truthy_var_val = '1.0'
    falsey_var_val = '0.0'
  elseif gpio_var_type == 'char' then
    truthy_var_val = "'1'"
    falsey_var_val = "'\0'"
  elseif gpio_var_type == 'bool' then
    truthy_var_val = '1'
    falsey_var_val = '0'
  else
    return nil
  end

  -- Add the 'read pin' code.
  node_text = node_text .. '  if (' .. gpio_bank ..
              '->IDR & GPIO_IDR_' .. gpio_pin_num .. ') {\n    ' ..
              node.options.gpio_var_name .. ' = ' .. truthy_var_val ..
              ';\n  }\n  else {\n    ' .. node.options.gpio_var_name ..
              ' = ' .. falsey_var_val .. ';\n  }\n'

  -- Branch to the next node.
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Set GPIO Input" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

return node_reqs
