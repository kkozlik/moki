/*
Input: JSON to export  
*/

export async function exportJSON(result) {
    const element = document.createElement("a");
    var file = "";
    element.download = "data.json";
    file = new Blob([JSON.stringify(result)], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
}