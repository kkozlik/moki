import Table from '../Table.js';
import TableChart from '../../charts/table_chart.js';

class SecurityTable extends Table {

    // Initialize the state
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            dashboardName: "security/table",
            calls: [],
            total: 0
        }
    }

    render() {
        return (
            <div className="row no-gutters" >
                <TableChart data={
                        this.state.security
                    } total={this.state.total}
                    name={
                        "security"
                    }
                    id={
                        "SECURITY EVENTS"
                    }
                    tags={this.props.tags}
                />  </div>
        );
    }
}

export default SecurityTable;
