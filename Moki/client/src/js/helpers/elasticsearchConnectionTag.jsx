export async function elasticsearchConnectionTag(url, id, index, tag){
            var data; 
            var response;
            try{
               response = await fetch(url, {
                        method: "POST",
                        timeout: 1000,
                        credentials: 'include',
                        body: JSON.stringify({
                            id: id,
                            index: index,
                            tags: tag                   
                      }),
                       headers: {"Content-Type": "application/json",
                        "Access-Control-Allow-Credentials": "include"}
                    });
                }
                catch (error) {
                    console.error(error);
                    return "ERROR: "+error;
                }

                if (!response.ok) {
                   // response
                    console.error(response);
                    return "ERROR: Problem with saving.";
                  }
    
                data = response.json();
                console.info(new Date() + "MOKI: got elastic data");  
                return data;
}

