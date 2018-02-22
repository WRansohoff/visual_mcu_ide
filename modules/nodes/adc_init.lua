local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Initialize ADC Peripheral' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- Import the 'misc' and 'adc' standard peripheral libraries,
  -- and make sure that there is a global 'ADC_InitTypeDef'
  -- variable available to the main method.
  local stdp_s_path = 'static/node_code/adc_init/src/std_periph/'
  if not varm_util.import_std_periph_lib('misc', stdp_s_path, proj_state.base_dir) then
    return nil
  end
  if not varm_util.import_std_periph_lib('adc', stdp_s_path, proj_state.base_dir) then
    return nil
  end
  -- Ensure that a global 'ADC_InitTypeDef' struct is defined.
  if not varm_util.copy_block_into_file(
      'static/node_code/adc_init/src/global_h.insert',
      proj_state.base_dir .. 'src/global.h',
      'SYS_GLOBAL_ADC_INIT_STRUCT_START:',
      'SYS_GLOBAL_ADC_INIT_STRUCT_DONE:',
      '/ SYS_GLOBAL_VAR_DEFINES:') then
    return nil
  end
  return true
end

-- ('Initialize ADC Peripheral' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("ADC Initialization" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- ADC Init.
  local adc_channel = nil
  if node.options and node.options.adc_channel then
    adc_channel = 'ADC' .. node.options.adc_channel
  else
    return nil
  end
  node_text = node_text .. '  ADC_DeInit(' .. adc_channel .. ');\n'
  node_text = node_text .. '  global_adc_init_struct.ADC_Resolution = ADC_Resolution_12b;\n'
  node_text = node_text .. '  global_adc_init_struct.ADC_ContinuousConvMode = DISABLE;\n'
  node_text = node_text .. '  global_adc_init_struct.ADC_ExternalTrigConvEdge = ADC_ExternalTrigConvEdge_None;\n'
  node_text = node_text .. '  global_adc_init_struct.ADC_ExternalTrigConv = ADC_ExternalTrigConv_T1_TRGO;\n'
  node_text = node_text .. '  global_adc_init_struct.ADC_DataAlign = ADC_DataAlign_Right;\n'
  node_text = node_text .. '  global_adc_init_struct.ADC_ScanDirection = ADC_ScanDirection_Upward;\n'
  node_text = node_text .. '  ADC_Init(' .. adc_channel .. ', &global_adc_init_struct);\n'
  node_text = node_text .. '  ADC_Cmd(' .. adc_channel .. ', ENABLE);\n'
  node_text = node_text .. '  while(!ADC_GetFlagStatus(ADC1, ADC_FLAG_ADRDY)){};\n'
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "ADC Initialization" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

return node_reqs
