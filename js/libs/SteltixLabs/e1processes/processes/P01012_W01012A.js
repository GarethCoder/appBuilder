define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "AN8",
                id: "1[19]"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W01012B",
            closeID: "16"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            reqObj = _.buildAppstackJSON({
                form: "P01012_W01012B",
                type: "open"
            },["1[19]",inputRow.AN8],"15");

            _.getForm("appstack",reqObj).then(function(data){
                var rowArr = data.fs_P01012_W01012B.data.gridData.rowset;
                var errObj = data.fs_P01012_W01012B.errors;
                if (rowArr.length === 0 || !inputRow.AN8 || rowArr[0].mnAddressNumber_19.value !== inputRow.AN8 && !inputRow.EXTRACT) {
                    _.postSuccess("Adding record to Address Master");
                    self.getAddForm(inputRow);
                } else if (errObj.length > 0) {
                    _.getErrorMsgs(errObj);
                    _.returnFromError();
                } else if (rowArr.length > 0) {
                    _.postSuccess("Selecting Address Book record");
                    self.selectRow(inputRow);
                } else {
                    _.postError("There was a problem finding the requested record, or there are duplicates");
                    _.returnFromError();
                }
            });
        };

        self.getAddForm = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W01012B"
            },"21");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P01012_W01012A")) {
                    var errObj = data.fs_P01012_W01012A.errors;
                    var warningsObj = data.fs_P01012_W01012A.warnings;
                    var fieldData = data.fs_P01012_W01012A.data;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (warningsObj.length > 0) {
                        _.getErrorMsgs(warningsObj);
                        _.returnFromError();
                    } else {
                        globals.htmlInputs = fieldData;
                        self.insertNewData(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }                
            });
        };
        self.insertNewData = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W01012A",
                type: "close",
                dynamic: true
            },["21",inputRow.AN8],"11", "11");

            _.getForm("appstack", reqObj).then(function (data) {
                
                if (data.hasOwnProperty("fs_P01012_W01012A")) {
                    var errObj = data.fs_P01012_W01012A.errors;
                    var warningsObj = data.fs_P01012_W01012A.warnings;
                    var fieldData = data.fs_P01012_W01012A.data;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (warningsObj.length > 0) {
                        _.getErrorMsgs(warningsObj);
                        _.returnFromError();
                    } else {
                        _.successOrFail(data,{successMsg: "Address Book record updated"});
                    }
                } else {
                    _.successOrFail(data,{successMsg: "Address Book record updated"});
                }
                
            });
        };

        self.selectRow = function(inputRow) {
            var optionsObj = {
                form: "W01012B"
            };

            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }

            var reqObj = _.buildAppstackJSON(optionsObj, "1.0", "25");
            
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P01012_W01012A")) {
                    var errObj = data.fs_P01012_W01012A.errors;
                    var fieldData = data.fs_P01012_W01012A.data;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT) {
                        _.postSuccess("Extracting data");
                        // fix for DUNS fields having apostrophes in them
                        var DUNSFields = ['z_DUNS01_456', 'z_DUNS02_457', 'z_DUNS03_458'];

                        $.each(DUNSFields, function (i){
                            if (fieldData.hasOwnProperty(DUNSFields[i]) && fieldData[DUNSFields[i]].value === '" "') {
                                fieldData[DUNSFields[i]].value = '';
                            }
                        })
                        _.appendTable(fieldData);
                    } else {
                        globals.htmlInputs = fieldData;
                    self.updateForm(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while entering the UPDATE form");
                    _.returnFromError();
                }
            });
        };

        self.updateForm = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W01012A",
                type: "close",
                dynamic: true
            },"11","11");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Address Book record updated"});
            });
        };
    };
    return new Process();
});