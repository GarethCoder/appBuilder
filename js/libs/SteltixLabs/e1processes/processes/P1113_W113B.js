define(['aisclient'],function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "EFT",
                id: 83,
                name: "CRR",
                id: 12,
                name: "CRRD",
                id: 13,
                name: "CRDC",
                id: 69,
                name: "CRCD",
                id: 70,
                name: "RTTY",
                id: 43,
            }],
            isCustomTemplate: false
        };
    	self.closeObj = {
    		subForm: "W1113B",
    		closeID:"5"
    	};
        self.isExtract = false;
    	self.sysGenItemNum = "";
    	self.noItemNum = false;
    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            if (inputRow.hasOwnProperty("RTTY") && inputRow.hasOwnProperty("EFT")) {
                inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

                // enter rate type and effective date and click the search button
                var reqObj = _.buildAppstackJSON({
                    form: "P1113_W1113B",
                    type: "open",
                },["43",inputRow.RTTY], ["83", inputRow.EFT],"45");

                _.getForm("appstack",reqObj).then(function(data){
                    if (data.hasOwnProperty("fs_P1113_W1113B")) { // is form being returned? if not, lets try add.
                        var rowArr = data.fs_P1113_W1113B.data.gridData.rowset;
                        var errObj = data.fs_P1113_W1113B.errors;
                        var noItems = rowArr.length === 0;
                        if (errObj.length > 0) {
                            _.getErrorMsgs(errObj);
                            _.returnFromError();
                        } else if (noItems && inputRow.EXTRACT && inputRow.EXTRACT.toLowerCase().search('y') !== -1) {
                            _.postError("No item found. Please add the item before attempting to extract the data.");
                            _.returnFromError();
                        } else if (noItems) {
                            _.postSuccess("Adding Item");
                            self.getAddForm(inputRow);
                        } else if (rowArr.length > 0) {
                            // Items were returned, we need to loop through and check if an add / update is required
                            self.processRows(inputRow, rowArr);
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
                _.postError("Required information missing.");
                _.returnFromError();
            }            
        };

        self.processRows = function(inputRow, dataRows) {
            // check if we are updating effective date
            var effDateUpdate = false;
            var numberUpdates = false;
            var gridRowNo = 0;
            var succMessage = "";
            var errMessage = "";
            var aisCalls = [];

            // if rate type, effective date, from currency and to currency match, it's a number update
            $.each(dataRows,function(key,object) {
                if (object.sRtTy_71.value == inputRow.RTTY && 
                    object.dtEffectiveDate_14.value == inputRow.EFT &&
                    object.sToCurr_69.value == inputRow.CRDC &&
                    object.sFromCurr_70.value == inputRow.CRCD) {
                        console.log('divisor and multiplier update needed.');
                        succMessage = "Divisor and Multiplier update Updated";
                        errMessage = "Divisor and Multiplier.";
                        numberUpdates = true;
                        var reqObj = _.buildAppstackJSON({
                            form: "W1113B",
                            type: "execute",
                            gridUpdate: true,
                            customGrid: true,
                            rowToSelect: key,
                        },["grid","12",inputRow.CRR],["grid","13",inputRow.CRRD],"4");

                        /*_.getForm("appstack",reqObj).then(function(data){
                            _.postSuccess("Effective Date Updated");
                            _.returnFromSuccess();
                        }); */

                        return false; 
                    }
            });

            // if not a numbers update, then we need to chek if it's an effective date update
            if (!numberUpdates) { 
                $.each(dataRows,function(key,object) {
                    // if rate type, effective date & currencies are same, we must update multiplier and divisor
                    if (object.sRtTy_71.value == inputRow.RTTY && 
                        object.sToCurr_69.value == inputRow.CRDC &&
                        object.sFromCurr_70.value == inputRow.CRCD &&
                        object.mnDivisor_13.value == inputRow.CRRD &&
                        object.mnMultiplier_12.value == inputRow.CRR
                        ) {
                            effDateUpdate = true;
                            succMessage = "Effective Date updated.";
                            errMessage = "Effective Date";
                            var reqObj = _.buildAppstackJSON({
                                form: "W1113B",
                                type: "execute",
                                gridUpdate: true,
                                customGrid: true,
                                rowToSelect: key,
                            },["grid","14",inputRow.EFT],"4");

                            /*
                            _.getForm("appstack",reqObj).then(function(data){
                                if (data.hasOwnProperty("fs_P1113_W1113B")) {
                                    var errObj = data.fs_P1113_W1113B.errors;
                                    if (errObj.length > 0) {
                                        _.getErrorMsgs(errObj);
                                        _.returnFromError();
                                    } else {
                                        _.postError("There was a problem updating the multiplier and divisor");
                                        _.returnFromError();
                                    }
                                }
                                else
                                {
                                    _.postSuccess("Multiplier and Divisor Updated");            
                                    _.returnFromSuccess();                    
                                }
                            }); */
                           
                            return false;
                        }
                });
            }

            if (numberUpdates || effDateUpdate)
            {
                 _.getForm("appstack",reqObj).then(function(data){
                    if (data.hasOwnProperty("fs_P1113_W1113B")) {
                        var errObj = data.fs_P1113_W1113B.errors;
                        if (errObj.length > 0) {
                            _.getErrorMsgs(errObj);
                            _.returnFromError();
                        } else {
                            _.postError("There was a problem updating "+errMessage);
                            _.returnFromError();
                        }
                    }
                    else {
                        _.postSuccess(succMessage);            
                        _.returnFromSuccess();                    
                    }
                }); 
            }
            else { // if not an update, we must add the item
                var reqObj = _.buildAppstackJSON({
                                form: "W1113B",
                                type: "execute",
                                gridAdd: true,
                                customGrid: true,
                            },["grid","12",inputRow.CRR],["grid","13",inputRow.CRRD],
                              ["grid","14",inputRow.EFT],["grid","69",inputRow.CRDC],
                              ["grid","70",inputRow.CRCD], "4");

                _.getForm("appstack",reqObj).then(function(data){
                        if (data.hasOwnProperty("fs_P1113_W1113B")) {
                            var errObj = data.fs_P1113_W1113B.errors;
                            if (errObj.length > 0) {
                                _.getErrorMsgs(errObj);
                                _.returnFromError();
                            } 
                            else 
                            {
                                _.postError("There was a problem updating the multiplier and divisor");
                                _.returnFromError();
                            }
                        }
                        else {
                            _.postSuccess("New Currency Reinstatement Rate Added.");            
                            _.returnFromSuccess();                    
                        }
                    });
            }
        }
    };
    return new Process();
});