//get monitor layout form monitor-layout.json

export async function getLayoutSettings() {
    var url = process.env.PUBLIC_URL+"/api/layout";
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