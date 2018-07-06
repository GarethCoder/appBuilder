// Item Master Additional Systems Info
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "UITM",
                id: 70,
            }],
            isCustomTemplate: false
        };
    	self.closeObj = {
    		subForm: "W4101E",
    		closeID:"5"
    	};
    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

        	var reqObj = _.buildAppstackJSON({
                form: "P46012_W46012A",
                type: "open"
            },["70",inputRow.UITM],["1[23]",inputRow.MCU],"15");

        	_.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P46012_W46012A")) {
                    var rowArr = data.fs_P46012_W46012A.data.gridData.rowset;
                    var errObj = data.fs_P46012_W46012A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length == 0 && inputRow.EXTRACT) {
                        _.postError("No item found. Please add the item before attempting to extract the data.");
                        _.returnFromError();
                    } else 
                    if (rowArr.length == 0) {
                        _.postSuccess("Adding row.");
                        self.addRow(inputRow);
                    } else 
                    if (rowArr.length >= 1) {
                        //if (inputRow.EXTRACT) {
                        //     if (rowArr.length == 1) {
                        //         _.postSuccess("Record found");
                        //         self.selectRow(inputRow);
                        //     } else {
    
                        //         // add to input Row
                        //         for (i=1;i<rowArr.length;i++)
                        //         {
                        //             var inputRowCopy = JSON.parse(JSON.stringify(inputRow));
                        //             // rowArr.CBNK = rowArr[i].sBankAccount_19.value;
                        //             // rowArr.CBNK = rowArr[i].sBankAccount_19.value;
                        //             // rowArr.CBNK = rowArr[i].sBankAccount_19.value;
                        //             console.log(rowArr[i]);
                        //             globals.processQ.push(inputRowCopy);
                        //         }
    
                        //         _.postSuccess("Bank account found");
                        //         self.getEditForm(inputRow);
                        //     }
                        // } else {
                            self.selectRow(inputRow);
                            _.postSuccess("Item found");
                       // }
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
        self.addRow = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W46012A",
            },"47");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P46012_W46012B")) {
                    var reqObj = _.buildAppstackJSON({
                        form: "W46012B",
                        type: "close",
                        gridAdd: true,
                        customGrid: true
                    },
                    ['53', inputRow.UITM],
                    ['25', inputRow.MCU],
                    ['57', inputRow.UOM],
                    ['grid', '42', inputRow.LOCNE1], 
                    ['grid', '18', inputRow.MXPK], 
                    ['grid', '19', inputRow.MXRP], 
                    ['grid', '20', inputRow.LETP], 
                    ['grid', '21', inputRow.LETC], "12");
        
                    _.getForm("appstack",reqObj).then(function(data){
                        _.successOrFail(data,{successMsg: "Item added"});
                    });
                } else {
                    _.postError("An unknown error occurred in finding the add form.");
                    _.returnFromError();
                }
            });
        }
        self.selectRow = function(inputRow) {
            var optionsObj = {
                form: "W46012A"
            }

            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }
            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","14");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P46012_W46012B")) {
                    var errObj = data.fs_P46012_W46012B.errors;
                    var fieldObj = data.fs_P46012_W46012B.data;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT) {
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
                                
                                // loop through the object to extract aliases
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
                    } else {
                        //_.postSuccess("Entering the Revisions form");
                        
                        var rowToUpdate = "-1";
                        $.each(fieldObj.gridData.rowset,function(key,object) {
                           if (object.sLocation_42.value == inputRow.LOCNE1) {
                                rowToUpdate = object.rowIndex;
                           }
                        });

                        if (rowToUpdate == "-1") {
                            _.postSuccess("Adding row");
                            self.addRowToGrid(inputRow);
                        }
                        else {
                            _.postSuccess("Found row to update");
                            self.updateForm(inputRow, rowToUpdate);
                        }
                    }
                }  else {
                    _.postError("An unknown error occurred in the find/browse form");
                    _.returnFromError();
                }
            });
        };

        self.addRowToGrid = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                 form: "W46012B",
                 type: "close",
                 gridAdd: true,
                 customGrid: true
             },['grid', '42', inputRow.LOCNE1], 
             ['grid', '18', inputRow.MXPK], 
             ['grid', '19', inputRow.MXRP], 
             ['grid', '20', inputRow.LETP], 
             ['grid', '21', inputRow.LETC], "12");

             _.getForm("appstack",reqObj).then(function(data){
                 _.successOrFail(data,{successMsg: "Item updated"});
             });
        };

        self.updateForm = function(inputRow, rowToUpdate) {
            var reqObj = _.buildAppstackJSON({
                form: "W46012B",
                type: "close",
                gridUpdate: true,
                rowToSelect: rowToUpdate,
                customGrid: true
            },['grid', '42', inputRow.LOCNE1], 
            ['grid', '18', inputRow.MXPK], 
            ['grid', '19', inputRow.MXRP], 
            ['grid', '20', inputRow.LETP], 
            ['grid', '21', inputRow.LETC], "12");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Item updated"});
            });
        };
    };
    return new Process();
});