define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "MCU"
            }, {
                "name": "AN8"
            }, {
                "name": "LITM"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W43090A",
            closeID: "5"
        };
    	self.init = function(){
            var inputRow = globals.inputRow = globals.processQ[0];
    		_.postSuccess("Processing row " + inputRow.ROW);

            var reqObj = _.buildAppstackJSON({
                form: "P43090_W43090A",
                type: "open"
            },["21",inputRow.MCU],["1[6]",inputRow.AN8],["1[7]",inputRow.LITM],"25");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P43090_W43090A")) {
                    var rowArr = data.fs_P43090_W43090A.data.gridData.rowset;
                    var errObj = data.fs_P43090_W43090A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (rowArr.length === 0) {
                        self.getAddForm(inputRow);
                        _.postSuccess("Adding AN8/Item Relationsip");
                    } else if (rowArr.length === 1) {
                        self.selectRow(inputRow);
                        _.postSuccess("AN8/Item Relationsip found");
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
                form: "W43090A"
            },"27");

    		_.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P43090_W43090B")) {
                    var errObj = data.fs_P43090_W43090B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        globals.htmlInputs = data.fs_P43090_W43090B.data;
                        self.addForm(inputRow);
                        _.postSuccess("Entering new AN8/Item Relationsip data");
                    }
                } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                }
            });
    	};
    	self.addForm = function(inputRow) {
    		var reqObj = _.buildAppstackJSON({
                form: "W43090B",
                type: "close",
                dynamic: true
            },["45",inputRow.MCU],
            ["8",inputRow.AN8],
            ["47",inputRow.LITM],"3");

    		_.getForm("appstack",reqObj).then(function(data){
    		    _.successOrFail(data,{successMsg: "New AN8/Item Relationsip details added"});
    		});
    	};
    	self.selectRow = function(inputRow) {
    		var reqObj = _.buildAppstackJSON({
                form: "W43090A"
            },"1.0","40");

    		_.getForm("appstack",reqObj).then(function(data){
    		    if (data.hasOwnProperty("fs_P43090_W43090B")) {
                    var errObj = data.fs_P43090_W43090B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Entering the AN8/Item Relationships form");
                        globals.htmlInputs = data.fs_P43090_W43090B.data;
                        self.updateForm(inputRow);
                    }
                } else if (data.hasOwnProperty("fs_P43090_W43090A")) {
                    var errObj = data.fs_P43090_W43090A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postError("There was a problem entering the AN8/Item Relationships form");
                        _.returnFromError();
                    }
                } else {
                    _.postError("An unknown error occurred entering the AN8/Item Relationships form");
                    _.returnFromError();
                }
    		});
    	};
    	self.updateForm = function(inputRow) {
    		var reqObj = _.buildAppstackJSON({
                form: "W43090B",
                type: "close",
                dynamic: true
            },"3","3");

    		_.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "AN8/Item Relationships record updated"});
            });
    	};
    };
    return new Process();
});