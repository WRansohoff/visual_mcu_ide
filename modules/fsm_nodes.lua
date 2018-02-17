local varm_util = require("modules/varm_util")

local FSMNodes = {}

-- Create the initial filesystem structure for the project, using
-- information stored in the startup 'Boot' node. Store relevant
-- information in a table for the preprocessor to keep track of.
function FSMNodes.init_project_state(boot_node, node_graph, global_decs, proj_id)
  local p_state = {}
  local proj_int = tonumber(proj_id)
  if proj_int <= 0 then
    return p_state
  end
  -- Store global variable declarations.
  p_state.global_decs = global_decs

  -- Set the base directory, and make it if it doesn't exist.
  local proj_dir = 'project_storage/precomp_' .. proj_int .. '/'
  if varm_util.ensure_dir_empty(proj_dir) then
    p_state.base_dir = proj_dir
    -- Verify or create other required directories for the project skeleton.
    -- Also empty the directory contents, if any.
    if varm_util.ensure_dir_empty(proj_dir .. 'boot_s/') and
       varm_util.ensure_dir_empty(proj_dir .. 'ld/') and
       varm_util.ensure_dir_empty(proj_dir .. 'lib/') and
       varm_util.ensure_dir_empty(proj_dir .. 'vector_tables/') and
       varm_util.ensure_dir_empty(proj_dir .. 'src/') and
       varm_util.ensure_dir_empty(proj_dir .. 'src/std_periph/') and
       varm_util.ensure_dir_empty(proj_dir .. 'src/arm_include/') then
      p_state.dir_structure = 'valid'
      -- Generate the 'boot' assembly script.
      p_state.boot_script = FSMNodes.gen_boot_script(boot_node, p_state)
      -- Generate the linker script.
      p_state.ld_script = FSMNodes.gen_ld_script(boot_node, p_state)
      -- Copy the static GCC libs.
      p_state.with_toolchain_libs = FSMNodes.copy_static_libs(boot_node, p_state)
      -- Generate the vector table.
      p_state.vector_table = FSMNodes.gen_vector_table(boot_node, p_state)
      -- Generate the bare-bones source files.
      p_state.src_base = FSMNodes.gen_bare_source_files(boot_node, p_state)
      -- Generate a Makefile and LICENSE/README.md files.
      p_state.build_files_generated = FSMNodes.gen_build_files(boot_node, p_state)
     else
       return p_state
     end
  else
    return p_state
  end
  return p_state
end

function FSMNodes.get_boot_chip_type(boot_node)
  -- (Default value)
  local chip_type = 'STM32F030F4'
  if boot_node and boot_node.options and boot_node.options.chip_type then
    local boot_chip = boot_node.options.chip_type
    -- (Accepted options.)
    if boot_chip == 'STM32F030F4' or
       boot_chip == 'STM32F031F6' then
      chip_type = boot_chip
     end
  end
  return chip_type
end

-- Generate a .S assembly script to boot the specified chip with the
-- specified options (from the 'Boot' node.) It resets the 'bss' portions of
-- RAM to 0s, copies the 'data' portions, sets the core clock frequency,
-- that sort of annoying bookkeeping stuff.
-- Return the relative path to the generated boot script.
function FSMNodes.gen_boot_script(boot_node, cur_proj_state)
  local chip_type = FSMNodes.get_boot_chip_type(boot_node)

  -- Copy the appropriate boot script.
  local boot_script_fn = chip_type .. 'T6_boot.S'
  local boot_script_source_dir = 'static/node_code/boot/boot/'
  local boot_script_source_path = boot_script_source_dir .. boot_script_fn
  local boot_script_dest_dir = cur_proj_state.base_dir .. 'boot_s/'
  local boot_script_dest_path = boot_script_dest_dir .. boot_script_fn
  if varm_util.copy_text_file(boot_script_source_path, boot_script_dest_path) then
    return boot_script_dest_path
  end
  return nil
end

-- Copy a linker script for the given MCU chip into the 'ld/' directory.
-- Linker scripts specify things like how much RAM and Flash storage
-- the chip has available, so the compiler knows which addresses to use.
function FSMNodes.gen_ld_script(boot_node, cur_proj_state)
  local chip_type = FSMNodes.get_boot_chip_type(boot_node)

  -- Copy the appropriate linker script.
  local ld_script_fn = chip_type .. 'T6.ld'
  local ld_script_source_dir = 'static/node_code/boot/ld/'
  local ld_script_source_path = ld_script_source_dir .. ld_script_fn
  local ld_script_dest_dir = cur_proj_state.base_dir .. 'ld/'
  local ld_script_dest_path = ld_script_dest_dir .. ld_script_fn
  if varm_util.copy_text_file(ld_script_source_path, ld_script_dest_path) then
    return ld_script_dest_path
  end
  return nil
end

-- Copy library files. TODO: These files are too big. They should come with
-- the GCC toolchain, but I've had trouble with getting it to recognize
-- the correct 'libc' libraries for local armv6m builds automatically.
-- (These library files are a little over 10MB put together)
function FSMNodes.copy_static_libs(boot_node, cur_proj_state)
  -- These are the same for all armv6m chips, although lines other than
  -- Cortex-M0 chips may be armv7m. But really, these libraries shouldn't
  -- need to be served as part of a generated project.
  local libc_fn = 'libc.a'
  local libgcc_fn = 'libgcc.a'
  local clib_source_dir = 'static/node_code/boot/lib/'
  local libc_source_path = clib_source_dir .. libc_fn
  local libgcc_source_path = clib_source_dir .. libgcc_fn
  local clib_dest_dir = cur_proj_state.base_dir .. 'lib/'
  local libc_dest_path = clib_dest_dir .. libc_fn
  local libgcc_dest_path = clib_dest_dir .. libgcc_fn
  if not varm_util.copy_bin_file(libc_source_path, libc_dest_path) then
    return nil
  end
  if not varm_util.copy_bin_file(libgcc_source_path, libgcc_dest_path) then
    return nil
  end
  -- This method just returns a flag for 'toolchain libraries okay/not okay'
  return true
end

-- Generate a vector table for the given chip. Eventually, this can be used
-- to set hardware interrupts, but for now just copy a common one which
-- routes all interrupts to a common default 'error/infinite loop' handler.
function FSMNodes.gen_vector_table(boot_node, cur_proj_state)
  local chip_type = FSMNodes.get_boot_chip_type(boot_node)

  -- Copy the appropriate vector table file.
  local vt_script_fn = chip_type .. 'T6_vt.S'
  local vt_script_source_dir = 'static/node_code/boot/vector_tables/'
  local vt_script_source_path = vt_script_source_dir .. vt_script_fn
  local vt_script_dest_dir = cur_proj_state.base_dir .. 'vector_tables/'
  local vt_script_dest_path = vt_script_dest_dir .. vt_script_fn
  -- Copy files.
  if varm_util.copy_text_file(vt_script_source_path, vt_script_dest_path) then
    return vt_script_dest_path
  end
  return nil
end

-- Generate bare-bones source files; basically, some mostly-empty headers
-- / utility files, and an empty main method which should get called after
-- booting, if you compiled everything after the 'init_project_state' method.
function FSMNodes.gen_bare_source_files(boot_node, cur_proj_state)
  local chip_type = FSMNodes.get_boot_chip_type(boot_node)

  -- Right now, it looks like we should copy:
  -- - src/core.S
  -- - src/util.S
  -- - src/main.c
  -- - src/main.h
  -- - src/global.h
  -- - src/util_c.h
  -- - src/util_c.c
  -- - src/stm32f0xx.h
  -- - src/stm32f0xx_conf.h
  -- - src/std_periph
  --   - (none)
  -- - src/arm_include/
  --   - arm_common_tables.h
  --   - arm_const_structs.h
  --   - arm_math.h
  --   - core_cm0.h
  --   - core_cm0plus.h
  --   - core_cmFunc.h
  --   - core_cmInstr.h
  local files_to_copy = { 'src/core.S', 'src/util.S', 'src/global.h',
                          'src/main.h', 'src/main.c', 'src/stm32f0xx.h',
                          'src/util_c.h', 'src/util_c.c',
                          'src/stm32f0xx_conf.h',
                          'src/arm_include/arm_common_tables.h',
                          'src/arm_include/arm_const_structs.h',
                          'src/arm_include/arm_math.h',
                          'src/arm_include/core_cm0.h',
                          'src/arm_include/core_cm0plus.h', --TODO: delete?
                          'src/arm_include/core_cmFunc.h',
                          'src/arm_include/core_cmInstr.h',
                        }
  local copy_success = true
  for k, val in pairs(files_to_copy) do
    if val then
      local src_p = 'static/node_code/boot/' .. val
      local dest_p = cur_proj_state.base_dir .. val
      if not varm_util.copy_text_file(src_p, dest_p) then
        copy_success = false
      end
    end
  end

  -- One of the files copied, 'src/global.h', should also have initial
  -- global/static variable declarations:
  local g_vars_text = ''
  for i, val in pairs(cur_proj_state.global_decs) do
    if val and val.var_name and val.var_type and val.var_val then
      local var_c_type = val.var_type
      local var_c_val = tostring(val.var_val)
      if var_c_type == 'bool' then
        var_c_type = 'unsigned char'
        if var_c_val == 'false' then
          var_c_val = '0';
        elseif var_c_val == 'true' then
          var_c_val = '1';
        else
          -- uh...error? TODO
          var_c_val = '0';
        end
      elseif var_c_type == 'char' then
        var_c_val = "'" .. var_c_val .. "'"
      end
      g_vars_text = g_vars_text .. 'static ' .. var_c_type .. ' ' .. val.var_name .. ' = ' .. var_c_val .. ';\n'
    end
  end
  if not varm_util.insert_into_file(cur_proj_state.base_dir .. 'src/global.h',
                                    "/ GLOBAL_VAR_DEFINES:",
                                    g_vars_text) then
    copy_success = false
  end

  return copy_success
end

-- Generate build files. So, a GNU Makefile, a README.md which advises
-- users not to take programming tips from the autogenerated GOTO-riddled
-- code, and an MIT LICENSE file.
function FSMNodes.gen_build_files(boot_node, cur_proj_state)
  local chip_type = FSMNodes.get_boot_chip_type(boot_node)

  -- Copy the common README.md/LICENSE files, along with a
  -- chip-specific Makefile for GNU Make.
  local makefile_source_fn = 'Make_' .. chip_type
  local makefile_source_dir = 'static/node_code/boot/makefiles/'
  local makefile_source_path = makefile_source_dir .. makefile_source_fn
  local license_source_path = 'static/node_code/boot/LICENSE'
  local readme_source_path = 'static/node_code/boot/README.md'
  local makefile_dest_path = cur_proj_state.base_dir .. 'Makefile'
  local license_dest_path = cur_proj_state.base_dir .. 'LICENSE'
  local readme_dest_path = cur_proj_state.base_dir .. 'README.md'
  -- Copy files.
  if not varm_util.copy_text_file(makefile_source_path, makefile_dest_path) then
    return nil
  end
  if not varm_util.copy_text_file(license_source_path, license_dest_path) then
    return nil
  end
  if not varm_util.copy_text_file(readme_source_path, readme_dest_path) then
    return nil
  end
  -- This method just returns a 'build files generated/not generated' flag.
  return true
end

-- Process a single node in the FSM graph.
-- Return true if the processing succeeds, false if it doesn't.
function FSMNodes.process_node(node, node_graph, proj_state)
  -- Loading a node takes two steps.
  -- - First, we verify that all of the necessary utility methods/includes
  -- exist, and copy them into the project files if they aren't.
  -- - Second, we add the code to the end of the 'main' method. Like this:
  --     <This node's unique label>:
  --     <node code>
  --     GOTO <Next node's label>
  -- But this method will really just call other ones based on the node type.
  if (not node) or (not node.node_type) then
    return nil
  end
  if node.node_type == 'Boot' then
    if (FSMNodes.ensure_support_methods_boot_node(node, proj_state) and
        FSMNodes.append_boot_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'Delay' then
    if (FSMNodes.ensure_support_methods_delay_node(node, proj_state) and
        FSMNodes.append_delay_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'GPIO_Init' then
    if (FSMNodes.ensure_support_methods_gpio_init_node(node, proj_state) and
        FSMNodes.append_gpio_init_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'GPIO_Output' then
    if (FSMNodes.ensure_support_methods_gpio_output_node(node, proj_state) and
        FSMNodes.append_gpio_output_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'GPIO_Input' then
    if (FSMNodes.ensure_support_methods_gpio_input_node(node, proj_state) and
        FSMNodes.append_gpio_input_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'RCC_Enable' then
    if (FSMNodes.ensure_support_methods_rcc_enable_node(node, proj_state) and
        FSMNodes.append_rcc_enable_node(node, node_graph, proj_state)) then
      return true
    end
  -- (Variable Nodes)
  elseif node.node_type == 'Set_Variable' then
    if (FSMNodes.ensure_support_methods_set_var_node(node, proj_state) and
        FSMNodes.append_set_var_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'Set_Var_Logic_Not' then
    if (FSMNodes.ensure_support_methods_set_var_logic_not_node(node, proj_state) and
        FSMNodes.append_set_var_logic_not_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'Set_Var_Addition' then
    if (FSMNodes.ensure_support_methods_set_var_addition_node(node, proj_state) and
        FSMNodes.append_set_var_addition_node(node, node_graph, proj_state)) then
      return true
    end
  -- (Hardware Peripheral Nodes)
  elseif node.node_type == 'I2C_Init' then
    if (FSMNodes.ensure_support_methods_i2c_init_node(node, proj_state) and
        FSMNodes.append_i2c_init_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'I2C_Deinit' then
    -- TODO: I2C De-initialization.
    return false
  -- (External Device Nodes)
  elseif node.node_type == 'SSD1306_Init' then
    if (FSMNodes.ensure_support_methods_ssd1306_init_node(node, proj_state) and
        FSMNodes.append_ssd1306_init_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'SSD1306_Draw_Px' then
    if (FSMNodes.ensure_support_methods_ssd1306_draw_px_node(node, proj_state) and
        FSMNodes.append_ssd1306_draw_px_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'SSD1306_Draw_Rect' then
    if (FSMNodes.ensure_support_methods_ssd1306_draw_rect_node(node, proj_state) and
        FSMNodes.append_ssd1306_draw_rect_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'SSD1306_Refresh' then
    if (FSMNodes.ensure_support_methods_ssd1306_refresh_node(node, proj_state) and
        FSMNodes.append_ssd1306_refresh_node(node, node_graph, proj_state)) then
      return true
    end
  -- (Branching Nodes)
  elseif node.node_type == 'Check_Truthy' then
    if (FSMNodes.ensure_support_methods_check_truthy_node(node, proj_state) and
        FSMNodes.append_check_truthy_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'Check_Equals' then
    if (FSMNodes.ensure_support_methods_check_equals_node(node, proj_state) and
        FSMNodes.append_check_equals_node(node, node_graph, proj_state)) then
      return true
    end
  end
  -- (Unrecognized node type.)
  return nil
end

-- Ensure that all of the supporting methods needed by the 'Boot'
-- node are present, and add any that aren't.
function FSMNodes.ensure_support_methods_boot_node(node, proj_state)
  -- The 'Boot' mode doesn't really need any supporting methods, right now.
  -- Everything is included in the 'init_project_state' method.
  return true
end

-- Append code to the 'main' method for the 'Boot' node.
function FSMNodes.append_boot_node(node, node_graph, proj_state)
  -- There's no real code needed for the 'Boot' node, but we still have
  -- to add a label for the node and a GOTO to make sure that the
  -- program starts with the right node.
  -- (Start with 'goto Boot', to avoid compiler warnings for an unused label.
  local node_text = '  // ("Boot" node, program entry point)\n'
  node_text = node_text .. '  goto NODE_' .. node.node_ind .. ';\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Boot" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    '/ MAIN_ENTRY:',
                                    node_text) then
    return nil
  end
  return true
end

-- Ensure that all of the supporting methods needed by a 'Delay'
-- node are present, and add any that aren't.
function FSMNodes.ensure_support_methods_delay_node(node, proj_state)
  -- The 'Delay' node requires a 'delay' assembly method, depending on
  -- the chosen units. We want to add the method to the 'util.S' method,
  -- define it in the 'global.h' file, and ... well I think that's it.
  -- 'util.S' declares.
  local util_s_insert_path = 'static/node_code/delay/src/util_S.insert'
  local global_h_insert_path = 'static/node_code/delay/src/global_h.insert'
  if not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_DELAY_CYCLES_DEC_START:',
                                        'UTIL_S_DELAY_CYCLES_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') then
    return nil
  end
  -- 'util.S' defines.
  if not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_DELAY_CYCLES_DEF_START:',
                                        'UTIL_S_DELAY_CYCLES_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') then
    return nil
  end
  -- 'global.h' declare.
  if not varm_util.copy_block_into_file(global_h_insert_path,
                                        proj_state.base_dir .. 'src/global.h',
                                        'GLOBAL_EXTERN_DELAY_CYCLES_START:',
                                        'GLOBAL_EXTERN_DELAY_CYCLES_DONE:',
                                        '/ ASM_METHOD_DEFINES:') then
    return nil
  end
  return true
end

-- Append code to the 'main' method for a 'Delay' node.
function FSMNodes.append_delay_node(node, node_graph, proj_state)
  local node_text = '  // ("Delay" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- Get the number of cycles to delay.
  node_text = node_text .. '  delay_cycles('
  if node.options and node.options.delay_value then
    -- TODO: Support differend clock frequencies. For now, assume 48MHz.
    local delay_scale = 1
    if node.options.delay_units == 'us' then
      -- 48,000,000 cycles per second = 48 cycles per microsecond.
      delay_scale = 48
    elseif node.options.delay_units == 'ms' then
      -- 48,000,000 cycles per second = 48,000 cycles per millisecond.
      delay_scale = 48000
    elseif node.options.delay_units == 's' then
      -- 48,000,000 cycles per second.
      delay_scale = 48000000
    end
    local delay_cyc = tonumber(node.options.delay_value) * delay_scale
    node_text = node_text .. delay_cyc .. ');\n'
  else
    node_text = node_text .. '0);\n'
  end
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Delay" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

-- Ensure that supporting methods for GPIO pin initialization are present.
function FSMNodes.ensure_support_methods_gpio_init_node(node, proj_state)
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

-- Append code to the 'main' method for a 'Setup GPIO Pin' node.
function FSMNodes.append_gpio_init_node(node, node_graph, proj_state)
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

-- Ensure that all necessary supporting functions for GPIO Output exist.
function FSMNodes.ensure_support_methods_gpio_output_node(node, proj_state)
  -- GPIO output shouldn't require any standard peripheral libraries
  -- or supporting code. It's just setting a single register.
  return true
end

-- Append code to the 'main' method for a 'Set GPIO Pin Output' node.
function FSMNodes.append_gpio_output_node(node, node_graph, proj_state)
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
  if node.options.gpio_val and node.options.gpio_val == 'variable' and node.options.gpio_var_name and node.options.gpio_var_name ~= '(None)' then
    node_text = node_text .. '  if (' .. node.options.gpio_var_name ..
                ') {\n    ' .. gpio_bank .. '->ODR |= GPIO_ODR_' ..
                gpio_pin_num .. ';\n  }\n  else {\n    ' .. gpio_bank ..
                '->ODR &= ~GPIO_ODR_' .. gpio_pin_num .. ';\n  }\n'
  else
    if gpio_pin_set and gpio_pin_set ~= 0 then
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
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

-- Ensure that all necessary supporting functions for GPIO Input exist.
function FSMNodes.ensure_support_methods_gpio_input_node(node, proj_state)
  -- GPIO input shouldn't require any standard peripheral libraries
  -- or supporting code. It's just setting a single register.
  return true
end

-- Append code to the 'main' method for a 'Set GPIO Pin Input' node.
function FSMNodes.append_gpio_input_node(node, node_graph, proj_state)
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

-- Ensure that all necessary supporting functions for 'RCC Enable' exist.
-- ('RCC' controls the peripheral clocks which must be enabled for on-chip
-- hardware features to work)
function FSMNodes.ensure_support_methods_rcc_enable_node(node, proj_state)
  -- For now, just use the standard peripherals library's method.
  -- Copy the appropriate files, and uncomment their include statements.
  -- Also add the source files to the Makefile.
  local stdp_s_path = 'static/node_code/rcc_enable/src/std_periph/'
  -- stm32f0xx_misc.[ch]
  if not varm_util.import_std_periph_lib('misc', stdp_s_path, proj_state.base_dir) then
    return nil
  end
  -- stm32f0xx_rcc.[ch]
  if not varm_util.import_std_periph_lib('rcc', stdp_s_path, proj_state.base_dir) then
    return nil
  end

  -- Done.
  return true
end

-- Append code to the 'main' method for an 'RCC Enable' node.
function FSMNodes.append_rcc_enable_node(node, node_graph, proj_state)
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

-- Ensure supporting methods for setting variables.
function FSMNodes.ensure_support_methods_set_var_node(node, proj_state)
  -- Only primitive types, so no required includes to check.
  return true
end

-- Add a 'Set Variable' node to the program.
function FSMNodes.append_set_var_node(node, node_graph, proj_state)
  local node_text = '  // ("Set Variable" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- (The actual variable setting.)
  local var_c_type = node.options.var_type
  local var_c_val = tostring(node.options.var_val)
  if var_c_type == 'bool' then
    var_c_type = 'unsigned char'
    if var_c_val == 'false' then
      var_c_val = '0';
    elseif var_c_val == 'true' then
      var_c_val = '1';
    else
      -- uh...error? TODO
      var_c_val = '0';
    end
  elseif var_c_type == 'char' then
    var_c_val = "'" .. var_c_val .. "'"
  end
  node_text = node_text .. '  ' .. node.options.var_name .. ' = ' .. var_c_val .. ';\n'
  -- (Done.)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Set Variable" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

-- Ensure supporting methods for setting variables: 'A = !B'.
function FSMNodes.ensure_support_methods_set_var_logic_not_node(node, proj_state)
  -- Only primitive types, so no required includes to check.
  return true
end

-- Append a 'set var logic not' (A = !B) node.
function FSMNodes.append_set_var_logic_not_node(node, node_graph, proj_state)
  local node_text = '  // ("Set Variable logical-not" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- (The actual variable setting.)
  if node.options.var_a_name ~= '(None)' and node.options.var_b_name ~= '(None)' then
    node_text = node_text .. '  ' .. node.options.var_a_name .. ' = !' .. node.options.var_b_name .. ';\n'
  else
    return nil
  end
  -- (Done.)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Set Variable logical-not" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

-- Ensure supporting methods for setting variables: 'A = B + C'.
function FSMNodes.ensure_support_methods_set_var_addition_node(node, proj_state)
  -- Only primitive types, so no required includes to check.
  return true
end

-- Append a 'set var addition' (A = B + C) node.
function FSMNodes.append_set_var_addition_node(node, node_graph, proj_state)
  local node_text = '  // ("Set Variable by addition" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- (The actual variable setting.)
  -- TODO: type checking/verification? Or do that JS-side?
  if node.options.var_a_name and node.options.var_b_name then
    node_text = node_text .. '  ' .. node.options.var_a_name .. ' = ' ..
                node.options.var_b_name .. ' + '
    if node.options.add_val_type == 'val' and 
       (node.options.add_val_val or node.options.add_val_val == 0) then
      node_text = node_text .. tostring(node.options.add_val_val) .. ';\n'
    elseif node.options.add_val_type == 'var' then
      if node.options.add_val_val and node.options.add_val_val ~= '(None)' then
        node_text = node_text .. node.options.add_val_val .. ';\n'
      else
        return nil
      end
    else
      return nil
    end
  end
  -- (Done.)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "Set Variable by addition" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

-- Ensure supporting functionality for I2C peripheral initialization.
function FSMNodes.ensure_support_methods_i2c_init_node(node, proj_state)
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

-- Append an 'I2C Initialization' node to the current program.
function FSMNodes.append_i2c_init_node(node, node_graph, proj_state)
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

-- Ensure supporting functionality for SSD1306 OLED screen initialization.
function FSMNodes.ensure_support_methods_ssd1306_init_node(node, proj_state)
  -- This uses both a specific screen initialization method, and a common
  -- set of I2C communication methods.
  local util_s_insert_path = 'static/node_code/ssd1306_init/src/util_S.insert'
  local global_h_insert_path = 'static/node_code/ssd1306_init/src/global_h.insert'
  -- 'util.S' declares.
  if not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_COMMS_DEC_START:',
                                        'UTIL_S_I2C_COMMS_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_DC_COMMS_DEC_START:',
                                        'UTIL_S_I2C_DC_COMMS_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_SSD1306_INIT_DEC_START:',
                                        'UTIL_S_SSD1306_INIT_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') then
    return nil
  end
  -- 'util.S' defines.
  if not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_COMMS_DEF_START:',
                                        'UTIL_S_I2C_COMMS_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_DC_COMMS_DEF_START:',
                                        'UTIL_S_I2C_DC_COMMS_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_SSD1306_INIT_DEF_START:',
                                        'UTIL_S_SSD1306_INIT_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') then
    return nil
  end
  -- 'global.h' declare.
  if not varm_util.copy_block_into_file(global_h_insert_path,
                                        proj_state.base_dir .. 'src/global.h',
                                        'GLOBAL_EXTERN_SSD1306_INIT_START:',
                                        'GLOBAL_EXTERN_SSD1306_INIT_DONE:',
                                        '/ ASM_METHOD_DEFINES:') then
    return nil
  end
  return true
end

-- Ensure supporting functionality for SSD1306 pixel-drawing.
function FSMNodes.ensure_support_methods_ssd1306_draw_px_node(node, proj_state)
  -- This uses both a specific screen framebuffer drawing method,
  -- and a common set of I2C communication methods.
  local util_s_insert_path = 'static/node_code/ssd1306_draw_px/src/util_S.insert'
  local util_c_h_insert_path = 'static/node_code/ssd1306_draw_px/src/util_c_h.insert'
  local util_c_c_insert_path = 'static/node_code/ssd1306_draw_px/src/util_c_c.insert'
  local global_h_insert_path = 'static/node_code/ssd1306_draw_px/src/global_h.insert'
  -- 'util.S' declares.
  if not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_COMMS_DEC_START:',
                                        'UTIL_S_I2C_COMMS_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_DC_COMMS_DEC_START:',
                                        'UTIL_S_I2C_DC_COMMS_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_SSD1306_DRAW_FB_DEC_START:',
                                        'UTIL_S_SSD1306_DRAW_FB_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') then
    return nil
  end
  -- 'util.S' defines.
  if not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_COMMS_DEF_START:',
                                        'UTIL_S_I2C_COMMS_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_DC_COMMS_DEF_START:',
                                        'UTIL_S_I2C_DC_COMMS_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_SSD1306_DRAW_FB_DEF_START:',
                                        'UTIL_S_SSD1306_DRAW_FB_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') then
    return nil
  end
  -- 'util_c.h' declares.
  if not varm_util.copy_block_into_file(util_c_h_insert_path,
                                        proj_state.base_dir .. 'src/util_c.h',
                                        'UTIL_C_H_SSD1306_DRAW_PX_START:',
                                        'UTIL_C_H_SSD1306_DRAW_PX_DONE:',
                                        '/ UTIL_C_DECLARATIONS:') then
    return nil
  end
  -- 'util_c.c' defines.
  if not varm_util.copy_block_into_file(util_c_c_insert_path,
                                        proj_state.base_dir .. 'src/util_c.c',
                                        'UTIL_C_C_SSD1306_DRAW_PX_START:',
                                        'UTIL_C_C_SSD1306_DRAW_PX_DONE:',
                                        '/ UTIL_C_DEFINITIONS:') then
    return nil
  end
  -- 'global.h' declare.
  if not varm_util.copy_block_into_file(global_h_insert_path,
                                        proj_state.base_dir .. 'src/global.h',
                                        'GLOBAL_EXTERN_SSD1306_DRAW_FB_START:',
                                        'GLOBAL_EXTERN_SSD1306_DRAW_FB_DONE:',
                                        '/ ASM_METHOD_DEFINES:') then
    return nil
  end
  if not varm_util.copy_block_into_file(global_h_insert_path,
                                        proj_state.base_dir .. 'src/global.h',
                                        'GLOBAL_EXTERN_SSD1306_FB_VAR_START:',
                                        'GLOBAL_EXTERN_SSD1306_FB_VAR_DONE:',
                                        '/ SYS_GLOBAL_VAR_DEFINES:') then
    return nil
  end
  return true
end

-- Ensure supporting functionality for SSD1306 rect-drawing.
function FSMNodes.ensure_support_methods_ssd1306_draw_rect_node(node, proj_state)
  -- This uses both a specific screen framebuffer drawing method,
  -- and a common set of I2C communication methods.
  local util_s_insert_path = 'static/node_code/ssd1306_draw_rect/src/util_S.insert'
  local util_c_h_insert_path = 'static/node_code/ssd1306_draw_rect/src/util_c_h.insert'
  local util_c_c_insert_path = 'static/node_code/ssd1306_draw_rect/src/util_c_c.insert'
  local global_h_insert_path = 'static/node_code/ssd1306_draw_rect/src/global_h.insert'
  -- 'util.S' declares.
  if not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_COMMS_DEC_START:',
                                        'UTIL_S_I2C_COMMS_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_DC_COMMS_DEC_START:',
                                        'UTIL_S_I2C_DC_COMMS_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_SSD1306_DRAW_FB_DEC_START:',
                                        'UTIL_S_SSD1306_DRAW_FB_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') then
    return nil
  end
  -- 'util.S' defines.
  if not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_COMMS_DEF_START:',
                                        'UTIL_S_I2C_COMMS_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_DC_COMMS_DEF_START:',
                                        'UTIL_S_I2C_DC_COMMS_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_SSD1306_DRAW_FB_DEF_START:',
                                        'UTIL_S_SSD1306_DRAW_FB_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') then
    return nil
  end
  -- 'util_c.h' declares.
  if not varm_util.copy_block_into_file(util_c_h_insert_path,
                                        proj_state.base_dir .. 'src/util_c.h',
                                        'UTIL_C_H_SSD1306_DRAW_RECT_START:',
                                        'UTIL_C_H_SSD1306_DRAW_RECT_DONE:',
                                        '/ UTIL_C_DECLARATIONS:') then
    return nil
  end
  -- 'util_c.c' defines.
  if not varm_util.copy_block_into_file(util_c_c_insert_path,
                                        proj_state.base_dir .. 'src/util_c.c',
                                        'UTIL_C_C_SSD1306_DRAW_RECT_START:',
                                        'UTIL_C_C_SSD1306_DRAW_RECT_DONE:',
                                        '/ UTIL_C_DEFINITIONS:') then
    return nil
  end
  -- 'global.h' declare.
  if not varm_util.copy_block_into_file(global_h_insert_path,
                                        proj_state.base_dir .. 'src/global.h',
                                        'GLOBAL_EXTERN_SSD1306_DRAW_FB_START:',
                                        'GLOBAL_EXTERN_SSD1306_DRAW_FB_DONE:',
                                        '/ ASM_METHOD_DEFINES:') then
    return nil
  end
  if not varm_util.copy_block_into_file(global_h_insert_path,
                                        proj_state.base_dir .. 'src/global.h',
                                        'GLOBAL_EXTERN_SSD1306_FB_VAR_START:',
                                        'GLOBAL_EXTERN_SSD1306_FB_VAR_DONE:',
                                        '/ SYS_GLOBAL_VAR_DEFINES:') then
    return nil
  end
  return true
end

-- Ensure supporting functionality for syncing a framebuffer to
-- an SSD1306 screen.
function FSMNodes.ensure_support_methods_ssd1306_refresh_node(node, proj_state)
  local util_s_insert_path = 'static/node_code/ssd1306_refresh/src/util_S.insert'
  local global_h_insert_path = 'static/node_code/ssd1306_refresh/src/global_h.insert'
  -- Just the 'display framebuffer' method declare/defines from 'util.S'.
  -- (Along with its supporting I2C communication methods.)
  if not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_COMMS_DEC_START:',
                                        'UTIL_S_I2C_COMMS_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_DC_COMMS_DEC_START:',
                                        'UTIL_S_I2C_DC_COMMS_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_SSD1306_DRAW_FB_DEC_START:',
                                        'UTIL_S_SSD1306_DRAW_FB_DEC_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DECLARES:') then
    return nil
  end
  if not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_COMMS_DEF_START:',
                                        'UTIL_S_I2C_COMMS_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_I2C_DC_COMMS_DEF_START:',
                                        'UTIL_S_I2C_DC_COMMS_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') or
     not varm_util.copy_block_into_file(util_s_insert_path,
                                        proj_state.base_dir .. 'src/util.S',
                                        'UTIL_S_SSD1306_DRAW_FB_DEF_START:',
                                        'UTIL_S_SSD1306_DRAW_FB_DEF_DONE:',
                                        '/ ASM_GLOBAL_UTIL_DEFINES:') then
    return nil
  end
  -- (Also the extern and framebuffer memory in 'global.h')
  if not varm_util.copy_block_into_file(global_h_insert_path,
                                        proj_state.base_dir .. 'src/global.h',
                                        'GLOBAL_EXTERN_SSD1306_DRAW_FB_START:',
                                        'GLOBAL_EXTERN_SSD1306_DRAW_FB_DONE:',
                                        '/ ASM_METHOD_DEFINES:') then
    return nil
  end
  if not varm_util.copy_block_into_file(global_h_insert_path,
                                        proj_state.base_dir .. 'src/global.h',
                                        'GLOBAL_EXTERN_SSD1306_FB_VAR_START:',
                                        'GLOBAL_EXTERN_SSD1306_FB_VAR_DONE:',
                                        '/ SYS_GLOBAL_VAR_DEFINES:') then
    return nil
  end
  return true
end

-- Append an 'SSD1306 Initialization' node to the current program.
function FSMNodes.append_ssd1306_init_node(node, node_graph, proj_state)
  local node_text = '  // ("SSD1306 Monochrome OLED Screen Initialization" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  if node.options and node.options.i2c_periph_num then
    if node.options.i2c_periph_num == '1' or node.options.i2c_periph_num == 1 then
      i2c_base_addr = '0x40005400'
      node_text = node_text .. '  i2c_init_ssd1306(' .. i2c_base_addr .. ');\n'
    else
      -- (Currently only support I2C1)
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
  node_text = node_text .. '  // (End "SSD1306 Screen Initialization" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

-- Append an 'SSD1306 draw pixel' node to the current program.
function FSMNodes.append_ssd1306_draw_px_node(node, node_graph, proj_state)
  local node_text = '  // ("SSD1306 Draw Pixel" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  if node.options and node.options.i2c_periph_num and
     node.options.px_x and node.options.px_y and
     node.options.px_color then
    local i2c_port = tostring(node.options.i2c_periph_num)
    local i2c_base_addr = nil
    if i2c_port == '1' then
      i2c_base_addr = '0x40005400'
    else
      return nil
    end
    local px_x = tostring(node.options.px_x)
    local px_y = tostring(node.options.px_y)
    -- Default to 'On'.
    local px_col = '1'
    if node.options.px_color == 'Off' then
      px_col = '0'
    end
    node_text = node_text .. '  oled_write_pixel(' .. px_x .. ', ' ..
                px_y .. ', ' .. px_col .. ');\n'
  end
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "SSD1306 Draw Pixel" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

-- Append an 'SSD1306 draw rect' node to the current program.
function FSMNodes.append_ssd1306_draw_rect_node(node, node_graph, proj_state)
  local node_text = '  // ("SSD1306 Draw Rect" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  if node.options and node.options.i2c_periph_num and
     node.options.rect_x and node.options.rect_y and
     node.options.rect_color and node.options.rect_style and
     node.options.rect_w and node.options.rect_h then
    local i2c_port = tostring(node.options.i2c_periph_num)
    local i2c_base_addr = nil
    if i2c_port == '1' then
      i2c_base_addr = '0x40005400'
    else
      return nil
    end
    local rect_x = tostring(node.options.rect_x)
    local rect_y = tostring(node.options.rect_y)
    local rect_w = tostring(node.options.rect_w)
    local rect_h = tostring(node.options.rect_h)
    -- Default to 'On'.
    local rect_col = '1'
    if node.options.rect_color == 'Off' then
      rect_col = '0'
    end
    local rect_style = tostring(node.options.rect_style)
    -- Default to 'Fill'.
    local outline_w = '0'
    if rect_style == 'Outline' and node.options.outline then
      outline_w = tostring(node.options.outline)
    end
    node_text = node_text .. '  oled_draw_rect(' .. rect_x .. ', ' ..
                rect_y .. ', ' .. rect_w .. ', ' .. rect_h .. ', ' ..
                outline_w .. ', ' .. rect_col .. ');\n'
  else
    return nil
  end
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "SSD1306 Draw Rect" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

-- Append an 'SSD1306 Display Refresh' node to the current program.
function FSMNodes.append_ssd1306_refresh_node(node, node_graph, proj_state)
  local node_text = '  // ("SSD1306 Refresh Display" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- Refresh the display.
  local i2c_base_addr = nil
  if node.options and node.options.i2c_periph_num then
    local i2c_port = tostring(node.options.i2c_periph_num)
    if i2c_port == '1' then
      i2c_base_addr = '0x40005400'
    else
      return nil
    end
  else
    return nil
  end
  node_text = node_text .. '  i2c_display_framebuffer(' ..
                           i2c_base_addr .. ', &oled_fb);\n'
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "SSD1306 Refresh Display" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

-- Ensure supporting methods for branching 'check truth-y' statement.
function FSMNodes.ensure_support_methods_check_truthy_node(node, proj_state)
  -- (No required supporting code)
  return true
end

-- Append a branching 'check truth-y' node's code.
function FSMNodes.append_check_truthy_node(node, node_graph, proj_state)
  local node_text = '  // ("If variable is truth-y" branching node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  if node.output and node.output.branch_t and node.output.branch_f then
    -- Branching logic.
    node_text = node_text .. '  if (' .. node.options.var_name .. ') {\n'
    node_text = node_text .. '    goto NODE_' .. node.output.branch_t .. ';\n  }\n'
    node_text = node_text .. '  else {\n    goto NODE_' .. node.output.branch_f .. ';\n  }\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "If variable is truth-y" branching node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

-- Ensure supporting methods for branching 'are variables equal?' statement.
function FSMNodes.ensure_support_methods_check_equals_node(node, proj_state)
  -- (No required supporting code)
  return true
end

-- Append a branching 'are variables equal?' node's code.
function FSMNodes.append_check_equals_node(node, node_graph, proj_state)
  local node_text = '  // ("If variables are equal" branching node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  if node.output and node.output.branch_t and node.output.branch_f and
     node.options.var_a_name and node.options.var_b_name then
    -- Branching logic. TODO: Type checking?
    node_text = node_text .. '  if (' .. node.options.var_a_name ..
                             ' == ' .. node.options.var_b_name .. ') {\n'
    node_text = node_text .. '    goto NODE_' .. node.output.branch_t .. ';\n  }\n'
    node_text = node_text .. '  else {\n    goto NODE_' .. node.output.branch_f .. ';\n  }\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "If variables are equal" branching node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

return FSMNodes
