// calls.js hold the calls endpoint

const { getFiltersConcat, getTypesConcat, getQueries, checkSelectedTypes } = require('../utils/metrics');
const { connectToES } = require('../modules/elastic');
const scroll = require('../../js/template_queries/scroll');
let { timestamp_gte, timestamp_lte } = require('../utils/ts');
const { getTimestampBucket } = require('../utils/ts');
const { getJWTsipUserFilter, getEncryptChecksumFilter } = require('../modules/jwt');
const timerange_query = require('../../js/template_queries/timerange_query');

const supress = "nofield";
let userFilter = "*";
let domainFilter = "*";

/*
Request - array of object. {template, params, filter, index}
*/
//if no dashboard selected, use overview as default
class Controller {
  static request(req, res, next, requests, dashboard = "overview") {
    async function search() {
      const client = connectToES();
      const filters = getFiltersConcat(req.body.filters);
      let types = req.body.types;

      if (req.body.timerange_lte) {
        timestamp_lte = Math.round(req.body.timerange_lte);
      }

      if (req.body.timerange_gte) {
        timestamp_gte = Math.round(req.body.timerange_gte);
      }

      //check if domain fiter should be use
      const isDomainFilter = await getJWTsipUserFilter(req);
      if (isDomainFilter.domain) {
        domainFilter = isDomainFilter.domain;
        //check if user fiter should be use
        if (isDomainFilter.userFilter) {
          userFilter = isDomainFilter.userFilter;
        }
      }

      //check if encrypt filter should be used
      let isEncryptChecksumFilter = await getEncryptChecksumFilter(req);
      if (isEncryptChecksumFilter.encryptChecksum) {
        isEncryptChecksumFilter = isEncryptChecksumFilter.encryptChecksum;
      }

      //special case: disable disableHMACfilter - for account chart
      if (req.url === "/account/charts" || req.url === "/account/distinc_encrypt") {
        isEncryptChecksumFilter = "*";
      }

      //if no types from client, get types from monitor_layout
      if (types.length === 0) {
        types = await checkSelectedTypes([], dashboard);
      }
      //or if client request types, use this instead 
      else {
        if (req.url.includes("exceeded")) {
          types = getTypesConcat(types, "exceeded");
        }
        else {
          types = getTypesConcat(types);
        }
      }
      const oldtypes = types;

      //disable types for network dashboard
      if (req.url.includes("network")) {
        types = "*";
      }

      for (let i = 0; i < requests.length; i++) {
        //disable types for specific requests (e.g. different index in dashboard)
        if (requests[i].types) {
          types = "*";
        }


        //if timestamp_lte is set, get value
        if (requests[i].timestamp_lte) {
          timestamp_lte = eval(timestamp_lte + requests[i].timestamp_lte);
        }

        //get timebucket value
        let timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);

        //get last timebucket
        let lastTimebucket = "";
        if (timebucket.includes("s")) {
          lastTimebucket = timestamp_lte - (timebucket.slice(0, -1) * 1000);
        }
        else if (timebucket.includes("m")) {
          lastTimebucket = timestamp_lte - (timebucket.slice(0, -1) * 60 * 1000);
        }
        if (timebucket.includes("h")) {
          lastTimebucket = timestamp_lte - (timebucket.slice(0, -1) * 60 * 60 * 1000);
        }

        //get last last timebucket
        let lastlastTimebucket = "";
        if (timebucket.includes("s")) {
          lastlastTimebucket = lastTimebucket - (timebucket.slice(0, -1) * 1000);
        }
        else if (timebucket.includes("m")) {
          lastlastTimebucket = lastTimebucket - (timebucket.slice(0, -1) * 60 * 1000);
        }
        if (timebucket.includes("h")) {
          lastlastTimebucket = lastTimebucket - (timebucket.slice(0, -1) * 60 * 60 * 1000);
        }


        //if timestamp_gte is set, get value
        if (requests[i].timestamp_gte) {
          //last time bucket
          if (requests[i].timestamp_gte === "lastTimebucket") {
            timestamp_gte = lastTimebucket;
          }
          //special case: last last timebucket for home dashboard
          else if (requests[i].timestamp_gte === "lastlastTimebucket") {
            timestamp_gte = lastlastTimebucket;
            timestamp_lte = lastTimebucket;

          }
          //timestamp_lte is depending on timestamp_gte
          else if (requests[i].timestamp_gte.includes("timestamp_lte")) {
            requests[i].timestamp_gte.replace('timestamp_lte', timestamp_lte);
            timestamp_gte = eval(requests[i].timestamp_gte);
          }
          //count it
          else {
            timestamp_gte = eval(timestamp_gte + requests[i].timestamp_gte);
          }
        }

        timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);

        if (requests[i].params) {
          //check if params contains "timebucket", insert it
          let params = requests[i].params;
          if (params.includes("timebucket")) {
            params = params.map(function (item) { return item === "timebucket" ? timebucket : item; });

          }
          if (params.includes("timestamp_lte")) {
            params = params.map(function (item) { return item === "timestamp_lte" ? timestamp_lte : item; });

          }
          if (params.includes("timestamp_gte")) {
            params = params.map(function (item) { return item === "timestamp_gte" ? timestamp_gte : item; });

          }
          if (params.includes("timebucketAnimation")) {
            //video length 30 sec
            let timebucketAnimation = (timestamp_lte - timestamp_gte) / 30000;
            timebucketAnimation = Math.round(timebucketAnimation) + "s";
            params = params.map(function (item) { return item === "timebucketAnimation" ? timebucketAnimation : item; });
          }

          //special case: disable disableHMACfilter - for loging events - different index
          if (requests[i].index === "lastlog*") {
            isEncryptChecksumFilter = "*";
            types = "*";
          }

          requests[i].query = requests[i].template.getTemplate(...params, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, requests[i].filter, domainFilter, isEncryptChecksumFilter, requests[i].exists), supress);

        }
        else {
          //special case: disable disableHMACfilter - for loging events - different index
          if (requests[i].index === "lastlog*") {
            isEncryptChecksumFilter = "*";
            types = "*";
          }

          requests[i].query = requests[i].template.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, requests[i].filter, domainFilter, isEncryptChecksumFilter, requests[i].exists), supress);
        }

        //ged old timestamp if has changed
        if (req.body.timerange_lte) {
          timestamp_lte = Math.round(req.body.timerange_lte);
        }

        if (req.body.timerange_gte) {
          timestamp_gte = Math.round(req.body.timerange_gte);
        }
        types = oldtypes;
      }
      console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " userFilter: " + userFilter + " domainFilter: " + domainFilter + " encrypt checksum: " + isEncryptChecksumFilter);
      console.log(new Date() + " send msearch");

      const requestList = [];
      for (let j = 0; j < requests.length; j++) {
        //console.log(JSON.stringify(requests[j].query));
        requestList.push(
          {
            index: requests[j].index,
            "ignore_unavailable": true,
            "preference": 1542895076143
          },
          requests[j].query
        );
      }
      userFilter = "*";

      const response = await client.msearch({
        body: requestList
      }).catch((err) => {
        /*res.render('error_view', {
          title: 'Error',
          error: err
          });*/
        err.status = 400;
        return next(err);
      });

      console.log(new Date() + " got elastic data");
      client.close();
      return res.json(response);
    }

    return search().catch(e => {
      return next(e);
    });
  }

  //special case, not msearch and with scroll parameter
  static requestTable(req, res, next, requests, dashboard = "overview") {
    async function search() {
      const client = connectToES();
      const filters = getFiltersConcat(req.body.filters);
      let types = req.body.types;
      const querySize = req.body.size ? req.body.size : 500;

      //if no types from client, get types from monitor_layout
      if (types.length === 0) {
        types = await checkSelectedTypes([], dashboard);
      }
      //or if client request types, use this instead 
      else {
        if (req.url.includes("exceeded")) {
          types = getTypesConcat(types, "exceeded");
        }
        else {
          types = getTypesConcat(types);
        }
      }

      if (req.body.timerange_lte) {
        timestamp_lte = Math.round(req.body.timerange_lte);
      }

      if (req.body.timerange_gte) {
        timestamp_gte = Math.round(req.body.timerange_gte);
      }

      const timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);
      //check if domain fiter should be use
      const isDomainFilter = await getJWTsipUserFilter(req);
      if (isDomainFilter.domain) {
        domainFilter = isDomainFilter.domain;

        //check if user fiter should be use
        if (isDomainFilter.userFilter) {
          userFilter = isDomainFilter.userFilter;
        }
      }


      //check if encrypt filter should be used
      let isEncryptChecksumFilter = await getEncryptChecksumFilter(req);
      if (isEncryptChecksumFilter.encryptChecksum) {
        isEncryptChecksumFilter = isEncryptChecksumFilter.encryptChecksum;
      }

      //special case: disable disableHMACfilter - for account chart
      if (req.url === "/account/table") {
        isEncryptChecksumFilter = "*";
      }


      console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter + " domainFilter: " + domainFilter + " encrypt checksum filter: " + isEncryptChecksumFilter);
      //always timerange_query
      requests.query = timerange_query.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, requests.filter, domainFilter, isEncryptChecksumFilter), supress, querySize);
      const response = await client.search({
        index: requests.index,
        scroll: '2m',
        "ignore_unavailable": true,
        "preference": 1542895076143,
        body: requests.query

      });

      if (querySize !== 500) {
        const totalHits = response.hits.total.value;
        let actualHits = response.hits.hits.length;
        while (actualHits < totalHits) {
          const responseScroll = await scroll.scroll(client, response._scroll_id);
          actualHits = actualHits + responseScroll.hits.hits.length;
          response.hits.hits = response.hits.hits.concat(responseScroll.hits.hits);
        }
      }

      userFilter = "*";
      console.info(new Date() + " got elastic data");
      client.close();
      return res.json(response);
    }

    return search().catch(e => {
      return next(e);
    });
  }

}

module.exports = Controller;
