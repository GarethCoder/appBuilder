// Item Branch/Plant Quantities
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "MCU"
            }, {
                name: "LITM"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W41026E",
            closeID:"5"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            var reqObj = _.buildAppstackJSON({
                form: "P41026_W41026E",
                type: "open"
            },["1[12]",inputRow.MCU],["1[8]",inputRow.LITM],"6");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41026_W41026E")) {
                    var rowArr = data.fs_P41026_W41026E.data.gridData.rowset;
                    var errObj = data.fs_P41026_W41026E.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        _.postError("Item Branch/Plant not found. Please use the Item Branch Revisions form to add new Item Branch/Plants");
                        _.returnFromError();
                    } else if (rowArr.length === 1) {
                        _.postSuccess("Item Branch/Plant found");
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
        self.selectRow = function(inputRow) {
            var optionsObj = {
                form: "W41026E"
            };
            if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                optionsObj.returnControlIDs = true;                
            } else {
                optionsObj.turbo = true;
            }
            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }
            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","118");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41026_W41026C")) {
                    var errObj = data.fs_P41026_W41026C.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT) {
                        _.postSuccess("Extracting data");
                        _.appendTable(data.fs_P41026_W41026C.data);
                    } else {
                        _.postSuccess("Entering the Quantities form");
                        globals.htmlInputs = data.fs_P41026_W41026C.data;
                        self.updateForm(inputRow);
                    }
                } else if (data.hasOwnProperty("fs_P41026_W41026E")) {
                    var errObj = data.fs_P41026_W41026E.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postError("There was a problem entering the Quantities form");
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
                form: "W41026C",
                type: "close",
                dynamic: true
            },"11","11");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41026_W41026C")) {
                    var errObj = data.fs_P41026_W41026C.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Item Branch/Plant Quantities updated");
                        _.returnFromSuccess();
                    }
                } else {
                    _.postError("An unknown error occurred in the UPDATE form");
                    _.returnFromError();
                }
            });
        };
    };
    return new Process();
});