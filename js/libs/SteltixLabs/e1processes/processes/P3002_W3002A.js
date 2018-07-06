define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "LITM"
            }, {
                "name": "MMCU"
            }, {
                "name": "TBM"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W3002A",
            closeID: "16"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            // setup json for http request
            if (inputRow.EXTRACT) {
                var reqObj = _.buildAppstackJSON({
                    form: "P3002_W3002A",
                    type: "open",
                    aliasNaming: true
                },["21",inputRow.LITM],["7",inputRow.MMCU],["11",inputRow.TBM],"327");
            }
            else {
                var reqObj = _.buildAppstackJSON({
                    form: "P3002_W3002A",
                    type: "open" /*,
                    returnControlIDs: "1[55,32,88],7,32,61" */
                },["21",inputRow.LITM],["7",inputRow.MMCU],["11",inputRow.TBM],"327");
            }

            _.getForm("appstack",reqObj).then(function(data) {
                reqObj = {};
                var errObj = data.fs_P3002_W3002A.errors;
                if (errObj.length > 0) { // errors
                    _.getErrorMsgs(errObj);
                    _.returnFromError(inputRow);
                } else { // no errors
                        // must check if we're ADDING or UPDATING
                        globals.htmlInputs = data.fs_P3002_W3002A.data;
                        var gridRows = data.fs_P3002_W3002A.data.gridData.rowset;
                        var rowObj = data.fs_P3002_W3002A.data;
                        globals.titleList = data.fs_P3002_W3002A.data.gridData.titles;
                        _.rowToUpdate = '';

                        if (inputRow.EXTRACT) {
                            if (gridRows.length > 0) {
                                var fieldObj = data.fs_P3002_W3002A.data;
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
                                    if (inputRow["grid__Item Number__UITM__55"].toLowerCase() === o.sItemNumber_55.value.toLowerCase() && 
                                        inputRow["grid__Effective Thru__EFFT__88"] === o.dtEffectiveThru_88.value && 
                                        inputRow["grid__Effective From__EFFF__32"] === o.dtEffectiveFrom_32.value &&
                                        inputRow["TBM"] === rowObj.txtTypeBillofMaterial_11.value &&
                                        inputRow["MMCU"] === rowObj.txtBranch_7.value &&
                                        parseFloat(inputRow["txt__Batch Quantity__#BQT__61"]) === parseFloat(rowObj.txtBatchQuantity_61.value)) {
                                        _.rowToUpdate = i;
                                        return;
                                    }
                                });
                                if (_.rowToUpdate === '') {
                                    _.postSuccess("Adding record");
                                    self.add(inputRow);
                                } else {
                                    _.postSuccess("Record Found in Grid");
                                    self.update(inputRow);
                                }
                            } else {
                                _.postSuccess("Adding record");
                                self.add(inputRow);
                            }
                        }
                }
            });
        };
        self.add = function(inputRow) {
            delete globals.inputRow['LITM'];
            delete globals.inputRow['MMCU'];
            delete globals.inputRow['TBM'];

            delete globals.inputRow['txt__Batch Quantity__#BQT__61'];
            delete globals.inputRow['txt__Oper Seq#__OPSQ__280'];
            delete globals.inputRow['txt__Skip To Line No.__CPNB__184'];
            delete globals.inputRow['txt__UOM - Batch Qty UOM__UOM__17'];

            var reqObj = _.buildAppstackJSON({
                form: "W3002A",
                type: "execute",
                dynamic: true,
                gridAdd: true /*,
                turbo: true */
            },"4");

            _.getForm("appstack",reqObj).then(function(data) {
                if (data && data.hasOwnProperty("fs_P3002_W3002A")) {
                    var errObj = data.fs_P3002_W3002A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj,"Error",true);
                        _.returnFromError();
                    } else {
                        _.postError("Unkown error");
                        _.returnFromError();
                    }
                } else {
                    _.postSuccess("Record added successfully");
                    _.returnFromSuccess();
                }
            });
        };

        self.processSave = function (data) {
            // clear json obj
            if (data.hasOwnProperty("fs_P3002_W3002A")) { // if UPDATE and ERRORS
                var errObj = data.fs_P3002_W3002A.errors;
                _.getErrorMsgs(errObj,"Error",true);
                _.returnFromError();
            } else if (data === "no_response") { // if UPDATE successful
                _.postSuccess("BoM successfully updated");
                _.returnFromSuccess();
            }
        }
        self.update = function(inputRow) {

            delete globals.inputRow['LITM'];
            delete globals.inputRow['MMCU'];
            delete globals.inputRow['TBM'];

            delete globals.inputRow['txt__Batch Quantity__#BQT__61'];
            delete globals.inputRow['txt__Oper Seq#__OPSQ__280'];
            delete globals.inputRow['txt__Skip To Line No.__CPNB__184'];
            delete globals.inputRow['txt__UOM - Batch Qty UOM__UOM__17'];

            if (inputRow['NEWEFFDATE'] != undefined && $.trim(inputRow['NEWEFFDATE']) != '') {
                var reqObj = _.buildAppstackJSON({
                    form: "W3002A",
                    type: "execute",
                    dynamic: true,
                    gridUpdate: true,
                    rowToSelect: _.rowToUpdate
                });
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W3002A",
                    type: "execute",
                    dynamic: true,
                    gridUpdate: true,
                    rowToSelect: _.rowToUpdate
                }/*,["21",inputRow.LITM],["7",inputRow.MMCU],["11",inputRow.TBM]*/,"4");
            }
            
            _.getForm("appstack",reqObj).then(function(data) {
                if (inputRow['NEWEFFDATE'] != undefined && $.trim(inputRow['NEWEFFDATE']) != '') {
                    var reqObj = _.buildAppstackJSON({
                        form: "W3002A",
                        type: "execute", 
                        gridUpdate: true, 
                        rowToSelect: _.rowToUpdate, 
                        customGrid: true, 
                        suppressDynamicGrid: true
                    },["grid","88",inputRow.NEWEFFDATE],"4");

                    _.getForm("appstack",reqObj).then(function(data) {
                        self.processSave(data);
                    });
                }
                else 
                    self.processSave(data);

                
            });
        }
    };
    return new Process();
});