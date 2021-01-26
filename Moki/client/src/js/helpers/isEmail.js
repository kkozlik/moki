 export default function isEmail(value){
     var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(.*?)$/;
    return re.test(String(value).toLowerCase());
}