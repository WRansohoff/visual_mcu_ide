local varm_util = require("modules/varm_util")

-- Include individual node files. As I start to add more nodes,
-- there's getting to be a lot of copy/pasting. So...modules.
local boot_node = require("modules/nodes/boot")
local delay_node = require("modules/nodes/delay")
local gpio_init_node = require("modules/nodes/gpio_init")
local gpio_output_node = require("modules/nodes/gpio_output")
local gpio_input_node = require("modules/nodes/gpio_input")

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
  local m_vars_text = ''
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
      g_vars_text = g_vars_text .. 'volatile ' .. var_c_type .. ' ' ..
                    val.var_name .. ';\n'
      m_vars_text = m_vars_text .. '  ' .. val.var_name .. ' = ' ..
                    var_c_val .. ';\n'
    end
  end
  if not varm_util.insert_into_file(cur_proj_state.base_dir .. 'src/global.h',
                                    "/ GLOBAL_VAR_DEFINES:",
                                    g_vars_text) then
    copy_success = false
  end
  if not varm_util.insert_into_file(cur_proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_VAR_DEFS:",
                                    m_vars_text) then
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
    if (boot_node.ensure_support_methods(node, proj_state) and
        boot_node.append_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'Delay' then
    if (delay_node.ensure_support_methods(node, proj_state) and
        delay_node.append_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'GPIO_Init' then
    if (gpio_init_node.ensure_support_methods(node, proj_state) and
        gpio_init_node.append_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'GPIO_Output' then
    if (gpio_output_node.ensure_support_methods(node, proj_state) and
        gpio_output_node.append_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'GPIO_Input' then
    if (gpio_input_node.ensure_support_methods(node, proj_state) and
        gpio_input_node.append_node(node, node_graph, proj_state)) then
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
  elseif node.node_type == 'ADC_Init' then
    if (FSMNodes.ensure_support_methods_adc_init_node(node, proj_state) and
        FSMNodes.append_adc_init_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'ADC_Read' then
    if (FSMNodes.ensure_support_methods_adc_read_node(node, proj_state) and
        FSMNodes.append_adc_read_node(node, node_graph, proj_state)) then
      return true
    end
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
  elseif node.node_type == 'SSD1306_Draw_HL' then
    if (FSMNodes.ensure_support_methods_ssd1306_draw_horiz_line_node(node, proj_state) and
        FSMNodes.append_ssd1306_draw_horiz_line_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'SSD1306_Draw_VL' then
    if (FSMNodes.ensure_support_methods_ssd1306_draw_vert_line_node(node, proj_state) and
        FSMNodes.append_ssd1306_draw_vert_line_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'SSD1306_Draw_Rect' then
    if (FSMNodes.ensure_support_methods_ssd1306_draw_rect_node(node, proj_state) and
        FSMNodes.append_ssd1306_draw_rect_node(node, node_graph, proj_state)) then
      return true
    end
  elseif node.node_type == 'SSD1306_Draw_Text' then
    if (FSMNodes.ensure_support_methods_ssd1306_draw_text_node(node, proj_state) and
        FSMNodes.append_ssd1306_draw_text_node(node, node_graph, proj_state)) then
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
    elseif node.options.periph_clock == 'ADC1' then
      node_text = node_text .. '  RCC_ADCCLKConfig(RCC_ADCCLK_PCLK_Div4);\n'
      node_text = node_text .. '  RCC_APB2PeriphClockCmd(RCC_APB2Periph_ADC1, ENABLE);\n'
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

-- Ensure supporting functionality for ADC peripheral initialization.
function FSMNodes.ensure_support_methods_adc_init_node(node, proj_state)
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

-- Append an 'ADC Initialization' node to the current program.
function FSMNodes.append_adc_init_node(node, node_graph, proj_state)
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

-- Ensure supporting functionality for reading an ADC pin.
function FSMNodes.ensure_support_methods_adc_read_node(node, proj_state)
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

-- Append an 'ADC Read' node to the current program.
function FSMNodes.append_adc_read_node(node, node_graph, proj_state)
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
  -- This uses a common set of I2C communication methods, and a C
  -- framebuffer drawing metod. Also an I2C screen drawing method.
  if not varm_util.ensure_i2c_comms_included('static/node_code/ssd1306_draw_px/', proj_state) then
    return nil
  end
  if not varm_util.ensure_i2c_dc_comms_included('static/node_code/ssd1306_draw_px/', proj_state) then
    return nil
  end
  if not varm_util.ensure_ssd1306_fb_included('static/node_code/ssd1306_draw_px/', proj_state) then
    return nil
  end
  local util_c_h_insert_path = 'static/node_code/ssd1306_draw_px/src/util_c_h.insert'
  local util_c_c_insert_path = 'static/node_code/ssd1306_draw_px/src/util_c_c.insert'
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
  return true
end

-- Ensure supporting functionality for SSD1306 horizontal line drawing.
function FSMNodes.ensure_support_methods_ssd1306_draw_horiz_line_node(node, proj_state)
  if not varm_util.ensure_i2c_comms_included('static/node_code/ssd1306_draw_horiz_line/', proj_state) then
    return nil
  end
  if not varm_util.ensure_i2c_dc_comms_included('static/node_code/ssd1306_draw_horiz_line/', proj_state) then
    return nil
  end
  if not varm_util.ensure_ssd1306_fb_included('static/node_code/ssd1306_draw_horiz_line/', proj_state) then
    return nil
  end
  local util_c_h_insert_path = 'static/node_code/ssd1306_draw_horiz_line/src/util_c_h.insert'
  local util_c_c_insert_path = 'static/node_code/ssd1306_draw_horiz_line/src/util_c_c.insert'
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
  return true
end

-- Ensure supporting functionality for SSD1306 vertical line drawing.
function FSMNodes.ensure_support_methods_ssd1306_draw_vert_line_node(node, proj_state)
  if not varm_util.ensure_i2c_comms_included('static/node_code/ssd1306_draw_vert_line/', proj_state) then
    return nil
  end
  if not varm_util.ensure_i2c_dc_comms_included('static/node_code/ssd1306_draw_vert_line/', proj_state) then
    return nil
  end
  if not varm_util.ensure_ssd1306_fb_included('static/node_code/ssd1306_draw_vert_line/', proj_state) then
    return nil
  end
  local util_c_h_insert_path = 'static/node_code/ssd1306_draw_vert_line/src/util_c_h.insert'
  local util_c_c_insert_path = 'static/node_code/ssd1306_draw_vert_line/src/util_c_c.insert'
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
  return true
end

-- Ensure supporting functionality for SSD1306 rect-drawing.
function FSMNodes.ensure_support_methods_ssd1306_draw_rect_node(node, proj_state)
  -- This uses both a specific screen framebuffer drawing method,
  -- and a common set of I2C communication methods.
  local util_c_h_insert_path = 'static/node_code/ssd1306_draw_rect/src/util_c_h.insert'
  local util_c_c_insert_path = 'static/node_code/ssd1306_draw_rect/src/util_c_c.insert'
  if not varm_util.ensure_i2c_comms_included('static/node_code/ssd1306_draw_rect/', proj_state) then
    return nil
  end
  if not varm_util.ensure_i2c_dc_comms_included('static/node_code/ssd1306_draw_rect/', proj_state) then
    return nil
  end
  if not varm_util.ensure_ssd1306_fb_included('static/node_code/ssd1306_draw_rect/', proj_state) then
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
  return true
end

-- Ensure supporting functionality for SSD1306 text drawing.
function FSMNodes.ensure_support_methods_ssd1306_draw_text_node(node, proj_state)
  if not varm_util.ensure_i2c_comms_included('static/node_code/ssd1306_draw_text/', proj_state) then
    return nil
  end
  if not varm_util.ensure_i2c_dc_comms_included('static/node_code/ssd1306_draw_text/', proj_state) then
    return nil
  end
  if not varm_util.ensure_ssd1306_fb_included('static/node_code/ssd1306_draw_text/', proj_state) then
    return nil
  end
  local util_c_h_insert_path = 'static/node_code/ssd1306_draw_text/src/util_c_h.insert'
  local util_c_c_insert_path = 'static/node_code/ssd1306_draw_text/src/util_c_c.insert'
  local global_h_insert_path = 'static/node_code/ssd1306_draw_text/src/global_h.insert'
  -- 'util_c.h' declares.
  if not varm_util.copy_block_into_file(util_c_h_insert_path,
                                        proj_state.base_dir .. 'src/util_c.h',
                                        'UTIL_C_H_SSD1306_DRAW_PX_START:',
                                        'UTIL_C_H_SSD1306_DRAW_PX_DONE:',
                                        '/ UTIL_C_DECLARATIONS:') then
    return nil
  end
  if not varm_util.copy_block_into_file(util_c_h_insert_path,
                                        proj_state.base_dir .. 'src/util_c.h',
                                        'UTIL_C_H_SSD1306_DRAW_RECT_START:',
                                        'UTIL_C_H_SSD1306_DRAW_RECT_DONE:',
                                        '/ UTIL_C_DECLARATIONS:') then
    return nil
  end
  if not varm_util.copy_block_into_file(util_c_h_insert_path,
                                        proj_state.base_dir .. 'src/util_c.h',
                                        'UTIL_C_H_SSD1306_DRAW_TEXT_START:',
                                        'UTIL_C_H_SSD1306_DRAW_TEXT_DONE:',
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
  if not varm_util.copy_block_into_file(util_c_c_insert_path,
                                        proj_state.base_dir .. 'src/util_c.c',
                                        'UTIL_C_C_SSD1306_DRAW_RECT_START:',
                                        'UTIL_C_C_SSD1306_DRAW_RECT_DONE:',
                                        '/ UTIL_C_DEFINITIONS:') then
    return nil
  end
  if not varm_util.copy_block_into_file(util_c_c_insert_path,
                                        proj_state.base_dir .. 'src/util_c.c',
                                        'UTIL_C_C_SSD1306_DRAW_TEXT_START:',
                                        'UTIL_C_C_SSD1306_DRAW_TEXT_DONE:',
                                        '/ UTIL_C_DEFINITIONS:') then
    return nil
  end
  -- 'global.h' definitions.
  if not varm_util.copy_block_into_file(global_h_insert_path,
                                        proj_state.base_dir .. 'src/global.h',
                                        'GLOBAL_DEFS_SSD1306_SMALL_TEXT_CHARS_START:',
                                        'GLOBAL_DEFS_SSD1306_SMALL_TEXT_CHARS_DONE',
                                        '/ SYS_GLOBAL_VAR_DEFINES:') then
    return nil
  end
  if not varm_util.copy_block_into_file(global_h_insert_path,
                                        proj_state.base_dir .. 'src/global.h',
                                        'GLOBAL_DEFS_SSD1306_TEXT_LINE_BUF_START:',
                                        'GLOBAL_DEFS_SSD1306_TEXT_LINE_BUF_DONE:',
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
  -- TODO: 'refresh display after' option, or delete i2c stuff.
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

-- Append an 'SSD1306 draw horizontal line' node to the current program.
function FSMNodes.append_ssd1306_draw_horiz_line_node(node, node_graph, proj_state)
  local node_text = '  // ("SSD1306 Draw Horizontal Line" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- TODO: 'refresh display after' option, or delete i2c stuff.
  if node.options and node.options.i2c_periph_num and
     node.options.line_x and node.options.line_y and
     node.options.line_length and node.options.line_color then
    local i2c_port = tostring(node.options.i2c_periph_num)
    local i2c_base_addr = nil
    if i2c_port == '1' then
      i2c_base_addr = '0x40005400'
    else
      return nil
    end
    local line_x = tostring(node.options.line_x)
    local line_y = tostring(node.options.line_y)
    local line_len = tostring(node.options.line_length)
    -- Default to 'On'.
    local line_col = '1'
    if node.options.line_color == 'Off' then
      line_col = '0'
    end
    node_text = node_text .. '  oled_draw_h_line(' .. line_x .. ', ' ..
                line_y .. ', ' .. line_len .. ', ' .. line_col .. ');\n'
  else
    return nil
  end
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "SSD1306 Draw Horizontal Line" node)\n\n'
  if not varm_util.insert_into_file(proj_state.base_dir .. 'src/main.c',
                                    "/ MAIN_ENTRY:",
                                    node_text) then
    return nil
  end
  return true
end

-- Append an 'SSD1306 draw vertical line' node to the current program.
function FSMNodes.append_ssd1306_draw_vert_line_node(node, node_graph, proj_state)
  local node_text = '  // ("SSD1306 Draw Vertical Line" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- TODO: 'refresh display after' option, or delete i2c stuff.
  if node.options and node.options.i2c_periph_num and
     node.options.line_x and node.options.line_y and
     node.options.line_length and node.options.line_color then
    local i2c_port = tostring(node.options.i2c_periph_num)
    local i2c_base_addr = nil
    if i2c_port == '1' then
      i2c_base_addr = '0x40005400'
    else
      return nil
    end
    local line_x = tostring(node.options.line_x)
    local line_y = tostring(node.options.line_y)
    local line_len = tostring(node.options.line_length)
    -- Default to 'On'.
    local line_col = '1'
    if node.options.line_color == 'Off' then
      line_col = '0'
    end
    node_text = node_text .. '  oled_draw_v_line(' .. line_x .. ', ' ..
                line_y .. ', ' .. line_len .. ', ' .. line_col .. ');\n'
  else
    return nil
  end
  -- (Done)
  if node.output and node.output.single then
    node_text = node_text .. '  goto NODE_' .. node.output.single .. ';\n'
  else
    return nil
  end
  node_text = node_text .. '  // (End "SSD1306 Draw Vertical Line" node)\n\n'
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

-- Append an 'SSD1306 draw text' node to the current program.
function FSMNodes.append_ssd1306_draw_text_node(node, node_graph, proj_state)
  local node_text = '  // ("SSD1306 Draw Text" node)\n'
  node_text = node_text .. '  NODE_' .. node.node_ind .. ':\n'
  -- TODO: 'refresh display after' option, or delete i2c stuff.
  if node.options and node.options.i2c_periph_num and
     node.options.text_x and node.options.text_y and
     node.options.text_type and node.options.text_size and
     node.options.text_color then
    local i2c_port = tostring(node.options.i2c_periph_num)
    local i2c_base_addr = nil
    if i2c_port == '1' then
      i2c_base_addr = '0x40005400'
    else
      return nil
    end
    local text_x = tostring(node.options.text_x)
    local cur_char_x = tonumber(text_x)
    local text_y = tostring(node.options.text_y)
    local text_type = node.options.text_type
    local text_str = node.options.text_line
    local text_var = node.options.text_var
    -- Default to 'small' text.
    local char_width = '6'
    if node.options.text_size == 'L' then
      char_width = '12'
    end
    -- Default to 'On'.
    local text_color = '1'
    if node.options.text_color == 'Off' then
      text_color = '0'
    end
    -- Draw the text string.
    -- TODO: Use the C 'draw_text' methods.
    if text_type == 'val' then
      text_str = text_str:sub(1, 23)
      node_text = node_text .. '  snprintf(oled_line_buf, 23, "%s", "' ..
                  text_str .. '");\n'
      node_text = node_text .. "  oled_line_buf[23] = '\\0';\n"
      node_text = node_text .. '  oled_draw_text(' ..
                  text_x .. ', ' .. text_y .. ', oled_line_buf, ' ..
                  text_color .. ", '" .. node.options.text_size:sub(1,1) .. "');\n"
    elseif text_type == 'var' then
      -- Draw a variable as a string.
      -- Get the variable's type.
      local var_type = ''
      local type_str = ''
      for i, val in pairs(proj_state.global_decs) do
        if val and val.var_name == text_var then
          var_type = val.var_type
        end
      end
      if (not var_type) or var_type == '' then
        return nil
      end
      if var_type == 'int' then
        node_text = node_text .. '  oled_draw_letter_i(' ..
                    text_x .. ', ' .. text_y .. ', ' .. text_var ..
                    ', ' .. text_color .. ", '" .. node.options.text_size .. "');\n"
      elseif var_type == 'float' then
        -- TODO
        return nil
      elseif var_type == 'char' then
        node_text = node_text .. '  oled_draw_letter_c(' ..
                    text_x .. ', ' .. text_y .. ', ' .. text_var ..
                    ', ' .. text_color .. ", '" .. node.options.text_size .. "');\n"
      elseif var_type == 'bool' then
        -- TODO
        return nil
      else
        return nil
      end
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
  node_text = node_text .. '  // (End "SSD1306 Draw Text" node)\n\n'
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
