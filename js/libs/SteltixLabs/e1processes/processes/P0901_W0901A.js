// Enter form: P0901_W0901H
// Add/Edit form: P0901_W0901A
define(['aisclient'],function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "MCU",
                id: 53,
            },{
                name: "OBJ",
                id: 55,
            },{
                name: "SUBS",
                id: 57,
            },{
                name: "DL01",
                id: 12,
            }],
            isCustomTemplate: false
        };
    	self.closeObj = {
    		subForm: "W0901H",
    		closeID:"3"
    	};
    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            _.postSuccess("Processing row " + inputRow.ROW);

            var reqObj = _.buildAppstackJSON({
                form: "P0901_W0901H",
                type: "open",
            },["1[39]",inputRow.MCU],["1[38]",inputRow.OBJ],["1[37]",_.filterBlank(inputRow.SUBS)],["1[35]",inputRow.DL01],"45");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P0901_W0901H")) {
                    var rowArr = data.fs_P0901_W0901H.data.gridData.rowset;
                    var errObj = data.fs_P0901_W0901H.errors;
                    var noItem = (rowArr.length === 0);
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (noItem && inputRow.EXTRACT) {
                        _.postError("No item found. Please add the item before attempting to extract the data.");
                        _.returnFromError();
                    } else if (noItem) {
                        _.postSuccess("Adding Account");
                        self.getAddForm(inputRow);
                    } else if (rowArr.length >= 1) {
                        if (rowArr.length == 1) {
                            _.postSuccess("Account found");
                            self.selectRow(inputRow);
                        } else {

                            self.buildUpRowsForExtract(inputRow, 1, rowArr);

                            // add to input Row
							// for (i=1;i<rowArr.length;i++)
							// {
							// 	var inputRowCopy = inputRow;
                            //     inputRow.MCU = rowArr[i].sBusinessUnit_39.value;
                            //     inputRow.SUBS = rowArr[i].sSubsidiary_37.value;
                            //     inputRow.OBJ = rowArr[i].sObjectAccount_38.value;
                            //     inputRow.DL01 = rowArr[i].sAccountDescription_35.value;
							// 	globals.processQ.push(inputRowCopy);
							// }
							
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

        self.buildUpRowsForExtract = function (inputRow, rowNumber, gridRows) {
            var theRowsArray = gridRows;
            var currentRowNo = rowNumber;
            if (theRowsArray.length > 0) {

                var optionsObj = {
                    form: "W0901H"
                }

                var reqObj = _.buildAppstackJSON(optionsObj,"1."+currentRowNo,"107");

                _.getForm("appstack",reqObj).then(function(data){
                    if (data.hasOwnProperty("fs_P0901_W0901A")) {
                        //console.log(data.fs_P0901_W0901A.data);
                        fieldObj = data.fs_P0901_W0901A.data;

                        var inputRowCopy = JSON.parse(JSON.stringify(inputRow));
                        inputRowCopy.MCU = fieldObj.txtBusinessUnitDisplay_53.value;
                        inputRowCopy.SUBS = fieldObj.txtSubsidiaryDisplay_57.value;
                        inputRowCopy.OBJ = fieldObj.txtObjectDisplay_55.value;
                        inputRowCopy.DL01 = fieldObj.txtDescription_12.value;
                        globals.processQ.push(inputRowCopy);       
                        currentRowNo++;           
                        
                        var optionsObj = { form: "W0901A" };
                        var reqObj = _.buildAppstackJSON(optionsObj, "2");
                        _.getForm("appstack",reqObj).then(function(data){

                            var reqObj = _.buildAppstackJSON({
                                form: "P0901_W0901H",
                                type: "open",
                            },["1[39]",inputRow.MCU],["1[38]",inputRow.OBJ],["1[37]",_.filterBlank(inputRow.SUBS)],["1[35]",inputRow.DL01],"45");

                            _.getForm("appstack",reqObj).then(function(data){
                                theRowsArray.shift();
                                if (theRowsArray.length > 1) {
                                    self.buildUpRowsForExtract(inputRow, currentRowNo, theRowsArray);
                                } else {
                                    _.postSuccess("Account found");
                                    self.selectRow(inputRow);
                                }
                            });
                        });                        
                    }
                });
            }
        }

        self.selectRow = function(inputRow) {
            var optionsObj = {
                form: "W0901H"
            }
        	//if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
            //    optionsObj.returnControlIDs = true;
           // } else {
            //    optionsObj.turbo = true;
           // }

            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
            }

            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","107");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P0901_W0901A")) {
                    var errObj = data.fs_P0901_W0901A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                            globals.htmlInputs = data.fs_P0901_W0901A.data;
                        }

                        if (inputRow.EXTRACT) {
                            _.postSuccess("Extracting Data");
                            _.appendTable(data.fs_P0901_W0901A.data, self.reqFields.titles);
                        } else {
                            _.postSuccess("Entering the Revisions form");
                            self.updateForm(inputRow);
                        }
                    }
                } else if (data.hasOwnProperty("fs_P0901_W0901H")) {
                    var errObj = data.fs_P0901_W0901H.errors;
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
                form: "W0901A",
                type: "close",
                dynamic: true,
                turbo: true
            },"47");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P0901_W0901A")) {
                    var errObj = data.fs_P0901_W0901A.errors;
                    var warningObj = data.fs_P0901_W0901A.warnings;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (warningObj.length > 0) {
                        _.getErrorMsgs(warningObj, "warning");
                        _.returnFromError();
                    } else {
                        _.postSuccess("Account updated");
                        _.returnFromSuccess();
                    }
                } else {
                    _.postError("An unknown error occurred while updating the Bank Account");
                    _.returnFromError();
                }
            });
        };
        self.getAddForm = function(inputRow) {
            var optionsObj = {
                form: "W0901H",
            };
        	if (globals.htmlInputs.length === 0) { // only an empty array when first declared. When populated with data, it is an object.
            	optionsObj.returnControlIDs = true;
            } else {
    	        optionsObj.turbo = true;
            }
            var reqObj = _.buildAppstackJSON(optionsObj,"42");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P0901_W0901A")) {
                    var errObj = data.fs_P0901_W0901A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
    	                if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
    			    		globals.htmlInputs = data.fs_P0901_W0901A.data;
    	                }
                        self.addForm(inputRow);
                        _.postSuccess("Entering new Account data");
    	            }
                } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }
            });
        };
        self.addForm = function(inputRow) {
        	var optionsObj = {
                form: "W0901A",
                type: "close",
                dynamic: true
            };
        	if (globals.htmlInputs.length === 0) { // should only be true for first Excel row
        		optionsObj.returnControlIDs = true;
            } else {
            	optionsObj.turbo = true;
            }
            var reqObj = _.buildAppstackJSON(optionsObj,["53",inputRow.MCU],["55",inputRow.OBJ],["57",inputRow.SUBS],["12",inputRow.DL01],"47");
            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Account added"});
            });
        };
    };
    return new Process();
});