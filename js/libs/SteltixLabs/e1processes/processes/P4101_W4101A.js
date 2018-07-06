define(['aisclient'], function (_) {
    var Process = function () {
        var self = this;
        self.reqFields = {
            titles: [{
                name: "LITM",
                id: 13,
            }, {
                name: "ITM",
                id: 17,
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W4101E",
            closeID: "5"
        };
        self.isExtract = false;
        self.sysGenItemNum = "";
        self.noItemNum = false;
        self.init = function () {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            if (inputRow.hasOwnProperty("LITM")) {
                inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);
                var reqObj = _.buildAppstackJSON({
                    form: "P4101_W4101E",
                    type: "open",
                    returnControlIDs: "1[123]"
                }, ["1[123]", inputRow.LITM], "22");

                _.getForm("appstack", reqObj).then(function (data) {
                    if (data.hasOwnProperty("fs_P4101_W4101E")) {
                        var rowArr = data.fs_P4101_W4101E.data.gridData.rowset;
                        var errObj = data.fs_P4101_W4101E.errors;
                        var noItem = rowArr.length === 0 || rowArr[0].sItemNumber_123.value.toLowerCase() !== inputRow.LITM.toLowerCase();
                        if (errObj.length > 0) {
                            _.getErrorMsgs(errObj);
                            _.returnFromError();
                        } else if (noItem && inputRow.EXTRACT) {
                            _.postError("No item found. Please add the item before attempting to extract the data.");
                            _.returnFromError();
                        } else if (noItem) {
                            _.postSuccess("Adding Item");
                            self.getAddForm(inputRow);
                        } else if (rowArr.length === 1) {
                            _.postSuccess("Item found");
                            self.selectRow(inputRow);
                        } else {
                            _.postError("There was a problem finding the requested record, or there are duplicates");
                            _.returnFromError();
                        }
                    } else {
                        _.postError("An unknown error occurred in the find/browse form");
                        _.returnFromError();
                    }
                });
            } else if (inputRow.hasOwnProperty("ITM")) {
                inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);
                var reqObj = _.buildAppstackJSON({
                    form: "P4101_W4101E",
                    type: "open",
                    returnControlIDs: "1[123]"
                }, ["1[6]", inputRow.ITM], "22");

                _.getForm("appstack", reqObj).then(function (data) {
                    if (data.hasOwnProperty("fs_P4101_W4101E")) {
                        var rowArr = data.fs_P4101_W4101E.data.gridData.rowset;
                        var errObj = data.fs_P4101_W4101E.errors;
                        var noItem = rowArr.length === 0;
                        if (errObj.length > 0) {
                            _.getErrorMsgs(errObj);
                            _.returnFromError();
                        } else if (noItem && inputRow.EXTRACT) {
                            _.postError("No item found. Please add the item before attempting to extract the data.");
                            _.returnFromError();
                        } else if (noItem) {
                            _.postSuccess("Adding Item");
                            self.getAddForm(inputRow);
                        } else if (rowArr.length === 1) {
                            _.postSuccess("Item found");
                            self.selectRow(inputRow);
                        } else {
                            _.postError("There was a problem finding the requested record, or there are duplicates");
                            _.returnFromError();
                        }
                    } else {
                        _.postError("An unknown error occurred in the find/browse form");
                        _.returnFromError();
                    }
                });
            } else {
                self.noItemNum = true;
                _.postSuccess("Adding Item");
                self.getAddForm(inputRow);
            }
        };
        self.selectRow = function (inputRow) {
            var optionsObj = {
                form: "W4101E"
            };
            if (globals.htmlInputs.length === 0) { // first row processed
                optionsObj.returnControlIDs = true;
            } else {
                optionsObj.turbo = true;
            }
            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.returnControlIDs = undefined;
                optionsObj.type = "close";
                console.log(optionsObj);
            }

            var reqObj = _.buildAppstackJSON(optionsObj, "1.0", "132");
            _.getForm("appstack", reqObj).then(function (data) {
                if (data.hasOwnProperty("fs_P4101_W4101A")) {
                    var errObj = data.fs_P4101_W4101A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT) {
                        _.postSuccess("Extracting data");
                        _.appendTable(data.fs_P4101_W4101A.data);
                    } else {
                        if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                            globals.htmlInputs = data.fs_P4101_W4101A.data;
                        }
                        _.postSuccess("Entering the Revisions form");
                        self.updateForm(inputRow);
                    }
                } else if (data.hasOwnProperty("fs_P4101_W4101E")) {
                    var errObj = data.fs_P4101_W4101E.errors;
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
        self.updateForm = function (inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W4101A",
                type: "close",
                dynamic: true,
                turbo: true
            }, ["26", inputRow.STKT], ["23", inputRow.DSC1], "11", "11");

            _.getForm("appstack", reqObj).then(function (data) {
                _.successOrFail(data, {
                    successMsg: "Item updated"
                });
            });
        };
        self.getAddForm = function (inputRow) {
            var form, type;
            if (self.noItemNum) {
                form = "P4101_W4101E";
                type = "open";
            } else {
                form = "W4101E";
                type = "execute";
            }
            if (globals.htmlInputs.length === 0) { // only an empty array when first declared. When populated with data, it is an object.
                var reqObj = _.buildAppstackJSON({
                    form: form,
                    type: type,
                    returnControlIDs: true
                }, "17");
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: form,
                    type: type,
                    turbo: true
                }, "17");
            }
            _.getForm("appstack", reqObj).then(function (data) {
                if (data.hasOwnProperty("fs_P4101_W4101A")) {
                    var errObj = data.fs_P4101_W4101A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                            globals.htmlInputs = data.fs_P4101_W4101A.data;
                        }
                        self.addForm(inputRow);
                        _.postSuccess("Entering new Item data");
                    }
                } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }
            });
        };
        self.addForm = function (inputRow) {
            var optionsObj = {};
            if (globals.htmlInputs.length === 0) { // should only be true for first Excel row
                optionsObj = {
                    form: "W4101A",
                    type: "close",
                    dynamic: true,
                    returnControlIDs: true
                };
            } else {
                optionsObj = {
                    form: "W4101A",
                    type: "close",
                    dynamic: true,
                    turbo: true
                };
            }
            var reqObj = _.buildAppstackJSON(optionsObj, ["13", inputRow.LITM], ["26", inputRow.STKT], ["23", inputRow.DSC1], "11");
            _.getForm("appstack", reqObj).then(function (data) {
                _.successOrFail(data, {
                    successMsg: "Item added"
                });
            });
        };
    };
    return new Process();
});