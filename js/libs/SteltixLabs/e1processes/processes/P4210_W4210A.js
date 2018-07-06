define(['aisclient'], function(_){
	var Process = function(){
		var self = this;
        self.reqFields = {
            titles: [],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W12002B",
            closeID: "5"
        };
		self.init = function() {
			var inputRow = globals.inputRow = globals.processQ[0];
			_.postSuccess("Processing row " + inputRow.ROW);
			inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

	        var reqObj = _.buildAppstackJSON({
	        	form: "P4210_W4210E",
                type: "open"
                }, ["9", inputRow.DOCO],["13",inputRow.DCTO],"28");

	        _.getForm("appstack",reqObj).then(function(data){
	            if (data.hasOwnProperty("fs_P4210_W4210E")) {
	                var rowArr = data.fs_P4210_W4210E.data.gridData.rowset;
	                var errObj = data.fs_P4210_W4210E.errors;
	                if (errObj.length > 0) {
	                    _.getErrorMsgs(errObj);
	                    _.returnFromError();
	                } else if (rowArr.length === 0 || (rowArr.length > 0 && (rowArr[0]['mnOrderNumber_45'].value == 0 || rowArr[0]['mnOrderNumber_45'].value == ''))) {
						// we going to add
						self.addRow(inputRow);
						_.postSuccess("Adding time");
						
	                } else if (rowArr.length > 0) {
						self.selectRow(rowArr, inputRow);
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

		self.addRow = function(inputRow) {
			// open add form
			var reqObj = _.buildAppstackJSON({form: "W4210E"},"87");
			_.getForm("appstack",reqObj).then(function(data){
			    if (data.hasOwnProperty("fs_P4210_W4210A")) { 
					var errObj = data.fs_P4210_W4210A.errors;
					var fieldObj = data.fs_P4210_W4210A.data;
					if (errObj.length > 0) {
			    	    _.getErrorMsgs(errObj);
			    	    _.returnFromError();
			    	} else {
						_.postSuccess("Adding form loaded");
						var reqObj = _.buildAppstackJSON({
							form: "W4210A",
							type: "execute",
							dynamic: true,
							gridAdd: true
						},"4");			

						// add the data and submit form
						_.getForm("appstack",reqObj).then(function(data){
							if (data.hasOwnProperty("fs_P4210_W4210A")) { 
								var errObj = data.fs_P4210_W4210A.errors;
                            	var warningObj = data.fs_P4210_W4210A.warnings;
                            
								if (warningObj.length > 0) {
									_.getErrorMsgs(warningObj);
									_.returnFromError();  
								} else if (errObj.length > 0) {
									_.getErrorMsgs(errObj);
									_.returnFromError();
								}
							}
							else 
								_.successOrFail(data,{successMsg:'Sales Order Detail Revision successfully added'});
						});
					}
				}
			});
		};

		self.selectRow = function(dataRows, inputRow) {

			var optionsObj = {
                form: "W4210E"
			};

			if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
			}
			
			var reqObj = _.buildAppstackJSON(optionsObj,"1.0","4");
			
			_.getForm("appstack",reqObj).then(function(data){
			    if (data.hasOwnProperty("fs_P4210_W4210A")) { 
					var errObj = data.fs_P4210_W4210A.errors;
					var fieldObj = data.fs_P4210_W4210A.data;
					if (errObj.length > 0) {
			    	    _.getErrorMsgs(errObj);
			    	    _.returnFromError();
			    	} else if (inputRow.EXTRACT) {
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
						self.updateForm(fieldObj, inputRow);
						_.postSuccess("Updating Sales Order Detail Revision");
					}
				}
			});
		};
        
		self.updateForm = function(fieldObj, inputRow) {
			/* 
				Notes:
				- we need to check if the line number is in the grid to know if it's new

			*/

			var lineNoToUpdate = inputRow['grid__Line Number__LNID__34'];
			var lineNoFound = false;
			if (fieldObj.hasOwnProperty('gridData')) {
				$.each(fieldObj.gridData.rowset,function(key,object) {
					if (object['grid__Line Number__LNID__34'] == lineNoToUpdate) {
						lineNoFound = true;
					}
				});
			}

			if (lineNoFound)
				_.postSuccess("Found");
			else
				_.postSuccess("Not Found");

			/*  var reqObj = _.buildAppstackJSON({
				form: "W4210A",
				type: "execute"
			},["200_25", inputRow.DRQJ],["200_29", inputRow.PDDJ],["200_33", inputRow.RSDJ],
			  ["200_37", inputRow.CNDJ],["200_41", inputRow.PEFJ],"138");

			_.getForm("appstack",reqObj).then(function(data){
				if (data.hasOwnProperty("fs_P42101_W42101D")) { 
					var errObj = data.fs_P42101_W42101D.errors;
					if (errObj.length > 0) {
			    	    _.getErrorMsgs(errObj);
			    	    _.returnFromError();
					} 
					var warningObj = data.fs_P42101_W42101D.warnings;
					// if warnings, then something in for review, try forcing form to submit
					if (warningObj.length > 0) { 
			    	    var reqObj = _.buildAppstackJSON({
							form: "W42101D",
							type: "execute"
						},"138");

						_.getForm("appstack",reqObj).then(function(data){
							_.successOrFail(data,{successMsg:'Dates updated'});
						});
					} 
				}
				else
			    	_.successOrFail(data,{successMsg:'Dates updated'});
			});
			*/

			_.postSuccess("Got to update form successfully.");
		};
	};
	return new Process();
});