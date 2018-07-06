// Item Cross Reference by Item
define(['aisclient'], function(_){
    var Process = function() {
        var self = this;
        self.reqFields = {
            titles: [{
                name: "DELETE"
            },{
                name: "LITM"
            }, {
                name: "ABCX"
            }, {
                name: "AN8"
            }, {
                name: "XRT"
            }, {
                name: "CITM"
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

			if (inputRow.EXTRACT)
			{

				if ( !inputRow.hasOwnProperty("LITM") ) {
					_.postError("Please ensure that the required LITM field is specified");
					_.returnFromError();
				}

			} else {

				if ( !inputRow.hasOwnProperty("CITM") || !inputRow.hasOwnProperty("LITM") ) {
					_.postError("Please ensure that these required fields are present: LITM and CITM");
					_.returnFromError();
				}

			}

            var reqObj = _.buildAppstackJSON({
                form: "P4104_W4104A",
                type: "open"
            },["1[19]",inputRow.LITM],["1[20]",inputRow.CITM],["1[18]",inputRow.AN8],["1[17]", inputRow.XRT],"16");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4104_W4104A")) {
                    var rowArr = data.fs_P4104_W4104A.data.gridData.rowset;
                    var errObj = data.fs_P4104_W4104A.errors;
					var noItem = (rowArr.length === 0);
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } 
					  else if (noItem && inputRow.EXTRACT) {
						_.postError("No record was found for extract.");
                        _.returnFromError();
					}
					  else if (noItem) {
                        self.getAddForm(inputRow);
                        _.postSuccess("Item Cross Reference not found, beginning ADD process");
                    } else if (inputRow.hasOwnProperty("DELETE") && inputRow.DELETE.toLowerCase().search("y") !== -1) {
                        _.postSuccess("Record found for deletion");
                        self.delete(inputRow);
                    } else {
                        self.selectRow(inputRow);
                        _.postSuccess("Item Cross Reference found");
                    }
                } else {
                    _.postError("An unknown error occurred in the find/browse form");
                    _.returnFromError();
                }
            });
        };
        self.delete = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W4104A"
            },"1.0","33");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Record successfully deleted'});
            });
        },
        self.selectRow = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W4104A"
            },"1.0","66");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4104_W4104C")) {
                    globals.htmlInputs = data.fs_P4104_W4104C.data
                    globals.titleList = data.fs_P4104_W4104C.data.gridData.titles;
                    var rowsetArr = data.fs_P4104_W4104C.data.gridData.rowset;
					
					if (inputRow.EXTRACT) {
						var fieldObj = data.fs_P4104_W4104C.data;
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
                        _.removeDuplicateRows($('#outputHolder table'));
						_.postSuccess("Extracting data");	
					} else {
						var rowToSelect = "add";

						for (var i = 0; i < rowsetArr.length; i++) {
							if (rowsetArr[i].sCrossReferenceItemNumber_20.value.toLowerCase() === inputRow.CITM.toLowerCase()) {
								rowToSelect = rowsetArr[i].rowIndex;
							};
						};
						if (rowToSelect === "add") {
							_.postSuccess("Adding Item Cross Reference");
							self.addToGrid(inputRow); 
						} else {
							_.postSuccess("Item Cross Reference Data Updating");
							self.updateGrid(inputRow,rowToSelect); 
						}
					}
                    
                } else {
                    _.postError("An unknown error occurred while entering the update form");
                    _.returnFromError();
                }
            });
        };
        self.getAddForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W4104A"
            },"6");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4104_W4104C")) {
                    var errObj = data.fs_P4104_W4104C.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        globals.htmlInputs = data.fs_P4104_W4104C.data
                        globals.titleList = data.fs_P4104_W4104C.data.gridData.titles;
                        _.postSuccess("Item Cross Reference Data Updating");
                        self.addToGrid(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred while entering the update form");
                    _.returnFromError();
                }
            });
        };
        self.addToGrid = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W4104C",
                type: "close",
                dynamic: true,
                gridAdd: true,
                customGrid: true,
                turbo: true
            },["10",inputRow.XRT],
            ["54",inputRow.LITM],
            ["grid","95",inputRow.AN8],
            ["grid","20",inputRow.CITM],"4");
            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Item Cross Reference successfully added',isGrid:true});
            });
        };
        self.updateGrid = function(inputRow,rowToSelect) {
            var reqObj = _.buildAppstackJSON({
                form: "W4104C",
                type: "close",
                dynamic: true,
                gridUpdate: true,
                customGrid: true,
                rowToSelect: rowToSelect,
                turbo: true
            },["grid","95",inputRow.AN8],"4");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Item Cross Reference successfully update',isGrid:true});
            });
        };

        
        
        
    };
    return new Process();
});