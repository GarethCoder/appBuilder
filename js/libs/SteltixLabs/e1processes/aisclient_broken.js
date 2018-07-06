var AISCLIENT = {

  // internal properties
  blocked: true,
  errorRows: 0,
  processedRows: 0,
  totalRows: 0,
  debugArray: [],
  tempArr: [],
  initFn: "getBrowseForm",
  rowToUpdate: "",
  formName: "",
  errHolder: [],
  rawholder: [],
  // adding new flag for MDrop logic
  isMultiDrop: false,
  splitSubForm: function getSecondPart(str) {
    return str.split('_')[1];
  },
  subForm: "",
  pBar: '<div class="progress"><div class="progress-bar" role="progressbar" id="pBar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div>',

  // method to update pBar
  updateProgBar: function () {
    var ind = (AISCLIENT.processedRows / AISCLIENT.totalRows) * 100;

    $("#pBar").css("width", ind + "%");
    $("#pBar").html(Math.round(ind) + "%");

  },
  genericPromise: function (mySyncFunc) {
    var df = $.Deferred();

    // here execute the function passed in
    // amd resolve when returned async
    //console.log(mySyncFunc)
    df.resolve(mySyncFunc())

    // return the promise
    return df.promise();

  },
  // returns as a JS object the response from default config service at URL passed in
  // $.when(getConfg()).then(function(payload){
  // do something with the payload or call another step in your process
  //  })

  getConfig: function () {


    var df = $.Deferred();

    $.ajax({
      url: window.globals.configUrl,
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

  },
  connectionOpen: function () {
    var df = $.Deferred();
    AISCLIENT.getConfig().then(function (resp) {
      if (resp.hasOwnProperty("aisVersion")) {
        df.resolve(true);
      } else {
        df.resolve(false);
      }
    });
    return df.promise();
  },
  validateCustomer: function (config) {

    var df = $.Deferred();

    var authObj = {
      "url": config.url
    }
    $.ajax({
      url: "https://70ficqaixk.execute-api.eu-west-1.amazonaws.com/prod/dzreg",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(authObj),
      success: function (resp) {
        if (resp !== "unregistered") {
          AISCLIENT.blocked = false;
          // adding customer name to global object
          window.globals.customer = resp;
          window.globals.isFirstTime = false;
        } else if (resp === "unregistered") {
          AISCLIENT.changeStatus({
            color: "red",
            title: "Not Authorized",
            message: "Your domain is not authorised to use dropZone."
          });
          df.resolve(resp);
        }
      },
      complete: function () {
        config.customer = window.globals.customer;
        if (config.noStorage === true) {
          var newConfig = {};
          newConfig.url = config.url;
          newConfig.customer = config.customer;
          newConfig.noStorage = config.noStorage;
          window.localStorage.setItem("dz_config", window.btoa(JSON.stringify(newConfig)));
        } else {
          window.localStorage.setItem("dz_config", window.btoa(JSON.stringify(config)));
        }

        df.resolve(window.globals.customer);
      }
    });

    return df.promise();
  },
  /**
   * Test if local storage is available
   */
  lsTest: function () {
    var test = 'test';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Checks the validity of the token in Local Storage. Updates status box if valid, requests a new token if invalid
   */
  preflightTokenCheck: function () {
    var df = $.Deferred();
    AISCLIENT.stopTokenChecking = true;
    var poJSON = {
      "token": globals.token,
      "applicationName": "P01012",
      "version": "ZJDE0001",
      "deviceName": "dropZone"
    };
    $.ajax({
      url: globals.poUrl,
      dataType: "json",
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
  },

  checkToken: function () {

    var df = $.Deferred();


    if (config.noStorage !== true) {
      aisConfig = JSON.parse(window.localStorage.getItem("aisConfig"));
      userInfo = JSON.parse(window.localStorage.getItem("userInfo"));
    }
    var expiryTime;
    if (aisConfig && aisConfig.tokenExpires) {
      expiryTime = aisConfig.tokenExpires;
    } else {
      expiryTime = window.globals.tokenExpires; // get expiry time from local storage or cache (for E1 Composte Pages compatibility)
    }
    var connOpen;
    var stillValid = moment().isBefore(moment(expiryTime).subtract(1, 'minutes')); // is NOW before the token expiry (with a buffer of 1 minute)?
    AISCLIENT.connectionOpen().then(function (isOpen) {
      if (isOpen === false) {
        df.resolve({
          valid: false,
          reason: "connection"
        });
      } else if (isOpen === true && stillValid === true && aisConfig.tokenAssocUrl === config.url && userInfo.username.toLowerCase() === config.usr.toLowerCase()) {
        // if token is still valid and associated with the currently requested environemnt, cache it for dropZone's use
        console.log("token still valid");
        window.globals.token = userInfo.token;
        window.globals.user = userInfo;
        AISCLIENT.setDateFormat(userInfo);
        AISCLIENT.stopTokenChecking = false;
        df.resolve({
          valid: true,
          reason: ""
        });
      } else { // if token is invalid or not present, request a new one
        console.log("getting token");
        df.resolve({
          valid: false,
          reason: "invalid"
        });
      }
    });
    // } else {
    // 	console.log("localStorage is unavailable");
    //     df.resolve({valid: false, reason: "noLocalStorage"});
    // }
    return df.promise();
  },

  setDateFormat: function (userInfo) {
    window.globals.simpleDateFormat = userInfo.simpleDateFormat.toUpperCase(); // for Moment recognition
    if (userInfo.dateSeperator == "-") {
      window.globals.dateFormat = "DD-MM-YY";
      window.globals.now = moment().format("DD-MM-YY");
      window.globals.oneDayAgo = moment().subtract(1, 'days').format("DD-MM-YY");
      window.globals.twoDaysAgo = moment().subtract(2, 'days').format("DD-MM-YY");

    } else if (userInfo.dateSeperator == "/" && userInfo.simpleDateFormat == "dd/MM/yy") {
      window.globals.dateFormat = "DD/MM/YY";
      window.globals.now = moment().format("DD/MM/YY");
      window.globals.oneDayAgo = moment().subtract(1, 'days').format("DD/MM/YY");
      window.globals.twoDaysAgo = moment().subtract(2, 'days').format("DD/MM/YY");

    } else {
      window.globals.dateFormat = "L";
      window.globals.now = moment().format("L");
      window.globals.oneDayAgo = moment().subtract(1, 'days').format("L");
      window.globals.twoDaysAgo = moment().subtract(2, 'days').format("L");
    }
  },

  /**
   * Fetches a new token
   */
  getToken: function (options) {
    // console.log(window.globals)
    var df = $.Deferred();

    var tokenRequestJSON = {
      "deviceName": "dropZone"
    };

    tokenRequestJSON.username = window.globals.username;
    tokenRequestJSON.password = window.globals.password;

    AISCLIENT.stopTokenChecking = false;

    $.ajax({
      url: window.globals.tokenUrl,
      dataType: "json",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(tokenRequestJSON),
      success: function (data) {
        userInfo = data.userInfo;
        userInfo.env = data.environment;
        userInfo.username = window.globals.jdeuser;
        window.globals.token = userInfo.token;
        window.globals.user = userInfo;
        window.localStorage.setItem("userInfo", JSON.stringify(userInfo));
        AISCLIENT.stopTokenChecking = false;
        AISCLIENT.setDateFormat(userInfo);
        df.resolve();
        AISCLIENT.getConfig().then(function (configData) {
          aisConfig = configData;
          aisConfig.tokenExpires = moment().add(parseInt(aisConfig.sessionTimeout), 'minutes'); // stamp the expiry time
          aisConfig.tokenAssocUrl = window.globals.url; // stamp the E1 Url that the current token is associated with
          window.globals.tokenExpires = aisConfig.tokenExpires; // stamp the expiry time to memory, necessary for E1 Composite Page
          window.localStorage.setItem("aisConfig", JSON.stringify(aisConfig));

        });
        // if (options && options.suppressOutput === true) {} else {
        //   AISCLIENT.statusConnect(userInfo);
        // }
        // AISCLIENT.stopTokenChecking = false;
        // AISCLIENT.tokenIntervalCheck();
        // ga('send', 'event', {
        //   eventCategory: 'dropZone App',
        //   eventAction: 'loginSuccess',
        //   eventLabel: globals.customer + ',' + globals.now + ',[customer,date]'
        // });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        AISCLIENT.stopTokenChecking = true;
        if (jqXHR.status === 403) {
          AISCLIENT.changeStatus({
            color: "red",
            title: "Not Connected",
            message: "JDE credentials invalid. Please try connect again with your valid JDE username and password."
          });
        } else if (jqXHR.status === 415) {
          AISCLIENT.changeStatus({
            color: "red",
            title: "Not Connected",
            message: errorThrown + " - if you're using Tools Release 9.2.0.5, please try logging into dropZone <a href='http://dropzone.steltix.com/dz99/dropZone.html'>here</a>"
          });
        } else {
          AISCLIENT.changeStatus({
            color: "red",
            title: "Not Connected",
            message: (errorThrown || "Unknown error") + " - Please see the JavaScript Console for error details"
          });
        }
      }
    });



    return df.promise();

  },
  /**
   * Check the token validity every 10 seconds
   */
  tokenIntervalCheck: function () {
    window.setTimeout(function () {
      if (AISCLIENT.stopTokenChecking === false) {

        // then check token validity (MAKE SURE that the token is per E1 Url!!!) ******
        AISCLIENT.checkToken().then(function (validObj) {
          if (validObj.valid === true) {
            AISCLIENT.statusConnect();
            AISCLIENT.tokenIntervalCheck();
          } else if (validObj.valid === false && validObj.reason === "connection") {
            AISCLIENT.changeStatus({
              color: "grey",
              title: "Retrying",
              message: "There's a problem with your internet or VPN connection. Please reconnect and log in again."
            });
          } else { // if (validObj.valid === false && validObj.reason === "timeout")
            AISCLIENT.changeStatus({
              color: "red",
              title: "Not Connected",
              message: "Your dropZone session has timed out. Please click \"Log In\" in the top right-hand corner to begin a new session."
            });
            AISCLIENT.stopTokenChecking = true;
          }
        });
      };

    }, 10000);
  },
  /**
   * Call when updating the status to "Connected", in particular for use with a token request
   * @param {object} userInfo property of the AIS default config object (<host>/jderest/defaultconfig)
   */
  statusConnect: function () {
    //var uInfo = window.globals.user; // named uInfo so that it doesn't clash with other variables in the scope
    //var cInfo = JSON.parse(window.atob(window.localStorage.getItem("dz_config")));
    var statusBox = document.getElementById('connLabel');
    if (statusBox !== null) {
      AISCLIENT.changeStatus({
        color: "green",
        title: "Connected",
        message: 'You are <b>' + config.usr + '</b> at <b>' + config.url + '</b>, logged into E1 environment <b>' + userInfo.env + '</b>'
      });
    }
    AISCLIENT.isLoggedIn = true;
    AISCLIENT.handleLog();
  },
  /**
   * Generic helper function to change the status message
   * @param {object} options
   * @param {object} options.color - change the color to either green, orange or red
   * @param {object} options.title - text in the badge
   * @param {object} options.message - description message adjacent to the badge
   */
  changeStatus: function (options) {
    var statusBox = document.getElementById('connLabel');
    var badge,
      title;
    switch (options.color.toLowerCase()) {
      case "red":
        badge = "danger";
        title = options.title || "Not Connected";
        AISCLIENT.isLoggedIn = false;
        AISCLIENT.handleLog();
        break;
      case "orange":
        badge = "warning";
        AISCLIENT.isLoggedIn = false;
        AISCLIENT.handleLog();
        break;
      case "green":
        badge = "success";
        title = options.title || "Connected";
        AISCLIENT.isLoggedIn = true;
        AISCLIENT.handleLog();
        break;
      case "grey":
        badge = "default";
        title = options.title || "Connecting";
        AISCLIENT.isLoggedIn = false;
        AISCLIENT.handleLog();
        break;
      default:
        badge = "danger";
        title = options.title || "Error...";
        AISCLIENT.isLoggedIn = false;
        AISCLIENT.handleLog();
    }
    if (statusBox !== null) {
      $('#configBlock').html("<span id='connLabel' class='label label-" + badge + "'>" + title + "</span>&nbsp;" + options.message);
    }
  },

  /**
   * Requests a form from AIS
   * @param {string} mode - "appstack" or "formrequest" for type of request
   * @param {object} JSON - the JSON object to submit to AIS
   */
  getForm: function (mode, jsonData) {

    var df = $.Deferred()
    var url;
    switch (mode) {
      case "appstack":
        url = window.globals.formUrl;
        break;
      case "mediaUpdate":
        url = window.globals.mediaUpdateUrl;
        break;
      case "mediaAdd":
        url = window.globals.mediaAddUrl;
        break;
      default:
        url = window.globals.formUrl;
    }

    // if appStack then add url
    if (mode.toLowerCase() == 'appstack') {
      url = window.globals.batchUrl;
    }

    jsonData.token = window.globals.token;
    console.log(JSON.stringify(jsonData))
    $.ajax({
        url: url,
        dataType: "json",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(jsonData),
        success: function (data) {

          jsonData = {};

          // if appStack cache state, stack and rid
          if (mode.toLowerCase() === 'appstack') {

            window.globals.stackid = data.stackId;
            window.globals.stateid = data.stateId;
            window.globals.rid = data.rid;

          }
          df.resolve(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          if (jqXHR.status === 200 && jqXHR.responseText === "") {
            df.resolve("no_response");
          } else if (jqXHR.status === 500) {
            df.resolve("500");
          } else {
            AISCLIENT.postError(jqXHR.responseText || "There was no response or the request timed out");
            AISCLIENT.returnFromError();
          }
        }
      })
      // return a promise and resolve in one of the above conditions
    return df.promise();

  },

  /**
   * Builds the JSON for submission to AIS's appstack service
   * @param {object} options
   * @param {string} options.form - form name, e.g. P4101_W4101A
   * @param {string} options.type - default: execute. Alternatively, open or close
   * @param {boolean} options.dynamic - default: false. Mark true to add Excel fields which were dynamically generated by the Template Generator, such as txtItemNumber_15
   * @param {boolean} options.gridAdd - default: false. Mark true if inserting a grid row
   * @param {boolean} options.gridUpdate - default: false. Mark true if updating an existing grid row
   * @param {boolean} options.gridMultiple - default: false. Mark true if updating multiple grid rows, e.g. multiple sequence steps in Routing Operations (P3003)
   * @param {array} options.gridMultipleIndices - default: empty array. Contains the zero-indexed indices of all the rows that need to be updated in this step. gridMultiple has to be set to true
   * @param {string} buttons - pass in the controlID or form interconnect ID and a button will be generated, e.g. "4" becomes {"command: "DoAction","controlID":"4"}
   * @param {array} rowToSelect - passing in the string "1.0" produces the code to select the first row
   * @param {array} field
   * @param {string} field[0] - controlID for either a control field or QBE field
   * @param {string} field[1] - value to be entered. Typically this is a reference to a property of the object inputRow
   **/
  buildAppstackJSON: function (opts) {
    var options = {
      formName: opts.form,
      type: opts.type || "execute",
      dynamic: opts.dynamic || false,
      grid: opts.grid || false,
      gridAdd: opts.gridAdd || false,
      gridUpdate: opts.gridUpdate || false,
      gridMultiple: opts.gridMultiple || false,
      gridMultipleIndices: opts.gridMultipleIndices || [],
      returnControlIDs: opts.returnControlIDs || false,
      findOnEntry: opts.findOnEntry || "FALSE",
      customGrid: opts.customGrid || false,
      rowToSelect: opts.rowToSelect || 0,
      suppressDynamicGrid: opts.suppressDynamicGrid || false,
      turbo: opts.turbo || false
    }
    var nJson = {}; // holder structure for json
    nJson.deviceName = 'dropZone';
    nJson.token = window.globals.token;
    nJson.action = options.type;

    if (options.turbo) {
      nJson.outputType = "GRID_DATA";
    }
    if (options.dynamic === true) {
      var dynamicActions = AISCLIENT.getDynamicActions(window.globals.htmlInputs);
    } else {
      var dynamicActions = [];
    }
    var gridActions = [];
    var staticActions = AISCLIENT.addActions(arguments);

    // then add static inputs such as button presses

    if (options.type.trim().toLowerCase() === "open") {
      nJson.formRequest = {};
      nJson.formRequest.version = window.globals.version;
      nJson.formRequest.formName = options.formName;
      if (opts.returnControlIDs) {
        nJson.formRequest.returnControlIDs = options.returnControlIDs;
      };
      nJson.formRequest.formInputs = [];
      nJson.formRequest.formActions = staticActions || [];

      for (var i = 1; i < arguments.length; i++) {
        if (arguments[i][0].toLowerCase() === "input") {
          nJson.formRequest.formInputs.push({
            "id": arguments[i][1],
            "value": arguments[i][2]
          })
        }
      }

    } else if (options.type.toLowerCase() === "execute" || options.type.toLowerCase() === "close") {
      nJson.actionRequest = {};
      nJson.actionRequest.formOID = options.formName;
      // add grid stuff
      if (options.gridAdd || options.gridUpdate) {
        var gridInsert = {};
        if (options.gridAdd === true) {
          gridInsert = {
            "gridAction": {
              "gridID": "1",
              "gridRowInsertEvents": [{
                "gridColumnEvents": AISCLIENT.getGridActions(options.customGrid, opts.suppressDynamicGrid, arguments)
              }]
            }
          };
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
                "gridColumnEvents": AISCLIENT.getGridActions(options.customGrid, opts.suppressDynamicGrid, arguments)
              });
            });
          } else {
            gridInsert.gridAction.gridRowUpdateEvents.push({
              "rowNumber": options.rowToSelect,
              "gridColumnEvents": AISCLIENT.getGridActions(options.customGrid, opts.suppressDynamicGrid, arguments)
            });
          }
        }
        dynamicActions.push(gridInsert);
        // add custom grid fields
      }

      nJson.actionRequest.formActions = [].concat(dynamicActions).concat(staticActions);
      nJson.stackId = window.globals.stackid;
      nJson.stateId = window.globals.stateid;
      nJson.rid = window.globals.rid;
    }
    return nJson;
  },
  /**
   * Builds the string for the returnControlIDs property of the request object
   * @param {object} inputObj - typically, the inputRow object, containing all the Excel inputs
   * @param {string} params - IDs of hard-coded fields that are required for the next call
   **/
  returnControlIDs: function (inputObj) {
    var str = "";
    var strArr = [];
    for (var i = 1; i < arguments.length; i++) {
      strArr.push(arguments[i]);
    };
    $.each(inputObj, function (i, o) {
      var title = i.substring(0, 3)
      if (title === "txt" || title === "rad" || title === "chk") {
        var id = i.split("_")[1];
        strArr.push(id);
      };
    });
    str = strArr.join("|");
    return str;
  },
  /**
   * Builds the JSON for submission to AIS's media object service
   * @param {object} options
   * @param {string} options.form - form name, e.g. P4101_W4101A
   * @param {string} options.service - default: updatetext. Alternatively, gettext
   * @param {string} options.moStructure - Media Object structure
   * @param {string} options.moKey - key ot Media Object structure
   **/
  buildMediaJSON: function (opts) {
    var options = {};
    options.service = opts.service || "updatetext";
    options.formName = opts.form || "";
    options.moStructure = opts.moStructure || "";
    options.moKey = opts.moKey || [];

    var nJson = {};
    nJson.token = window.globals.token;
    nJson.moStructure = options.moStructure;
    nJson.moKey = options.moKey;
    nJson.formName = options.formName;
    nJson.version = window.globals.version;
    nJson.deviceName = "dropZone";
    if (options.service.toLowerCase() === "updatetext") {
      nJson.inputText = arguments[1];
      nJson.appendText = false;
    }
    return nJson;
  },
  /*
   * Helper function to convert arguments passed in into AIS-ready objects
   */
  addActions: function () { // adds actions passed in as arguments from the specific JDE process code. Examples: buttons, row selects, row exits
    var actions = [];
    var args = arguments[0];
    for (var i = 1; i < args.length; i++) {
      var item = args[i];
      if (Array.isArray(item) && item[0].trim().toLowerCase() !== "input" && item[0].trim().toLowerCase() !== "grid") { // if not an array, then it's a button

        if (item[0].search(/[\[\]]/) !== -1) { // it's a QBE field if there are square brackets in the control ID
          actions.push({
            "command": "SetQBEValue",
            "controlID": item[0],
            "value": item[1]
          });
        } else {
          actions.push({
            "command": "SetControlValue",
            "controlID": item[0],
            "value": item[1]
          });
        }
      } else if (typeof item === "string" && item.search(/\./) === -1) {
        actions.push({
          "command": "DoAction",
          "controlID": item
        });
      } else if (typeof item === "string" && item.search(/\./) !== -1) { // it's a select row instruction if there is a period in the control ID
        actions.push({ // move this out of array syntax
          "command": "SelectRow",
          "controlID": item
        });
      }
    }
    return actions;
  },

  // build JSON for a single formServiceRequest
  // returns request JSON as JS object
  buildFormRequestJSON: function (opts) {
    // var options = {
    // 	formName: opts.form
    // }
    var formRequestJSON = {};
    formRequestJSON.formName = formName;
    formRequestJSON.version = window.globals.version;
    formRequestJSON.deviceName = 'dropZone';
    formRequestJSON.formActions = [];
    formRequestJSON.formInputs = [];
    for (var i = 1; i < arguments.length; i++) {
      if (arguments[i][0].toLowerCase() === "input") {
        formRequestJSON.formInputs.push({
          "id": arguments[i][1],
          "value": arguments[i][2]
        })
      }
    }
    formRequestJSON.token = window.globals.token;

    return formRequestJSON

  },

  /**
   * Helper function to convert the Excel inputs into AIS-ready objects for insertion into the formActions array
   */
  getDynamicActions: function () {

    var tempArr = [];
    var tempInput = {};
    var tempFormattedArray = [];

    $.each(window.globals.htmlInputs, function (i, o) { // loop all inputs

      var tempObj = {};
      tempObj.name = i;
      tempObj.id = o.id;
      tempArr.push(tempObj);
    });
    $.each(window.globals.inputRow, function (i, o) {

      $.each(tempArr, function (i2, o2) {

        if (i === o2.name) {

          if (i.substring(0, 3) == "txt" || i.substring(0, 3) == "rad") { // for txt and radio inputs
            tempInput.command = "SetControlValue";

          } else if (i.substring(0, 3) == "chk") { // for chkboxs

            tempInput.command = "SetCheckboxValue";
          }
          tempInput.controlID = o2.id.toString();
          tempInput.value = o.trim();

          // add to json for request
          tempFormattedArray.push(tempInput);
          tempInput = {}; // clear obj

        }

      })

    });

    return tempFormattedArray;

  },
  getGridActions: function (customGrid, suppressDynamicGrid, args) {
    // loop through html inputs and cache fields with the "list" property => list array
    // cache also the column ID
    // modify inputRow loop to run a nested loop through the list array
    // on matches, and in the loop, convert the values to the index of the field in the list array

    var gridInputArr = [];
    if (suppressDynamicGrid !== true) {
      $.each(window.globals.inputRow, function (i, o) {
        if (i.substring(0, 4) === "grid") {
          gridInputArr.push({
            "command": "SetGridCellValue",
            "columnID": i.split("_")[2],
            "value": o
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
            "value": args[i][2].trim()
          });
        };
      };
    }
    return gridInputArr;
  },
  /**
   * Matches error data from JDE to the form inputs to give error feedback to the user
   * @param {object} aisErrObj - error data from AIS
   * @param {string} errType - error or warning
   * @param {boolean} isGrid - suppresses field title in UI feedback, because JDE doesn't give specific grid error feedback
   * @param {string} options.moStructure - Media Object structure
   * @param {string} options.moKey - key ot Media Object structure
   **/
  getErrorMsgs: function (aisErrObj, errType, isGrid) { // refactor to comply with the parameter convention (data,options)
    var type;
    if (errType && errType.toLowerCase().search(/warn/) !== -1) {
      type = "Warning";
    } else {
      type = "Error";
    }
    var errArr = [];
    if (isGrid) { // for grids
      var titleArr = [];
      for (key in window.globals.titleList) {
        titleArr.push(window.globals.titleList[key]);
      };
      $.each(aisErrObj, function (i, o) {
        // get titles directly from titles Object
        var idArr = o.ERRORCONTROL.split(".");

        errArr.push({
          title: titleArr[idArr[2]],
          msg: o.MOBILE
        });
      });
    } else { // for non-grids
      $.each(aisErrObj, function (i, o) {
        errArr.push({
          id: o.ERRORCONTROL,
          msg: o.MOBILE
        });
      });
      $.each(window.globals.htmlInputs, function (i, o) { // loops through input objects reveived from AIS
        $.each(errArr, function (i2, o2) {
          if (o2.id == o.id) {
            errArr[i2].title = o.title;
          };
        });
      });
    }
    $.each(errArr, function (i, o) {
      $("#dataHolder").prepend("<tr><td>" + type + " on <b>Row " + window.globals.inputRow.ROW + "</b> and field <b>" + o.title + "</b> - " + o.msg + "</td></tr>");
    });
  },
  successOrFail: function (data, opts, param1) {
    var options = {};
    options.successMsg = opts.successMsg || "";
    options.isGrid = opts.isGrid || false;
    options.cb = opts.successCb || AISCLIENT.returnFromSuccess;
    options.closeObj = opts.closeObj || {};
    var formDataObj;
    $.each(data, function (i, o) {
      if (i.search("fs_") !== -1) {
        formDataObj = o;
      };
    });
    var errObj = formDataObj.errors;
    if (errObj.length > 0) {
      AISCLIENT.getErrorMsgs(errObj, "Error", options.isGrid);
      AISCLIENT.returnFromError(options.closeObj);
    } else {
      AISCLIENT.postSuccess(options.successMsg);
      options.cb(param1);
    }
  },
  postSuccess: function (msg) {
    $("#dataHolder").prepend("<tr class=row" + window.globals.inputRow.ROW + "><td>Row " + window.globals.inputRow.ROW + " - " + msg + ".</td></tr>");
  },
  postError: function (msg) {
    $("#dataHolder").prepend("<tr><td>Error on Row " + window.globals.inputRow.ROW + " - " + msg + "</td></tr>");
  },
  returnFromSuccess: function () {
    AISCLIENT.processedRows++;
    AISCLIENT.updateProgBar();

    if (window.globals.processQ) {
      window.globals.processQ.shift();


      if (window.globals.processQ.length > 0) {

        $("#dataHolder").prepend("<tr class='row" + window.globals.inputRow.ROW + "'><td>Row Successfully Processed.</td></tr>");
        $(".row" + window.globals.inputRow.ROW).remove();
        $("#rawTable").find("tr#" + window.globals.inputRow.ROW).remove();
        AISCLIENT.initFn(window.globals.processQ);

      } else {

        $("#rawTable").find("tr#" + window.globals.inputRow.ROW).remove();
        $(".row" + window.globals.inputRow.ROW).remove();
        AISCLIENT.cleanUp();

      }
    } else {
      AISCLIENT.cleanUp();
    }
  },
  returnFromError: function (opts) {
    try {
      opts.subForm;
      opts.closeID;
    } catch (err) {
      var opts = {};
      opts.subForm = false;
      opts.closeID = "";
    }

    function handleErrors() {
      AISCLIENT.errorRows++;
      AISCLIENT.processedRows++;
      if (window.globals.processQ) {
        window.globals.processQ.shift();
      }

      $(".row" + window.globals.inputRow.ROW).remove();
      AISCLIENT.updateProgBar();

      if (window.globals.processQ.length == 0) {
        AISCLIENT.cleanUp();
      } else {
        AISCLIENT.initFn(window.globals.processQ)
      }
    }
    if (opts.subForm) { // enabling this ensures that the HTML session is closed after an error occurss
      var reqObj = AISCLIENT.buildAppstackJSON({
        form: opts.subForm,
        type: "close"
      }, opts.closeID);
      AISCLIENT.getForm("appstack", reqObj).then(function (data) {
        handleErrors();
      });
    } else {
      handleErrors();
    }
  },
  handleLog: function () {
    if (AISCLIENT.isLoggedIn === true) {
      $("#logIn").removeClass("hide").addClass("hide");
      $("#logOut").removeClass("hide");
    } else {
      $("#logIn").removeClass("hide");
      $("#logOut").removeClass("hide").addClass("hide");
    }
  },
  logOut: function () {
    AISCLIENT.changeStatus({
      color: "grey",
      title: "Logging out...",
      message: "dropZone is logging you out of AIS."
    });
    var logoutObj = {
      "token": window.globals.token
    }
    var logoutUrl = window.globals.tokenUrl + "/logout";
    $.ajax({
      url: logoutUrl,
      dataType: "json",
      type: "POST",
      data: JSON.stringify(logoutObj),
      success: function (data) {
        AISCLIENT.changeStatus({
          color: "red",
          message: "dropZone has terminated your AIS session. It was great to serve you today!"
        });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        switch (jqXHR.status) {
          case 500:
            if (jqXHR.responseJSON.message.replace("Invalid Token") !== -1) {
              AISCLIENT.changeStatus({
                color: "red",
                message: "You have been logged out of AIS."
              });
              AISCLIENT.stopTokenChecking = true;
            } else {
              AISCLIENT.changeStatus({
                color: "red",
                message: "Status unknown. Please contact dropZone support."
              });
            }
            break;
          case 200:
            AISCLIENT.changeStatus({
              color: "red",
              message: "You have been logged out of AIS."
            });
            var aisConfig = window.localStorage.getItem("aisConfig");
            aisConfig.tokenExpires = moment();
            window.localStorage.setItem("aisConfig", JSON.stringify(aisConfig));
            AISCLIENT.stopTokenChecking = true;
            break;
          default:
            AISCLIENT.changeStatus({
              color: "red",
              message: "Unknown error. Please see the JavaScript Console for error details."
            });
        }
      },
      complete: function () {
        // set token expiry timestamp to NOW so that future checks will request a new token
        var aisConfig = window.localStorage.getItem("aisConfig");
        aisConfig.tokenExpires = moment();
        window.localStorage.setItem("aisConfig", JSON.stringify(aisConfig));
      }
    });
  },

  // clean up UI after drop is completed
  cleanUp: function () {

    if (window.globals.hasOutput === true) {
      $("#statusBlock").empty()
        .append("<h2>" + (AISCLIENT.totalRows - AISCLIENT.errorRows) + " successful rows and " + AISCLIENT.errorRows + " rows with errors.</h2>")
        .append("<div class='col-md-4'><button class='btn btn-block btn-default export2Excel'>Export Summary as Excel</button></div><div class='col-md-4'><button class='btn btn-block btn-default export2ExcelErrors'>Export Raw Error Data as Excel</button></div><div class='col-md-4'><button class='btn btn-block btn-default exportOutput'>Export Output</button></div>")
        .append("<p>All Rows Processed</p>");
      $("#outputHolder").append("</tbody></table>");
    } else {
      $("#statusBlock").empty()
        .append("<h2>" + (AISCLIENT.totalRows - AISCLIENT.errorRows) + " successful rows and " + AISCLIENT.errorRows + " rows with errors.</h2>")
        .append("<div class='col-md-6'><button class='btn btn-block btn-default export2Excel'>Export Summary as Excel</button></div>")
        .append("<div class='col-md-6'><button class='btn btn-block btn-default export2ExcelErrors'>Export Raw Error Data as Excel</button></div>")
        .append("<p>All Rows Processed</p>");
    }
    window.globals.fullDataArray.shift();
    AISCLIENT.handleMultiDrop();
    //window.recurseArray();
    // ga('send', 'event', {
    //   eventCategory: 'dropZone App',
    //   eventAction: 'finishDrop',
    //   eventLabel: globals.formNAME + ',' + globals.customer + ',' + AISCLIENT.totalRows + ',' + AISCLIENT.errorRows + ',' + globals.now + ',[form_name,customer,total_rows,error_rows,date]'
    // });

  },
  handleMultiDrop: function () {
    console.log("Into the loop #" + AISCLIENT.processedRows)
    $("#the_dropzone").remove()
    window.globals.htmlInputs = []
      /// cache the results from earlier cycle
    if (window.globals.fullDataArray.length != 0) {

      window['globals']['processQ'] = window.globals.fullDataArray[0];
      //console.log(window.globals.processQ)
      $("#newTable").remove()
      document.body.appendChild(buildHtmlTable(window['globals']['processQ'], "newTable"))
      var formName = window.globals.fullDataArray[0][0].FormName;
      var formSplit = formName.split('_');
      window.globals.formNAME = formName
      window.globals.version = window.globals.fullDataArray[0].Version;

      if (true) {
        //errHolder.push($("#dataHolder").html())
        rawHolder.push($("#newTable").prop('outerHTML'))
      }
      // this is how to call the forms intFn - window[formName]['getBrowseForm']();

      // processQ is now set up for the drop
      AISCLIENT.initProcess(window[formName]['getBrowseForm'])
    } else {
      console.log("Out of the loop")
      console.log(JSON.stringify(rawHolder))
    }

  },

  // keep track of all req and responses
  writeToDebug: function (newData) {

    AISCLIENT.debugArray.push(newData);

  },

  //function to get debug data
  getDebugData: function () {

    return AISCLIENT.debugArray;

  }

}
