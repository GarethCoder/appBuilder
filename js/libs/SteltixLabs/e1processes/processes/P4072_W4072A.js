define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                    name: "DL01"
                }, {
                    name: "LITM"
                }, {
                    name: "AST"
                }, {
                    name: "PRGP"
                }, {
                    name: "DMNQ"
                }, {
                    name: "UOM"
                }, {
                    name: "MCU"
                }, {
                    name: "BSCD"
                }, {
                    name: "FVTR"
                }, {
                    name: "PARTFG"
                }, {
                    name: "AN8"
                }, {
                    name: "CRCD"
                }, {
                    name: "EFTJ"
                }, {
                    name: "EXDJ"
                }, {
                    name: "SD2"
                }, {
                    name: "LEDG"
                }, {
                    name: "code_1"
                }, {
                    name: "code_2"
                }, {
                    name: "code_3"
                }
            ],
            isCustomTemplate: true
        };
        self.closeObj = {
            subForm: "W4072B",
            closeID: "5"
        };
        self.init = function () {
            var inputRow = globals.inputRow = globals.processQ[0];
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);
    		_.postSuccess("Processing row " + inputRow.ROW);

            var reqObj;
            // if (inputRow.hasOwnProperty("LITM")) {

            //     if (inputRow.hasOwnProperty("AN8")) {
            //         self.type = "1";
            //         reqObj = _.buildAppstackJSON({
            //             form: "P4072_W4072B",
            //             type: "open"
            //         },["86",inputRow.AST],["57",inputRow.LITM],["124",inputRow.AN8],"6");
            //     } else {
            //         self.type = "5";
            //         reqObj = _.buildAppstackJSON({
            //             form: "P4072_W4072B",
            //             type: "open"
            //         },["86",inputRow.AST],["57",inputRow.LITM],"6");
            //     }
            // } else if (inputRow.hasOwnProperty("PRGP")) {
            //     self.type = "2";
            //     reqObj = _.buildAppstackJSON({
            //         form: "P4072_W4072B",
            //         type: "open"
            //     },["86",inputRow.AST],["51",inputRow.PRGP],["1[150]",inputRow.SRP1],
            //       ["1[151]",inputRow.SRP2],["1[152]",inputRow.SRP3],"6");
            // } else if (inputRow.hasOwnProperty("AN8") && inputRow.hasOwnProperty("AST")) {
            //     self.type = "3";
            //     reqObj = _.buildAppstackJSON({
            //         form: "P4072_W4072B",
            //         type: "open"
            //     },["86",inputRow.AST],["124",inputRow.AN8],"6");
            // } else {
            //     self.type = "4";
            //     reqObj = _.buildAppstackJSON({
            //         form: "P4072_W4072B",
            //         type: "open"
            //     },["86",inputRow.AST],"6");
            // }

            var arrayKeys = ["LITM", "AN8", "PRGP"];
            for (var i=0;i<arrayKeys.length;i++) {
                if (!inputRow.hasOwnProperty(arrayKeys[i])) {
                    inputRow[arrayKeys[i]] = "";
                }
            }

            if (inputRow.EXTRACT) { // in case of multiple records, we search on  Factor Value as well for uniqueness

                reqObj = _.buildAppstackJSON({
                    form: "P4072_W4072B",
                    type: "open"
                },["86",inputRow.AST],["51",inputRow.PRGP],["55",inputRow.CPGP],["1[150]",inputRow.SRP1],
                ["1[151]",inputRow.SRP2],["1[152]",inputRow.SRP3],["124",inputRow.AN8],["57",inputRow.LITM],["1[37]", inputRow.FVTR], "6");

            } else {
                reqObj = _.buildAppstackJSON({
                    form: "P4072_W4072B",
                    type: "open"
                },["86",inputRow.AST],["51",inputRow.PRGP],["55",inputRow.CPGP],["1[150]",inputRow.SRP1],
                ["1[151]",inputRow.SRP2],["1[152]",inputRow.SRP3],["124",inputRow.AN8],["57",inputRow.LITM], "6");
            }

        	_.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4072_W4072B")) {
                    var rowArr = data.fs_P4072_W4072B.data.gridData.rowset;
                    var errObj = data.fs_P4072_W4072B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0 && !inputRow.EXTRACT) {                        
                            self.getAddForm(inputRow);
                            _.postSuccess("Adding Price Adjustment");
                    } else if (rowArr.length >= 1) {       

                        if (inputRow.EXTRACT) {
                            if (rowArr.length == 1) {
                                self.selectRow(inputRow, 0);
                                _.postSuccess("Price Adjustment found");
                            } else {
                                for (i=1;i<rowArr.length;i++)
                                {
                                    var inputRowCopy = JSON.parse(JSON.stringify(inputRow));                                   

                                    inputRowCopy.LITM = rowArr[i].s2ndItemNumber_72.value || '';
                                    inputRowCopy.PRGP = rowArr[i].sItemGroup_38.value || '';
                                    inputRowCopy.AN8 = rowArr[i].mnAddressNumber_7.value ||'';
                                    inputRowCopy.CPGP = rowArr[i].sCustomerGroup_43.value || '';
                                    inputRowCopy.FVTR = rowArr[i].mnFactorValueNumeric_37.value || '';

                                    for (var key in inputRowCopy) {
                                        if (inputRowCopy[key] === "")
                                            delete inputRowCopy[key];
                                    }
                                    globals.processQ.push(inputRowCopy);
                                }
                                _.postSuccess("Records found");
                                self.selectRow(inputRow, 0);
                            }

                        } else {

                            // loop until you find the right record
                            var selRow = -1;
                            $.each(rowArr, function (index, object){

                                if (!object.hasOwnProperty("sItemGroup_38")) {
                                    object["sItemGroup_38"] = {};
                                    object["sItemGroup_38"].value = inputRow.PRGP;
                                }

                                if (!object.hasOwnProperty("s2ndItemNumber_72")) {
                                    object["s2ndItemNumber_72"] = {};
                                    object["s2ndItemNumber_72"].value = inputRow.LITM;
                                }

                                if (!object.hasOwnProperty("mnAddressNumber_7")) {
                                    object["mnAddressNumber_7"] = {};
                                    object["mnAddressNumber_7"].value = inputRow.AN8;
                                } else {
                                    if (inputRow.AN8 === "" && object.mnAddressNumber_7.value === "0")
                                        inputRow.AN8 = "0";
                                }

                                if ((object.mnAddressNumber_7.value === inputRow.AN8) && (object.sItemGroup_38.value === inputRow.PRGP) && 
                                    (object.s2ndItemNumber_72.value === inputRow.LITM)) {
                                    selRow = index;
                                    return false;
                                }

                                // if ((object.mnShortItemNo_9.value === "" || object.mnShortItemNo_9.value ==="0") &&
                                //     (object.mnAddressNumber_7.value === inputRow.AN8) && (object.sItemGroup_38.value === "")) {
                                //         selRow = index;
                                //         return false;
                                //     }     
                                
                                
                            });

                            if (selRow > -1) {
                                self.selectRow(inputRow, selRow);
                                _.postSuccess("Price Adjustment found");
                            } else {
                                self.getAddForm(inputRow);
                                _.postSuccess("Adding Price Adjustment");
                            } 
                        }
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
        self.selectRow = function (inputRow, rowIndex) {

            var reqObj = _.buildAppstackJSON({
                form: "W4072B",
            }, "1."+rowIndex, "4");

            if (inputRow.EXTRACT) 
                reqObj.aliasnaming = true;
    
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4072_W4072A")) {
                    var errObj = data.fs_P4072_W4072A.errors;
                    var fieldObj = data.fs_P4072_W4072A.data;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (inputRow.EXTRACT) {       
                                         
                            $.each(fieldObj.gridData.rowset,function(key,object) {
                                    if (fieldObj.gridData.rowset[key].hasOwnProperty("MOExist")) 
                                        delete fieldObj.gridData.rowset[key].MOExist;
                                    if (fieldObj.gridData.rowset[key].hasOwnProperty("rowIndex")) 
                                        delete fieldObj.gridData.rowset[key].rowIndex;   
                                });
    
                                // console.log(JSON.stringify(Object.keys(fieldObj.gridData.rowset[0])));        

                            _.appendTable(fieldObj, 0, true);
                            _.removeDuplicateRows($('#outputHolder table'));
                            _.postSuccess("Extracting data");	
                        } else {
                            var rowArr = fieldObj.gridData.rowset;
                            var fromLevelFound = false;
                            var effectiveDateFound = false;
                            // dtEffectiveDate_10
                            // mnFromLevel_218
                            rowToSelect = -1;

                            

                            if (!inputRow.hasOwnProperty("DMNQ"))
                                inputRow.DMNQ = parseFloat("0");

                            $.each(fieldObj.gridData.rowset,function(key,object) {
                                                                
                                if (parseFloat(object.mnFromLevel_218.value) == inputRow.DMNQ) 
                                    fromLevelFound = true;

                                // are we worried about effective date i.e. new one specified? if not, don't worry about this
                                if (inputRow.hasOwnProperty('NEWEFTJ') && inputRow.EFTJ === object.dtEffectiveDate_10.value) {
                                    effectiveDateFound = true;
                                    rowToSelect = key;
                                } else 
                                    effectiveDateFound = true;

                                if (fromLevelFound && effectiveDateFound) {
                                    rowToSelect = key;
                                    return false;
                                }
                            });

                            if (rowToSelect > -1) {
                                _.postSuccess("Entering UPDATE form");
                                self.updateForm(inputRow, rowToSelect);
                            } else {
                                self.addForm(inputRow);
                            }
                        }
                    }
                } else {
                    _.postError("An unknown error occurred while entering the UPDATE form");
                    _.returnFromError();
                }
            });
        };
        self.updateForm = function(inputRow, rowIndex) {

            if (inputRow.hasOwnProperty('NEWEFTJ')) 
                inputRow.EFTJ = inputRow.NEWEFTJ;

            if (inputRow.hasOwnProperty('NEWDMNQ')) 
                inputRow.DMNQ = inputRow.NEWDMNQ;
            
            var reqObj = _.buildAppstackJSON({
                form: "W4072A",
                type: "close",
                gridUpdate: true,
                customGrid: true,
                rowToSelect: rowIndex
            },
            ["grid","218",inputRow.DMNQ],
            ["grid","7",inputRow.UOM],
            ["grid","281",inputRow.MCU],
            ["grid","11",inputRow.BSCD],
            ["grid","14",inputRow.FVTR], //["grid","14",inputRow.FVTR.replace(/\b0+/g, '')],
            ["grid","432",inputRow.PARTFG],
            ["grid","173",inputRow.AN8],
            ["grid","6",inputRow.CRCD],
            ["grid","10",inputRow.EFTJ],
            ["grid","9",inputRow.EXDJ],
            ["grid","280",inputRow.SD2],
            ["grid","248",inputRow.code_1],
            ["grid","249",inputRow.code_2],
            ["grid","250",inputRow.code_3],
            ["grid","12",inputRow.LEDG],
            "4","4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Price Adjustment successfully updated',isGrid:true});
            });

        };
        self.getAddForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W4072B"
            },"67");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4072_W4072A")) {
                    var errObj = data.fs_P4072_W4072A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Entering ADD form");
                        self.addForm(inputRow);
                    }
                } else if (data.hasOwnProperty("fs_P40073_W40073F")) {
                    var errObj = data.fs_P40073_W40073F.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Selecting Preference Heirarchy");
                        self.selectHeirarchy(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }
            });
        };
        self.selectHeirarchy = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W40073F"
            },"1." + inputRow.DL01,"4");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4072_W4072A")) {
                    var errObj = data.fs_P4072_W4072A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Adding new Price Adjustment");
                        self.addForm(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while selecting the Preference Heirarchy");
                    _.returnFromError();
                }
            });
        };
    	self.addForm = function(inputRow) {
        	var reqObj = _.buildAppstackJSON({
                form: "W4072A",
                type: "close",
                gridAdd: true,
                customGrid: true
            },["59",inputRow.LITM],
            ["55",inputRow.PRGP],
            ["53",inputRow.CPGP],
            ["grid","218",inputRow.DMNQ],
            ["grid","7",inputRow.UOM],
            ["grid","281",inputRow.MCU],
            ["grid","11",inputRow.BSCD],
            ["grid","14",inputRow.FVTR], //["grid","14",inputRow.FVTR.replace(/\b0+/g, '')],
            ["grid","432",inputRow.PARTFG],
            ["grid","173",inputRow.AN8],
            ["grid","6",inputRow.CRCD],
            ["grid","10",inputRow.EFTJ],
            ["grid","9",inputRow.EXDJ],
            ["grid","280",inputRow.SD2],
            ["grid","248",inputRow.code_1],
            ["grid","249",inputRow.code_2],
            ["grid","250",inputRow.code_3],
            ["grid","12",inputRow.LEDG],
            "4","4");

            _.getForm("appstack",reqObj).then(function(data){
            	_.successOrFail(data,{successMsg:'Price Adjustment successfully added',isGrid:true});
        	});
    	}
    };
    return new Process();
});