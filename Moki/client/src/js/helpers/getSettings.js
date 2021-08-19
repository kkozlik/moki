//get monitor settings from defaults.json or stored user values

export async function getSettings() {
    var url = "/api/setting";
    try {
        const response = await fetch(url, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": "include"
            }
        });
        return await response.json();
    } catch (error) {
        console.error(error);
        return error;
    }
}