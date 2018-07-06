define(['aisclient'],function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "DCTO",
                id: 27,
            },{
                name: "ARTG",
                id: 29,
            }],
            isCustomTemplate: true
        };
    	self.closeObj = {
    		subForm: "W43008C",
    		closeID:"5"
    	};
        self.isExtract = false;
    	self.sysGenItemNum = "";
    	self.noItemNum = false;
    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

			inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);
			var reqObj = _.buildAppstackJSON({
				form: "P43008_W43008A",
				type: "open"
			},["1[6]",inputRow.DCTO],["1[7]",inputRow.ARTG],"20");

			_.getForm("appstack",reqObj).then(function(data){
				if (data.hasOwnProperty("fs_P43008_W43008A")) {
					var rowArr = data.fs_P43008_W43008A.data.gridData.rowset;
					var errObj = data.fs_P43008_W43008A.errors;
					var noItem = (rowArr.length === 0);
					if (errObj.length > 0) {
						_.getErrorMsgs(errObj);
						_.returnFromError();
					} else if (noItem && !inputRow.EXTRACT) {
						_.postSuccess("Adding Item");
						self.getAddForm(inputRow);
					} else if (rowArr.length === 1) {
						_.postSuccess("Item found");
						self.selectRow(inputRow);
					} else if (noItem && inputRow.EXTRACT) {
						_.postError("No item found. Please add the item before attempting to extract the data.");
						_.returnFromError();
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
            var optionsObj = {
                form: "W43008A"
            };

            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }

            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","4");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P43008_W43008C")) {
                    var errObj = data.fs_P43008_W43008C.errors;
					var fieldObj = data.fs_P43008_W43008C.data;
					var rowSet = fieldObj.gridData.rowset;

                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT) {
                        _.postSuccess("Extracting data");						
                        $.each(fieldObj.gridData.rowset,function(key,object) {
                                if (fieldObj.gridData.rowset[key].hasOwnProperty("MOExist")) 
                                    delete fieldObj.gridData.rowset[key].MOExist;
                                if (fieldObj.gridData.rowset[key].hasOwnProperty("rowIndex")) 
                                    delete fieldObj.gridData.rowset[key].rowIndex;
                            });

						_.appendTable(fieldObj, 0, true);
						_.removeDuplicateRows($('#outputHolder table'));
                    } else {   
                        _.postSuccess("Entering the Revisions form");
                        self.updateForm(inputRow, rowSet);
                    }
                } else {
                    _.postError("An unknown error occurred in the find/browse form");
                    _.returnFromError();
                }
            });
        };

        self.updateForm = function(inputRow, rowSet) {
			var optionsObj = {
                form: "W43008C"
            };

			var rowIndex = undefined;
			$.each(rowSet,function(key,object) {
				if (parseFloat(object.mnFromAmount_14.value) == parseFloat(inputRow.ALIM) && parseInt(object.mnPerson_50.value) == parseInt(inputRow.RPER))
				{
					rowIndex = key;
					return false;
				}
			});

			if (rowIndex === undefined) // not found, therefore we adding
			{
				optionsObj.gridAdd = true;
				optionsObj.customGrid = true;
				var reqObj = _.buildAppstackJSON(optionsObj, ["grid","14", inputRow.ALIM], ["grid","50", inputRow.RPER], ["grid","42", inputRow.ALPH], "4");
				_.getForm("appstack",reqObj).then(function(data){
					_.successOrFail(data, {successMsg: "Item Updated"});
				});

			} else {
				
				optionsObj.gridUpdate = true;
				optionsObj.customGrid = true;
				optionsObj.rowToSelect = rowIndex;

				var reqObj = _.buildAppstackJSON(optionsObj, ["grid","42", inputRow.ALPH], "4");
				if (inputRow.hasOwnProperty("ALIMNEW") && $.trim(inputRow.ALIMNEW) !== '' && inputRow.ALIM !== inputRow.ALIMNEW)
				{
					reqObj.actionRequest.formActions[0].gridAction.gridRowUpdateEvents[0].gridColumnEvents.push({
						"columnID": "14",
						"command": "SetGridCellValue",
						"value": _.filterBlank(inputRow.ALIMNEW)
					});
				}

				if (inputRow.hasOwnProperty("NEWRPER") && inputRow.NEWRPER !== '' && inputRow.RPER !== inputRow.NEWRPER)
				{
					reqObj.actionRequest.formActions[0].gridAction.gridRowUpdateEvents[0].gridColumnEvents.push({
						"columnID": "50",
						"command": "SetGridCellValue",
						"value": _.filterBlank(inputRow.NEWRPER)
					});				
				}

				_.getForm("appstack",reqObj).then(function(data){
					_.successOrFail(data, {successMsg: "Item Updated"});
				});
			}
        };
        self.getAddForm = function(inputRow) {
			var optionsObj = {
                form: "W43008A"
            };
			var reqObj = _.buildAppstackJSON(optionsObj,"19");
			_.getForm("appstack",reqObj).then(function(data){
				 if (data.hasOwnProperty("fs_P43008_W43008C")) {
					var errObj = data.fs_P43008_W43008C.errors;
					if (errObj.length > 0) {
						_.getErrorMsgs(errObj);
						_.returnFromError();
					} else {
                        self.addForm(inputRow);
                        _.postSuccess("Entering new Item data");
    	            }
				 } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }
			});
        };
        self.addForm = function(inputRow) {

			var reqObj = _.buildAppstackJSON({
                form: "W43008C",
                type: "execute",
                customGrid: true,
				gridAdd: true,
            },["29",inputRow.ARTG],
			  ["31",inputRow.DL01],
			  ["33",inputRow.AN8],
			  ["27",inputRow.DCTO],
			  ["grid","14", inputRow.ALIM],
			  ["grid","50", inputRow.RPER],
			  ["grid","42", inputRow.ALPH],
			  "4"
			);

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data, {successMsg: "Item added"});
            }); 
        };
    };
    return new Process();
});