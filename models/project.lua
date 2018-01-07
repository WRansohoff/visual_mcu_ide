local Model = require("lapis.db.model").Model

local Project = Model:extend("projects", {
  -- Map 'user_id' column to 'users' table.
  relations = {
    { "user", belongs_to = "User" }
  }
})

return Project
