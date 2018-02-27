local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Enable Hardware Interrupt' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  if not varm_util.import_std_periph_lib('misc', proj_state.base_dir) or
     not varm_util.import_std_periph_lib('exti', proj_state.base_dir) or
     not varm_util.import_std_periph_lib('syscfg', proj_state.base_dir) then
    return nil
  end
  -- Ensure that global 'EXTI_InitTypeDef', 'NVIC_InitTypeDef'
  -- structs are defined.
  if not varm_util.copy_block_into_file(
      'static/node_code/interrupt_enable/src/global_h.insert',
      proj_state.base_dir .. 'src/global.h',
      'SYS_GLOBAL_INTERRUPT_INIT_STRUCTS_START:',
      'SYS_GLOBAL_INTERRUPT_INIT_STRUCTS_DONE:',
      '/ SYS_GLOBAL_VAR_DEFINES:') then
    return nil
  end
  -- Ensure that the 'interrupts_c.[c/h]' files exist, and
  -- that they contain the appropriate interrupt handler function.
  -- TODO: Support interrupt lines other than EXTI[0-15].
  local exti_irq_h_tag = nil
  local exti_irq_c_tag = nil
  for e_pin = 0,15 do
    if (node.options.interrupt_chan == 'EXTI' .. tostring(e_pin)) then
      if e_pin < 2 then
        exti_irq_h_tag = 'INTERRUPTS_C_H_EXTI0_1_'
        exti_irq_c_tag = 'INTERRUPTS_C_C_EXTI0_1_'
      elseif e_pin < 4 then
        exti_irq_h_tag = 'INTERRUPTS_C_H_EXTI2_3_'
        exti_irq_c_tag = 'INTERRUPTS_C_C_EXTI2_3_'
      else
        exti_irq_h_tag = 'INTERRUPTS_C_H_EXTI4_15_'
        exti_irq_c_tag = 'INTERRUPTS_C_C_EXTI4_15_'
      end
      break
    end
  end
  return true
end

-- ('Enable Hardware Interrupt' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("Enable Hardware Interrupt" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- Enable the given hardware interrupt line.
  if node.options and node.options.exti_gpio_bank and node.options.interrupt_chan then
    local exti_pin = nil
    local nvic_irq = nil
    for e_pin = 0,15 do
      if (node.options.interrupt_chan == 'EXTI' .. tostring(e_pin)) then
        exti_pin = tostring(e_pin)
        if e_pin < 2 then
          nvic_irq = 'EXTI0_1'
        elseif e_pin < 4 then
          nvic_irq = 'EXTI2_3'
        else
          nvic_irq = 'EXTI4_15'
        end
        break
      end
    end
    if not exti_pin then return nil end
    -- EXTI line init.
    node_text = node_text .. '  SYSCFG_EXTILineConfig(EXTI_PortSource' .. node.options.exti_gpio_bank .. ', EXTI_PinSource' .. exti_pin .. ');\n'
    node_text = node_text .. '  global_exti_init_struct.EXTI_Line = EXTI_Line' .. exti_pin .. ';\n'
    node_text = node_text .. '  global_exti_init_struct.EXTI_Mode = EXTI_Mode_Interrupt;\n'
    -- TODO: Allow configuring options like rising/falling edge.
    node_text = node_text .. '  global_exti_init_struct.EXTI_Trigger = EXTI_Trigger_Falling;\n'
    node_text = node_text .. '  global_exti_init_struct.EXTI_LineCmd = ENABLE;\n'
    node_text = node_text .. '  EXTI_Init(&global_exti_init_struct);\n'
    -- NVIC channel init.
    -- TODO: Maybe allow priority config? But with many EXTI
    -- lines on a single NVIC channel, that could be tricky.
    node_text = node_text .. '  global_nvic_init_struct.NVIC_IRQChannel = ' .. nvic_irq .. '_IRQn;\n'
    node_text = node_text .. '  global_nvic_init_struct.NVIC_IRQChannelPriority = 0x03;\n'
    node_text = node_text .. '  global_nvic_init_struct.NVIC_IRQChannelCmd = ENABLE;\n'
    node_text = node_text .. '  NVIC_Init(&global_nvic_init_struct);\n'
  else
    return nil
  end
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Enable Hardware Interrupt" node)\n\n'
  if not varm_util.code_node_lode(node, node_text, proj_state) then
    return nil
  end
  return true
end

return node_reqs
