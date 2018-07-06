define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [],
            isCustomTemplate: false
        };

        // CARS : 193 (Carrier Number) - DETAIL SCREEN and 141 SEARCH SCREEN
        // GRID SEARCH BOX: FRSC (Freight Rate Schedule) 1.152 (SEARCH SCREEN) or 1.81 (DETAIL SCREEN)
        // TICK / UPDATE BUTTON: 14
        // ADD BUTTON: 207
        // SEARCH BUTTON: 15

        self.closeObj = {
            subForm: "W4950A",
            closeID: "16"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            // setup json for http request
            if (inputRow.EXTRACT) {
                var reqObj = _.buildAppstackJSON({
                    form: "P4950_W4950A",
                    type: "open",
                    aliasNaming: true
                },["1[129]",inputRow.RTN],"15");
            }
            else {
                var reqObj = _.buildAppstackJSON({
                    form: "P4950_W4950A",
                    type: "open"
                },["1[129]",inputRow.RTN],"15");
            }

            _.getForm("appstack",reqObj).then(function(data) {
                reqObj = {};
                var errObj = data.fs_P4950_W4950A.errors;
                if (errObj.length > 0) { // errors
                    _.getErrorMsgs(errObj);
                    _.returnFromError(inputRow);
                } else { // no errors
                        // must check if we're ADDING or UPDATING
                        globals.htmlInputs = data.fs_P4950_W4950A.data;
                        var gridRows = data.fs_P4950_W4950A.data.gridData.rowset;
                        var rowObj = data.fs_P4950_W4950A.data;
                        globals.titleList = data.fs_P4950_W4950A.data.gridData.titles;
                        _.rowToUpdate = '';

                        if (inputRow.EXTRACT) {
                            if (gridRows.length > 0) {
                                var fieldObj = data.fs_P4950_W4950A.data;
                                $.each(fieldObj.gridData.rowset,function(key,object) {
                                        if (fieldObj.gridData.rowset[key].hasOwnProperty("MOExist")) 
                                            delete fieldObj.gridData.rowset[key].MOExist;
                                        if (fieldObj.gridData.rowset[key].hasOwnProperty("rowIndex")) 
                                            delete fieldObj.gridData.rowset[key].rowIndex;
                                        
                                        // loop through the object to extrac aliases
                                        for (var aliasKey in object) { 
                                            if (!object[aliasKey].hasOwnProperty("alias")) {
                                                var colArr = aliasKey.split("_");
                                                if (colArr.length === 3) // means all should be ok and index 1 is alias
                                                    fieldObj.gridData.rowset[key][aliasKey].alias = colArr[1];
                                            }
                                        }
        
                                    });
        
                                _.appendTable(fieldObj, 0, true);
                                _.postSuccess("Extracting data");
                            }
                            else {
                                _.postError("No records found. Please add the item before attempting to extract the data.");
                                _.returnFromError();
                            }
                        }
                        else {
                            if (gridRows.length > 0) {
                                $.each(gridRows,function(i,o) {
                                    console.log(o);
                                    if (o.mnRouteNumber_129.value == inputRow.RTN) {
                                        _.rowToUpdate = i;
                                        return;
                                    }
                                });
                                if (_.rowToUpdate === '') {
                                    _.postSuccess("Adding record");
                                    self.getAddForm(inputRow);
                                } else {
                                    _.postSuccess("Record Found in Grid");
                                    self.selectRow(inputRow)
                                }
                            } else {
                                _.postSuccess("Adding record");
                                self.getAddForm(inputRow);
                            }
                        }
                }
            });
        };
        self.addRow = function(inputRow) {

            reqObj = _.buildAppstackJSON({
                form: "W4950B",
                type: "execute",
                gridAdd: true,
                dynamic: true
            }, "12");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty('fs_P4950_W4950A')) {
                    _.postSuccess("Record added successfully");
                    _.returnFromSuccess();
                } else {
                    if (data && data.hasOwnProperty("fs_P4950_W4950B")) {
                        var errObj = data.fs_P4950_W4950B.errors;
                        var warnObj = data.fs_P4950_W4950B.warnings;
                        if (errObj.length > 0) {
                            _.getErrorMsgs(errObj,"Error",true);
                            _.returnFromError();
                        } else if (warnObj.length > 0) {
                            _.getErrorMsgs(warnObj);
                            _.returnFromError();  
                        } else {
                            console.log(data);
                            _.postError("Unknown Error found.");
                            _.returnFromError();
                        }
                    }
                }
            });
        };

        self.getAddForm = function (inputRow) {
            var reqObj = _.buildAppstackJSON({form:"W4950A"},"207");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4950_W4950B")) {
                    _.postSuccess("Updating Routing Entry Revision");
                    self.addRow(data, inputRow);
                } else {
                    _.postError("Error adding row.");
                    _.returnFromError();
                }
            });
        };

        self.selectRow = function (inputRow) {
            var reqObj = _.buildAppstackJSON({form:"W4950A"},"1.0","14");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4950_W4950B")) {
                    _.postSuccess("Updating Routing Entry Revision");
                    self.updateRow(data, inputRow);
                } else {
                    _.postError("Error selecting the row");
                    _.returnFromError();
                }
            });
        };

        self.updateRow = function(data, inputRow) {

            var gridRows = data.fs_P4950_W4950B.data.gridData.rowset;
            $.each(gridRows,function(i,o) {
                if (o.mnRouteNumber_68.value == inputRow.RTN) {
                    _.rowToUpdate = i;
                    return;
                }
            });

            if (!(_.rowToUpdate === '')) {
                reqObj = _.buildAppstackJSON({
                    form: "W4950B",
                    type: "execute",
                    gridUpdate: true,
                    rowToSelect: _.rowToUpdate,
                }, "12");

                _.getForm("appstack",reqObj).then(function(data){
                    if (data.hasOwnProperty('fs_P4950_W4950A')) {
                        _.postSuccess("Record updated successfully");
                        _.returnFromSuccess();
                    } else {
                        console.log(data);
                    }
                });
            }
        }
    };
    return new Process();
});