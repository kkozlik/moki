import React, {
    Component
} from 'react';

import Type from './Type';
import { Types, getExceededTypes } from '@moki-client/gui';
import checkAll from "../../styles/icons/checkAll.png";
import uncheckAll from "../../styles/icons/uncheckAll.png";
import store from "../store/index";
import { assignType } from "../actions/index";
import { getLayoutSettings } from '../helpers/getLayout';
const STORED_TYPES_VERSION = "1.0";

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
        this.loadTypes = this.loadTypes.bind(this);
        store.subscribe(() => this.rerenderTypes());
        window.types = this;
    }

    async loadTypes() {
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
        let name = window.location.pathname.substring(1);
        console.log("loading types +++++");
        console.log(name);

        //check if stored types, remove old version
        let storedTypes = JSON.parse(window.localStorage.getItem("types"));
        if (window.localStorage.getItem("types") && (!storedTypes.version || storedTypes.version !== STORED_TYPES_VERSION)) {
            window.localStorage.removeItem("types");
        }

        if (storedTypes && storedTypes[name]) {

            //get types from template to keep it update it
            var allTypes = [];
            if (name === "exceeded") {
                allTypes = await getExceededTypes();
            }
            else if (jsonData.types[name]) {
                allTypes = jsonData.types[name]
            }

            for (let allTypes of allTypes) {
                var typeExists = false;
                var thisType = null;
                var id = allTypes.id ? allTypes.id : allTypes;
                for (let type of storedTypes[name]) {
                    if (id === type.id) {
                        typeExists = true;
                        thisType = type;
                    }
                }

                if (typeExists) {
                    types.push({
                        id: thisType.id,
                        name: Types[thisType.id] ? Types[thisType.id] : thisType.name,
                        state: thisType.state
                    });
                }
                else {
                    types.push({
                        id: allTypes.id ? allTypes.id : allTypes,
                        name: Types[allTypes] ? Types[allTypes] : allTypes.name ? allTypes.name : allTypes.id,
                        state: "enable"
                    });
                }
            }
        }
        else if (name === "exceeded") {
            types = await getExceededTypes();
        }
        else if (jsonData.types[name]) {
            for (var i = 0; i < jsonData.types[name].length; i++) {
                var dashboardTypes = jsonData.types[name];
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
        //this.setState({ types: types });
        store.dispatch(assignType(types));
        return types;

    }

    componentWillUnmount() {
        console.log("1111111111111111");
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state, callback) => {
            return;
        };
    }

    //store types in localstorage
    storeTypesInLocalStorage(types) {
        let storedTypes = JSON.parse(window.localStorage.getItem("types"));

        if (!storedTypes) {
            storedTypes = { "version": STORED_TYPES_VERSION };
        }
        let name = window.location.pathname.substring(1);
        storedTypes[name] = types;

        window.localStorage.setItem("types", JSON.stringify(storedTypes));
    }

    //when you load stored filters and types, you need to rerender GUI
    rerenderTypes() {
        if ((store.getState().types !== this.state.types) && store.getState().types.length !== 0) {
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
        this.storeTypesInLocalStorage(oldTypes);
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
        this.storeTypesInLocalStorage(oldTypes);
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
        this.storeTypesInLocalStorage(oldTypes);
        store.dispatch(assignType(oldTypes));
    }


    render() {
        console.log("2222222222222222");
        if (this.state.types.length !== 0) {
            var types = (
                <div style={{ "display": "contents" }}>
                    {this.state.types.map((type, index) => {
                        return <Type key={type.id}
                            name={type.name} id={type.id} state={type.state} description={type.description} disableType={this.disableType} enableType={this.enableType} />
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
