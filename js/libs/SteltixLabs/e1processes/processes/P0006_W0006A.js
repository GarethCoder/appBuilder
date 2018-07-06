define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "MCU"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W0006B",
            closeID: "3"
        };

		self.problemFields = [	{'alias': 'z_CO_10', 'longname' : 'txt__Company__CO__10' }  ];

        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
			inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);
			inputRow = _.prepProblemFieldsForImport(inputRow, self.problemFields);	

            var reqObj = _.buildAppstackJSON({
                form: "P0006_W0006B",
                type: "open"
            },["1[5]",inputRow.MCU],"47")

            _.getForm("appstack",reqObj).then(function(data){
                var errObj = data.fs_P0006_W0006B.errors;
                if (errObj.length > 0) {
                    _.getErrorMsgs(errObj);
                    _.returnFromError();
                } else if (data.fs_P0006_W0006B.data.gridData.rowset.length === 0) { // NEED helper function for writing to dataHolder
                    _.postSuccess("Adding new business unit")
                    self.getAddForm(inputRow); // ADD
                } else if (data.fs_P0006_W0006B.data.gridData.rowset.length > 0) {
                    self.selectRow(inputRow); // UPDATE
                }
            });
        },
        // select Row, ;or UPDATE
        self.selectRow = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form:"W0006B"
            },"1.0","2","2");

			if (inputRow.EXTRACT)
			{
				var reqObj = _.buildAppstackJSON({
					form:"W0006B",
					aliasNaming: true
				},"1.0","2","2");

			} else {
				var reqObj = _.buildAppstackJSON({
					form:"W0006B"
				},"1.0","2","2");
			}

            _.getForm("appstack",reqObj).then(function(data){
                // check that form is correct in response
                if (data.hasOwnProperty("fs_P0006_W0006A")) {

					if (inputRow.EXTRACT)
					{
						_.postSuccess("Extracting data");
						var fieldData = _.prepProblemFieldsForExtract(data.fs_P0006_W0006A, self.problemFields);
                        _.appendTable(fieldData.data, self.reqFields.titles);

					} else {
						globals.htmlInputs = data.fs_P0006_W0006A.data;
						_.postSuccess("Updating business unit");
						self.updateRecord(inputRow);
					}
                } else {
                    _.postError("Error selecting the row");
                    _.returnFromError();
                }
            });
        };
        self.getAddForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W0006B"
            },"42");

            _.getForm("appstack",reqObj).then(function(data){
                reqObj = {};

                globals.htmlInputs = data.fs_P0006_W0006A.data;
                console.log("inputs");
                console.log(globals.htmlInputs);

                self.insertNewRecord(inputRow,true);
            });
        };
        self.insertNewRecord = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W0006A",
                type: "close",
                dynamic: true
            },["81",inputRow.MCU],"43");

            _.getForm("appstack",reqObj).then(function(data){
                reqObj = {};
                if (data.hasOwnProperty("fs_P0006_W0006A")) {
                    var errObj = data.fs_P0006_W0006A.errors;
                    if (errObj.length === 1 && errObj[0].MOBILE.search(/The Business Unit entered does not exist in the Business Unit/) !== -1 && errObj[0].CODE === "0052") {
                        _.postSuccess("New business unit created!");
                        _.returnFromSuccess();
                    } else if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (data.fs_P0006_W0006A.data.txtBusinessUnitDisplay_81.value.toString() === inputRow.MCU.toString()) { // we don't check for errors for a successful add because an error is automatically produced on a successful add
                        _.postSuccess("New business unit created!");
                        _.returnFromSuccess();
                    } else {
                        _.postError("Unknown error occured while submitting the ADD form");
                        _.returnFromError();
                    }
                } else {
                    _.postError("Unknown error occured while submitting the ADD form");
                    _.returnFromError();
                }
            });
        };
        self.updateRecord = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W0006A",
                type: "close",
                dynamic: true
            },["81",inputRow.MCU],"43");

            _.getForm("appstack",reqObj).then(function(data){
                reqObj = {};
                if (data.hasOwnProperty("fs_P0006_W0006A")) {
                    var errObj = data.fs_P0006_W0006A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Business unit updated!")
                        _.returnFromSuccess();
                    }
                }
            });
        }
    };
    return new Process();
});