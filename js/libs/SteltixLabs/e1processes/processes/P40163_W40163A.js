// Item Notes
define(['aisclient'], function (_) {
  var Process = function () {
    var self = this;
    self.reqFields = {
      titles: [{
        "name": "LITM"
      }, {
        "name": "LNGP"
      }, {
        "name": "Attachment"
      }, {
        "name": "EFTJ"
      }, {
        "name": "EXDJ"
      }],
      isCustomTemplate: false
    };
    self.closeObj = {
      subForm: "W40163B",
      closeID: "5"
    };
    self.moKey = []; // shortItemNo, LNGPuage
    self.moStructure = "GT4016B";
    self.attachment = "";
    self.init = function () {
      var inputRow = globals.inputRow = globals.processQ[0];
      _.postSuccess("Processing row " + inputRow.ROW);
      inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

      var reqObj = _.buildAppstackJSON({
        form: "P40163_W40163B",
        type: "open"
      }, ["52", inputRow.LNGP], ["1[9]", inputRow.LITM], "6");

      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty("fs_P40163_W40163B")) {
          var rowArr = data["fs_P40163_W40163B"].data.gridData.rowset;
          var errObj = data["fs_P40163_W40163B"].errors;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else if (rowArr.length === 0) {
            _.postSuccess("Adding Item Note");
            self.getAddForm(inputRow);
          } else if (rowArr.length === 1) {
            self.moKey = [rowArr[0]["mnShortItemNo_15"].value, inputRow.LNGP || ""];
            _.postSuccess("Item Note found");
            self.selectRow(inputRow);
          } else {
            _.postError("There was a problem finding the requested record, or there are duplicates");
            _.returnFromError();
          }
        } else {
          _.postError("An unknown error occurred in the find/browse form");
          _.returnFromError();
        }
      });
    };
    self.getAddForm = function (inputRow) {
      var reqObj = _.buildAppstackJSON({
        form: "W40163B"
      }, "22");

      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty("fs_P40163_W40163A")) {
          var errObj = data.fs_P40163_W40163A.errors;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else {
            globals.htmlInputs = data["fs_P40163_W40163A"].data;
            _.postSuccess("Entering Item Note data");
            self.submitAdd(inputRow);
          }
        } else {
          _.postError("Unknown error occurred while entering the ADD form");
          _.returnFromError();
        }
      });
    };
    self.selectRow = function (inputRow, handleDate) {
      var reqObj = _.buildAppstackJSON({
        form: "W40163B"
      }, "1.0", "29");

      if (inputRow.EXTRACT) 
        reqObj.aliasNaming = true;

      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty("fs_P40163_W40163A")) {
          var errObj = data.fs_P40163_W40163A.errors;
          var fieldObj = data.fs_P40163_W40163A.data;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else if (inputRow.EXTRACT) {
            _.postSuccess("Extracting data");
            _.appendTable(fieldObj);
          } else {
            _.postSuccess("Entering UPDATE form");
            self.updateForm(inputRow);
          }
        } else if (data.hasOwnProperty("fs_P40163_W40163B")) {
          var errObj = data.fs_P40163_W40163B.errors;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else {
            _.postError("An uncaught error occurred while entering the UPDATE form");
            _.returnFromError();
          }
        } else {
          _.postError("An unknown error occurred while entering the UPDATE form");
          _.returnFromError();
        }
      });
    };
    self.updateForm = function (inputRow) {
      var reqObj = _.buildAppstackJSON({
        form: "W40163A",
        type: "close"
      }, ["6", inputRow.EFTJ], ["27", inputRow.EXDJ], "3", "3");

      _.getForm("appstack", reqObj).then(function (data) {
        _.successOrFail(data, {
          successMsg: 'Item Note updated. Retrieving Media Object key',
          successCb: self.getMoKey
        }, inputRow);
      });
    };
    self.submitAdd = function (inputRow) {
      var reqObj = _.buildAppstackJSON({
        form: "W40163A",
        type: "close",
        dynamic: true
      }, ["20", inputRow.LITM], ["30", inputRow.LNGP], ["64", inputRow.DSC1], ["6", inputRow.EFTJ], ["27", inputRow.EXDJ], "3", "3");

      _.getForm("appstack", reqObj).then(function (data) {
        if (data === "500") {
          _.postSuccess("Item Note added. Retrieving Media Object key");
          self.getMoKey(inputRow);
        } else if (data.hasOwnProperty("fs_P40163_W40163A")) {
          var errObj = data.fs_P40163_W40163A.errors;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else {
            _.postError("An uncaught error occurred while submitting the ADD form");
            _.returnFromError();
          }
        } else {
          _.postError("An unknown error occurred while submitting the ADD form");
          _.returnFromError();
        }
      });
    };
    self.getMoKey = function (inputRow) {
      var reqObj = _.buildAppstackJSON({
        form: "P40163_W40163B",
        type: "open"
      }, ["52", inputRow.LNGP], ["1[9]", inputRow.LITM], "6");

      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty("fs_P40163_W40163B")) {
          var rowArr = data["fs_P40163_W40163B"].data.gridData.rowset;
          var errObj = data["fs_P40163_W40163B"].errors;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else if (rowArr.length === 0) {
            _.postError("Code 001: dropZone was unable to retrieve the Media Object key");
            _.returnFromError();
          } else if (rowArr.length === 1) {
            self.moKey = [rowArr[0]["mnShortItemNo_15"].value, inputRow.LNGP || ''];
            console.log("TEXT KEY == "+self.moKey);
            self.moBrowse(inputRow);
            _.postSuccess("Media Object key found, inserting Media Object");
          } else {
            _.postError("Code 002: dropZone was unable to retrieve the Media Object key");
            _.returnFromError();
          }
        } else {
          _.postError("Code 003: dropZone was unable to retrieve the Media Object key");
          _.returnFromError();
        }
      });
    };
    self.moBrowse = function (inputRow) {
      if (inputRow.hasOwnProperty('Attachment')) {
        var reqObj = _.buildMediaJSON({
          service: "updatetext",
          form: "P40163_W40163A",
          moStructure: self.moStructure,
          moKey: self.moKey
        }, inputRow["Attachment"]);
        
        _.getForm("mediaUpdate", reqObj).then(function (data) {
          console.log("Item Note attachment uploaded. Closing session");
          self.closeSession();
        });
      } else {
        self.closeSession();
      }

    };
    self.closeSession = function () {
      var reqObj = _.buildAppstackJSON({
        form: "W40163A",
        type: "close"
      });
      _.getForm("appstack", reqObj).then(function (data) {
        _.postSuccess("HTML session closed.");
        _.returnFromSuccess();
      });
    };
  };
  return new Process();
});
