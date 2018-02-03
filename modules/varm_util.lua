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

return varm_util
