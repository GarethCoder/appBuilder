// Print Msg Revisions
define(['aisclient'], function (_) {
  var Process = function () {
    var self = this;
    self.reqFields = {
      titles: [{
        "name": "INMG"
      }, {
        "name": "LNGP"
      }, {
        "name": "Attachment"
      }, {
        "name": "DL01"
      }, {
        "name": "EFTJ"
      }, {
        "name": "EXDJ"
      }],
      isCustomTemplate: false
    };
    self.closeObj = {
      subForm: "W40162D",
      closeID: "5"
    };
    self.moKey = []; // Print Message, LNGPuage
    self.moStructure = "GT4016A";
    self.attachment = "";
    self.init = function () {
      var inputRow = globals.inputRow = globals.processQ[0];
      _.postSuccess("Processing row " + inputRow.ROW);
      inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

      var reqObj = _.buildAppstackJSON({
        form: "P40162_W40162D",
        type: "open"
      }, ["1[6]", inputRow.INMG], ["39", inputRow.LNGP], "12");

      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty("fs_P40162_W40162D")) {
          var rowArr = data.fs_P40162_W40162D.data.gridData.rowset;
          var errObj = data.fs_P40162_W40162D.errors;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else if (rowArr.length === 0) {
            self.getAddForm(inputRow);
            _.postSuccess("Adding Print Message");
          } else if (rowArr.length === 1) {
            self.selectRow(inputRow);
            _.postSuccess("Print Message found");
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
    self.selectRow = function (inputRow, handleDate) {
      var optionsObj = {
        form: "W40162D"
      };

      if (inputRow.EXTRACT) {
        optionsObj.aliasNaming = true;
      }

      var reqObj = _.buildAppstackJSON(optionsObj, "1.0", "19");

      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty("fs_P40162_W40162C")) {
          var errObj = data.fs_P40162_W40162C.errors;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else {
            _.postSuccess("Entering UPDATE form");

            if (inputRow.EXTRACT) {

              self.moKey = [inputRow.INMG, inputRow.LNGP || ""];
              var reqObj = _.buildMediaJSON({
                service: "gettext",
                form: "P40162_W40162C",
                moStructure: self.moStructure,
                moKey: self.moKey
              }, inputRow["Attachment"]);
              _.getForm("mediaGet", reqObj).then(function (data2) {
                if (data2.hasOwnProperty('text')) {

                  data.fs_P40162_W40162C.data.z_ATT_9999 = {
                    id: 9999,
                    longName: 'Attachment',
                    internalValue: data2.text,
                    title: 'Attachment',
                    value: data2.text
                };

                  _.appendTable(data.fs_P40162_W40162C.data, self.reqFields.titles);
 
                  //self.closeSession();
                } else {
                  //self.closeSession();
                  _.appendTable(data.fs_P40162_W40162C.data, self.reqFields.titles);
                }
              });

            } else {
              self.updateForm(inputRow);
            }
          }
        } else if (data.hasOwnProperty("fs_P40162_W40162D")) {
          var errObj = data.fs_P40162_W40162D.errors;
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
        form: "W40162C"
      }, ["48", inputRow.EFTJ], ["50", inputRow.EXDJ], "3", "3");
      self.moKey = [inputRow.INMG, inputRow.LNGP || ""];
      _.getForm("appstack", reqObj).then(function (data) {
        _.successOrFail(data, {
          successMsg: 'Print Message updated. Updating Media Object',
          successCb: self.addMO
        }, inputRow);
      });
    };
    self.getAddForm = function (inputRow) {
      var reqObj = _.buildAppstackJSON({
        form: "W40162D"
      }, "13");
      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty("fs_P40162_W40162C")) {
          var errObj = data.fs_P40162_W40162C.errors;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else {
            _.postSuccess("Opening the ADD form");
            globals.htmlInputs = data.fs_P40162_W40162C.data;
            self.addForm(inputRow);
          }
        } else {
          _.postError("An unknown error occurred while entering the ADD form");
        }
      });
    };
    self.addForm = function (inputRow) {
      var reqObj = _.buildAppstackJSON({
        form: "W40162C"
      }, ["46", inputRow.INMG], ["78", inputRow.LNGP], ["64", inputRow.DL01], ["48", inputRow.EFTJ], ["50", inputRow.EXDJ], "3", "3");
      _.getForm("appstack", reqObj).then(function (data) {
        if (data === "500") {
          _.postSuccess("Print message added. Adding media object");
          self.moKey = [inputRow.INMG, inputRow.LNGP || ""];
          self.addMO(inputRow);
        } else if (data.hasOwnProperty("fs_P40162_W40162C")) {
          var errObj = data.fs_P40162_W40162C.errors;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else {
            _.postError("An uncaught error occurred while submitting the new record");
            _.returnFromError();
          }
        } else {
          _.postError("An unknown error occurred while submitting the new record");
          _.returnFromError();
        }
      });
    };
    self.addMO = function (inputRow) {
      var reqObj = _.buildMediaJSON({
        service: "updatetext",
        form: "P40162_W40162C",
        moStructure: self.moStructure,
        moKey: self.moKey
      }, inputRow["Attachment"]);
      _.getForm("mediaUpdate", reqObj).then(function (data) {
        console.log("Print Message attachment uploaded. Closing session");
        self.closeSession();
      });
    };
    self.closeSession = function () {
      var reqObj = _.buildAppstackJSON({
        form: "W40162C",
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
