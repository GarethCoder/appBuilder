// Item Cost
define(['aisclient'], function(_){
	var Process = function(){
		var self = this;
        self.reqFields = {
            titles: [{
		        name: "UITM"
		    }, {
		        name: "BP"
		    }, {
		        name: "COST_METHOD"
		    }, {
		        name: "UNIT_COST"
		    }],
            isCustomTemplate: false
        };
		self.closeObj = {
			subForm: "W4105B",
			closeID: "5"
        };
        
        self.init = function () {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
			
				if (inputRow.hasOwnProperty("txt__Sales/Inventory__CSMT__44") && inputRow["txt__Sales/Inventory__CSMT__44"].substr(0, 1) == "'") {
					inputRow["txt__Sales/Inventory__CSMT__44"] = inputRow["txt__Sales/Inventory__CSMT__44"].substr(1);
				}    
				
				if (inputRow.hasOwnProperty("txt__Purchasing__PCSM__46") && inputRow["txt__Purchasing__PCSM__46"].substr(0, 1) == "'") {
					inputRow["txt__Purchasing__PCSM__46"] = inputRow.txt__Purchasing__PCSM__46.substr(1);
				}
	
				if (inputRow.hasOwnProperty("COST_METHOD") && inputRow.COST_METHOD.substr(0, 1) == "'") {
					inputRow.COST_METHOD = inputRow.COST_METHOD.substr(1);
				}   
			
				if (inputRow.hasOwnProperty("LOTN") && inputRow.LOTN.substr(0, 1) == "'") {
					inputRow.LOTN = inputRow.LOTN.substr(1);
				} 
            
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

			var reqObj = _.buildAppstackJSON({
				form: "P4105_W4105B",
				type: "open"
            }, ["54", inputRow.UITM],
               ["59", inputRow.BP],
               ["1[11]", inputRow.LOTN],
                "6");

			_.getForm("appstack",reqObj).then(function(data){
			    if (data.hasOwnProperty("fs_P4105_W4105B")) {
			        var rowArr = data.fs_P4105_W4105B.data.gridData.rowset;
			        var errObj = data.fs_P4105_W4105B.errors;
			        if (errObj.length > 0) {
			            _.getErrorMsgs(errObj);
			            _.returnFromError();
			        } else if (rowArr.length === 0) {
			            _.postSuccess("No Item Cost found, entering ADD form");
			            self.getAddForm(inputRow);
			        } else if (rowArr.length >= 1) {
						_.postSuccess("Item Branch found");
						var selectRowNum = 0;
						var recFound = false;
						var errFound = false;
						var locationCode = '';
						var lotNumber = '';
						
						if (inputRow.hasOwnProperty("LOCNE1")) {
							locationCode = $.trim(inputRow.LOCNE1);
						}

						if (inputRow.hasOwnProperty("LOTN")) {
							lotNumber = $.trim(inputRow.LOTN);
						}

						$.each(rowArr, function(index, object){
							if ($.trim(object['sLocation_31'].value) === locationCode && $.trim(object['sLotSerial_11'].value) === lotNumber) {
								selectRowNum = index;
								recFound = true;
							}
						});

						if (recFound && !errFound)
							self.selectRow(inputRow, selectRowNum);
						else if (!errFound && !inputRow.EXTRACT) {
							_.postSuccess("No Item Cost found, entering ADD form");
			            	self.getAddForm(inputRow);
						} else {
							_.postError("No record found for extract");
			            	_.returnFromError();
						}
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
				form: "W4105B"
			},"30");

			_.getForm("appstack",reqObj).then(function(data){
			    if (data.hasOwnProperty("fs_P4105_W4105A")) {
			        var rowArr = data.fs_P4105_W4105A.data.gridData.rowset;
			        var errObj = data.fs_P4105_W4105A.errors;
			        if (errObj.length > 0) {
			            _.getErrorMsgs(errObj);
			            _.returnFromError();
			        } else {
			            globals.htmlInputs = data.fs_P4105_W4105A.data;
			            globals.titleList = globals.htmlInputs.gridData.titles;
			        	_.postSuccess("Adding Item Cost to the grid");
			            self.addToGrid(inputRow);
			        }
			    } else if (data.hasOwnProperty("fs_P4105_W4105B")) {
			        var rowArr = data.fs_P4105_W4105B.data.gridData.rowset;
			        var errObj = data.fs_P4105_W4105B.errors;
			        if (errObj.length > 0) {
			            _.getErrorMsgs(errObj);
			            _.returnFromError();
			        } else {
			        	_.postError("An uncaught error occurred while entering the ADD form");
			            _.returnFromError();
			        }
			    } else {
			        _.postError("An unknown error occurred in the find/browse form");
			        _.returnFromError();
			    }
			});
		};
        self.selectRow = function (inputRow, rowNum) {
            var optionsObj = {
                form: "W4105B"
            };
    
            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
                optionsObj.type = "close";
            }
            
            var reqObj = _.buildAppstackJSON(optionsObj, "1."+ rowNum, "4");

			_.getForm("appstack",reqObj).then(function(data){
			    if (data.hasOwnProperty("fs_P4105_W4105A")) {
                    var rowArr = data.fs_P4105_W4105A.data.gridData.rowset;
                    console.log(rowArr);
			        var errObj = data.fs_P4105_W4105A.errors;
			        if (errObj.length > 0) {
			            _.getErrorMsgs(errObj);
			            _.returnFromError();
			        } else if (inputRow.EXTRACT) {
                        _.postSuccess("Extracting data");

						var fieldObj = data.fs_P4105_W4105A.data;
						fieldObj["z_PCSM_46"].value = "'" + fieldObj["z_PCSM_46"].value;

						fieldObj["z_CSMT_44"].value = "'" + fieldObj["z_CSMT_44"].value;

						if (fieldObj.hasOwnProperty("z_LOTN_11")) {
							fieldObj["z_LOTN_11"].value = "'" + fieldObj["z_LOTN_11"].value;
						} else {
							fieldObj.z_LOTN_11 = {
                                id: 11, 
                                longName: 'Location',
                                internalValue: '',
                                title: 'LOTN',
                                value: ''
                            };
						}

                        $.each(fieldObj.gridData.rowset,function(key,object) {
                            if (fieldObj.gridData.rowset[key].hasOwnProperty("MOExist")) 
                                delete fieldObj.gridData.rowset[key].MOExist;
                                
                            if (fieldObj.gridData.rowset[key].hasOwnProperty("rowIndex")) 
                                delete fieldObj.gridData.rowset[key].rowIndex;
							fieldObj.gridData.rowset[key]["z_LEDG_24"].value = "'" + fieldObj.gridData.rowset[key]["z_LEDG_24"].value;
                            
                        });

                    _.appendTable(fieldObj, 0, true);
                    } else {
			            globals.htmlInputs = data.fs_P4105_W4105A.data;
			            globals.titleList = globals.htmlInputs.gridData.titles;
			            var rowsetArr = data.fs_P4105_W4105A.data.gridData.rowset;
		                var rowToUpdate = "add";

		                for (var i = 0; i < rowsetArr.length; i++) {
		                    if (rowsetArr[i].sCostMethod_24.value.toLowerCase() === inputRow.COST_METHOD.toLowerCase()) {
		                        rowToUpdate = rowsetArr[i].rowIndex;
		                    };
		                };
		                if (rowToUpdate === "add") {
		                	_.postSuccess("Adding Cost Method");
		                	self.addToGrid(inputRow);
		                } else {
		                	_.postSuccess("Updating Cost Method");
		                	self.updateGrid(inputRow,rowToUpdate);
		                }
			        }
			    } else {
			        _.postError("An unknown error occurred while entering the Cost Revisions form");
			        _.returnFromError();
			    }
			});
		};
		self.addToGrid = function(inputRow) {
			var reqObj = _.buildAppstackJSON({
				form: "W4105A",
				type: "close",
				dynamic: true,
				gridAdd: true,
				customGrid: true
			},["7",inputRow.UITM],["9",inputRow.BP],["19",inputRow.LOCNE1],["11",inputRow.LOTN],["grid","24",inputRow.COST_METHOD],["grid","27",inputRow.UNIT_COST],"4","4");

				_.getForm("appstack",reqObj).then(function(data){
				_.successOrFail(data,{successMsg:'Item Cost successfully added'});
			});
		};
		self.updateGrid = function(inputRow,rowToUpdate) {
			var reqObj = _.buildAppstackJSON({
				form: "W4105A",
				type: "close",
				dynamic: true,
				gridUpdate: true,
				customGrid: true, 
				rowToSelect: rowToUpdate
			},["grid","24",inputRow.COST_METHOD],["grid","27",inputRow.UNIT_COST],"4","4");

				_.getForm("appstack",reqObj).then(function(data){
				_.successOrFail(data,{successMsg:'Item Cost successfully updated',isGrid:true});
			});
		};
	};
	return new Process();
});
