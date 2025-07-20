//
const {ServeMessageEndpoint} = require("message-relay-services")
//



// https://github.com/facundofarias/awesome-websockets
/*

Separate

1. general life cycle manager
2. com link manager
3. mixin (more modern and accessible) with typescript support possibly


let sayHiMixin = {
  sayHi() {
    console.log(`Hello ${this.name}`);
  },
  sayBye() {
    console.log(`Bye ${this.name}`);
  }
};

class User {
  constructor(name) {
    this.name = name;
  }
}

// Mixing in methods to User prototype
Object.assign(User.prototype, sayHiMixin);

let user = new User('Alice');
user.sayHi();  // Output: Hello Alice

// 
let eventMixin = {
  on(eventName, handler) {
    if (!this._eventHandlers) this._eventHandlers = {};
    if (!this._eventHandlers[eventName]) {
      this._eventHandlers[eventName] = [];
    }
    this._eventHandlers[eventName].push(handler);
  },
  off(eventName, handler) {
    let handlers = this._eventHandlers?.[eventName];
    if (!handlers) return;
    handlers = handlers.filter(h => h !== handler);
  },
  trigger(eventName, ...args) {
    if (!this._eventHandlers?.[eventName]) return;
    this._eventHandlers[eventName].forEach(handler => handler.apply(this, args));
  }
};

class Menu {
  choose(value) {
    this.trigger("select", value);
  }
}

Object.assign(Menu.prototype, eventMixin);
let menu = new Menu();
menu.on("select", value => console.log(`Value selected: ${value}`));
menu.choose("Option1");  // Output: Value selected: Option1
*/

class ModuleState {
    constructor(mod_locator) {
        this.id = mod_locator
        this.loaded = false
        this.base = false
        this.class_definitions = {}
        this.instances = {}
        this.instantiated = false
        this.initialized = false
    }
}

/** 
 * This class provides a interface to transition processing for requests (JSON)
 * being delivered by backend services implemented as applications of the 
 * message-relay-services module.
 * 
 * @memberof base
 */

class LinkManager extends ServeMessageEndpoint {

    constructor(conf) {
        //
        super(conf)
        //
        this._configured = {}
        this._instance_targets = {}
        this.link_path_seeker_map = {}
    }

    add_instance_paths(key,inst_obj) {
        let self = this
        self[key] = inst_obj
        this.add_paths_for(inst_obj) 
    }


    add_instance_target(target_key,target) {
        this._instance_targets[target_key] = target
    }

    /**
     * instantiate_com
     * 
     * 1) module states are kept in the table of configured items, `_configured`
     * 
     * @param {object} com_conf - configuration directives
     * @param {object} instance_conf - configuration of the instance
     * @returns object | boolean
     */
    async instantiate_com(com_conf,instance_conf) {
        //
        let conf = instance_conf ? instance_conf : {}
        let new_con = false

        let module_state = null
        if ( com_conf.module ) {        // table of configured items
            let m_state = this._configured[com_conf.module]
            if ( m_state === undefined ) {
                m_state = new ModuleState(com_conf.module)
                this._configured[com_conf.module] = m_state
            }
            module_state = m_state
        }

        if ( module_state ) {
            let con_class = false
            if ( !(module_state.loaded) ) { // load modules just once (some room for hot loading revsisions may be introduced here)
                try {
                    con_class = require(com_conf.module)    // load it
                    module_state.base = con_class
                    if ( typeof com_conf.class_definition === 'string' ) {
                        con_class = con_class[com_conf.class_definition]
                        if ( con_class ) {      // a particular class from the module
                            module_state.class_definitions[com_conf.class_definition] = con_class
                        }
                    }
                    module_state.loaded = true
                } catch (e) {
                    console.log(e)
                    return false
                }
            } else {    // retrieve from the table
                if ( typeof com_conf.class_definition === 'string' ) {
                    con_class = module_state.class_definitions[com_conf.class_definition]
                    if ( con_class === undefined && module_state.base ) {
                        con_class = module_state.base[com_conf.class_definition]
                    } 
                } else {
                    con_class = module_state.base
                }
            }
            //  get a new connection class object (new_con)
            if ( con_class ) {
                try {
                    if ( com_conf.create === true ) {   // make the instance 
                        new_con = new con_class(conf)
                        if ( com_conf.share ) {
                            module_state.instances[con_class.classname] = new_con
                            module_state.instantiated = true
                        }
                    } else if ( typeof com_conf.share === 'string' ) {  // otherwise, attempts at using existing instances
                        if ( typeof com_conf.share === "direct_instance" ) {
                            new_con = con_class
                            module_state.instances[com_conf.module] = con_class
                            module_state.instantiated = true
                        } else {
                            if ( module_state.instantiated ) {
                                new_con = module_state.instances[con_class.classname]
                                if ( !new_con ) {
                                    throw new Error(`Attempting to share of an uninstantiated instance ${con_class.classname}`)
                                }
                            }    
                        }
                    }
                } catch (e) {
                    console.log(e)
                    return false
                }
            }
        }

        // at this point, there is a new con class or this method is done

        // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
        //
        if ( new_con !== false ) {
            try {
                if ( (typeof new_con.initialize === 'function') ) {
                    if ( (conf.share_link_manager === true)  && (typeof new_con.set_link_manager === 'function') ) {
                        new_con.set_link_manager(conf,this)
                    }
                    await new_con.initialize(conf)  // all initialization methods should handle empty configs
                    module_state.initialized = true
                }
            } catch (e) {
                console.log(e)
            }
        }

        return new_con
    }




    retrieve_com(com_conf) {
        //
        let module_state = null
        if ( com_conf.module ) {
            module_state = this._configured[com_conf.module]
            if ( !module_state ) return false
        }
        let existing_con =  module_state.instances[com_conf.class_definition]
        if ( existing_con ) {
            return existing_con
        }else {
            return false
        }
    }


    /**
     * add_paths_for
     * 
     * 
     * Allows for a com class user to limit the paths that outside tools can request.
     * The tools are supposed to be used in secure admin contexts. 
     * Yet, there can be error and overreach.
     * 
     * This method is provided for the cases in which the target cannot be identified. 
     * Yet, some class can still be querried for adding in communication components.
     * 
     * @param {object} instance 
     */
    add_paths_for(instance) {
        if ( instance ) {
            if ( typeof instance.seeking_endpoint_paths === "function" ) {
                let paths = instance.seeking_endpoint_paths()
                if ( paths && Array.isArray(paths) ) {
                    for ( let path of paths ) {
                        let seeker_list = this.link_path_seeker_map[path]
                        if ( seeker_list === undefined ) {
                            seeker_list = []
                            this.link_path_seeker_map[path] = seeker_list
                        }
                        seeker_list.push(instance)
                    }
                }
            }
        }
    }

    // ---- ---- ---- ---- ---- ---- ----

    /**
     * add_service_connections
     * 
     * @param {Object} cmd_pars -- connection command processing directive
     */

    async add_service_connections(cmd_pars) {
        //
        let conf = cmd_pars.conf
        let instance = !(cmd_pars.instance_known) ?  await this.instantiate_com(cmd_pars,conf) : false
        //
        if ( instance || (cmd_pars.instance_known && cmd_pars.path) ) {
            if ( instance && cmd_pars.target && !(cmd_pars.instance_known && cmd_pars.path) ) {
                let instance_target = this._instance_targets[cmd_pars.target]
                if ( instance_target ) {
                    if ( typeof instance_target.install_service_connection === 'function' ) {
                        try {
                            await instance_target.install_service_connection(instance,conf)
                            return true
                        } catch (e) {
                        }
                    }
                } else {
                    return instance
                }
            } else if ( cmd_pars.path ) {
                try {
                    let path = cmd_pars.path
                    if ( path && path.length ) {
                        let seeker_list = this.link_path_seeker_map[path]
                        if ( seeker_list && seeker_list.length ) {
                            let promises = []
                            for ( let seeker of seeker_list ) {
                                promises.push(seeker.set_messenger(path,instance,conf))
                            }
                            await Promise.all(promises)
                        }    
                    }
                } catch (e) {}               
            }
        }
        return false
    }


    async update_service_connections(cmd_pars) {
        //
        let conf = cmd_pars.conf
        let instance = !(cmd_pars.instance_known) ? this.retrieve_com(cmd_pars) : false
        //
        if ( instance || (cmd_pars.instance_known && cmd_pars.path) ) {
            if ( instance && cmd_pars.target && !(cmd_pars.instance_known && cmd_pars.path) ) {
                let instance_target = this._instance_targets[cmd_pars.target]
                if ( instance_target ) {
                    if ( typeof instance_target.update_service_connection === 'function' ) {
                        try {
                            await instance_target.update_service_connection(instance,conf)
                        } catch (e) {
                        }
                    }
                } else {
                    return instance
                }
            } else if ( cmd_pars.path ) {
                try {
                    let path = cmd_pars.path
                    if ( path && path.length ) {
                        let seeker_list = this.link_path_seeker_map[path]
                        if ( seeker_list && seeker_list.length ) {
                            let promises = []
                            let defered = []
                            for ( let seeker of seeker_list ) {
                                if ( typeof seeker.update_messenger === 'function' ) {
                                    promises.push(seeker.update_messenger(path,instance,conf))
                                } else {
                                    defered.push(seeker)
                                }
                            }
                            await Promise.all(promises)
                            if ( defered.length ) {
                                return defered
                            }
                        }    
                    }
                } catch (e) {}               
            }
        }
        return false
    }


    async remove_service_connections(cmd_pars) {
        let instance = this.retrieve_com(cmd_pars)
        if ( instance ) {
            let conf = cmd_pars.conf
            if ( cmd_pars.target ) {
                let instance_target = this._instance_targets[cmd_pars.target]
                if ( instance_target ) {
                    if ( typeof instance_target.remove_service_connection === 'function' ) {
                        try {
                            await instance_target.remove_service_connection(instance,conf)
                        } catch (e) {
                        }
                    }
                }
            } else if ( cmd_pars.path ) {
                try {
                    let path = cmd_pars.path
                    if ( path && path.length ) {
                        let seeker_list = this.link_path_seeker_map[path]
                        if ( seeker_list && seeker_list.length ) {
                            let promises = []
                            for ( let seeker of seeker_list ) {
                                promises.push(seeker.close_messenger(path,instance,conf))
                            }
                            await Promise.all(promises)
                        }
                    }
                } catch (e) {}
            }
        }
    }


    async exec_cmd(cmd_pars) {

        let instance_target = this._instance_targets[cmd_pars.target]
        if ( typeof instance_target === "object" ) {
            if ( typeof instance_target.external_op_request === 'function' ) {
                try {
                    await instance_target.external_op_request(cmd_pars)
                } catch (e) {
                }
            }    
        }

    }


    make_tracking(msg_obj) {
        let cmd_pars = msg_obj.parameters
        let tracking = cmd_pars.target
        tracking += '+'
        tracking += cmd_pars.module
        if ( cmd_pars.class_definition ) {
            tracking += '+'
            tracking += cmd_pars.class_definition    
        }
        if ( cmd_pars.share ) {
            tracking += '+'
            tracking += 'shared'
        }
    }



    //
    /**
     * This method is the override of the `app_message_handler` defined in the super class ServeMessageEndpoint.
     * 
     * This message handler implements the responses to `_tx_op`s 'G' (get) and 'S' (set).
     * A 'G' message that is properly setup will result in a call to the mime handler that had to be set by the application.
     * A 'S' message that is properly setup will result in a call to the transtion handler that had to be set by the application.
     * 
     * In most cases, it can be expected that the methods found in contractuals will be the handlers that are set to the 
     * parameters of this class. 
     * 
     * @param {object} msg_obj 
     * @returns {object}
     */
    async app_message_handler(msg_obj) {
        //
        let op = msg_obj._tx_op
        let result = "OK"

        msg_obj._tracking = this.make_tracking(msg_obj)

        //
        switch ( op ) {

            case 'AS' : {   // admin method .... add a service
                let cmd_pars = msg_obj.parameters
                if ( cmd_pars ) {
                    await this.add_service_connections(cmd_pars)
                }    
                break;
            }

            case 'US' : {   // admin method .... add a service
                let cmd_pars = msg_obj.parameters
                if ( cmd_pars ) {
                    await this.update_service_connections(cmd_pars)
                }    
                break;
            }

            case 'RS' : {   // admin method .... remove a service
                let cmd_pars = msg_obj.parameters
                if ( cmd_pars ) {
                    await this.remove_service_connections(cmd_pars)
                }
                break;
            }

            case "RN" :  {   // admin method .... remove a service
                let cmd_pars = msg_obj.parameters
                if ( cmd_pars ) {
                    await this.exec_cmd(cmd_pars)
                }
                break;
            }

            default : {
                break
            }
        }
        //
        return({ "status" : result, "explain" : "op performed", "when" : Date.now(), "_tracking" : msg_obj._tracking })
    }

}


module.exports = LinkManager

