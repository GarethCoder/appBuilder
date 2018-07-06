define(['aisclient'], function(_){
    var Process = function () {
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "DL01"
            },{
                "name": "LITM"
            }, {
                "name": "PRGR"
            }, {
                "name": "CPGP"
            }, {
                "name": "AN8"
            }, {
                "name": "LOCNE1"
            }, {
                "name": "LOTN"
            }, {
                "name": "MCU"
            }, {
                "name": "UOM"
            }, {
                "name": "CRCD"
            }, {
                "name": "UPRC"
            }, {
                "name": "EFTJ"
            }, {
                "name": "EXDJ"
            }, {
                "name": "code_1"
            }, {
                "name": "code_2"
            }, {
                "name": "ACRD"
            }, {
                "name": "AC13"
            }],
            isCustomTemplate: true
        };
        self.closeObj = {
            subForm: "W4106J",
            closeID: "5"
        };
        self.rowsToExpire = [];
        self.rowToEdit = null;
    	self.init = function(){
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            self.rowsToExpire = [];

            var reqObj = _.buildAppstackJSON({
                form: "P4106_W4106J",
                type: "open"
            },
            ["1[345]",inputRow.LITM],
            ["1[317]",inputRow.AN8 || "<1"],
            ["1[333]",inputRow.PRGR || "<1"],
            ["1[344]",inputRow.CPGP || "<1"],
            ["1[312]",inputRow.MCU],
            ["1[321]",inputRow.UOM],
            ["1[320]",inputRow.CRCD],"6");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4106_W4106J")) {
                    var rowArr = data.fs_P4106_W4106J.data.gridData.rowset;
                    var errObj = data.fs_P4106_W4106J.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        _.postSuccess("Preference Base Price not found: beginning ADD process");
                        self.getAddForm(inputRow);
                    } else {
                        _.postSuccess("Preference Base Price found");
                        self.selectRow(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred in the find/browse form");
                    _.returnFromError();
                }
            });
    	};
    	self.selectRow = function(inputRow) {
    		var reqObj = _.buildAppstackJSON({
                form: "W4106J"
            },"1.0","4");

    		_.getForm("appstack",reqObj).then(function(data){
    		    if (data.hasOwnProperty("fs_P4106_W4106K")) {
                    var errObj = data.fs_P4106_W4106K.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        globals.htmlInputs = data.fs_P4106_W4106K.data;
                        var row = data.fs_P4106_W4106K.data.gridData.rowset;

                        // Logic to compare dates and determine whether to ADD, UPDATE or EXPIRE the row
                        var ST2 = moment(inputRow.EFTJ,globals.simpleDateFormat);
                        var END2 = moment(inputRow.EXDJ,globals.simpleDateFormat);
                        var action = "add";

                        for (var i = 0; i < row.length; i++) {
                            var matchCandidate = inputRow.CRCD.toLowerCase() === row[i]["sCurCod_487"].value.toLowerCase() && 
                                                 inputRow.UOM.toLowerCase() === row[i]["sUM_494"].value.toLowerCase();

                            // if Currency and Quantity Break match, check dates.
                            if ( matchCandidate ) {
                                self.rowToEdit = i;
                                action = "update";
                                break;

                                /*
                                var ST1 = moment(row[i].dtEffDateFrom_488.value,globals.simpleDateFormat);
                                var END1 = moment(row[i].dtEffDateThru_489.value,globals.simpleDateFormat);
                                if ( ST2.isSame(ST1) && END2.isSame(END1) ) { // cache row for updating if the same date range is exactly the same
                                    self.rowToEdit = i;
                                    action = "update";
                                    break;
                                } else if ( ST2.isSame(ST1) || moment({}).isBetween(ST1,END1,null,[]) && moment({}).isBetween(ST2,END2,null,[]) ) {
                                //} else if ( moment({}).isBetween(ST1,END1,null,[]) && moment({}).isBetween(ST2,END2,null,[]) ) {
                                    // Instruction: expire
                                    self.rowToEdit = i;
                                    inputRow.EFTJ = globals.inputRow.EFTJ = globals.now; // make the new input effective from today
                                    action = "expire";
                                    break;
                                } // else "add", by default
                                */
                            }
                        }
                        if (action === "add") {
                            _.postSuccess("Adding new Preference Base Price grid row");
                            self.addForm(inputRow);
                        } else if (action === "expire") {
                            _.postSuccess("Beginning grid row expiry");
                            self.expireBeforeAddUpdate(inputRow);
                        } else {
                            _.postSuccess("Updating the Preference Base Price grid");
                            self.updateForm(inputRow);
                        }
                    }
                } else if (data.hasOwnProperty("fs_P4106_W4106J")) {
                    var errObj = data.fs_P4106_W4106J.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postError("There was a problem entering the Preference Base Price form");
                        _.returnFromError();
                    }
                } else {
                    _.postError("An unknown error occurred entering the Preference Base Price form");
                    _.returnFromError();
                }
    		});
    	};
        self.expireBeforeAddUpdate = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W4106K",
                gridUpdate: true,
                customGrid: true,
                suppressDynamicGrid: true,
                rowToSelect: self.rowToEdit
            },["grid","488",globals.twoDaysAgo],["grid","489",globals.oneDayAgo],"4","4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Grid row expired",grid: true,successCb: self.selectAfterExpiry},inputRow);
            });
        };
        self.selectAfterExpiry = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W4106J"
            },"1.0","4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Adding grid row after expiring existing row',grid: true,successCb: self.addForm},inputRow);
            });
        };
        self.updateForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W4106K",
                type: "close",
                rowToSelect: self.rowToEdit,
                gridUpdate: true,
                customGrid: true,
                suppressDynamicGrid: true
            },["grid","493",inputRow.MCU],["grid","357",inputRow.LOCNE1],["grid","492",inputRow.LOTN],
            ["grid","494",inputRow.UOM],["grid","487",inputRow.CRCD],["grid","486",inputRow.AN8],
            ["grid","377",inputRow.code_1],["grid","378",inputRow.code_2],["grid","495",inputRow.UPRC],
            ["grid","488",inputRow.EFTJ],["grid","489",inputRow.EXDJ],["grid","485",inputRow.ACRD],
            ["grid","381",inputRow.AC13],"4","4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Preference Base Price record updated",isGrid: true});
            });
        };
        self.getAddForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W4106J"
            },"56");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P40073_W40073F")) {
                    var errObj = data.fs_P40073_W40073F.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Selecting Preference Heirarchy");
                        self.selectPreferenceHeirarchy(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while entering the Select Preference Heirarchy form");
                    _.returnFromError();
                }
            });
        };
        self.selectPreferenceHeirarchy = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W40073F"
            },"1." + inputRow.DL01,"4");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4106_W4106K")) {
                    var errObj = data.fs_P4106_W4106K.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Adding Preference Base Price");
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
                form: "W4106K",
                type: "close",
                gridAdd: true,
                customGrid: true,
                suppressDynamicGrid: true
            },["7",inputRow.LITM],["498",inputRow.CPGP],["501",inputRow.PRGR],
            ["grid","493",inputRow.MCU],["grid","357",inputRow.LOCNE1],["grid","492",inputRow.LOTN],
            ["grid","494",inputRow.UOM],["grid","487",inputRow.CRCD],["grid","486",inputRow.AN8],
            ["grid","377",inputRow.code_1],["grid","378",inputRow.code_2],["grid","495",inputRow.UPRC],
            ["grid","488",inputRow.EFTJ],["grid","489",inputRow.EXDJ],["grid","485",inputRow.ACRD],
            ["grid","381",inputRow.AC13],"4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Preference Base Price record added",isGrid: true});
            });
        };
    };
    return new Process();
});