local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Enable RCC Peripheral Clock' Node)
-- ('RCC' controls the peripheral clocks which must be enabled for on-chip
-- hardware features to work)
function node_reqs.ensure_support_methods(node, proj_state)
  -- For now, just use the standard peripherals library's method.
  -- Copy the appropriate files, and uncomment their include statements.
  -- Also add the source files to the Makefile.
  -- stm32f0xx_misc.[ch]
  if not varm_util.import_std_periph_lib('misc', proj_state.base_dir) then
    return nil
  end
  -- stm32f0xx_rcc.[ch]
  if not varm_util.import_std_periph_lib('rcc', proj_state.base_dir) then
    return nil
  end

  -- Done.
  return true
end

-- ('Enable RCC Peripheral Clock' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("Enable Clock" (RCC) node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- TODO: Support more RCC periph clock values.
  if node.options and node.options.periph_clock then
    if node.options.periph_clock == 'GPIOA' then
      node_text = node_text .. '  RCC_AHBPeriphClockCmd(RCC_AHBPeriph_GPIOA, ENABLE);\n'
    elseif node.options.periph_clock == 'GPIOB' then
      node_text = node_text .. '  RCC_AHBPeriphClockCmd(RCC_AHBPeriph_GPIOB, ENABLE);\n'
    elseif node.options.periph_clock == 'GPIOC' then
      node_text = node_text .. '  RCC_AHBPeriphClockCmd(RCC_AHBPeriph_GPIOC, ENABLE);\n'
    elseif node.options.periph_clock == 'GPIOD' then
      node_text = node_text .. '  RCC_AHBPeriphClockCmd(RCC_AHBPeriph_GPIOD, ENABLE);\n'
    elseif node.options.periph_clock == 'GPIOE' then
      node_text = node_text .. '  RCC_AHBPeriphClockCmd(RCC_AHBPeriph_GPIOE, ENABLE);\n'
    elseif node.options.periph_clock == 'GPIOF' then
      node_text = node_text .. '  RCC_AHBPeriphClockCmd(RCC_AHBPeriph_GPIOF, ENABLE);\n'
    elseif node.options.periph_clock == 'I2C1' then
      node_text = node_text .. '  RCC_APB1PeriphClockCmd(RCC_APB1Periph_I2C1, ENABLE);\n'
    elseif node.options.periph_clock == 'ADC1' then
      node_text = node_text .. '  RCC_ADCCLKConfig(RCC_ADCCLK_PCLK_Div4);\n'
      node_text = node_text .. '  RCC_APB2PeriphClockCmd(RCC_APB2Periph_ADC1, ENABLE);\n'
    elseif node.options.periph_clock == 'PWR' then
      node_text = node_text .. '  RCC_APB1PeriphClockCmd(RCC_APB1Periph_PWR, ENABLE);\n'
    elseif node.options.periph_clock == 'SYSCFG' then
      node_text = node_text .. '  RCC_APB2PeriphClockCmd(RCC_APB2Periph_SYSCFG, ENABLE);\n'
    else
      return nil
    end
  else
    return nil
  end
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Enable Clock" (RCC) node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

return node_reqs
