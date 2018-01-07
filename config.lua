local config = require("lapis.config")

-- Global config variables.
BCRYPT_NUM_CYCLES = 8

config("development", {
    port = 9009,
	postgres = {
		host = "127.0.0.1",
		user = "postgres",
		password = "postgres_password",
		database = "varm_test"
	},
	session_name = "visual_arm_ide_session",
    secret = "test_secret_change_12342153j413^!$%d1123"
})
