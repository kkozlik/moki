import React, { Component } from 'react';

class Notificationbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notifications: this.props.error
        }
        this.remove = this.remove.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.error.length > 0) {
            var newNotification = [];
            for (var i = 0; i < nextProps.error.length; i++) {
                if (this.state.notifications.indexOf(nextProps.error[i]) === -1) {
                    newNotification.push(nextProps.error[i]);
                }
            }
            this.setState({
                notifications: this.state.notifications.concat(newNotification)
            });

            if (this.props.className !== "errorBarLoading") this.props.deleteAllErrors();
        }
    }

    /**
* remove notification 
* @param {string}  id an error 
* @return {} stores in state 
* */
    remove(id) {
        var array = [...this.state.notifications];
        var index = array.indexOf(id);
        if (index !== -1) {
            array.splice(index, 1);
            this.setState({ notifications: array });
        }
    }

    render() {
        if (this.state.notifications.length === 0) {
            return (<div></div>)
        } else {
            return (
                <div className="row" >
                    <div className={this.props.className} >  {this.state.notifications.map((notification, i) => {
                        return <div key={i}><button className="closeButton" onClick={() => this.remove(notification)}>&times;</button> {"Error: " + notification}
                        </div>
                    })}</div>
                </div>)
        }

    }
}

export default Notificationbar;
