define(function () {

  /** @method http
   * A wrapper around the Fetch() api.
   * @property {function} post - method to execute post reqs.
   * @param {string} url - url for the req
   * @param {object} data - data for the post req
   * @param {bool} verbose - for debugging in console
   */
  const http = {
    async post(url, {
      data
    }, verbose = true) {

      if (verbose) console.log({
        url,
        body: JSON.stringify(data)
      });
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
        body: JSON.stringify(data)
      })

      if (response.status == "200") {
        const results = await response.json();
        // store.setWarning(JSON.stringify(results));
        if (verbose) console.log({
          results: JSON.stringify(results)
        });
        if (results.exception) {
          if (verbose) console.log({
            exception: results.message
          });
          //console.log({ ex: results.message, data });
          throw new Error(results.message);
        }
        return results;
      } else {
        console.log("other status than 200...")
        return null;
      }

    },
  }

  class AisFormServiceCall {
    constructor(options) {
      const defaults = {
        version: 'ZJDE0001',
        formActions: [],
        formInputs: [],
        showActionControls: true,
        returnControlIDs: '',
        deviceName: options.deviceName,
        formName: ''
      };
      Object.assign(this, defaults, options);
      return this;
    }
    actions(actions) {
      self = this;

      if (typeof actions === 'object') {
        actions.forEach(function (oneAction) {
          console.log(oneAction)
          self._addAction(oneAction);

        })
      } else {
        self._addAction(actions);
      }
      return this;
    }
    _addAction(action) {
      this.formActions.push(action);
      return this;
    }
    _addInput(input) {
      this.formInputs.push(input);
      return this;
    }
    returns(returnIDs) {
      this.returnControlIDs = returnIDs;
      return this;
    }

  }

  class AisDataQuery {
    _addCondition(query) {
      query.autoFind = true; // autoFiund must be present in query
      query.matchType = "MATCH_ALL";
      //console.log(JSON.stringify(this.query.complexQuery));
      //console.log("existing query in AisDataQuery = "+JSON.stringify(this.query));
      // this.query = query;
      if (this.query.complexQuery == undefined) {
        this.query.complexQuery = [];
      }
      // this needs to be fixed to an array
      this.query = Object.assign({}, this.query, {
        autoFind: true,
        complexQuery: [
          ...this.query.complexQuery,
          {
            andOr: 'AND',
            query,
          },
        ],
      });
      //console.log("inside _addCondition after object.assign() this == "+JSON.stringify(this));
      delete this.query.condition;
    }
    setNext(obj) {
      this.next = obj;
    }
    nextLink() {
      const links = this.next || [];
      const {
        href: nextLink
      } = Object(links.find(l => l.rel === 'next'));
      return nextLink;
    }
    setQuery(query) {
      this.query = query;
      return this;
    }
    where(field) {
      this.whereField = field;
      delete this.query.complexQuery;
      return this;
    }
    and(field) {
      if (this.whereField) {
        throw new Error(
          'Previous where clause not complete, are you missing an operator like "in" or "eq"?'
        );
      }
      //console.log(JSON.stringify(this));
      this.whereField = field;
      return this;
    } in (valueArray) {
      if (!this.whereField) {
        throw new Error('You need to set "where" before "in"');
      }
      const complexQuery = valueArray.map(v => ({
        andOr: 'OR',
        query: {
          condition: [{
            controlId: `${this.targetName}.${this.whereField}`,
            operator: 'EQUAL',
            value: [{
              content: `${v}`,
              specialValueId: 'LITERAL',
            }],
          }, ],
        },
      }));
      this._addCondition({
        complexQuery
      });
      delete this.whereField;
      return this;
    }
    eq(value) {
      if (!this.whereField) {
        throw new Error('You need to set "where" before "eq"');
      }
      console.log("Value being passed into query == " + value);
      console.log("this object before adding the eq() method " + JSON.stringify(
        this))
      this.query.condition = [{
        controlId: `${this.targetName}.${this.whereField}`,
        operator: 'EQUAL',
        value: [{
          content: `${value}`,
          specialValueId: 'LITERAL',
        }],
      }]

      console.log("this object after adding the eq() method " + JSON.stringify(
        this))
      delete this.whereField;
      return this;
    }
    noteq(value) {
      if (!this.whereField) {
        throw new Error('You need to set "where" before "eq"');
      }
      //console.log("Value being passed into query == " + value);
      //console.log("this object before adding the eq() method " + JSON.stringify(
      //this))
      this._addCondition({
        condition: [{
          controlId: `${this.targetName}.${this.whereField}`,
          operator: 'NOT_EQUAL',
          value: [{
            content: `${value}`,
            specialValueId: 'LITERAL',
          }],
        }, ],
      });
      //console.log("this object after adding the eq() method " + JSON.stringify(
      //this))
      delete this.whereField;
      return this;
    }
    gt(value) {
      if (!this.whereField) {
        throw new Error('You need to set "where" before "gt"');
      }
      this._addCondition({
        condition: [{
          controlId: `${this.targetName}.${this.whereField}`,
          operator: 'GREATER',
          value: [{
            content: `${value}`,
            specialValueId: 'LITERAL',
          }],
        }, ],
      });
      delete this.whereField;
      return this;
    }
    lt(value) {
      if (!this.whereField) {
        throw new Error('You need to set "where" before "lt"');
      }
      this._addCondition({
        condition: [{
          controlId: `${this.targetName}.${this.whereField}`,
          operator: 'LESS',
          value: [{
            content: `${value}`,
            specialValueId: 'LITERAL',
          }],
        }, ],
      });
      delete this.whereField;
      return this;
    }
    lte(value) {
      if (!this.whereField) {
        throw new Error('You need to set "where" before "lte"');
      }
      this._addCondition({
        condition: [{
          controlId: `${this.targetName}.${this.whereField}`,
          operator: 'LESS_EQUAL',
          value: [{
            content: `${value}`,
            specialValueId: 'LITERAL',
          }],
        }, ],
      });
      //console.log("after less than or equal "+JSON.stringify(this));
      delete this.whereField;
      return this;
    }
    gte(value) {
      if (!this.whereField) {
        throw new Error('You need to set "where" before "gte"');
      }
      this._addCondition({
        condition: [{
          controlId: `${this.targetName}.${this.whereField}`,
          operator: 'GREATER_EQUAL',
          value: [{
            content: `${value}`,
            specialValueId: 'LITERAL',
          }],
        }, ],
      });
      delete this.whereField;
      return this;
    }
    select(fieldsArray) {
      if (typeof fieldsArray === 'string') {
        fieldsArray = [fieldsArray];
      }
      this.returnControlIDs = fieldsArray
        .map(name => `${this.targetName}.${name}`)
        .join('|');
      return this;
    }
    pageSize(size) {
      this.maxPageSize = size;
      return this;
    }
    orderAsc(fieldsArray) {
      if (typeof fieldsArray === 'string') {
        fieldsArray = [fieldsArray];
      }
      if (!this.orderField) this.orderField = {
        name: fieldsArray[0],
        direction: 1
      }
      this.aggregation.orderBy = fieldsArray.map(name => ({
        column: `${this.targetName}.${name}`,
        direction: 'ASC',
      }));
      return this;
    }
    orderDesc(fieldsArray) {
      if (typeof fieldsArray === 'string') {
        fieldsArray = [fieldsArray];
      }
      if (!this.orderField) this.orderField = {
        name: fieldsArray[0],
        direction:
          -1
      }
      this.aggregation.orderBy = fieldsArray.map(name => ({
        column: `${this.targetName}.${name}`,
        direction: 'DESC',
      }));
      return this;
    }
    constructor(options) {
      const defaults = {
        aliasNaming: true,
        outputType: 'VERSION1',
        targetType: 'table',
        dataServiceType: 'BROWSE',
        returnControlIDs: '',
        query: {
          autoFind: true,
          matchType: "MATCH_ALL",
          complexQuery: [],
          condition: [],
        },
        aggregation: {
          orderBy: [],
        },
      };
      Object.assign(this, defaults, options);
      return this;
    }
  }

  /** @class AisClient
   * the main object for interacting with AIS
   * @constructor
   * @param {object} - inputs for AIS settings.
   * @property {string} username - For AIS calls.
   * @property {string} password - For AIS calls.
   * @property {string} url - For AIS server.
   * @property {string} deviceNAme - needs to be unique for AIS calls.
   * @property {string} version - whihc AIS version to use.
   * @property {bool} verbose - turn on logs to console
   */

  return class AisClient {
    // here AIS dataservice options can be set from the implementation
    createDataQuery(options) {
      // allow an options object or targetName string
      if (typeof options === 'string') {
        options = {
          targetName: options,
        };
      }
      const queryOptions = Object.assign({
          deviceName: this.credentials.deviceName
        },
        options);
      const query = new AisDataQuery(queryOptions, this.count);
      return query;
    }
    // here AIS formservice options can be set from the implementation
    createFormServiceCall(options) {
      if (typeof options === 'string') {
        options = {
          formName: options,
        };
      }
      const queryOptions = Object.assign({
          deviceName: this.credentials.deviceName
        },
        options);
      const query = new AisFormServiceCall(queryOptions, this.count);
      return query;
    }
    createAppstackCall(stepsArray, data) { // extend steps with data
      console.log(stepsArray.length)
      let returnHolder = []; // array to hold appStack Steps
      let count = 1; // count to keep track of what action step
      stepsArray.forEach(function (oneStep) {
        if (oneStep.inputs.length > 0) { // we have inputs 

        }
        if (count == 1) { // open action
          console.log("open: in step #" + count)

          count++
        } else if (count < stepsArray.length) { // execute actions
          console.log("execute: in step #" + count)

          count++
        } else if (count == stepsArray.length) { // close action
          console.log("close: in step #" + count)

          count++
        }
      })
      count = 0
      return returnHolder;
      // put each step onto this object
      //  stepsArray.forEach(function(oneStep){
      //   if(count == 1){
      //     // open step
      //     openStepJSON = {
      //       "formName": oneStep.formName,
      //       "version": "ZJDE0001",
      //       "action": "open",
      //       "aliasNaming": true,
      //       "outputType": "VERSION2",
      //       "formRequest": {
      //           "maxPageSize": "5",
      //           "returnControlIDs": oneStep.returnControlIDs,
      //           "formName": oneStep.formName,
      //           "version": "ZJDE0001",
      //           "formActions":[],
      //           "formServiceAction": "R",
      //           "bypassFormServiceEREvent": true
      //       },
      //       "stackId": 0,
      //       "stateId": 0
      //   }
      //   oneStep.formActions.forEach(function(oneAction){
      //     if(oneAction.hasOwnProperty('inputValue')){
      //       const mappedValue = data.filter(function(val, ind, element){
      //         console.log(val, ind, element);
      //         return data[element] == oneAction
      //       })
      //       oneAction.value = mappedValue;
      //       openStepJSON.formRequest.formActions.push(oneAction)
      //     } else {
      //       openStepJSON.formRequest.formActions.push(oneAction)
      //     }

      //   })

      //   } else if(count > stepsArray.length + 1){
      //     // various execute steps
      //     executeStepsJSON = {

      //     }
      //   } else if(count == stepsArray.length + 1){
      //     // close step
      //     closeStepJSON = {

      //     }
      //   }
      //   count++

      //  })
    }
    // general method for executing actions
    async fetch(query, mapper = simpleFieldMapper, fullResponse = false) {

      await this._ensureToken();
      // here we run the http call to AIS
      if (query.hasOwnProperty('targetName')) {
        const results = await http.post(`${this.url}/dataservice`, {
          data: Object.assign({}, query, {
            token: this.token
          }),
        }, this.verbose);
        if (results == null) {
          return null;
        }
        const {
          data: {
            gridData: {
              rowset = [],
              titles
            } = {}
          } = {}
        } =
        Object(results[`fs_DATABROWSE_${query.targetName}`]);
        // return the mapper function
        if(fullResponse){
          return rowset
        } else {
          return typeof mapper === 'function' ? rowset.map(row => mapper(row,
            titles)) : rowset;
        }
        

      } else {

        console.log(JSON.stringify(query));
        const results = await http.post(`${this.url}/formservice`, {
          data: Object.assign({}, query, {
            token: this.token
          }),
        }, this.verbose);
        console.log(JSON.stringify(results))
        const {
          data: {
            gridData: {
              rowset = [],
              titles
            } = {}
          } = {}
        } =
        Object(results[`fs_${query.formName}`]);
        return results
        // return the mapper function
        // return typeof mapper === 'function' ? mapper(data) : data;
      }

    }
    async fetchAppStack(queryArray, mapper = simpleFormMapper, callback) {
      await this._ensureToken();

      let response = {},
        rid, stackId, stateId

      const results = await http.post(`${this.url}/appstack`, {
        data: Object.assign({}, queryArray[0], {
          token: this.token
        }),
      }, this.verbose);

      if (results[`fs_${query.formName}`]) {

      }
      queryArray.shift(); // remove the previous step from the array 

      // return results[`fs_${query.formName}`]
      if (typeof callback == 'function') {
        callback(response)
      }
    }
    async fetchPageV1(query, mapper = simpleFieldMapper) {
      if (query.aggregation.orderBy.length !== 1) {
        throw new Error(
          'Version 1 query can only fetch by page if only a single orderBy element is specified.'
        );
      }
      await this._ensureToken();
      if (query.next) {
        query = query.and(query.orderField.name);
        if (query.orderField.direction > 1) {
          query = query.gt(query.next);
        } else {
          query = query.lt(query.next);
        }
      }
      const payload = {
        data: Object.assign({}, query, {
          token: this.token,
        }),
      };
      const results = await http.post(`${this.url}/dataservice`, payload, this.verbose);
      // return results[`fs_DATABROWSE_${query.targetName}`].data.gridData.rowset;
      const {
        data: {
          gridData: {
            rowset = [],
            columns
          } = {}
        } = {}
      } = Object
        (results[`fs_DATABROWSE_${query.targetName}`]);
      const pageResults = typeof mapper === 'function' ? rowset.map(row =>
        mapper(row, columns)) : rowset;
      if (pageResults && pageResults.length) {
        query.setNext(pageResults[pageResults.length - 1]);
      } else {
        delete query.next;
      }
      return pageResults;
    }
    async fetchPageV2(query, mapper = simpleFieldMapper) {
      await this._ensureToken();
      let nextLink = query.nextLink();
      const payload = nextLink ? {} : {
        data: Object.assign({}, query, {
          token: this.token,
          enableNextPageProcessing: true,
        }),
      };
      if (!nextLink) nextLink = `${this.url}/dataservice`;
      const results = await http.post(nextLink, payload, this.verbose);
      query.setNext(results.links);
      // return results[`fs_DATABROWSE_${query.targetName}`].data.gridData.rowset;
      const {
        data: {
          gridData: {
            rowset = [],
            titles
          } = {}
        } = {}
      } = Object
        (results[`fs_DATABROWSE_${query.targetName}`]);
      return typeof mapper === 'function' ? rowset.map(row => mapper(row,
        titles)) : rowset;
    }
    // generic post that returns ais return json
    async simplePost(options) {
      const q = this.createDataQuery(options);
      const results = await this.fetch(q, null);
      return results;
    }
    async simpleFormCall(options) {
      //const q = this.createFormServiceCall(options);
      const results = await this.fetch(options, null);
      return results;
    }
    // check token and if needed refresh
    async _ensureToken(forceNew) {
      if (this.token && !forceNew) return; // if we have a token and not forcing new
      const response = await http.post(`${this.baseUrl}/tokenrequest`, {
        data: this.credentials,
      }, this.verbose);
      if (response) { // setup user and account info
        this.token = response.userInfo.token;
        this.addressNumber = response.userInfo.addressNumber;
        this.dateFormat = response.userInfo.dateFormat;
        this.userInfo = response.userInfo;
      }

    }
    async getToken(forceNew) {
      await this._ensureToken(forceNew);
      return this.token;
    }
    async logOut(token) {
      console.log("logging out of AIS session..." + token)

      var response = await http.post(`${this.url}/tokenrequest/logout`, {
        token: token,
      }, this.verbose);
      console.log(response);
    }
    // returns users AB number
    async getAddressNumber() {
      await this._ensureToken();
      return this.addressNumber;
    }
    // returns users date format string
    async getDateFormat() {
      await this._ensureToken();
      return this.dateFormat;
    }
    // returns e1 user prefs
    async getUserInfo() {
      await this._ensureToken();
      return this.userInfo;
    }
    constructor({
      username,
      password,
      url,
      deviceName = 'AISCLIENT',
      version = 1,
      verbose = false
    }) {
      this.credentials = {
        username,
        password,
        deviceName,
      };

      this.version = version;
      this.baseUrl = `${url}/jderest`;
      this.url = version > 1 ? `${this.baseUrl}/v${version}` : this.baseUrl;
      this.verbose = verbose;
      this.fetchPage = version < 2 ? this.fetchPageV1 : this.fetchPageV2;
      return this;
    }
  }



  // MAPPER FUNCTIONS
  // dataservice rows mapped to an array 
  // of objects {value,label}
  // good input for oj-select-box and oj-many-select
  self.selectOptionsMapper = (row) => {
    const mapped = [];
    console.log(row)
    Object.keys(row).forEach((field) => {
      // remove the table prefix
      const shortField = field.substring(field.indexOf('_') + 1);
      // remove the MOExist prop
      if (field != 'MOExist') {
        if (field != 'rowIndex') {
          if (typeof row[field].value != 'undefined' || row[field].value != '') {
            mapped.push({
              value: shortField,
              label: row[field].title
            });

          }
        }
      }

    });
    return mapped;
  };

  // map from e1 formservice to form builder JET component
  self.formInfoFieldMapper = (row) => {
    const mapped = [];

    Object.keys(row).forEach((field) => {

      if (field.substring(0, 3) != 'lbl') {
        mapped.push({
          e1id: row[field].id, // AIS input json id
          label: row[field].title, // JDE label / title for field
          dataType: row[field].dataType, // jde datatype cases: 1 & 2 string - 9 numeric - 11 date
          formControlType: row[field].longName.substring(0, 3) // cases: txt - chk - rad
        });

      }

    });
    return mapped;
  };

  // map to take dataservice rows and map to object
  // with props for each col in the data set 
  // expressed as JDE ALIAS DD value
  // good input for oj-table and filter-table
  self.dataFieldMapper = (row) => {
    self.count(self.count() + 1);
    const mapped = {};
    Object.keys(row).forEach((field) => {
      // remove the table prefix
      const shortField = field.substring(field.indexOf('_') + 1);
      // remove the MOExist prop
      if (field != 'MOExist') {
        if (field != 'rowIndex') {
          if (typeof row[field].value != 'undefined' || row[field].value != '') {
            mapped[shortField] = row[field].value;

          }
        }
      }

    });
    mapped.rowIndex = self.count();
    return mapped;
  };

  // default mapper for dataservices
  const simpleFieldMapper = (row) => {
    const mapped = {};
    Object.keys(row).forEach((field) => {
      // remove the table prefix
      const shortField = field.substring(field.indexOf('_') + 1);
      //
      mapped[shortField] = row[field].value;
    });
    return mapped;
  };
  // default mapper for formservices
  const simpleFormMapper = (dataObj) => {
    const mapped = [];

    Object.keys(dataObj).forEach((field) => {
      if (field != 'gridData') {
        let newobj = {
          key: field,
          value: dataObj[field].value
        };
      }
      mapped.push(newobj);
    });
    return mapped;
  };
  // default for mapping header rows
  const titleMapper = (row, columns) => {
    const mapped = {};
    Object.keys(row).forEach((field) => {
      mapped[toCamelCase(columns[field])] = row[field];
    });
    return mapped;
  };
  // helper to adjust strings to use as keys
  const toCamelCase = (str) => {
    str.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
      (index === 0 ? letter.toLowerCase() : letter.toUpperCase())
    ).replace(/\s+/g, '');
  }

})
