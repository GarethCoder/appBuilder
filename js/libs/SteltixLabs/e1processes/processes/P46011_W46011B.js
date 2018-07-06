// Unit of Measure Definitions
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "LITM"
            }, {
                name: "MCU"
            }, {
                name: "UOM"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W46011A",
            closeObj: "16"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            var inputs;
            if (inputRow.hasOwnProperty("DIM")) { // if user has inputted Item Dimension Group data only
                inputs = ["79",inputRow.DIM];
            } else { // if user has inputted Item Number data only
                inputs = ["21",inputRow.LITM];
            } 
            var reqObj = _.buildAppstackJSON({
                form: "P46011_W46011A",
                type: "open",
                turbo: true
            },inputs,["1[26]",inputRow.UOM],["23",inputRow.MCU],"15");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P46011_W46011A")) {
                    var rowArr = data.fs_P46011_W46011A.data.gridData.rowset;
                    var errObj = data.fs_P46011_W46011A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        self.getAddForm(inputRow);
                        _.postSuccess("Adding Unit of Measure Definition");
                    } else if (rowArr.length === 1) {
                        self.selectRow(inputRow);
                        _.postSuccess("Unit of Measure Definition found");
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
        self.getAddForm = function(inputRow) {

            if (globals.htmlInputs.length === 0) {
                var reqObj = _.buildAppstackJSON({
                    form: "W46011A",
                    returnControlIDs: true
                },"54");
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W46011A",
                    turbo: true
                },"54");
            }
            
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P46011_W46011B")) {
                    var errObj = data.fs_P46011_W46011B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                            globals.htmlInputs = data.fs_P46011_W46011B.data;
                        }
                        self.addForm(inputRow);
                        _.postSuccess("Entering new Unit of Measure Definition data");
                    }
                } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }
            });
        };
        self.addForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W46011B",
                type: "close",
                dynamic: true,
                turbo: true
            },["62",inputRow.LITM],
            ["14",inputRow.MCU],
            ["69",inputRow.UOM],"11");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Unit of Measure Definition successfully added'});
            });
        };
        self.selectRow = function(inputRow) { // here we have to select the right grid item, i.e. filter it further
            if (globals.htmlInputs.length === 0) {
                var reqObj = _.buildAppstackJSON({
                    form: "W46011A",
                    returnControlIDs: true
                },"1.0","14");
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W46011A",
                    turbo: true
                },"1.0","14");
            }
            
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P46011_W46011B")) {
                    var errObj = data.fs_P46011_W46011B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Entering the Revisions form");
                        if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                            globals.htmlInputs = data.fs_P46011_W46011B.data;
                        }
                        self.updateForm(inputRow);
                    }
                } else if (data.hasOwnProperty("fs_P46011_W46011A")) {
                    var errObj = data.fs_P46011_W46011A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postError("There was a problem entering the Revisions form");
                        _.returnFromError();
                    }
                } else {
                    _.postError("An unknown error occurred in the find/browse form");
                    _.returnFromError();
                }
            });
        };
        self.updateForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W46011B",
                type: "close",
                dynamic: true,
                turbo: true
            },"11");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Unit of Measure Definition successfully updated'});
            });
        };
    };
    return new Process();
});