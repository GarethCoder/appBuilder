// Item Branch/Plant Revision
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "MCU"
            }, {
                name: "LITM"
            }, {
                name: "LOCNE1"
            }, {
                name: "LOTN"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W41026E",
            closeID: "5"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            var reqObj = _.buildAppstackJSON({
                form: "P41026_W41026E",
                type: "open",
                turbo: true
            },["1[12]",inputRow.MCU],["1[8]",inputRow.LITM],"6");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41026_W41026E")) {
                    var rowArr = data.fs_P41026_W41026E.data.gridData.rowset;
                    var errObj = data.fs_P41026_W41026E.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        self.getAddForm(inputRow);
                        _.postSuccess("Adding Item Branch/Plant");
                    } else if (rowArr.length >= 1) {
                        if (rowArr.length === 1) {
                            self.selectRow(inputRow);
                            _.postSuccess("Item Branch/Plant found");
                        } else if (rowArr.length > 1) {
                            // console.log("There is more records to loop over and extract");
                            for (i = 1;i < rowArr.length; i++)
                                {
                                    var inputRowCopy = JSON.parse(JSON.stringify(inputRow));
                                    inputRowCopy.LITM = rowArr[i].z_LITM_8;
                                    inputRowCopy.MCU = rowArr[i].z_MCU_12;
                                    globals.processQ.push(inputRowCopy);
                                }
                                _.postSuccess("Records found");
                                self.selectRow(inputRow);
                        }
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
                form: "W41026E"
            };
            if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                optionsObj.returnControlIDs = true;
            } else {
                optionsObj.turbo = true;
            }
            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }
            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","107");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41026_W41026A")) {
                    var errObj = data.fs_P41026_W41026A.errors;
                    var fieldObj = data.fs_P41026_W41026A.data;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT) {
                        _.postSuccess("Extracting data");
                        _.appendTable(fieldObj);
                    } else {
                        _.postSuccess("Entering the Revisions form");
                        if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                            globals.htmlInputs = fieldObj;
                        }
                        self.updateForm(inputRow);
                    }
                } else if (data.hasOwnProperty("fs_P41026_W41026E")) {
                    var errObj = data.fs_P41026_W41026E.errors;
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
                form: "W41026A",
                type: "close",
                dynamic: true
            },"11","11");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Item Branch record updated"});
            });
        };
        self.getAddForm = function(inputRow) {
            if (globals.htmlInputs.length === 0) { // only an empty array when first declared. When populated with data, it is an object.
                var reqObj = _.buildAppstackJSON({
                    form: "W41026E",
                    returnControlIDs: true
                },"47");
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W41026E",
                    turbo: true
                },"47");
            }
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41026_W41026A")) {
                    var errObj = data.fs_P41026_W41026A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                            globals.htmlInputs = data.fs_P41026_W41026A.data;
                        }
                        self.addForm(inputRow);
                        _.postSuccess("Entering new Item Branch/Plant data");
                    }
                } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }
            });
        };
        self.addForm = function(inputRow) {
            var optionsObj = {};
            if (globals.htmlInputs.length === 0) { // should only be true for first Excel row
                optionsObj = {
                    form: "W41026A",
                    dynamic: true,
                    returnControlIDs: true
                };
            } else {
                optionsObj = {
                    form: "W41026A",
                    dynamic: true,
                    turbo: true
                };
            }
            var reqObj = _.buildAppstackJSON(optionsObj,
                ["15",inputRow.MCU],
                ["16",inputRow.LITM],"11");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41026_W41026G")) { // if Cat Codes
                    // go to function to click close, move to addLocation
                    _.postSuccess("Closing Category Codes form");
                    self.closeCatCodes(inputRow);
                } else if (data.hasOwnProperty("fs_P41026_W41026B")) {
                    self.addLocation(inputRow);
                    _.postSuccess("Adding location and lot information");
                } else {
                    _.successOrFail(data,{successMsg: "Item Branch record added"});
                }
            });
        };
        self.closeCatCodes = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W41026G",
                turbo: true
            },"12");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41026_W41026B")) {
                    _.postSuccess("Adding location and lot information");
                    self.addLocation(inputRow);
                } else {
                    _.successOrFail(data,{successMsg: "Item Branch record added"});
                }
            });
        };
        self.closeQuantities = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W41026C",
                turbo: true
            },"11");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41026_W41026D")) {
                    _.postSuccess("Closing Additional Systems Info form");
                    self.closeSystems(inputRow);
                } else if (data.hasOwnProperty("fs_P41026_W41026B")) {
                    _.postSuccess("Adding location and lot information");
                    self.addLocation(inputRow);
                } else {
                    _.successOrFail(data,{successMsg: "Item Branch record added"});
                }
            });
        };
        self.closeSystems = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W41026D",
                turbo: true
            },"11");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41026_W41026B")) {
                    _.postSuccess("Adding location and lot information");
                    self.addLocation(inputRow);
                } else {
                    _.successOrFail(data,{successMsg: "Item Branch record added"});
                }
            });
        };
        self.addLocation = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W41026B",
                type: "close",
                turbo: true
            },["13",inputRow.LOCNE1],["8",inputRow.LOTN],"3");

            _.getForm("appstack",reqObj).then(function(data){
                    _.successOrFail(data,{successMsg: "Item Branch record added"});
            });
        };
        self.closeSession = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W41026A",
                type: "close",
                turbo: true
            },"12");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Item Branch record added"});
            });
        };
    };
    return new Process();
});