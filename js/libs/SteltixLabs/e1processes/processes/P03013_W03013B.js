define(['aisclient'], function (_) {
  var Process = function () {
    var self = this;
    self.reqFields = {
      titles: [{
        name: "AN8"
      }, {
        name: "CO"
      }, ],
      isCustomTemplate: false
    };
    self.closeObj = {
      subForm: "W03013B",
      closeID: "12"
    };
    self.init = function () {
      var inputRow = globals.inputRow = globals.processQ[0];
      _.postSuccess("Processing row " + inputRow.ROW);
      inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

      if (inputRow.hasOwnProperty("CO") && inputRow.CO.substring(0, 1) === "'")
        inputRow.CO = inputRow.CO.substring(1);

      if (inputRow.hasOwnProperty("AN8") && inputRow.AN8.substring(0, 1) === "'")
        inputRow.AN8 = inputRow.AN8.substring(1);

      if (inputRow.hasOwnProperty("txt__Payment Terms - A/R__TRAR__30") && inputRow["txt__Payment Terms - A/R__TRAR__30"].substring(0, 1) === "'")
        inputRow["txt__Payment Terms - A/R__TRAR__30"] = inputRow["txt__Payment Terms - A/R__TRAR__30"].substring(1);

      var reqObj = _.buildAppstackJSON({
          form: "P03013_W03013A",
          type: "open"
        }, ["1[29]", inputRow.AN8], // Adress Number
        ["1[30]", inputRow.CO], // Company
        ["20", inputRow.AT1], // Search Type
        "15");

      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty("fs_P03013_W03013A")) {
          var rowArr = data.fs_P03013_W03013A.data.gridData.rowset;
          var errObj = data.fs_P03013_W03013A.errors;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else if (rowArr.length === 0 && !inputRow.EXTRACT) {
            // _.postError("Customer not found. Please use the Address Master to add this customer");
            // _.returnFromError();
            _.postSuccess('Adding Record');
            self.getAddForm(inputRow);
          } else if (rowArr.length >= 1) {
            self.selectRow(inputRow);
            _.postSuccess("Customer found");
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
    self.selectRow = function (inputRow) {
      var optionsObj = {
        form: "W03013A"
      };
      if (inputRow.EXTRACT) {
        optionsObj.aliasNaming = true;
        optionsObj.type = "close";
      }
      var reqObj = _.buildAppstackJSON(optionsObj, "1.0", "14");

      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty("fs_P03013_W03013B")) {
          var errObj = data.fs_P03013_W03013B.errors;
          var fieldData = data.fs_P03013_W03013B.data;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else {
            if (inputRow.EXTRACT) {
              _.postSuccess("Extracting data");

              fieldData.z_AT1 = {
                id: 54,
                longName: 'Search Type',
                internalValue: inputRow.AT1,
                title: 'AT1',
                value: inputRow.AT1
              };

              if (fieldData.hasOwnProperty("z_CO_20"))
                fieldData.z_CO_20.value = "'" + fieldData.z_CO_20.value;

              if (fieldData.hasOwnProperty("z_AN8_14"))
                fieldData.z_AN8_14.value = "'" + fieldData.z_AN8_14.value;

              if (fieldData.hasOwnProperty("z_TRAR_30"))
                fieldData.z_TRAR_30.value = "'" + fieldData.z_TRAR_30.value;

              _.appendTable(fieldData);
            } else {
              _.postSuccess("Entering the Revisions form");
              globals.htmlInputs = fieldData;
              self.updateForm(inputRow);
            }
          }
        } else if (data.hasOwnProperty("fs_P03013_W03013A")) {
          var errObj = data.fs_P03013_W03013A.errors;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else {
            _.postError("There was a problem entering the Revisions form");
            _.returnFromError();
          }
        } else {
          _.postError("An unknown error occurred in the find/browse form");
          _.returnFromError();
        }
      });
    };
    self.updateForm = function (inputRow) {
      var reqObj = _.buildAppstackJSON({
        form: "W03013B",
        type: "close",
        dynamic: true
      }, "11");

      _.getForm("appstack", reqObj).then(function (data) {
        _.successOrFail(data, {
          successMsg: "Customer updated"
        });
      });
    };

    // ADD FORM FUNCTION

    self.getAddForm = function (inputRow) {

      var reqObj = _.buildAppstackJSON({
        form: "W03013A",
      }, "50");

      _.getForm('appstack', reqObj).then(function (data) {
        if (data.hasOwnProperty('fs_P03013_W03013B')) {
          var errObj = data.fs_P03013_W03013B.errors;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else {
            if (globals.htmlInputs.length === 0) {
              globals.htmlInputs = data.fs_P03013_W03013B;
            }
            self.addForm(inputRow);
            _.postSuccess('Entering new Record data');
          }
        } else {
          _.postError('An unknown error occurred while entering the ADD form');
          _.returnFromError();
        }
      });
    };

    self.addForm = function (inputRow) {
      var optionsObj = {};
      optionsObj = {
        form: 'W03013B',
        type: 'close',
        gridAdd: true,
        customGrid: true
      };

      var reqObj = _.buildAppstackJSON(optionsObj, ["14", inputRow.AN8], // Adress Number
        ["20", inputRow.CO], // Company
        "11");

      _.getForm('appstack', reqObj).then(function (data) {
        _.successOrFail(data, {
          successMsg: 'Record added'
        });
      });
    };
  };
  return new Process();
});
