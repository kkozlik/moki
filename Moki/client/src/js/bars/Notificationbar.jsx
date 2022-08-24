import React, { Component } from 'react';
import status from '../helpers/status';

class Notificationbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notifications: this.props.error
        }
        this.remove = this.remove.bind(this);
        this.showError = this.showError.bind(this);
    }

    componentDidMount() {
        var self = this;
        let statusCheck = setInterval(async function () {
            let result = await status();
            if (!result.logstash) {
                self.showError(["Logstash is not running"])
            }

            if (!result.elasticsearch) {
                self.showError(["Elasticsearch is not running"])
            }
        }, 60000);
    }

    /**
* display errors in error bar
* @param {errors}  array strings
* @return {} 
* */
    showError(error) {
        var newNotification = [];
        for (var i = 0; i < error.length; i++) {
            if (this.state.notifications.indexOf(error[i]) === -1) {
                newNotification.push(error[i]);
            }
        }
        this.setState({
            notifications: this.state.notifications.concat(newNotification)
        });
        if (this.props.className !== "errorBarLoading") this.props.deleteAllErrors();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.error.length > 0) {
            this.showError(nextProps.error);
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
                        return <div key={i}><button className="closeButton" onClick={() => this.remove(notification)}>&times;</button> {notification}
                        </div>
                    })}</div>
                </div>)
        }

    }
}

export default Notificationbar;
