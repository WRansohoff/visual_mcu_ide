-- Required Lua/Lapis includes
local bcrypt = require("bcrypt")
local lapis = require("lapis")
local config = require("lapis.config").get()

-- Database models
local User = require("models/user")
local Project = require("models/project")

-- Initial Application setup.
local app = lapis.Application()
app:enable("etlua")
app.layout = require "views.layout_default"

app:get("/", function(self)
  -- Display an error message if appropriate.
  err_msg = self.session.err_msg
  self.session.err_msg = nil

  -- Load the User's 'projects' page if a user is signed in,
  -- otherwise redirect to sign-in/up page.
  current_user = self.session.current_user
  if not self.session.current_user then
    return { render = "sign_in" }
  else
    return { redirect_to = "/projects" }
  end
  -- (Shouldn't ever be reached)
  return { render = "index" }
end)

app:get("/projects", function(self)
  -- If there isn't a signed-in user, redirect to the landing page.
  if not self.session.current_user then
    self.session.err_msg = "You must be signed in to view this page."
    return { redirect_to = "/" }
  end
  current_user = self.session.current_user

  -- Load the user's projects. TODO: Paging, folders, just...some sort
  -- of organization.
  current_projects = Project:select("where user_id = ?", current_user.id)
  return { render = "projects" }
end)

app:post("/new_project", function(self)
  -- If there isn't a signed-in user, redirect to the landing page.
  if not self.session.current_user then
    self.session.err_msg = "You must be signed in to use this page."
    return { redirect_to = "/" }
  end
  -- If the required parameters are not provided, return to the /projects
  -- page without creating a new entry.
  if not self.params.title or self.params.title == "" then
    return { redirect_to = "/projects" }
  end
  -- Ditto if the current user already has a project with the given title.
  local existing_proj = Project:select("where user_id = ? and title = ?",
    self.session.current_user.id,
    self.params.title)
  if next(existing_proj) then
    return { redirect_to = "/projects" }
  end

  -- Create a new project for the user with the given title, and pass
  -- it on to the /projects page. TODO: Render a message or something?
  new_project = Project:create({
    user_id = self.session.current_user.id,
    title   = self.params.title
  })
  -- Return to the base 'projects' page.
  return { redirect_to = "/projects" }
end)

app:match("/project/:project_id", function(self)
  -- If there isn't a signed-in user, redirect to the landing page.
  if not self.session.current_user then
    self.session.err_msg = "You must be signed in to use this page."
    return { redirect_to = "/" }
  end
  -- If no ID is provided, return without action.
  if not self.params.project_id or self.params.project_id == "" then
    return { redirect_to "/projects" }
  end
  proj_id = tonumber(self.params.project_id)
  -- If no project exists with the given ID, return without action.
  current_project = Project:find(proj_id)
  if not current_project then
    return { redirect_to "/projects" }
  end
  -- If the current user does not own the given project,
  -- return without action.
  current_user = self.session.current_user
  if current_project.user_id ~= current_user.id then
    return { redirect_to "/projects" }
  end

  -- Load the nested list of tools to display.
  -- TODO: Organize this and move it somewhere sensible.
  tool_list = { }
  core_utils_list = { }
  core_utils_list["Boot"] = "Node"
  core_utils_list["Delay"] = "Node"
  tool_list["Core Utilities"] = core_utils_list
  gpio_list = { }
  -- gpio_list["Setup Input Pin"] = "Node"
  -- gpio_list["Setup Output Pin"] = "Node"
  -- gpio_list["Setup Alt. Func. Pin"] = "Node"
  gpio_list["Setup GPIO Pin"] = "Node"
  gpio_list["Disable GPIO Pin"] = "Node"
  gpio_list["Read Input Pin"] = "Node"
  gpio_list["Write Output Pin"] = "Node"
  tool_list["GPIO"] = gpio_list
  rcc_list = { }
  rcc_list["Enable Peripheral Clock"] = "Node"
  rcc_list["Disable Peripheral Clock"] = "Node"
  tool_list["RCC"] = rcc_list
  vars_logic_list = { }
  vars_logic_list["Define Variable"] = "Node"
  vars_logic_list["Set Variable"] = "Node"
  logic_conditions_list = { }
  logic_conditions_list["Equals"] = "Node"
  logic_conditions_list["Not Equals"] = "Node"
  logic_conditions_list["Greater than or Equals"] = "Node"
  logic_conditions_list["Less than or Equals"] = "Node"
  logic_conditions_list["Greater than"] = "Node"
  logic_conditions_list["Less than"] = "Node"
  vars_logic_list["Conditional Checks"] = logic_conditions_list
  logic_mods_list = { }
  logic_mods_list["Add"] = "Node"
  logic_mods_list["Subtract"] = "Node"
  logic_mods_list["Multiply"] = "Node"
  logic_mods_list["Divide"] = "Node"
  logic_mods_list["Orr-Equals"] = "Node"
  logic_mods_list["And-Equals"] = "Node"
  logic_mods_list["Bitwise Not"] = "Node"
  logic_mods_list["Logical Not"] = "Node"
  vars_logic_list["Variable Modification"] = logic_mods_list
  tool_list["Variables and Logic"] = vars_logic_list

  -- Check for a previously-saved file.
  local i_file = io.open("project_storage/project_" .. proj_id .. ".json", "r")
  loaded_nodes_str = nil
  if i_file then
    loaded_nodes_str = i_file:read("*a")
    i_file:close()
  end

  return { render = "project_show" }
end)

app:match("/project/delete/:project_id", function(self)
  -- If there isn't a signed-in user, redirect to the landing page.
  if not self.session.current_user then
    self.session.err_msg = "You must be signed in to use this page."
    return { redirect_to = "/" }
  end
  -- If no ID is provided, return without action.
  if not self.params.project_id or self.params.project_id == "" then
    return { redirect_to "/projects" }
  end
  local proj_id = tonumber(self.params.project_id)
  -- If no project exists with the given ID, return without action.
  local proj = Project:find(proj_id)
  if not proj then
    return { redirect_to "/projects" }
  end
  -- If the current user does not own the given project,
  -- return without action.
  if proj.user_id ~= self.session.current_user.id then
    return { redirect_to "/projects" }
  end

  -- Delete the project. TODO: Alert the user if deletion fails.
  local deleted = proj:delete()

  -- Return to the base 'projects' page.
  return { redirect_to = "/projects" }
end)

app:post("/save_project/:project_id", function(self)
  -- If there isn't a signed-in user, redirect to the landing page.
  if not self.session.current_user then
    self.session.err_msg = "You must be signed in to use this page."
    return { status = 403 }
  end
  -- If no ID is provided, return without action.
  if not self.params.project_id or self.params.project_id == "" then
    return { status = 400 }
  end
  local proj_id = tonumber(self.params.project_id)
  -- If no project exists with the given ID, return without action.
  local proj = Project:find(proj_id)
  if not proj then
    return { status = 404 }
  end
  -- If the current user does not own the given project,
  -- return without action.
  if proj.user_id ~= self.session.current_user.id then
    return { status = 403 }
  end

  -- Save the provided JSON string to a file.
  local o_file = io.open("project_storage/project_" .. proj_id .. ".json", "w")
  o_file:write(self.params.nodes_str)
  o_file:close()

  -- Done.
  return { json = { status = 'success', nodes = self.params.nodes }, status = 200 }
end)

app:post("/sign_up", function(self)
  if not self.params.username or self.params.username == "" then
    self.session.err_msg = "No username provided."
    return { redirect_to = "/" }
  elseif not self.params.password or self.params.password == "" then
    self.session.err_msg = "No password provided."
    return { redirect_to = "/" }
  else
    local existing_user = User:find({ username = self.params.username })
    if existing_user then
      self.session.err_msg = "Sorry, that username is taken."
      return { redirect_to = "/" }
    end
    -- Email is optional, but recommended.
    local user_email = ""
    if self.params.email and self.params.email ~= "" then
      user_email = self.params.email
      existing_user = User:find({ email = user_email })
      if existing_user then
        self.session.err_msg = "Sorry, that email address is already in use."
        return { redirect_to = "/" }
      end
    end

    -- Generate the password's salt.
    local salt = ""
    for i=1,16,1 do
      salt = salt .. string.char(math.random(33, 126))
    end
    local digest = bcrypt.digest(self.params.password..salt, BCRYPT_NUM_CYCLES)
    local new_user = User:create({
      username = self.params.username,
      email = user_email,
      digest = digest,
      salt = salt,
      admin_level = 0
    })
    -- Login the current user.
    self.session.current_user = new_user
    return { redirect_to = "/" }
  end
  return { redirect_to = "/" }
end)

app:post("/sign_in", function(self)
  -- Check that a username or email is provided, and the User exists.
  if not self.params.identifier or self.params.identifier == "" then
    self.session.err_msg = "No username or email provided."
    return { redirect_to = "/" }
  elseif not self.params.password or self.params.password == "" then
    self.session.err_msg = "No password provided."
    return { redirect_to = "/" }
  else
    local existing_user = User:find({ username = self.params.identifier })
    local id_type = ""
    if existing_user then
      id_type = "username"
    else
      existing_user = User:find({ email = self.params.identifier })
      if existing_user then
        id_type = "email"
      else
        self.session.err_msg = "No user found with that username and/or email"
        return { redirect_to = "/" }
      end
    end
    -- Check that the password matches.
    if bcrypt.verify((self.params.password..existing_user.salt), existing_user.digest) then
      self.session.current_user = existing_user
      return { redirect_to = "/" }
    end
    self.session.err_msg = "Incorrect password."
    return { redirect_to = "/" }
  end
end)

app:get("/sign_out", function(self)
  self.session.current_user = nil
  -- TODO: Any other session variable stuff to clear?

  -- Redirect to the landing page.
  return { redirect_to = "/" }
end)

return app
