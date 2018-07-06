// Item Master Storage/Shipping
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "DOCO",
                id: 1.13,
            },
            {
                name: "DCTO",
                id: 1.12,
            }],
            isCustomTemplate: false
        };
    	self.closeObj = {
    		subForm: "W48013A",
    		closeID: "4"
    	};
    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

        	var reqObj = _.buildAppstackJSON({
                form: "P48013_W48013J",
                type: "open"
            },["1[13]",inputRow.DOCO],["1[12]",inputRow.DCTO],"39");

        	_.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P48013_W48013J")) {
                    var rowArr = data.fs_P48013_W48013J.data.gridData.rowset;
                    var errObj = data.fs_P48013_W48013J.errors;
                    var noItem = (rowArr.length === 0 || inputRow.DOCO == "_blank" || $.trim(inputRow.DOCO) == "");
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (noItem && inputRow.EXTRACT) {
                        _.postError("No item found. Please add the item before attempting to extract the data.");
                        _.returnFromError();
                    } else if (noItem) {
                        // WE GOING TO ADD HERE
                        _.postSuccess("Adding item");
                        self.addRow(inputRow);
                    } else if (rowArr.length > 0) {
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
        };
        self.addRow = function (inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W48013J",
                type: "execute"
            },"6");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P48013_W48013A")) {
                    var errObj = data.fs_P48013_W48013A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        globals.htmlInputs = data.fs_P48013_W48013A.data;
                        _.postSuccess("Entering new Work Order Details.");
                        self.addForm(inputRow);
                    }
                }
            });
        }
        self.selectRow = function(inputRow) {
            var optionsObj = {
                form: "W48013J"
            };

        	if (globals.htmlInputs.length !== 0) { // Will only be true if no data has ever been added to that key
                optionsObj.returnControlIDs = true;
            }

            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }
            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","4");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P48013_W48013A")) {
                    var errObj = data.fs_P48013_W48013A.errors;
                    var fieldData = data.fs_P48013_W48013A.data;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT) {
                        _.postSuccess("Extracting data");
                        _.appendTable(fieldData);
                    } else {
                    	if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
    			    		globals.htmlInputs = data.fs_P48013_W48013A.data;
    			        }
                        _.postSuccess("Entering the update form");
                        self.updateForm(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while opening the Storage/Shipping form");
                    _.returnFromError();
                }
            });
        };
        self.updateForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W48013A",
                type: "execute",
                dynamic: true
            },"3");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P48013_W48013J")) {
                    _.successOrFail(data,{successMsg: "Work Order Updated successfully."});
                }
                else {
                    var errObj = data.fs_P48013_W48013A.errors;
                    var warningObj = data.fs_P48013_W48013A.warnings;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else
                    if (warningObj.length > 0) {

                        var reqObj = _.buildAppstackJSON({
                            form: "W48013A",
                            type: "execute"
                        },"3"); // this is forcing a tick twice when a warning is picked e.g backdated dates

                        _.getForm("appstack",reqObj).then(function(data){
                            if (data.hasOwnProperty("fs_P48013_W48013A")) {
                                var errObj = data.fs_P48013_W48013A.errors;
                                var warningObj = data.fs_P48013_W48013A.warnings;
                                if (errObj.length > 0) {
                                    _.getErrorMsgs(errObj);
                                    _.returnFromError();
                                } else
                                if (warningObj.length > 0) {
                                    _.getErrorMsgs(errObj);
                                    _.returnFromError(warningObj);
                                }
                                else {
                                    _.postSuccess("Work Order Details updated.");
                                    _.returnFromSuccess();
                                }
                            }
                            else
                            if (data.hasOwnProperty("fs_P48013_W48013J")) {
                                _.postSuccess("Work Order Details updated.");
                                _.returnFromSuccess();
                            }
                        });
                    } 
                    else {
                        _.postSuccess("Work Order Details updated.");
                        _.returnFromSuccess();
                    }
                }
            });
        };

        self.closeForm = function () {
            var reqObj = _.buildAppstackJSON({
                form: "W48013A",
                type: "execute"
            },"4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Form closed successfully."});
            });
            
        }

        self.addForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W48013A",
                type: "execute",
                dynamic: true
            },"3");

            _.getForm("appstack",reqObj).then(function(data){
                var errObj = data.fs_P48013_W48013A.errors;
                var warningObj = data.fs_P48013_W48013A.warnings;
                if (errObj.length > 0) {
                    _.getErrorMsgs(errObj);
                    _.returnFromError();
                } else
                if (warningObj.length > 0) {

                    var reqObj = _.buildAppstackJSON({
                        form: "W48013A",
                        type: "execute"
                    },"3"); // this is forcing a tick twice when a warning is picked e.g backdated dates

                    _.getForm("appstack",reqObj).then(function(data){
                        if (data.hasOwnProperty("fs_P48013_W48013A")) {
                            var errObj = data.fs_P48013_W48013A.errors;
                            var warningObj = data.fs_P48013_W48013A.warnings;
                            if (errObj.length > 0) {
                                _.getErrorMsgs(errObj);
                                _.returnFromError();
                            } else
                            if (warningObj.length > 0) {
                                _.getErrorMsgs(errObj);
                                _.returnFromError(warningObj);
                            }
                            else {
                                if (data.fs_P48013_W48013A.data.txtOrderNumber_33 !== undefined)
                                    _.postSuccess("New Order No: "+data.fs_P48013_W48013A.data.txtOrderNumber_33.value);
                                self.closeForm();
                            }
                        }
                        else
                        if (data.hasOwnProperty("fs_P48013_W48013A")) {
                            self.closeForm();
                            // _.postSuccess("Work Order Details added.");
                            // _.returnFromSuccess();
                        }
                    });
                } 
                else {
                    if (data.hasOwnProperty("fs_P48013_W48013A")) {
                        if (data.fs_P48013_W48013A.data.txtOrderNumber_33 !== undefined)
                            _.postSuccess("New Order No: "+data.fs_P48013_W48013A.data.txtOrderNumber_33.value);
                
                        self.closeForm();
                       //  _.postSuccess("Work Order Details added.");
                       //  _.returnFromSuccess();
                    }
                    else
                    {
                        var errObj = data.fs_P48013_W48013A.errors;
                        var warningObj = data.fs_P48013_W48013A.warnings;
                        if (errObj.length > 0) {
                            _.getErrorMsgs(errObj);
                            _.returnFromError();
                        } else
                        if (warningObj.length > 0) {
                            _.getErrorMsgs(errObj);
                            _.returnFromError(warningObj);
                        }

                    }
                }
            });
        };
    };
    return new Process();
});