// Item Master Storage/Shipping
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "LITM",
                id: 13,
            }],
            isCustomTemplate: false
        };
    	self.closeObj = {
    		subForm: "W4101E",
    		closeID:"5"
    	};

		self.problemFields = [	{'alias': 'z_UPCN_22', 'longname' : 'txt__UPC Number__UPCN__22' }, 
								{ 'alias': 'z_SCC0_152', 'longname' : 'txt__UOM - SCC(PI=1) Descrip - SCC0__SCC0__152' }, 
								{ 'alias' : 'z_SCC0_153', 'longname' : 'txt__UOM - SCC(PI=2) Descrip - SCC0__SCC0__153' }];

    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

			for (i=0;i<self.problemFields.length;i++) {
				if (inputRow.hasOwnProperty(self.problemFields[i].longname) && inputRow[self.problemFields[i].longname].substring(0,1) === "'")
					inputRow[self.problemFields[i].longname] = inputRow[self.problemFields[i].longname].substring(1);
			}

        	var reqObj = _.buildAppstackJSON({
                form: "P4101_W4101E",
                type: "open",
                returnControlIDs: "1[123]"
            },["1[123]",inputRow.LITM],"22");

        	_.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4101_W4101E")) {
                    var rowArr = data.fs_P4101_W4101E.data.gridData.rowset;
                    var errObj = data.fs_P4101_W4101E.errors;
                    var noItem = rowArr.length === 0 || rowArr[0].sItemNumber_123.value.toLowerCase() !== inputRow.LITM.toLowerCase();
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (noItem && inputRow.EXTRACT) {
                        _.postError("No item found. Please add the item before attempting to extract the data.");
                        _.returnFromError();
                    } else if (noItem) {
                        _.postError("No item found. Please add the item using the Item Master Revisions form: P4101_W4101A");
                        _.returnFromError();
                    } else if (rowArr.length === 1) {
                        _.postSuccess("Item found");
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
                form: "W4101E"
            };
        	if (globals.htmlInputs.length !== 0) { // Will only be true if no data has ever been added to that key
                optionsObj.returnControlIDs = true;
            }
            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }
            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","135");
            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4101_W4101D")) {
                    var errObj = data.fs_P4101_W4101D.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else if (inputRow.EXTRACT) {
                        _.postSuccess("Extracting data");

						for (i=0;i<self.problemFields.length;i++)
						{
							if (data.fs_P4101_W4101D.data.hasOwnProperty(self.problemFields[i].alias) && $.trim(data.fs_P4101_W4101D.data[self.problemFields[i].alias].value) !== '') {
								if (data.fs_P4101_W4101D.data[self.problemFields[i].alias].value !== '" "')
									data.fs_P4101_W4101D.data[self.problemFields[i].alias].value = "'"+data.fs_P4101_W4101D.data[self.problemFields[i].alias].value;
							}
						}

                        _.appendTable(data.fs_P4101_W4101D.data);
                    } else {
                    	if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
    			    		globals.htmlInputs = data.fs_P4101_W4101D.data;
    			        }
                        _.postSuccess("Entering the Revisions form");
                        // var tempRow = {};
                        // $.each(inputRow, function(i,o){
                        //     if(o.id == '86'){
                        //         tempRow[i] = o
                        //     }
                        // })

                        // $.each(inputRow, function(i,o){
                        //     if(o.id != 86){
                        //         tempRow[i] = o
                        //     }
                        // })
                        // console.log(tempRow);
                        self.updateForm(inputRow);
                    }
                } else if (data.hasOwnProperty("fs_P4101_W4101E")) {
                    var errObj = data.fs_P4101_W4101E.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postError("There was a problem entering the Revisions form");
                        _.returnFromError();
                    }
                } else {
                    _.postError("An unknown error occurred while opening the Storage/Shipping form");
                    _.returnFromError();
                }
            });
        };
        self.updateForm = function(inputRow) {
            var reqObj;
            if(!inputRow.hasOwnProperty('txt__UN or NA Number__UNNA__86')){
                reqObj = _.buildAppstackJSON({
                    form: "W4101D",
                    type: "close",
                    dynamic: true,
                    stopOnWarning: false
                },"11");

                _.getForm("appstack",reqObj).then(function(data){
                    _.successOrFail(data,{successMsg: "Item updated"});
                });

            } else {
                reqObj = _.buildAppstackJSON({
                    form: "W4101D",
                    type: "execute"
                },["86", inputRow["txt__UN or NA Number__UNNA__86"]], "11");

                _.getForm("appstack",reqObj).then(function(data){
                    delete inputRow["txt__UN or NA Number__UNNA__86"];
                    reqObj = _.buildAppstackJSON({
                        form: "W4101D",
                        type: "close",
                        dynamic: true,
                        stopOnWarning: false
                    },"11", "11");
                    _.getForm("appstack",reqObj).then(function(data){
                        _.successOrFail(data,{successMsg: "Item updated"});
                    });
                    
                });
            }



        };
    };
    return new Process();
});