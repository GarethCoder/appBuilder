// Process P555201_W555201D for Veritas

define(['aisclient'], function (_) {
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "DOCO", // Contract Number
                id: "85"
            },
            {
                name: "DCTO", // Contract Type
                id: "86"
            }
            ]
        };

        self.closeObj = {
            subForm: "W5201D",
            closeID: "12"
        };

        // P5201_W5201A ENTRY FORM
        // P5201_W5201D CHANGE / EDIT FORM

        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            if (inputRow.hasOwnProperty("txt__Contract Company__KCOO__14") && inputRow["txt__Contract Company__KCOO__14"].substr(0, 1) == "'") {
                inputRow["txt__Contract Company__KCOO__14"] = inputRow["txt__Contract Company__KCOO__14"].substr(1);
            } 

            if (inputRow.hasOwnProperty("txt__Payment Terms__PTC__223") && inputRow["txt__Payment Terms__PTC__223"].substr(0, 1) == "'") {
                inputRow["txt__Payment Terms__PTC__223"] = inputRow["txt__Payment Terms__PTC__223"].substr(1);
            }

            reqObj = _.buildAppstackJSON({
                form: "P5201_W5201A",
                type: "open"
            },
                ["72[85]", inputRow.DOCO],
                ["72[86]", inputRow.DCTO],
                "15");

            _.getForm("appstack",reqObj).then(function(data){
                var rowArr = data.fs_P5201_W5201A.data.gridData.rowset;
                var errObj = data.fs_P5201_W5201A.errors;
                if (inputRow.DOCO === undefined || inputRow.DCTO === undefined || rowArr.length === 0 && !inputRow.EXTRACT) {
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

        // P5201_W5201A ENTRY FORM
        // P5201_W5201D CHANGE / EDIT FORM

        self.getAddForm = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W5201A"
            },"45");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P5201_W5201D")) {
                    var errObj = data.fs_P5201_W5201D.errors;
                    var fieldData = data.fs_P5201_W5201D.data;
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

        // P5201_W5201A ENTRY FORM
        // P5201_W5201D CHANGE / EDIT FORM

        self.insertNewData = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W5201D",
                dynamic: true,
                gridAdd: true
            },
                "11");
            
                _.getForm("appstack",reqObj).then(function(data){
                    
                    if (data.hasOwnProperty("fs_P5201_W5201B")) {
                        var closingForm = _.buildAppstackJSON({
                                form: "W5201B",
                                type: "close"
                            }, "13");

                        _.getForm("appstack", closingForm).then(function (data) {
                            _.successOrFail(data, { successMsg: "Form successfully CLOSED!!!!" });
                        });  
                    } else 
                        _.successOrFail(data, { successMsg: "Addition completed successfully." });
                });
        };

        // P5201_W5201A ENTRY FORM
        // P5201_W5201D CHANGE / EDIT FORM

        self.selectRow = function(inputRow) {
            var optionsObj = {
                form: "W5201A"
            };

            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }

            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","14");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P5201_W5201D")) {
                    var errObj = data.fs_P5201_W5201D.errors;
                    var fieldData = data.fs_P5201_W5201D.data;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT) {
                        fieldData["z_KCOO_14"].value = "'" + fieldData["z_KCOO_14"].value;
                        fieldData["z_PTC_223"].value = "'" + fieldData["z_PTC_223"].value;
                        
                            _.appendTable(fieldData);
                            _.postSuccess("Extracting data");
                           
                    } else {
                        globals.htmlInputs = fieldData;
                        self.updateForm(inputRow);
                    }
                } else if (data.hasOwnProperty("fs_P5201_W5201G")) {
                    _.postError("The form requested cannot be updated, because the Contract Type is C.");
                    _.returnFromError();
                } else {
                    _.postError("An unknown error occurred while entering the UPDATE form");
                    _.returnFromError();
                }
            });
        };

        // P5201_W5201A ENTRY FORM
        // P5201_W5201D CHANGE / EDIT FORM

        self.updateForm = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W5201D",
                dynamic: true,
                type: "close"
            },  ["34", inputRow.USD1],
                ["36", inputRow.USD2],
                ["269", inputRow.RPER],
                ["283", inputRow.MCIF],
                ["285", inputRow.NTEF],
            "11");

                _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Job Master Record updated."});
            });
        };
    };
    return new Process();
});