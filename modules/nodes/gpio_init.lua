local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Initialize GPIO Pin' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- I have an assembly method for STM32F0 GPIO setup, but for the sake
  -- of simplicity, just use the standard peripheral library. TODO
  local stdp_s_path = 'static/node_code/gpio_init/src/std_periph/'
  if not varm_util.import_std_periph_lib('misc', stdp_s_path, proj_state.base_dir) then
    return nil
  end
  if not varm_util.import_std_periph_lib('gpio', stdp_s_path, proj_state.base_dir) then
    return nil
  end
  -- Ensure that a global 'GPIO_InitTypeDef' struct is defined.
  if not varm_util.copy_block_into_file(
      'static/node_code/gpio_init/src/global_h.insert',
      proj_state.base_dir .. 'src/global.h',
      'SYS_GLOBAL_GPIO_INIT_STRUCT_START:',
      'SYS_GLOBAL_GPIO_INIT_STRUCT_DONE:',
      '/ SYS_GLOBAL_VAR_DEFINES:') then
    return nil
  end
  return true
end

-- ('Initialize GPIO Pin' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("Setup GPIO Pin" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- Gather 'GPIO_Init' values.
  -- (Default values.)
  local gpio_bank = 'GPIOA'
  local gpio_pin_num = 0
  local gpio_func = 'OUT'
  local gpio_otype = 'PP'
  local gpio_ospeed = '3'
  local gpio_pupdr = 'UP'
  -- Collect values from the node's 'options' hash.
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
    if node.options.gpio_func then
      if node.options.gpio_func == 'Output' then
        gpio_func = 'OUT'
      elseif node.options.gpio_func == 'Input' then
        gpio_func = 'IN'
      elseif node.options.gpio_func == 'AF' then
        gpio_func = 'AF'
      elseif node.options.gpio_func == 'Analog' then
        gpio_func = 'AN'
      end
    end
    if node.options.gpio_otype then
      if node.options.gpio_otype == 'Push-Pull' then
        gpio_otype = 'PP'
      elseif node.options.gpio_otype == 'Open-Drain' then
        gpio_otype = 'OD'
      end
    end
    if node.options.gpio_ospeed then
      if node.options.gpio_ospeed == 'H' then
        gpio_ospeed = '3'
      elseif node.options.gpio_ospeed == 'M' then
        gpio_ospeed = '2'
      elseif node.options.gpio_ospeed == 'L' then
        gpio_ospeed = '1'
      end
    end
    if node.options.gpio_pupdr then
      if node.options.gpio_pupdr == 'None' then
        gpio_pupdr = 'NOPULL'
      elseif node.options.gpio_pupdr == 'PU' then
        gpio_pupdr = 'UP'
      elseif node.options.gpio_pudpr == 'PD' then
        gpio_pupdr = 'DOWN'
      end
    end
  end
  -- Add GPIO init code.
  node_text = node_text .. '  global_gpio_init_struct.GPIO_Pin = GPIO_Pin_' .. gpio_pin_num .. ';\n'
  node_text = node_text .. '  global_gpio_init_struct.GPIO_Mode = GPIO_Mode_' .. gpio_func .. ';\n'
  node_text = node_text .. '  global_gpio_init_struct.GPIO_OType = GPIO_OType_' .. gpio_otype .. ';\n'
  node_text = node_text .. '  global_gpio_init_struct.GPIO_Speed = GPIO_Speed_Level_' .. gpio_ospeed .. ';\n'
  node_text = node_text .. '  global_gpio_init_struct.GPIO_PuPd = GPIO_PuPd_' .. gpio_pupdr .. ';\n'
  node_text = node_text .. '  GPIO_Init(' .. gpio_bank .. ', &global_gpio_init_struct);\n'

  -- GOTO statement for the next node.
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Setup GPIO Pin" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

return node_reqs
