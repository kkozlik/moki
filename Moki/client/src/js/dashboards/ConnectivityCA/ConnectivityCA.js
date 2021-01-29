import React, {
  Component
} from 'react';


import ConnectivityCACharts from './ConnectivityCACharts';
import TypeBar from '../../bars/Typebar';
import FilterBar from '../../bars/FilterBar';

class ConnectivityCA extends Component {
  constructor(props) {
    super(props);
    this.state = {
      srcRealms: this.props.srcRealms,
      dstRealms: this.props.dstRealms
    }
    this.showError = this.showError.bind(this);
  }

  showError(value) {
    this.props.showError(value);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.dstRealms !== prevState.dstRealms) {
      return { dstRealms: nextProps.dstRealms };
    }
    if (nextProps.srcRealms !== prevState.srcRealms) {
      return { srcRealms: nextProps.srcRealms };
    }
    else return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.dstRealms !== this.props.dstRealms) {
      this.setState({ dstRealms: this.props.dstRealms });
    }
    if (prevProps.srcRealms !== this.props.srcRealms) {
      this.setState({ srcRealms: this.props.srcRealms });
    }
  }

  render() {
    return (
      <div className="container-fluid">
        <FilterBar tags={this.props.tags} srcRealms={this.state.srcRealms} dstRealms={this.state.dstRealms} />
        <TypeBar />
        <ConnectivityCACharts showError={this.showError} />
      </div>

    );
  }
}

export default ConnectivityCA;
