function parse(response) {
    if (response.hits && response.hits.total && response.hits.total.value) {
        return response.hits.total.value;
    } else {
        return 0;
    }

}

module.exports = {
    parse: parse
};
