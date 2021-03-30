/*
Base class for all dashboards
*/
import {
  Component
} from 'react';

import store from "../store/index";
import {
  elasticsearchConnection
} from '@moki-client/gui';

class Dashboard extends Component {

  // Initialize the state
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
    this.state = {};
    this.transientState = {};
    this.callBacks = { functors: [] };
    // call 'unsubscribe()' to deregister default loadData change listener
    this.unsubscribe = store.subscribe(() => this.loadData());
    store.subscribe(() => this.getLayout());
    this.getLayout = this.getLayout.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillUnmount() {
    // fix Warning: Can't perform a React state update on an unmounted component
    this.setState = (state, callback) => {
      return;
    };
  }

  getLayout = async () => {
    const layout = store.getState().layout;
    if (layout) {
      var name = this.state.dashboardName.substr(0, this.state.dashboardName.indexOf("/"));
      if (layout.charts[name]) {
        this.setState({ charts: layout.charts[name] });
      }
    }
  }

  processESData(data) {
    if ((!data) || (!data.responses)) {
      return;
    }
    var functors = [];
    for (let i = 0; (i < data.responses.length) && (i < this.callBacks.functors.length); i++) {
      // functors for i'th response
      functors = this.callBacks.functors[i];
      // apply all the functors to the i'th response
      for (let j = 0; j < functors.length; j++) {
        this.transientState[functors[j].result] =
          functors[j].func(data.responses[i]);
      }
    }
  }

  async loadData() {
    this.setState({ isLoading: true });

    var data = await elasticsearchConnection(this.state.dashboardName);

    if (typeof data === "string" && data.includes("ERROR:")) {

      this.props.showError(data);
      this.setState({ isLoading: false });
      return;

    } else if (data) {
      this.processESData(data);
      this.setState(this.transientState);
      this.setState({ isLoading: false });
      console.info(new Date() + " MOKI CALLS: finished parsíng data");

    }
  }
}

export default Dashboard;
