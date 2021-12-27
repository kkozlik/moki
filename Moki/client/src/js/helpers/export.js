/*
Input: JSON to export  
*/
import storePersistent from "../store/indexPersistent";

export async function exportJSON(result) {
    const element = document.createElement("a");
    var file = "";
    if( storePersistent.getState().profile && storePersistent.getState().profile[0] && storePersistent.getState().profile[0].userprefs.mode === "encrypt"){
        element.download = "data_decryted.json"
    }else {
        element.download = "data.json";
    }
    file = new Blob([JSON.stringify(result)], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
}