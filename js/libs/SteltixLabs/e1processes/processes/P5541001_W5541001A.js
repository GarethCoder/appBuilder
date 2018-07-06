// Item Master Tag Revision
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "LITM"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W5541001C",
            closeID: "16"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            var reqObj = _.buildAppstackJSON({
                form: "P5541001_W5541001C",
                type: "open",
                turbo: true
            },["1[35]",inputRow.LITM],"15");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P5541001_W5541001C")) {
                    var rowArr = data.fs_P5541001_W5541001C.data.gridData.rowset;
                    var errObj = data.fs_P5541001_W5541001C.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        self.getAddForm(inputRow);
                        _.postSuccess("Adding Item Master Tag");
                    } else if (rowArr.length === 1) {
                        self.selectRow(inputRow);
                        _.postSuccess("Item Master Tag found");
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
        self.getAddForm = function(inputRow) {
            if (globals.htmlInputs.length === 0) { // only an empty array when first declared. When populated with data, it is an object.
                 var reqObj = _.buildAppstackJSON({
                 form: "W5541001C",
                 returnControlIDs: true
                 },"23"); // first run: store values
            } else {
                var reqObj = _.buildAppstackJSON({
                form: "W5541001C",
                turbo: true
                },"23"); // subsequent runs: ignore values
            }
            
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P5541001_W5541001A")) {
                    var errObj = data.fs_P5541001_W5541001A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError({subForm:"W5541001A"});
                    } else {
                        if (globals.htmlInputs.length === 0) {
                            globals.htmlInputs = data.fs_P5541001_W5541001A.data;
                        }
                        _.postSuccess("Entering ADD form");
                        self.addForm(inputRow); 
                    }
                } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }
                
            });
        };
        self.selectRow = function(inputRow) {
            if (globals.htmlInputs.length === 0) { // only an empty array when first declared. When populated with data, it is an object.
                var reqObj = _.buildAppstackJSON({
                    form: "W5541001C",
                    returnControlIDs: true
                },"1.0","14"); // first run: store values
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W5541001C",
                    turbo: true
                },"1.0","14"); // subsequent runs: ignore values
            }

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P5541001_W5541001A")) {
                    var errObj = data.fs_P5541001_W5541001A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (globals.htmlInputs.length === 0) {
                            globals.htmlInputs = data.fs_P5541001_W5541001A.data;
                        }
                        _.postSuccess("Entering UPDATE form");
                        self.updateForm(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while entering the UPDATE form");
                    _.returnFromError();
                }
            });
        };
        self.updateForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W5541001A",
                type: "close",
                dynamic: true,
                turbo: true
            },"11"); // doesn't use turbo mode because it needs to catch possible errors

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P5541001_W5541001D")) {
                    _.postError("Cube Calc Warning! Item Master Tag was added <em>without</em> dimensions. Please add the relevant UoM Conversions and run this drop again");
                    _.returnFromError(globals.closeObj);
                } else {
                    _.successOrFail(data,{successMsg:'Item Master Tag successfully added'});
                }
            });
        };
        self.addForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W5541001A",
                type: "close",
                dynamic: true,
                turbo: true
            },["213",inputRow.LITM],"11");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P5541001_W5541001D")) {
                    _.postError("Cube Calc Warning! Item Master Tag was added <em>without</em> dimensions. Please add the relevant UoM Conversions and run this drop again");
                    _.returnFromError(globals.closeObj);
                } else {
                    _.successOrFail(data,{successMsg:'Item Master Tag successfully added'});
                }
            });
        };
    };
    return new Process();
});