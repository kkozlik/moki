import React, {
    Component
} from 'react';
import { ColorType, getExceededColor } from '@moki-client/gui';

class Type extends Component {
    constructor(props) {
        super(props);
        let color = ColorType[this.props.id];
        if (window.location.pathname === "/exceeded"){
            color = getExceededColor(this.props.id);
        }
        this.state = {
            state: this.props.state ? this.props.state : 'enable',
            color: this.props.state && this.props.state === "disable" ? "gray" : color,
        }
        this.disableType = this.disableType.bind(this);

    }

    componentWillReceiveProps(nextProps) {
        // if (nextProps.state !== this.props.state) {
        let color = ColorType[this.props.id];
        if (window.location.pathname === "/exceeded") {
            color = getExceededColor(this.props.id);
        }
        if (nextProps.state === "disable") {
            this.setState({ state: 'disable' });
            this.setState({ color: 'gray' });

        } else {
            this.setState({ state: 'enable' });
            this.setState({ color: color });
            //        }
        }
    }


    disableType(events) {
        if (this.state.state === "enable") {
            this.setState({ state: 'disable' });
            this.setState({ color: 'gray' });
            this.props.disableType(events.currentTarget.getAttribute('id'));

        } else {
            this.setState({ state: 'enable' });
            this.setState({ color: ColorType[this.props.id] });
            this.props.enableType(events.currentTarget.getAttribute('id'));
        }

    }

    render() {
        return (
            <button type="button" className="type" id={this.props.id} state={this.state.state} title={this.props.description ? this.props.description : ""} style={{ backgroundColor: this.state.color }} onClick={this.disableType}>{this.props.name}
            </button>
        )
    };
}

export default Type;