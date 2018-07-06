define(['aisclient'], function(_){
    var Process = function () {
        debugger;
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "AN8",
                "id": "1[19]"
            },{
                "name": "AT1",
                "id": 54
            }, {
                "name": "ALPH",
                "id": 61
            }, {
                "name": "AR1",
                "id": 28
            }, {
                "name": "PH1",
                "id": 29
            }, {
                "name": "PHTP",
                "id": 27
            }],
            isCustomTemplate: true
        };
        self.closeObj = {
            subForm: "W0111A",
            closeID: "5"
        };
        self.ETP = "";
        self.ETP_LIST = "";
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
                    } 
					  else if (inputRow.EXTRACT && rowArr.length === 0) {
					    _.postError("Address Book record does not exist, therefore could not be extracted.");
                        _.returnFromError();
					  }
					  else if (rowArr.length === 0) {
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
            var reqObj = _.buildAppstackJSON({
                form: "W0111A"
            },"1.0","145");

			if (inputRow.EXTRACT)
				reqObj.aliasNaming = true;

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P0115_W0115A")) {
                    if (typeof(globals.titleList) === 'undefined' || globals.titleList.length === 0) {
                        globals.titleList = data.fs_P0115_W0115A.data.gridData.titles;
                    }
                    var rowToSelect = "add";
                    var currentArr = data.fs_P0115_W0115A.data.gridData.rowset;
					if (inputRow.EXTRACT)
					{
						var fieldObj = data.fs_P0115_W0115A.data;
						if (currentArr.length > 0)
						{
							$.each(fieldObj.gridData.rowset,function(key,object) {
								if (fieldObj.gridData.rowset[key].hasOwnProperty("MOExist")) 
									delete fieldObj.gridData.rowset[key].MOExist;
								if (fieldObj.gridData.rowset[key].hasOwnProperty("rowIndex")) 
									delete fieldObj.gridData.rowset[key].rowIndex;
							});
						}

						// jippoing the system to think the label is a text box for extract field
						fieldObj.z_DL01_71.internalValue = fieldObj.z_DL01_71.value;

						_.appendTable(fieldObj, 0, true);
						_.postSuccess("Extracting data");	

					} else {

						// if a line number specified, we assume update
						if ($.trim(inputRow.RCK7) !== '') // is this an update attempt
						{
							for (var i = 0; i < currentArr.length; i++) {
								if (currentArr[i].mnLineNumber_26.value === inputRow.RCK7)
								{
									rowToSelect = i;
									break;
								}

							}
						}

						if (rowToSelect !== "add") { // UPDATE
							_.postSuccess("Email/Internet information updating");
							self.updateGrid(inputRow,rowToSelect);
						} else { // ADD
							_.postSuccess("Adding Email/Internet information");
							self.addToGrid(inputRow);
						}

					}
                } else {
                    _.postError("An unknown error occurred while entering the Phone's form");
                    _.returnFromError();
                }
                
            });
        };
        self.addToGrid = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W0115A",
                type: "close",
                gridAdd: true,
                customGrid: true,
                suppressCustomGrid: true
            },["grid","28",inputRow.AR1],["grid","29",inputRow.PH1],["grid","27",inputRow.PHTP],"4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{
                    successMsg:"Phone Who's Who record successfully added",
                    isGrid:true
                });
            });
        };
        self.updateGrid = function(inputRow,rowToSelect) {
            var reqObj = _.buildAppstackJSON({
                form: "W0115A",
                type: "close",
                rowToSelect: rowToSelect,
                gridUpdate: true,
                customGrid: true,
                suppressCustomGrid: true
            },["grid","28",inputRow.AR1],["grid","29",inputRow.PH1],["grid","27",inputRow.PHTP],"4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{
                    successMsg:"Phone Who's Who record successfully updated",
                    isGrid:true
                });
            });
        }
    };
    return new Process();
});