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
}
