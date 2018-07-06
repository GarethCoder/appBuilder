// Work Center Rates Revisions
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "MCU"
            }, {
                name: "MMCU"
            }, {
                name: "LEDG"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W3006B",
            closeID: "5"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

			// if extracted previously, an apostrophe will be in front of the zeros to ensure we don't lose zero, so need to strip it out
			if (inputRow.LEDG.substr(0, 1) == "'")
				inputRow.LEDG = inputRow.LEDG.substr(1);

            var reqObj = _.buildAppstackJSON({
                form: "P3006_W3006B",
                type: "open",
                turbo: true
            },["1[6]",inputRow.MCU],["1[28]",inputRow.MMCU],["1[7]",inputRow.LEDG],"14");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P3006_W3006B")) {
                    var rowArr = data.fs_P3006_W3006B.data.gridData.rowset;
                    var errObj = data.fs_P3006_W3006B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        self.getAddForm(inputRow);
                        _.postSuccess("Adding Work Center Rates Revision");
                    } else if (rowArr.length === 1) { 
                        self.selectRow(inputRow);
                        _.postSuccess("Work Center Rates Revision found");
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
            if (globals.htmlInputs.length === 0) {
                var reqObj = _.buildAppstackJSON({
                    form: "W3006B"
                },"13");
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W3006B",
                    turbo: true
                },"13");
            }
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P3006_W3006C")) {
                    if (globals.htmlInputs.length === 0) {
                        globals.htmlInputs = data.fs_P3006_W3006C.data;
                    }
                    var errObj = data.fs_P3006_W3006C.errors;
                    var warningObj = data.fs_P3006_W3006C.warnings;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (warningObj.length > 0) {
                        _.getErrorMsgs(warningObj);
                        _.returnFromError();
                    }else {
                        _.postSuccess("Entering Work Center Rates Revision ADD form");
                        self.addForm(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }
            });
        };
        self.addForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W3006C",
                type: "close",
                dynamic: true,
                turbo: true
            },["6",inputRow.MCU],["85",inputRow.MMCU],["8",inputRow.LEDG],"3");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Work Center Rates Revision successfully added'});
            });
        };
        self.selectRow = function(inputRow) {
			if (inputRow.EXTRACT) {
				var reqObj = _.buildAppstackJSON({
					form: "W3006B",
					aliasNaming: true
				},"1.0","4");
			}
			else {
				var reqObj = _.buildAppstackJSON({
					form: "W3006B"
				},"1.0","4");
			}

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P3006_W3006C")) {
                    if (globals.htmlInputs.length === 0) {
                        globals.htmlInputs = data.fs_P3006_W3006C.data;
                    }
                    var errObj = data.fs_P3006_W3006C.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT) {

						if (typeof (data.fs_P3006_W3006C.data.z_LEDG_8) !== 'undefined' && data.fs_P3006_W3006C.data.z_LEDG_8.value.substr(0, 1) == '0')
							data.fs_P3006_W3006C.data.z_LEDG_8.value = "'"+data.fs_P3006_W3006C.data.z_LEDG_8.value;

                        _.appendTable(data.fs_P3006_W3006C.data, self.reqFields.titles);
                        _.postSuccess("Extracting data");
                    }  else {
                        _.postSuccess("Entering Work Center Rates Revision UPDATE form");
                        self.updateForm(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while entering the UPDATE form");
                    _.returnFromError();
                }
            });
        };
        self.updateForm = function(inputRow,isAdd) {
            var reqObj = _.buildAppstackJSON({
                form: "W3006C",
                type: "close",
                dynamic: true,
                turbo: true
            },"3");
            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Work Center Rates Revision successfully added'});
            });
        };
    };
    return new Process();
});