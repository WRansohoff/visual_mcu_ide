local varm_util = {}

-- This, uh...seems to work.
-- If it returns truth-y, the path exists. If it returns nil, it doesn't.
function varm_util.path_exists(path_str)
  -- Verify path. (Necessary? I'm not sure if the os module strips input)
  local actual_path = path_str:gsub("[^a-zA-Z0-9_%/%.]", "")
  if actual_path ~= path_str then
    return nil
  end
  return os.rename(actual_path, actual_path)
end

-- Attempt to create a directory.
function varm_util.create_directory(dir_str)
  -- This is a dangerous method, so try to sanitize the string for safety.
  -- Strip non-(alphanumeric or _)s. And also forward-slashes, duh :)
  local actual_dir = dir_str:gsub("[^a-zA-Z0-9_/]", "")
  os.execute('mkdir ' .. actual_dir)
end

-- Check that a directory exists.
-- Return true if it exists or was created.
-- Return false if it did not exist and could not be created.
function varm_util.ensure_dir_exists(dir_str)
  local actual_dir = dir_str:gsub("[^a-zA-Z0-9_/]", "")
  if actual_dir ~= dir_str then
    -- Invalid directory name provided.
    return false
  end
  if not varm_util.path_exists(actual_dir) then
    -- Try to make the directory if it doesn't exist.
    varm_util.create_directory(actual_dir)
    if varm_util.path_exists(actual_dir) then
      return true
    end
  else
    -- Return true if the directory already exists.
    return true
  end
  return false
end

-- Ensure that the given directory exists, and delete any files
-- that are currently within it. This will not perform recursive deletes,
-- so directories will be left alone.
-- Return true if the directory exists and is empty at the end of the method.
-- Return false otherwise.
function varm_util.ensure_dir_empty(dir_path)
  -- (This also verifies that the path contains no special characters)
  if not varm_util.ensure_dir_exists(dir_path) then
    return false
  end
  -- Check for files in the given path.
  local iter = 0
  local ls_files = {}
  local sh_file = io.popen('ls -p "' .. dir_path .. '" | grep -v /')
  local deletions_success = true
  if sh_file then
    for fn in sh_file:lines() do
      -- Delete the file.
      if not os.remove(dir_path .. fn) then
        deleteions_success = false
      end
    end
    sh_file:close()
    return deletions_success
  end
  -- TODO: Does a failed 'ls' command count as success, or failure?
  return false
end

-- Copy a text file from path A to B.
function varm_util.copy_text_file(src_path, dest_path)
  return varm_util.copy_file(src_path, dest_path, '')
end

-- Copy a binary file from path A to B.
function varm_util.copy_bin_file(src_path, dest_path)
  return varm_util.copy_file(src_path, dest_path, 'b')
end

-- Copy a file from path A to B.
-- Returns true if the file was copied, false if not.
function varm_util.copy_file(src_path, dest_path, mode_suffix)
  -- Verify paths. (Strip special characters besides '_', '/', '.')
  local actual_src_path = src_path:gsub("[^a-zA-Z0-9_%/%.]", "")
  if actual_src_path ~= src_path then
    return nil
  end
  local actual_dest_path = dest_path:gsub("[^a-zA-Z0-9_%/%.]", "")
  if actual_dest_path ~= dest_path then
    return nil
  end
  -- Open both files.
  local src_file = io.open(src_path, 'r' .. mode_suffix)
  if not src_file then
    return nil
  end
  local dest_file = io.open(dest_path, 'w' .. mode_suffix)
  if not dest_file then
    src_file:close()
    return nil
  end
  -- Copy file contents.
  dest_file:write(src_file:read("*a"))
  -- Close both files.
  src_file:close()
  dest_file:close()
  -- Done.
  return true
end

-- Insert text into a file at a given point.
-- Technically, the easiest way to do this is to create a new file,
-- copy the existing one into it, add the new text at the right place,
-- finish copying the rest of the file, and then move the temporary
-- / copied file to overwrite the old file.
-- Return true if the insertion succeeds, nil/false-y if not.
function varm_util.insert_into_file(file_path, line_match, new_text)
  -- Verify the desired file path.
  local actual_src_path = file_path:gsub("[^a-zA-Z0-9_%/%.]", "")
  if actual_src_path ~= file_path then
    return nil
  end
  -- Open the R/W files.
  local old_file = io.open(file_path, 'r')
  if not old_file then
    return nil
  end
  local temp_path = file_path .. '.tmp'
  local temp_file = io.open(temp_path, 'w')
  if not temp_file then
    old_file:close()
    return nil
  end
  -- Copy the old file, line-by-line. When we hit the 'line_match' value,
  -- append text before the 'match' line with a trailing newline.
  for l in old_file:lines() do
    if l:find(line_match) then
      temp_file:write(new_text)
    end
    temp_file:write(l .. '\n')
  end
  old_file:close()
  temp_file:close()
  -- Rename the temp file, to overwrite the old one.
  if not os.rename(temp_path, file_path) then
    return nil
  end
  -- Done.
  return true
end

function varm_util.copy_block_into_file(source_file_path,
                                        dest_file_path,
                                        source_start_tag,
                                        source_end_tag,
                                        dest_line_match)
  -- Verify file paths / prevent arbitrary code execution.
  local actual_src_path = source_file_path:gsub("[^a-zA-Z0-9_%/%.]", "")
  if actual_src_path ~= source_file_path then
    return nil
  end
  local actual_dest_path = dest_file_path:gsub("[^a-zA-Z0-9_%/%.]", "")
  if actual_dest_path ~= dest_file_path then
    return nil
  end
  -- Open the source/destination files.
  local source_file = io.open(actual_src_path, 'r')
  if not source_file then
    return nil
  end
  local dest_file = io.open(actual_dest_path, 'r')
  if not dest_file then
    source_file:close()
    return nil
  end
  -- Search the destination file for the start/end tags. If either
  -- are found, don't perform the copy because it has already been done.
  for l in dest_file:lines() do
    if l:find(source_start_tag) or l:find(source_end_tag) then
      -- 'The block has already been copied' is considered a success.
      return true
    end
  end
  -- Read the source file, line-by-line. If/when we find the 'start_tag'
  -- value in a line, start adding lines to the 'text to insert' value.
  -- The 'start_tag' can be a subset of the line, so make it unique.
  -- If/when we find the 'end_tag' value in a line, stop.
  local text_to_insert = ''
  local currently_copying = false
  for l in source_file:lines() do
    if not currently_copying then
      if l:find(source_start_tag) then
        currently_copying = true
        text_to_insert = text_to_insert .. '//' .. source_start_tag .. '\n'
      end
    else
      if l:find(source_end_tag) then
        currently_copying = false
        text_to_insert = text_to_insert .. '//' .. source_end_tag .. '\n'
        break
      else
        text_to_insert = text_to_insert .. l .. '\n'
      end
    end
  end
  -- Close the source file.
  source_file:close()
  dest_file:close()
  -- If there is any text to insert, insert it into the 'destination' file.
  -- Also, only insert if the 'end_tag' value was found.
  if text_to_insert ~= '' and not currently_copying then
    return varm_util.insert_into_file(actual_dest_path,
                                      dest_line_match,
                                      text_to_insert)
  end
  return true
end

-- Similar to the 'insert_into_file' method, but this replaces a single
-- line. Mostly just used for uncommenting imports.
-- Return true if the processing suceeded, false otherwise.
-- If the 'old_line' pattern is not found, the file is simply copied
-- without alteration, and the operation is considered a success.
function varm_util.replace_lines_in_file(file_path, old_line, new_line)
  -- Verify the desired file path.
  local actual_src_path = file_path:gsub("[^a-zA-Z0-9_%/%.]", "")
  if actual_src_path ~= file_path then
    return nil
  end
  -- Open the R/W files.
  local old_file = io.open(file_path, 'r')
  if not old_file then
    return nil
  end
  local temp_path = file_path .. '.tmp'
  local temp_file = io.open(temp_path, 'w')
  if not temp_file then
    old_file:close()
    return nil
  end
  -- Copy the old file, line-by-line. When/if we hit the 'old_line' value,
  -- insert the 'new_line' value instead.
  for l in old_file:lines() do
    if l:find(old_line) ~= nil then
      temp_file:write(new_line .. '\n')
    else
      temp_file:write(l .. '\n')
    end
  end
  old_file:close()
  temp_file:close()
  -- Rename the temp file, to overwrite the old one.
  if not os.rename(temp_path, file_path) then
    return nil
  end
  -- Done.
  return true
end

-- Import a standard peripheral library file.
-- The 'which_lib' value defines which library to pull in. Examples:
-- 'rcc', 'gpio', 'misc', 'rtc', 'adc', 'i2c', 'tim', and so on.
-- The 'from_dir' path should contain both the .c and .h files
-- for the library that is being imported.
-- Currently, only STM32F0 chips are supported, but later that can be an opt.
-- Returns true if the library has already been imported, or if it did
-- not previously exist but was successfully imported.
function varm_util.import_std_periph_lib(which_lib, from_dir, proj_base_dir)
  local from_c = from_dir .. 'stm32f0xx_' .. which_lib .. '.c'
  local from_h = from_dir .. 'stm32f0xx_' .. which_lib .. '.h'
  local to_c = proj_base_dir .. 'src/std_periph/stm32f0xx_' .. which_lib .. '.c'
  local to_h = proj_base_dir .. 'src/std_periph/stm32f0xx_' .. which_lib .. '.h'
  if varm_util.path_exists(to_c) and varm_util.path_exists(to_h) then
    -- The library has already been imported.
    return true
  end

  -- Import the library.
  -- Copy source and header files.
  if not varm_util.copy_text_file(from_h, to_h) then
    return nil
  end
  if not varm_util.copy_text_file(from_c, to_c) then
    return nil
  end
  -- Un-comment the include in the 'stm32f0xx_conf.h' header file.
  if not varm_util.replace_lines_in_file(
      proj_base_dir .. 'src/stm32f0xx_conf.h',
      '//#include "stm32f0xx_' .. which_lib .. '.h"',
      '#include "stm32f0xx_' .. which_lib .. '.h"') then
    return nil
  end
  -- Add the source file to the Makefile's build targets.
  if not varm_util.insert_into_file(proj_base_dir .. 'Makefile',
      '# STD_PERIPH_SRCS',
      'C_SRC  += ./src/std_periph/stm32f0xx_' .. which_lib .. '.c\n') then
    return nil
  end

  -- Done.
  return true
end

return varm_util
