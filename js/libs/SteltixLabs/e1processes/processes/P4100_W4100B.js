// Location Information
// A: revision
// C: find-browse
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "MCU"
            }, {
                "name": "LOCNE1"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W4100C",
            closeID: "5"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            var reqObj = _.buildAppstackJSON({
                form: "P4100_W4100C",
                type: "open"
            },["12",inputRow.MCU],"8");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4100_W4100C")) {
                    var rowArr = data.fs_P4100_W4100C.data.gridData.rowset;
                    var errObj = data.fs_P4100_W4100C.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (rowArr.length === 0) {
                            _.postSuccess("No locations for this Branch/Plant. Adding new location");
                            self.getAddForm(inputRow);
                        } else {
                            var isAdd = true;
                            var locArr = inputRow.LOCNE1.replace(/ /g,'').split(".");
                            // loop through results
                            for (var i = 0; i < rowArr.length; i++) {
                                var aisle = locArr[0] || "";
                                var bin = locArr[1] || "";
                                var loc3 = locArr[2] || "";
                                if (
                                    rowArr[i].sAisle_37.value.replace(/ /g,'').toLowerCase() === aisle.toLowerCase() &&
                                    rowArr[i].sBin_38.value.replace(/ /g,'').toLowerCase() === bin.toLowerCase() &&
                                    rowArr[i].sLoc03_29.value.replace(/ /g,'').toLowerCase() === loc3.toLowerCase() ) {
                                    isAdd = false;
                                }
                            }
                            if (isAdd) {
                                _.postSuccess("This locations doesn't exist for this Branch/Plant. Beginning ADD process");
                                self.getAddForm(inputRow);
                            } else {
                                _.postSuccess("Locations found");
                                self.selectRow(inputRow);
                            }
                        }
                    }
                } else {
                    _.postError("An unknown error occurred in the find/browse form");
                    _.returnFromError();
                }
            });
        };
        self.selectRow = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W4100C"
            },"1.0","4");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4100_W4100B")) {
                    var errObj = data.fs_P4100_W4100B.errors;
                    var rowArr = data.fs_P4100_W4100B.data.gridData.rowset;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Opening \"Enter Location Information\" form");
                        if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                            globals.htmlInputs = data.fs_P4100_W4100B.data;
                        }
                        // loop through grid to find matching Location
                        var rowToSelect = "add";
                        var locArr = inputRow.LOCNE1.replace(/ /g,'').split("."); // remove spaces and split location into its parts

                        for (var i = 0; i < rowArr.length; i++) {
                            var aisle = locArr[0] || "";
                            var bin = locArr[1] || "";
                            var loc3 = locArr[2] || "";
                            if (rowArr[i].sAisle_10.value.replace(/ /g,'').toLowerCase() === aisle.toLowerCase() &&
                                rowArr[i].sBin_11.value.replace(/ /g,'').toLowerCase() === bin.toLowerCase() &&
                                rowArr[i].sLoc03_12.value.replace(/ /g,'').toLowerCase() === loc3.toLowerCase()
                            ) { // if Item Number AND Cross Reference Item Number are equal
                                rowToSelect = rowArr[i].rowIndex;
                            }
                        }
                        if (rowToSelect === "add") {
                            self.addForm(inputRow);
                        } else {
                            self.updateForm(inputRow, rowToSelect);
                        }                        
                    }
                } else {
                    _.postError("An unknown error occurred while entering the \"Enter Location Information\" form");
                    _.returnFromError();
                }
            });
        };
        self.updateForm = function(inputRow, rowToSelect) {
            var reqObj = _.buildAppstackJSON({
                form: "W4100B",
                type: "close",
                gridUpdate: true,
                rowToSelect: rowToSelect
            },"4","4");
            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{
                    successMsg: "Location Information record updated"
                });
            });
        };
        self.getAddForm = function(inputRow) {
            if (globals.htmlInputs.length === 0) { // only an empty array when first declared. When populated with data, it is an object.
                var reqObj = _.buildAppstackJSON({
                    form: "W4100C",
                    returnControlIDs: true
                },"42");
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W4100C",
                    turbo: true
                },"42");
            }
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4100_W4100B")) {
                    var errObj = data.fs_P4100_W4100B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                            globals.htmlInputs = data.fs_P4100_W4100B.data;
                        }
                        self.addForm(inputRow);
                        _.postSuccess("Entering new Location Information data");
                    }
                } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }
            });
        };
        self.addForm = function(inputRow) {
            var reqObj = {};
            if (globals.htmlInputs.length === 0) { // should only be true for first Excel row
                reqObj = {
                    form: "W4100B",
                    type: "close",
                    gridAdd: true,
                    dynamic: true,
                    customGrid: true,
                    returnControlIDs: true,
                };
            } else {
                reqObj = {
                    form: "W4100B",
                    type: "close",
                    gridAdd: true,
                    dynamic: true,
                    customGrid: true,
                    turbo: true,
                };
            }
            var reqObj = _.buildAppstackJSON(reqObj,["24",inputRow.MCU],["grid","41",inputRow.LOCNE1],"4","4");
            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{
                    successMsg: "Item Location record added"
                },inputRow);
            });
        }
    };
    return new Process();
});