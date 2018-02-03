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

return varm_util
