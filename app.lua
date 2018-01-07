-- Required Lua/Lapis includes
local bcrypt = require("bcrypt")
local lapis = require("lapis")
local config = require("lapis.config").get()

-- Database models
local Model = require("lapis.db.model").Model
local User = Model:extend("users")

-- Initial Application setup.
local app = lapis.Application()
app:enable("etlua")
app.layout = require "views.layout_default"

app:get("/", function(self)
  -- Display an error message if appropriate.
  err_msg = self.session.err_msg
  self.session.err_msg = nil

  -- Load the 'index' page if a user is signed in, otherwise redirect
  -- to sign-in/up page.
  return_opts = {}
  current_user = self.session.current_user
  if not self.session.current_user then
    return_opts["render"] = "sign_in"
  else
    return_opts["render"] = "index"
  end
  return return_opts
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
