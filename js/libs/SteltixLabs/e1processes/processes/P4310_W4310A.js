define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "DOCO"
            }, {
                "name": "DCTO"
            },{
                "name": "LINENO"
            }, {
                "name": "UORGE1"
            }],
            isCustomTemplate: true
        };
        self.closeObj = {
            subForm: "W4310A",
            closeID: "5"
        };
    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
    		_.postSuccess("Processing row " + inputRow.ROW);

            var reqObj = _.buildAppstackJSON({
                form: "P4310_W4310G",
                type: "open"
            },["13",inputRow.DOCO],["11",inputRow.DCTO],["1[173]", inputRow.LINENO], "8");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4310_W4310G")) { // is form being returned? if not, lets try add.
                    var rowArr = data.fs_P4310_W4310G.data.gridData.rowset;
                    var errObj = data.fs_P4310_W4310G.errors;
                    var noItems = (rowArr.length === 0);
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (noItems) {
                        _.postError("No items were found for the specified order number and doc type.");
                        _.returnFromError();
                    } else if (rowArr.length == 1) {
                        // Items were returned, we need to loop through and check if an add / update is required
                        self.selectRow(inputRow)
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
        
        self.selectRow = function (inputRow) {
            var optionsObj = {
                form: "W4310G"
            };

            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","176");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4310_W4310A")) {
                    var errObj = data.fs_P4310_W4310A.errors;
                    var fieldData = data.fs_P4310_W4310A.data;
                    var gridData = data.fs_P4310_W4310A.data.gridData;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } 
                    else {
                        var optionsObj = {
                            form: "W4310A",
                            type: "execute",
                            gridUpdate: true,
                            customGrid: true
                        };

                        // we need to find the right line number record in the grid so qty can be updated
                        var lineNoFound = false;
                        $.each(gridData.rowset, function(i, o){
                            if (o.mnLineNumber_585.value == inputRow.LINENO) {
                                lineNoFound = true;
                                optionsObj.rowToSelect = i;
                                return false;
                            }
                        });

                        if (!lineNoFound) {
                            _.postError("Line Number ("+inputRow.LINENO+") could not be found for Order No: "+inputRow.DOCO+".");
                            _.returnFromError();
                        }
                        else {
                            var reqObj = _.buildAppstackJSON(
                                optionsObj,["grid","398",inputRow.UORGE1],"4");

                            _.getForm("appstack",reqObj).then(function(data) {
                                if (data.hasOwnProperty("fs_P4310_W4310G")) {
                                    var errObj = data.fs_P4310_W4310G.errors;
                                    var warningObj = data.fs_P4310_W4310G.warnings;
                                    if (errObj.length > 0) {
                                        _.getErrorMsgs(errObj);
                                        _.returnFromError();
                                    }
                                    else
                                    if (warningObj.length > 0) {
                                        _.getErrorMsgs(warningObj);
                                        _.returnFromError();
                                    }
                                    else {
                                        _.successOrFail(data,{successMsg:'Order Detail Qty updated.'});
                                    }
                                }
                            }); 
                        }
                    }
                }
            });
        }

    };
    return new Process();
});