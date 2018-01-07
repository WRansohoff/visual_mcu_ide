local schema  = require("lapis.db.schema")
local types = schema.types

return {
	-- Add a basic Users table.
	[1] = function()
		schema.create_table("users", {
			{ "id", types.serial },
			{ "username", types.varchar },
			{ "digest", types.varchar },
            { "salt", types.varchar },
			{ "email", types.varchar },
			{ "admin_level", types.integer },

			"PRIMARY KEY (id)"
		})

        -- Add indices on username/email for lookups.
		schema.create_index("users", "username")
		schema.create_index("users", "email")
	end,

    -- Add a Projects table.
    [2] = function()
        schema.create_table("projects", {
            { "id", types.serial },
            { "user_id", types.foreign_key },
            { "title", types.varchar },

            "PRIMARY KEY (id)"
        })

        -- Add index on user_id for lookups.
        schema.create_index("projects", "user_id")
    end,
}
