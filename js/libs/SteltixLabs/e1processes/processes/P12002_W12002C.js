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
	        	form: "P12002_W12002B",
	        	type: "open"},["1[7]",
	        	inputRow.CO],["1[8]",inputRow.DAOB],"6");

	        _.getForm("appstack",reqObj).then(function(data){
	            if (data.hasOwnProperty("fs_P12002_W12002B")) {
	                var rowArr = data.fs_P12002_W12002B.data.gridData.rowset;
	                var errObj = data.fs_P12002_W12002B.errors;
	                if (errObj.length > 0) {
	                    _.getErrorMsgs(errObj);
	                    _.returnFromError();
	                } else if (rowArr.length === 0) {
	                    self.getAddForm(inputRow);
	                    _.postSuccess("Adding Depreciation Defaults");
	                } else if (rowArr.length === 1) {
	                    self.selectRow(inputRow);
	                    _.postSuccess("Depreciation Defaults found");
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
		self.getAddForm = function(inputRow) {
			var reqObj = _.buildAppstackJSON({
				form: "W12002B"
			},"12");
			_.getForm("appstack",reqObj).then(function(data){
			    if (data.hasOwnProperty("fs_P12002_W12002C")) {
			    	var errObj = data.fs_P12002_W12002C.errors;
			    	if (errObj.length > 0) {
			    	    _.getErrorMsgs(errObj);
			    	    _.returnFromError();
			    	} else {
			    		_.postSuccess("Opening ADD form");
			    		self.addForm(inputRow);
			    	}
			    } else {
			    	_.postError("An unknown error occurred while opening the ADD form");
			    	_.returnFromError();
			    }
			});
		};
		self.addForm = function(inputRow) {
			var reqObj = _.buildAppstackJSON({
				form: "W12002C",
				type: "close",
				dynamic: true,
				gridAdd: true
			},["70",inputRow.CO],["73",inputRow.DAOB],["75",inputRow.DASB],"44","44");
			_.getForm("appstack",reqObj).then(function(data){
			    _.successOrFail(data,{successMsg:'Depreciation Default successfully added',isGrid:true});
			});
		};
		self.selectRow = function(inputRow) {
			var reqObj = _.buildAppstackJSON({
				form: "W12002B"
			},"1.0","4");
			_.getForm("appstack",reqObj).then(function(data){
			    if (data.hasOwnProperty("fs_P12002_W12002C")) {
			    	var errObj = data.fs_P12002_W12002C.errors;
			    	if (errObj.length > 0) {
			    	    _.getErrorMsgs(errObj);
			    	    _.returnFromError();
			    	} else {
			    		globals.htmlInputs = data.fs_P12002_W12002C.data;
			    		globals.titleList = data.fs_P12002_W12002C.data.gridData.titles;
			    		var rowArr = data.fs_P12002_W12002C.data.gridData.rowset;
			    		var rowToSelect = "add";

			    		for (var i = 0; i < rowArr.length; i++) {
			    			if (inputRow["grid__LT__LT__9"].toLowerCase() === rowArr[i]["sLT_9"].value.toLowerCase()) {
			    				rowToSelect = i;
			    				break;
			    			}
			    		}

			    		if (rowToSelect === "add") {
			    			_.postSuccess("Adding grid row");
			    			self.addToGrid(inputRow);
			    		} else {
			    			_.postSuccess("Updating grid row");
			    			self.updateGrid(inputRow,rowToSelect);
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
				form: "W12002C",
				type: "close",
				gridUpdate: true,
				rowToSelect: rowToSelect,
				dynamic: true
			},"44","44");
			_.getForm("appstack",reqObj).then(function(data){
			    _.successOrFail(data,{successMsg:'Depreciation Default updated',isGrid:true});
			});
		};
		self.addToGrid = function(inputRow) {
			var reqObj = _.buildAppstackJSON({
				form: "W12002C",
				type: "close",
				gridAdd: true,
				dynamic: true
			},"44","44");
			_.getForm("appstack",reqObj).then(function(data){
			    _.successOrFail(data,{successMsg:'Depreciation Default added',isGrid:true});
			});
		};
	};
	return new Process();
});