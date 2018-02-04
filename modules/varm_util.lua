local varm_util = {}

-- This, uh...seems to work.
-- If it returns truth-y, the path exists. If it returns nil, it doesn't.
function varm_util.path_exists(path_str)
  return os.rename(path_str, path_str)
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
      temp_file:write(new_text .. '\n')
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

return varm_util
