// ENTRY FORM: P51006_W51006R
// EDIT / UPDATE FORM: P510121_W510121B
// ADD FORM: P51006_W51006S

define(['aisclient'], function (_) {
  var Process = function () {
    var self = this;
    self.reqFields = {
      titles: [{
          name: "MCU", // Job Number
          id: "1[13]",
        },
        {
          name: "CO", // Company
          id: "1[15]",
        },
      ],
      isCustomTemplate: false,
    };
    self.closeObj = {
      subForm: "W510121B",
      closeID: "5",
    };

    // ENTRY FORM: P51006_W51006R
    // EDIT / UPDATE FORM: P510121_W510121B
    // ADD FORM: P51006_W51006S

    self.init = function () {
      var inputRow = globals.inputRow = globals.processQ[0];
      _.postSuccess("Processing row " + inputRow.ROW);

      inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

      if (!inputRow.hasOwnProperty("grid__Cost Code__SUB__36")) {
        _.postError("Cost Code is required");
        _.returnFromError();
      } else {

        if (inputRow.hasOwnProperty("grid__Cost Code__SUB__36") && inputRow["grid__Cost Code__SUB__36"].substr(0, 1) == "'") {
          inputRow["grid__Cost Code__SUB__36"] = inputRow["grid__Cost Code__SUB__36"].substr(1);
        }

        if (inputRow.hasOwnProperty("sCo_15") && inputRow["sCo_15"].substr(0, 1) == "'") {
          inputRow["sCo_15"] = inputRow["sCo_15"].substr(1);
        }

        reqObj = _.buildAppstackJSON({
          form: "P51006_W51006R",
          type: "open",
        }, ["1[13]", inputRow.MCU], ["1[15]", inputRow.CO], "6");

        _.getForm("appstack", reqObj).then(function (data) {
          var rowArr = data.fs_P51006_W51006R.data.gridData.rowset;
          var errObj = data.fs_P51006_W51006R.errors;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else if (rowArr.length === 1) {
            _.postSuccess("Selecting Job Master record");
            self.selectRow(inputRow);
          } else if (rowArr.length === 0) {
            _.postSuccess("Adding Job Master record");
            self.getAddForm(inputRow);
          } else {
            _.postError("There was a problem finding the requested record, or there are duplicates");
            _.returnFromError();
          }
        });
      }
    };

    // ENTRY FORM: P51006_W51006R
    // EDIT / UPDATE FORM: P510121_W510121B
    // ADD FORM: P51006_W51006S

    self.getAddForm = function (inputRow) {

      var reqObj = _.buildAppstackJSON({
        form: "W51006R",
      }, "23");

      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty("fs_P51006_W51006S")) {
          var errObj = data.fs_P51006_W51006S.errors;
          var fieldData = data.fs_P51006_W51006S.data;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else {
            globals.htmlInputs = fieldData;
            self.addForm(inputRow);
          }
        } else {
          _.postError("An unknown error occurred while entering the ADD form");
          _.returnFromError();
        }
      });
    };

    // ENTRY FORM: P51006_W51006R
    // EDIT / UPDATE FORM: P510121_W510121B
    // ADD FORM: P51006_W51006S


    self.addForm = function (inputRow) {
      var optionsObj = {
        form: 'W51006S',
        type: 'close',
        dynamic: true,
      };

      var reqObj = _.buildAppstackJSON(optionsObj, ["27", inputRow.CO], // Company
        ["7", inputRow.MCU], // Job Number
        "3");

      _.getForm('appstack', reqObj).then(function (data) {
        _.successOrFail(data, {
          successMsg: 'Record added',
        });
      });
    };

    // ENTRY FORM: P51006_W51006R
    // EDIT / UPDATE FORM: P510121_W510121B
    // ADD FORM: P51006_W51006S

    self.insertNewData = function (inputRow) {

      var reqObj = _.buildAppstackJSON({
        form: "W510121B",
        dynamic: true,
        type: "close",
        gridAdd: true,
      }, "4");
      _.getForm("appstack", reqObj).then(function (data) {
        _.successOrFail(data, {
          successMsg: 'Job Master Record updated.',
          isGrid: true,
        });
      });

    };

    // ENTRY FORM: P51006_W51006R
    // EDIT / UPDATE FORM: P510121_W510121B
    // ADD FORM: P51006_W51006S

    self.selectRow = function (inputRow) {
      var optionsObj = {
        form: "W51006R",
      };

      if (inputRow.EXTRACT) {
        optionsObj.aliasNaming = true;
        optionsObj.type = "close";
      }
      var reqObj = _.buildAppstackJSON(optionsObj, "1.0", "28");

      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty("fs_P510121_W510121B")) {
          var errObj = data.fs_P510121_W510121B.errors;
          var fieldData = data.fs_P510121_W510121B.data;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else if (inputRow.EXTRACT) {

            var fieldObj = data.fs_P510121_W510121B.data;

            if (!inputRow.hasOwnProperty("CO")) {
              inputRow["CO"] = '';
            }

            fieldObj.z_CO_9999 = {
              id: 9999,
              longName: 'Company',
              internalValue: inputRow.CO,
              title: 'CO',
              value: inputRow.CO,
            };

            $.each(fieldObj.gridData.rowset, function (key, object) {
              if (fieldObj.gridData.rowset[key].hasOwnProperty("MOExist"))
                delete fieldObj.gridData.rowset[key].MOExist;
              if (fieldObj.gridData.rowset[key].hasOwnProperty("rowIndex"))
                delete fieldObj.gridData.rowset[key].rowIndex;

              // loop through the object to extrac aliases
              for (var aliasKey in object) {
                if (!object[aliasKey].hasOwnProperty("alias")) {
                  var colArr = aliasKey.split("_");
                  if (colArr.length === 3) // means all should be ok and index 1 is alias
                    fieldObj.gridData.rowset[key][aliasKey].alias = colArr[1];
                }
              }
            });
            _.postSuccess("Extracting data");
            _.appendTable(fieldObj, 0, true);
          } else {
            globals.htmlInputs = fieldData;
            globals.titleList = fieldData.gridData.titles;
            var rowArr = fieldData.gridData.rowset;
            var rowToSelect = "add";

            if (!inputRow.hasOwnProperty("grid__Cost Type__OBJ__159")) {
              inputRow["grid__Cost Type__OBJ__159"] = "";
            }

            if (!inputRow.hasOwnProperty("grid__Cost Code__SUB__36")) {
              inputRow["grid__Cost Code__SUB__36"] = "";
            }

            for (var i = 0; i < rowArr.length; i++) {

              if (inputRow["grid__Cost Code__SUB__36"].toLowerCase() === rowArr[i]["sCostCode_36"].value.toLowerCase() &&
                inputRow["grid__Cost Type__OBJ__159"].toLowerCase() === rowArr[i]["sCostType_159"].value.toLowerCase()) {
                rowToSelect = i;
                break;
              }
            }

            if (rowToSelect === "add") {
              if (!inputRow.hasOwnProperty("grid__Cost Code__SUB__36")) {
                _.postError("Cost Code is required");
                _.returnFromError();
              } else {
                _.postSuccess("Adding record to Job Master");
                self.insertNewData(inputRow);
              }
            } else {
              if (inputRow.hasOwnProperty("NEWCOSTTYPE")) {
                inputRow["grid__Cost Type__OBJ__159"] = inputRow["NEWCOSTTYPE"];
              }
              _.postSuccess("Updating grid");
              self.updateForm(inputRow, rowToSelect);
            }
          }
        } else {
          _.postError("An unknown error occurred while entering the UPDATE form");
          _.returnFromError();
        }
      });
    };

    // ENTRY FORM: P51006_W51006R
    // EDIT / UPDATE FORM: P510121_W510121B
    // ADD FORM: P51006_W51006S

    self.updateForm = function (inputRow, rowToSelect) {

      // if (inputRow.hasOwnProperty("NEWCOSTTYPE")) {
      //     var reqObj = _.buildAppstackJSON({
      //         form: "W510121B",
      //         dynamic: true,
      //         rowToSelect: rowToSelect,
      //         type: "close",
      //         gridUpdate: true,
      //         customGrid: true
      //     }, ["grid", "159", inputRow.NEWCOSTTYPE], "4");

      // } else {

      var reqObj = _.buildAppstackJSON({
        form: "W510121B",
        dynamic: true,
        rowToSelect,
        type: "close",
        gridUpdate: true,
      }, "4");
      // }

      _.getForm("appstack", reqObj).then(function (data) {
        _.successOrFail(data, {
          successMsg: 'Job Master Record updated.',
          isGrid: true,
        });
        // _.postSuccess("Job Master Record updated.");
        // _.returnFromSuccess();
      });
    };
  };
  return new Process();
});