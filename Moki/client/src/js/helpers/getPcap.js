/*
get html tag with attribute "file" 
download pcap file 
*/
import { downloadPcap } from './download/downloadPcap';

export async function getPcap(event) {
    var fileName = event.currentTarget.getAttribute('file');
    await downloadPcap(event.currentTarget.getAttribute('file')).then(function (data) {
        if (typeof data === 'string') {
            alert(data);
        }
        else {
            var blob = new Blob([data], { type: "pcap" });
            const element = document.createElement("a");
            element.download = fileName;
            element.href = URL.createObjectURL(blob);
            document.body.appendChild(element);
            element.click();
        }
    })
}


