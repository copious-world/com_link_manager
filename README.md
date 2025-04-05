# `com_link_manager`

 A class that helps orchestrate an application's communication links.

## Purpose

It seemed to be a good idea to do this as the number of configurations for individual micro-services started to grow. It does not have to become a large number before one realizes that consoldating configuration for links becomes helpful. Key management feeds directly into this awareness. 

Setting up a managed configuration directory helps, but the configuration files have to be delivered to all the run directories. As it is, some part of those have to be delivered still. But, on top of the file management, there is also the ordering of startup. What if a service fails and has to come back up? Do we restart all the services? 

The issue of all this being secure comes to mind. But, the command line tool provided here should only be used within the garden walls. (The command line tool will be refered to as the "the tool" in the following.)

## Install

### command line

```
npm install -g com_link_manager
```

The command line is for the execution of the tool, **`com_link_manager`**. The tool uses two parameters:

1. The name of a configuration file in JSON format.
2. the name of the target found in the configuration file object under the field ***connections***.

Each object keydd by the ***connections*** map specifies actions that a server may take to manage connections if the server has been programmed to use the ***LinkManager*** class.

### endpoint server

To be a serving endpoint for link management, install this module to your projects:

```
npm install -s com_link_manager
```

Then import the class into your application

```
const LinkManager = require("com_link_manager")
```

Then implement the methods required of the LinkManager to manage communications connections. The following is an example of the use of this class to set up path usage in `lmtp_mail_bridge`:

```
construct() {

	...

	this.link_manager = new LinkManager(endpoint_conf)
	
	this.link_manager.add_instance_paths("mail",this)   // tell the link manager to look for this LMTP server for path use
	this.link_manager.add_instance_paths("persistence",this)   // tell the link manager to look for this LMTP server for path use
	
	this.messenger = false      // for mail body and headers
	this.persistence = false;  // for attachments
	
	...
	
}

...

async set_messenger(path,instance,conf) {
    if ( (path !== 'mail') && (path !== 'persistence') ) {
        return
    }
    if ( path === 'mail' ) {
        this.messenger = instance
    }
    if ( path === 'pesistence' ) {
        this.persistence = instance
    }
}


```





## Current State

Putting this out today for use in setting up mail, contact, blog, streamers, etc. 

Beginning to document various basic uses. Some code changes for simplifying the readability of a config file.


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


In the following, the tool expects that a service will have launched an endpoint service for link management. The endpoint is an extension of the LinkManager class that comes with this module. The security options are off. 

On the command line, the second script parameter is "***attachments***". This mail service will set up a global persistence link. With a different command line parameter, "***mail***", the mail server can set up a connection to a "***mail***" endpoint server. 


```
{
    "link_manager" : {
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
        "reconnect_wait" 0
    },

    "connections" : {
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
                    //
                    "repo_bridge" : {
                        "_wrapper_key": "{\"key_ops\":[\"wrapKey\"],\"ext\":true,\"kty\":\"RSA\",\"n\":\"uSVb2K8R_wUQl4cYKc6gjGshYllXkBkqXeZ-Eglsen_cy6RSTT034pQc4Cchof4m9LOQ7m1fnZVyNqyR-oaDsUCfRQbm9hvFHXStyfBQ_nn07KSua6dcdMdvnPbCvBr4AfjqattokEksHPu33077TDuh_fSvOyFyKV4VpYF-G0sEDGK5FqPdIejW6ssXc6I8V9Cca8yGoMlVexRj1bjEQgESU3100VvK-1NS8FNHIDJX1MYxt3LLBWsO7ZYvpcNGHHmNFGvReRsHsqPMGt77EopoBNYyVaeMu_SWoGj20VskhLhDw8eHdTyVZ2iJRV1BbM5qv7mgcqjFEB--LjxLoAENMVtGYImZ_9VM6DKJnP7tFUh6m5DHuJlKxlNX17KlxHSlMatrU0_NVSpZ5e0nYkNpvdellbPTolBPJobCv50kM_4bUQgowmR4CVfgT_pZP5TBMdrRGVV1dg6fhg5JxKVXjwYWXxwQqPL-w62VYC30-LCwGRaTvZU2pOG_rxvobwY4VcTBD65yU6VeVX93D-KaqABx0YIhvNGWPgM_1lC3cc7GmybLCxyQYlfvyVTVTkCC22MBSLERZ0bgXoBoZRkiUpkIEmsz_h0DO695pNCTHtm4fIaDiPViT8b1A54XHF3XvxY-wTv0m7-PMTElfWd3ZK9ds3XhynQGbGsvd98\",\"e\":\"AQAB\",\"alg\":\"RSA-OAEP-256\"}",
                        "_wrapper_keys" : {
                            "persistence" : "{\"key_ops\":[\"wrapKey\"],\"ext\":true,\"kty\":\"RSA\",\"n\":\"uSVb2K8R_wUQl4cYKc6gjGshYllXkBkqXeZ-Eglsen_cy6RSTT034pQc4Cchof4m9LOQ7m1fnZVyNqyR-oaDsUCfRQbm9hvFHXStyfBQ_nn07KSua6dcdMdvnPbCvBr4AfjqattokEksHPu33077TDuh_fSvOyFyKV4VpYF-G0sEDGK5FqPdIejW6ssXc6I8V9Cca8yGoMlVexRj1bjEQgESU3100VvK-1NS8FNHIDJX1MYxt3LLBWsO7ZYvpcNGHHmNFGvReRsHsqPMGt77EopoBNYyVaeMu_SWoGj20VskhLhDw8eHdTyVZ2iJRV1BbM5qv7mgcqjFEB--LjxLoAENMVtGYImZ_9VM6DKJnP7tFUh6m5DHuJlKxlNX17KlxHSlMatrU0_NVSpZ5e0nYkNpvdellbPTolBPJobCv50kM_4bUQgowmR4CVfgT_pZP5TBMdrRGVV1dg6fhg5JxKVXjwYWXxwQqPL-w62VYC30-LCwGRaTvZU2pOG_rxvobwY4VcTBD65yU6VeVX93D-KaqABx0YIhvNGWPgM_1lC3cc7GmybLCxyQYlfvyVTVTkCC22MBSLERZ0bgXoBoZRkiUpkIEmsz_h0DO695pNCTHtm4fIaDiPViT8b1A54XHF3XvxY-wTv0m7-PMTElfWd3ZK9ds3XhynQGbGsvd98\",\"e\":\"AQAB\",\"alg\":\"RSA-OAEP-256\"}",
                            "paid-persistence" : "{\"key_ops\":[\"wrapKey\"],\"ext\":true,\"kty\":\"RSA\",\"n\":\"uSVb2K8R_wUQl4cYKc6gjGshYllXkBkqXeZ-Eglsen_cy6RSTT034pQc4Cchof4m9LOQ7m1fnZVyNqyR-oaDsUCfRQbm9hvFHXStyfBQ_nn07KSua6dcdMdvnPbCvBr4AfjqattokEksHPu33077TDuh_fSvOyFyKV4VpYF-G0sEDGK5FqPdIejW6ssXc6I8V9Cca8yGoMlVexRj1bjEQgESU3100VvK-1NS8FNHIDJX1MYxt3LLBWsO7ZYvpcNGHHmNFGvReRsHsqPMGt77EopoBNYyVaeMu_SWoGj20VskhLhDw8eHdTyVZ2iJRV1BbM5qv7mgcqjFEB--LjxLoAENMVtGYImZ_9VM6DKJnP7tFUh6m5DHuJlKxlNX17KlxHSlMatrU0_NVSpZ5e0nYkNpvdellbPTolBPJobCv50kM_4bUQgowmR4CVfgT_pZP5TBMdrRGVV1dg6fhg5JxKVXjwYWXxwQqPL-w62VYC30-LCwGRaTvZU2pOG_rxvobwY4VcTBD65yU6VeVX93D-KaqABx0YIhvNGWPgM_1lC3cc7GmybLCxyQYlfvyVTVTkCC22MBSLERZ0bgXoBoZRkiUpkIEmsz_h0DO695pNCTHtm4fIaDiPViT8b1A54XHF3XvxY-wTv0m7-PMTElfWd3ZK9ds3XhynQGbGsvd98\",\"e\":\"AQAB\",\"alg\":\"RSA-OAEP-256\"}"
                        },

                        "media_handler" : false, 
        
                        "media_handler_conf" : {
                            "media_dir": "./test-output/pub_media/$media_type/",
                            "entries_dir": "./test-output/data/$asset_type/",
                            "media_types" : {
                                "audio" : { "encrypted" : true, "store_local" : true, "store_repo" : true },
                                "video" : { "encrypted" : false, "store_local" : true, "store_repo" : true },
                                "image" : { "encrypted" : true, "store_local" : true, "store_repo" : true },
                                "text" : { "encrypted" : true, "store_local" : true, "store_repo" : false }
                            },
                            "media_encryption_selection" : {
                                "audio" : false,
                                "image" : false,
                                "text" : false
                            },
                            "default_p2p_repo" : "LAN",
                            "accepted_repos" : false,
                            "repos" : {
                                "ipfs": {
                                    "dir" : "uploader-ipfs-repo",
                                    "swarm_tcp" : 4024,
                                    "swarm_ws" : 4025,
                                    "api_port" : 5024,
                                    "tcp_gateway" : 9292
                                },
                                "LAN" : {
                                    "base_dir" : "./test/dat_LAN_local",
                                    "local_only" : true,
                                    "node_relay" : {
                                        "address" : "localhost",
                                        "port" : 1234
                                    },
                                    "local_only" : false,
                                    "ssh" : {
                                        "address" : "192.168.1.33",
                                    "user" : "biff",
                                    "pass" : "trustm"
                                    }
                                }
                            }
                    	},

							"counters" : {
								"main" : {}
							},

                       "relayer" : {
                            "files_only" : false,
                            "output_dir" : "fail_over_persistence",
                            "output_file" : "/user_data.json",
                            "max_pending_messages" : false,
                            "file_shunting" : false,
                            "max_reconnect" : 24,
                            "reconnect_wait" : 5,
                            "attempt_reconnect" : true,
                            "paths" : [
                                {
                                    "path" : "user",
                                    "port" : 5114,
                                    "address" : "localhost",
                                    "tls" : {
                                        "client_key" : "keys/cl_ec_key.pem",
                                        "client_cert" : "keys/cl_ec_crt.crt",
                                        "server_cert" : "keys/ec_crt.crt"
                                    }
                                },
                                {
                                    "path" : "persistence",
                                    "port" : 5116,
                                    "address" : "localhost",
                                    "tls" : {
                                        "client_key" : "keys/cl_ec_key.pem",
                                        "client_cert" : "keys/cl_ec_crt.crt",
                                        "server_cert" : "keys/ec_crt.crt"
                                    }
                                }
                            ]
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
                "share" : false,
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
}
```



### copious transtion apps


In the following collection of configurations, the tool expects that a services will have launched an endpoint service for link management. The endpoint is an extension of the LinkManager class that comes with this module. In the examplse, the security options are off.

Each module has a particular set of connections they set up with relationships to databases, persistence services, session management participation, and more. Other things may include particular connections to API services of downstream transaction processing.

With the LinkManager in use, the copious-transition-apps startup with a default (and very basic) database. Once they are up, the tool may be used to connect them to better services.

***copious-transitions*** extends the LinkManager class that help transition engines and database interfaces to make connections. The configuration files may contain field specific to the copious-transitions-apps.

#### 1. captcha-igid : main web server framework

```
{
    "link_manager" : {
        "address" : "192.168.1.81",
        "port"	: 5551,
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
    },

	"connections" : {
		"session_db" : {
			"action" : "add-service",
 			"target" : "module",
			"parameters" : {
				"target" : "database",
				"module" : "shared-table-types",
				"class_definition" : "ChildProcDBComInterface",
				"db_type" : "session_key_value_db",
				"create" : true,
				"share" : false,
				"conf" : {
					"in_mem_table_connect" : {
						"uds_path" : "./session_pipe-1",
						"uds_path_count" : 0    
					}
				}
			}
    	},
    	"key_value_db" : {},
    	"persistence_db" : {
			"action" : "add-service",
 			"target" : "module",
			"parameters" : {
				"target" : "database",
				"module" : "message-relay-service",
				"class_definition" : "MessageRelayer",
				"db_type" : "session_key_value_db",
				"create" : true,
				"share" : false,
				"conf" : {
			        "address" : "192.168.1.81",
			        "port"	: 5571,
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
}

```


#### 2. media-up-igid : session aware upload service (larger files)

```
{
    "link_manager" : {
        "address" : "192.168.1.81",
        "port"	: 5552,
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
    },

    "connections" : {
    	"session_db" : {},
    	"persistence_db" : {},
    	"static_db" : {},
    	"key_value_db" : {},
    	"global_persistence" : {},
    	"local_files" : {}
    }
}
```


#### 3. media-up-lite-igid : session aware upload service (small files)

```
{
    "link_manager" : {
        "address" : "192.168.1.81",
        "port"	: 5553,
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
    },

    "connections" : {
    	"session_db" : {},
    	"persistence_db" : {},
    	"static_db" : {},
    	"key_value_db" : {},
    	"local_files" : {},
    	"web_sockets" : {}
    }
}
```


#### 4. publication-igid : session aware media publication management

```
{
    "link_manager" : {
        "address" : "192.168.1.81",
        "port"	: 5554,
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
    },

    "connections" : {
    	"session_db" : {},
    	"key_value_db" : {},
    	"local_files" : {},
    	"web_sockets" : {}
    }
}
```



#### 5. song-search : crypto interface

TBD

#### 6. counter-access-igid : follows

> ***access to contract managment and media usage tracking***



### Endpoint Services

Endpoint services get introduced to counting services and searchers by offering subscription to their publication topics. 

Link management for the counters and searchers controlls their subscription behavior relative to the endpoints.

### Counting Services

Counting services get introductions to streamers.




