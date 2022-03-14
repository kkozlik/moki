import { Component } from 'react';

class CountryFlag extends Component {
    constructor(props) {
        super(props);
        this.state = {
            picture: null
        }
        this.getCountryFlag = this.getCountryFlag.bind(this);
    }

    componentDidMount() {
        this.getCountryFlag(this.props.countryCode);
    }

    async getCountryFlag(countryCode) {
        try {
            const picture = (await import(`../../styles/flags/${countryCode.toLowerCase()}.png`));
            if(picture.default)   this.setState({ picture: picture.default });
        }
        catch (err) {
            //Do whatever you want when the image failed to load here
        }
    }

    render() {
        return (
            <span>
                {this.state.picture && <img alt="flag" src={this.state.picture} style={{ "width": "20px", "marginBottom": "2px", "marginRight": "2px"}}></img>}
            </span>
        )
    }
}

export default CountryFlag;