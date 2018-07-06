define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "CKNU",
                "id": 19
            }, {
                "name": "DOC",
                "id": 94
            }, {
                "name": "TAAP",
                "id": 215
            }, {
                "name": "TADA",
                "id": 214
            }, {
                "name": "DRCO",
                "id": 234
            }, {
                "name": "TAAJ",
                "id": 216
            }, {
                "name": "RSCO",
                "id": 77
            }, {
                "name": "TCBA",
                "id": 211
            }, {
                "name": "ECBR",
                "id": 79
            }, {
                "name": "TDA",
                "id": 213
            }, {
                "name": "DDEX",
                "id": 92
            }, {
                "name": "RMK",
                "id": 112
            }, {
                "name": "VR01",
                "id": 134
            }, {
                "name": "RMR1",
                "id": 250
            }],
            isCustomTemplate: true
        };
        self.closeObj = {
            subForm: "W03B102A",
            closeID: "5"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            var reqObj = _.buildAppstackJSON({
                form: "P03B102_W03B102A",
                type: "open"
            },["1[19]",inputRow.CKNU],"46");
            _.getForm("appstack",reqObj).then(function(data){
                self.noRe,sponse = false;
                if (data.hasOwnProperty("fs_P03B102_W03B102A")) {
                    var errObj = data.fs_P03B102_W03B102A.errors;
                    if (
                        ( inputRow.hasOwnProperty("TAAJ") && inputRow.hasOwnProperty("TCBA") ) ||
                        ( inputRow.hasOwnProperty("TAAJ") && inputRow.hasOwnProperty("TDA") ) ||
                        ( inputRow.hasOwnProperty("TCBA") && inputRow.hasOwnProperty("TDA") )
                        ) {
                            _.postError("Only a Write-off Amount OR a Chargeback Amount OR a Deduction Amount may be entered");
                            _.returnFromError();
                    } else if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (data.fs_P03B102_W03B102A.data.gridData.rowset.length > 1) {
                        _.postError("Duplicate receipt number. Please resolve before running the drop again");
                        _.returnFromError();
                    } else if (data.fs_P03B102_W03B102A.data.gridData.rowset.length === 0) {
                        _.postError("No receipts found");
                        _.returnFromError();
                    } else if (data.fs_P03B102_W03B102A.data.gridData.rowset.length === 1) {
                        self.selectReceipt(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred at step 1");
                    _.returnFromError();
                }
                
            });
        };
        // step 2: get P03B102_W03B102A, select first row
        // check=14
        self.selectReceipt = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W03B102A"
            },"1.0","14","14");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P03B102_W03B102E")) {
                    var errObj = data.fs_P03B102_W03B102E.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Opening receipt");
                        self.receiptFormExit(inputRow);
                    }
                } else if (data.hasOwnProperty("fs_P03B102_W03B102A")) { // if batch in progress
                    var errObj = data.fs_P03B102_W03B102A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postError("An uncaught error occurred while attempting to open the receipt");
                        _.returnFromError();
                    }
                } else {
                    _.postError("An unknown error occurred at step 2");
                    _.returnFromError();
                }
            });
        };
        // step 3: get Receipt Entry P03B102_W03B102E
        // take form exit to Select, id=145
        self.receiptFormExit = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W03B102E"
            },"145");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P03B102_W03B102H")) {
                    _.postSuccess("Selecting invoices");
                    self.selectInvoices(inputRow);
                } else if (data.hasOwnProperty("fs_P03B102_W03B102E")) {
                    var errObj = data.fs_P03B102_W03B102E.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postError("An uncaught error occurred while selecting invoices");
                        _.returnFromError();
                    }
                } else {
                    _.postError("An unknown error occurred at step 3");
                    _.returnFromError();
                }
            });
        };
        self.selectInvoices = function(inputRow) {
            var input;
            if (inputRow.hasOwnProperty('DOC')) {
                input = ["1[23]",inputRow.DOC];
            } else if (inputRow.hasOwnProperty('RMR1')) {
                input = ["1[117]",inputRow.RMR1];
            } else if (inputRow.hasOwnProperty('VR01')) {
                input = ["1[59]",inputRow.VR01];
            } else if (inputRow.hasOwnProperty('RMK')) {
                input = ["1[60]",inputRow.RMK];
            } else {
                _.postError("One of the following fields is required to search for invoices: DOC, RMR1, VR01, RMK");
                _.returnFromError();
            }

            var reqObj = _.buildAppstackJSON({
                form: "W03B102H"
            },input,"15");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.fs_P03B102_W03B102H.data.gridData.rowset.length > 1) {
                    _.postError("Duplicate invoices found. Please resolve before running the drop again");
                    self.returnToReceipt(inputRow,true);
                } else if (data.fs_P03B102_W03B102H.data.gridData.rowset.length === 0) {
                    _.postError("No invoices found");
                    self.returnToReceipt(inputRow,true);
                } else if (data.fs_P03B102_W03B102H.data.gridData.rowset.length === 1) {
                    _.postSuccess("Adding invoice number " + inputRow.DOC + " to receipt number " + inputRow.CKNU);
                    self.addInvoice(inputRow);
                } else {
                    _.postError("An unknown error occurred at step 4");
                    _.returnFromError();
                }
            });
        };
        self.addInvoice = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W03B102H"
            },"1.0","14");

            _.getForm("appstack",reqObj).then(function(data){
                // check that form is correct in response
                if (data.hasOwnProperty("fs_P03B102_W03B102H")) {
                    _.postSuccess("Adding invoice to receipt");
                    self.returnToReceipt(inputRow);
                } else {
                    _.postError("Error adding the invoice to the receipt");
                    _.returnFromError();
                }
            });
        };
        self.returnToReceipt = function(inputRow,isError) {
            var reqObj = _.buildAppstackJSON({
                form: "W03B102H"
            },"16");

            _.getForm("appstack",reqObj).then(function(data){
                // if from error, go to closeRequest, else continue...
                if (isError === true) {
                    self.closeRequest(inputRow,false)
                } else {
                    var rowToSelect;
                    // check that form is correct in response
                    if (data.hasOwnProperty("fs_P03B102_W03B102E")) {

                        _.postSuccess("Applying invoice to the receipt");
                        numRows = data.fs_P03B102_W03B102E.data.gridData.rowset.length;
                        rowToSelect = numRows - 1;

                        self.applyAmounts(inputRow,rowToSelect);
                    } else {
                        _.postError("Error returning to the receipt");
                        _.returnFromError();
                    }
                }
            });
        };
        self.applyAmounts = function(inputRow,rowToSelect) {
            if ( inputRow.hasOwnProperty("TAAJ") ) {
                self.UITC = "15"
            } else if ( inputRow.hasOwnProperty("TCBA") ) {
                self.UITC = "16"
            } else if ( inputRow.hasOwnProperty("TDA") ) {
                self.UITC = "17"
            } else {
                self.UITC = "10"
            }
            var reqObj = _.buildAppstackJSON({
                form: "W03B102E",
                gridUpdate: true,
                customGrid: true,
                rowToSelect: rowToSelect,
                suppressDynamicGrid: true,
            },["90",P03B102_W03B102E.UITC],["grid","215",inputRow.TAAP],["grid","214",inputRow.TADA],
            ["grid","234",inputRow.DRCO],["grid","216",inputRow.TAAJ],["grid","77",inputRow.RSCO],
            ["grid","211",inputRow.TCBA],["grid","79",inputRow.ECBR],["grid","213",inputRow.TDA],
            ["grid","92",inputRow.DDEX],["grid","112",inputRow.RMK]);

            _.getForm("appstack",reqObj).then(function(data){
                // check that form is correct in response
                if (data.hasOwnProperty("fs_P03B102_W03B102E")) {
                    if (data.fs_P03B102_W03B102E.errors.length > 0) {
                        var errObj = data.fs_P03B102_W03B102E.errors;
                        if (errObj.length > 0) {
                            _.getErrorMsgs(errObj);
                            _.returnFromError();
                        } else {
                            _.postSuccess("Closing application");
                            self.closeRequest(inputRow,false); // go to close step
                        }
                    } else {
                        _.postSuccess("Success! Amounts applied");
                        self.closeRequest(inputRow,true);
                    }
                } else if (data.hasOwnProperty("fs_P03B102_W03B102A")) {
                    if (data.fs_P03B102_W03B102A.errors.length > 0) {
                        var errObj = data.fs_P03B102_W03B102A.errors;
                        if (errObj.length > 0) {
                            _.getErrorMsgs(errObj);
                            _.returnFromError();
                        } else {
                            self.closeRequest(inputRow,false); // go to close step
                        }
                    } else {
                        $("#dataHolder").prepend("<tr><td>Row " + inputRow.ROW + " - Success! Amounts applied.</td></tr>");
                        self.closeRequest(inputRow,true);
                    }
                }
            });
        };
        self.closeRequest = function(inputRow,isSuccess) {
            var reqObj = _.buildAppstackJSON({
                form: "W03B102E",
                type: "close"
            },"13");

            _.getForm("appstack",reqObj).then(function(data){
                setTimeout(function() {
                    if (isSuccess === true) {
                        _.postSuccess("Application closed");
                        _.returnFromSuccess();
                    } else {
                        _.postError("An unknown error occurred while closing the application");
                        _.returnFromError();
                    };
                },500);
            });
        };
    };
    return new Process();
});