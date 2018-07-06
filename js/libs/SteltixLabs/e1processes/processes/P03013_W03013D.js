// WORK WITH CUSTOMER MASTER
// Lemoine process
define(['aisclient'], function (_) {
    var Process = function () {
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

        // self.problemFields = [	{'alias': 'z_CO_10', 'longname' : 'txt__Company__CO__10' }  ];

        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);
            //inputRow = _.prepProblemFieldsForImport(inputRow, self.problemFields);

            if (inputRow.hasOwnProperty("CO") && inputRow.CO.substring(0,1) === "'")
                inputRow.CO = inputRow.CO.substring(1);

            var reqObj = _.buildAppstackJSON({
                form: "P03013_W03013A",
                type: "open"
            }, ["1[29]", inputRow.AN8], ["1[30]", inputRow.CO], "15");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P03013_W03013A")) {
                    var rowArr = data.fs_P03013_W03013A.data.gridData.rowset;
                    var errObj = data.fs_P03013_W03013A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    }
                    else if (rowArr.length === 0 && !inputRow.EXTRACT) {
                         _.postError("Customer not found. Please use the Address Master to add this customer");
                         _.returnFromError();
                     }
                    else if (rowArr.length === 0) {
                        _.postError("Record not found. Please use the Address Master to add this record");
                        _.returnFromError();
                    }
                    else if (rowArr.length === 1) { 
                        self.selectRow(inputRow);
                        _.postSuccess("Record found");
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
            var optionsObj = {
                form: "W03013A"
            };

            var reqObj = _.buildAppstackJSON(optionsObj, "1.0", "14");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P03013_W03013B")) {
                    var errObj = data.fs_P03013_W03013B.errors;
                    var fieldData = data.fs_P03013_W03013B.data;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Entering the Category Codes form");
                        var optionsObj = {
                            form: "W03013B"
                        };

                        if (inputRow.EXTRACT) {
                            optionsObj.aliasNaming = true;
                        }

                        var reqObj = _.buildAppstackJSON(optionsObj, "418");
                        _.getForm("appstack",reqObj).then(function(data){
                            if (data.hasOwnProperty("fs_P03013_W03013D")) {
                                var errObj = data.fs_P03013_W03013D.errors;
                                var fieldData = data.fs_P03013_W03013D.data;
                                if (errObj.length > 0) {
                                    _.getErrorMsgs(errObj);
                                    _.returnFromError();
                                } else if (inputRow.EXTRACT) {
                                    _.postSuccess("Extracting data");
        
                                    if (fieldData.hasOwnProperty("z_CO_89")) 
                                        fieldData.z_CO_89.value = "'"+fieldData.z_CO_89.value;
        
                                    _.appendTable(fieldData, self.reqFields);
                                } else {
                                    _.postSuccess("Updating Category Codes");
                                    globals.htmlInputs = fieldData;
                                    self.updateForm(inputRow);
                                }
                            }
                        });
                    }
                } else {
                    _.postError("An unknown error occurred in the find/browse form");
                    _.returnFromError();
                }
            });
        };
        self.updateForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W03013D",
                dynamic: true
            },"11");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P03013_W03013B")) {
                    var errObj = data.fs_P03013_W03013B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        var reqObj = _.buildAppstackJSON({
                            form: "W03013B"
                        },"11");
                        _.getForm("appstack",reqObj).then(function(data){
                            _.successOrFail(data,{successMsg: "Record updated"});
                        });
                    }
                } else {
                    _.postError("An unknown error occurred after update of category codes");
                    _.returnFromError();
                }
                
            });
        };
    };
    return new Process();
});