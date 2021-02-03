import {cipher} from "anonym-js/src/ipcipher";
//const cipher = new Ipcipher();
//const sessionStorage = window.sessionStorage;

async function getKey(password){
    var keyBytes = await cipher.GenerateKey(password);
    return keyBytes
}


export const storeKey=(password)=>{
    var key = getKey(password);
    //sessionStorage.setItem('password', key);
    
    //TODO need to call chart rerender
}

export const decrypt=(ip)=>{
    //sessionStorage.getItem('password');
    return cipher.Decrypt(ip);
}
