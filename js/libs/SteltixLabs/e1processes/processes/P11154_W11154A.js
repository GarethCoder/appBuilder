define(['aisclient'],function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "EFT", // effective date
                id: 18
            }, {
                name: "CRRD", // effective rate divisor / Leg 2
                id: 33
            }, {
                name: "CLMETH", // calc meth
                id: 26
            }, {
                name: "CRCM", // conv meth
                id: 27
            }, {
                name: "CRR", // exchange rate multiplier / leg 1
                id: 32
            }, {
                name: "CSR", // spot rate
                id: 28
            }/*, {
				name: "CRCD",
				id: 22
			}*/],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "P11154_W11154A",
            closeID:"5"
        };
        self.isExtract = false;
        self.sysGenItemNum = "";
        self.noItemNum = false;
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
			inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);
            _.postSuccess("Processing row " + inputRow.ROW);

            // check of all required fields are in
            var reqdFieldsFound = true;
			if (inputRow.EXTRACT) // only need EFT for extracting
			{
				if (!inputRow.hasOwnProperty('EFT')) 
					reqdFieldsFound = false;

			} else {
				$.each(self.reqFields.titles,function(key,object) {
					if (!inputRow.hasOwnProperty(object.name)) 
						reqdFieldsFound = false;
				});
			}

            if (reqdFieldsFound) {
                // enter effective date and click the search button
                var reqObj = _.buildAppstackJSON({
                    form: "P11154_W11154A",
                    type: "open",
                },["18", inputRow.EFT],"40");

                _.getForm("appstack",reqObj).then(function(data){
                    if (data.hasOwnProperty("fs_P11154_W11154A")) { // is form being returned? if not, lets try add.
                        var rowArr = data.fs_P11154_W11154A.data.gridData.rowset;
                        var errObj = data.fs_P11154_W11154A.errors;
                        var noItems = rowArr.length === 0;
                        if (errObj.length > 0) {
                            _.getErrorMsgs(errObj);
                            _.returnFromError();
                        } else if (noItems && inputRow.EXTRACT && inputRow.EXTRACT.toLowerCase().search('y') !== -1) {
                            _.postError("No item found. Please add the item before attempting to extract the data.");
                            _.returnFromError();
                        } else if (noItems) {
                            _.postError("No items were found for the specified effective date.");
                            _.returnFromError();
                        } else if (rowArr.length > 0) {
							if (inputRow.EXTRACT)
							{
								var fieldObj = data.fs_P11154_W11154A.data;
								$.each(fieldObj.gridData.rowset,function(key,object) {
									if (fieldObj.gridData.rowset[key].hasOwnProperty("MOExist")) 
										delete fieldObj.gridData.rowset[key].MOExist;
									if (fieldObj.gridData.rowset[key].hasOwnProperty("rowIndex")) 
										delete fieldObj.gridData.rowset[key].rowIndex;
								});
								_.appendTable(fieldObj, 0, true);
								_.postSuccess("Extracting data");	
								
							} else {
	                            // Items were returned, we need to loop through and check if an add / update is required
		                        self.processRows(inputRow, rowArr);
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
            } else {
                _.postError("Required information missing.");
                _.returnFromError();
            }            
        };

        self.processRows = function(inputRow, dataRows) {

			var currencyRateFound = false;
            // check if we are updating effective date
            $.each(dataRows,function(key,object) {
                if (inputRow.TRCR == undefined)
                    inputRow.TRCR = '';

				// if from currency, calc meth, conv meth, eff rate multiplier, eff rate divisor, tri curr and spot rate match
				if (inputRow.CRCD == object.sFromCurrency_22.value && 
                    inputRow.CLMETH == object.chCalcMeth_26.value && 
                    inputRow.CRCM == object.chConvMeth_27.value && 
					inputRow.TRCR == object.sTriCurr_29.value &&
                    inputRow.CSR == object.chSpotRate_28.value)
				{
					currencyRateFound = true;
					var reqObj = _.buildAppstackJSON({
						form: "W11154A",
						type: "execute",
						gridUpdate: true,
						customGrid: true,
						rowToSelect: key,
					},["grid","32",inputRow.CRR],["grid","33",inputRow.CRRD],"12");

					_.getForm("appstack",reqObj).then(function(data){
							if (data.hasOwnProperty("fs_P11154_W11154A")) 
							{
								var errObj = data.fs_P11154_W11154A.errors;
                                var warningObj = data.fs_P11154_W11154A.warnings;

								if (errObj.length > 0) {
									_.getErrorMsgs(errObj);
									_.returnFromError();
								} 
                                else
                                if (warningObj.length > 0) {
                                    _.getErrorMsgs(warningObj);
									_.returnFromError();
                                }
                                else {
									_.postError("There was a problem updating Currency Exchange Rates Speed Revision");
									_.returnFromError();
								}
                                
							}
							else
							{
								_.postSuccess(" Currency Exchange Rates Speed Revision Updated.");            
								_.returnFromSuccess();      
							}
                          
                      });
				}
            });

            // if currency rate not found, do we want to add it?
            if (!currencyRateFound) { 
				_.postSuccess("No matching records found. Please add manually.");
				_.returnFromSuccess();
            }
        }
    };
    return new Process();
});
