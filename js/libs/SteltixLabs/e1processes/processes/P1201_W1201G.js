// Asset Master Revisions
/* 
GENERAL COMMENTS ON PROCESS
- 
*/
define(['aisclient'],function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "NUMB"
            }, {
                "name": "CO"
            }, {
                "name": "MCU"
            }, {
                "name": "ANI"
            }, {
                "name": "DL01"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W1201G",
            closeID: "4"
        };
    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            if (inputRow.hasOwnProperty("CO") && inputRow.CO.substring(0, 1) === "'") {
                inputRow.CO = inputRow.CO.substring(1);
            }

            if (inputRow.hasOwnProperty("ANI") && inputRow.ANI.substring(0, 1) === "'") {
                inputRow.ANI = inputRow.ANI.substring(1);
            }
            
            if (!inputRow.hasOwnProperty("NUMB")) {
                inputRow.NUMB = '';
            }

            var reqObj = _.buildAppstackJSON({
                form: "P1204_W1204C",
                type: "open"
            },
                ["1[28]", inputRow.NUMB],
                "6");

            _.getForm("appstack",reqObj).then(function(data){
                var errObj = data.fs_P1204_W1204C.errors;
                if (errObj.length > 0) {
                    _.getErrorMsgs(errObj);
                    _.returnFromError();
                } else if (data.fs_P1204_W1204C.data.gridData.rowset.length === 0 || inputRow.NUMB === '') {
                    _.postSuccess("Adding new asset");
                    self.getAddForm(inputRow); // ADD
                } else if (data.fs_P1204_W1204C.data.gridData.rowset.length > 0) {
                    _.postSuccess("Go to update form");                    
                    self.selectRow(inputRow); // UPDATE
                } else {
                	_.postError("Unknown error with find/browse");
                	_.returnFromError();
                }
            });
    	};
        self.selectRow = function (inputRow) {
            var optionsObj = {
                form: "W1204C"
            };

            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }
            var reqObj = _.buildAppstackJSON(optionsObj, "1.0", "143");

            _.getForm("appstack",reqObj).then(function(data) {

                if (data.hasOwnProperty("fs_P1201_W1201G")) {
                
                    globals.htmlInputs = data.fs_P1201_W1201G.data;
                    var errObj = data.fs_P1201_W1201G.errors;
                
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT) {
                
                        var fieldObj = data.fs_P1201_W1201G.data;
                        console.log(fieldObj);

                        if (fieldObj.hasOwnProperty("z_CO_22")) {
                            fieldObj.z_CO_22.value = "'" + fieldObj.z_CO_22.value;
                        }

                        if (fieldObj.hasOwnProperty("z_ANI_86")) {
                            fieldObj.z_ANI_86.value = "'" + fieldObj.z_ANI_86.value;
                        }
                
                        _.postSuccess("Extracting data");
                        _.appendTable(fieldObj);
                    } else {

                        // check that form is correct in response
                        _.postSuccess("Updating Asset Master");
                        self.updateRecord(inputRow);
                    }
                } else {
                    _.postError("Error selecting the row");
                    _.returnFromError();
                }
            });
    	};
    	self.getAddForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({form: "W1204C"},"77");

            _.getForm("appstack",reqObj).then(function(data){
                reqObj = {};

                globals.htmlInputs = data.fs_P1201_W1201G.data;
                self.insertNewRecord(inputRow);
            });
        };
        
    	self.insertNewRecord = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W1201G",
                type: "close",
                dynamic: true
            },["6",inputRow.NUMB],["22",inputRow.CO],["24",inputRow.MCU],
            ["86",inputRow.ANI],["12",inputRow.DL01],"3");

            _.getForm("appstack",reqObj).then(function(data){
                reqObj = {};
                if (data.hasOwnProperty("fs_P1201_W1201G")) {
                    var errObj = data.fs_P1201_W1201G.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("New asset created!");
                        _.returnFromSuccess();
                    }
                } else {
                	_.postError("Unknown error occured while submitting the ADD form");
                	_.returnFromError();
                }
            });
        };

        self.callingBenjamin = function (theData) {
            var errObj = theData.fs_P1201_W1201G.errors;
            if (errObj.length > 0) {
                _.getErrorMsgs(errObj);
                _.returnFromError();
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W1201G",
                    type: "close"
                }, "4");

                _.getForm("appstack", reqObj).then(function (data) {

                    if (data.hasOwnProperty("fs_P1204_W1204C")) {
                        _.successOrFail(data, { successMsg: 'Successfully updated!!' });
                    }

                });
            }
        }

        self.updateRecord = function (inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W1201G",
                dynamic: true
            },
                ["6", inputRow.NUMB],
                ["22", inputRow.CO],
                ["24", inputRow.MCU],
                ["86", inputRow.ANI],
                ["12", inputRow.DL01],
                "3");

            _.getForm("appstack", reqObj).then(function (data) {
                reqObj = {};
                if (data.hasOwnProperty("fs_P1201_W1201G")) {
                    self.callingBenjamin(data);
                } else if (data.hasOwnProperty("fs_P1201_W1201J")) {
                    var errObj = data.fs_P1201_W1201J.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        var reqObj = _.buildAppstackJSON({
                            form: "W1201J",
                            // type: "close"
                        },
                            ["8", inputRow.BEGT],    
                            ["23", inputRow.EFTB],
                            ["27", inputRow.UPLOW],
                            "3");
                        
                        _.getForm("appstack", reqObj).then(function (data) {
                            if (data.hasOwnProperty("fs_P1201_W1201G")) {
                                self.callingBenjamin(data);
                            } else {
                                _.postError("Unknown error occured while UPDATING the status form");
                                _.returnFromError();
                            }
                        });
                        
                        _.postSuccess("Asset updated!");
                        _.returnFromSuccess();
                    }
                } else {
                	_.postError("Unknown error occured while UPDATING the form");
                	_.returnFromError();
                }
            });
    	};
    };
    return new Process();
});