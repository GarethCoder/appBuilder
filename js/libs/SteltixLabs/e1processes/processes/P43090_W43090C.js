define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "MCU"
            }, {
                "name": "AN8"
            }, {
                "name": "LITM"
            }, {
                "name": "CRCD"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W43090A",
            closeID: "5"
        };
        self.rowsToExpire = [];
        self.rowToEdit = null;
    	self.init = function(){
            var inputRow = globals.inputRow = globals.processQ[0];
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);
    		_.postSuccess("Processing row " + inputRow.ROW);

            self.rowsToExpire = [];

            var reqObj = _.buildAppstackJSON({
                form: "P43090_W43090A",
                type: "open"
            },["21",inputRow.MCU],["1[6]",inputRow.AN8],["1[7]",inputRow.LITM],"25");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P43090_W43090A")) {
                    var rowArr = data.fs_P43090_W43090A.data.gridData.rowset;
                    var errObj = data.fs_P43090_W43090A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0 && !inputRow.EXTRACT) {
                        self.getAddForm(inputRow);
                        _.postSuccess("Adding AN8/Item Prices");
                    } else if (rowArr.length === 1) {
                        self.selectRow(inputRow);
                        _.postSuccess("AN8/Item Prices found");
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
    	self.selectRow = function(inputRow) {
    		var reqObj = _.buildAppstackJSON({
                form: "W43090A"
            },"1.0","39");

            if (inputRow.EXTRACT) {
                reqObj.aliasNaming = true;
            }

    		_.getForm("appstack",reqObj).then(function(data){
    		    if (data.hasOwnProperty("fs_P43090_W43090C")) {
                    var errObj = data.fs_P43090_W43090C.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        globals.htmlInputs = data.fs_P43090_W43090C.data;
                        var row = data.fs_P43090_W43090C.data.gridData.rowset;
                        var fieldObj = data.fs_P43090_W43090C.data;

                        if (inputRow.EXTRACT) {

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
                        
                            });
                        
                            _.appendTable(fieldObj, 0, true);
                            _.postSuccess("Extracting data");
                        
                        } else {                     

                            // Logic to compare dates and determine whether to ADD, UPDATE or EXPIRE the row
                            var ST2 = moment(inputRow["grid__Effect From__EFTJ__18"],globals.simpleDateFormat);
                            var END2 = moment(inputRow["grid__Effect Thru__EXDJ__19"],globals.simpleDateFormat);
                            var action = "add";

                            var compDate = inputRow["grid__Effect From__EFTJ__18"];
                            if (inputRow.hasOwnProperty("NEWEFTJ") && $.trim(inputRow.NEWEFTJ) !== "") {
                                inputRow["grid__Effect From__EFTJ__18"] = inputRow.NEWEFTJ;
                            } 
                            // else {
 
                                for (var i = 0; i < row.length; i++) {
                                    var numChars = 0;
                                    if (!inputRow.hasOwnProperty("grid__Quantity Break__UORG__17"))
                                        inputRow["grid__Quantity Break__UORG__17"] = "0";

                                    if (inputRow.hasOwnProperty("grid__Quantity Break__UORG__17"))
                                        numChars = inputRow["grid__Quantity Break__UORG__17"].length;                            

                                    var inputCat;
                                    try {
                                        inputCat = inputRow["grid__Catalog__CATN__20"].toLowerCase() || "";
                                    } catch(err) {
                                        inputCat = "";
                                    }

                                    var matchCandidate = inputRow["CRCD"].toLowerCase() === row[i]["sCurCod_14"].value.toLowerCase() &&
                                                          inputRow["grid__Quantity Break__UORG__17"] &&
                                                        inputRow["grid__Quantity Break__UORG__17"] === row[i]["mnQuantityBreak_17"].value.substr(0,numChars) &&
                                                        inputCat === row[i]["sCatalog_20"].value.toLowerCase() && 
                                                        compDate === row[i]['dtEffectFrom_18'].value;
                                                
                                    // if Currency and Quantity Break match, check dates.
                                    
                                    if ( matchCandidate ) {
                                        self.rowToEdit = i;

                                        if (inputRow.hasOwnProperty("NEWUORG")) // check if we are replacing the Quantity Break amount  
                                            inputRow["grid__Quantity Break__UORG__17"] = inputRow.NEWUORG; 
                                            
                                        action = "update";
                                        break;


                                        /*
                                        var ST1 = moment(row[i].dtEffectFrom_18.value,globals.simpleDateFormat);
                                        var END1 = moment(row[i].dtEffectThru_19.value,globals.simpleDateFormat);
                                        
                                        if ( ST2.isSame(ST1) && END2.isSame(END1) ) { // cache row for updating if the same date range is exactly the same
                                            console.log("updates");
                                            self.rowToEdit = i;
                                            action = "update";
                                            break;
                                        } else if ( moment({}).isBetween(ST1,END1) && moment({}).isBetween(ST2,END2) ) {
                                            // Instruction: expire
                                            self.rowToEdit = i;
                                            inputRow["grid_Effect-From_18"] = globals.inputRow["grid_Effect-From_18"] = globals.now;  // make the new input effective from today
                                            action = "expire";
                                            break;
                                        } // else "add", by default
                                        */
                                    }
                                }

                            //}

                            if (action === "add") {
                                _.postSuccess("Adding new AN8/Item Prices grid row");
                                self.addForm(inputRow);
                            } else if (action === "expire") {
                                _.postSuccess("Beginning grid row expiry");
                                self.expireBeforeAddUpdate(inputRow);
                            } else {
                                _.postSuccess("Updating the AN8/Item Prices grid");
                                self.updateForm(inputRow);
                            }
                        }
                    }
                } else if (data.hasOwnProperty("fs_P43090_W43090A")) {
                    var errObj = data.fs_P43090_W43090A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postError("There was a problem entering the AN8/Item Prices form");
                        _.returnFromError();
                    }
                } else {
                    _.postError("An unknown error occurred entering the AN8/Item Prices form");
                    _.returnFromError();
                }
    		});
    	};
        self.expireBeforeAddUpdate = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W43090C",
                gridUpdate: true,
                customGrid: true,
                suppressDynamicGrid: true,
                rowToSelect: self.rowToEdit
            },["grid","19",globals.oneDayAgo],"4","4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{
                    successMsg: "Grid row expired",
                    grid: true,
                    successCb: self.selectAfterExpiry
                },inputRow);
            });
        };
        self.selectAfterExpiry = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W43090A"
            },"1.0","39");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{
                    successMsg:'Adding grid row after expiring existing row',
                    grid: true,
                    successCb: self.addForm
                },inputRow);
            });
        };
        self.addForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W43090C",
                type: "close",
                gridAdd: true,
                customGrid: true
            },["grid","14",inputRow.CRCD],"4","4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{
                    successMsg: "AN8/Item Prices record added",
                    isGrid: true
                });
            });
        };
    	self.updateForm = function(inputRow,rowToSelect) {
    		var reqObj = _.buildAppstackJSON({
                form: "W43090C",
                // type: "close",
                rowToSelect: rowToSelect,
                gridUpdate: true
            },"4","4");

    		_.getForm("appstack",reqObj).then(function(data){

                if (data === "500")
                {
                    _.postError("System error found. Possible issue: Duplicate key not allowed. Please correct the duplicate key field.");
                     _.returnFromError();
                } else {
                    _.successOrFail(data,{
                        successMsg: "AN8/Item Prices record updated",
                        isGrid: true
                    });
                }
            });
    	};
    };
    return new Process();
});