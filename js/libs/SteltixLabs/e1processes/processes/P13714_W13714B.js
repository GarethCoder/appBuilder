// UPDATE Equipment Work Orders
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "DOCO"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W13700B",
            closeID: "16"
        };
    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            var reqObj = _.buildAppstackJSON({
                form: "P13700_W13700B",
                type: "open"
            },["186",inputRow.ASII],
            ["1[20]",inputRow.DL01],
            ["1[18]",inputRow.DOCO],
            ["1[19]",inputRow.DCTO],
            ["1[188]",inputRow.TYPS],"15");

            _.getForm("appstack",reqObj).then(function(data) {
                if (data.fs_P13700_W13700B.errors.length === 0) {
                    if (data.fs_P13700_W13700B.data.gridData.rowset.length === 1) {
                       _.postSuccess("Opening work order");
                       self.selectRow(inputRow);
                    } else if (data.fs_P13700_W13700B.data.gridData.rowset.length === 0) {
                        _.postError("Record not found - Please use the template P13714_W13714B to add it");
                        _.returnFromError();
                    } else {
                        _.postError("There was a problem executing the find/browse");
                        _.returnFromError();
                    }
                } else {
                    _.getErrorMsgs(data.fs_P13700_W13700B.errors);
                    _.returnFromError();
                }
            });
        };
        self.selectRow = function(inputRow) {
            var selObj = _.buildAppstackJSON({
                form: "W13700B"
            },"1.0","14");
            _.getForm("appstack",selObj).then(function(data) {
            	globals.htmlInputs = data.fs_P13714_W13714B.data;
                if (data.hasOwnProperty("fs_P13700_W13700B")) {
                    var errObj = data.fs_P13700_W13700B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postError("Error selecting the record")
                        _.returnFromError();
                    }
                } else if (data.hasOwnProperty("fs_P13714_W13714B")) {
                        var errObj = data.fs_P13714_W13714B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Updating work order");
                        self.submitDetails(inputRow);
                    }
                } else {
                	_.postError("Uknown error selecting the record");
                	_.returnFromError();
                }
            })

        };
        self.submitDetails = function(inputRow) {
            var reqObj2 = _.buildAppstackJSON({
                form: "W13714B",
                dynamic: true
            },"283"); // push "Save Changes"
            _.getForm("appstack",reqObj2).then(function(data) {
                reqObj2 = {};
                if (data.hasOwnProperty("fs_P13714_W13714B")) {
                    var errObj = data.fs_P13714_W13714B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError(inputRow);
                    } else {
                    	_.postSuccess("Closing the form");
                        self.closeForm();
                    }
                } else {
                    _.postError("Unexpected return point of submitDetails function.");
                    _.returnFromError();
                }
            });
        };
        self.closeForm = function() {
        	var reqObj3 = _.buildAppstackJSON({
                form: "W13714B",
                type: "close"
            },"32"); // push "Close"
        	_.getForm("appstack",reqObj3).then(function(data) {
        		reqObj3 = {};
        		if (data.hasOwnProperty("fs_P13700_W13700B")) {
                    var errObj = data.fs_P13700_W13700B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError(inputRow);
                    } else {
                    	_.postSuccess("Update successful");
                        _.returnFromSuccess();
                    }
                } else {
                    _.postError("Unexpected return point of submitDetails function.");
                    _.returnFromError();
                }
        	});
        }
    };
    return new Process();
});