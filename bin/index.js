#!/usr/bin/env node
// 
const fs = require('fs')

const {MessageRelayer} = require('message-relay-services')


let address_override = false
let port_override = false


let configuration_file = false
let connection_type = false

let n = process.argv.length
for ( let i = 2; i < n; i++ ) {
    if ( process.argv[i].substring(0,1) === '-' ) {
        if ( process.argv[i] == "-a" ) {
            address_override = process.argv[i+1]
            if ( address_override === undefined ) {
                console.log("port flag given but no port...")
                process.exit(0)
            }
        } else if ( process.argv[i] == "-p" ) {
            port_override = process.argv[i+1]
            if ( port_override === undefined ) {
                console.log("port flag given but no port...")
                process.exit(0)
            }
        }
        i++
    } else {
        if ( configuration_file === false ) {
            configuration_file = process.argv[i]
        } else {
            connection_type = process.argv[i]
        }
    }
}



if ( configuration_file === undefined ) {
    console.log("the db tool needs a configuration file for sending connection commands to the transition app")
    process.exit(0)
}

if ( connection_type === undefined ) {
    console.log("the db tool needs a connection type for sending connection commands to the transition app")
    process.exit(0)
}

//
let conf_str = fs.readFileSync(configuration_file).toString()
let conf = JSON.parse(conf_str)


// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
// ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

if ( address_override !== false ) {
    conf.link_manager.address = address_override
}
if ( port_override !== false ) {
    conf.link_manager.port = port_override
}


let message_relayer = new MessageRelayer(conf.link_manager)
message_relayer.on('client-ready',async () => {
    //
    //
    let descriptor = conf.connections[connection_type]
    let msg_obj = {}

    // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

    if ( descriptor.action === 'add-service' ) {
        msg_obj._tx_op = "AS"
        msg_obj._id = "add-connections"
    } else if ( descriptor.action === 'update-service' ) {
        msg_obj._tx_op = "US"
        msg_obj._id = "update-connections"
    } else if ( descriptor.action === 'remove-service' ) { // -- remove service
        msg_obj._tx_op = "RS"
        msg_obj._id = "remove-connections"
    } else if ( descriptor.action === 'run-command' ){
        msg_obj._tx_op = "RN"
        msg_obj._id = "execmd"
    }

    // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

    let cmd_pars = descriptor.parameters
    msg_obj.parameters = Object.assign({},cmd_pars);
    cmd_pars = msg_obj.parameters

    if ( (msg_obj._tx_op !== "RN") && (typeof cmd_pars.conf !== 'object') ) {
        console.log("no configuration object specified for " + connection_type)
        process.exit(0)
    }

    if ( descriptor.action = "db-management" ) {
        if ( descriptor.target === "database" ) {
            //
            let possible_db_types = {
                "key_value_db" : false,
                "session_key_value_db" : false,
                "static_db" : true,
                "persistence_db" : true
            }
            let possible_ops = {
                "store" : true,
                "exists" : true,
                "query" : true,
                "drop" : true,
                "remove" : true
            }
            //
            if ( !(cmd_pars.db_type in possible_db_types) ) {
                console.log(`the database type ${cmd_pars.db_type} is not handled by copious transitions`)
                process.exit(0)
            }

            if ( possible_db_types[cmd_pars.db_type] ) {
                //
                if ( !(typeof cmd_pars.collection === 'string' ) ) {
                    console.log(`the database operations require a 'collection' parameter`)
                    process.exit(0)
                }
                //
                if ( !(cmd_pars.op in possible_ops) ) {
                    console.log(`The operation ${md_pars.op} is not a recognized database management operation`)
                    process.exit(0)
                }
                //
                if ( !(typeof cmd_pars.data === 'object') || !(typeof cmd_pars.query === 'object' || typeof cmd_pars.query === 'string') ) {
                    console.log(`The operation ${md_pars.op} requires some type of query 'data' or 'query`)
                    process.exit(0)
                }
                //
            }
        }
    } else if ( descriptor.action = 'add-service' ) {
        // ----
        if ( descriptor.target === "module" ) {
                //
        } else if ( descriptor.target === 'transtion_engine' ) {
            //
            if ( typeof cmd_pars.module !== 'string' ) {
                console.log("no configuration object specified for " + connection_type)
                process.exit(0)
            }
            //
            const possible_transition_engine_fields = {
                "instance" : "string",
                "create" : "boolean"
            }
            //
            const module_may_have_methods = {
                "initialize" : "unary",
                "set_file_promise_ops" : "unary"
            }
            // // // // 
            //
        } else if ( descriptor.target === "database" ) {
            let possible_db_types = {
                "key_value_db" : true,
                "session_key_value_db" : true,
                "static_db" : true,
                "persistence_db" : true
            }
            if ( !(cmd_pars.db_type in possible_db_types) ) {
                console.log(`the database type ${cmd_pars.db_type} is not handled by copious transitions`)
                process.exit(0)
            }

            if ( !(cmd_pars.change) && !(cmd_pars.connect) ) {
                console.log(`the database changes require either change or connect fields to be true (not both)`)
                process.exit(0)
            }

            if ( typeof cmd_pars.module !== 'string' ) {
                console.log("no configuration object specified for database type " + cmd_pars.db_typ)
                process.exit(0)
            }

            const possible_database_fields = {
                "instance" : "string",
                "create" : "boolean"
            }
            //
        } else if ( descriptor.target === "websocket" ) {
            let possible_op_types = {
                "add_web_socket_server" : true,
                "new_http" : true,
                "new_websocket_class" : true
            }
            if ( !(cmd_pars.op in possible_op_types) ) {
                console.log(`the database type ${cmd_pars.db_type} is not handled by copious transitions`)
                process.exit(0)
            }

            switch ( cmd_pars.op ) {
                case "add_web_socket_server" : {
                    if ( typeof cmd_pars.port === "string" ) {
                        let port = parseInt(cmd_pars.port)
                        if ( `${port}` !== cmd_pars.port ) {
                            console.log(`the add_web_socket_server port number must be an integer`)
                            process.exit(0)            
                        }
                    }
                    break;
                }
                case "new_http" :
                case "new_websocket_class" : {
                    //
                    if ( typeof cmd_pars.module !== 'string' ) {
                        console.log("no configuration object specified for database type " + cmd_pars.db_typ)
                        process.exit(0)
                    }
                    //
                    const possible_database_fields = {
                        "instance" : "string",
                        "create" : "boolean"
                    }
                    break;
                }
            }
        }

    } else { // -- remove servivce
        //
        if ( descriptor.target === "database" ) {
            let possible_db_types = {
                "key_value_db" : true,
                "session_key_value_db" : true,
                "static_db" : true,
                "persistence_db" : true
            }
            if ( !(cmd_pars.db_type in possible_db_types) ) {
                console.log(`the database type ${cmd_pars.db_type} is not handled by copious transitions`)
                process.exit(0)
            }
        }
        //
    }

    // may have field instance
    msg_obj._x_admin_capable = true
    //
    let result = await message_relayer.send_on_path(msg_obj,"connections")
    console.dir(result)
    //
    message_relayer.closeAll()
    //
})
