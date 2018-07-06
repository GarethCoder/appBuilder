// Customer | ADD ID "13"
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "AN8"
            }],
            isCustomTemplate: false
        };
    	self.closeObj = {
            subForm: "W1782G",
            closeID: "16"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            var reqObj = _.buildAppstackJSON({
                form: "P01012_W01012B",
                type: "open",
                turbo: true
            },["1[19]",inputRow.AN8],"15");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P01012_W01012B")) {
                    var rowArr = data.fs_P01012_W01012B.data.gridData.rowset;
                    var errObj = data.fs_P01012_W01012B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        _.postError("No Address Book record found");
                        _.returnFromError();
                    } else if (rowArr.length === 1) {
                        _.postSuccess("Address Book record found, opening S/WM form");
                        self.getSWMForm(inputRow);
                    } else {
                        _.postError("There was a problem finding the Address Book record, or there are duplicates");
                        _.returnFromError();
                    }
                } else {
                    _.postError("An unknown error occurred in the find/browse form");
                    _.returnFromError();
                }
            });
        };
        self.getAddMenu = function(inputRow) {
        	var reqObj = _.buildAppstackJSON({
                form: "W1782G"
            },"32");
        	_.getForm("appstack",reqObj).then(function(data){
        		if (data.hasOwnProperty("fs_P1782_W1782A")) {
    	    	    _.postSuccess("Opening ADD menu");
    	    	    self.getAddForm(inputRow);
        		} else {
        			_.postError("An unknown error occurred while entering the ADD menu");
        			_.returnFromError();
        		}
        	});
        },
        self.getAddForm = function(inputRow) {
            if (globals.htmlInputs.length === 0) {
                var reqObj = _.buildAppstackJSON({
                    form: "W1782A"
                },"13");
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W1782A",
                    turbo: true
                },"13");
            }
        	_.getForm("appstack",reqObj).then(function(data){
        		if (data.hasOwnProperty("fs_P1782_W1782B")) {
                    if (globals.htmlInputs.length === 0) {
                        globals.htmlInputs = data.fs_P1782_W1782B.data;
                    }
    	    	    _.postSuccess("Entering ADD form");
    	    	    self.addForm(inputRow);
        		} else {
        			_.postError("An unknown error occurred while entering the ADD form");
        			_.returnFromError();
        		}
        	});
        };
        self.getSWMForm = function(inputRow) { // UPDATE "selectRow"
        	var reqObj = _.buildAppstackJSON({
                form: "W01012B"
            },"1.0","82");
        	_.getForm("appstack",reqObj).then(function(data){
        	    if (data.hasOwnProperty("fs_P1782_W1782G")) {
        	    	var rowsetArr = data.fs_P1782_W1782G.data.gridData.rowset;
        	    	var rowToSelect = "add";
        	    	if (rowsetArr.length > 0) {
        	    		for (var i = 0; i < rowsetArr.length; i++) {
    	                    if (rowsetArr[i].sInformationTypeDescription_28.value === "Customer") {
    	                        rowToSelect = rowsetArr[i].rowIndex;
    	                    }
    	                }
    	                if (rowToSelect === "add") {
    	                    self.getAddMenu(inputRow);
    	                } else {
    	                    self.getEditForm(inputRow,rowToSelect);
    	                }
        	    	} else {
        	    		self.getAddMenu(inputRow);
        	    	}
        	    } else {
        	    	_.postError("An unknown error occurred while entering the S/WM UPDATE form");
        	    	_.returnFromError();
        	    }
        	});
        };
        self.getEditForm = function(inputRow,rowToSelect) { // UPDATE
            if (globals.htmlInputs.length === 0) {
                var reqObj = _.buildAppstackJSON({
                    form: "W1782G"
                },"1." + rowToSelect,"14");
            } else {
                var reqObj = _.buildAppstackJSON({
                    form: "W1782G",
                    turbo: true
                },"1." + rowToSelect,"14");
            }
        	_.getForm("appstack",reqObj).then(function(data){
        		if (data.hasOwnProperty("fs_P1782_W1782B")) {
                    if (globals.htmlInputs.length === 0) {
                        globals.htmlInputs = data.fs_P1782_W1782B.data;
                    }
        			var errObj = data.fs_P1782_W1782B.errors;
        			if (errObj.length > 0) {
        			    _.getErrorMsgs(errObj);
        			    _.returnFromError();
        			} else {
    	    			_.postSuccess("Entering UPDATE form");
    	    			self.updateForm(inputRow);
        			}
        		} else {
        			_.postError("An unknown error occurred while entering the UPDATE form");
        			_.returnFromError();
        		}
        	});
        };
        self.updateForm = function(inputRow) {
        	var reqObj = _.buildAppstackJSON({
                form: "W1782B",
                type: "close",
                dynamic: true
            },"11");
        	_.getForm("appstack",reqObj).then(function(data){
        	    _.successOrFail(data,{successMsg:'S/WM Customer record successfully updated'});
        	});
        };
        self.addForm = function(inputRow) {
        	var reqObj = _.buildAppstackJSON({
                form: "W1782B",
                type: "close",
                dynamic: true
            },"11");
        	_.getForm("appstack",reqObj).then(function(data){
        	    _.successOrFail(data,{successMsg:'S/WM Customer record successfully added'});
        	});
        };
    };
    return new Process();
});