define(['aisclient'], function(_){
	var Process = function(){
		var self = this;
        self.reqFields = {
            titles: [{
		        "name": "ASII"
		    }, {
		        "name": "LANG_FROM_LNGP"
		    }, {
		        "name": "LANG_TO_LNGP"
		    }],
            isCustomTemplate: false
        },
        self.closeObj = {
            subForm: "W12015C",
            closeID: "13"
        },
		self.init = function() {
			var inputRow = globals.inputRow = globals.processQ[0];
			_.postSuccess("Processing row " + inputRow.ROW);

			var reqObj = _.buildAppstackJSON({
				form: "P12015_W12015C",
				type: "open"
			},["56",inputRow.ASII],["30",inputRow.LANG_FROM_LNGP],["32",inputRow.LANG_TO_LNGP],"27");

			_.getForm("appstack",reqObj).then(function(data){
				if (data.hasOwnProperty("fs_P12015_W12015C")) {
					var errObj = data.fs_P12015_W12015C.errors;
					if (errObj.length > 0) {
						_.getErrorMsgs(errObj);
						_.returnFromError();
					} else if (data.fs_P12015_W12015C.data.gridData.rowset.length === 0) {
						_.postError("No asset found. Please use the Asset Master Revision (P1201_W1201G) process to add the asset");
						_.returnFromError();
					} else {
						_.postSuccess("Asset found");
						self.updateGrid(inputRow);
					}
				} else {
					_.postError("Unknown error occurred while searching for the asset");
					_.returnFromError();
				}
			});
		},
		self.updateGrid = function(inputRow) {

			var reqObj = _.buildAppstackJSON({
				form: "W12015C",
				type:"close",
				gridUpdate: true
			},"12");

			_.getForm("appstack",reqObj).then(function(data){
				if (data !== "no_response") {
					var errObj = data.fs_P12015_W12015C.errors;
					if (errObj.length > 0) {
						_.getErrorMsgs(errObj);
						_.returnFromError();
					};
				} else {
					_.postSuccess("Asset Description Translation updated!")
					_.returnFromSuccess();
				}
			});
		}
	};
	return new Process();
});