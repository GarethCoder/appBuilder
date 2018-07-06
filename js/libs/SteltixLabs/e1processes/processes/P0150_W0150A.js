define(['aisclient'],function(_){
var Process = function(){
var self = this;
self.reqFields = { // Specify ALL required fields
titles: [{
        name: "PA8", // Parent Number
        id: 10
    },
    {
        name: "OSTP", // Structure Type
        id: 8
    },
    {
        name: "AN8", // Address Number
        id: 11
    }],
};

self.closeObj = {
    subForm: "W0150A",
    closeID: "5"
};
    
    self.init = function () {
    var inputRow = globals.inputRow = globals.processQ[0];
    _.postSuccess('Processing row ' + inputRow.ROW);

    inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);
            
        var reqObj = _.buildAppstackJSON({
            form: 'P0150_W0150D',
            type: "open"
        },
            ["18", inputRow.PA8], // Parent Number
            ["20", inputRow.OSTP], // Structure Type
            ["1[26]", inputRow.AN8], // Address Number
        "15");
        
        _.getForm("appstack", reqObj).then(function (data) {

                if (data.hasOwnProperty("fs_P0150_W0150D")) {

                    var rowArr = data.fs_P0150_W0150D.data.gridData.rowset;
                    var errObj = data.fs_P0150_W0150D.errors;
                        
                    if (errObj.length > 0) {
                        
                    _.getErrorMsgs(errObj);
                    _.returnFromError();
                        
                    } else if (rowArr.length >= 1) {
                        if (rowArr.length === 1) {
                            _.postSuccess('Record Found');
                            self.selectRow(inputRow);
                        } else if (inputRow.EXTRACT) {
                            // add to input Row
                            _.postSuccess("Records found");
                            self.selectRow(inputRow);
                        } else { // If anything else happens after data was returned display an error
                            _.postError("There was a problem finding the requested record, or there are duplicates");
                            _.returnFromError();
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
            form: 'W0150D'
        };

        if (inputRow.EXTRACT) {
            optionsObj.aliasNaming = true;
            optionsObj.type = "close";
        }
        
        var reqObj = _.buildAppstackJSON(optionsObj, "1.0", "14");
   
        _.getForm('appstack', reqObj).then(function (data) {
            
            if (data.hasOwnProperty('fs_P0150_W0150A')) {

                globals.htmlInputs = data.fs_P0150_W0150A.data;
                var errObj = data.fs_P0150_W0150A.errors;
            
            if (errObj.length > 0) {
                _.getErrorMsgs(errObj);
                _.returnFromError();
                
        } else if (inputRow.EXTRACT) {
                _.postSuccess("Extracting data");
            
                var fieldObj = data.fs_P0150_W0150A.data;
                $.each(fieldObj.gridData.rowset,function(key,object) {
                    if (fieldObj.gridData.rowset[key].hasOwnProperty("MOExist")) 
                        delete fieldObj.gridData.rowset[key].MOExist;
                    if (fieldObj.gridData.rowset[key].hasOwnProperty("rowIndex")) 
                        delete fieldObj.gridData.rowset[key].rowIndex;   
                });

                _.appendTable(fieldObj, 0, true);
                _.removeDuplicateRows($('#outputHolder table'));
            } else {

                globals.htmlInputs = data.fs_P0150_W0150A.data;
                _.postSuccess('Entering the Revisions form');
                self.updateForm(inputRow);
                
        }
    } else {
        var errObj = data.fs_P0150_W0150A.errors;
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
        var rowIndex = 0;
        var formData = globals.htmlInputs;
        var rowToUse = -1;
        var addressNumber = inputRow.AN8;
        $.each(formData.gridData.rowset, function (rowIndex) {
            if (addressNumber === formData.gridData.rowset[rowIndex].mnAddressNumber_11.value) {
                rowToUse = rowIndex;
                return false;
            }
        });

        if (rowToUse > -1) {
            var reqObj = _.buildAppstackJSON({
                form: 'W0150A',
                gridUpdate: true,
                rowToSelect: rowToUse,
                type: "close"
            }, "4");
    
            // console.log(reqObj);
    
            _.getForm('appstack', reqObj).then(function (data) {
                if (data.hasOwnProperty('fs_P0150_W0150B')) {
                    _.postError("Threshold must be ordered from lowest to highest.");
                    _.returnFromError();
                } else {
                    _.successOrFail(data, { successMsg: 'Record updated' });
                }
            })
    } else {
    _.postError("Address Number could not be found");
    _.returnFromError();
}
};
    
self.getAddForm = function (inputRow) {
    
            var reqObj = _.buildAppstackJSON({
            form: "W0150D",
        }, "33");
    
_.getForm('appstack', reqObj).then(function(data){
    if (data.hasOwnProperty('fs_P0150_W0150A')) {
        var errObj = data.fs_P0150_W0150A.errors;
    if (errObj.length > 0) {
        _.getErrorMsgs(errObj);
        _.returnFromError();
    } else {
    if (globals.htmlInputs.length === 0) {
        globals.htmlInputs = data.fs_P0150_W0150A;
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
        form: 'W0150A',
        type: 'close',
        gridAdd: true,
        customGrid: true
    };
    
    var reqObj = _.buildAppstackJSON(optionsObj,
        ["10", inputRow.PA8],
        ["8", inputRow.OSTP],
        ["grid", "11", inputRow.AN8],
        "4");

    _.getForm('appstack', reqObj).then(function (data) {
        if (data.hasOwnProperty('fs_P0150_W0150B')) {
            _.postError("Threshold must be ordered from lowest to highest.");
            _.returnFromError();
        } else {
            _.successOrFail(data, { successMsg: 'Record added' });
        }
    });
};

// last step is to close Customer Revisions
self.closeForm = function(inputRow) {
    var reqObj = _.buildAppstackJSON({
        form: "W0150A",
        type: "close",
        turbo: true,
        customGrid: true
    },"16");

    _.getForm("appstack",reqObj).then(function(data){
        _.successOrFail(data,{successMsg:'Customer Revisions form closed'});
    });
};    
};
return new Process();
});