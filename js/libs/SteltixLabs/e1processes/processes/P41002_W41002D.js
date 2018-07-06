// Unit of Measure Conversions
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "LITM"
            }, {
                name: "UM"
            }, {
                name: "CONV"
            }, {
                name: "RUM"
            }, {
                name: "USTR"
            }, {
                name: "EXSO"
            }, {
                name: "EXPO"
            }],
            isCustomTemplate: true
        };
        self.closeObj = {
            subForm: "W41002A",
            closeID:"5"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            var reqObj = _.buildAppstackJSON({
                form: "P41002_W41002A",
                type: "open",
                aliasNaming: true
            },["41",inputRow.LITM],"29");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41002_W41002A")) {
                    var rowArr = data.fs_P41002_W41002A.data.gridData.rowset;
                    var errObj = data.fs_P41002_W41002A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT && data.fs_P41002_W41002A.data.gridData.rowset.length == 0 /* && rowToUpdate !== "add" */) {
                        _.postError("No item found. Please add the item before attempting to extract the data.");
                        _.returnFromError();
                        /*var populateGridData = false;
                        if (data.fs_P41002_W41002A.data.hasOwnProperty("gridData")) {
                            populateGridData = (data.fs_P41002_W41002A.data.gridData.rowset.length > 0);
                             $.each(data.fs_P41002_W41002A.data.gridData.rowset,function(key,object) {
                                if (data.fs_P41002_W41002A.data.gridData.rowset[key].hasOwnProperty("MOExist")) 
                                    delete data.fs_P41002_W41002A.data.gridData.rowset[key].MOExist;
                                if (data.fs_P41002_W41002A.data.gridData.rowset[key].hasOwnProperty("rowIndex")) 
                                    delete data.fs_P41002_W41002A.data.gridData.rowset[key].rowIndex;
                                
                                // loop through the object to extrac aliases
                                for (var aliasKey in object) { 
                                    if (!object[aliasKey].hasOwnProperty("alias")) {
                                        var colArr = aliasKey.split("_");
                                        if (colArr.length === 3) // means all should be ok and index 1 is alias
                                            data.fs_P41002_W41002A.data.gridData.rowset[key][aliasKey].alias = colArr[1];
                                    }
                                }
 
                            });
                        }

                        if (populateGridData) {
                           // $.each(data.fs_P41002_W41002A.data.gridData.rowset,function(key,object) {
                                _.appendTable(data.fs_P41002_W41002A.data, self.reqFields.titles);
                           // });
                            _.postSuccess("Extracting data");
                        } */
                        
                    } else if (rowArr.length === 0) {
                        self.getAddForm(inputRow);
                        _.postSuccess("Adding UoM Conversion");
                    } else {
                        self.selectRow(inputRow); // UPDATE OR EXTRACT
                        _.postSuccess("UoM Conversion found");
                    }
                } else {
                    _.postError("An unknown error occurred in the find/browse form");
                    _.returnFromError();
                }
            });
        };
        self.selectRow = function(inputRow) {
            var optionsObj = {
                form: "W41002A"                
            }
            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            } else {
                optionsObj.returnControlIDs = true;
            }
            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","83"); // row exit is 83, check button is 4

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41002_W41002D")) {
                    var errObj = data.fs_P41002_W41002D.errors;
                    var fieldObj = data.fs_P41002_W41002D.data;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    }
                    else if (inputRow.EXTRACT) {
                        if (inputRow.EXTRACT) {
							// clearout array
							var emptyFields = [ 
								{ 'type': 'grid', 'value': 'z_EV02_21'}, 
								{ 'type': 'grid', 'value': 'z_EV01_20'}, 
								{ 'type' : 'object', 'value': 'z_OWUMSTR_35'}, 
								{ 'type' : 'object', 'value': 'z_UOM1_29'}
							];

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
			
									// clear out fields that must be blank for an import
									$.each(emptyFields, function (emptyFieldKey, emptyFieldObj) {
										if (emptyFieldObj.type === 'object' && fieldObj.hasOwnProperty(emptyFieldObj.value))
											eval("fieldObj."+emptyFieldObj.value+".value=''");

										if (emptyFieldObj.type === 'grid' && fieldObj.gridData.rowset[key].hasOwnProperty(emptyFieldObj.value))
											eval("fieldObj.gridData.rowset[key]."+emptyFieldObj.value+".value=''");
									});
				
                                }
 
                            });
                        }
                        _.appendTable(fieldObj, 0, true);
                        _.postSuccess("Extracting data");
                    }
                    else {
                        if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                            globals.htmlInputs = fieldObj;
                            globals.titleList = fieldObj.gridData.titles;
                        }
                        var rowsetArr = fieldObj.gridData.rowset;
                        var rowToUpdate = "add";
                        for (var i = 0; i < rowsetArr.length; i++) {
                            if (rowsetArr[i].sToUoM_16.value === inputRow.RUM && rowsetArr[i].sFromUoM_14.value === inputRow.UM) {
                                rowToUpdate = rowsetArr[i].rowIndex;
                            };
                        };
                        if (rowToUpdate !== "add") {
                            _.postSuccess("Updating UoM Conversion");
                            self.updateGrid(inputRow,rowToUpdate);
                        } else {
                            _.postSuccess("Adding UoM Conversion");
                            self.addToGrid(inputRow);
                        }
                    } 
                } else {
                    _.postSuccess("An unknown error occurred while selecting the Unit of Measure");
                    _.returnFromError(globals.closeObj);
                }
            });
        };
        self.getAddForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W41002A",
                returnControlIDs: true
            },"28");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41002_W41002D")) {
                    var errObj = data.fs_P41002_W41002D.errors;
                    var rowArr = data.fs_P41002_W41002D.data.gridData.rowset;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                            globals.htmlInputs = data.fs_P41002_W41002D.data;
                            globals.titleList = data.fs_P41002_W41002D.data.gridData.titles;
                        }
                        _.postSuccess("Adding new UoM Conversion");
                        self.addToGrid(inputRow);
                    }
                } else {
                    _.postSuccess("An unknown error occurred while selecting the Unit of Measure");
                    _.returnFromError(globals.closeObj);
                }
            });
        };
        self.updateGrid = function(inputRow,rowToUpdate) {
            var reqObj = _.buildAppstackJSON({
                form: "W41002D", 
                type: "close", 
                gridUpdate: true, 
                rowToSelect: rowToUpdate, 
                customGrid: true
            },["grid","14",inputRow.UM],
            ["grid","15",inputRow.CONV],
            ["grid","16",inputRow.RUM],"12","12");
           
            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'UoM Conversion updated', isGrid: true});
            });
        };
        self.addToGrid = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W41002D",
                type: "close",
                gridAdd: true,
                customGrid: true,
            },["27",inputRow.LITM],
            ["grid","14",inputRow.UM],
            ["grid","15",inputRow.CONV],
            ["grid","16",inputRow.RUM],"12");
            
            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'UoM Conversion added', isGrid: true});
            });
        };
    };
    return new Process();
});
