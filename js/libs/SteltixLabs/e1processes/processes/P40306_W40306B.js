define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                    name: "DL01"
                }, {
                    name: "LITM"
                }, {
                    name: "PCFL"
                }, {
                    name: "CS06"
                }, {
                    name: "IT06"
                }, {
                    name: "MCU"
                }, {
                    name: "MOT"
                }, {
                    name: "ROUT"
                }, {
                    name: "CARS"
                }, {
                    name: "PCFL"
                }, {
                    name: "STPR"
                }, {
                    name: "OSEQ"
                }, {
                    name: "EFTJ"
                }, {
                    name: "EXDJ"
                }, {
                    name: "code_1"
                }, {
                    name: "code_2"
                }, {
                    name: "code_3"
                }
            ],
            isCustomTemplate: true
        };
        self.closeObj = {
            subForm: "W40306A",
            closeID: "5"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            var reqObj;
            self.type = "1";
            reqObj = _.buildAppstackJSON({
                form: "P40306_W40306A",
                type: "open"
            },["1[7]",inputRow.AN8],["32",inputRow.LITM],["1[8]",inputRow.CS06],["1[10]",inputRow.IT06],["1[11]",inputRow.MCU],"26");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P40306_W40306A")) {
                    var rowArr = data.fs_P40306_W40306A.data.gridData.rowset;
                    var errObj = data.fs_P40306_W40306A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        self.getAddForm(inputRow);
                        _.postSuccess("Adding Inventory Commitment Profile");
                    } else if (rowArr.length === 1) {
                        self.selectRow(inputRow);
                        _.postSuccess("Inventory Commitment Profile found");
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
            var reqObj = _.buildAppstackJSON({
                form: "W40306A"
            },"1.0","4");

            _.getForm("appstack",reqObj).then(function(data){
                globals.htmlInputs = data.fs_P40306_W40306B.data;
                globals.titleList = data.fs_P40306_W40306B.data.gridData.titles;
                if (data.hasOwnProperty("fs_P40306_W40306B")) {
                    var errObj = data.fs_P40306_W40306B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Entering UPDATE form");
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
                form: "W40306B",
                type: "close",
                gridUpdate: true,
                customGrid: true
            },
            ["grid","32",inputRow.LITM],
            ["grid","16",inputRow.MCU],
            ["grid","17",inputRow.MOT],
            ["grid","18",inputRow.ROUT],
            ["grid","19",inputRow.CARS],
            ["grid","20",inputRow.PCFL],
            ["grid","21",inputRow.STPR],
            ["grid","15",inputRow.OSEQ],
            ["grid","10",inputRow.EFTJ],
            ["grid","11",inputRow.EXDJ],
            "54","54");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Inventory Commitment Profile successfully updated',isGrid:true});
            });

        };
        self.getAddForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W40306A"
            },"6");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P40306_W40306B")) {
                    var errObj = data.fs_P40306_W40306B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Entering ADD form");
                        self.addForm(inputRow);
                    }
                } else if (data.hasOwnProperty("fs_P40073_W40073F")) {
                    var errObj = data.fs_P40073_W40073F.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Selecting Preference Heirarchy");
                        self.selectHeirarchy(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }
            });
        };
        self.selectHeirarchy = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W40073F"
            },"1." + inputRow.DL01,"4");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P40306_W40306B")) {
                    globals.htmlInputs = data.fs_P40306_W40306B.data;
                    globals.titleList = data.fs_P40306_W40306B.data.gridData.titles;
                    var errObj = data.fs_P40306_W40306B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Adding new Inventory Commitment Profile");
                        self.addForm(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while selecting the Preference Heirarchy");
                    _.returnFromError();
                }
            });
        };
        self.addForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W40306B",
                type: "close",
                gridAdd: true,
                customGrid: true
            },["23",inputRow.AN8],
            ["32",inputRow.LITM],
            ["25",inputRow.CS06],
            ["grid","32",inputRow.LITM],
            ["grid","16",inputRow.MCU],
            ["grid","17",inputRow.MOT],
            ["grid","18",inputRow.ROUT],
            ["grid","19",inputRow.CARS],
            ["grid","20",inputRow.PCFL],
            ["grid","21",inputRow.STPR],
            ["grid","15",inputRow.OSEQ],
            ["grid","10",inputRow.EFTJ],
            ["grid","11",inputRow.EXDJ],
            "54","54");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Inventory Commitment Profile successfully added',isGrid:true});
            });
        }
    };
    return new Process();
}); 