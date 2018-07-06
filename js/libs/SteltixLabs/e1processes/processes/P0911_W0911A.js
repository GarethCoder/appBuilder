define(['aisclient'], function(_){    
    var Process = function(){
        var self = this;
        
        self.batchno = 0;
        
        self.reqFields = {
            titles: [{
                "name": "EXA"
            },
            {
                "name": "grid__Account Number__ANI__12"
            },
            {
                "name": "grid__Amount__AA__13"
            }
            ],
            isCustomTemplate: false
        },

        self.closeObj = {
    		subForm: "W0011A",
    		closeID:"3"
    	};
       
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            if (inputRow.hasOwnProperty("EXA") &&
                inputRow.hasOwnProperty("grid__Account Number__ANI__12") &&
                inputRow.hasOwnProperty("grid__Amount__AA__13")) {
            _.postSuccess("Processing row " + inputRow.ROW);

            if (processedRows() === 0) { //first row
                var reqObj = _.buildAppstackJSON({
                    form: "P0911_W0911I",
                    type: "open"
                }, "83"); 
                
                _.getForm("appstack", reqObj).then((data) => {
                    if (data.hasOwnProperty("fs_P0911_W0911A")) {
                        var errObj = data.fs_P0911_W0911A.errors;
                        var warnObj = data.fs_P0911_W0911A.warnings;
                        
                        if (errObj.length > 0) { //can't get to the A form
                            globals.processQ = []; //clear the row queue, so the process doesn't keep looping
                            _.getErrorMsgs(errObj);
                            _.postError("Could not open P0911_W0911A");
                            _.returnFromError();
                        } else if (warnObj.length > 0) {
                            globals.processQ = []; //clear the row queue, so the process doesn't keep looping
                            _.getErrorMsgs(warnObj);
                            _.postError("Warning while opening P0911_W0911A");
                            _.returnFromError(); 
                        } else {
                            var reqObj = _.buildAppstackJSON({
                                form: "W0911A",
                                type: "execute",
                            },["54", inputRow["txt__G/L Date__DGJ__54"]], 
                            ["50", inputRow["txt__Document Company__KCO__50"]], 
                            ["273", inputRow["txt__Currency__CRCD__273"]], 
                            ["275", inputRow["txt__Exchange Rate__CRR__275"]], 
                            ["48", inputRow["txt__Document Number__DOC__48"]], 
                            ["292", inputRow["txt__Ledger Type__LT__292"]], 
                            ["320", inputRow["txt__Doc Type/No/Co__DCT__320"]], 
                            ["57", inputRow.EXA]); //set the non-grid fields
                            
                            _.getForm("appstack", reqObj).then((data) => {
                                var errObj = data.fs_P0911_W0911A.errors;
                                var warnObj = data.fs_P0911_W0911A.warnings;
                                
                                if (errObj.length > 0) {
                                    globals.processQ = []; //clear the row queue, so the process doesn't keep looping
                                    _.getErrorMsgs(errObj);
                                    _.postError("Error while setting explanation field");
                                    _.returnFromError();   
                                } else if (warnObj.length > 0) {
                                    globals.processQ = []; //clear the row queue, so the process doesn't keep looping
                                    _.getErrorMsgs(warnObj);
                                    _.postError("Error while setting explanation field");
                                    _.returnFromError(); 
                                } else {
                                    self.addRow().then((data) => {
                                        var errObj = data.fs_P0911_W0911A.errors;
                                        var warnObj = data.fs_P0911_W0911A.warnings;
                                        
                                        if (errObj.length > 0) {
                                            _.getErrorMsgs(errObj);
                                            _.postError("Error while submitting the first row");
                                            _.returnFromError();   
                                        } else if (warnObj.length > 0) {
                                            _.getErrorMsgs(warnObj);
                                            _.postError("Warning while submitting the first row");
                                            _.returnFromError(); 
                                        } else {
                                            _.postSuccess("Processed initial row");
                                            _.returnFromSuccess();
                                        } 
                                    });
                                }
                            });
                            
                        }
                    }
                });
            } else if (globals.processQ.length === 1) { //final row
                self.addRow().then((data) => {
                    var errObj = data.fs_P0911_W0911A.errors;
                    var warnObj = data.fs_P0911_W0911A.errors;
                    
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.postError("Error while submitting the rows");
                    } else if (warnObj.length > 0) {
                        _.getErrorMsgs(warnObj);
                        _.postError("Warning while submitting the rows");
                    } else {
                        _.postSuccess("Processed every row");
                    }
                    
                    self.submitAll();
                });
            } else { //middle rows
                self.addRow().then((data) => {
                    var errObj = data.fs_P0911_W0911A.errors;
                    var warnObj = data.fs_P0911_W0911A.warnings;
                    
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.postError("Error while submitting a row");
                        _.returnFromError();   
                    } else if (warnObj.length > 0) {
                        _.getErrorMsgs(warnObj);
                        _.postError("Warning while submitting a row");
                        _.returnFromError(); 
                        } else {
                        _.postSuccess("Processed a row");
                        _.returnFromSuccess();
                    }
                });
            }
        } else {
            _.postError("Missing a required field");
            globals.processQ = [];
            _.returnFromError();
        }
        };
        self.addRow = function() {
            var reqObj = _.buildAppstackJSON({
                form: "W0911A",
                type: "execute",
                gridAdd: true,
            }); 
            
            return _.getForm("appstack", reqObj);
        }
        
        self.submitAll = function() {
            var reqObj = _.buildAppstackJSON({
                form: "W0911A",
                type: "execute",
            }, "2");
            
            _.getForm("appstack", reqObj).then((data) => {
                var errObj = data.fs_P0911_W0911A.errors;
                var warnObj = data.fs_P0911_W0911A.warnings;

                if (errObj.length > 0) {
                    _.getErrorMsgs(errObj);
                    _.postError("Error while submitting a row");
                    _.returnFromError();   
                } 
                else if (warnObj.length > 0) {
                    _.getErrorMsgs(warnObj);
                    _.postError("Warning while submitting a row");
                    _.returnFromError(); 
                } else {

                    var reqObj = _.buildAppstackJSON({
                            form: "W0911A",
                            type: "close",
                        }, "3");

                    _.getForm("appstack", reqObj).then((data) => {
                        var batchnumber;

                        if (data.hasOwnProperty('fs_P0911_W0911A'))
                        batchnumber = data.fs_P0911_W0911A.data.txtBatchNumber_258.value;
                    else if (data.hasOwnProperty('fs_P0911_W0911I'))
                        batchnumber = data.fs_P0911_W0911I.data.txtBatchNumber_129.value;
                    else _.postError("Unknown form for batch number processing.");

                       // batchnumber = data.fs_P0911_W0911A.data.txtBatchNumber_258.value;

                    // _.logOut();
                    var reqObj = _.buildAppstackJSON({
                            form: "P0011_W0011A",
                            type: "open",
                    }, ["1[4]",batchnumber], "21");

                        _.getForm("appstack", reqObj).then((data) => {
                            if (data.hasOwnProperty("fs_P0011_W0011A")) {
                                var gridData = data.fs_P0011_W0011A.data.gridData;
                                if (gridData.rowset.length==1) {
                                    // select the row and go into revise menu option
                                    var reqObj = _.buildAppstackJSON({
                                        form: "W0011A"
                                    },"1.0","40");

                                    _.getForm("appstack", reqObj).then((data) => {
                                        console.log(data);
                                        if (data.hasOwnProperty("fs_P0011_W0011D")) {
                                            var reqObj = _.buildAppstackJSON({
                                                form: "W0011D",
                                                type: "close",
                                            }, ["20", "A"], "1");

                                            _.getForm("appstack", reqObj).then((data) => {
                                                if (data.hasOwnProperty("fs_P0011_W0011A")) {
                                                    _.successOrFail(data,{ successMsg:"Batch created successfully ("+batchnumber+")" });
                                                }
                                                else
                                                    _.postError("Failed to approve and close form.");
                                            });
                                        }
                                    });
                                }
                                else
                                if (gridData.rowset.length==0) {
                                    _.postError("Batch ("+batchnumber+") couldn't be found to review and approve. Please approve manually.");
                                }
                            }

                        });
                    });
                }
            });
        };
    };
    return new Process();
});
