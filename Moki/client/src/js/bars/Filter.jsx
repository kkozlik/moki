import React, {
    Component
} from 'react';
import deleteIcon from "../../styles/icons/delete.png";
import disableIcon from "../../styles/icons/disable.png";
import enableIcon from "../../styles/icons/enable.png";
import editIcon from "../../styles/icons/edit.png";
import pinIcon from "../../styles/icons/pin.png";
import unpinIcon from "../../styles/icons/unpin.png";
import negationIcon from "../../styles/icons/negation.png";
import storePersistent from "../store/indexPersistent";

//Filter element component with enable/disable state, color, pin state
class Filter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            enable: this.props.state === "disable" ? "false" : "true",
            color: this.props.state === "disable" ? 'gray' : '#58a959',
            icon: this.props.state === "disable" ? enableIcon : disableIcon,
            pinIcon: unpinIcon,
            negationIcon: unpinIcon,
            pinned: 'true'
        }
        this.disableFilter = this.disableFilter.bind(this);
        this.showFilterPopup = this.showFilterPopup.bind(this);
        this.editFilter = this.editFilter.bind(this);
        this.negationFilter = this.negationFilter.bind(this);
        this.deleteFilter = this.deleteFilter.bind(this);
        this.unpinFilter = this.unpinFilter.bind(this);
        this.keyPress = this.keyPress.bind(this);
    }


    /**
* Remove filter from redux
* @param {event}  event html event with id attribute with name
* @return {} 
* */
    deleteFilter(event) {
        this.props.deleteFilter(document.getElementById(event.currentTarget.getAttribute('deleteid')).getAttribute('id'));

    }

    /**
* set filter to negation iin redux
* @param {event}  event html event with id attribute with name
* @return {} 
* */
    negationFilter(event) {
        this.props.negationFilter(document.getElementById(event.currentTarget.getAttribute('deleteid')).getAttribute('id'));

    }

    /**
* change filter value in redux
* @param {event}  event html event with id attribute with name
* @return {} 
* */
    editFilter(event) {
        var id = event.currentTarget.getAttribute("editid");
        this.props.editFilter(id, document.getElementById("filtervalue" + id).value);
        document.getElementById("edit" + id).style.display = "none";
    }

    //on enter handler
    keyPress(event) {
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();
            this.editFilter(event);
        }
    }

    /**
* Popup edit filter window
* @param {event}  event html event with id attribute with name
* @return {} 
* */
    showFilterPopup(event) {
        var id = event.currentTarget.getAttribute("idedit");
        var filter = document.getElementById("edit" + id);
        filter.style.top = (event.pageY + 20) + "px";
        document.getElementById("edit" + id).style.display = "inline";
        document.getElementById("filtervalue" + id).focus();
    }

    /**
* Close edit filter popup
* @param {event}  event html event with id attribute with name
* @return {} 
* */    closeFilterPopup(event) {
        var id = event.currentTarget.getAttribute("editid");
        document.getElementById("edit" + id).style.display = "none";
    }


    /**
* Disable filter in redux state, change its color
* @param {event}  event html event with id attribute with name
* @return {} 
* */
    disableFilter(event) {
        if (this.state.enable === "true") {
            this.setState({
                enable: 'false',
                color: 'gray',
                icon: enableIcon
            });
            this.props.disableFilter(document.getElementById(event.currentTarget.getAttribute('disableid')).getAttribute('id'));
        } else {
            this.setState({
                enable: 'true',
                color: '#58a959',
                icon: disableIcon
            });

            this.props.enableFilter(document.getElementById(event.currentTarget.getAttribute('disableid')).getAttribute('id'));
        }

    }

    /**
* Unpin filter in redux, change its color
* @param {event}  event html event with id attribute with name
* @return {} 
* */
    unpinFilter(event) {
        if (this.state.pinned === "true") {
            this.setState({
                pinIcon: pinIcon,
                pinned: "false",
                color: "#343a40"
            });
            this.props.unpinFilter(document.getElementById(event.currentTarget.getAttribute('pinid')).getAttribute('id'));
        } else {
            this.setState({
                pinIcon: unpinIcon,
                pinned: "true",
                color: '#58a959'
            });
            this.props.pinFilter(document.getElementById(event.currentTarget.getAttribute('pinid')).getAttribute('id'));
        }

    }

    render() {
        var user = storePersistent.getState().user.jwt ? storePersistent.getState().user.jwt : 0;
        return (<span>
            <span id={"edit" + this.props.id} className="editFilter">
                <p className="modalText" style={{ "float": "left", "marginLeft": "10px" }}><input type="text" id={"filtervalue" + this.props.id} editid={this.props.id} defaultValue={this.props.title} size={this.props.title.length} onKeyPress={this.keyPress} style={{ "width": "auto" }} /></p>
                <button type="button"
                    className="btn-primary filterButtonClose btn-small"
                    filter={this.props.title}
                    onClick={this.editFilter}
                    style={{ "display": "inline-block", "minHeight": "35px" }}
                    editid={this.props.id}> OK
                </button>
                <button type="button"
                    className="btn-secondary filterButtonClose btn-small"
                    onClick={this.closeFilterPopup}
                    editid={this.props.id}
                    style={{ "display": "inline-block", "minHeight": "35px" }} > X
                  </button>
            </span>
            <button style={{ backgroundColor: this.state.color }}
                type="button"
                className="filter"
                id={this.props.id} > 
                { this.props.encrypt ? this.props.encrypt : this.props.title } <div className="buttonHover" >
                    <span className="iconNoMargin marginRight"
                        deleteid={this.props.id}
                        onClick={this.deleteFilter}
                        style={{ "marginLeft": "10px" }}>
                        <img alt="deleteIcon"
                            title="delete"
                            src={deleteIcon}
                        /></span >
                    <span className="iconNoMargin marginRight"
                        enable={this.state.enable}
                        disableid={this.props.id}
                        onClick={this.disableFilter
                        } >
                        <img alt="disableIcon"
                            src={this.state.icon}
                            title={this.state.enable === "true" ? "disable" : "enable"} /> </span>
                    <span className="iconNoMargin marginRight"
                        idedit={this.props.id}
                        onClick={this.showFilterPopup
                        } > <img alt="editIcon"
                            src={editIcon}
                            title="edit" /> </span>
                    <span className="iconNoMargin marginRight"
                        deleteid={this.props.id}
                        onClick={
                            this.negationFilter
                        } > <img alt="negationIcon"
                            title="negation"
                            src={negationIcon}
                        /></span>
                    {user !== 2 &&
                        <span className="iconNoMargin marginRight"
                            pinid={this.props.id}
                            onClick={
                                this.unpinFilter
                            } > <img alt="pinIcon"
                                src={this.state.pinIcon}
                                title={this.state.pinned === "true" ? "pin" : "unpin"} /> </span>
                    }
                </div></button>
        </span>
        )
    }
}

export default Filter;
