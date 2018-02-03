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
      p_state.vector_table = FSMNodes.gen_vector_table(boo_node, p_state)
      -- Generate the bare-bones source files.
      p_state.src_base = FSMNodes.gen_bare_source_files(boot_node, p_state)
      -- Generate the Makefile, and add LICENSE/README.md files.
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
function FSMNodes.gen_ld_script(boot_node, cur_proj_state)
  local chip_type = FSMNodes.get_boot_chip_type(boot_node)

  -- Copy the appropriate linker script.
  local ld_script_fn = chip_type .. 'T6.ld'
  local ld_script_source_dir = 'static/node_code/boot/ld/'
  local ld_script_source_path = ld_script_source_dir .. ld_script_fn
  local ld_script_dest_dir = cur_proj_state.base_dir .. 'ld/'
  local ld_script_dest_path = ld_script_dest_dir .. ld_script_fn
  -- Open the 'source' script and 'destination' files.
  local ld_script_source_file = io.open(ld_script_source_path, 'r')
  if not ld_script_source_file then
    return nil
  end
  local ld_script_dest_file = io.open(ld_script_dest_path, 'w')
  if not ld_script_dest_file then
    ld_script_source_file:close()
    return nil
  end
  -- Copy file contents.
  ld_script_dest_file:write(ld_script_source_file:read("*a"))
  -- Close files.
  ld_script_source_file:close()
  ld_script_dest_file:close()
  return ld_script_dest_path
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
  -- Open the source/destination 'libc' files. Use 'binary' mode.
  local libc_source_file = io.open(libc_source_path, 'rb')
  if not libc_source_file then
    return nil
  end
  local libc_dest_file = io.open(libc_dest_path, 'wb')
  if not libc_dest_file then
    libc_source_file:close()
    return nil
  end
  -- Copy the 'libc' file.
  libc_dest_file:write(libc_source_file:read("*a"))
  -- Close the 'libc' files.
  libc_source_file:close()
  libc_dest_file:close()
  -- Open the source/destination 'libgcc' files. Use 'binary' mode.
  local libgcc_source_file = io.open(libgcc_source_path, 'rb')
  if not libgcc_source_file then
    return nil
  end
  local libgcc_dest_file = io.open(libgcc_dest_path, 'wb')
  if not libgcc_dest_file then
    libgcc_source_file:close()
    return nil
  end
  -- Copy the 'libc' file.
  libgcc_dest_file:write(libgcc_source_file:read("*a"))
  -- Close the 'libc' files.
  libgcc_source_file:close()
  libgcc_dest_file:close()
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
  -- Open the 'source' script and 'destination' files.
  local vt_script_source_file = io.open(vt_script_source_path, 'r')
  if not vt_script_source_file then
    return nil
  end
  local vt_script_dest_file = io.open(vt_script_dest_path, 'w')
  if not vt_script_dest_file then
    vt_script_source_file:close()
    return nil
  end
  -- Copy file contents.
  vt_script_dest_file:write(vt_script_source_file:read("*a"))
  -- Close files.
  vt_script_source_file:close()
  vt_script_dest_file:close()
  return vt_script_dest_path
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
  -- Open the Makefile's source/dest files.
  local makefile_source_file = io.open(makefile_source_path, 'r')
  if not makefile_source_file then
    return nil
  end
  local makefile_dest_file = io.open(makefile_dest_path, 'w')
  if not makefile_dest_file then
    makefile_source_file:close()
    return nil
  end
  -- Copy file contents.
  makefile_dest_file:write(makefile_source_file:read("*a"))
  -- Close Makefiles
  makefile_source_file:close()
  makefile_dest_file:close()
  -- Open the LICENSE source/dest files.
  local license_source_file = io.open(license_source_path, 'r')
  if not license_source_file then
    return nil
  end
  local license_dest_file = io.open(license_dest_path, 'w')
  if not license_dest_file then
    license_source_file:close()
    return nil
  end
  -- Copy file contents.
  license_dest_file:write(license_source_file:read("*a"))
  -- Close LICENSE files
  license_source_file:close()
  license_dest_file:close()
  -- Open the README source/dest files.
  local readme_source_file = io.open(readme_source_path, 'r')
  if not readme_source_file then
    return nil
  end
  local readme_dest_file = io.open(readme_dest_path, 'w')
  if not readme_dest_file then
    readme_source_file:close()
    return nil
  end
  -- Copy file contents.
  readme_dest_file:write(readme_source_file:read("*a"))
  -- Close LICENSE files
  readme_source_file:close()
  readme_dest_file:close()
  -- This method just returns a 'build files generated/not generated' flag.
  return true
end

-- Process a single node in the FSM graph.
-- Return true if the processing succeeds, false if it doesn't.
function FSMNodes.process_node(node, node_graph, proj_state)
  return true
end

return FSMNodes
