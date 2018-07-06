define(['knockout'], function (ko) {
  var Aisclient = function () {
    var self = this;
    self.customFormFields = ko.observableArray([]);
    // blocked: true,
    // debugArray: [],
    // tempArr: [],
    // initFn: "getBrowseForm",
    // rowToUpdate: "",
    // formName: "",
    // errHolder: [],
    // rawholder: [],
    // // adding new flag for MDrop logic
    // isMultiDrop: false,
    self.splitSubForm = function getSecondPart(str) {
      return str.split('_')[1];
    };
    self.stringToBoolean = function (input) {
      if (typeof input === "undefined") {
        return false;
      } else {
        var strInput = input.toString().toLowerCase().trim();
        var isAccepted = strInput === "true" || strInput === "y" || strInput === "yes" || strInput === "1" ? true : false;
        return isAccepted;
      }
    };
    self.genericPromise = function (mySyncFunc) {
      var df = $.Deferred();

      // here execute the function passed in
      // amd resolve when returned async
      //console.log(mySyncFunc)
      df.resolve(mySyncFunc());

      // return the promise
      return df.promise();
    };
    self.getConfig = function () {


      var df = $.Deferred();

      $.ajax({
        url: globals.configUrl,
        dataType: "json",
        type: "GET",
        success: function (data) {
          df.resolve(data);
        },
        error: function () {
          df.resolve(false);
        }
      });

      return df.promise();

    };
    self.getOrchestrations = function () {
      var df = $.Deferred();
      // get E1 creds
      var config = JSON.parse(localStorage.getItem("JDEUser"));
      // make call to E1 for discovery service
      $.ajax({
        url: '//' + config.JDEurl + '/jderest/discover',
        dataType: "json",
        contentType: "application/json",
        type: "POST",
        beforeSend: function (xhr) {
          // set basic aith headers
          xhr.setRequestHeader("Authorization", "Basic " + btoa(config.JDEusername + ":" + config.JDEpassword));
        },
        success: function (data) {
          // resolve with the Orchestrations
          df.resolve(data);
        },
        error: function (er) {
          // console.log(er);
          df.resolve(false);
        }
      });

      return df.promise();
    };
    self.callOrchestration = function (orchName, inputs) {
      globals.isOrchestration = true;
      var df = $.Deferred();
      var processCount = inputs.length;
      var count = 0;
      var summary = {};
      console.log("into callOrchestration...")
      console.log(inputs);
      let insArr = []
      Object.keys(inputs).forEach(function (oneKey) {
        // delete oneRow.ROW

        if (inputs[oneKey] == '__BLANK__') {
          inputs[oneKey] == ' ';
        }
        if (inputs != 'ROW') {
          insArr.push({
            name: oneKey,
            value: inputs[oneKey]
          })

        }
      })
      var ins = {
        inputs: insArr
      };
      var config = JSON.parse(localStorage.getItem("JDEUser"));

      $.ajax({
        url: '//' + config.JDEurl + '/jderest/orchestrator/' + orchName,
        dataType: "json",
        contentType: "application/json",
        type: "POST",
        data: JSON.stringify(ins),
        beforeSend: function (xhr) {
          // set basic aith headers
          xhr.setRequestHeader("Authorization", "Basic " + btoa(config.JDEusername + ":" + config.JDEpassword));
        }
      }).done(function (data) {
        let formKey
        // examples of valid responses found so far...
        // AAAAVoorraad
        // {"Grids":[{"Grid ID":"1","Title":"Work With Item Availability by Location","Row Set":[{"Quantity Available":"1.0","1.10":"0.0","1.9":"0.0"}]}]}
        // InventoryTransfer
        // {"FormRequest1":{"fs_P4113_W4113B":{"title":"Inventory Transfers","data":{"lblTransactionDate_19":{"id":19,"dataType":11,"bsvw":false,"title":"Transaction Date","visible":true,"longName":"lblTransactionDate_19","editable":false,"value":"Transaction Date"},"txtGLDate_18":{"id":18,"internalValue":"1529539200000","dataType":11,"bsvw":true,"title":"G/L Date","staticText":"G/L Date","visible":true,"longName":"txtGLDate_18","editable":true,"value":"21/06/2018"},"lblGLDate_17":{"id":17,"dataType":11,"bsvw":false,"title":"G/L Date","visible":true,"longName":"lblGLDate_17","editable":false,"value":"G/L Date"},"lblDL01_260":{"id":260,"dataType":2,"bsvw":false,"title":"Inventory Transfers","visible":true,"longName":"lblDL01_260","editable":false,"value":"Inventory Transfers"},"txtExplanation_26":{"id":26,"internalValue":"Inventory Transfers","dataType":2,"bsvw":true,"title":"Explanation","staticText":"Explanation","visible":true,"longName":"txtExplanation_26","editable":false,"value":"Inventory Transfers"},"lblExplanation_25":{"id":25,"dataType":2,"bsvw":false,"title":"Explanation","visible":true,"longName":"lblExplanation_25","editable":false,"value":"Explanation"},"txtDocumentType_24":{"id":24,"internalValue":"IT","dataType":2,"bsvw":true,"title":"Document Type","staticText":"Document Type","visible":true,"longName":"txtDocumentType_24","assocDesc":"Inventory Transfers","editable":false,"value":"IT"},"lblDocumentType_23":{"id":23,"dataType":2,"bsvw":false,"title":"Document Type","visible":true,"longName":"lblDocumentType_23","editable":false,"value":"Document Type"},"txtDocumentVoucherInvoiceetc_22":{"id":22,"internalValue":0,"dataType":9,"bsvw":true,"title":"Document Number","staticText":"Document Number","visible":true,"longName":"txtDocumentVoucherInvoiceetc_22","editable":false,"value":"0"},"lblDocumentVoucherInvoiceetc_21":{"id":21,"dataType":9,"bsvw":false,"title":"Document Number","visible":true,"longName":"lblDocumentVoucherInvoiceetc_21","editable":false,"value":"Document Number"},"txtTransDate_20":{"id":20,"internalValue":"1529539200000","dataType":11,"bsvw":true,"title":"Transaction Date","staticText":"Transaction Date","visible":true,"longName":"txtTransDate_20","editable":false,"value":"21/06/2018"},"gridData":{"id":1,"fullGridId":"1","titles":{"col_14":"Item Number","col_243":"Item Description","col_6":"Quantity","col_7":"UM","col_247":"Secondary Quantity","col_246":"Sec UoM","col_215":"From Location","col_42":"From Lot/Serial","col_218":"To Location","col_9":"To Lot Number","col_43":"From Unit Cost","col_44":"From Extended Amount","col_10":"To  Unit Cost","col_11":"To  Extended Amount","col_12":"G/L Date","col_13":"Reason Code"},"rowset":[{"rowIndex":0,"MOExist":false,"sItemNumber_14":{"id":14,"internalValue":"230","dataType":2,"bsvw":false,"title":"Item Number","visible":true,"longName":"sItemNumber_14","editable":true,"value":"230"},"sItemDescription_243":{"id":243,"internalValue":"Youth Sport Bike #7","dataType":2,"bsvw":false,"title":"Item Description","visible":true,"longName":"sItemDescription_243","editable":false,"value":"Youth Sport Bike #7"},"mnQuantity_6":{"id":6,"internalValue":1.00,"dataType":9,"bsvw":true,"title":"Quantity","visible":true,"longName":"mnQuantity_6","editable":true,"dispDec":2,"value":"1.00"},"sUM_7":{"id":7,"internalValue":"EA","dataType":2,"bsvw":true,"title":"UM","visible":true,"longName":"sUM_7","editable":true,"value":"EA"},"mnSecondaryQuantity_247":{"id":247,"internalValue":0,"dataType":9,"bsvw":true,"title":"Secondary Quantity","visible":true,"longName":"mnSecondaryQuantity_247","editable":true,"dispDec":2,"value":"0.00"},"sSecUoM_246":{"id":246,"internalValue":" ","dataType":2,"bsvw":true,"title":"Sec UoM","visible":true,"longName":"sSecUoM_246","editable":true,"value":""},"sFromLocation_215":{"id":215,"internalValue":"__BLANK__","dataType":2,"bsvw":false,"title":"From Location","visible":true,"longName":"sFromLocation_215","editable":true,"value":"__BLANK__"},"sFromLotSerial_42":{"id":42,"internalValue":" ","dataType":2,"bsvw":false,"title":"From Lot/Serial","visible":true,"longName":"sFromLotSerial_42","editable":true,"value":""},"sToLocation_218":{"id":218,"internalValue":"A  1  A","dataType":2,"bsvw":false,"title":"To Location","visible":true,"longName":"sToLocation_218","editable":true,"value":"A  1  A"},"sToLotNumber_9":{"id":9,"internalValue":" ","dataType":2,"bsvw":true,"title":"To Lot Number","visible":true,"longName":"sToLotNumber_9","editable":false,"value":""},"mnFromUnitCost_43":{"id":43,"internalValue":0,"dataType":9,"bsvw":false,"title":"From Unit Cost","visible":true,"longName":"mnFromUnitCost_43","editable":true,"dispDec":4,"value":"0.0000"},"mnFromExtendedAmount_44":{"id":44,"internalValue":0,"dataType":9,"bsvw":false,"title":"From Extended Amount","visible":true,"longName":"mnFromExtendedAmount_44","editable":true,"dispDec":2,"value":"0.00"},"mnToUnitCost_10":{"id":10,"internalValue":0,"dataType":9,"bsvw":true,"title":"To  Unit Cost","visible":true,"longName":"mnToUnitCost_10","editable":false,"dispDec":4,"value":"0.0000"},"mnToExtendedAmount_11":{"id":11,"internalValue":0,"dataType":9,"bsvw":true,"title":"To  Extended Amount","visible":true,"longName":"mnToExtendedAmount_11","editable":false,"dispDec":2,"value":"0.00"},"dtGLDate_12":{"id":12,"internalValue":"1529539200000","dataType":11,"bsvw":true,"title":"G/L Date","visible":true,"longName":"dtGLDate_12","editable":false,"value":"21/06/2018"},"sReasonCode_13":{"id":13,"internalValue":" ","dataType":2,"bsvw":true,"title":"Reason Code","visible":true,"longName":"sReasonCode_13","editable":true,"value":""}}],"summary":{"records":1,"moreRecords":false}},"txtFromBranchPlant_46":{"id":46,"internalValue":"          20","dataType":2,"bsvw":false,"title":"From Branch/Plant","staticText":"From Branch/Plant","visible":true,"longName":"txtFromBranchPlant_46","editable":false,"value":"20"},"lblFromBranchPlant_45":{"id":45,"dataType":2,"bsvw":false,"title":"From Branch/Plant","visible":true,"longName":"lblFromBranchPlant_45","editable":false,"value":"From Branch/Plant"},"lblToBranchPlant_200":{"id":200,"dataType":2,"bsvw":false,"title":"To Branch/Plant","visible":true,"longName":"lblToBranchPlant_200","editable":false,"value":"To Branch/Plant"},"txtToBranchPlant_201":{"id":201,"internalValue":"          20","dataType":2,"bsvw":false,"title":"To Branch/Plant","staticText":"To Branch/Plant","visible":true,"longName":"txtToBranchPlant_201","editable":false,"value":"20"}},"errors":[{"CODE":"3098","TITLE":"Error: Invalid Location Format","ERRORCONTROL":"1.0.13","DESC":"CAUSE. . . . . The location you have entered is not in the correct format.\\u000a               One of the following errors may have occurred:\\u000a                 *  Too many characters were entered.\\u000a                 *  You have not consistently used the separator character to\\u000a                    specify the location components.\\u000aRESOLUTION . . Enter no more than the maximum number of characters for the\\u000a               location field and be sure to consistantly use the separator\\u000a               character throughout the format to specify the location\\u000a               components.  Note that you may also specify a location without\\u000a               using the separator character at all.","MOBILE":"The location you have entered is not in the correct format.\\u000a               One of the following errors may have occurred:\\u000a                 *  Too many characters were entered.\\u000a                 *  You have not consistently used the separator character to\\u000a                    specify the location components."}],"warnings":[]},"stackId":0,"stateId":0,"rid":"","currentApp":"P4113_W4113B_VI0010","timeStamp":"2018-06-21:13.45.11","sysErrors":[]}}
        // ADD on demo.steltix.com
        // {"message":"Orchestration has no output","timeStamp":"2018-06-25:10.34.02"}

        if (data.hasOwnProperty('FormRequest1') && data.hasOwnProperty('message') && data.hasOwnProperty('Grids')) {
          Object.keys(data.FormRequest1).forEach(function (eachKey) {
            if (eachKey != 'stackId' &&
              eachKey != 'stateId' &&
              eachKey != 'rid' &&
              eachKey != 'currentApp' &&
              eachKey != 'timeStamp' &&
              eachKey != 'sysErrors') {
              formKey = eachKey;
              //console.log(formKey);
            }

          })

          console.log(formKey);
          console.log(data);
          if (data.FormRequest1[formKey].errors.length > 0) {
            df.resolve(data.FormRequest1[formKey].errors);
          } else {
            df.resolve(data.FormRequest1);
          }


        } else {
          df.resolve(false);
        }




      })




      return df.promise();
    }
    self.callMultipleOrchestrations = function () {
      // console.log(globals.processQ)
      var inputRow = globals.processQ[0];
      // here we setup the data and call in our loop
      if (globals.processQ.length > 0) {


        self.callOrchestration(globals.formName, inputRow).then(function (data) {

          // globals.processQ.shift()
          if (data != false) {
            
            self.returnFromSuccess()


          } else {
            self.returnFromError();
          }
          

        })




      } else {
        self.cleanUp();
      }

    }
    self.connectionOpen = function () {
      var df = $.Deferred();
      self.getConfig().then(function (resp) {
        if (resp.hasOwnProperty("aisVersion")) {
          df.resolve(true);
        } else {
          df.resolve(false);
        }
      });
      return df.promise();
    };
    self.validateCustomer = function (config) {

      var df = $.Deferred();
      var config = config || {};

      var authObj = {
        "url": config.JDEurl
      }
      $.ajax({
        url: "https://70ficqaixk.execute-api.eu-west-1.amazonaws.com/prod/dzreg",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(authObj),
        success: function (resp) {
          if (resp !== "unregistered") {
            // adding customer name to global object
            globals.customer(resp);
            globals.isFirstTime = false;
          } else if (resp === "unregistered") {
            globals.connStatus.changeStatus(4, "Your domain is not authorised to use dropZone.");
            df.resolve(resp);
          }
        },
        complete: function () {
          globals.customer(config.customer);
          if (config.JDEnoStorage === true) {
            var newConfig = {};
            newConfig.url = config.JDEurl;
            newConfig.customer = config.customer;
            newConfig.JDEnoStorage = config.JDEnoStorage;
            localStorage.setItem("JDEUser", JSON.stringify(newConfig));
          } else {
            localStorage.setItem("JDEUser", JSON.stringify(config));
          }

          df.resolve(globals.customer());
        }
      });

      return df.promise();
    };
    /**
     * Helper function to perform an authentication check against the dropZone server
     * 
     * @method dzAuth
     * @return {object} containing `status` and `data` props
     * 
     * @param {object} [credentials] either pass a token OR a credentials object
     * @param {string} credentials.username
     * @param {string} credentials.password
     * @param {string} [token]
     */

    self.dzAuth = function (auth) {
      var df = $.Deferred();
      var auth = auth || {};
      var url = '';
      if (typeof auth === "string") { // auth is 'token'
        url = '/api/auth?token=' + auth;
      } else { // auth is 
        url = '/api/auth?email=' + encodeURIComponent(auth.username) + '&password=' + auth.password;
      }
      $.ajax({
        type: 'GET',
        url: url,
        success: function (response) {
          df.resolve(response);
        },
        error: function (jqXHR) {
          df.reject(jqXHR);
        }
      });
      return df.promise();
    };
    /**
     * Test if local storage is available
     */
    self.lsTest = function () {
      var test = 'test';
      try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    };

    /**
     * Checks the validity of the token in Local Storage. Updates status box if valid, requests a new token if invalid
     */
    self.preflightTokenCheck = function () {
      var df = $.Deferred();
      globals.stopTokenChecking(true);
      var poJSON = {
        "token": globals.token,
        "applicationName": "P01012",
        "version": "ZJDE0001",
        "deviceName": "dropZone"
      };
      $.ajax({
        url: globals.poUrl,
        //dataType: "json",
        type: "POST",
        data: JSON.stringify(poJSON),
        success: function (data) {
          df.resolve({
            valid: true,
            reason: ""
          });
        },
        error: function (jqXHR, textStatus, errorThrown) {
          df.resolve({
            valid: false,
            reason: "invalid"
          });
        }
      });
      return df.promise();
    };

    self.checkToken = function (config) {

      var df = $.Deferred();
      // redo this for v3

      if (config.JDEnoStorage !== true) {
        aisConfig = JSON.parse(localStorage.getItem("aisConfig"));
        userInfo = JSON.parse(localStorage.getItem("userInfo"));
      }
      var expiryTime;
      if (aisConfig && aisConfig.tokenExpires) {
        expiryTime = aisConfig.tokenExpires;
      } else {
        expiryTime = globals.tokenExpires; // get expiry time from local storage or cache (for E1 Composte Pages compatibility)
      }
      var connOpen;
      var stillValid = moment().isBefore(moment(expiryTime).subtract(1, 'minutes')); // is NOW before the token expiry (with a buffer of 1 minute)?
      self.connectionOpen().then(function (isOpen) {
        if (isOpen === false) {
          globals.connectedToE1(false);
          df.resolve({
            valid: false,
            reason: "connection"
          });
        } else if (isOpen === true && stillValid === true && aisConfig.tokenAssocUrl === config.JDEurl && userInfo.username.toLowerCase() === config.JDEusername.toLowerCase()) {
          // if token is still valid and associated with the currently requested environemnt, cache it for dropZone's use
          globals.token = userInfo.token;
          globals.user = userInfo;
          self.setDateFormat(userInfo);
          globals.connectedToE1(true);
          df.resolve({
            valid: true,
            reason: ""
          });
        } else { // if token is invalid or not present, request a new one
          globals.connectedToE1(false);
          df.resolve({
            valid: false,
            reason: "invalid"
          });
        }
      });
      // } else {
      //  console.log("localStorage is unavailable");
      //     df.resolve({valid: false, reason: "noLocalStorage"});
      // }
      return df.promise();
    };

    self.setDateFormat = function (userInfo) {
      globals.simpleDateFormat = userInfo.simpleDateFormat.toUpperCase(); // for Moment recognition
      if (userInfo.dateSeperator == "-") {
        globals.dateFormat = "DD-MM-YY";
        globals.now = moment().format("DD-MM-YY");
        globals.oneDayAgo = moment().subtract(1, 'days').format("DD-MM-YY");
        globals.twoDaysAgo = moment().subtract(2, 'days').format("DD-MM-YY");

      } else if (userInfo.dateSeperator == "/" && userInfo.simpleDateFormat == "dd/MM/yy") {
        globals.dateFormat = "DD/MM/YY";
        globals.now = moment().format("DD/MM/YY");
        globals.oneDayAgo = moment().subtract(1, 'days').format("DD/MM/YY");
        globals.twoDaysAgo = moment().subtract(2, 'days').format("DD/MM/YY");

      } else {
        globals.dateFormat = "L";
        globals.now = moment().format("L");
        globals.oneDayAgo = moment().subtract(1, 'days').format("L");
        globals.twoDaysAgo = moment().subtract(2, 'days').format("L");
      }
    };

    /**
     * Fetches a new token
     */
    self.getToken = function (options) {
      console.log(globals.legacyMode())
      if (globals.legacyMode()) {
        $.ajaxSetup({
          contentType: 'application/x-www-form-urlencoded'
        });
      } else {
        $.ajaxSetup({
          contentType: 'application/json',
          //error: ajaxErrDefaults
        });
      }
      var tokenPromise = $.Deferred();

      var tokenRequestJSON = {
        "deviceName": "dropZone"
      };
      var config = JSON.parse(localStorage.getItem("JDEUser"));
      tokenRequestJSON.username = config.JDEusername;
      tokenRequestJSON.password = config.JDEpassword;

      globals.stopTokenChecking(false);

      $.ajax({
        url: globals.tokenUrl,
        //dataType: "json",
        type: "POST",
        //contentType: 'application/x-www-form-urlencoded',
        //contentType: "application/json",
        data: JSON.stringify(tokenRequestJSON),
        success: function (data) {
          userInfo = data.userInfo;
          userInfo.env = data.environment;
          userInfo.username = config.JDEusername;
          globals.token = userInfo.token;
          globals.user = userInfo;
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          globals.stopTokenChecking(false);
          self.setDateFormat(userInfo);
          self.getConfig().then(function (configData) {
            aisConfig = configData;
            aisConfig.tokenExpires = moment().add(parseInt(aisConfig.sessionTimeout) + 70, 'days'); // stamp the expiry time
            aisConfig.tokenAssocUrl = config.JDEurl; // stamp the E1 Url that the current token is associated with
            globals.tokenExpires = aisConfig.tokenExpires; // stamp the expiry time to memory, necessary for E1 Composite Page
            localStorage.setItem("aisConfig", JSON.stringify(aisConfig));
          });
          if (options && options.suppressOutput === true) {} else {
            self.statusConnect(config, userInfo);
          }
          globals.connectedToE1(true);
          ga('send', 'event', {
            eventCategory: 'dropZone V3',
            eventAction: 'loginSuccess',
            eventLabel: globals.dzUser().organisation.name + ',' + moment().format() + ',[customer,date]'
          });
          tokenPromise.resolve();
        },
        error: function (jqXHR, textStatus, errorThrown) {
          globals.stopTokenChecking(true);
          if (jqXHR.status === 403) {
            globals.connStatus.changeStatus(0, "JDE credentials invalid. Please try connect again with your valid JDE username and password.");
          } else if (jqXHR.status === 415) {
            globals.connStatus.changeStatus(0, errorThrown + " - if you're using Tools Release 9.2.0.5, please try logging into dropZone <a href='http://dropzone.steltix.com/dz99/dropZone.html'>here</a>");
          } else {
            globals.connStatus.changeStatus(0, (errorThrown || "Unknown error") + " - Please see the JavaScript Console for error details");
          }
          tokenPromise.reject();
        }
      });
      return tokenPromise.promise();
    };
    /**
     * Check the token validity every 10 seconds
     */
    self.tokenIntervalCheck = function (config) {
      if (globals.stopTokenChecking() === false) {
        setTimeout(function () {
          // then check token validity (MAKE SURE that the token is per E1 Url!!!) ******
          self.checkToken(config).then(function (validObj) {
            if (validObj.valid === true) {
              var userInfo = JSON.parse(localStorage.getItem("userInfo"));
              self.statusConnect(config, userInfo);
              if (globals.stopTokenChecking() === false) {
                self.tokenIntervalCheck(config);
              }
            } else if (validObj.valid === false && validObj.reason === "connection") {
              globals.connStatus.changeStatus(0, "There's a problem with your internet or VPN connection. Please reconnect and log in again.");
              globals.connectedToE1(false);
            } else {
              globals.connStatus.changeStatus(0, "Your dropZone session has timed out. Please Log In to begin a new session.");
              globals.stopTokenChecking(true);
              globals.connectedToE1(false);
            }
          });
        }, 10000);
      };

    };
    /**
     * Call when updating the status to "Connected", in particular for use with a token request
     * @param {object} userInfo property of the AIS default config object (<host>/jderest/defaultconfig)
     */
    self.statusConnect = function (config, userInfo) {
      //var uInfo = globals.user; // named uInfo so that it doesn't clash with other variables in the scope
      //var cInfo = JSON.parse(localStorage.getItem("JDEUser"));
      globals.e1Env(userInfo.env);
      var statusBox = document.getElementById('connLabel');
      if (statusBox !== null) {
        globals.connStatus.changeStatus(1, 'You are <b>' + config.JDEusername + '</b> at <b>' + config.JDEurl + '</b>, logged into E1 environment <b>' + userInfo.env + '</b>');
      }
    };

    /**
     * Requests a form from AIS
     * @param {string} mode - "appstack" or "formrequest" for type of request
     * @param {object} JSON - the JSON object to submit to AIS
     */
    self.getForm = function (mode, jsonData) {
      if (globals.legacyMode()) {
        $.ajaxSetup({
          contentType: 'application/x-www-form-urlencoded'
        });
      } else {
        $.ajaxSetup({
          contentType: 'application/json',
          //error: ajaxErrDefaults
        });
      }
      var df = $.Deferred()
      var url;
      switch (mode) {
        case "appstack":
          url = globals.batchUrl;
          break;
        case "formrequest":
          url = globals.formUrl;
          break;
        case "mediaUpdate":
          url = globals.mediaUpdateUrl;
          break;
        case "mediaAdd":
          url = globals.mediaAddUrl;
          break;
        case "batchrequest":
          url = globals.batchRequestUrl;
          break;
        case "mediaGet":
          url = globals.mediaGetUrl;
          break;
        case "discover":
          url = globals.discover;
          break;
        default:
          url = globals.formUrl;
      }
      // if appStack then add url
      if (mode.toLowerCase() == 'appstack') {
        url = globals.batchUrl;
      }
      // function Timer(promise) {
      //     var self = this;
      //     this.start = function() {
      //         self.startTime = moment();
      //     };
      //     this.checkTime = function() { // returns moment in 7 seconds' time
      //         return function() {
      //             setTimeout(function() {
      //                 return moment();
      //             }, 7000);
      //         }
      //     }
      //     setTimeout(function() {
      //         if (promise.state() === "pending") {
      //             alertInit("The E1 server is taking long to respond. Would you like to <a href=\"#\" class=\"cancel\">cancel</a> this row and move onto the next one?");
      //         }
      //     }, 7000);
      // }
      var delay;
      $.ajax({
        url: url,
        //dataType: "json",
        type: "POST",
        timeout: 30000,
        data: JSON.stringify(jsonData),
        beforeSend: function () {
          delay = $.Deferred();
          setTimeout(function () {
            if (delay.state() === "pending") {
              globals.alerts.cancelCTA(true) // show "Cancel" CTA
              // attach alert action
              if (mode.toLowerCase() == 'appstack') {
                globals.alerts.action = function () {
                  if (delay.state() === "pending") { // accounts for the request arriving after the alert is shown but before the user clicks "Cancel"
                    globals.alerts.action = function () {};
                    self.postError("Row cancelled by user");
                    self.returnFromError({
                      closeSession: false
                    });
                  }
                }
              }
              globals.controls.cancelRow(true);
              alertInit("Form " + globals.formNAME + " and row " + globals.inputRow.ROW + ": There seems to be a delay in the airwaves. Would you like to cancel this row and move onto the next one?", null, "warning");
            }
          }, 8000);
          delay.done(function () {
            alertClose();
          });
        },
        success: function (data) {

          jsonData = {};
          delay.resolve();

          // if appStack cache state, stack and rid
          if (mode.toLowerCase() === 'appstack') {

            globals.stackid = data.stackId;
            globals.stateid = data.stateId;
            globals.rid = data.rid;

          }

          if (globals.debug.debugMode() === true) {
            globals.debug.current.push(data);
          }
          df.resolve(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          delay.resolve();

          if (jqXHR.status === 200 && jqXHR.responseText === "") {
            df.resolve("no_response");
          } else if (jqXHR.status === 500) {
            if (jqXHR.hasOwnProperty("responseJSON") && jqXHR.responseJSON.hasOwnProperty("sysErrors")) {
              df.resolve("500");
            } else if (jqXHR.hasOwnProperty("responseJSON")) {
              self.postError("Response: 500. Exception: " + jqXHR.responseJSON.exception + ". Message: " + jqXHR.responseJSON.message);
              self.returnFromError(globals.closeObj);
            } else {
              df.resolve("500");
            }
          } else if (jqXHR.status === 444) {
            // do something
            // reload dropZone, display an alert message upon reload
          } else {
            self.postError(jqXHR.responseText || "There was no response or the request timed out");
            self.returnFromError();
          }
        }
      });
      // return a promise and resolve in one of the above conditions
      return df.promise();

    };
    /**
     * Helper function to convert the Excel inputs into AIS-ready objects for insertion into the formActions array
     *
     * @method filterBlank
     * @return {string} returns empty string for a blank value, or trimmed string for a truthy value
     *
     * @param {string} input Excel input
     */
    self.filterBlank = function (input) {
      //var value = input.toString().toLowerCase().trim() || input;
      if (input && input.toString().toLowerCase().trim() === "___blank___") {
        return "";
      } else {
        return input;
      }
    };
    /**
     * Builds the JSON for submission to AIS's appstack service
     *
     * @method buildAppstackJSON
     * @return {object} request object formatted for the appstack AIS service
     *
     * @param {object} options
     * @param {string} options.form e.g. `"P4101_W4101A"` for type: `"open"` requests, `"W4101A"` for type: `"close"`/`"execute"` requests.
     * @param {string} [options.type="execute"] Alternatively, `"open"` or `"close"`.
     * @param {boolean} [options.dynamic=false] Set to `true` to search the excel inputs and adds dynamically generated non-grid fields, i.e. those beginning with `"txt"`, `"chk"`, `"rad"`.
     * @param {boolean} [options.gridAdd=false] Searches the excel inpus for dynamically generated grid fields (those beginning with `"grid_"`) and adds them to a new grid row.
     * @param {boolean} [options.gridAddMultiple=false] Searches the excel inpus for dynamically generated grid fields (those beginning with `"grid_"`) and updates a grid row, the row specified by `options.rowToSelect`.
     * @param {boolean} [options.gridUpdate=false] Searches the excel input for dynamically generated grid fields (those beginning with `"grid_"`) and updates the matched grid row with them.
     * @param {number} [options.rowToSelect=0] Row index of the row to update. Use with `gridUpdate: true`
     * @param {boolean} [options.gridMultiple=false] If multiple grid rows are matched and their row indices passed (see `options.gridMultipleIndices`), all matched rows are updated accordingly. A usage example would be multiple sequence steps at a given work centre in Routing Operations (P3003_W3003B).
     * @param {array} [options.gridMultipleIndices] Contains the zero-indexed indices of all the rows that need to be updated in this step (i.e. > 1 JDE grid rows will be updated by the same Excel row). gridMultiple has to be set to `true`.
     * @param {boolean} [options.customGrid=false] Set to `true` to be able pass custom grid inputs.
     * @param {boolean} [options.turbo] Sets request.outputType to `"GRID_DATA"`. This produces the leanest response possible. NOTE: It is formatted completely differently to the regular response.
     * @param {boolean} [options.returnControlIDs=false] If set to `true`, Control IDs of the dynamic fields are passed with the request in order to return only those fields in the response.
     * @param {string} [options.returnControlIDs] You can also preformat the returnControlIDs string. A non-empty string will take precedence over dynamically generated values.
     * @param {string} [options.appendControlIDs] Append this string to a dynamically generated returnControlIDs string. Use it in conjunction with `returnControlIDs: true`
     * @param {string} [options.findOnEntry] Set to `"TRUE"` to add that property to the request.
     * @param {string} [options.aliasNaming] Set to `true` to add that property to the request.
     * @param {object} [...staticInput] Static inputs. `options.dynamic` must be `true`
     * @param {string} [staticInput.0] Control ID or QBE value
     * @param {string} [staticInput.1] Value, e.g. inputRow.LITM
     * @param {object} [...customGridInput] Array of three strings. `options.customGrid` and either of options.gridAdd, options.gridAddMultiple, options.gridUpdate, options.gridMultiple must be `true`
     * @param {string} [customGridInput.0] Must be `"grid"`
     * @param {string} [customGridInput.1] Control ID
     * @param {string} [customGridInput.2] Value, e.g. inputRow.LITM
     * @param {boolean} [options.suppressDynamicGrid=false] Set to `true` to only submit custom grid values.
     * @param {object} [...formInputs] Typically used to pass form interconnects in open requests
     * @param {string} [formInputs.0] Must be `"input"`
     * @param {string} [formInputs.1] Control ID
     * @param {string} [formInputs.2] Value, e.g. inputRow.LITM
     * @param {string} [...buttons] Pass in the controlID or form interconnect ID and a button will be generated, e.g. `"4"` becomes 
     *		`{
     *			"command: "DoAction",
     *			"controlID":"4"
     *		}`.
     * @param {string} [radio] Passing in the string `"1.0"` produces the code to select the first row.
     */
    self.buildAppstackJSON = function (opts) {
      var options = {
        formName: opts.form,
        type: opts.type || "execute",
        dynamic: opts.dynamic || false,
        grid: opts.grid || false,
        gridAdd: opts.gridAdd || false,
        gridAddMultiple: opts.gridAddMultiple || false,
        gridUpdate: opts.gridUpdate || false,
        rowToSelect: opts.rowToSelect || 0,
        gridMultiple: opts.gridMultiple || false,
        gridMultipleIndices: opts.gridMultipleIndices || [],
        findOnEntry: opts.findOnEntry || "FALSE",
        customGrid: opts.customGrid || false,
        suppressDynamicGrid: opts.suppressDynamicGrid || false,
        turbo: opts.turbo || false,
        stopOnWarning: opts.stopOnWarning || true
      };
      // set up returnControlIDs
      if (opts.returnControlIDs && opts.returnControlIDs === true) { // if opts.returnControlIDs exists and is set to true, dynamically generate RCIs. If string, place that string directly into the property
        options.returnControlIDs = self.returnControlIDs(globals.inputRow);
        options.appendControlIDs = opts.appendControlIDs || ""; // set default to prevent "undefined" being added to the RCIs string
        if (options.appendControlIDs.length !== 0) { // if there are RCIs to append
          if (options.returnControlIDs.length !== 0) { // if there are any existing RCIs, use a comma
            options.returnControlIDs += "," + options.appendControlIDs;
          } else if (options.returnControlIDs.length === 0) { // else don't use a comma
            options.returnControlIDs = options.appendControlIDs;
          }
        }
      } else if (opts.returnControlIDs && typeof opts.returnControlIDs === "string") { // just use the supplied RCI string
        options.returnControlIDs = opts.returnControlIDs;
      }
      var nJson = {}; // holder structure for json
      nJson.deviceName = 'dropZone';
      nJson.token = globals.token;
      nJson.action = options.type;
      if (opts.findOnEntry) {
        nJson.findOnEntry = options.findOnEntry;
      }
      if (opts.aliasNaming && opts.aliasNaming === true) {
        nJson.aliasNaming = true;
      }
      if (options.turbo === true) {
        nJson.outputType = "GRID_DATA";
      }
      if (options.dynamic === true) {
        var dynamicActions = self.getDynamicActions(globals.htmlInputs);
      } else {
        var dynamicActions = [];
      }
      var gridActions = [];
      var staticActionsArr = self.addActions(arguments);

      // then add static inputs such as button presses

      if (options.type.trim().toLowerCase() === "open") {
        nJson.formRequest = {};
        nJson.formRequest.version = globals.version;
        nJson.formRequest.formName = options.formName;
        if (opts.returnControlIDs) {
          nJson.formRequest.returnControlIDs = options.returnControlIDs;
        };
        nJson.formRequest.formActions = [].concat(staticActionsArr[0]).concat(staticActionsArr[1]);
        nJson.formRequest.formInputs = [].concat(self.addInputs(arguments)) || [];

      } else if (options.type.toLowerCase() === "execute" || options.type.toLowerCase() === "close") {
        nJson.actionRequest = {};
        nJson.actionRequest.formOID = options.formName;
        if (options.returnControlIDs) {
          nJson.actionRequest.returnControlIDs = options.returnControlIDs;
        }
        // add grid stuff
        if (options.gridAdd || options.gridUpdate || options.gridAddMultiple || options.gridMultiple) {
          var gridInsert = {};
          if (options.gridAdd === true) {
            gridInsert = {
              "gridAction": {
                "gridID": "1",
                "gridRowInsertEvents": [{
                  "gridColumnEvents": self.getGridActions(options.customGrid, opts.suppressDynamicGrid, arguments)
                }]
              }
            };
          } else if (options.gridAddMultiple === true) {
            gridInsert = {
              "gridAction": {
                "gridID": "1",
                "gridRowInsertEvents": []
              }
            };
            var gridInputArr = [];
            for (var i = 0; i < globals.processQ.length; i++) {
              $.each(globals.processQ[i], function (i, o) {
                if (i.substring(0, 4) === "grid") {
                  gridColArr = i.split("_"); // column ID is last item in the array for V3
                  gridInputArr.push({
                    "command": "SetGridCellValue",
                    "columnID": gridColArr[gridColArr.length - 1] /* i.split("_")[2]*/ ,
                    "value": self.filterBlank(o)
                  });
                }
              });
              gridInsert.gridAction.gridRowInsertEvents.push({
                "gridColumnEvents": gridInputArr
              });
              gridInputArr = [];
            }
          } else if (options.gridUpdate === true) {
            var gridInsert = {};
            gridInsert = {
              "gridAction": {
                "gridID": "1",
                "gridRowUpdateEvents": []
              }
            };
            if (options.gridMultiple) {
              $.each(options.gridMultipleIndices, function (i, o) {
                gridInsert.gridAction.gridRowUpdateEvents.push({
                  "rowNumber": o,
                  "gridColumnEvents": self.getGridActions(options.customGrid, opts.suppressDynamicGrid, arguments)
                });
              });
            } else {
              gridInsert.gridAction.gridRowUpdateEvents.push({
                "rowNumber": options.rowToSelect,
                "gridColumnEvents": self.getGridActions(options.customGrid, opts.suppressDynamicGrid, arguments)
              });
            }
          }
          dynamicActions.push(gridInsert);
          // add custom grid fields
        }

        nJson.actionRequest.formActions = [].concat(staticActionsArr[0]).concat(dynamicActions).concat(staticActionsArr[1]);
        nJson.stackId = globals.stackid;
        nJson.stateId = globals.stateid;
        nJson.rid = globals.rid;
      }
      return nJson;
    };
    /**
     *
     * @method addInputs
     * @return {array} array of objects to be included in the formInputs property of appstack and formrequest AIS calls
     *
     * @param {array} [...inputs] Arrays where the first index is "input", 2nd index is the AIS ID, 3rd index is the value
     **/
    self.addInputs = function () {
      var inputArr = [];
      var args = arguments[0];
      for (var i = 1; i < args.length; i++) {
        if (typeof args[i][0] === "string" && args[i][0].toLowerCase() === "input") {
          inputArr.push({
            "id": args[i][1],
            "value": self.filterBlank(args[i][2])
          })
        }
      }
      return inputArr;
    };
    /**
     * Builds the string for the returnControlIDs property of the request object. Used by AISCLIENT.buildAppstackJSON()
     *
     * @method returnControlIDs
     * @return {string} correctly formatted returnControlIDs property
     *
     * @param {object} [inputObj] The object containing all the Excel inputs. Typically, inputObj
     * @param {string} [...params] IDs of hard-coded fields to be formatted
     **/
    self.returnControlIDs = function (inputObj) {
      var str = "";
      var strArr = [];
      for (var i = 1; i < arguments.length; i++) {
        strArr.push(arguments[i]);
      };
      $.each(inputObj, function (i, o) {
        var title = i.substring(0, 3)
        if (title === "txt" || title === "rad" || title === "chk") {
          var titleArr = i.split("_");
          var id = titleArr[titleArr.length - 1];
          strArr.push(id);
        };
      });
      str = strArr.join("|");
      return str;
    };
    /**
     * Builds the JSON for submission to AIS's media object service
     *
     * @method buildMediaJSON
     * @return {object} Request object
     *
     * @param {object} options
     * @param {string} options.form Form name, e.g. P4101_W4101A
     * @param {string} [options.service=updatetext] - default: updatetext. Alternatively, gettext
     * @param {string} options.moStructure Media Object structure
     * @param {string} options.moKey Key ot Media Object structure
     **/
    self.buildMediaJSON = function (opts) {
      var options = {};
      options.service = opts.service || "updatetext";
      options.formName = opts.form || "";
      options.moStructure = opts.moStructure || "";
      options.moKey = opts.moKey || [];

      var nJson = {};
      nJson.token = globals.token;
      nJson.moStructure = options.moStructure;
      nJson.moKey = options.moKey;
      nJson.formName = options.formName;
      nJson.version = globals.version;
      nJson.deviceName = "dropZone";
      nJson.appendText = false;
      nJson.inputText = arguments[1];
      if (options.service.toLowerCase() === "updatetext") {
        nJson.inputText = arguments[1];
        nJson.appendText = false;
      }
      return nJson;
    };
    /**
     *
     * Helper method used to add static actions to the request object
     *
     * @method addActions
     * @return {array} An array containing two action request objects. This first object is prepended to the actionRequest array, the second object is appended to the actionRequest array.
     *
     * @param {object} [inputs] Array. Each array produces one input request object
     * @param {string} [input.[0]] AIS ID
     * @param {string} [input.[1]] Field value
     * @param {string} [...instructions] e.g. `"1.0"` to select the first row, `"4"` to effect the clicking of a button of AIS ID 4, `"1square-bracket5square-bracket"` to enter a QBE value of AIS ID 5.
     * 
     */
    self.addActions = function () { // adds actions passed in as arguments from the specific JDE process code. Examples: buttons, row selects, row exits
      var beginActions = [],
        endActions = [],
        actionArr = [];
      var args = arguments[0];
      for (var i = 1; i < args.length; i++) {
        var item = args[i];
        if (Array.isArray(item) && item[0].trim().toLowerCase() !== "input" && item[0].trim().toLowerCase() !== "grid" && item[1] !== undefined) { // if not an array, then it's a button

          if (item[0].search(/[\[\]]/) !== -1) { // it's a QBE field if there are square brackets in the control ID
            beginActions.push({
              "command": "SetQBEValue",
              "controlID": item[0],
              "value": self.filterBlank(item[1])
            });
          } else {
            beginActions.push({
              "command": "SetControlValue",
              "controlID": item[0],
              "value": self.filterBlank(item[1])
            });
          }
        } else if (typeof item === "string" && item.search(/\./) === -1) {
          endActions.push({
            "command": "DoAction",
            "controlID": item
          });
        } else if (typeof item === "string" && item.search(/\./) !== -1) { // it's a select row instruction if there is a period in the control ID
          endActions.push({ // move this out of array syntax
            "command": "SelectRow",
            "controlID": item
          });
        }
      }
      actionArr[0] = beginActions;
      actionArr[1] = endActions;
      return actionArr;
    };

    /**
     * builds JSON for a single formServiceRequest
     *
     * @method buildFormRequestJSON
     * @return {object} Request JSON
     *
     * @param {object} opts
     * @param {string} opts.form Form Code, e.g. "P4972_W4972I"
     * @param {boolean} [options.dynamic=false] Set to `true` to add the Excel inputs from dynamically generate fields
     * @param {object} [...inputs] Arrays where the first index is "input", 2nd index is the AIS ID, 3rd index is the value
     */
    self.buildFormRequestJSON = function (opts) {
      var options = {};
      options.form = opts.form || "";
      options.dynamic = opts.dynamic || false;

      var formRequestJSON = {};
      formRequestJSON.formName = opts.form;
      formRequestJSON.version = globals.version;
      formRequestJSON.deviceName = 'dropZone';
      var staticActionsArr = self.addActions(arguments);
      if (options.dynamic) {
        formRequestJSON.formActions = [].concat(staticActionsArr[0]).concat(self.getDynamicActions(arguments)).concat(staticActionsArr[1])
      } else {
        formRequestJSON.formActions = [].concat(staticActionsArr[0]).concat(staticActionsArr[1]);
      }
      formRequestJSON.formInputs = [].concat(self.addInputs(arguments));
      formRequestJSON.token = globals.token;

      return formRequestJSON;

    };

    self.removeDuplicateRows = function ($table) {
      var htmlTable = '';
      var htmlArr = [];
      $table.find('tr').each(function (index, row) {
        var rowTD = row.innerHTML;
        var rowTDClean = rowTD.replace(globals.formNAME, '');
        if (htmlArr.indexOf(rowTDClean) === -1) {
          htmlTable += '<tr>' + rowTD + '</tr>';
          htmlArr.push(rowTDClean);
        }
      });

      $table.empty();
      $table.append(htmlTable);
    }

    /**
     * Compares globals.inputRow (Excel Inputs) with globals.htmlInputs (cached, from JDE) to generate inputs from template fields that were dynamically generated by dropZone (and have values submitted by the user)
     *
     * @method getDynamicActions
     * @return {array} array of input objects for the formActions property of AIS appstack or formrequest request objects
     *
     */
    self.getDynamicActions = function () {

      var dynamicActionsArr = [];
      var inputRow = globals.inputRow;
      $.each(inputRow, function (key, value) {
        var foundMatch = false,
          nameArr = key.split("__");
        /* Look for match to exclude non-dunamic inputs, e.g. grid inputs or required field */
        if (nameArr[0] == "txt" || nameArr[0] == "rad") { //for text and radio inputs
          var command = "SetControlValue";
          foundMatch = true;
        } else if (nameArr[0] == "chk") { // for checkboxes
          var command = "SetCheckboxValue";
          foundMatch = true;
        }
        if (foundMatch === true) {
          var reqElement = {
            "command": command,
            "controlID": nameArr[3],
            "value": self.filterBlank(value)
          };
          dynamicActionsArr.push(reqElement);
        }
      });
      return dynamicActionsArr;
    };
    self.getGridActions = function (customGrid, suppressDynamicGrid, args) {

      var gridInputArr = [];
      if (suppressDynamicGrid !== true) {
        $.each(globals.inputRow, function (key, value) {
          if (key.substring(0, 4) === "grid" && value) {
            gridInputArr.push({
              "command": "SetGridCellValue",
              "columnID": key.split("__")[3],
              "value": self.filterBlank(value)
            });
          }
        });
      }
      if (customGrid === true) {
        for (var i = 0; i < args.length; i++) {
          if (args[i][0] && args[i][0].trim().toLowerCase() === "grid" && args[i][2]) {
            gridInputArr.push({
              "command": "SetGridCellValue",
              "columnID": args[i][1].trim(),
              "value": self.filterBlank(args[i][2])
            });
          };
        };
      }
      return gridInputArr;
    };
    /**
     * Matches error data from JDE to the form inputs to give error feedback to the user
     * @param {object} aisErrObj - error data from AIS
     * @param {string} errType - error or warning
     * @param {boolean} isGrid - suppresses field title in UI feedback, because JDE doesn't give specific grid error feedback
     * @param {string} options.moStructure - Media Object structure
     * @param {string} options.moKey - key ot Media Object structure
     **/
    self.getErrorMsgs = function (aisErrObj, errType, isGrid) { // refactor to comply with the parameter convention (data,options)
      var type;
      if (errType && errType.toLowerCase().search(/warn/) !== -1) {
        type = "Warning";
      } else {
        type = "Error";
      }
      var errArr = [];
      if (isGrid) { // for grids
        var gridTitleArr = [];
        var titleArr = [];
        for (key in globals.titleList) {
          gridTitleArr.push(globals.titleList[key]);
        };
        for (key in globals.htmlInputs) {
          if (key.substr(0, 3) === "txt" || key.substr(0, 3) === "chk" || key.substr(0, 3) === "rad") {
            titleArr.push({
              title: globals.htmlInputs[key].title,
              id: globals.htmlInputs[key].id
            });
          }
        };
        $.each(aisErrObj, function (i, errObj) {
          var title;
          if (errObj.ERRORCONTROL.search(/\./) === -1) { // for non-grid errors
            for (var i = 0; i < titleArr.length; i++) {
              if (errObj.ERRORCONTROL == titleArr[i].id) { // we've found a match by IDs, cache the title
                title = titleArr[i].title;
              }
            }
          } else { // for grid errors
            var idArr = errObj.ERRORCONTROL.split(".");
            title = gridTitleArr[parseInt(idArr[2])] || gridTitleArr[parseInt(idArr[1])] || gridTitleArr[parseInt(idArr[0])];
          }
          errArr.push({
            title: title,
            msg: self.replaceUnicode(errObj.MOBILE) || self.replaceUnicode(errObj.TITLE)
          });
        });
      } else { // for non-grids
        $.each(aisErrObj, function (i, o) {
          errArr.push({
            id: o.ERRORCONTROL,
            msg: self.replaceUnicode(o.MOBILE)
          });
        });
        $.each(globals.htmlInputs, function (i, o) { // loops through input objects reveived from AIS
          $.each(errArr, function (i2, o2) {
            if (o2.id == o.id) {
              errArr[i2].title = o.title;
            };
          });
        });
      }
      $.each(errArr, function (i, o) {
        $("#rawHolder table:last").find("." + globals.inputRow.ROW).append("<td>Field: " + o.title + ", message: " + o.msg + "</td>");
        errorLog.unshift({
          type: type,
          row: globals.inputRow.ROW,
          title: o.title,
          msg: o.msg,
          form: formNamesArray()[currentFormIndex()],
        });
      });
      processLog.unshift("Row " + globals.inputRow.ROW + " - JDE errors found. See the Error Log for more details");
    };

    /**
     * Helper function to filter out unicode codes and replace them with the relevant characters
     *
     * @method replaceUnicode
     * @return {string} Error message with unicode strings replaced with their character representations
     *
     * @param {string} input Unfiltered string
     */
    self.replaceUnicode = function (msg) {
        var newString = msg.replace(/\\u0027/g, "\"").replace(/\\u000a/g, "\n");
        return newString;
      },
      self.successOrFail = function (data, opts, param1) {
        var options = {};
        options.successMsg = opts.successMsg || "";
        options.isGrid = opts.isGrid || false;
        options.cb = opts.successCb || self.returnFromSuccess;
        options.closeObj = globals.closeObj || opts.closeObj || {};
        var formDataObj;
        $.each(data, function (i, o) {
          if (i.search("fs_") !== -1) {
            formDataObj = o;
          };
        });
        var errObj = formDataObj.errors;
        if (errObj.length > 0) {
          self.getErrorMsgs(errObj, "Error", options.isGrid);
          self.returnFromError(options.closeObj);
        } else {
          self.postSuccess(options.successMsg);
          options.cb(param1);
        }
      },
      self.postSuccess = function (msg) {
        // $("#dataHolder table").prepend("<tr class=row" + globals.inputRow.ROW + "><td>Form " + formNamesArray()[currentFormIndex()] + " and Row " + globals.inputRow.ROW + " - " + msg + ".</td></tr>");
        processLog.unshift("Row " + globals.inputRow.ROW + " - " + msg);
      };
    self.postError = function (msg) {
      processLog.unshift("Row " + globals.inputRow.ROW + " - See error log for details");
      $("#rawHolder table:last").find("." + globals.inputRow.ROW).append("<td>" + msg + "</td>");
      errorLog.unshift({
        type: "Custom",
        row: globals.inputRow.ROW,
        title: null,
        msg: msg,
        form: formNamesArray()[currentFormIndex()],
      });
      // $("#dataHolder table").prepend("<tr><td>Error on Form " + formNamesArray()[currentFormIndex()] + " and Row " + globals.inputRow.ROW + " - " + msg + "</td></tr>");
    };
    self.pushToArray = function (fromArray, toArray) {
      $.each(fromArray, function (index, object) {
        toArray.push(object);
      });
    };

    // E1 PROCESSES
    self.returnFromSuccess = function () {
      //self.pushToArray(globals.debug.current, globals.debug.previous);
      //globals.debug.current = [];
      processedRows(processedRows() + 1);
      timePerRow.push(moment().diff(timeRowBegins(), 'milliseconds'));
      timeRowBegins(moment());
      globals.processQ.shift();
      var currentRawTable = $('#rawHolder').find('table#' + formNamesArray()[currentFormIndex()]);
      if (globals.inputRow) {
        $(currentRawTable).find("tr." + globals.inputRow.ROW).remove();
        if (globals.processQ.length > 0) {
          processLog.unshift("Row " + globals.inputRow.ROW + " - COMPLETE");
          if (!globals.isOrchestration) {
          self.initFn(globals.processQ[0]);
          } else {
            self.callMultipleOrchestrations();
          }
        } else {
          self.cleanUp();
        }
      }


    };

    // E1 PROCESSES
    self.returnFromError = function (opts) {
      //self.pushToArray(globals.debug.current, globals.debug.previous);
      //globals.debug.current = [];
      var options = opts || {};
      options.subForm = options.subForm || false;
      options.closeID = options.closeID || "";
      options.closeSession = options.closeSession || true;

      function handleErrors() {
        errorRows(errorRows() + 1);
        processedRows(processedRows() + 1);

        globals.processQ.shift();

        timePerRow.push(moment().diff(timeRowBegins(), 'milliseconds')); // add the time in seconds of the previous row's drop to the relevant array
        timeRowBegins(moment());

        $("#rawHolder table:last").find("tr." + globals.inputRow.ROW).find("td:first").text(globals.formNAME);

        if (globals.processQ.length == 0) {
          self.cleanUp();
        } else {
          if (!globals.isOrchestration) {
            self.initFn(globals.processQ[0])
          } else {
            self.callMultipleOrchestrations();
          }

        }
      }
      if (options.subForm && options.closeSession === true) { // enabling this ensures that the HTML session is closed after an error occurss
        var reqObj = self.buildAppstackJSON({
          form: options.subForm,
          type: "close"
        }, options.closeID);
        self.getForm("appstack", reqObj).then(function (data) {
          handleErrors();
        });
      } else {
        handleErrors();
      }
    };
    // clean up UI after drop is completed
    self.cleanUp = function () {
      console.log('into clean up...')
      globals.debug.previous = [];
      globals.newForm(true);

      // remove the current process dataset
      globals.fullDataArray.shift();
      currentFormIndex(currentFormIndex() + 1);
      ga('send', 'event', {
        eventCategory: 'dropZone V3',
        eventAction: 'finishDrop',
        eventLabel: globals.formNAME + ',' + globals.dzUser().organisation.name + ',' + globals.totalRows() + ',' + errorRows() + ',' + moment().format() + ',[form_name,customer,total_rows,error_rows,date]'
      });
      globals.htmlInputs = [];
      // recall the handler method
      self.initSingleDrop();

    };
    self.prepareDrop = function (fullDataArray) { // initiated at Upload viewmodel. Sets up values.
      /* Perform tier validation */
      console.log(fullDataArray);
      var tier = globals.tier();
      var numDrops = fullDataArray.length;
      if (tier.toLowerCase() === "standard" && numDrops > 1) {
        var newDataArray = [];
        newDataArray[0] = fullDataArray[0];
        fullDataArray = newDataArray;
        preDropFlag.push("You are on the <b>Standard</b> tier. Your drop will be limited to one form at a time. Please upgrade to <b>Enterprise</b> to drop multiple forms at once.");
        // handle show warnings
        console.log(preDropFlag());
        numDrops = 0;
      } else {
        numDrops = 0;
      }
      var configs = JSON.parse(localStorage.getItem("JDEUser")); // get user Configs
      // setup globals obj values
      globals.username = configs.JDEusername;
      globals.password = configs.JDEpassword;
      globals.url = configs.JDEurl;
      globals.configUrl = "//" + globals.url + "/jderest/defaultconfig";
      globals.batchUrl = "//" + globals.url + "/jderest/appstack";
      globals.discover = "//" + globals.url + "/jderest/discover";
      globals.tokenUrl = "//" + globals.url + "/jderest/tokenrequest";
      globals.batchRequestUrl = "//" + globals.url + "/jderest/batchformservice";
      globals.mediaUpdateUrl = "//" + globals.url + "/jderest/file/updatetext";
      globals.mediaGetUrl = "//" + globals.url + "/jderest/file/gettext";
      globals.htmlInputs = [];
      // internals
      globals.rawHolder = [];
      globals.dropCount = 0;
      globals.currentDrop = {};

      globals.fullDataArray = fullDataArray;
      fullDataArray = []; // empty the array to free memory
      // this is a generic method to act on the fullDataArray until empty
      self.handleMultiDrop();
      //})
    };
    self.handleMultiDrop = function () { // this must fire only once per multidrop

      var rawHolder = [];
      globals.htmlInputs = [];
      self.individualFormRowsArray = ko.observableArray([]);
      self.currentRowIndex = ko.observable(0);
      self.totalRows = ko.observable(0);
      self.totalForms = ko.computed(function () {
        return formNamesArray().length;
      });

      $("#rawTable").empty(); // empty the raw data table

      self.isValid = ko.observable(true);
      self.isValidMsg = ko.observableArray([]);
      $.each(globals.fullDataArray, function (i, el) {
        if (!globals.fullDataArray[i][0].hasOwnProperty("FormName")) {
          self.isValid(false);
          self.isValidMsg.push("Worksheet #" + (i + 1) + "has no form name. Please correct your template and try the drop again.");
        }
        formNamesArray.push(el[0].FormName);
        self.individualFormRowsArray.push(el.length);
        self.totalRows(self.totalRows() + el.length);
      });
      globals.totalRows(self.totalRows()); // hand off to globals for rendering of pre-drop modal
      globals.allFormNames = formNamesArray(); // cache this for the instruction to build raw error data table after drop


      /* Begin Get Forms Objects */
      setTimeout(function () {
        $.each(formNamesArray(), function (index, element) {
          console.log(element);
          if (element.charAt(0) == 'P') {
            $.ajax({
              url: '/api/form?_id=' + element,
              type: 'GET',
              success: function (response) {
                timePerRowEst.push(parseInt(response.data.zone_timePerRow) * 1000);
              },
              error: function (jqXHR) {
                console.log(jqXHR);
              }
            });
          }
        });
      }, 1);
      /* End Get Forms Objects */



      if (!self.isValid()) {
        var alertString = "";
        $.each(self.isValidMsg(), function (i, el) {
          alertString += (el + "<br>");
        });
        alertInit(alertString);
      } else {
        // check isProduction and add to globals.preDropFlag if it is
        // $('.preDrop').trigger('click'); // open modal
        showPreDropModal(true);
        $('.modaal-outer-wrapper').on('click', function (e) {
          if (e.target.className === "modaal-inner-wrapper" || e.target.id === "modaal-close") {
            closePreDropModal();
            globals.fullDataArray = [];
          }
        });
        if (preDropFlag().length > 0) {
          console.log(preDropFlag().length, preDropFlag());
          $.each(preDropFlag(), function (index, el) {
            $('#preDropWarnings > div').append("<p>" + el + "</p>");
          });
          $('#preDropWarnings').show();
        } else {
          $('#preDropWarnings').hide();
        }
      };
    };

    self.initSingleDrop = function () { // this must fire every time a new single drop begins
      console.log("into single drop")
      if (globals.fullDataArray.length != 0) {
        // $("#statusBlock").html("<h3>Processing " + self.totalRows + " total rows</h3>");
        // set up the new data set as processQ
        globals.processQ = globals.fullDataArray[0]; // processQ is now set up for the drop
        globals.inputRow = globals.processQ[0];
        var formName = globals.processQ[0].FormName;
        globals.formName = formName;
        globals.version = globals.processQ[0].Version;
        var formArr = formName.split('_');
        var formSplit = formArr[0];
        var subForm = formArr[1];
        var formOptions = formArr[2];
        document.getElementById("rawHolder").appendChild(self.buildHtmlTable(globals.processQ, formNamesArray()[currentFormIndex()]));
        // globals.inputRow = globals.processQ[0];
        if (formName.charAt(0) == 'P') {
          if (formOptions !== undefined) {
            globals.formNAME = formSplit + "_" + subForm + "_" + formOptions;
          } else {
            globals.formNAME = formSplit + "_" + subForm;
          }


          // initialize drop
          globals.stopTokenChecking(true); // when a drop begins, we stop the token checking (because that would be wasteful)
          // E1 PROCESSES
          // to load the file for the process
          require(["process/" + globals.formNAME], function (formObj) { // formObj is an instance of the individual form's process object
            // this method kicks off the process
            self.initFn = formObj.init; 
            // ensure token
            self.preflightTokenCheck().then(function (validObj) {
              function init() {
                // for closing E1 sessions
                globals.closeObj = formObj.closeObj;
                // from Excel data
                globals.version = globals.processQ[0].Version;
                // can remove likely
                timeRowBegins(moment());
                // for error handling table
                document.getElementById("rawHolder").appendChild(self.buildHtmlTable(globals.processQ, formNamesArray()[currentFormIndex()]));
                // log details into UI
                processLog.unshift("Processing form: " + formNamesArray()[currentFormIndex()]);
                globals.stopTokenChecking(true);
                self.initFn();
              }
              if (validObj.valid) { // we have one
                init();
              } else {
                alertInit("Wait a moment, we need to fetch you a new token...");
                self.getToken().then(function (data) {
                  alertClose();
                  init();
                });
              }
            });
          });

        } else {

          self.callMultipleOrchestrations();

        }


      } else { // end of drop
        var config = JSON.parse(localStorage.getItem("JDEUser"));
        isTimerRunning(false);
        isPreviousDrop(true);
        self.createExcelOutput();
        globals.stopTokenChecking(false);
        self.tokenIntervalCheck(config);
        globals.dropState(2);

        /* Begin Stats API call */
        var data = {
          token: getCookie("token"),
          unit: 'drops',
          incValue: 1,
          meta: {
            rows: globals.totalRows(),
            errorRows: errorRows(),
            secondsSaved: avgTimePerRowSaved() * globals.totalRows() / 1000,
          }
        };
        $.ajax({
          url: '/api/stats',
          type: 'POST',
          data: JSON.stringify(data),
          contentType: 'application/json',
          success: function () {
            console.log("stats submitted: ", JSON.stringify(data));
          },
          error: function (jqXHR) {
            console.log(jqXHR);
          }
        });
        /* End  Stats API call */
        /* Begin DEBUG report */
        var date = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");
        var currentDataStr = '',
          previousDataStr = '',
          processStr = '';
        $.each(processLog(), function (index, el) {
          processStr += el + "\r\n";
        });
        $.each(globals.debug.current, function (index, el) {
          currentDataStr += JSON.stringify(el) + "\r\n";
        });
        var bodyStr = "Dear Steltix Labs,\r\n\r\nHere are the details of my support request:\r\n\r\n------ Process Logs ------ \r\n" + processStr + "\r\n------ Payloads ------\r\n" + currentDataStr;

        $("#sendEmail").attr("href", "mailto:christian.mccabe@steltix.com?subject=dropZoneDebug&body=" + encodeURIComponent(bodyStr)).attr("id", "emailSend");

        bodyStr = "";
        /* End DEBUG report */
      }
    };
    self.createExcelOutput = function () {
      // step 1: formulate HTML string header (check the convert_html_to_excel method first)
      // step 2: add row objects to HTML string (use JSON.stringify)
      // step 3: close HTML string table tags
      // step 4: convert HTML string to Excel and download
    };
    self.logOut = function () {
      globals.connStatus.changeStatus(3, "dropZone is logging you out of AIS.");
      var logoutObj = {
        "token": globals.token
      }
      var logoutUrl = globals.tokenUrl + "/logout";
      $.ajax({
        url: logoutUrl,
        dataType: "json",
        type: "POST",
        data: JSON.stringify(logoutObj),
        success: function (data) {
          globals.connectedToE1(false);
          globals.connStatus.changeStatus(0, "dropZone has terminated your AIS session. It was great to serve you today!");
        },
        error: function (jqXHR, textStatus, errorThrown) {
          switch (jqXHR.status) {
            case 500:
              if (jqXHR.responseJSON.message.replace("Invalid Token") !== -1) {
                globals.connStatus.changeStatus(0, "You have been logged out of AIS.");
                globals.connectedToE1(false);
              } else {
                globals.connStatus.changeStatus(0, "Status unknown. Please contact dropZone support.");
              }
              break;
            case 200:
              globals.connectedToE1(false);
              globals.connStatus.changeStatus(0, "You have been logged out of AIS.");
              break;
            default:
              globals.connectedToE1(false);
              globals.connStatus.changeStatus(0, "Unknown error. Please see the JavaScript Console for error details.");
          }
        },
        complete: function () {
          // set token expiry timestamp to NOW so that future checks will request a new token
          var aisConfig = JSON.parse(localStorage.getItem("aisConfig"));
          globals.connectedToE1(false);
          aisConfig.tokenExpires = moment();
          localStorage.setItem("aisConfig", JSON.stringify(aisConfig));
          globals.customer("unregistered"); // reset Download Templates to blank
        }
      });
    };

    // keep track of all req and responses
    self.writeToDebug = function (newData) {

      self.debugArray.push(newData);

    };

    //function to get debug data
    self.getDebugData = function () {

      return self.debugArray;

    }
    /* Begin helpers for building HTML tables */
    self._table_ = document.createElement('table'),
      _tr_ = document.createElement('tr'),
      _th_ = document.createElement('th'),
      _td_ = document.createElement('td');
    self.executeFunctionByName = function (functionName, context) {
      var args = [].slice.call(arguments).splice(2);
      var namespaces = functionName.split(".");
      var func = namespaces.pop();
      for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
      }
      return context[func].apply(context, args);
    };
    self.buildHtmlTable = function (arr, id) {
      console.log("into buildTable")
      var table = self._table_.cloneNode(false),

        columns = self.addAllColumnHeaders(arr, table);
      for (var i = 0, maxi = arr.length; i < maxi; ++i) {
        var tr = _tr_.cloneNode(false);
        tr.className = i + 2;
        for (var j = 0, maxj = columns.length; j < maxj; ++j) {
          var td = _td_.cloneNode(false);

          cellValue = arr[i][columns[j]];
          td.appendChild(document.createTextNode(arr[i][columns[j]] || ''));
          tr.appendChild(td);
        }
        table.appendChild(tr);
      }

      table.id = id;
      return table;
    };
    self.addAllColumnHeaders = function (arr, table) {
      var columnSet = [],
        tr = _tr_.cloneNode(false);
      for (var i = 0, l = arr.length; i < l; i++) {
        for (var key in arr[i]) {
          if (arr[i].hasOwnProperty(key) && columnSet.indexOf(key) === -1) {
            columnSet.push(key);
            var th = _td_.cloneNode(false);
            th.appendChild(document.createTextNode(key));
            tr.appendChild(th);
          }
        }
      }
      table.appendChild(tr);
      return columnSet;
    };
    /* End helpers for building HTML tables */


    /* Handlers for fields that don't - because of zeros in front of values */
    self.prepProblemFieldsForImport = function (inputRow, problemFields) {
      var currInputRow = inputRow;
      for (i = 0; i < problemFields.length; i++) {
        if (currInputRow.hasOwnProperty(problemFields[i].longname) && currInputRow[problemFields[i].longname].substring(0, 1) === "'")
          currInputRow[problemFields[i].longname] = currInputRow[problemFields[i].longname].substring(1);
      }
      return currInputRow;
    }

    self.prepProblemFieldsForExtract = function (data, problemFields) {
      var currData = data;
      for (i = 0; i < problemFields.length; i++) {
        if (currData.data.hasOwnProperty(problemFields[i].alias) && $.trim(currData.data[problemFields[i].alias].value) !== '') {
          if (currData.data[problemFields[i].alias].value !== '" "')
            currData.data[problemFields[i].alias].value = "'" + currData.data[problemFields[i].alias].value;
        }
      }
      return currData;
    }

    /* BEGIN EXTRACT */
    self.appendTable = function (data, rowToSelect, exportGridRows) {
      /* SET UP VARIABLES */
      var headerCells = "",
        newCells = "",
        customHeaderCells = "",
        customNewCells = "";
      var extractGridDataRows = false;
      if (exportGridRows !== undefined)
        extractGridDataRows = exportGridRows;

      var detailsRow, customIds = ",";

      function formatBlankString(strToFormat) {
        //var checkString = $.trim(strToFormat);
        if (strToFormat === '" "') strToFormat = '';
        if (typeof (strToFormat) === 'undefined') strToFormat = '';
        //return strToFormat || "___blank___";
        return strToFormat;
      }

      /* SET UP LOGIC */
      function getCustomFields() {
        var df = $.Deferred();
        if (globals.newForm()) {
          $.ajax({
            url: '/api/form?_id=' + globals.formNAME,
            type: 'GET',
            contentType: 'application/json',
            success: function (response) {
              self.customFormFields(response.data.pushCols);
              df.resolve(self.customFormFields());
            },
            error: function (jqXHR) {
              console.log(jqXHR);
              df.reject(jqXHR);
            }
          });
        } else {
          $.each(self.customFormFields(), function (idx, object) {
            if (object.hasOwnProperty('value'))
              delete object.value;
          })
          df.resolve(self.customFormFields());
        }
        return df.promise();
      }

      function getGridData(inputData, rowToSelect) {
        var rowToSelect = rowToSelect || 0;
        var gridData = [];
        if (inputData.hasOwnProperty("gridData")) {
          var gridRow = inputData.gridData.rowset[rowToSelect];
          $.each(gridRow, function (key, object) {
            gridData.push({
              id: object.id,
              title: object.title,
              value: object.value,
              alias: object.alias || ''
            });
          });
        }
        return gridData;
      }

      function getFormData(inputData) {
        var fieldData = [];
        $.each(inputData, function (key, object) {
          if (object.hasOwnProperty("internalValue")) { // not a label
            fieldData.push({
              id: object.id,
              title: object.title,
              prefix: object.longName.substr(0, 3),
              value: formatBlankString(object.value),
              alias: key.split("_")[1]
            });
          }
        });
        fieldData.sort(function (a, b) {
          return a.id - b.id;
        });
        return fieldData;
      }

      function checkFieldMustExtract(field) {
        return true;
      }

      /* EXECUTE */
      getCustomFields().done(function (customArr) {
        // customArr is pushCols array from the database
        var customIdStr = ","; // cache all custom id's in a string for later comparison
        var customData = []; // array of objects with title and JDE data
        $.each(customArr, function (index, object) {
          customIdStr += object.aisId + ",";
          object.index = index;
          customData.push(object);
        });
        var fieldArr = getFormData(data);
        var gridArr = getGridData(data, rowToSelect);
        var fieldCols = "";

        fieldArr.forEach(function (object) {
          var compareId = "," + object.id + ","; // prevents, for example, "31" matching "131"
          if (customIdStr.includes(compareId)) { // don't add duplicate: build custom array with values
            var currentArr = customArr.filter(function (el) {
              return el.aisId == object.id;
            });
            var currentIndex = currentArr[0].index;
            var currentValue = object.value;
            customData[currentIndex].value = currentValue;
            if (currentArr[0].reqd === true) {
              customData[currentIndex].required = true;
            }
          } else { // non-duplicate: add to HTML
            var headerName = object.prefix + "__" + object.title + "__" + object.alias + "__" + object.id;
            if (globals.exactExtractHeader.indexOf(headerName) > -1) {
              headerCells += "<td>" + headerName + "</td>";
              newCells += "<td>" + formatBlankString(object.value) + "</td>";
              fieldCols += "<td>" + formatBlankString(object.value) + "</td>";
            }
          }
        });
        gridArr.forEach(function (object) {
          var compareId = "," + object.id + ",";
          if (customIdStr.includes(compareId)) { // don't add duplicate: build custom array with values
            var currentArr = customArr.filter(function (el) {
              return el.aisId == object.id;
            });
            var currentIndex = currentArr[0].index;
            var currentValue = object.value;
            customData[currentIndex].value = currentValue;
            if (currentArr[0].reqd === true) {
              customData[currentIndex].required = true;
            }
          } else { // non-duplicate: add to HTML
            var headerName = "grid__" + object.title + "__" + object.alias + "__" + object.id;
            if (globals.exactExtractHeader.indexOf(headerName) > -1) {
              headerCells += "<td>grid__" + object.title + "__" + object.alias + "__" + object.id + "</td>";
              newCells += "<td>" + object.value + "</td>";
            }
          }
        });
        // Loop through customData, add to header and add to new row
        customData.forEach(function (object) {
          var required = "";
          if (object.required === true) {
            required = "*";
          }
          var cleanedValue = formatBlankString(object.value) /* || ""*/ ;
          var cHeaderName = object.item;
          if (globals.exactExtractHeader.indexOf(cHeaderName) > -1) {
            customHeaderCells += "<td>" + cHeaderName + required + "</td>";
            customNewCells += "<td>" + cleanedValue + "</td>";
          }
        });

        // generate HTML of dynamic fields and place HTML into holding table
        if (globals.newForm() === true) { // if new form, create new table and add heading
          var headerRow = "<tr><td>" + globals.dummyRowText() + "</td></tr>" + "<tr><td>FormName&dagger;</td><td>Version*</td>" + customHeaderCells + headerCells + "</tr>";
          var newRow = "<tr><td>" + globals.formNAME + "</td><td>" + globals.version + "</td>" + customNewCells + newCells + "</tr>";

          var tableDoesNotExist = ($('#outputHolder')[0].innerHTML.indexOf('<table class="' + globals.formNAME + '">') == -1);

          if (tableDoesNotExist)
            $('#outputHolder').append('<table class="' + globals.formNAME + '"></table>');

          $outputTable = $('#outputHolder .' + globals.formNAME);

          if (tableDoesNotExist) {
            $outputTable.append($(headerRow)).append($(newRow));
            globals.outputList.push(globals.formNAME);
          } else {
            $outputTable.append($(newRow));
          }

          globals.newForm(false);
        } else {
          var newRow = "<tr><td></td><td>" + globals.version + "</td>" + customNewCells + newCells + "</tr>";
          $outputTable.append($(newRow));
        }

        if (extractGridDataRows) {
          if (data.gridData.rowset.length > 1) {
            $.each(data.gridData.rowset, function (gridKey, gridObj) {
              if (gridKey > 0) {
                gridArr = getGridData(data, gridKey);
                newCells = "";
                customNewCells = "";

                gridArr.forEach(function (object) {
                  var compareId = "," + object.id + ",";
                  if (customIdStr.includes(compareId)) { // don't add duplicate: build custom array with values
                    var currentArr = customArr.filter(function (el) {
                      return el.aisId == object.id;
                    });
                    var currentIndex = currentArr[0].index;
                    var currentValue = object.value;
                    customData[currentIndex].value = currentValue;
                    if (currentArr[0].reqd === true) {
                      customData[currentIndex].required = true;
                    }
                  } else { // non-duplicate: add to HTML
                    var headerName = 'grid__' + object.title + "__" + object.alias + "__" + object.id;
                    if (globals.exactExtractHeader.indexOf(headerName) > -1) {
                      newCells += "<td>" + object.value + "</td>";
                    }
                  }
                });

                // Loop through customData, add to header and add to new row
                customData.forEach(function (object) {
                  var required = "";
                  if (object.required === true) {
                    required = "*";
                  }
                  var cleanedValue = object.value || "";
                  var cHeaderName = object.item;
                  if (globals.exactExtractHeader.indexOf(cHeaderName) > -1) {
                    customNewCells += "<td>" + cleanedValue + "</td>";
                  }
                });

                if (customNewCells + fieldCols + newCells !== "") {
                  var newRow = "<tr><td></td><td>" + globals.version + "</td>" + customNewCells + fieldCols + newCells + "</tr>";
                  $outputTable.append($(newRow));
                }
              }
            });

          }
        }
        globals.hasOutput(true);
        self.returnFromSuccess();
      }).fail(function (error) {
        self.postError("An error occurred while extracting the data");
        self.returnFromError();
        console.log(error);
      });
    };
  };
  return new Aisclient();
});
