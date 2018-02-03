local varm_util = require("modules/varm_util")

local FSMNodes = {}

-- Create the initial filesystem structure for the project, using
-- information stored in the startup 'Boot' node. Store relevant
-- information in a table for the preprocessor to keep track of.
function FSMNodes.init_project_state(boot_node, node_graph, proj_id)
  local p_state = {}
  local proj_int = tonumber(proj_id)
  if proj_int <= 0 then
    return p_state
  end
  -- Set the base directory, and make it if it doesn't exist.
  local proj_dir = 'project_storage/precomp_' .. proj_int .. '/'
  if varm_util.ensure_dir_exists(proj_dir) then
    p_state.base_dir = proj_dir
    -- Verify or create other required directories for the project skeleton.
    -- Also empty the directory contents, if any.
    if varm_util.ensure_dir_empty(proj_dir .. 'boot_s/') and
       varm_util.ensure_dir_exists(proj_dir .. 'ld/') and
       varm_util.ensure_dir_exists(proj_dir .. 'lib/') and
       varm_util.ensure_dir_exists(proj_dir .. 'vector_tables/') and
       varm_util.ensure_dir_exists(proj_dir .. 'src/') and
       varm_util.ensure_dir_exists(proj_dir .. 'src/std_periph/') and
       varm_util.ensure_dir_exists(proj_dir .. 'src/arm_include/') then
      p_state.dir_structure = 'valid'
      -- Generate the 'boot' assembly script.
      p_state.boot_script = FSMNodes.gen_boot_script(boot_node, p_state)
      -- Generate the linker script.
      p_state.ld_script = FSMNodes.gen_ld_script(boot_node, p_state)
      -- Copy the static GCC libs.
      p_state.with_toolchain_libs = FSMNodes.copy_static_libs(boot_node, p_state)
      -- Generate the vector table.
      p_state.vector_table = FSMNodes.gen_vector_table(boo_node, p_state)
      -- Generate the bare-bones source files.
      p_state.src_base = FSMNodes.gen_bare_source_files(boot_node, p_state)
      -- Generate the Makefile, and add LICENSE/README.md files.
      p_state.build_files = FSMNodes.gen_build_files(boot_node, p_state)
     else
       return p_state
     end
  else
    return p_state
  end
  return p_state
end

-- Generate a .S assembly script to boot the specified chip with the
-- specified options (from the 'Boot' node.) It resets the 'bss' portions of
-- RAM to 0s, copies the 'data' portions, sets the core clock frequency,
-- that sort of annoying bookkeeping stuff.
-- Return the relative path to the generated boot script.
-- TODO: This will start with simply copying one common script per MCU.
function FSMNodes.gen_boot_script(boot_node, cur_proj_state)
  -- (Default value)
  local chip_type = 'STM32F030F4'
  if boot_node.options and boot_node.options.chip_type then
    local boot_chip = boot_node.options.chip_type
    -- (Accepted options.)
    if boot_chip == 'STM32F030F4' or
       boot_chip == 'STM32F031F6' then
      chip_type = boot_chip
     end
  end

  -- Copy the appropriate boot script.
  local boot_script_fn = chip_type .. 'T6_boot.S'
  local boot_script_source_dir = 'static/node_code/boot/boot/'
  local boot_script_source_path = boot_script_source_dir .. boot_script_fn
  local boot_script_dest_dir = cur_proj_state.base_dir .. 'boot_s/'
  local boot_script_dest_path = boot_script_dest_dir .. boot_script_fn
  -- Open the 'source' script and 'destination' files.
  local boot_script_source_file = io.open(boot_script_source_path, 'r')
  if not boot_script_source_file then
    return nil
  end
  local boot_script_dest_file = io.open(boot_script_dest_path, 'w')
  if not boot_script_dest_file then
    boot_script_source_file:close()
    return nil
  end
  -- Copy file contents.
  boot_script_dest_file:write(boot_script_source_file:read("*a"))
  -- Close files.
  boot_script_source_file:close()
  boot_script_dest_file:close()
  return boot_script_dest_path
end

-- Copy a linker script for the given MCU chip into the 'ld/' directory.
-- Linker scripts specify things like how much RAM and Flash storage
-- the chip has available, so the compiler knows which addresses to use.
-- TODO
function FSMNodes.gen_ld_script(boot_node, cur_proj_state)
  return nil
end

-- Copy library files. TODO: These files are too big. They should come with
-- the GCC toolchain, but I've had trouble with getting it to recognize
-- the correct 'libc' libraries for local armv6m builds automatically.
-- TODO
function FSMNodes.copy_static_libs(boot_node, cur_proj_state)
  return nil
end

-- Generate a vector table for the given chip. Eventually, this can be used
-- to set hardware interrupts, but for now just copy a common one which
-- routes all interrupts to a common default 'error/infinite loop' handler.
-- TODO
function FSMNodes.gen_vector_table(boot_node, cur_proj_state)
  return nil
end

-- Generate bare-bones source files; basically, some mostly-empty headers
-- / utility files, and an empty main method which should get called after
-- booting, if you compiled everything after the 'init_project_state' method.
-- TODO
function FSMNodes.gen_bare_source_files(boot_node, cur_proj_state)
  return nil
end

-- Generate build files. So, a GNU Makefile, a README.md which advises
-- users not to take programming tips from the autogenerated GOTO-riddled
-- code, and an MIT LICENSE file.
-- TODO
function FSMNodes.gen_build_files(boot_node, cur_proj_state)
  return nil
end

-- Process a single node in the FSM graph.
-- Return true if the processing succeeds, false if it doesn't.
function FSMNodes.process_node(node, node_graph, proj_state)
  return true
end

return FSMNodes
