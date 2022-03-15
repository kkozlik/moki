import Table from '../Table.js'
import TableChart from '../../charts/table_chart.js';

class RestrictedTable extends Table {

    // Initialize the state
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            dashboardName: "restricted/calls",
            calls: [],
            total: 0
        }

    }



    render() {
        return (
            <div className="row no-gutters" >
                <TableChart
                    data={this.state.calls}
                    total={this.state.total}
                    name={"homeLoginCalls"}
                    id={"CALL EVENTS"}
                    tags={this.props.tags}
                />  </div>
        );
    }
}

export default RestrictedTable;
