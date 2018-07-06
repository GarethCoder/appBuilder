// Item Locations
// A: revision
// B: find-browse
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "LITM"
            }, {
                "name": "MCU"
            }, {
                "name": "LOCNE1"
            }, {
                "name": "MAKE_PRIMARY"
            }, {
                "name": "DELETE"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W41024B",
            closeID: "5"
        };
        self.findRowExit = function(inputRow,rowArr) {
            var rowToSelect = "add";
            for (var i = 0; i < rowArr.length; i++) {
                if (rowArr[i].sLocation_25.value.replace(/ /g,'').toLowerCase() === inputRow.LOCNE1.replace(/ /g,'').toLowerCase().trim()) {
                    rowToSelect = i;
                }
            }
            return rowToSelect;
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.LOCNE1 = _.filterBlank(inputRow.LOCNE1);
            
            if (!inputRow.hasOwnProperty("LOCNE1")) {
                _.postError("Please enter a location. If the location is blank, please enter dropZone's blank placeholder: ___blank___");
                _.returnFromError();
            } else {
                inputRow.LOCNE1 = _.filterBlank(inputRow.LOCNE1);
                if (inputRow.hasOwnProperty("DELETE")) {
                    var deleteStr = inputRow.DELETE.toString().toLowerCase().trim();
                    inputRow.DELETE = deleteStr === "true" || deleteStr === "y" || deleteStr === "yes" || deleteStr === "1" ? inputRow.DELETE = true : inputRow.DELETE = false;
                } else {
                    inputRow.DELETE = false;
                }
                var reqObj = _.buildAppstackJSON({
                    form: "P41024_W41024B",
                    type: "open"
                },["20",inputRow.MCU],["18",inputRow.LITM],"6");

                _.getForm("appstack",reqObj).then(function(data){
                    if (data.hasOwnProperty("fs_P41024_W41024B")) {
                        var rowArr = data.fs_P41024_W41024B.data.gridData.rowset;
                        var errObj = data.fs_P41024_W41024B.errors;
                        if (errObj.length > 0) {
                            _.getErrorMsgs(errObj);
                            _.returnFromError();
                        } else {
                            var rowToSelect = self.findRowExit(inputRow,rowArr);
                            if ( (rowToSelect === "add" || rowArr.length === 0) && inputRow.DELETE === false) {
                                _.postSuccess("Adding Item Location");
                                self.getAddForm(inputRow);
                            } else if (inputRow.DELETE === true && rowToSelect === "add") {
                                _.postError("This Item Location does not exist for deletion");
                                _.returnFromError();
                            } else {
                                _.postSuccess("Updating Item Location");
                                self.selectRow(inputRow, rowToSelect);
                            }
                        }
                    } else {
                        _.postError("An unknown error occurred in the find/browse form");
                        _.returnFromError();
                    }
                });
            }
        };
        self.selectRow = function(inputRow,rowToSelect) {
            var button1 = "88", // initialise to CHECK button
                button2 = null;
            if (inputRow.DELETE === true) {
                button1 = "28";
                button2 = "28";
            }
            if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                var reqObj = _.buildAppstackJSON({
                    form: "W41024B",
                    returnControlIDs: true
                },"1." + rowToSelect, button1, button2);
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W41024B",
                    turbo: true
                },"1." + rowToSelect, button1, button2);
            }
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41024_W41024A")) {
                    var errObj = data.fs_P41024_W41024A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (inputRow.DELETE === true) {
                            _.postSuccess("Deleting Item Location");
                            _.returnFromSuccess();
                        } else {
                            _.postSuccess("Entering the Revisions form");
                            if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                                globals.htmlInputs = data.fs_P41024_W41024A.data;
                            }
                            self.updateForm(inputRow);
                        }
                    }
                } else if (data.hasOwnProperty("fs_P41024_W41024B") && inputRow.DELETE === true) {
                    var errObj = data.fs_P41024_W41024B.errors;
                    if (errObj.length > 0) {
                        var falseError = errObj.filter(function(item){
                            return item.ERRORCONTROL === "0";
                        });
                        if (falseError.length === 1) { // false error, so success
                            _.postSuccess("Location Item successfully deleted");
                            _.returnFromSuccess();
                        } else {
                            _.getErrorMsgs(errObj);
                            _.returnFromError();
                        }
                    } else {
                        _.postSuccess("Delete successful");
                        _.returnFromSuccess();
                    }
                } else {
                    _.postError("An unknown error occurred while entering the Revisions form");
                    _.returnFromError();
                }
            });
        };
        self.updateForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W41024A",
                type: "close",
                dynamic: true
            },"3","3");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{
                    successMsg: "Item Branch record updated",
                    successCb:self.findBeforeMakePrimary
                },inputRow);
            });
        };
        self.getAddForm = function(inputRow) {
            if (globals.htmlInputs.length === 0) { // only an empty array when first declared. When populated with data, it is an object.
                var reqObj = _.buildAppstackJSON({
                    form: "W41024B",
                    returnControlIDs: true
                },"21");
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W41024B",
                    turbo: true
                },"21");
            }
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41024_W41024A")) {
                    var errObj = data.fs_P41024_W41024A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                            globals.htmlInputs = data.fs_P41024_W41024A.data;
                        }
                        self.addForm(inputRow);
                        _.postSuccess("Entering new Item Location data");
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
                    form: "W41024A",
                    type: "close",
                    dynamic: true,
                    returnControlIDs: true
                };
            } else {
                optionsObj = {
                    form: "W41024A",
                    dynamic: true,
                    turbo: true
                };
            }
            var reqObj = _.buildAppstackJSON(optionsObj,["6",inputRow.MCU],["22",inputRow.LITM],["29",inputRow.LOCNE1],"3");
            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{
                    successMsg: "Item Location record added",
                    successCb:self.findBeforeMakePrimary
                },inputRow);
            });
        };
        self.findBeforeMakePrimary = function(inputRow) {
            if (inputRow.hasOwnProperty("MAKE_PRIMARY")) {
                if (inputRow.MAKE_PRIMARY.toLowerCase() === "yes" || 
                inputRow.MAKE_PRIMARY.toLowerCase() === "true" ||
                inputRow.MAKE_PRIMARY.toLowerCase() === "y" ||
                inputRow.MAKE_PRIMARY.toLowerCase() === "1") {
                    
                    var reqObj = _.buildAppstackJSON({
                        form: "P41024_W41024B",
                        type: "open"
                    },["20",inputRow.MCU],["18",_.filterBlank(inputRow.LITM)],"6");

                    _.getForm("appstack",reqObj).then(function(data){
                        if (data.hasOwnProperty("fs_P41024_W41024B")) {
                            var errObj = data.fs_P41024_W41024B.errors;
                            if (errObj.length > 0) {
                                _.getErrorMsgs(errObj);
                                _.returnFromError();
                            } else {
                                var rowArr = data.fs_P41024_W41024B.data.gridData.rowset;
                                var rowToSelect = self.findRowExit(inputRow,rowArr);
                                self.makePrimary(inputRow,rowToSelect);
                            }
                        } else {
                            _.postError("An unknown error occurred while updating the Primary Location");
                            _.returnFromError();
                        }
                    });
                } else {
                    _.postSuccess("Closing session");
                    _.returnFromSuccess();
                }
            } else {
                _.postSuccess("Closing session");
                _.returnFromSuccess();
            }
        };
        self.makePrimary = function(inputRow,rowToSelect) {      

            if (rowToSelect !== "add") {
                var reqObj = _.buildAppstackJSON({
                    form: "W41024B",
                    type: "close"
                },["input","20",inputRow.MCU],["input","18",inputRow.LITM],"1." + rowToSelect,"29");

                _.getForm("appstack",reqObj).then(function(data){
                    _.successOrFail(data,{
                        successMsg:'Primary Location amended, closing sesion'
                        //successCb: closeSession
                    });
                });
            } else {
                _.postError("The upload is complete, but an unknown error occurred while attempting to change the Primary Location");
                _.returnFromError();
            }
        };
        self.closeSession = function() {
            var reqObj = _.buildAppstackJSON({
                form: "W41024B",
                type: "close"
            },"5");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{
                    successMsg:'Session closed'
                });
            });
        }
    };
    return new Process();
});