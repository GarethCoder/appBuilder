define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "LITM"
            }, {
                name: "MCU"
            }, {
                name: "UOM"
            }, {
                name: "TYPF"
            }, {
                name: "DRQJ"
            }, {
                name: "FQT"
            }, {
                name: "FAM"
            }, {
                name: "AN8"
            }, {
                name: "BPFC"
            }, {
                name: "PMPN"
            }],
            isCustomTemplate: true
        };
        self.closeObj = {
            subForm: "W3460A",
            closeID: "5"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
			inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            self.inputDate = moment(inputRow.DRQJ,globals.dateFormat);

			// override to ensure record saves
			if ($.trim(inputRow.AN8) == '')
				inputRow.AN8 = 0;

			if (inputRow.EXTRACT) {
				var reqObj = _.buildAppstackJSON({
					form: "P3460_W3460A",
					type: "open",
					//returnControlIDs: "1[19,25]",
					aliasNaming: true
				},["15",inputRow.LITM],["13",inputRow.MCU],["17",inputRow.UOM],["57",inputRow.TYPF],["142",inputRow.DRQJ],"130");

			} else {

				var reqObj = _.buildAppstackJSON({
					form: "P3460_W3460A",
					type: "open",
					returnControlIDs: "1[19,25]"
				},["15",inputRow.LITM],["13",inputRow.MCU],["17",inputRow.UOM],["57",inputRow.TYPF],["142",inputRow.DRQJ],"130");

			}

            _.getForm("appstack",reqObj).then(function(data){
                var rowArr = data.fs_P3460_W3460A.data.gridData.rowset;
                var rowToSelect = 0;

                if (data.hasOwnProperty("fs_P3460_W3460A")) {
					if (inputRow.EXTRACT)
					{
						var fieldObj = data.fs_P3460_W3460A.data;
						$.each(fieldObj.gridData.rowset,function(key,object) {
							if (fieldObj.gridData.rowset[key].hasOwnProperty("MOExist")) 
								delete fieldObj.gridData.rowset[key].MOExist;
							if (fieldObj.gridData.rowset[key].hasOwnProperty("rowIndex")) 
								delete fieldObj.gridData.rowset[key].rowIndex;
							
							// loop through the object to extrac aliases
							for (var aliasKey in object) { 
								if (!object[aliasKey].hasOwnProperty("alias")) {
									var colArr = aliasKey.split("_");
									if (colArr.length === 3) // means all should be ok and index 1 is alias
										fieldObj.gridData.rowset[key][aliasKey].alias = colArr[1];
								}			
							}

						});

						 _.appendTable(fieldObj, 0, true);
                        _.postSuccess("Extracting data");
					} else {

						// loop through the rows and add the ones with matching dates to a new array. Stop once there is a mismatch
						var cusArr = []; // array will contain row indices of rows with identical dates
						$.each(rowArr,function(i,o){
							if ( moment( o.dtRequestDate_19.value.trim(),globals.dateFormat ).isSame( moment( inputRow.DRQJ.trim() ) ) ) {
								var newObj = {
									index: i,
									customer: o.mnCustomerNumber_25.value
								}
								cusArr.push(newObj);
							} else {
								return false;
							}
						});
						// loop through the new array and compare customer numbers
						$.each(cusArr,function(i,o){
							if ($.trim(o.customer) == $.trim(inputRow.AN8)) {
								rowToSelect = o.index;
								return false;
							} else {
								rowToSelect = -1;
							}
						});
						var errObj = data.fs_P3460_W3460A.errors;
						if (errObj.length > 0) {
							_.getErrorMsgs(errObj);
							_.returnFromError();
						} else if ( rowArr.length === 0 || rowToSelect === -1 ) { // if no rows returned OR date/customer not found, ADD
							_.postSuccess("Adding forecast");
							self.addForm(inputRow);
						} else {
							_.postSuccess("Record found, updating forecast");
							self.updateForm(inputRow,rowToSelect);
						}
					}
                } else {
                    _.postError("Unknown error occurred while finding the forecast");
                    _.returnFromError();
                }
            });
        };
        self.addForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W3460A",
                type: "close",
                gridAdd: true,
                customGrid: true,
                turbo: true
            },["grid","23",inputRow.FQT],["grid","22",inputRow.FAM],["grid","25",inputRow.AN8],["grid","24",inputRow.BPFC],
                ["grid","155",inputRow.PMPN],["grid","19",inputRow.DRQJ],"4","4");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P3460_W3460A")) {
                    var errObj = data.fs_P3460_W3460A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Forecast successfully added");
                        _.returnFromSuccess();
                    }
                } else if (data === "no_response") {
                    _.postSuccess("Forecast successfully added");
                    _.returnFromSuccess();
                } else {
                    _.postError("Unknown error occurred while adding the forecast");
                    _.returnFromError();
                }
            });
        };
        self.updateForm = function(inputRow,rowToSelect) {

            var reqObj = _.buildAppstackJSON({
                form: "W3460A",
                type: "close",
                gridUpdate: true,
                customGrid: true,
                rowToSelect: rowToSelect,
                turbo: true
            },["grid","23",inputRow.FQT],["grid","22",inputRow.FAM],["grid","25",inputRow.AN8],["grid","24",inputRow.BPFC],
                ["grid","155",inputRow.PMPN],["grid","19",inputRow.DRQJ],"4","4");

            _.getForm("appstack",reqObj).then(function(data){
				if (data === "no_response") {
                    _.postSuccess("Forecast successfully updated");
                    _.returnFromSuccess();
                } else
                if (data.hasOwnProperty("fs_P3460_W3460A")) {
                    var errObj = data.fs_P3460_W3460A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postSuccess("Forecast successfully updated");
                        _.returnFromSuccess();
                    }
                } else  {
                    _.postError("Unknown error occurred while adding the forecast");
                    _.returnFromError();
                }
            });
        };
    };
    return new Process();
});