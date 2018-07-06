// Bank Accounts by Address
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "AN8",
                id: 87
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W0030AD",
            closeID: "11"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
			inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            var reqObj = _.buildAppstackJSON({
                form: "P0030A_W0030AD",
                type: "open"
            },["40",inputRow.AN8], ["12[19]",inputRow.CBNK],"7");

            _.getForm("appstack",reqObj).then(function(data) {
                var errObj = data.fs_P0030A_W0030AD.errors;
                var gridObj = data.fs_P0030A_W0030AD.data.gridData.rowset;
                if (gridObj.length === 0) {
                    _.postSuccess("Adding new bank account");
                    self.getAddForm(inputRow);
                } else if (errObj.length > 0) {
                    _.getErrorMsgs(errObj);
                    _.returnFromError;
                } else if (gridObj.length > 0) {

					if (inputRow.EXTRACT)
					{
						if (gridObj.length == 1) {
							_.postSuccess("Bank account found");
							self.getEditForm(inputRow);
						} else {

							// add to input Row
							for (i=1;i<gridObj.length;i++)
							{
                                var inputRowCopy = JSON.parse(JSON.stringify(inputRow));
								inputRowCopy.CBNK = gridObj[i].sBankAccount_19.value;
								globals.processQ.push(inputRowCopy);
							}

							_.postSuccess("Bank account found");
							self.getEditForm(inputRow);
						}
					} else {
						if (gridObj.length == 1) {
							_.postSuccess("Bank account found");
							self.getEditForm(inputRow);
						} else {
							_.postError("Multiple bank accounts found. Update can only be performed on 1 record. Please specify the CBNK in template.");
							_.returnFromError();
						}
					}
                } else {
                    _.postError("Unknown error in find/browse");
                    _.returnFromError();
                }
            });
        };

        self.getAddForm = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W0030AD"
            },"9");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P0030A_W0030AA")) {
                    globals.htmlInputs = data.fs_P0030A_W0030AA.data;
                };
                self.insertNewData(inputRow);
            });
        };
        self.insertNewData = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W0030AA",
                dynamic: true
            },["87",inputRow.AN8], ["18", inputRow.CBNK],"1");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P0030A_W0030AA")) {
                    var errObj = data.fs_P0030A_W0030AA.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (data.fs_P0030A_W0030AA.data.txtLongAddressNumber_87.internalValue != inputRow.AN8) {
                        _.postError("Uncaught error adding bank account");
                        _.returnFromError();
                    } else {
                        _.postSuccess("Adding bank account");
                        _.returnFromSuccess();
                    }
                } else {
                    _.postError("Error adding bank account");
                    _.returnFromError();
                };
            });
        };     

        self.getEditForm = function(inputRow) {

			var optionsObj = {
                form: "W0030AD"                
            }

			if (inputRow.EXTRACT) 
                optionsObj.aliasNaming = true;

			var reqObj = _.buildAppstackJSON(optionsObj, "12.0", "8");
 
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P0030A_W0030AA")) {
					if (inputRow.EXTRACT)
					{
						_.appendTable(data.fs_P0030A_W0030AA.data, self.reqFields.titles);
						_.postSuccess("Extracting data");
					} else {

						globals.htmlInputs = data.fs_P0030A_W0030AA.data;
						_.postSuccess("Bank account updating");
						self.updateForm(inputRow);

					}

				} else if (data.hasOwnProperty("fs_P560030_W560030A")) {
					if (inputRow.EXTRACT)
					{
						_.appendTable(data.fs_P560030_W560030A.data, self.reqFields.titles);
						_.postSuccess("Extracting data");
					} else {
						globals.htmlInputs = data.fs_P560030_W560030A.data;
						_.postSuccess("Bank account updating");
						self.updateForm(inputRow);
					}
                } else if(data.hasOwnProperty("fs_P740001_W740001B")){ // for BeauroVeritas custom version
                    self.confirmUpdate(inputRow);
                    
                } else {
                    _.postError("There was an error selecting the update form");
                    _.returnFromError();
                }
            });
        };

        self.confirmUpdate = function(inputRow){
            var reqObj = _.buildAppstackJSON({
                form:"W740001B",
                type:"execute"
            }, "11");
            _.getForm("appstack", reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P0030A_W0030AA")) {
                    _.postError("An unknown error occurred while updating the bank account - dropZone did not move to update form.")
                    _.returnFromError();
                } else {
                    self.updateForm(inputRow);
                }
            })
        }

        self.updateForm = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W0030AA",
                type: "close",
                dynamic: true
            },"1");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P0030A_W0030AD")) {
                    _.postSuccess("Bank account updated");
                    _.returnFromSuccess();
                } else if (data.hasOwnProperty("fs_P0030A_W0030AA")) {
                    var errObj = data.fs_P0030A_W0030AA.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postError("An unknown error occurred while updating the bank account")
                        _.returnFromError();
                    }
                } else {
                    _.postError("An unknown error occurred while updating the bank account")
                    _.returnFromError();
                }
            });
        }
    };
    return new Process();
});