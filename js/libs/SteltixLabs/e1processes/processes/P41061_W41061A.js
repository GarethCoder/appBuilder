// Supplier Catalogues
define(['aisclient'], function(_){
    var Process = function () {
        var self = this;
        self.reqFields = {
            titles: [{
                name: "AN8"
            }, {
                name: "MCU"
            }, {
                name: "CATN"
            }, {
                name: "LITM"
            }, {
                name: "CRCD"
            }, {
                name: "PRRC"
            }, {
                name: "UOM"
            }, {
                name: "QB"
            }, {
                name: "DSC1"
            }, {
                name: "DSC2"
            }, {
                name: "EFTJ"
            }, {
                name: "EXDJ"
            }],
            isCustomTemplate: true
        };
        self.closeObj = {
            subForm: "W41061B",
            closeID: "5"
        };
        self.inputDate = moment(); // placeholder
        self.rowToSelect = null;
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            self.inputDate = moment(inputRow.REQUEST_DATE).format("MM/DD/YYYY");

            var reqObj = _.buildAppstackJSON({
                form: "P41061_W41061B",
                type: "open",
                turbo: true
                },["52",inputRow.AN8],["26",inputRow.CATN],["8",inputRow.MCU],"6");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41061_W41061B")) {
                    var rowArr = data.fs_P41061_W41061B.data.gridData.rowset;
                    var errObj = data.fs_P41061_W41061B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        self.getAddForm(inputRow);
                        _.postSuccess("Adding Supplier CATNalog");
                    } else if (inputRow.EXTRACT && rowArr.length > 0) {
                        self.selectRow(inputRow);
                        _.postSuccess("Supplier CATNalog found");
                    }
                } else {
                    _.postError("An unknown error occurred in the find/browse form");
                    _.returnFromError();
                }
            });
        };
        self.getAddForm = function(inputRow) {
            if (globals.htmlInputs.length === 0) { 
                var reqObj = _.buildAppstackJSON({
                    form: "W41061B",
                },"37");
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W41061B",
                    turbo: true
                },"37");
            }

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41061_W41061A")) {
                    if (globals.htmlInputs.length === 0) { 
                        globals.htmlInputs = data.fs_P41061_W41061A.data;
                        globals.titleList = globals.htmlInputs.gridData.titles;
                    }
                    _.postSuccess("Adding Supplier CATNalogue entry");
                    self.addToGrid(inputRow);
                } else {
                    _.postError("An unknown error occurred while entering the Supplier CATNalog Revisions ADD form");
                    _.returnFromError();
                }
            });
        };
        self.addToGrid = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W41061A",
                type: "close",
                gridAdd: true,
                customGrid: true,
                suppressDynamicGrid: true,
                turbo: true
            },["9",inputRow.CATN],
            ["149",inputRow.AN8],
            ["grid","34",inputRow.LITM],
            ["grid","24",inputRow.CRCD],
            ["grid","21",inputRow.PRRC],
            ["grid","20",inputRow.UOM],
            ["grid","97",inputRow.QB],
            ["grid","22",inputRow.EFTJ],
            ["grid","23",inputRow.EXDJ],
            ["grid","26",inputRow.MCU],
            ["grid","32",inputRow.DSC1],
            ["grid","33",inputRow.DSC2],
            "4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Supplier CATNalogue entry successfully added',isGrid: true});
            });
        };
        self.selectRow = function(inputRow) {

            if (inputRow.EXTRACT) {
                var reqObj = _.buildAppstackJSON({
                    form: "W41061B",
                   // returnControlIDs: "1[97,24,34,20]",
                    aliasNaming: true,
                    type: "close"
                },"1.0","4");
            }
            else {

                var reqObj = _.buildAppstackJSON({
                    form: "W41061B",
                    returnControlIDs: "1[97,24,34,20]" 
                },"1.0","4");
            }

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P41061_W41061A")) {
                    if (globals.htmlInputs.length === 0) { 
                        globals.htmlInputs = data.fs_P41061_W41061A.data;
                        globals.titleList = globals.htmlInputs.gridData.titles;
                    }

                    if (inputRow.EXTRACT) {
                        var fieldObj = data.fs_P41061_W41061A.data;
                        $.each(fieldObj.gridData.rowset,function(key,object) {
                                if (fieldObj.gridData.rowset[key].hasOwnProperty("MOExist")) 
                                    delete fieldObj.gridData.rowset[key].MOExist;
                                if (fieldObj.gridData.rowset[key].hasOwnProperty("rowIndex")) 
                                    delete fieldObj.gridData.rowset[key].rowIndex;
                                
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
                    }
                    else { 
                        var rowToSelect;
                        var rowArr = globals.htmlInputs.gridData.rowset;

                        var ST2 = moment(inputRow.EFTJ,globals.simpleDateFormat); // effective date of Excel input
                        var END2 = moment(inputRow.EXDJ,globals.simpleDateFormat); // expire date of Excel input
                        var action = "add";
                        
                        

                        for (var i = 0; i < rowArr.length; i++) {
                            var matchCandidate = rowArr[i].mnQuantityBreak_97.internalValue.toString() === inputRow.QB &&
                                rowArr[i].sCurrCode_24.value === inputRow.CRCD &&
                                rowArr[i].sItemNumber_34.value === inputRow.LITM &&
                                rowArr[i].sUOM_20.value === inputRow.UOM;

                            if (matchCandidate) {
                                self.rowToSelect = i;
                                action = "update";
                                break;

                                /*!

                                // all fields match, now check the dates to determine action: update, expire or add
                                var ST1 = moment(rowArr[i].dtEffectiveFrom_22.value,globals.simpleDateFormat); // effective date of JDE row
                                var END1 = moment(rowArr[i].dtEffectiveThru_23.value,globals.simpleDateFormat); // expire date of JDE row

                                var startIsValid = moment(globals.simpleDateFormat).isBetween(ST1,END1,null,'[]');
                                var endIsValid = moment(globals.simpleDateFormat).isBetween(ST2,END2,null,'[]');
                                if (!inputRow.hasOwnProperty("dtEffectiveThru_23") && ST2.isSame(ST1)) { // accounts for the user leaving the effective to field blank (default)
                                    console.log("updates");
                                    self.rowToSelect = i;
                                    action = "update";
                                    break;
                                } else if ( ST2.isSame(ST1) && END2.isSame(END1) ) { // cache row for updating if the same date range is exactly the same
                                    console.log("updates");
                                    self.rowToSelect = i;
                                    action = "update";
                                    break;
                                } else if ( startIsValid && endIsValid ) {
                                    var startsEarlier = ST2.isSameOrBefore(ST1);
                                    // Instruction: expire
                                    // if "effective from" in jde is more than oneDayAgo, update "effective from" to twoDaysAgo
                                    if (startsEarlier) {
                                        console.log("expire special");
                                        self.rowToSelect = i;
                                        inputRow.EFTJ = globals.inputRow.EFTJ = globals.now;
                                        action = "expire special";
                                        break;
                                    } else {
                                        console.log("expire normal");
                                        self.rowToSelect = i;
                                        inputRow.EFTJ = globals.inputRow.EFTJ = globals.now;
                                        action = "expire";
                                        break;
                                    }
                                } // else "add", by default

                                */
                            }
                        }

                        if (action === "add") {
                            _.postSuccess("Adding new Supplier CATNalogue grid row");
                            self.addToGrid(inputRow);
                        } else if (action === "expire") {
                            _.postSuccess("Beginning grid row expiry");
                            self.expireBeforeAddUpdate(inputRow);
                        } else if (action === "expire special") {
                            _.postSuccess("Beginning special grid row expiry");
                            self.specialExpireBeforeAddUpdate(inputRow);
                        } else {
                            _.postSuccess("Updating the Supplier CATNalogue grid");
                            self.updateGrid(inputRow);
                        }
                    }
                } else {
                    _.postError("An unknown error occurred while entering the Supplier CATNalog Revisions form");
                    _.returnFromError();
                }
            });
        };
        self.expireBeforeAddUpdate = function(inputRow) {
            if (true) {}
            var reqObj = _.buildAppstackJSON({
                form: "W41061A",
                gridUpdate: true,
                customGrid: true,
                suppressDynamicGrid: true,
                rowToSelect: self.rowToSelect,
                turbo: true
            },["grid","22",globals.twoDaysAgo],["grid","23",globals.oneDayAgo],"4","4"); // update "effective to" to one day ago

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{
                    successMsg: "Grid row expired",
                    isGrid: true,
                    successCb: self.selectAfterExpiry
                },inputRow);
            });
        };
        self.specialExpireBeforeAddUpdate = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W41061A",
                gridUpdate: true,
                customGrid: true,
                suppressDynamicGrid: true,
                rowToSelect: self.rowToSelect,
                turbo: true
            },["grid","22",globals.twoDaysAgo],["grid","23",globals.oneDayAgo],"4","4"); // update "effective to" to one day ago and "effective from" to two days ago

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{
                    successMsg: "Grid row expired",
                    isGrid: true,
                    successCb: self.selectAfterExpiry
                },inputRow);
            });
        };
        self.selectAfterExpiry = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W41061B",
                turbo: true
            },"1.0","4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{
                    successMsg:'Adding grid row after expiring existing row',
                    isGrid: true,
                    successCb: self.addToGrid
                },inputRow);
            });
        };
        self.updateGrid = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W41061A",
                type: "close",
                gridUpdate: true,
                rowToSelect: self.rowToSelect,
                customGrid: true,
                suppressDynamicGrid: true,
                turbo: true
            },["grid","24",inputRow.CRCD],
            ["grid","21",inputRow.PRRC],
            ["grid","22",inputRow.EFTJ],
            ["grid","23",inputRow.EXDJ],"4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{
                    successMsg:'Supplier CATNalogue entry successfully updated',
                    isGrid: true
                });
            });
        };
    };
    return new Process();
});