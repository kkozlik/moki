import { Component } from 'react';

class CountryFlag extends Component {
    constructor(props) {
        super(props);
        this.state = {
            picture: null,
            countryCode: null
        }
        this.getCountryFlag = this.getCountryFlag.bind(this);
    }

    componentDidMount() {
        this.setState({ countryCode: this.props.countryCode });
        this.getCountryFlag(this.props.countryCode);
    }


      //after redirect delete unpinned filters
      componentWillReceiveProps(nextProps) {
        if (nextProps.countryCode !== this.props.countryCode) {
            this.setState({ countryCode: nextProps.countryCode });
            this.getCountryFlag(nextProps.countryCode);
        }
    }

    async getCountryFlag(countryCode) {
        try {
            const picture = (await import(`../../styles/flags/${countryCode.toLowerCase()}.png`));
            if(picture.default)   this.setState({ picture: picture.default });
            else this.setState({ picture: null });
        }
        catch (err) {
            this.setState({ picture: null });
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