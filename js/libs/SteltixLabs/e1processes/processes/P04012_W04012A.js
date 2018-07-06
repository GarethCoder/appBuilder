define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "AN8"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W04012D",
            closeID: "16"
        };
    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            var reqObj = _.buildAppstackJSON({form: "P01012_W01012B", type: "open"},["1[19]",inputRow.AN8],"15");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P01012_W01012B")) {
                    var rowArr = data.fs_P01012_W01012B.data.gridData.rowset;
                    var errObj = data.fs_P01012_W01012B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                    	_.postError("Supplier not found. Please use the Address Master to add this supplier");
                        _.returnFromError();
                    } else if (rowArr.length === 1) {
                        self.selectRow(inputRow);
                        _.postSuccess("Supplier found");
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
                form: "W01012B"                
            }

            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }

            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","69");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P04012_W04012A")) {
                    var errObj = data.fs_P04012_W04012A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (inputRow.EXTRACT) {
                            _.postSuccess("Extracting data");
                            _.appendTable(data.fs_P04012_W04012A.data, self.reqFields.titles);
                        }
                        else {
                            _.postSuccess("Entering the Revisions form");
                            globals.htmlInputs = data.fs_P04012_W04012A.data;
                            self.updateForm(inputRow);
                        }
                    }
                } else if (data.hasOwnProperty("fs_P04012_W04012D")) {
                    var errObj = data.fs_P04012_W04012D.errors;
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
            var reqObj = _.buildAppstackJSON({form: "W04012A", type: "close", dynamic: true},"11","11");
            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Supplier updated"});
            });
        };
    };
    return new Process();
});