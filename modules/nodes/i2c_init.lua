local varm_util = require("modules/varm_util")

local node_reqs = {}

-- ('Initialize I2C Peripheral' Node)
function node_reqs.ensure_support_methods(node, proj_state)
  -- This node uses a small assembly method to initialize the
  -- I2Cx peripheral to a minimal 'master' mode config with a given speed.
  -- It also uses the GPIO std periph library to set the pin Alt. Func.
  -- (Standard Peripherals Library imports)
  local stdp_s_path = 'static/node_code/gpio_init/src/std_periph/'
  if not varm_util.import_std_periph_lib('misc', stdp_s_path, proj_state.base_dir) then
    return nil
  end
  if not varm_util.import_std_periph_lib('gpio', stdp_s_path, proj_state.base_dir) then
    return nil
  end
  -- (Assembly I2C init method.)
  local util_s_insert_path = 'static/node_code/i2c_init/src/util_S.insert'
  local global_h_insert_path = 'static/node_code/i2c_init/src/global_h.insert'
  -- 'util.S' declares.
  if not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_INIT_DEC_START:',
                                        'UTIL_S_I2C_INIT_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') then
    return nil
  end
  -- 'util.S' defines.
  if not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_INIT_DEF_START:',
                                        'UTIL_S_I2C_INIT_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') then
    return nil
  end
  -- 'global.h' declare.
  if not varm_util.copy_block_into_file(global_h_insert_path,
                                        proj_state.base_dir .. 'src/global.h',
                                        'GLOBAL_EXTERN_I2C_INIT_START:',
                                        'GLOBAL_EXTERN_I2C_INIT_DONE:',
                                        '/ ASM_METHOD_DEFINES:') then
    return nil
  end
  return true
end

-- ('Initialize I2C Peripheral' Node)
function node_reqs.append_node(node, node_graph, proj_state)
  local node_text = '  // ("I2C Initialization" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- Call the I2C Initialization code.
  if node.options and node.options.i2c_periph_num and
     node.options.scl_pin and node.options.sda_pin and
     node.options.gpio_af and node.options.i2c_periph_speed then
    -- Set Alt. Func. GPIO pin settings.
    -- A9/A10 I2C1; currently the only supported configuration.
    local i2c_num = node.options.i2c_periph_num
    local i2c_base_addr = nil
    if (i2c_num == '1' or i2c_num == 1) and
       node.options.scl_pin == 'A9' and node.options.sda_pin == 'A10' then
      node_text = node_text .. '  GPIO_PinAFConfig(GPIOA, GPIO_PinSource9, GPIO_' .. node.options.gpio_af .. ');\n'
      node_text = node_text .. '  GPIO_PinAFConfig(GPIOA, GPIO_PinSource10, GPIO_' .. node.options.gpio_af .. ');\n'
      i2c_base_addr = '0x40005400'
    else
      return nil
    end
    -- Determine the I2C speed settings.
    -- TODO: Constants in the global.h file? (Ditto for i2c_base_addr)
    local i2c_speed_val = nil
    if node.options.i2c_periph_speed == '10KHz' then
      node_text = node_text .. '  // (10KHz @ 48MHz PLL)\n'
      i2c_speed_val = '0xB042C3C7'
    elseif node.options.i2c_periph_speed == '100KHz' then
      node_text = node_text .. '  // (100KHz @ 48MHz PLL)\n'
      i2c_speed_val = '0xB0420F13'
    elseif node.options.i2c_periph_speed == '400KHz' then
      node_text = node_text .. '  // (400KHz @ 48MHz PLL)\n'
      i2c_speed_val = '0x50330309'
    elseif node.options.i2c_periph_speed == '1MHz' then
      node_text = node_text .. '  // (1MHz @ 48MHz PLL)\n'
      i2c_speed_val = '0x50100103'
    else
      return nil
    end
    -- Add the actual I2C initialization call.
    if i2c_base_addr and i2c_speed_val then
      node_text = node_text .. '  i2c_periph_init(' .. i2c_base_addr .. ', ' .. i2c_speed_val .. ');\n'
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
  node_text = node_text .. '  // (End "I2C Initialization" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

return node_reqs
