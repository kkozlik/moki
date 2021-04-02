import React, {
    Component
} from 'react';

import Type from './Type';
import Types from '../helpers/Types';
import checkAll from "../../styles/icons/checkAll.png";
import uncheckAll from "../../styles/icons/uncheckAll.png";
import store from "../store/index";
import { assignType } from "../actions/index";
import { getLayoutSettings } from '../helpers/getLayout';

class Typebar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            icon: uncheckAll,
            types: [],
            isFetching: true
        }
        this.enableType = this.enableType.bind(this);
        this.disableType = this.disableType.bind(this);
        this.checkAll = this.checkAll.bind(this);
        store.subscribe(() => this.rerenderTypes());
    }

    async componentDidMount() {
        var types = [];
        //change types if set in url
        //format: type=XXXXXXX&type=YYYYYYYY
        var parameters = window.location.search;
        var filters = parameters.indexOf("type=");
        var result = [];
        if (parameters && filters !== -1) {
            while (filters !== -1) {
                var last = parameters.indexOf("&", filters + 5);
                var type = parameters.substring(filters + 5, last);

                if (last === -1) {
                    type = parameters.substring(filters + 5);
                }

                result.push(type);
                filters = parameters.indexOf("type=", (filters + 1));
            }
        }
        var jsonData = await getLayoutSettings();
        var pathname = window.location.pathname.substring(1);

        if (jsonData.types[pathname]) {
            for (var i = 0; i < jsonData.types[pathname].length; i++) {
                var dashboardTypes = jsonData.types[pathname];

                //is in url
                if (result.length > 0 && result.includes(dashboardTypes[i])) {
                    types.push({
                        id: dashboardTypes[i],
                        name: Types[dashboardTypes[i]],
                        state: "enable"
                    });
                }
                //not in url but url parameters exists
                else if (result.length > 0 && !result.includes(dashboardTypes[i])) {
                    types.push({
                        id: dashboardTypes[i],
                        name: Types[dashboardTypes[i]],
                        state: "disable"
                    });
                }
                //no url parametrs
                else {
                    types.push({
                        id: dashboardTypes[i],
                        name: Types[dashboardTypes[i]],
                        state: "enable"
                    });
                }
            }
        }

        //set new types in state, don't dispatch it
        this.setState({types: types});
        //store.dispatch(assignType(types));
    }

    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state, callback) => {
            return;
        };
    }


    //when you load stored filters and types, you need to rerender GUI
    rerenderTypes() {
        if (store.getState().types !== this.state.types) {
            console.info("Types is changed to " + JSON.stringify(store.getState().types));
            this.setState({ types: store.getState().types });
        }
    }

    //check/uncheck all types
    checkAll() {
        if (this.state.icon === checkAll) {
            this.setState({ icon: uncheckAll });
            var oldTypes = this.state.types;
            for (var i = 0; i < oldTypes.length; i++) {
                oldTypes[i].state = 'enable';
            }

            this.setState({ types: oldTypes });
        }
        else {
            this.setState({ icon: checkAll });
            oldTypes = this.state.types;
            for (i = 0; i < oldTypes.length; i++) {
                oldTypes[i].state = 'disable';
            }
            this.setState({ types: oldTypes });
        }
        store.dispatch(assignType(oldTypes));
    }

    enableType(type) {
        var oldTypes = this.state.types;
        for (var i = 0; i < oldTypes.length; i++) {
            if (oldTypes[i].id === type) {
                oldTypes[i].state = 'enable';
            }
        }


        console.info("Type is enabled:" + JSON.stringify(oldTypes));
        store.dispatch(assignType(oldTypes));
    }

    disableType(type) {
        var oldTypes = this.state.types;
        for (var i = 0; i < oldTypes.length; i++) {
            if (oldTypes[i].id === type) {
                oldTypes[i].state = 'disable';
            }
        }
        console.info("Type is disabled:" + JSON.stringify(oldTypes));
        store.dispatch(assignType(oldTypes));
    }


    render() {
        if (this.state.types.length !== 0) {
            var types = (
                <div style={{ "display": "contents" }}>
                    { this.state.types.map((type, index) => {
                        return <Type key={type.id}
                            name={type.name} id={type.id} state={type.state} disableType={this.disableType} enableType={this.enableType} />
                    })}
                </div>
            )
            return (
                <div className="typeBar">
                    <div className="row align-items-center ">
                        <img alt="checkAllIcon" onClick={this.checkAll} className="tabletd checkAll" src={this.state.icon} />
                        {types}
                    </div>

                </div>

            );
        } else {
            return null;
        }

    }
}

export default Typebar;
