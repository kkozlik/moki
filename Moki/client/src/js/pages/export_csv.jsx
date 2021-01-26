import React, {
    Component
} from 'react';

import AlarmType from './alarm_type';

class ExportCSV extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            checkboxIPall: true,
            checkboxURIall: true,
            checkboxALERTall: true
        }
    }

  
    render() {
       
        return (
            <div></div>
        )
    }

}

export default ExportCSV;
