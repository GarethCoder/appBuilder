define(['aisclient'], function(_){
	var Process = function(){
		var self = this;
		self.reqFields = {
            titles: [],
            isCustomTemplate: false
        };
		self.closeObj = {
	        subForm: "W4101Z1A",
	        closeID: "16"
	    };
		self.init = function() {
			var inputRow = globals.inputRow = globals.processQ[0];
			_.postSuccess("Processing row " + inputRow.ROW);

	        globals.processMasterQ = globals.processQ;
	        globals.processQ = [];

	        self.totNumRows = globals.processMasterQ.length;
	        self.numSets = Math.ceil(self.totNumRows/100);
	        self.numRemaining = self.totNumRows % (self.numSets - 1);

	        var reqObj = _.buildAppstackJSON({
	        	form: "P4101Z1_W4101Z1A",
	        	type: "open",
	        	returnControlIDs: true
	        },"316");

	        _.getForm("appstack",reqObj).then(function(data){
	            if (data.hasOwnProperty("fs_P4101Z1_W4101Z1B")) {
	            	globals.titleList = data.fs_P4101Z1_W4101Z1B.data.gridData.titles;
	            	_.postSuccess("Entering ADD form and preparing the request");
	            	self.insertValues(inputRow);
	            } else {
	            	_.postError("An unknown error occurred while opening the ADD form");
	            	self.closeSession();
	            }
	        });
		};
		self.insertValues = function(inputRow) { // why 200 at a time?
			var reqArr = [];
			// loop through processQ and insert values
			for (var i = 0; i < self.numSets; i++) {
				if (i === self.numSets - 1) {
					globals.processQ = globals.processMasterQ;
					// if last, include the check button in the request
					reqArr[i] = _.buildAppstackJSON({
						form: "W4101Z1B",
						gridAddMultiple: true,
						returnControlIDs: "99"
					},"12");
					globals.processQ = [];
				} else {
					for (var j = 0; j < 100; j++) {
						// add first 100 rows to processQ
						globals.processQ.push(globals.processMasterQ.shift());
					}
					reqArr[i] = _.buildAppstackJSON({
						form: "W4101Z1B",
						gridAddMultiple: true,
						returnControlIDs: "99"
					});
					globals.processQ = [];
				}
			}

			var k = 0;

			function addToGrid() {
				if (k === self.numSets - 1) {
					_.postSuccess( "Processing rows " + ( (k * 100) + 1 ) + " to " + ( self.totNumRows + 1) );
				} else {
					_.postSuccess( "Processing rows " + ( (k * 100) + 1 ) + " to " + ( (k + 1) * 100 ) );
				}
				reqArr[k].stackId = globals.stackid;
				reqArr[k].stateId = globals.stateid;
				reqArr[k].rid = globals.rid;
				_.getForm("appstack",reqArr[k]).then(function(data){
					if (data.hasOwnProperty("fs_P4101Z1_W4101Z1B")) {
						var errObj = data.fs_P4101Z1_W4101Z1B.errors;
						if (errObj.length > 0) {
						    _.getErrorMsgs(errObj,"Error",true);
						    if (k === self.numSets - 1) {
								self.closeSession();
						    } else {				
								k++;
								addToGrid();
							}
						} else { // success
							if (k === self.numSets - 1) {
								self.closeSession();
							} else {	
								k++;
								addToGrid();	
							}
						}
					} else {
						_.postError( "Unknown error in between rows " + ( (k * 100) + 1 ) + " and " + ( (k + 1) * 100 ) );					
						k++;
						addToGrid();
					}
				});
			};
			addToGrid();
		};
		self.closeSession = function() {
			var reqObj = _.buildAppstackJSON({
				form: self.closeObj.subForm,
				type: "close"
			},self.closeObj.closeID);

			_.getForm("appstack",reqObj).then(function(data){
				globals.processQ = [];
				var formDataObj;
		        $.each(data,function(i,o){
		            if (i.search("fs_") !== -1) {
		                formDataObj = o;
		            };
		        });
		        var errObj = formDataObj.errors;
		        if (errObj.length > 0) {
					_.getErrorMsgs(errObj,"Error",true);
					_.returnFromError();
		            // _.self.endForm();
		        } else {
					_.postSuccess('Z-file successfully uploaded!');
					_.returnFromSuccess();
		            // self.endForm();
		        }
			});
		};
	    /* self.endForm = function() {
	        $("#dataHolder [class*='row'").remove();
	        _.cleanUp();
	    } */
	};
	return new Process();
});