var servers = {
	iot_platform: {
		hostname: "localhost",
		port: 3000
	},
	user_app_server: {
		hostname: "localhost",
		port: 3001
	},
	logic_server:{
		hostname: "localhost",
		port: 3002
	},
	event_server:{
		hostname: "localhost",
		port: 3003
	},
	notification_server:{
		hostname: "10.2.132.79",
		port: 3300
	},
	data_server: {
		hostname: "10.2.130.222",
		port: 3000
	},
	data_listener : {
		hostname: "localhost",
		port: 3006
	},
	db_server : {
		hostname : "10.2.132.79"
	}

}

module.exports = servers;