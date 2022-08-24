
const BASE_NAME = process.env.PUBLIC_URL;

export default async function status() {
    const response = await fetch(BASE_NAME + "/api/status", {
        method: "GET",
        timeout: 10000,
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": "include"
        }
    });

    const json = await response.json();
    if (!response.ok) {
        return {
            logstash: false,
            elasticsearch: false
        }
    }
    else {
        let logstash = true;
        let elasticsearch = true;

        json.logstash = json.logstash.replace(/\r?\n|\r/g, "");
        json.elasticsearch = json.elasticsearch.replace(/\r?\n|\r/g, "");


        if (json.logstash !== "active") {
            logstash = false;
        }

        if (json.elasticsearch !== "active") {
            elasticsearch = false;
        }
        return {
            logstash: logstash,
            elasticsearch: elasticsearch
        }
    }
}