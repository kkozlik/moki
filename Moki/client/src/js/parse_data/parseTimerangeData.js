/*
Returns hits

*/
function parse(response) {
    if (response && response.hits && response.hits.hits) {
        return response.hits.hits;
    }
    return "";
}

module.exports = {
    parse: parse
};
