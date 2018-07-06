// Item Cross Reference by Address (upABCX only)
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "LITM"
            }, {
                name: "AN8"
            }, {
                name: "XRT"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W4104A",
            closeID: "5"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];			
            _.postSuccess("Processing row " + inputRow.ROW);
			inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            var reqObj = _.buildAppstackJSON({
                form: "P4104_W4104A",
                type: "open"
            },["1[19]",inputRow.LITM],["1[17]", inputRow.XRT],["1[18]",inputRow.AN8],"16");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4104_W4104A")) {
                    var rowArr = data.fs_P4104_W4104A.data.gridData.rowset;
                    var errObj = data.fs_P4104_W4104A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        self.getAddForm(inputRow);
                        _.postSuccess("ADD function not available. Please use Item Cross Reference by Item (P4104_W4104C) to add item cross references");
                    } else if (rowArr.length === 1) {
                        self.selectRow(inputRow);
                        _.postSuccess("Item Cross Reference found");
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
                form: "W4104A"
            },"1.0","67");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4104_W4104B")) {
                    globals.htmlInputs = data.fs_P4104_W4104B.data
                    globals.titleList = data.fs_P4104_W4104B.data.gridData.titles;
                    var rowsetArr = data.fs_P4104_W4104B.data.gridData.rowset;

					if (inputRow.EXTRACT)
					{
						var fieldObj = data.fs_P4104_W4104B.data;
						if (rowsetArr.length > 0)
						{
							$.each(fieldObj.gridData.rowset,function(key,object) {
								if (fieldObj.gridData.rowset[key].hasOwnProperty("MOExist")) 
									delete fieldObj.gridData.rowset[key].MOExist;
								if (fieldObj.gridData.rowset[key].hasOwnProperty("rowIndex")) 
									delete fieldObj.gridData.rowset[key].rowIndex;
							});
						}

						_.appendTable(fieldObj, 0, true);
						_.postSuccess("Extracting data");	
					} else {
						var rowToSelect = "add";

						for (var i = 0; i < rowsetArr.length; i++) {
							if (rowsetArr[i].sItemNumber_49.value === inputRow.LITM) { // if Item Number AND Cross Reference Item Number are equal
								rowToSelect = rowsetArr[i].rowIndex;
							};
						};
						_.postSuccess("Item Cross Reference Data Updating");
						self.updateGrid(inputRow,rowToSelect);
					}
                } else {
                    _.postError("An unknown error occurred while entering the Update form");
                    _.returnFromError();
                }
            });
        };
        self.getAddForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W4104A"
            },"6");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4104_W4104B")) {
                    var errObj = data.fs_P4104_W4104B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        globals.htmlInputs = data.fs_P4104_W4104B.data
                        globals.titleList = data.fs_P4104_W4104B.data.gridData.titles;
                        _.postSuccess("Item Cross Reference Data Updating");
                        self.updateGrid(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while entering the Update form");
                    _.returnFromError();
                }
            });
        };
        self.addToGrid = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W4104B",
                type: "close",
                dynamic: true,
                gridAdd: true,
                customGrid: true,
                turbo: true
            },["10",inputRow.XRT],["54",inputRow.LITM],"4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Item Cross Reference successfully added',isGrid:true});
            });
        };
        self.updateGrid = function(inputRow,rowToSelect) {
            var reqObj = _.buildAppstackJSON({
                form: "W4104B",
                type: "close",
                dynamic: true,
                gridUpdate: true,
                customGrid: true,
                rowToSelect: rowToSelect,
                turbo: true
            },["10",inputRow.XRT],["grid","95",inputRow.AN8],"4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Item Cross Reference successfully update',isGrid:true});
            });
        }
    };
    return new Process();
});