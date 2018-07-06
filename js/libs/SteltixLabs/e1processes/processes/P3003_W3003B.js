// Routing Information
define(['aisclient'], function (_) {
  var Process = function () {
    var self = this;
    self.reqFields = {
      titles: [{
          "name": "LITM"
        }, {
          "name": "MMCU"
        }, {
          "name": "MCU"
        }
      ],
      isCustomTemplate: false
    };
    self.closeObj = {
      subForm: "W3003C",
      closeID: "5"
    };
    self.multipleRows = false;
    self.indicesArr = [];
    self.init = function () {
      var inputRow = globals.inputRow = globals.processQ[0];
      $.each(inputRow, function (i, o) {
        inputRow[i] = o.toString().trim();
      });
      _.postSuccess("Processing row " + inputRow.ROW);

      if (inputRow.hasOwnProperty("EXTRACT")) {
        var extractStr = inputRow.EXTRACT.toString().toLowerCase().trim();
        inputRow.EXTRACT = extractStr === "true" || extractStr === "y" || extractStr === "yes" || extractStr === "1" ? inputRow.EXTRACT = true : inputRow.EXTRACT = false;
      } else {
        inputRow.EXTRACT = false;
      }
      var reqObj = _.buildAppstackJSON({
        form: "P3003_W3003C",
        type: "open",
        turbo: true
      // }, ["31", inputRow.LITM], ["7", inputRow.MMCU], ["1[24]", inputRow.MCU], ["1[25]", inputRow.OPSQ], ["1[152]", inputRow.EFFF], "65");
      }, ["31", inputRow.LITM], ["7", inputRow.MMCU], ["1[24]", inputRow.MCU], ["1[208]", inputRow["OPSQ"]], ["144", inputRow["EFFF"]], "65");

      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty("fs_P3003_W3003C")) {
          var rowArr = data.fs_P3003_W3003C.data.gridData.rowset;
          var errObj = data.fs_P3003_W3003C.errors;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else if (rowArr.length === 0 && !inputRow.EXTRACT) {
            self.getAddForm(inputRow);
            _.postSuccess("Adding Routing Information");
          } else if (rowArr.length === 0 && inputRow.EXTRACT) {
            _.postError("No item found. Please add the item before attempting to extract the data.");
            _.returnFromError();
          } else {
            _.postSuccess("Routing Information found");
            self.selectRow(inputRow);
          }
        } else {
          _.postError("An unknown error occurred in the find/browse form");
          _.returnFromError();
        }
      });
    };
    self.selectRow = function (inputRow) {
      var optionsObj = {
        form: "W3003C"
      };
      if (inputRow.EXTRACT) {
        optionsObj.aliasNaming = true;
        optionsObj.type = "close";
      }
      var reqObj = _.buildAppstackJSON(optionsObj, "1.0", "66");

      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty("fs_P3003_W3003B")) {
          if (globals.htmlInputs.length === 0) {
            globals.htmlInputs = data.fs_P3003_W3003B.data;
            globals.titleList = data.fs_P3003_W3003B.data.gridData.titles;
          }
          var rowsetArr = data.fs_P3003_W3003B.data.gridData.rowset;
          var errObj = data.fs_P3003_W3003B.errors;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else {
            var rowToSelect = "add";
            self.multipleRows = false;
            self.indicesArr = [];
			if (inputRow.EXTRACT) { 

				var fieldObj = data.fs_P3003_W3003B.data;
				if (rowsetArr.length > 0)
        {
          
					$.each(fieldObj.gridData.rowset,function(key,object) {
						if (fieldObj.gridData.rowset[key].hasOwnProperty("MOExist")) 
							delete fieldObj.gridData.rowset[key].MOExist;
						if (fieldObj.gridData.rowset[key].hasOwnProperty("rowIndex")) 
							delete fieldObj.gridData.rowset[key].rowIndex;
						// if (fieldObj.gridData.rowset[key].hasOwnProperty("MOInfo")) 
            // 	delete fieldObj.gridData.rowset[key].MOInfo;
            
            // loop through the object to extrac aliases
            for (var aliasKey in object) { 
              if (!object[aliasKey].hasOwnProperty("alias")) {
                  var colArr = aliasKey.split("_");
                  if (colArr.length === 3) // means all should be ok and index 1 is alias
                      fieldObj.gridData.rowset[key][aliasKey].alias = colArr[1];
              }
          }
          });


          _.appendTable(fieldObj, 0, true);
          _.removeDuplicateRows($('#outputHolder table'));
				  _.postSuccess("Extracting data");
				}

								
			} 
			else { 
				for (var i = 0; i < rowsetArr.length; i++) {
					if (inputRow["OPSQ"] && rowsetArr[i].sWorkCenter_135.value === inputRow.MCU && rowsetArr[i].mnOperSeq_39.internalValue === parseFloat(inputRow["OPSQ"])) { // match Work Center AND Operational Sequence
						self.indicesArr.push(rowsetArr[i].rowIndex);
					} else 
					if (!inputRow["OPSQ"] && rowsetArr[i].sWorkCenter_135.value === inputRow.MCU) { // match Work Center only, if Operational Sequence is left out
						self.indicesArr.push(rowsetArr[i].rowIndex);
					}
				}

				var indicesSize = self.indicesArr.length;
				// insert EXTRACT breakaway
				if (inputRow.EXTRACT && rowToSelect === "add") {
				  _.postError("Record is not present for export");
				  _.returnFromError();
				} else if (inputRow.EXTRACT && typeof rowToSelect === "number") {
				  _.postSuccess("Extracting data");
				  _.appendTable(rowsetArr[rowToSelect]);
				} else if (indicesSize === 0) {
				  rowToSelect = "add";
				} else if (indicesSize === 1) {
				  rowToSelect = self.indicesArr[0];
				} else if (indicesSize > 1) {
				  self.multipleRows = true;
				} else {
				  _.postError("Unknown error in matching the template rows to the JDE rows");
				  _.returnFromError();
				}

				if (rowToSelect === "add")
				{
					_.postSuccess("Entering Routing Information ADD form");
					self.addToGrid(inputRow);
				} else {
					_.postSuccess("Entering Routing Information UPDATE form");
					self.updateGrid(inputRow, rowToSelect);
				}
			}
          }
        } else {
          _.postError("An unknown error occurred while entering the UPDATE form");
          _.returnFromError();
        }
      });
    };
    self.getAddForm = function (inputRow) {
      var reqObj = _.buildAppstackJSON({
        form: "W3003C"
      }, "70");
      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty("fs_P3003_W3003B")) {
          if (globals.htmlInputs.length === 0) {
            globals.htmlInputs = data.fs_P3003_W3003B.data;
            globals.titleList = data.fs_P3003_W3003B.data.gridData.titles;
          }
          var errObj = data.fs_P3003_W3003B.errors;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else {
            _.postSuccess("Entering Routing Information ADD form");
            self.updateGrid(inputRow);
          }
        } else {
          _.postError("An unknown error occurred while entering the ADD form");
          _.returnFromError();
        }
      });
    };
    self.addToGrid = function (inputRow) {
      var reqObj = _.buildAppstackJSON({
        form: "W3003B",
        type: "close",
        dynamic: true,
        gridAdd: true,
        customGrid: true
      }, ["29", inputRow.LITM], ["8", inputRow.MMCU], ["grid", "135", inputRow.MCU], ["grid", "39", inputRow.OPSQ], ["grid", "115", inputRow.grid__Description____115], "4");
      _.getForm("appstack", reqObj).then(function (data) {
        _.successOrFail(data, {
          successMsg: 'Routing Information successfully added',
          isGrid: true
        });
      });
    };
    self.updateGrid = function (inputRow, rowToSelect) {
      if (rowToSelect === "add" && self.multipleRows === false) { // inserts row
        self.addFlag = true;
        var reqObj = _.buildAppstackJSON({
          form: "W3003B",
          type: "close",
          gridAdd: true,
          dynamic: true
        }, [inputRow.LITM, "29"], [inputRow.MMCU, "8"], "4");
      } else { // updates row
        if (self.multipleRows) { // if all work centre rows need to be updated
          var reqObj = _.buildAppstackJSON({
            form: "W3003B",
            type: "close",
            gridUpdate: true,
            gridMultiple: true,
            gridMultipleIndices: self.indicesArr,
            dynamic: true
          }, "4");
        } else { // if only 1 work centre row needs to be updated
          var reqObj = _.buildAppstackJSON({
            form: "W3003B",
            type: "close",
            gridUpdate: true,
            rowToSelect: rowToSelect,
            dynamic: true
          }, "4");
        }
      }

      _.getForm("appstack", reqObj).then(function (data) {
        _.successOrFail(data, {
          successMsg: 'Routing Information successfully updated',
          isGrid: true
        });
      });
    }
  };
  return new Process();
});
