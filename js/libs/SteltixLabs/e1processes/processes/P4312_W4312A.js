define(['aisclient'], function (_) {
    var Process = function () {
      var self = this;
      self.reqFields = {
        titles: [{
          "name": "DOCO"
        }, {
          "name": "DCTO"
        }, {
          "name": "LINENO"
        }, {
          "name": "UORGE1"
        }, {
          "name": "LOCNE1"
        }, {
          "name": "RECOPT"
        }],
        isCustomTemplate: true
      };
      self.closeObj = {
        subForm: "W4312A",
        closeID: "5"
      };
      self.init = function () {
        var inputRow = globals.inputRow = globals.processQ[0];
        _.postSuccess("Processing row " + inputRow.ROW);
  
        var reqObj = _.buildAppstackJSON({
          form: "P4312_W4312F",
          type: "open"
        }, ["1[10]", inputRow.DOCO], ["1[11]", inputRow.DCTO], ["1[43]", inputRow.LINENO], "21");
  
        _.getForm("appstack", reqObj).then(function (data) {
          if (data.hasOwnProperty("fs_P4312_W4312F")) { // is form being returned? if not, lets try add.
            var rowArr = data.fs_P4312_W4312F.data.gridData.rowset;
            var errObj = data.fs_P4312_W4312F.errors;
            if (errObj.length > 0) {
              _.getErrorMsgs(errObj);
              _.returnFromError();
            } else if (rowArr.length > 0) {
              // Items were returned, we need to loop through and check if an add / update is required
              self.selectRow(inputRow)
            } else {
              _.postError("There was a problem finding the requested record, please verfiy the Order number / type and Line number");
              _.returnFromError();
            }
          } else {
            _.postError("An unknown error occurred in the find/browse form");
            _.returnFromError();
          }
        });
      };
  
      self.selectRow = function (inputRow) {
        var optionsObj2 = {
          form: "W4312F"
        };
  
        var reqObj2 = _.buildAppstackJSON(optionsObj2, "1.0", "4");
        
        _.getForm("appstack", reqObj2).then(function (data) {
          if (data.hasOwnProperty("fs_P4312_W4312A")) {
            var errObj = data.fs_P4312_W4312A.errors;
            var fieldData = data.fs_P4312_W4312A.data;
            var gridData = data.fs_P4312_W4312A.data.gridData;
            if (errObj.length > 0) {
              _.getErrorMsgs(errObj);
              _.returnFromError();
            } else {
              var optionsObj = {
                form: "W4312A",
                type: "execute",
                gridUpdate: true,
                customGrid: true
              };
  
              
              
  
              $.each(gridData.rowset, function(i, o){
                if (o.mnLineNumber_44.value == inputRow.LINENO) {
                   
                    optionsObj.rowToSelect = i;
                    return false;
                }
            });
            console.log("has qty = " + inputRow.hasOwnProperty("UORGE1"))
              if(inputRow.hasOwnProperty("UORGE1")){
                var reqObj = _.buildAppstackJSON(
                  optionsObj, ["grid", "382", inputRow.RECOPT], ["grid","116", inputRow.UORGE1],["grid", "126",inputRow.LOCNE1],["grid", "117", " "], "4", "4");
                
              } else {
                var reqObj = _.buildAppstackJSON(
                  optionsObj, ["grid", "382", inputRow.RECOPT],["grid", "117", " "],["grid", "126",inputRow.LOCNE1],  "4", "4");
  
              }
              _.getForm("appstack", reqObj).then(function (data) {
                if (data.hasOwnProperty("fs_P4312_W4312F")) {
                  var errObj = data.fs_P4312_W4312F.errors;
                  var warningObj = data.fs_P4312_W4312F.warnings;
                  if (errObj.length > 0) {
                    _.getErrorMsgs(errObj);
                    _.returnFromError();
                  } else
                  if (warningObj.length > 0) {
                    _.getErrorMsgs(warningObj);
                    _.returnFromError();
                  } else {
                    _.successOrFail(data, {
                      successMsg: 'Order receieved.'
                    });
                  }
                } else if(data.hasOwnProperty("fs_P4312_W4312A")){
                  var errObj = data.fs_P4312_W4312A.errors;
                  var warningObj = data.fs_P4312_W4312A.warnings;
                  if (errObj.length > 0) {
                    _.getErrorMsgs(errObj);
                    _.returnFromError();
                  } else
                  if (warningObj.length > 0) {
                    _.getErrorMsgs(warningObj);
                    _.returnFromError();
                  }
                } else {
                  _.postError("An Error occurred when processing the Order lines.");
                  _.returnFromError();
                }
              });
  
            }
          } else {
            _.postError("There was a problem processing the requested record, please verfiy the Order number / type and Line number and order setup");
            _.returnFromError();
          }
  
        });
      }
  
    };
    return new Process();
  });
  