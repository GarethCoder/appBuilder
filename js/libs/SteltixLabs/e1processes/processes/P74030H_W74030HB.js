// Dutch Bank Account
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
            subForm: "W74030HA",
            closeID: "16"
        };
        self.init = function () {
            var inputRow = globals.inputRow = globals.processQ[0];
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);
            
            _.postSuccess("Processing row " + inputRow.ROW);

            var reqObj = _.buildAppstackJSON({
                form: "P74030H_W74030HA",
                type: "open"
            },["1[21]",inputRow.AN8],"15");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P74030H_W74030HA")) {
                    var errObj = data.fs_P74030H_W74030HA.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (data.fs_P74030H_W74030HA.data.gridData.rowset.length === 0) {
                        _.postSuccess("Adding new Dutch Bank Account");
                        self.getAddForm(inputRow)
                    } else if (data.fs_P74030H_W74030HA.data.gridData.rowset.length > 0) {
                        _.postSuccess("Updating Dutch Bank Account");
                        self.getEditForm(inputRow);
                    } else {
                        _.postError("Uncaught error occurred in the find/browse form");
                        _.returnFromError();
                    }
                } else {
                    _.postError("Unknown error occurred in the find/browse form");
                    _.returnFromError();
                }
            });
        };
        self.getAddForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W74030HA"
            },"26");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P74030H_W74030HB")) {
                    globals.htmlInputs = data.fs_P74030H_W74030HB.data;
                    self.addForm(inputRow,true);
                } else {
                    _.postError("Error obtaining ADD form");
                    _.returnFromError();
                }
            });
        };
        self.addForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W74030HB"
            }, ["30", inputRow.AN8], "11");
            
            _.getForm("appstack", reqObj).then(function (data) {
                var reqObj = _.buildAppstackJSON({
                    form: "W74030HB",
                    // type: "close",
                    dynamic: true
                }, "11");

                _.getForm("appstack", reqObj).then(function (data) {
                    if (data.hasOwnProperty("fs_P74030H_W74030HB")) { // if add successful or any invalid data entered
                        _.successOrFail(data, { successMsg: 'Dutch Bank Account successfully added' });
                    } else {
                        console.log(data);
                        _.postError("Unknown error occurred during the ADD process");
                        _.returnFromError();
                    }
                });
            });

            
        };
        self.getEditForm = function (inputRow) {
            
            if (inputRow.EXTRACT) {

                var reqObj = _.buildAppstackJSON({
                    form: "W74030HA",
                    aliasnaming: true
                }, "1.0", "14");

            } else {

                var reqObj = _.buildAppstackJSON({
                    form: "W74030HA"
                }, "1.0", "14");
                
            }

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P74030H_W74030HB")) {

                    if (inputRow.EXTRACT) {
                        _.postSuccess("Extracting Dutch Bank Account");
                        _.appendTable(data.fs_P74030H_W74030HB.data, self.reqFields.titles);
                    }
                    else {
                        globals.htmlInputs = data.fs_P74030H_W74030HB.data;
                        self.updateForm(inputRow);
                    }
                } else {
                    _.postError("Error obtaining UPDATE form");
                    _.returnFromError();
                }
            });
        };
        self.updateForm = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W74030HB",
                type: "close",
                dynamic: true
            },"11");

            _.getForm("appstack", reqObj).then(function (data) {
                _.successOrFail(data, { successMsg: 'Dutch Bank Account successfully updated' });
                // if (data.hasOwnProperty("fs_P74030H_W74030HA")) { // if update successful
                //     var errObj = data.fs_P74030H_W74030HA.errors;
                //     if (errObj.length > 0) {
                //         _.getErrorMsgs(errObj);
                //         _.returnFromError();
                //     } else {
                //         _.postSuccess("Dutch Bank Account successfully updated");
                //         _.returnFromSuccess();
                //     }
                // } else {
                //     _.postError("Unknown error occurred during the UPDATE process");
                //     _.returnFromError();
                // }
            });
        };
    };
    return new Process();
});
