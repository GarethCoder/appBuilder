define(['aisclient'], function(_){
	var Process = function(){
		var self = this;
        self.reqFields = {
            titles: [{
		        "name": "DOCO"
		    }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W31114B",
            closeID: "562"
        };
		self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);
			_.postSuccess("Processing row " + inputRow.ROW);

	        var reqObj = _.buildAppstackJSON({
	        	form: "P31114_W31114A",
                type: "open"
			},
				["1[12]", inputRow.DOCO],
				["1[13]", inputRow.DCTO],
				["63", ""],
				"6");

	        _.getForm("appstack",reqObj).then(function(data){
	            if (data.hasOwnProperty("fs_P31114_W31114A")) {
	                var rowArr = data.fs_P31114_W31114A.data.gridData.rowset;
	                var errObj = data.fs_P31114_W31114A.errors;
	                if (errObj.length > 0) {
	                    _.getErrorMsgs(errObj);
	                    _.returnFromError();
	                } else if (rowArr.length === 0) {
	                    _.postError("No record found for Order No: "+inputRow.DOCO);
						_.returnFromError();
	                } else if (rowArr.length == 1) {
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
		self.selectRow = function(dataRows, inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W31114A"
            },"1.0","4");

            if (inputRow.EXTRACT) {
				reqObj.aliasNaming = true;
				
            } 
			
			_.getForm("appstack",reqObj).then(function(data){
			    if (data.hasOwnProperty("fs_P31114_W31114B")) { 
					var errObj = data.fs_P31114_W31114B.errors;
					var warningObj = data.fs_P31114_W31114B.warnings;
                    var fieldData = data.fs_P31114_W31114B.data;
					if (errObj.length > 0) {
			    	    _.getErrorMsgs(errObj);
			    	    _.returnFromError();
					 } 
					 // else 
					// if (warningObj.length > 0) {
			    	//     _.getErrorMsgs(warningObj);
			    	//     _.returnFromError();
					// }
					else {
                        if (inputRow.EXTRACT) {
							_.appendTable(fieldData);

							var reqObj = _.buildAppstackJSON({
								form: "W31114B",
								type: "close"
							}, "562");

							_.getForm("appstack", reqObj).then(function (data) {
								_.successOrFail(data, { successMsg: "Form Closed Successfully." });
							});
                        } else {
                            self.updateForm(inputRow);
                            _.postSuccess("Updating Order Completion Detail");
                        }
					}
				}
			});
        };
        
		self.updateForm = function(inputRow,rowToSelect) {
			var reqObj = _.buildAppstackJSON({
				form: "W31114B",
                type: "close",
                dynamic: true
			}, "561", "561"); // override warning

			_.getForm("appstack",reqObj).then(function(data){
				_.successOrFail(data,{successMsg:'Dates updated'});
			});
		};
	};
	return new Process();
});