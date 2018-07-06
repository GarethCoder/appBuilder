define(['aisclient'],function(_){
    var Process = function(){
    var self = this;
    self.reqFields = { // Specify ALL required fields
    titles: [{
            name: "HCOD", // Hold Code
            id: 26
        },
        {
            name: "MCU", // Branch/Plant
            id: 28
        }],
    };
        
    self.closeObj = {
        subForm: "W42090A",
        closeID: "2"
    };
        
        self.init = function () {
        var inputRow = globals.inputRow = globals.processQ[0];
        _.postSuccess('Processing row ' + inputRow.ROW);
    
        inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);
                
            var reqObj = _.buildAppstackJSON({
                form: 'P42090_W42090A',
                type: "open",
                // customGrid: true
            },
                ["26", inputRow.HCOD],
                ["28", inputRow.MCU],
            "20");
            
            _.getForm("appstack", reqObj).then(function (data) {
    
                    if (data.hasOwnProperty("fs_P42090_W42090A")) {
    
                        var rowArr = data.fs_P42090_W42090A.data.gridData.rowset;
                        var errObj = data.fs_P42090_W42090A.errors;
                            
                        if (errObj.length > 0) {
                            
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                            
                        } else if (rowArr.length >= 1) {

                            if (rowArr.length == 1) {
                                _.postSuccess('Record(s) Found');
                                self.selectRow(inputRow);
                            } else {
                                // add to input Row
                                for (i=1;i<rowArr.length;i++)
                                {
                                    console.log(rowArr[i]);
                                    var inputRowCopy = JSON.parse(JSON.stringify(inputRow));
                                    console.log(inputRowCopy);
                                    inputRowCopy.HCOD = rowArr[i].sHdCd_4.value;
                                    inputRowCopy.MCU = rowArr[i].sBranchPlant_6.value;
                                    globals.processQ.push(inputRowCopy);
                                }
                                _.postSuccess("Records found");
                                self.selectRow(inputRow);
                            }
                            
                    } else if (rowArr.length === 0) {
                        _.postSuccess('Adding Record');
                        self.getAddForm(inputRow);
                    } else {
                        _.postError('There was a problem finding the requested record, or there are duplicates');
                        _.returnFromError();
                    }
                } else {
                    _.postError('An unknown error occurred in the find/browse form');
                    _.returnFromError();
                }
            });
        };
        
        self.selectRow = function (inputRow) {
    
            var optionsObj = {
                form: 'W42090A',
                type: 'execute',
            };
    
            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }
            
            var reqObj = _.buildAppstackJSON(optionsObj, "1.0", "2");
            // console.log();
       
            _.getForm('appstack', reqObj).then(function (data) {
                
                if (data.hasOwnProperty('fs_P42090_W42090B')) {
    
                globals.htmlInputs = data.fs_P42090_W42090B.data;
                var errObj = data.fs_P42090_W42090B.errors;
                
                if (errObj.length > 0) {
                _.getErrorMsgs(errObj);
                _.returnFromError();
                    
            } else if (inputRow.EXTRACT) {
                _.postSuccess("Extracting data");
                
                var fieldObj = data.fs_P42090_W42090B.data;
                
                _.appendTable(fieldObj);
                _.appendTable(fieldObj);
                } else {
                    globals.htmlInputs = data.fs_P42090_W42090B.data;
                    // console.log(globals.htmlInputs);    
                    _.postSuccess('Entering the Revisions form');
                    self.updateForm(inputRow);
            }
        } else {
            var errObj = data.P42090_W42090B.errors;
            if (errObj.length > 0) {
                _.getErrorMsgs(errObj);
                _.returnFromError();
            } else {
                _.postError('There was a problem entering the Revisions form');
                _.returnFromError();
            }
            }
        });
    };
        
        self.updateForm = function (inputRow) {
        
        var reqObj = _.buildAppstackJSON({
            form: "W42090B",
            type: "close"
        },
            ["24",inputRow.RPER], // Person Responsible
            ["43", inputRow.LTYP], // Limit Type
            ["45",inputRow.CTYP], // Code Type
            ["47",inputRow.APB], // Age From
            ["22",inputRow.PPL], // Allowable
            ["16",inputRow.ULC], // Upper Limit
            ["14", inputRow.LLC], // Lower Limit
            ["20", inputRow.PWRD], // Password
            "1");
            // console.log(reqObj);    
        
            _.getForm('appstack', reqObj).then(function (data) {
            _.successOrFail(data, { successMsg: 'Record updated' });
        });
    };
        
    self.getAddForm = function(inputRow) {
        
                var reqObj = _.buildAppstackJSON({
                form: "W42090A",
            }, "11");
        
    _.getForm("appstack",reqObj).then(function(data){
        if (data.hasOwnProperty('fs_P42090_W42090B')) {
            var errObj = data.fs_P42090_W42090B.errors;
        if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
        } else {
        if (globals.htmlInputs.length === 0) {
            globals.htmlInputs = data.fs_P42090_W42090B;
        }
        self.addForm(inputRow);
        _.postSuccess('Entering new Record data');
    }
        } else {
        _.postError('An unknown error occurred while entering the ADD form');
        _.returnFromError();
        }
    });
    };
        
    self.addForm = function(inputRow) {
    var optionsObj = {};
        optionsObj = {
            form: 'W42090B',
            type: 'close'
    };
        
    var reqObj = _.buildAppstackJSON(optionsObj,
        ["4",inputRow.HCOD], // Hold Code
        ["8",inputRow.MCU], // Branch/Plant
        ["24",inputRow.RPER], // Person Responsible
        ["43",inputRow.LTYP], // Limit Type
        ["45",inputRow.CTYP], // Code Type
        ["47",inputRow.APB], // Age From
        ["22",inputRow.PPL], // Allowable
        ["16",inputRow.ULC], // Upper Limit
        ["14",inputRow.LLC], // Lower Limit
        ["20",inputRow.PWRD], // Password
        "1");
    
        _.getForm('appstack', reqObj).then(function (data) {
        _.successOrFail(data, { successMsg: 'Record added' });
        });
    };
    
    // last step is to close Customer Revisions
    self.closeForm = function(inputRow) {
        var reqObj = _.buildAppstackJSON({
            form: "W42090B",
            type: "close",
            turbo: true,
            customGrid: true
        },"2");
    
        _.getForm("appstack",reqObj).then(function(data){
            _.successOrFail(data,{successMsg:'Order Hold Information form closed'});
        });
    };    
    };
    return new Process();
    });