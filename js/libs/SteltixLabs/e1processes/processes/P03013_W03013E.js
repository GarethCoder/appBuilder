// Billing Information
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "AN8"
            }, {
                name: "CO"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W03013A",
            closeID: "16"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

                // if company number is passed check for ' char
            if (inputRow.hasOwnProperty("CO") && inputRow.CO.substring(0,1) === "'")
                inputRow.CO = inputRow.CO.substring(1);

                    // add co number to qbe
            var reqObj = _.buildAppstackJSON({
                form: "P03013_W03013A",
                type: "open",
                returnControlIDs: "1[29]"
            },["1[29]",inputRow.AN8],"15");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P03013_W03013A")) {
                    var rowArr = data.fs_P03013_W03013A.data.gridData.rowset;
                    var errObj = data.fs_P03013_W03013A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        _.postSuccess("Record not found - Please add a new record using the Customer Master");
                        _.returnFromError();
                    } else if (rowArr.length === 1 && rowArr[0].mnAddressNumber_29.value === inputRow.AN8) {
                        self.getEditForm(inputRow);
                        _.postSuccess("Customer found");
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
        self.getEditForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W03013A",
                turbo: true
            },"1.0","14");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P03013_W03013B")) {
                    var errObj = data.fs_P03013_W03013B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Entering Customer Billing form");
                        self.takeRowExit(inputRow);
                    }
                }
            });
        };
        self.takeRowExit = function(inputRow) { // exit to Billing form

             var optionsObj = {
                form: "W03013B",
                returnControlIDs: true
            }

            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }

            var reqObj = _.buildAppstackJSON(optionsObj,"428");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P03013_W03013E")) {
                    var errObj = data.fs_P03013_W03013E.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    }
                    if (inputRow.EXTRACT) {
                        _.postSuccess("Extracting data");
                        // to ensure companies starting with zero or are all zero extract correctly, we add a "'" to force a string value in XLS
                        if (data.fs_P03013_W03013E.data.hasOwnProperty("z_CO_14")) 
                            data.fs_P03013_W03013E.data.z_CO_14.value = "'"+data.fs_P03013_W03013E.data.z_CO_14.value;
                        _.appendTable(data.fs_P03013_W03013E.data);
                    }
                    else {
                        globals.htmlInputs = data.fs_P03013_W03013E.data;
                        _.postSuccess("Entering Billing Information");
                        self.updateForm(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while taking the Billing Information form exit");
                    _.returnFromError();
                }
            });
        };
        self.updateForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W03013E",
                type: "execute",
                dynamic: true,
                turbo: true
            },"21","11");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Billing Information updated',successCb:self.closeForm});
            });
        };

        // last step is to close Customer Revisions
        self.closeForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W03013B",
                type: "close",
                turbo: true
            },"11");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Customer Revisions form closed'});
            });
        };
    };
    return new Process();
});