define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "AT1"
            }, {
                "name": "AN8"
            }, {
                "name": "ALPH"
            }, {
                "name": "ETP"
            }, {
                "name": "EMAL"
            }, {
                "name": "EHIER"
            }, {
                "name": "ECLASS"
            }],
            isCustomTemplate: true
        };
        self.closeObj = {
            subForm: "W0111A",
            closeID: "5"
        };
        self.ETP = "";
        self.ETP_LIST = [{"code":"","description":"-- Select One --"},{"code":"E","description":"Email address"},{"code":"W","description":"Internal address"},{"code":"I","description":"Internet address"}];
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            var reqObj = _.buildAppstackJSON({
                form: "P01012_W01012B",
                type: "open"
            },["1[19]",inputRow.AN8],["54",inputRow.AT1],"15");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P01012_W01012B")) {
                    var rowArr = data.fs_P01012_W01012B.data.gridData.rowset;
                    var errObj = data.fs_P01012_W01012B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        _.postError("Address Book record does not exist. Please add it and try again.");
                        _.returnFromError();
                    } else {
                        _.postSuccess("Address Book record found");
                        self.getEditForm(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred in the find/browse form");
                    _.returnFromError();
                }
            });
        };

        self.getEditForm = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W01012B"
            },"1.0","67");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P0111_W0111A")) {
                    _.postSuccess("Entering Who's Who form");
                    self.queryForm(inputRow);
                } else {
                    _.postError("An unknown error occurred while entering the Who's Who form");
                    _.returnFromError();
                }
            });
        };
        // query who's who form
        self.queryForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W0111A"
            },["1[61]",inputRow.ALPH],"74");

            _.getForm("appstack",reqObj).then(function(data){
                currentObj = data.fs_P0111_W0111A.data.gridData.rowset[0];

                if (data.fs_P0111_W0111A.data.gridData.rowset.length > 0) { // UPDATE
                    _.postSuccess("Who's Who record found");
                    self.getMainGrid(inputRow); // for phones/email, next step is to take row exit, step after to search for record, then add/update
                } else { // ERROR
                    _.postError("No Who's Who record. Please add one for this Alpha Name and then drop this form again.");
                    _.returnFromError();
                }
            });
        };

        self.getMainGrid = function(inputRow) {
            var optionsObj = {
                form: "W0111A"
            }

            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }

            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","146");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P01111_W01111I")) {

                    if (inputRow.EXTRACT) {
                        _.postSuccess("Extracting data");
                        
                        var fieldObj = data.fs_P01111_W01111I.data;
                        fieldObj.z_ALPH = {
                            id:61, 
                            longName: 'Alpha Name',
                            internalValue: inputRow.ALPH,
                            title: 'ALPH',
                            value: inputRow.ALPH
                        }; 
                        fieldObj.z_AT1 = {
                            id: 54, 
                            longName: 'Search Type',
                            internalValue: inputRow.AT1,
                            title: 'ALPH',
                            value: inputRow.AT1
                        };
                        fieldObj.z_AN8_17.internalValue = fieldObj.z_AN8_17.value;
                        $.each(fieldObj.gridData.rowset,function(key,object) {
                                if (fieldObj.gridData.rowset[key].hasOwnProperty("MOExist")) 
                                    delete fieldObj.gridData.rowset[key].MOExist;
                                if (fieldObj.gridData.rowset[key].hasOwnProperty("rowIndex")) 
                                    delete fieldObj.gridData.rowset[key].rowIndex;                               
                            });

                        _.appendTable(fieldObj, 0, true);
                    }
                    else
                    {

                        var rowToSelect = "add";
                        var currentArr = data.fs_P01111_W01111I.data.gridData.rowset;
                        //self.ETP_LIST = 

                        if (!inputRow.hasOwnProperty("RCK7") || (inputRow.hasOwnProperty("RCK7") && inputRow.hasOwnProperty("RCK7") === '')) {
                            // then we're adding
                        } else {
                            for (var i = 0; i < currentArr.length; i++) {
                                // if (currentArr[i].sElectronicAddressType_21.value.toLowerCase() === inputRow.ETP.toLowerCase()) {
                                if (currentArr[i].mnLineNumber_20.value === inputRow.RCK7) {
                                    self.ETP_LIST = currentArr[i].sElectronicAddressType_21.list;
                                    rowToSelect = i;
                                }
                            };
                        }

                        if (rowToSelect !== "add") { // UPDATE
                            // cache corect ETP value. Either the Excel or the default, transforming both before caching
                            // self.ETP = convertDropdownVals(inputRow.ETP,self.ETP_LIST);
                            // _.postSuccess("Email/Internet information updating");
                            // self.updateGrid(inputRow,rowToSelect);
                            self.ETP = convertDropdownVals(inputRow.ETP,self.ETP_LIST);
                            _.postSuccess("Adding Email/Internet information");
                            self.updateGrid(inputRow, rowToSelect);
                            // self.addToGrid(inputRow);
                            
                        } else { // ADD
                            self.ETP = convertDropdownVals(inputRow.ETP,self.ETP_LIST);
                            _.postSuccess("Adding Email/Internet information");
                            self.addToGrid(inputRow);
                        }
                    }
                } else {
                    _.postError("An unknown error occurred while entering the Email/Internet form");
                    _.returnFromError();
                }
            });
        };
        self.addToGrid = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W01111I",
                type: "close",
                gridAdd: true,
                customGrid: true,
                suppressCustomGrid: true
            },["grid","21",self.ETP],["grid","22",inputRow.EMAL],["grid","36",inputRow.EHIER],["grid","38",inputRow.ECLASS],"12","12");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:"Email/Internet Who's Who record successfully added",isGrid:true});
            });
        };
        self.updateGrid = function(inputRow,rowToSelect) {
            var reqObj = _.buildAppstackJSON({
                form: "W01111I",
                type: "close",
                gridUpdate: true,
                rowToSelect: rowToSelect,
                customGrid: true,
                suppressCustomGrid: true
            },["grid","21",self.ETP],["grid","22",inputRow.EMAL],["grid","36",inputRow.EHIER],["grid","38",inputRow.ECLASS],"12","12");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:"Email/Internet Who's Who record successfully added",isGrid:true});
            });
        }
    };
    return new Process();
});