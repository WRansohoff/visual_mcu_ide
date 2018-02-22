local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Read ADC Channel' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- Import the 'misc' and 'adc' standard peripheral libraries,
  -- and make sure that there is a global 'ADC_InitTypeDef'
  -- variable available to the main method.
  local stdp_s_path = 'static/node_code/adc_read/src/std_periph/'
  if not varm_util.import_std_periph_lib('misc', stdp_s_path, proj_state.base_dir) then
    return nil
  end
  if not varm_util.import_std_periph_lib('adc', stdp_s_path, proj_state.base_dir) then
    return nil
  end
  return true
end

-- ('Read ADC Channel' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("ADC Read Pin" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- ADC Read.
  -- TODO: More pins.
  if node.options and node.options.gpio_bank and
     node.options.gpio_pin and node.options.adc_var and
     node.options.adc_var ~= '(None)' then
    local pin_num = tostring(node.options.gpio_pin)
    local adc_b_conf = nil
    local adc_ch_conf = nil
    if node.options.gpio_bank == 'GPIOA' then
      if pin_num == '1' then
        adc_b_conf = 'ADC1'
        adc_ch_conf = 'ADC_Channel_1'
      end
    end
    if adc_b_conf and adc_ch_conf then
      node_text = node_text .. '  ADC_ChannelConfig(' ..
                  adc_b_conf .. ', ' .. adc_ch_conf ..
                  ', ADC_SampleTime_71_5Cycles);\n'
      node_text = node_text .. '  ADC_StartOfConversion(' ..
                  adc_b_conf .. ');\n'
      node_text = node_text .. 'while(ADC_GetFlagStatus(' ..
                  adc_b_conf .. ', ADC_FLAG_EOSEQ) == RESET){};\n'
      node_text = node_text .. node.options.adc_var ..
                  ' = ADC_GetConversionValue(' .. adc_b_conf .. ');\n'
    else
      return nil
    end
  else
    return nil
  end
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "ADC Read Pin" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

return node_reqs
