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

            if (inputRow.hasOwnProperty("CO") && inputRow["CO"].substr(0, 1) == "'") {
                inputRow["CO"] = inputRow["CO"].substr(1);
            } 
            
            reqObj = _.buildAppstackJSON({
                form: "P51006_W51006R",
                type: "open"
            },["1[13]",inputRow.MCU],"6");

            _.getForm("appstack",reqObj).then(function(data){
                var rowArr = data.fs_P51006_W51006R.data.gridData.rowset;
                var errObj = data.fs_P51006_W51006R.errors;
                if (rowArr.length === 0 && !inputRow.EXTRACT) {
                    _.postSuccess("Adding record to Job Master");
                    self.getAddForm(inputRow);
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

        self.getAddForm = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W51006R"
            },"23");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P51006_W51006S")) {
                    var errObj = data.fs_P51006_W51006S.errors;
                    var fieldData = data.fs_P51006_W51006S.data;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        globals.htmlInputs = fieldData;
                        self.insertNewData(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }                
            });
        };
        self.insertNewData = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W51006S",
                dynamic: true,
                type: "close"
            },
            ['7', inputRow.MCU], 
            ['11', inputRow.DL01], 
            ['25', inputRow.MCUS], 
            ['27', inputRow.CO], 
            ['50', inputRow.STYL], 
            ['39', inputRow.SBLI], 
            ['23', inputRow.FMOD], 
            ['19', inputRow.LDM], 
            ['41', inputRow.PC], 
            ['43', inputRow.DL02], 
            ['45', inputRow.DL03], 
            ['47', inputRow.DL04], 
            ['29', inputRow.AN8], 
            ['31', inputRow.AN8O], 
            ['79', inputRow.ANPA], 
            ['77', inputRow.CT], 
            ['270', inputRow.DOCO], 
            ['35', inputRow.ADDS], 
            ['282', inputRow.RMCU1], 
            ['279', inputRow.BUCA], 
            ['302', inputRow.D1J], 
            ['306', inputRow.D3J], "3");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Job Master record updated"});
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
            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","49");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P51006_W51006S")) {
                    var errObj = data.fs_P51006_W51006S.errors;
                    var fieldData = data.fs_P51006_W51006S.data;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT) {
                        _.postSuccess("Extracting data");     
                        
                        fieldData["z_CO_27"].value = "'" + fieldData["z_CO_27"].value;
                        _.appendTable(fieldData);
                    } else {
                        globals.htmlInputs = fieldData;
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
                form: "W51006S",
                dynamic: true,
                type: "close"
            } , 
            ['7', inputRow.MCU], 
            ['11', inputRow.DL01], 
            ['25', inputRow.MCUS], 
            ['27', inputRow.CO], 
            ['50', inputRow.STYL], 
            ['39', inputRow.SBLI], 
            ['23', inputRow.FMOD], 
            ['19', inputRow.LDM], 
            ['41', inputRow.PC], 
            ['43', inputRow.DL02], 
            ['45', inputRow.DL03], 
            ['47', inputRow.DL04], 
            ['29', inputRow.AN8], 
            ['31', inputRow.AN8O], 
            ['79', inputRow.ANPA], 
            ['77', inputRow.CT], 
            ['270', inputRow.DOCO], 
            ['35', inputRow.ADDS], 
            ['282', inputRow.RMCU1], 
            ['279', inputRow.BUCA], 
            ['302', inputRow.D1J], 
            ['306', inputRow.D3J], "3");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Job Master Record updated."});
            });
        };
    };
    return new Process();
});