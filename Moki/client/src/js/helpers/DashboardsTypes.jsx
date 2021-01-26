export const DashboardsTypes = {
    'calls': ["call-end", "call-start", "call-attempt"],
    'overview': ["call-end", "call-start", "call-attempt", "reg-new", "reg-del", "reg-expired", "notice", "auth-failed", "log-reply", "action-log", "message-log", "fbl-new", "error", "alert", "fgl-new", "prompt", "limit", "recording", "message-dropped", "conf-join", "conf-leave"],
     'microanalysis': ["call-end", "call-start", "call-attempt", "reg-new", "reg-del", "reg-expired", "notice", "auth-failed", "log-reply", "action-log", "message-log", "fbl-new", "error", "alert", "fgl-new", "prompt", "limit", "recording", "message-dropped"],
    'registration': [ "reg-del", "reg-new", "reg-expired"],
    'diagnostics':  ["alert", "error", "message-log", "action-log", "prompt", "recording", "notice"],
    'security': ["limit", "message-dropped", "auth-failed", "log-reply", "fbl-new", "fgl-new"],
    'transport': ["error", "alert", "notice"],
    'exceeded': ["low_MoS", "high_rx", "high_tx", "call_start", "honeynet",  "short_calls_ip", "short_calls_uri","limit_ip",  "drop_ip", "authfail_ip", "authfail_uri", "ip_limit_behind_uri", "uri_limit_behind_ip", "changing_location", "too_many_minutes", "poor_ratio_ca", "CA_unreachable" , "poor_parallel_reg", "security_metrics"],
     'index': ["call-end", "call-start", "call-attempt", "message-dropped", "auth-failed", "limit", "reg-del", "reg-new", "reg-expired"],
    'conference': ["conf-join", "conf-leave"]
    
}
    
export default DashboardsTypes;