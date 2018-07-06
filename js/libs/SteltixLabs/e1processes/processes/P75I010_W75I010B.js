// Address Book Additional Information
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "AN8",
                id: 17
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W75I010A",
            closeID: "16"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            var reqObj = _.buildAppstackJSON({
                form: "P75I010_W75I010A",
                type: "open",
                turbo: true
            },["17",inputRow.AN8],"15");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P75I010_W75I010A")) {
                    var rowArr = data.fs_P75I010_W75I010A.data.gridData.rowset;
                    var errObj = data.fs_P75I010_W75I010A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        self.getAddForm(inputRow);
                        _.postSuccess("Adding A/B Additional Information");
                    } else if (rowArr.length === 1) {
                        self.getEditForm(inputRow);
                        _.postSuccess("A/B Additional Information found");
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
        self.getAddForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W75I010A",
                returnControlIDs: true
            },"25");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P75I010_W75I010B")) {
                    globals.htmlInputs = data.fs_P75I010_W75I010B.data;
                    _.postSuccess("Opening ADD form");
                    self.insertNewData(inputRow);
                } else {
                    _.postError("An unknown error occurred while opening the ADD form");
                    _.returnFromError();
                }
            });
        };
        self.insertNewData = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W75I010B",
                type: "close",
                dynamic: true,
                turbo: true
            },["13",inputRow.AN8],"11");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'A/B Additional Information successfully added'});
            });
        };
        self.getEditForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W75I010A",
                returnControlIDs: true
            },"1.0","14");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P75I010_W75I010B")) {
                    globals.htmlInputs = data.fs_P75I010_W75I010B.data;
                    _.postSuccess("Entering the UPDATE form");
                    self.updateForm(inputRow);
                } else {
                    _.postError("An unknown error occurred while entering the UPDATE form");
                    _.returnFromError();
                }
            });
        };
        self.updateForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W75I010B",
                type: "close",
                dynamic: true,
                turbo: true
            },"11");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'A/B Additional Information successfully updated'});
            });
        }
    };
    return new Process();
});