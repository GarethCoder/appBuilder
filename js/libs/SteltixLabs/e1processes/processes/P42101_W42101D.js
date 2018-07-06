define(['aisclient'], function(_){
	var Process = function(){
		var self = this;
        self.reqFields = {
            titles: [{
		        "name": "CO"
		    }, {
		        "name": "DAOB"
		    }, {
		        "name": "DASB"
		    }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W12002B",
            closeID: "5"
        };
		self.init = function() {
			var inputRow = globals.inputRow = globals.processQ[0];
			_.postSuccess("Processing row " + inputRow.ROW);

	        var reqObj = _.buildAppstackJSON({
	        	form: "P42101_W42101C",
                type: "open"
                }, ["366", inputRow.DOCO],["362",inputRow.DCTO],"15");

	        _.getForm("appstack",reqObj).then(function(data){
	            if (data.hasOwnProperty("fs_P42101_W42101C")) {
	                var rowArr = data.fs_P42101_W42101C.data.gridData.rowset;
	                var errObj = data.fs_P42101_W42101C.errors;
	                if (errObj.length > 0) {
	                    _.getErrorMsgs(errObj);
	                    _.returnFromError();
	                } else if (rowArr.length === 0) {
	                    _.postError("No record found for Order No: "+inputRow.DOCO);
						_.returnFromError();
	                } else if (rowArr.length > 0) {
	                    self.selectRow(rowArr, inputRow);
	                   // _.postSuccess("Depreciation Defaults found");
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
		self.selectRow = function(dataRows, inputRow) {
            var reqObj = _.buildAppstackJSON({
				form: "W42101C"
			},"41.0","14");
			
			_.getForm("appstack",reqObj).then(function(data){
			    if (data.hasOwnProperty("fs_P42101_W42101D")) { 
					var errObj = data.fs_P42101_W42101D.errors;
					if (errObj.length > 0) {
			    	    _.getErrorMsgs(errObj);
			    	    _.returnFromError();
			    	} else {
						self.updateForm(inputRow);
						_.postSuccess("Updating dates");
					}
				}
			});
        };
        
		self.updateForm = function(inputRow,rowToSelect) {
			var reqObj = _.buildAppstackJSON({
				form: "W42101D",
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
		};
	};
	return new Process();
});