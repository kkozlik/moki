/*
Base class for all tables
*/
import {
  Component
} from 'react';

import store from "../store/index";
import storePersistent from "../store/indexPersistent";
import { elasticsearchConnection } from '@moki-client/gui';
import { parseTableHits } from '@moki-client/es-response-parser';

class Table extends Component {

  // Initialize the state
  constructor(props) {
    super(props);
    this.state = {};
    this.loadData = this.loadData.bind(this);
    this.unsubscribe = store.subscribe(() => this.loadData());
  }

  async componentDidMount() {
    //load types and filters before getting data
    await this.loadData()
  }

  componentWillUnmount() {
    // fix Warning: Can't perform a React state update on an unmounted component
    this.setState = (state, callback) => {
      return;
    };
  }

    /**
* parse table hits with profile attrs
* @param {ES response}  array ES data
* @return {} stores data in state
* */
  async processESData(esResponse) {
     if (!esResponse) {
      return;
    }

    //only parse table fnc and set total value
    try {
      const profile = storePersistent.getState().profile;
      var data = await parseTableHits(esResponse.hits.hits, profile);
      var total = esResponse.hits.total.value;
    } catch (e) {
      console.log("Error: " + e);
    }
    this.state["calls"] = data;
    this.state["total"] = total;
  }

  async loadData() {
    //wait for types to load, it will trigger again
    //if (window.dashboard.finishedLoadingInicialValues()) {
      try {
        var data = await elasticsearchConnection(this.state.dashboardName);
        if (typeof data === "string") {
          //error
          console.error(data);
          return;
        } else if (data) {
          await this.processESData(data);
          this.setState(this.state);
          console.info(new Date() + " MOKI " + this.state.dashboardName + ": finished parsing table");
        }
      } catch (e) {
        console.error(e);
      }
   // }
  }
}

export default Table;
