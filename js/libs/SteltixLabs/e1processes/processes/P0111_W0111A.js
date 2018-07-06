// NOTE: AIS must receive the dropdown INDEX. The user inputs the DESCRIPTION (value property)
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "AN8"
            }, {
                "name": "AT1"
            }, {
                "name": "ALPH"
            }, {
                "name": "MLNM"
            }, {
                "name": "NICK"
            }, {
                "name": "ATTL"
            }, {
                "name": "REM1"
            }, {
                "name": "SLNM"
            }, {
                "name": "GNNM"
            }, {
                "name": "MDNM"
            }, {
                "name": "SRNM"
            }, {
                "name": "DSS5"
            }, {
                "name": "TYC"
            }, {
                "name": "FUCO"
            }, {
                "name": "PCM"
            }, {
                "name": "NTYP"
            }, {
                "name": "PCF"
            }, {
                "name": "DDATE"
            }, {
                "name": "DMON"
            }, {
                "name": "DYR"
            }, {
                "name": "GEND"
            }],
            isCustomTemplate: true
        };
        self.closeObj = {
            subForm: "W0111A",
            closeID: "5"
        };
        self.TYC = "0"; // cache the AIS values
        self.FUCO = "0";
        self.PCM = "0";
        self.NTYP = "0";
        self.TYC_LIST = [];
        self.FUCO_LIST = [];
        self.PCM_LIST = [];
        self.NTYP_LIST = [];
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

			var optionsObj = {
				form: "W01012B"
			};

			if (inputRow.EXTRACT) {
				optionsObj.aliasNaming = true;
			}

			var reqObj = _.buildAppstackJSON(optionsObj, "1.0", "67");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P0111_W0111A")) {

					if (inputRow.EXTRACT) {
						var fieldObj = data.fs_P0111_W0111A.data;
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

						// cache dropdown lists
						window.currentObj = data.fs_P0111_W0111A.data.gridData.rowset[0];
						self.TYC_LIST = currentObj.chTypeCode_17.list;
						self.FUCO_LIST = currentObj.sFunctionCode_88.list;
						self.PCM_LIST = currentObj.sPreferredContactMethod_89.list;
						self.NTYP_LIST = currentObj.sContactType_87.list;

						_.postSuccess("Entering Who's Who form");
						self.queryForm(inputRow);

					}
                } else {
                    _.postError("An unknown error occurred while entering the Who's Who form");
                    _.returnFromError();
                }
            });
        };
        // query who's who form
        // if no results, ADD, else UPDATE
        self.queryForm = function(inputRow) {
            var escALPH = inputRow.ALPH.replace(/\*/g,"_") + "*";
            var reqObj = _.buildAppstackJSON({
                form: "W0111A"
            },["1[61]",escALPH],"74");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.fs_P0111_W0111A.data.gridData.rowset.length > 0) { // UPDATE
                    window.currentObj = data.fs_P0111_W0111A.data.gridData.rowset[0];
                    // for both ADD and UPDATE, cache AIS vals. Use AIS vals to build JSON
                    self.TYC = convertDropdownVals(inputRow.TYC,self.TYC_LIST) || convertDropdownVals(currentObj.chTypeCode_17.value,self.TYC_LIST); // uses input, unless it's not valid, then it defaults to what was received from AIS (transformed to return index)
                    self.FUCO = convertDropdownVals(inputRow.FUCO,self.FUCO_LIST) || convertDropdownVals(currentObj.sFunctionCode_88.value,self.FUCO_LIST);
                    self.PCM = convertDropdownVals(inputRow.PCM,self.PCM_LIST) || convertDropdownVals(currentObj.sPreferredContactMethod_89.value,self.PCM_LIST);
                    self.NTYP = convertDropdownVals(inputRow.NTYP,self.NTYP_LIST) || convertDropdownVals(currentObj.sContactType_87.value,self.NTYP_LIST);
                    // how to determine whether input is valid? NOT BLANK. convertDropdownVals must return false if no match

                    // if no vals then...
                    _.postSuccess("Updating Who's Who record");
                    self.updateGrid(inputRow);
                } else { // ADD

                    self.TYC = convertDropdownVals(inputRow.TYC,self.TYC_LIST) || convertDropdownVals(currentObj.chTypeCode_17.value,self.TYC_LIST); // uses input, unless it's not valid, then it defaults to what was received from AIS (transformed to return index)
                    self.FUCO = convertDropdownVals(inputRow.FUCO,self.FUCO_LIST) || convertDropdownVals(currentObj.sFunctionCode_88.value,self.FUCO_LIST);
                    self.PCM = convertDropdownVals(inputRow.PCM,self.PCM_LIST) || convertDropdownVals(currentObj.sPreferredContactMethod_89.value,self.PCM_LIST);
                    self.NTYP = convertDropdownVals(inputRow.NTYP,self.NTYP_LIST) || convertDropdownVals(currentObj.sContactType_87.value,self.NTYP_LIST);
                    // how to determine whether input is valid? NOT BLANK. convertDropdownVals must return false if no match

                    _.postSuccess("Adding Who's Who record");
                    self.addToGrid(inputRow);
                }
            });
        };
        self.addToGrid = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W0111A",
                type: "close",
                gridAdd: true,
                customGrid: true,
                suppressDynamicGrid: true
            },["grid","61",inputRow.ALPH],
            ["grid","6",inputRow.MLNM],
            ["grid","108",inputRow.NICK],
            ["grid","9",inputRow.ATTL],
            ["grid","16",inputRow.REM1],
            ["grid","13",inputRow.SLNM],
            ["grid","10",inputRow.GNNM],
            ["grid","11",inputRow.MDNM],
            ["grid","12",inputRow.SRNM],
            ["grid","71",inputRow.DSS5],
            ["grid","17",self.TYC],
            ["grid","88",self.FUCO],
            ["grid","89",self.PCM],
            ["grid","87",self.NTYP],
            ["grid","90",inputRow.PCF],
            ["grid","105",inputRow.DDATE],
            ["grid","104",inputRow.DMON],
            ["grid","106",inputRow.DYR],
            ["grid","142",inputRow.GEND],"4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:"Who's Who record successfully added",isGrid:true});
            });
        };
        self.updateGrid = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W0111A",
                type: "close",
                gridUpdate: true,
                customGrid: true,
                suppressDynamicGrid: true
            },["grid","61",inputRow.ALPH],
            ["grid","6",inputRow.MLNM],
            ["grid","108",inputRow.NICK],
            ["grid","9",inputRow.ATTL],
            ["grid","16",inputRow.REM1],
            ["grid","13",inputRow.SLNM],
            ["grid","10",inputRow.GNNM],
            ["grid","11",inputRow.MDNM],
            ["grid","12",inputRow.SRNM],
            ["grid","71",inputRow.DSS5],
            ["grid","17",self.TYC],
            ["grid","88",self.FUCO],
            ["grid","89",self.PCM],
            ["grid","87",self.NTYP],
            ["grid","90",inputRow.PCF],
            ["grid","105",inputRow.DDATE],
            ["grid","104",inputRow.DMON],
            ["grid","106",inputRow.DYR],
            ["grid","142",inputRow.GEND],"4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:"Who's Who record successfully update",isGrid:true});
            });
        };
    };
    return new Process();
});