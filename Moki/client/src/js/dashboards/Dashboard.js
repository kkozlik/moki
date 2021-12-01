/*
Base class for all dashboards
*/
import {
  Component
} from 'react';

import store from "../store/index";
import storePersistent from "../store/indexPersistent";
import { elasticsearchConnection } from '@moki-client/gui';
import { parseTableHits } from '@moki-client/es-response-parser';

class Dashboard extends Component {

  // Initialize the state
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
    this.state = {};
    this.transientState = {};
    this.callBacks = { functors: [] };
    //set empty type array for first time loading
    store.getState().types = [];
    // call 'unsubscribe()' to deregister default loadData change listener
    this.unsubscribe = store.subscribe(() => this.loadData());
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
    const layout = storePersistent.getState().layout;
    if (layout) {
      var name = this.state.dashboardName.substr(0, this.state.dashboardName.indexOf("/"));
      if (layout.charts[name]) {
        this.setState({
          charts: layout.charts[name],
          layout: layout
        });
      }
    }
  }

  async processESData(data) {
    if ((!data) || (!data.responses)) {
      return;
    }
    const profile = storePersistent.getState().profile;
    var functors = [];
    for (let i = 0; (i < data.responses.length) && (i < this.callBacks.functors.length); i++) {
      // functors for i'th response
      functors = this.callBacks.functors[i];
      // apply all the functors to the i'th response
      for (let j = 0; j < functors.length; j++) {
        let attrs = [];
        if (functors[j].attrs) attrs = functors[j].attrs;

        this.transientState[functors[j].result] =
          await functors[j].func(data.responses[i], profile, attrs);
      }
    }
  }

  async loadData() {
    try {
      this.getLayout();
      this.setState({ isLoading: true });
      var data = await elasticsearchConnection(this.state.dashboardName);

      if (typeof data === "string") {
        this.props.showError(data);
        this.setState({ isLoading: false });
        return;
      } else if (data) {
        await this.processESData(data);
        this.setState(this.transientState);
        this.setState({ isLoading: false });
        console.info(new Date() + " MOKI CALLS: finished parsíng data");
      }
    } catch (e) {
      this.props.showError("Error: " + e);
      this.setState({ isLoading: false });
    }
  }
}

/**
* parse table hits with profile attrs
* @param {hits}  array ES data
* @return {array} format changed data
* */
export async function parseTable(hits) {
  try {
    const profile = storePersistent.getState().profile;
    return await parseTableHits(hits, profile);
  } catch (e) {
    console.log("Error: " + e);
  }
}


export default Dashboard;
