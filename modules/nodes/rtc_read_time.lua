local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Read RTC Time' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- Import the 'misc', 'rtc', and 'pwr' standard periph libs,
  -- and make sure that a global 'RTC_TimeTypeDef' exists.
  if not varm_util.import_std_periph_lib('misc', proj_state.base_dir) or not
         varm_util.import_std_periph_lib('rtc', proj_state.base_dir) or not
         varm_util.import_std_periph_lib('pwr', proj_state.base_dir) then
    return nil
  end
  -- Ensure that a global 'RTC_TimeTypeDef' struct is defined.
  if not varm_util.copy_block_into_file(
      'static/node_code/rtc_read_time/src/global_h.insert',
      proj_state.base_dir .. 'src/global.h',
      'SYS_GLOBAL_RTC_TIME_STRUCT_START:',
      'SYS_GLOBAL_RTC_TIME_STRUCT_DONE:',
      '/ SYS_GLOBAL_VAR_DEFINES:') then
    return nil
  end
  return true
end

-- ('Read RTC Time' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("RTC Read Time" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- Get the current time.
  node_text = node_text .. '  RTC_WaitForSynchro();\n'
  node_text = node_text .. '  RTC_GetTime(RTC_Format_BIN, &global_rtc_time_struct);\n'
  -- Store it if necessary.
  if node.options.seconds_read_var ~= '(None)' then
    node_text = node_text .. '  ' ..
                node.options.seconds_read_var ..
                ' = global_rtc_time_struct.RTC_Seconds;\n'
  end
  if node.options.minutes_read_var ~= '(None)' then
    node_text = node_text .. '  ' ..
                node.options.minutes_read_var ..
                ' = global_rtc_time_struct.RTC_Minutes;\n'
  end
  if node.options.hours_read_var ~= '(None)' then
    node_text = node_text .. '  ' ..
                node.options.hours_read_var ..
                ' = global_rtc_time_struct.RTC_Hours;\n'
  end
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "RTC Read Time" node)\n\n'
  if not varm_util.code_node_lode(node, node_text, proj_state) then
    return nil
  end
  return true
end

return node_reqs
