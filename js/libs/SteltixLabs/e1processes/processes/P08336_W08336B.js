define(['aisclient'], function(_){    
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "ENDYOW"
            }, {
                "name" : "PLAN"
            },
            {
                "name" : "PAN8"
            },
            {
                "name": "RELA"
            }
        ],
            isCustomTemplate: false
        },
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            if (inputRow.hasOwnProperty("ENDYOW") && 
                inputRow.hasOwnProperty("PLAN") &&
                inputRow.hasOwnProperty("PAN8") &&
                inputRow.hasOwnProperty("PAN8")) {
                _.postSuccess("Processing row " + inputRow.ROW);

                var reqObj = _.buildAppstackJSON({
                    form: "P08336_W08336A",
                    type: "open",
                }, ["22", inputRow["ENDYOW"], "24", inputRow["PLAN"]], "15");

                _.getForm("appstack", reqObj).then((data) => {
                    if (data.hasOwnProperty("fs_P08336_W08336A")) {
                        var fieldObj = data["fs_P08336_W08336A"].data;
                        var errObj = data["fs_P08336_W08336A"].errors;
                        var warnObj = data["fs_P08336_W08336A"].warnings;


                        if (fieldObj.gridData.rowset.length === 1) {
                            if (errObj.length > 0) {
                                _.getErrorMsgs(errObj);
                                _.returnFromError();
                            } else if (warnObj.length > 0) {
                                _.getErrorMsgs(warnObj);
                                _.returnFromError();  
                            } else {
                                self.selectRow(inputRow);
                            } 
                        } else {
                            _.postError("Could not find matching row");
                            _.returnFromError();
                        }
                    }
                });
            }
            else {
                 _.postError("Missing a required field");
                globals.processQ = [];
                _.returnFromError();
            }
            
        },
        
        self.selectRow = function(inputRow) {
            
            var reqObj = _.buildAppstackJSON({
                    form: "W08336A",
            }, "14");
            
            _.getForm("appstack", reqObj).then((data) => {
                if (data.hasOwnProperty("fs_P08336_W08336B")) {
                    var fieldObj = data["fs_P08336_W08336B"].data;
                    var warnObj = data["fs_P08336_W08336B"].warnings;
                    var errObj = data["fs_P08336_W08336B"].errors;
                    
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (warnObj.length > 0) {
                        _.getErrorMsgs(warnObj);
                        _.returnFromError();  
                    } else {
                        var rows = fieldObj.gridData.rowset;
                        
                        var foundMatch = false;
                        for (var i in rows) {
                            if (rows[i]["mnDepBenAddress_25"].value.toLowerCase().trim() == inputRow["PAN8"].toLowerCase().trim()
                                && rows[i]["sPlanID_24"].value.toLowerCase().trim() == inputRow.PLAN.toLowerCase().trim()) {
                                _.postSuccess("Match found, updating effective date");
                                self.updateRow(inputRow, i);
                                foundMatch = true;
                                break;
                            }
                        }
                        
                        if (!foundMatch) {
                            _.postSuccess("No match found, adding new row");
                            self.addRow(inputRow, rows.length);
                        }
                    }
                }
            });
        };
        
        self.updateRow = function(inputRow, indexToUpdate) {
            if (inputRow.hasOwnProperty("txt__Effective Date__EFT__69")) {
                reqObj = _.buildAppstackJSON({
                    form: "W08336B",
                    type: "execute",
                    gridUpdate: true,
                    customGrid: true,
                    rowToSelect: indexToUpdate,
                },["grid","18", inputRow["txt__Effective Date__EFT__69"]],"12");
                
                _.getForm("appstack", reqObj).then((data) => {
                    var errObj = data["fs_P08336_W08336B"].errors;
                    var warnObj = data["fs_P08336_W08336B"].warnings;


                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (warnObj.length > 0) {
                        _.getErrorMsgs(warnObj);
                        _.returnFromError();  
                    } else {
                        _.postSuccess("Effective date updated successfully");          
                        _.returnFromSuccess();
                    }
                });
            } else {
                _.postError("Effective date needs to be specified when updating a row")
                _.returnFromError();
            }
        }
        
        self.addRow = function(inputRow, ind) {
            reqObj = _.buildAppstackJSON({
                form: "W08336B",
                type: "execute",
                gridUpdate: true,
                customGrid: true,
                rowToSelect: ind,
            },["grid","25", inputRow["PAN8"]], ["grid", "24", inputRow["PLAN"]], ["grid", "27", inputRow["dbname"]], ["grid", "57", inputRow["taxnum"]], ["grid", "21", inputRow["RELA"]], ["grid", "26", inputRow["desc"]], ["grid", "23", inputRow["grid__Add Opt__AOPT__23"]], ["grid", "22", inputRow["grid__D B__DBEN__22"]], ["grid", "38", inputRow["dob"]], ["grid", "20", inputRow["grid__DB Ty__DBTY__20"]], ["grid", "19", inputRow["grid__Ben %__PERC__19"]], ["grid", "18", inputRow["txt__Effective Date__EFT__69"]], "12");
                
                /* The following fields are filled in automatically and are not editable by the user:
                *   -Dependent/Beneficiary name
                *   -Tax ID number
                *   -Description
                *   -Birth date
                */
            
            _.getForm("appstack", reqObj).then((data) => {
                var errObj = data["fs_P08336_W08336B"].errors;
                var warnObj = data["fs_P08336_W08336B"].warnings;
                
                if (errObj.length > 0) {
                    _.getErrorMsgs(errObj);
                    _.returnFromError();
                } else if (warnObj.length > 0) {
                    _.getErrorMsgs(warnObj);
                    _.returnFromError();  
                } else {
                    _.postSuccess("Added successfully");
                    _.returnFromSuccess();
                }
            });
        }
        
    };
    return new Process();
});
