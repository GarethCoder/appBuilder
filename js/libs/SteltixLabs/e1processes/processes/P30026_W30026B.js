// Cost Components
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "LITM"
            }, {
                "name": "MCU"
            }, {
                "name": "LEDG"
            }, {
                "name": "COST"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W30026C",
            closeID: "5"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

			// if extracted previously, an apostrophe will be in front of the zeros to ensure we don't lose zero, so need to strip it out
			if (inputRow.LEDG.substr(0, 1) == "'")
				inputRow.LEDG = inputRow.LEDG.substr(1);

            var reqObj = _.buildAppstackJSON({
                form: "P30026_W30026C",
                type: "open",
                turbo: true
            },["68",inputRow.LITM],["17",inputRow.MCU],["19",inputRow.LEDG],"30");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P30026_W30026C")) {
                    var rowArr = data.fs_P30026_W30026C.data.gridData.rowset;
                    var errObj = data.fs_P30026_W30026C.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (rowArr.length === 0) {
                            self.getAddForm(inputRow);
                        } else {
                            self.selectRow(inputRow);
                        }
                    }
                } else {
                    _.postError("An unknown error occurred in the find/browse form");
                    _.returnFromError();
                }
            });
        };
        self.selectRow = function(inputRow) {
            if (globals.htmlInputs.length === 0) { // only an empty array when first declared. When populated with data, it is an object.
                    var reqObj = _.buildAppstackJSON({
                    form: "W30026C"
                },"1.0","56"); // first run: store values
            } else {
				if (inputRow.EXTRACT)
					var reqObj = _.buildAppstackJSON({
						form: "W30026C",
						aliasNaming: true
					},"1.0","56"); // subsequent runs: ignore values
				else
					var reqObj = _.buildAppstackJSON({
						form: "W30026C",
						returnControlIDs: "1[32]"
					},"1.0","56"); // subsequent runs: ignore values
            }

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P30026_W30026B")) {
                    var errObj = data.fs_P30026_W30026B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (globals.htmlInputs.length === 0) {
                            globals.htmlInputs = data.fs_P30026_W30026B.data;
                            globals.titleList = globals.htmlInputs.gridData.titles;
                        }

                        if (inputRow.EXTRACT) {
							var gridRows = data.fs_P30026_W30026B.data.gridData.rowset;
                            if (gridRows.length > 0) {
                                var fieldObj = data.fs_P30026_W30026B.data;
                                $.each(fieldObj.gridData.rowset,function(key,object) {
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

								if (typeof (fieldObj.txtCostMethod_34) !== 'undefined' && fieldObj.txtCostMethod_34.value.substr(0, 1) == '0')
									fieldObj.txtCostMethod_34.value = "'"+fieldObj.txtCostMethod_34.value;
        
                                _.appendTable(fieldObj, 0, true);
                                _.postSuccess("Extracting data");
                            }
                            else {
                                _.postError("No records found. Please add the item before attempting to extract the data.");
                                _.returnFromError();
                            }
                        } else {

                            var rowsetArr = data.fs_P30026_W30026B.data.gridData.rowset;
                            var rowToUpdate = "add";
                            for (var i = 0; i < rowsetArr.length; i++) {
                                if (rowsetArr[i].sCostType_32.value === inputRow.COST) {
                                    rowToUpdate = rowsetArr[i].rowIndex;
                                };
                            }
                            if (rowToUpdate === "add") {
                                _.postSuccess("Adding Cost Component");
                                self.addToGrid(inputRow);
                            } else {
                                _.postSuccess("Updating Cost Components");
                                self.updateGrid(inputRow,rowToUpdate);
                            }
                        }
                    }
                } else {
                    _.postError("An unknown error occurred while entering the UPDATE form");
                    _.returnFromError();
                }
            });
        };
        self.getAddForm = function(inputRow) {
            if (globals.htmlInputs.length === 0) { // only an empty array when first declared. When populated with data, it is an object.
                var reqObj = _.buildAppstackJSON({
                    form: "W30026C",
                    returnControlIDs: true
                },"57"); // first run: store values
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W30026C",
                    returnControlIDs: "1[32]"
                },"57"); // subsequent runs: ignore values
            }

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P30026_W30026B")) {
                    var errObj = data.fs_P30026_W30026B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (globals.htmlInputs.length === 0) {
                            globals.htmlInputs = data.fs_P30026_W30026B.data;
                            globals.titleList = globals.htmlInputs.gridData.titles;
                        }
                        _.postSuccess("Adding Cost Component");
                        self.addToGrid(inputRow,"add");
                    }
                } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }
            });
        };
        self.addToGrid = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W30026B",
                type: "close",
                gridAdd: true,
                turbo: true,
                customGrid: true
            },["grid","32",inputRow.COST],"4");
            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Cost Component successfully added',isGrid:true});
            });
        };
        self.updateGrid = function(inputRow,rowToUpdate) {
            var reqObj = _.buildAppstackJSON({
                form: "W30026B",
                type: "close",
                gridUpdate: true,
                rowToSelect: rowToUpdate,
                turbo: true
            },"4");
            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Cost Component successfully updated',isGrid:true});
            });
        };
    };
    return new Process();
});