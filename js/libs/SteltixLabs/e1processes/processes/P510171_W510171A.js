define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "MCU",
                id: "40"
            }],
            isCustomTemplate: true
        };
        self.closeObj = {
            subForm: "W51006S",
            closeID: "4"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            var theCO = "";
            if (inputRow.hasOwnProperty("CO") && inputRow["CO"].substr(0, 1) == "'") {
                theCO = inputRow["CO"].substr(1);
            } 

            reqObj = _.buildAppstackJSON({
                form: "P51006_W51006R",
                type: "open"
            },["1[13]",inputRow.MCU],["1[15]", theCO], "6");

            _.getForm("appstack",reqObj).then(function(data){
                var rowArr = data.fs_P51006_W51006R.data.gridData.rowset;
                var errObj = data.fs_P51006_W51006R.errors;
                if (rowArr.length === 0) {
                    _.postError("There was a problem finding the requested record, or there are duplicates");
                    _.returnFromError();
                } else if (errObj.length > 0) {
                    _.getErrorMsgs(errObj);
                    _.returnFromError();
                } else if (rowArr.length === 1) {
                    _.postSuccess("Selecting Job Master record");
                    self.selectRow(inputRow);
                } else {
                    _.postError("There was a problem finding the requested record, or there are duplicates");
                    _.returnFromError();
                }
            });
        };

        self.selectRow = function(inputRow) {
            var optionsObj = {
                form: "W51006R"
            };

            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }
            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","53");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P510171_W510171A")) {
                    var errObj = data.fs_P510171_W510171A.errors;
                    var fieldData = data.fs_P510171_W510171A.data;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT) {
                        _.postSuccess("Extracting data");
                        
                        if (!inputRow.hasOwnProperty("CO")) {
                            inputRow["CO"] = '';
                        } else {
                            if (inputRow["CO"].substr(0, 1) == "0") {
                                inputRow["CO"] = "'"+inputRow["CO"];
                            }
                        }

                        fieldData.z_CO_9999 = {
                            id: 9999,
                            longName: 'Company',
                            internalValue: inputRow.CO,
                            title: 'CO',
                            value: inputRow.CO
                        };

                        console.log(fieldData.gridData);

                        var blankOutFields = ['z_INCUNIT_51', 'z_BUDINC_48', 'z_CUMUNIT_50', 'z_BUDCUM_47'];
                        
                        $.each(fieldData.gridData.rowset,function(key,object) {
                                if (fieldData.gridData.rowset[key].hasOwnProperty("MOExist")) 
                                    delete fieldData.gridData.rowset[key].MOExist;
                                if (fieldData.gridData.rowset[key].hasOwnProperty("rowIndex")) 
                                    delete fieldData.gridData.rowset[key].rowIndex;
                                
                                // loop through the object to extrac aliases
                                for (var aliasKey in object) { 
                                    if (!object[aliasKey].hasOwnProperty("alias")) {
                                        var colArr = aliasKey.split("_");
                                        if (colArr.length === 3) // means all should be ok and index 1 is alias
                                        fieldData.gridData.rowset[key][aliasKey].alias = colArr[1];
                                    }
                                }

                                for (var i=0;i<blankOutFields.length;i++) {
                                    if (fieldData.gridData.rowset[key].hasOwnProperty(blankOutFields[i])) 
                                    fieldData.gridData.rowset[key][blankOutFields[i]].value = '';
                                }
 
                            });

                        _.appendTable(fieldData, 0, true);
                    } else {
                        globals.htmlInputs = fieldData;
                        var rowArr = fieldData.gridData.rowset;
                        var rowToSelect = "-1";

                        console.log(rowArr);

                        if (!inputRow.hasOwnProperty("grid__Cost Type__OBJ__42")) {
                            inputRow["grid__Cost Type__OBJ__42"] = "";
                        }
                        
                        if (!inputRow.hasOwnProperty("grid__Cost Code__SUB__41")) {
                            inputRow["grid__Cost Code__SUB__41"] = "";
                        }

                        for (var i = 0; i < rowArr.length; i++) {
                            
                            if (inputRow["grid__Cost Code__SUB__41"].toLowerCase() === rowArr[i]["sCostCode_41"].value.toLowerCase() && 
                                inputRow["grid__Cost Type__OBJ__42"].toLowerCase() === rowArr[i]["sCostType_42"].value.toLowerCase()) {
                                rowToSelect = i;
                                break;
                            } 
                        }
                        if (rowToSelect !== "-1") {
                            self.updateForm(inputRow, rowToSelect);
                        } else {
                            _.postError("Job Budget Revision could not be found.");
                            _.returnFromError();
                        }
                    }
                } else {
                    _.postError("An unknown error occurred while entering the UPDATE form");
                    _.returnFromError();
                }
            });
        };

        self.updateForm = function(inputRow, rowToSelect) {

            var reqObj = _.buildAppstackJSON({
                form: "W510171A"               
            }, "39");

            _.getForm("appstack",reqObj).then(function(data){

                var reqObj = _.buildAppstackJSON({
                    form: "W510171A",
                    dynamic: true,
                    rowToSelect: rowToSelect,
                    type: "close",
                    gridUpdate: true,
                }, "4");

                _.getForm("appstack",reqObj).then(function(data){                    
                    if (data.hasOwnProperty("fs_P510171_W510171G")) {
                        _.postSuccess("Job Revision Updated.");
                        _.returnFromSuccess();
                    } else {
                        _.successOrFail(data,{successMsg: "Job Budget Revision Record updated."});
                    }
                });
            });
        };
    };
    return new Process();
});