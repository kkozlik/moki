import store from "../store/index";
import Filter from '../bars/Filter';


export const renderFilters = (deleteFilter, disableFilter, enableFilter, pinFilter, editFilter, negationFilter, unpinFilter) => {
        var filters = store.getState().filters;
        return <div>
                {filters.map((filter) => {
                        return <Filter key={filter.id} state={filter.state}
                                title={filter.title} encrypt={filter.encrypt}  id={"filter" + filter.id} deleteFilter={deleteFilter} disableFilter={disableFilter} enableFilter={enableFilter} pinFilter={pinFilter} negationFilter={negationFilter} unpinFilter={unpinFilter}
                                editFilter={editFilter} />
                })}
        </div>
}