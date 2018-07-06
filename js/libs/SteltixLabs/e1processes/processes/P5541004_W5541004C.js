// Item Branch/Plant Tag Revision
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "LITM"
            }, {
                name: "MCU"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W5541004A",
            closeID: "16"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            var reqObj = _.buildAppstackJSON({
                form: "P5541004_W5541004A",
                type: "open",
                turbo: true
            },["1[25]",inputRow.MCU],["34",inputRow.LITM],"15");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P5541004_W5541004A")) {
                    var rowArr = data.fs_P5541004_W5541004A.data.gridData.rowset;
                    var errObj = data.fs_P5541004_W5541004A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        self.getAddForm(inputRow);
                        _.postSuccess("Adding Item Branch Tag");
                    } else if (rowArr.length === 1) {
                        self.selectRow(inputRow);
                        _.postSuccess("Item Branch Tag found");
                    } else {
                        _.postError("There was a problem finding the requested record, or there are duplicates");
                        _.returnFromError();
                    }
                } else {
                    _.postError("An unknown error occurred while executing the find/browse form");
                    _.returnFromError();
                }
            });
        };
        self.getAddForm = function(inputRow) {
            if (globals.htmlInputs.length === 0) { // only an empty array when first declared. When populated with data, it is an object.
                var reqObj = _.buildAppstackJSON({
                    form: "W5541004A",
                    returnControlIDs: true
                },"30"); // first run: store values
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W5541004A",
                    turbo: true
                },"30"); // subsequent runs: ignore values
            }
            
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P5541004_W5541004C")) {
                    var errObj = data.fs_P5541004_W5541004C.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (globals.htmlInputs.length === 0) {
                            globals.htmlInputs = data.fs_P5541004_W5541004C.data;
                        }
                        self.addFormSetup(inputRow);
                        _.postSuccess("Entering new Item Branch Tag data");
                    }
                } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }
            });
        };
        self.selectRow = function(inputRow) {
            if (globals.htmlInputs.length === 0) { 
                var reqObj = _.buildAppstackJSON({
                    form: "W5541004A",
                    returnControlIDs: true
                },"1.0","14");
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W5541004A",
                    turbo: true
                },"1.0","14");
            }
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P5541004_W5541004C")) {
                    var errObj = data.fs_P5541004_W5541004C.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Entering the Item Branch Tag form");
                        if (globals.htmlInputs.length === 0) {
                            globals.htmlInputs = data.fs_P5541004_W5541004C.data;
                        }
                        self.updateForm(inputRow);
                    }
                } else if (data.hasOwnProperty("fs_P5541004_W5541004A")) {
                    var errObj = data.fs_P5541004_W5541004A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postError("There was a problem entering the Item Branch Tag form");
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
                form: "W5541004C",
                type: "close",
                dynamic: true,
                turbo: true
            },"11","11");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P5541004_W5541004A")) {
                    var errObj = data.fs_P5541004_W5541004A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Item Branch Tag record updated");
                        _.returnFromSuccess();
                    }
                } else {
                    _.postError("An unknown error occurred in the UPDATE form");
                    _.returnFromError();
                }
            });
        };
        self.addFormSetup = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W5541004C",
                turbo: true
            },["14",inputRow.MCU],"11");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P5541004_W5541004C")) {
                    self.addForm(inputRow);
                } else {
                    _.postError("An unknown error occurred while preparing the ADD form");
                    _.returnFromError();
                }
            });
        };
        self.addForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W5541004C",
                type: "close",
                dynamic: true,
                turbo: true
            },["18",inputRow.LITM],"11","11");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P5541004_W5541004C")) {
                    var errObj = data.fs_P5541004_W5541004C.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postError("An uncaught error occurred while executing the ADD form");
                        _.returnFromError();
                    }
                } else if (data.hasOwnProperty("fs_P5541004_W5541004A")) {
                    var errObj = data.fs_P5541004_W5541004A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Item Branch/Plant record successfully added");
                        _.returnFromSuccess();
                    }
                } else {
                    _.postError("An unknown error occurred while executing the ADD form");
                    _.returnFromError();
                }
            });
        };
    };
    return new Process();
});