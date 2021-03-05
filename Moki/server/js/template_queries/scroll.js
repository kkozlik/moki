/*
Scroll query if data to retrieve are more than 10000
used for table charts
*/
var scroll = async function (client, scroll_id) {
    var response = await client.scroll({
        scroll: '2m',
        scroll_id: scroll_id
    });
    return response;
}


module.exports = {
    scroll: scroll
};
