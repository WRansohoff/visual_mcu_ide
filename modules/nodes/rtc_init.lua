local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Initialize RealTime Clock' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- Import the 'misc', 'rtc', and 'pwr' standard periph libs,
  -- and make sure that a global 'RTC_InitTypeDef' exists.
  if not varm_util.import_std_periph_lib('misc', proj_state.base_dir) or not
         varm_util.import_std_periph_lib('rtc', proj_state.base_dir) or not
         varm_util.import_std_periph_lib('pwr', proj_state.base_dir) then
    return nil
  end
  -- Ensure that a global 'RTC_InitTypeDef' struct is defined.
  if not varm_util.copy_block_into_file(
      'static/node_code/rtc_init/src/global_h.insert',
      proj_state.base_dir .. 'src/global.h',
      'SYS_GLOBAL_RTC_INIT_STRUCT_START:',
      'SYS_GLOBAL_RTC_INIT_STRUCT_DONE:',
      '/ SYS_GLOBAL_VAR_DEFINES:') then
    return nil
  end
  return true
end

-- ('Initialize RealTime Clock' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("RTC Initialization" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- Add the RTC Initialization code.
  -- TODO: Support a more precise LSE oscillator.
  if node.options and node.options.clock_source == 'LSI' then
    -- Enable the LSI oscillator and wait for it to stabilize.
    node_text = node_text .. '  RCC_LSICmd(ENABLE);\n' ..
                '  while(RCC_GetFlagStatus(RCC_FLAG_LSIRDY) == RESET) {};\n'
  else
    return nil
  end
  -- The 'backup domain' is protected against parasitic writes
  -- during startup; disable that.
  node_text = node_text .. '  PWR_BackupAccessCmd(ENABLE);\n'
  -- Reset backup domain registers to their default states.
  node_text = node_text .. '  RCC_BackupResetCmd(ENABLE);\n' ..
                           '  RCC_BackupResetCmd(DISABLE);\n'
  -- Reset the RTC peripheral.
  node_text = node_text .. '  RTC_DeInit();\n'
  -- Enable the RTC, and initialize it to a ~1Hz clock tick.
  -- Again, TODO: support LSE - also, bulk-import from a file?
  if node.options.clock_source == 'LSI' then
    node_text = node_text .. '  RCC_RTCCLKConfig(RCC_RTCCLKSource_LSI);\n' ..
                '  RCC_RTCCLKCmd(ENABLE);\n' ..
                '  RTC_WaitForSynchro();\n' ..
                '  global_rtc_init_struct.RTC_HourFormat = RTC_HourFormat_24;\n' ..
                '  global_rtc_init_struct.RTC_AsynchPrediv = 0x7F;\n' ..
                '  global_rtc_init_struct.RTC_SynchPrediv = 0xFF;\n' ..
                '  RTC_Init(&global_rtc_init_struct);\n'
  else
    return nil
  end
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "RTC Initialization" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

return node_reqs
