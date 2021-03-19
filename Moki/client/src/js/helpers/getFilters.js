import store from "../store/index";

export const getFilters = () => {
        var filters = store.getState().filters;
        var filtersResult = [];
        for (var i = 0; i < filters.length; i++) {
                if (filters[i].state !== 'disable') {
                        filtersResult.push(filters[i]);
                }
        }

        return filtersResult;
}