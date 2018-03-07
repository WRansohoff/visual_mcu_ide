local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Set GPIO Ouptut Pin' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- GPIO output shouldn't require any standard peripheral libraries
  -- or supporting code. It's just setting a single register.
  return true
end

-- ('Set GPIO Output Pin' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("Set GPIO Output" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- (Default values)
  local gpio_bank = 'GPIOA'
  local gpio_pin_num = 0
  local gpio_pin_set = false
  -- Set GPIO output values based on node options.
  if node.options then
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
    if node.options.gpio_val and node.options.gpio_val ~= '0' then
      gpio_pin_set = node.options.gpio_val
    end
  end
  -- Add GPIO output code.
  if node.options.gpio_val and node.options.gpio_val == 'Var' and
     node.options.gpio_var_name and node.options.gpio_var_name ~= '(None)' then
    node_text = node_text .. '  if (' .. node.options.gpio_var_name ..
                ') {\n    ' .. gpio_bank .. '->ODR |= GPIO_ODR_' ..
                gpio_pin_num .. ';\n  }\n  else {\n    ' .. gpio_bank ..
                '->ODR &= ~GPIO_ODR_' .. gpio_pin_num .. ';\n  }\n'
  else
    if gpio_pin_set and tonumber(gpio_pin_set) ~= 0 then
      -- Set the pin.
      node_text = node_text .. '  ' .. gpio_bank .. '->ODR |= GPIO_ODR_' .. gpio_pin_num .. ';\n'
    else
      -- Reset the pin.
      node_text = node_text .. '  ' .. gpio_bank .. '->ODR &= ~GPIO_ODR_' .. gpio_pin_num .. ';\n'
    end
  end
  -- Branch to the next node.
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Set GPIO Output" node)\n\n'
  if not varm_util.code_node_lode(node, node_text, proj_state) then
    return nil
  end
  return true
end

return node_reqs
