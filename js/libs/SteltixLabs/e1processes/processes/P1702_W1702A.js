/*** Equipment Master Revisions
/* Find/browse: P1701_W1701A
/* Revision: P1702_W1702A
***/
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "NUMB"
            }, {
                "name": "DL01"
            }, {
                "name": "AN8"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W1701A",
            closeID: "322"
        };
    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
    		_.postSuccess("Processing row " + inputRow.ROW);

            var reqObj = _.buildAppstackJSON({
                form: "P1701_W1701A",
                type: "open",
                turbo: true
            },["1[377]",inputRow.NUMB],"324")

            _.getForm("appstack",reqObj).then(function(data){
                var errObj = data.fs_P1701_W1701A.errors;
                if (errObj.length > 0) {
                    _.getErrorMsgs(errObj);
                    _.returnFromError();
                } else if (data.fs_P1701_W1701A.data.gridData.rowset.length === 0 || typeof inputRow.NUMB === "undefined") {
                    _.postSuccess("Adding new equipment")
                    self.getAddForm(inputRow); // ADD
                } else if (data.fs_P1701_W1701A.data.gridData.rowset.length > 0) {
                    self.selectRow(inputRow); // UPDATE
                } else {
                	_.postError("Unknown error with find/browse");
                	_.returnFromError();
                }
            });
    	};
    	self.selectRow = function(inputRow) {
            if (globals.htmlInputs.length === 0) {
                var reqObj = _.buildAppstackJSON({
                    form:"W1701A"
                },"1.0","326");
            } else {
                var reqObj = _.buildAppstackJSON({
                    form:"W1701A",
                    turbo: true
                },"1.0","326");
            }    		

            _.getForm("appstack",reqObj).then(function(data){
                if (globals.htmlInputs.length === 0) {
                    globals.htmlInputs = data.fs_P1702_W1702A.data;
                }

                // check that form is correct in response
                if (data.hasOwnProperty("fs_P1702_W1702A")) {
                    _.postSuccess("Updating Equipment Master");
                    self.updateRecord(inputRow);
                } else {
                    _.postError("Error selecting the row");
                    _.returnFromError();
                }
            });
    	};
    	self.getAddForm = function(inputRow) {
            
            if (globals.htmlInputs.length === 0) {
                var reqObj = _.buildAppstackJSON({
                    form: "W1701A"
                },"327");
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W1701A",
                    turbo: true
                },"327");
            } 

            _.getForm("appstack",reqObj).then(function(data){
                globals.htmlInputs = data.fs_P1702_W1702A.data;
                self.insertNewRecord(inputRow);
            });
    	};
    	self.insertNewRecord = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W1702A",
                type: "close",
                dynamic: true,
                turbo: true
            },["102",inputRow.NUMB],["131",inputRow.DL01],["155",inputRow.AN8],"11");

            _.getForm("appstack",reqObj).then(function(data){
                reqObj = {};
                if (data.hasOwnProperty("fs_P1702_W1702A")) {
                    var errObj = data.fs_P1702_W1702A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("New equipment created");
                        _.returnFromSuccess();
                    }
                } else {
                	_.postError("Unknown error occured while submitting the ADD form");
                	_.returnFromError();
                }
            });
        };
        self.updateRecord = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W1702A",
                dynamic: true,
                turbo: true
            },["102",inputRow.NUMB],["131",inputRow.DL01],["155",inputRow.AN8],"11");

            _.getForm("appstack",reqObj).then(function(data){
                reqObj = {};
                if (data.hasOwnProperty("fs_P1702_W1702A")) {
                    var errObj = data.fs_P1702_W1702A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Equipment updated");
                        self.closeSession();
                    }
                } else if (data.hasOwnProperty("fs_P1702_W1702M")) {
                    _.postSuccess("Stamping address change date &amp; time");
                    self.timeStamp();
                } else {
                	_.postError("Unknown error occured while UPDATING the form");
                	_.returnFromError();
                }
            });
    	};
        self.timeStamp = function() {
            var reqObj = _.buildAppstackJSON({
                form: "W1702M",
                type: "close",
                turbo: true
            },"11");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P1702_W1702A")) {
                    var errObj = data.fs_P1702_W1702A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Equipment updated");
                        _.returnFromSuccess();
                    }
                } else {
                    _.postError("Unknown error occured while stamping the change of address");
                    _.returnFromError();
                }
            });
        };
        self.closeSession = function() {
            var reqObj = _.buildAppstackJSON({
                form: "W1702A",
                type: "close",
                turbo: true
            });

            _.getForm("appstack",reqObj).then(function(data){
                _.returnFromSuccess();
            });
        };
    };
    return new Process();
});