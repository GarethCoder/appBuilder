define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                "name": "ASII"
            }, {
                "name": "SRVT"
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W1207A",
            closeID: "5"
        };
    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
    		_.postSuccess("Processing row " + inputRow.ROW);

            var reqObj = _.buildAppstackJSON({
                form: "P1207_W1207A",
                type: "open"
            },["66",inputRow.ASII],["1[12]",inputRow.SRVT],"6")

            _.getForm("appstack",reqObj).then(function(data){
                if (inputRow.DELETE === "yes") { // if DELETE
                    _.postSuccess("Deleting record")
                    P1207_W1207B.deleteRow(inputRow);
                } else { // if ADD or UPDATE
                    var errObj = data.fs_P1207_W1207A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (data.fs_P1207_W1207A.data.gridData.rowset.length === 0) { // NEED helper function for writing to dataHolder
                        _.postSuccess("Adding new equipment schedule")
                        self.getAddForm(inputRow); // ADD
                    } else if (data.fs_P1207_W1207A.data.gridData.rowset.length > 0) {
                        self.selectRow(inputRow); // UPDATE
                    }
                }
            });
    	};
        // DO NOT DELETE THIS CODE
    	// self.deleteRow = function(inputRow) {

     //        var reqObj = _.buildAppstackJSON({form:"W1207A"},"1.0","30","4");

     //        _.getForm("appstack",reqObj).then(function(data){
     //            reqObj = {};
     //            // check that form is correct in response
     //            if (data.hasOwnProperty("fs_P1207_W1207A")) {
     //                _.postSuccess("Grid record deleted");
     //                _.returnFromSuccess(); // DELETE
     //            } else {
     //                _.postError("This process does not match your JDE configuration");
     //                _.returnFromError();
     //            }
     //        })
    	// };
    	// select Row, for UPDATE
    	self.selectRow = function(inputRow) {

    		var reqObj = _.buildAppstackJSON({
                form: "W1207A"
            },"1.0","4","4");

            _.getForm("appstack",reqObj).then(function(data){

                reqObj = {};

                globals.htmlInputs = data.fs_P1207_W1207B.data;

                // check that form is correct in response
                if (data.hasOwnProperty("fs_P1207_W1207B")) {
                    _.postSuccess("Updating Equipment PM Schedule record");
                    self.updateRecord(inputRow);
                } else {
                    _.postError("This process does not match your JDE configuration");
                    _.returnFromError();
                }
            });
    	};
    	self.getAddForm = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W1207A"
            },"31");

            _.getForm("appstack",reqObj).then(function(data){
                reqObj = {};

                globals.htmlInputs = data.fs_P1207_W1207B.data;

                self.insertNewRecord(inputRow,true);
            });
    	};
        self.insertNewRecord = function(inputRow) {
            // need to split functions add and update request functions.
            var reqObj = _.buildAppstackJSON({
                form: "W1207B",
                type: "close",
                dynamic: true
            },["93",inputRow.ASII],["8",inputRow.SRVT],"3");

            _.getForm("appstack",reqObj).then(function(data){
                reqObj = {};
                if (data.hasOwnProperty("fs_P1207_W1207B")) { // if coming from ADD, Edit form - B
                    var errObj = data.fs_P1207_W1207B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("New PM Equipment Schedule created!")
                        _.returnFromSuccess();
                    }
                }
            });
        };
    	self.updateRecord = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W1207B",
                type: "close",
                dynamic: true
            },"3");

            _.getForm("appstack",reqObj).then(function(data){
                reqObj = {};
                // if coming from UPDATE, Work With form - A
                if (data.hasOwnProperty("fs_P1207_W1207A")) {
                    var errObj = data.fs_P1207_W1207A.errors;
                	if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
    	                _.returnFromError();
    	            } else {
                        console.log("success");
    	                _.returnFromSuccess();
    	            }
                } else if (data.hasOwnProperty("fs_P1207_W1207B")) {
                    var errObj = data.fs_P1207_W1207B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postError("An unknown error occurred while performing the update");
                        _.returnFromError();
                    }
                }
            });
    	};
    };
    return new Process();
});