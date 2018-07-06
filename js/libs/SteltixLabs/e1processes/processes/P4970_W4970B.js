define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "RTNM"
            }],
            isCustomTemplate: false
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            var reqObj = _.buildAppstackJSON({
	        	form: "P4970_W4970E",
                type: "open"
            }, ["18", inputRow.RTNM],"15");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4970_W4970E")) {
                    var rowArr = data.fs_P4970_W4970E.data.gridData.rowset;
                    var errObj = data.fs_P4970_W4970E.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        self.addRow(inputRow);
                        _.postSuccess("Adding Rate Definition");
                    }  else if (rowArr.length === 1) {
                        self.selectRow(inputRow);
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
                form: "W4970E"
			};

			if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
			}
			
            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","14");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4970_W4970B")) { 
					var errObj = data.fs_P4970_W4970B.errors;
					var fieldObj = data.fs_P4970_W4970B.data;
					if (errObj.length > 0) {
			    	    _.getErrorMsgs(errObj);
			    	    _.returnFromError();
                    } else if (inputRow.EXTRACT) {
                        _.appendTable(fieldObj);
						_.postSuccess("Extracting data"); 
                    } else {
                        self.updateForm(fieldObj, inputRow);
						_.postSuccess("Updating Rate Definition");
                    }
                } 
            });
        }

        self.updateForm = function(fieldObj, inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W4970B",
                type: "close",
                dynamic: true,
                customGrid: true
            },["14",inputRow.RTNM],"11","11");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Item updated"});
            });
        }

        self.addRow = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W4970E"              
            },"31");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4970_W4970B")) { 
                    var errObj = data.fs_P4970_W4970B.errors;
                    if (errObj.length > 0) {
			    	    _.getErrorMsgs(errObj);
			    	    _.returnFromError();
                    } else {
                        var reqObj = _.buildAppstackJSON({
                            form: "W4970B",
                            type: "close",
                            dynamic: true,
                            customGrid: true
                        },["14",inputRow.RTNM],"11","11");
            
                        _.getForm("appstack",reqObj).then(function(data){
                            if (data.hasOwnProperty("fs_P4970_W4970B")) { 
                                var errObj = data.fs_P4970_W4970B.errors;
                                var warningObj = data.fs_P4970_W4970B.warnings;
                                if (errObj.length > 0) {
                                    _.getErrorMsgs(errObj);
                                    _.returnFromError();
                                } else if (warningObj.length > 0) {
                                    _.getErrorMsgs(warningObj);
                                    _.returnFromError();
                                } else {
                                    _.successOrFail(data,{successMsg: "Item updated"});
                                }
                            } else 
                                _.successOrFail(data,{successMsg: "Item updated"});
                        });

                    }
                }
            });            
           
        }
    };
    return new Process();
});