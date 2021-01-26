import React, {
    Component
} from 'react';
import Autocomplete from "./AutocompleteTags";

//tag input
export default class TagRanger extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tags: this.props.tags
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.tags !== this.props.tags) {
            this.setState({
                tags: nextProps.tags
            });
        }

    }

    render() {
        return [
            <Autocomplete suggestions={
                this.state.tags
            }
                key="tagSuggestions"
                row={
                    this.props.row
                }
            />];
    }
}
