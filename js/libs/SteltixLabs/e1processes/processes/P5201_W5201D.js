// Process P555201_W555201D for Veritas
define(['aisclient'], function (_) {
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "DOCO",
                id: "85"
            },
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

            // if (inputRow.hasOwnProperty("CO") && inputRow["CO"].substr(0, 1) == "'") {
            //     inputRow["CO"] = inputRow["CO"].substr(1);
            // } 
            
            reqObj = _.buildAppstackJSON({
                form: "P5201_W5201A",
                type: "open"
            },
                ["72[85]", inputRow.DOCO],
                // ["72[85]", inputRow.DOCO],
                // ["grid","85", inputRow.DOCO],
            
                // ["74", inputRow.AN8O],
                // ["76", inputRow.MCUS],
                // ["78", inputRow.PCTN],
                // ["80", inputRow.ODCM],
                // ["82", inputRow.DS],
                // ["84", inputRow.CT],
                // ["127", inputRow.DCTO1],
                // ["128", inputRow.DCTO2],
                // ["134", inputRow.DCTO3],
                "15");

            _.getForm("appstack",reqObj).then(function(data){
                var rowArr = data.fs_P5201_W5201A.data.gridData.rowset;
                var errObj = data.fs_P5201_W5201A.errors;
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

        // P5201_W5201A ENTRY FORM
        // P5201_W5201D CHANGE / EDIT FORM

        self.getAddForm = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W5201A"
            },"14");

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
                form: "W555201D",
                dynamic: true,
                type: "close"
            },
            ['24', inputRow.MCUS],
            ['360', inputRow.PRCO],
            ['52', inputRow.PCTN],
            ['58', inputRow.JMCU],
            ['215', inputRow.AN8O],
            ['56', inputRow.ODCM],
            ['231', inputRow.INVF],
            ['223', inputRow.PTC],
            ['219', inputRow.TXA1],
            ['221', inputRow.EXR1],
            ['74', inputRow.AN8K],
            ['76', inputRow.ADCM],
            ['88', inputRow.DS],
            ['90', inputRow.CT],
            ['92', inputRow.BLWP],
            ['94', inputRow.FSLV],
            ['208', inputRow.RTNR],
            ['210', inputRow.RGLC],
            ['263', inputRow.RCTL],
            ['34', inputRow.USD1],
            ['36', inputRow.USD2],
            ['96', inputRow.CSDT],
            ['98', inputRow.CDTE],
            ['100', inputRow.USD3],
            ['102', inputRow.USD4],
            ['104', inputRow.USA4],
            ['106', inputRow.USA5],
            ['108', inputRow.ANOB],
            ['110', inputRow.USA1],
            ['112', inputRow.USA2],
            ['114', inputRow.USA3],
            ['38', inputRow.AI01],
            ['40', inputRow.AI02],
            ['120', inputRow.AI03],
            ['122', inputRow.AI04],
            ['124', inputRow.AI05],
            ['343', inputRow.AI06],
            ['345', inputRow.AI07],
            ['348', inputRow.AI08],
            ['350', inputRow.AI09],
            ['352', inputRow.AI10],
            ['307', inputRow.AI11],
            ['311', inputRow.AI12],
            ['314', inputRow.AI13],
            ['317', inputRow.AI14],
            ['321', inputRow.AI15],
            ['324', inputRow.AI16],
            ['329', inputRow.AI17],
            ['331', inputRow.AI18],
            ['333', inputRow.AI19],
            ['335', inputRow.AI20],
            ['279', inputRow.MCIA],
            ['287', inputRow.CTF5],
            ['281', inputRow.NTEX],
            ['271', inputRow.CRCF],
            "3");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Job Master record updated"});
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
                        _.postSuccess("Extracting data");
                        _.appendTable(fieldData);
                        
                        // fieldData["z_CO_27"].value = "'" + fieldData["z_CO_27"].value;
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

        // P5201_W5201A ENTRY FORM
        // P5201_W5201D CHANGE / EDIT FORM

        self.updateForm = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W5201D",
                dynamic: true,
                type: "close",
                gridUpdate: true
            }, 
            "11");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Job Master Record updated."});
            });
        };
    };
    return new Process();
});