define(['aisclient'],function(_){
    // BRANCH CAT CODES
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "LITM",
                id: 18,
            },
            {
                name: "MCU",
                id: 22,
            }],
            isCustomTemplate: false
        };
    	self.closeObj = {
    		subForm: "W5941026B",
    		closeID: "12"
    	};
        self.isExtract = false;
    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            if (inputRow.hasOwnProperty("LITM") || inputRow.hasOwnProperty("MCU")) {
                inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);
                var reqObj = _.buildAppstackJSON({
                    form: "P5941026_W5941026A",
                    type: "open",
                },["18",inputRow.LITM],["1[22]",inputRow.MCU], "15");

                _.getForm("appstack",reqObj).then(function(data){
                    if (data.hasOwnProperty("fs_P5941026_W5941026A")) {
                        var rowArr = data.fs_P5941026_W5941026A.data.gridData.rowset;
                        var errObj = data.fs_P5941026_W5941026A.errors;
                        var noItem = (rowArr.length === 0);
                        if (errObj.length > 0) {
                            _.getErrorMsgs(errObj);
                            _.returnFromError();
                        } else if (noItem && inputRow.EXTRACT && inputRow.EXTRACT.toLowerCase().search('y') !== -1) {
                            _.postError("No item found. Please add the item before attempting to extract the data.");
                            _.returnFromError();
                        } else if (noItem) {
                            _.postSuccess("Adding Item");
                            self.getAddForm(inputRow);
                        } else if (rowArr.length === 1) {
                            _.postSuccess("Item found");
                            self.selectRow(inputRow);
                        } else {
                            _.postError("There was a problem finding the requested record, or there are duplicates");
                            _.returnFromError();
                        }
                    } else {
                        _.postError("LITM and / or MCU Info required.");
                        _.returnFromError();
                    }
                });
            }           
        };
        self.selectRow = function(inputRow) {
            var optionsObj = {
                form: "W5941026A"
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
            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","14");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P5941026_W5941026B")) {
                    var errObj = data.fs_P5941026_W5941026B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT) {
                        _.postSuccess("Extracting data");
                        _.appendTable(data.fs_P5941026_W5941026B.data);
                    } else {
                        if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                            globals.htmlInputs = data.fs_P5941026_W5941026B.data;
                        }
                        _.postSuccess("Entering the Branch Cat Codes form");
                        self.updateForm(inputRow);
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
                dynamic: true,
                turbo: true
            },"11");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Branch Cat Code updated"});
            });
        };
        self.getAddForm = function(inputRow) {
        	var reqObj = _.buildAppstackJSON({
                    form: "W5941026A",
                    type: "execute",
                    returnControlIDs: true
                },"14");
             
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P5941026_W5941026B")) {
                    var errObj = data.fs_P5941026_W5941026B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
    	                if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
    			    		globals.htmlInputs = data.fs_P5941026_W5941026B.data;
    	                }
                        self.addForm(inputRow);
                        _.postSuccess("Entering new Branch Cat Code data");
    	            }
                } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }
            });
        };
        self.addForm = function(inputRow) {
        	var optionsObj = {};
        	if (globals.htmlInputs.length === 0) { // should only be true for first Excel row
        		optionsObj = {
                    form: "W5941026B",
                    type: "close",
                    dynamic: true,
                    returnControlIDs: true
                };
            } else {
            	optionsObj = {
                    form: "W5941026B",
                    type: "close",
                    dynamic: true,
                    turbo: true
                };
            }
            var reqObj = _.buildAppstackJSON(optionsObj,"11");
            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Branch Cat Code added"});
            });
        };
    };
    return new Process();
});