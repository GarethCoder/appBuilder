define(['aisclient'],function(_){
    // ITEM MASTER TAG
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "LITM",
                id: 123,
            },
            {
                name: "Z59FLDVL",
                id: 23
            },
        ],
            isCustomTemplate: false
        };
    	self.closeObj = {
    		subForm: "W594101AB",
    		closeID:"3"
    	};
        self.isExtract = false;
    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            if (inputRow.hasOwnProperty("LITM") && inputRow.hasOwnProperty("Z59FLDVL")) {
                inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);
                var reqObj = _.buildAppstackJSON({
                    form: "P4101_W4101E",
                    type: "open",
                },["1[123]",inputRow.LITM],"22");

                _.getForm("appstack",reqObj).then(function(data){
                    if (data.hasOwnProperty("fs_P4101_W4101E")) {
                        var rowArr = data.fs_P4101_W4101E.data.gridData.rowset;
                        var errObj = data.fs_P4101_W4101E.errors;
                        var noItem = rowArr.length === 0 || rowArr[0].sItemNumber_123.value.toLowerCase() !== inputRow.LITM.toLowerCase();
                        if (errObj.length > 0) {
                            _.getErrorMsgs(errObj);
                            _.returnFromError();
                        } else if (noItem && inputRow.EXTRACT && inputRow.EXTRACT.toLowerCase().search('y') !== -1) {
                            _.postError("No item found. Please add the item before attempting to extract the data.");
                            _.returnFromError();
                        } else if (noItem) {
                            _.postError("No item found matching search criteria. Please add to continue.");
                            _.returnFromError();
                        } else if (rowArr.length === 1) {
                            _.postSuccess("Item found");
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
            }  else {
                _.postError("Required fields missing. Please update spreadsheet.");
                _.returnFromError();
            }       
        };
        self.selectRow = function(inputRow) {
            var optionsObj = {
                form: "W4101E"
            };
            if (globals.htmlInputs.length === 0) { // first row processed
                optionsObj.returnControlIDs = true;
            } else {
                optionsObj.turbo = true;
            }
            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }
            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","155"); // Item Master Tag Menu Option
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P5941011_W594101C")) {
                    var errObj = data.fs_P5941011_W594101C.errors;
                    var rowArr = data.fs_P4101_W4101E.data.gridData.rowset;
                    var noItem = (rowArr.length === 0);
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    }  else {
                        // record exists 
                        if (noItem) {
                            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","22"); // click to add item master tag
                            _.getForm("appstack",reqObj).then(function(data){ 
                                if (data.hasOwnProperty("fs_P594101A_W594101AB")) {
                                    var errObj = data.fs_P594101A_W594101AB.errors;
                                    if (errObj.length > 0) {
                                        _.getErrorMsgs(errObj);
                                        _.returnFromError();
                                    } else {
                                        if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                                            globals.htmlInputs = data.fs_P5941026_W5941026B.data;
                                        }
                                        _.postSuccess("Entering the Master Tags form");
                                        self.addForm(inputRow);
                                    }
                                }
                            });
                        } else {
                            // select the row
                            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","14"); // Item Master Tag Menu Option
                            _.getForm("appstack",reqObj).then(function(data){ 
                                if (data.hasOwnProperty("fs_P594101A_W594101AB")) {
                                    var errObj = data.fs_P594101A_W594101AB.errors;
                                    if (errObj.length > 0) {
                                        _.getErrorMsgs(errObj);
                                        _.returnFromError();
                                    } else if (inputRow.EXTRACT) {
                                        _.postSuccess("Extracting data");
                                        _.appendTable(data.fs_P594101A_W594101AB.data);
                                    } else {
                                        if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                                            globals.htmlInputs = data.fs_P5941026_W5941026B.data;
                                        }
                                        _.postSuccess("Entering the Master Tags form");
                                        self.updateForm(inputRow);
                                    }
                                } else {
                                    _.postError("An unknown error occurred in the selection process.");
                                    _.returnFromError();
                                }
                            });
                        }
                        
                    }
                } 
                else {
                    _.postError("An unknown error occurred in the find/browse form");
                    _.returnFromError();
                }
            });
        };
        self.updateForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W5941026B",
                type: "close",
                gridUpdate: true,
                turbo: true
            },["grid","23",inputRow.Z59FLDVL],"12");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Master Tag updated"});
            });
        };
        self.addForm = function(inputRow) {
        	var optionsObj = {};
        	if (globals.htmlInputs.length === 0) { // should only be true for first Excel row
        		optionsObj = {
                    form: "W594101AB",
                    type: "close",
                    returnControlIDs: true,
                    gridAdd: true,
                    turbo: true
                };
            } else {
            	optionsObj = {
                    form: "W594101AB",
                    type: "close",
                    gridAdd: true,
                    turbo: true
                };
            }
            var reqObj = _.buildAppstackJSON(optionsObj,["grid","23",inputRow.Z59FLDVL], "12");
            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Master Tag added"});
            });
        };
    };
    return new Process();
});