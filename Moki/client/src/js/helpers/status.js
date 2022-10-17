
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
    let result = "ok";

    if(json.error) {
        result = { errno: 2, text: "Elasticsearch is not running", level: "error" };
    }
    //no event in last 30 seconds
    else if (json.hits && json.hits.hits && json.hits.hits.length === 0) {
        result = { errno: 1, text: "Logstash is not running", level: "error" };
    }
    return {
        status: result
    }
}