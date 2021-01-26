    var getDashboardTypes = function(name) {
        switch(name){
          case 'calls': 
                return ["call-end", "call-start", "call-attempt"];
                break;
        case 'overview': 
                return ["call-end", "call-start", "call-attempt", "reg-new", "reg-del", "reg-expired", "notice", "auth-failed", "log-reply", "action-log", "message-log", "fbl-new", "error", "alert", "fgl-new", "prompt", "limit", "Recording", "message-dropped"];
                break;
        case 'registration': 
                return [ "reg-del", "reg-new", "reg-expired"];
                break;
        case 'diagnostics': 
                return ["alert", "error", "message-log", "action-log", "prompt", "recording", "notice"];
                break;
    }
}
    
module.exports = {
    getDashboardTypes: getDashboardTypes
};
  
