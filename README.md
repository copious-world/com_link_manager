# `com_link_manager`

 A class that helps orchestrate an application's communication links.



## Current State

Putting this out today for use in setting up mail, contact, blog, streamers, etc.


## Basic Use

The global shell command is `com_link_manager`. This command takes two command line paraters:

* the name of the configuration file
* the key to the type of connection being configured for the endpoint.

The types of connections that MessageLink endpoints will start up are keyed into the configuration file *map*. The user enters these types on the command line after the name of the configuration file.

Here is an example:

```
com_link_manager my_mail.conf attachments
```



## Configuration

Each configuration type starts with the configuration for a message relayer. The configuration for a type then includes the parameters for the type. All will include a module description for the type of connector the target will create.


### mail


In the following, the tool expects that a service will have launched an endpoint service for link management. The endpoint is an extension of the LinkManager class that comes with this module. The security options are off. On the command line, the second script parameter is "attachments". This mail service will set up a global persistence link.


```
{
	"address" : "192.168.1.77",
	"port"	: 5567,
	"use_tls" : false,
	"tls" : {
		"preloaded" : {
			"client_key" : false,
			"server_cert" : false
		},
		"client_key" : false,
		"server_cert" : false
	},
	"default_tls" : false,
	"extended_tls_options" : false,
	"send_on_reconnect" : false,
	"attempt_reconnect" : false,
	"max_reconnect" : 0,
	"reconnect_wait" 0,
	
	"attachments" : {
		"action" : "add-service",
		"target" : "module",
		"parameters" : {
			"path" : "persistence",
			"module" : "global_persistence",
			"class_definition" : "CategoricalPersistenceManager",
			"create" : true,
			"share" : false,
			"conf" : {
				"cache_manager" : false,
				"media_handler" : false,
				"repo_bridge" : {
					"relayer" : {
						"paths" : [
							{
								"path" : "mail",
								"address" : "192.168.1.81",
								"port"	: 5567,
								"use_tls" : false,
								"tls" : {
									"preloaded" : {
										"client_key" : false,
										"server_cert" : false
									},
									"client_key" : false,
									"server_cert" : false
								},
								"default_tls" : false,
								"extended_tls_options" : false,
								"send_on_reconnect" : false,
								"attempt_reconnect" : false,
								"max_reconnect" : 0,
								"reconnect_wait" 0
							}
						],
						"media_dir" : "a place",
						"entries_dir" : "a place",
						"default_repo" : "LAN",
						"media_types" : ["all"],
						"media_encryption_selection" : {
							"image" : true,
							"text" : false
						}
					}
				}
			}
		}
	},
	
	
	"mail" : {
		"action" : "add-service",
		"target" : "module",
		"parameters" : {
			"path" : "mail",
			"module" : "message-relay-services",
			"class_definition" : "MessageRelayer",
			"create" : true
			"conf" : {
				"address" : "192.168.1.81",
				"port"	: 5569,
				"use_tls" : false,
				"tls" : {
					"preloaded" : {
						"client_key" : false,
						"server_cert" : false
					},
					"client_key" : false,
					"server_cert" : false
				},
				"default_tls" : false,
				"extended_tls_options" : false,
				"send_on_reconnect" : false,
				"attempt_reconnect" : false,
				"max_reconnect" : 0,
				"reconnect_wait" 0
			}
		}
	}
	
}

```