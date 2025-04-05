# `com_link_manager`

 A class that helps orchestrate an application's communication links.


## Install

### comand line
```
npm install -g com_link_manager
```


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


In the following, the tool expects that a service will have launched an endpoint service for link management. The endpoint is an extension of the LinkManager class that comes with this module. The security options are off. On the command line, the second script parameter is "attachments". This mail service will set up a global persistence link.


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
 							}

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