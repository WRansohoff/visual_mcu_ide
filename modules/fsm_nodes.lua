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
    if varm_util.ensure_dir_exists(proj_dir .. 'boot_s/') and
       varm_util.ensure_dir_exists(proj_dir .. 'ld/') and
       varm_util.ensure_dir_exists(proj_dir .. 'lib/') and
       varm_util.ensure_dir_exists(proj_dir .. 'vector_tables/') and
       varm_util.ensure_dir_exists(proj_dir .. 'src/') and
       varm_util.ensure_dir_exists(proj_dir .. 'src/std_periph/') and
       varm_util.ensure_dir_exists(proj_dir .. 'src/arm_include/') then
       p_state.dir_structure = 'valid'
     else
       return p_state
     end
  else
    return p_state
  end
  return p_state
end

-- Process a single node in the FSM graph.
-- Return true if the processing succeeds, false if it doesn't.
function FSMNodes.process_node(node, node_graph, proj_state)
  return true
end

return FSMNodes