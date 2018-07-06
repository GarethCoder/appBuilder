// Item Master Category Codes
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "LITM",
                id: 137,
            }],
            isCustomTemplate: false
        };
    	self.closeObj = {
    		subForm: "W4101E",
    		closeID:"5"
    	};
    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);
        	var reqObj = _.buildAppstackJSON({
                form: "P4101_W4101E",
                type: "open",
                returnControlIDs: "1[123]"
            },["1[123]",inputRow.LITM],"22");

        	_.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4101_W4101E")) {
                    var rowArr = data.fs_P4101_W4101E.data.gridData.rowset;
                    var errObj = data.fs_P4101_W4101E.errors;
                    var noItem = rowArr.length === 0 || rowArr[0].sItemNumber_123.value.toLowerCase() !== inputRow.LITM.toLowerCase();
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (noItem && inputRow.EXTRACT) {
                        _.postError("No item found. Please add the item before attempting to extract the data.");
                        _.returnFromError();
                    } else if (noItem) {
                        _.postError("No item found. Please add the item using the Item Master Revisions form: P4101_W4101A");
                        _.returnFromError();
                    } else if (rowArr.length === 1) {
                        self.selectRow(inputRow);
                        _.postSuccess("Item found");
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
        self.selectRow = function(inputRow) {
            var optionsObj = {
                form: "W4101E"
            };
        	if (globals.htmlInputs.length !== 0) {
                optionsObj.returnControlIDs = true;
            }
            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }
            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","133");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4101_W4101B")) {
                    var errObj = data.fs_P4101_W4101B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT) {
                        _.postSuccess("Extracting data");
                        _.appendTable(data.fs_P4101_W4101B.data, self.reqFields.titles);
                    } else {
                    	if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
    			    		globals.htmlInputs = data.fs_P4101_W4101B.data;
    			        }
                        _.postSuccess("Entering the Revisions form");
                        self.updateForm(inputRow);
                    }
                } else if (data.hasOwnProperty("fs_P4101_W4101E")) {
                    var errObj = data.fs_P4101_W4101E.errors;
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
        self.updateForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W4101B",
                type: "close",
                dynamic: true
            },"11");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Item updated"});
            });
        };
    };
    return new Process();
});