define(['aisclient'], function(_){
	var Process = function(){
		var self = this;
        self.reqFields = {
            titles: [{
		        "name": "LITM"
		    }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W4101E",
            closeID: "5"
        };
		self.init = function() {
			var inputRow = globals.inputRow = globals.processQ[0];
			_.postSuccess("Processing row " + inputRow.ROW);
			inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

	        var reqObj = _.buildAppstackJSON({
	        	form: "P4101_W4101E",
                type: "open"
                }, ["1[123]", inputRow.LITM],"22");

	        _.getForm("appstack",reqObj).then(function(data){
	            if (data.hasOwnProperty("fs_P4101_W4101E")) {
	                var rowArr = data.fs_P4101_W4101E.data.gridData.rowset;
	                var errObj = data.fs_P4101_W4101E.errors;
	                if (errObj.length > 0) {
	                    _.getErrorMsgs(errObj);
	                    _.returnFromError();
	                } else if (rowArr.length === 0) {
	                    _.postError("No record found with item number: "+inputRow.LITM);
	                    _.returnFromError();
	                } else if (rowArr.length == 1) {
	                    self.selectRow(inputRow);
	                    _.postSuccess("Item number ("+inputRow.LITM+") found.");
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
				form: "W4101E"
			}, "1.0","77");
			
			if (inputRow.EXTRACT) {
				reqObj.aliasNaming = true;
              //  reqObj.type = "close";
			}
            
			_.getForm("appstack",reqObj).then(function(data){
			    if (data.hasOwnProperty("fs_P41016W_W41016WA")) {
			    	var errObj = data.fs_P41016W_W41016WA.errors;
			    	if (errObj.length > 0) {
			    	    _.getErrorMsgs(errObj);
			    	    _.returnFromError();
			    	} else {
						var rowArr = data.fs_P41016W_W41016WA.data.gridData.rowset;
						if (inputRow.EXTRACT) {
							if (rowArr.length > 0) {
                                var fieldObj = data.fs_P41016W_W41016WA.data;
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
                                _.postError("No records found. Please add the item before attempting to extract the data.");
                                _.returnFromError();
                            }
						} else {
						
							
							var rowToSelect = "add";

							for (var i = 0; i < rowArr.length; i++) {
								if (inputRow.LNGP.toLowerCase() === rowArr[i]["sLanguagePreference_10"].value.toLowerCase()) {
									rowToSelect = i;
									break;
								}
							}

							if (rowToSelect === "add") {
								_.postSuccess("Adding grid row");
								self.addToGrid(inputRow);
								//_.returnFromSuccess();
							} else {
								_.postSuccess("Updating grid row");
								self.updateGrid(inputRow,rowToSelect);
								
							}
						}
			    	}
			    } else {
			    	_.postError("An unknown error occurred while entering the UPDATE form");
			    	_.returnFromError();
			    }
            });
        };
        
		self.updateGrid = function(inputRow,rowToSelect) {
			var reqObj = _.buildAppstackJSON({
				form: "W41016WA",
				type: "close",
				gridUpdate: true,
				rowToSelect: rowToSelect,
				dynamic: true
			},"4");
			_.getForm("appstack",reqObj).then(function(data){
			    _.successOrFail(data,{successMsg:'Item Master Alternative Description updated.',isGrid:true});
			});
		};
		self.addToGrid = function(inputRow) {
			var reqObj = _.buildAppstackJSON({
				form: "W41016WA",
				type: "close",
				gridAdd: true,
				dynamic: true,
				customGrid: true
			},["grid", "10", inputRow.LNGP], "4");
			_.getForm("appstack",reqObj).then(function(data){
				_.successOrFail(data,{successMsg:'Item Master Alternative Description added.',isGrid:true});
			});
		};
	};
	return new Process();
});