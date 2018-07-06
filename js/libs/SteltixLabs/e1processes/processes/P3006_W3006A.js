// Work Center Master Revisions
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "MCU"
            }, {
                name: "MMCU"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W3006F",
            closeID: "16"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            var reqObj = _.buildAppstackJSON({
                form: "P3006_W3006F",
                type: "open",
                turbo: true
            },["1[26]",inputRow.MMCU],["1[24]",inputRow.MCU],"15");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P3006_W3006F")) {
                    var rowArr = data.fs_P3006_W3006F.data.gridData.rowset;
                    var errObj = data.fs_P3006_W3006F.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        self.getAddForm(inputRow);
                        _.postSuccess("Adding Work Center Master Revision");
                    } else if (rowArr.length === 1) {
                        self.selectRow(inputRow);
                        _.postSuccess("Work Center Master Revision found");
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
            if (globals.htmlInputs.length === 0) {
                var reqObj = _.buildAppstackJSON({
                    form: "W3006F",
                    returnControlIDs: true
                },"1.0","14");
            } else {
				if (inputRow.EXTRACT)
				{
					var reqObj = _.buildAppstackJSON({
						form: "W3006F",
						aliasNaming: true
					},"1.0","14");
				} else {
					var reqObj = _.buildAppstackJSON({
						form: "W3006F",
						turbo: true
					},"1.0","14");
				}
            }
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P3006_W3006A")) {
                    if (globals.htmlInputs.length === 0) {
                        // is first run
                        globals.htmlInputs = data.fs_P3006_W3006A.data;
                    }
                    var errObj = data.fs_P3006_W3006A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT) {
                        _.appendTable(data.fs_P3006_W3006A.data, self.reqFields.titles);
                        _.postSuccess("Extracting data");
                    }  
                    else {
                        _.postSuccess("Entering Work Center Master Revision form");
                        self.updateForm(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while entering the Work Center Master Revision form");
                    _.returnFromError();
                }
            });
        };
        self.getAddForm = function(inputRow) {
            if (globals.htmlInputs.length === 0) {
                var reqObj = _.buildAppstackJSON({
                    form: "W3006F",
                    returnControlIDs: true
                },"33");
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W3006F",
                    turbo: true
                },"33");
            }
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P3006_W3006A")) {
                    if (globals.htmlInputs.length === 0) {
                        // is first run
                        globals.htmlInputs = data.fs_P3006_W3006A.data;
                    }
                    var errObj = data.fs_P3006_W3006A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Entering Work Center Master Revision form");
                        self.addForm(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while entering the Work Center Master Revision ADD form");
                    _.returnFromError();
                }
            });
        };
        self.addForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W3006A",
                type: "close",
                dynamic: true,
                turbo: true
            },["6",inputRow.MCU],["179",inputRow.MMCU],"3","3");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'New Work Center Master Revision successfully added'});
            });
        };
        self.updateForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W3006A",
                type: "close",
                dynamic: true,
                turbo: true},"3");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Work Center Master Revision form successfully updated'});
            });
        }
    };
    return new Process();
});