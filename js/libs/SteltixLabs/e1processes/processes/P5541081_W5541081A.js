define(['aisclient'],function(_){
    var Process = function () {
        var self = this;
        self.reqFields = { // Specify ALL required fields
            titles: [{
                "name": "DOCO", // Order Number
                "id": 20 // AIS id
            },
            {
                "name": "AN8", // Address Number
                "id": 89
            },
            {
                "name": "MMCU", // Branch
                "id": 21
            },
            {
                "name": "LITM", // 2nd Item Number 
                "id": 23
            },
            {
                "name": "FRKSCUS1", // From Customer Serial
                "id": 78
            },
            {
                "name": "TTKSCUS1", // Thru Customer Serial
                "id": 82
            }],
            isCustomTemplate: true
        };

    	self.closeObj = {
    		subForm: "W5541081C", // 
            closeID: "16" // Close button
    	};
        
        self.isExtract = false;
        self.totalBatchCount = 50;
        self.incrementalBatchCount = 10;

        self.init = function () { // Initially seeing if there are any rows
            
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            // if (inputRow.hasOwnProperty("DOCO")) { // Title on left takes priority and is most important
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);
            if (inputRow.EXTRACT) {
                var reqObj = _.buildAppstackJSON({ // Building our request OBJECT
                    form: "P5541081_W5541081A", // Entry Form
                    type: "open", // Always start with open
                    returnControlIDs: "1[45,28]"
                },
                    ["23", inputRow.LITM],
                    ["1[94]", inputRow.CO],
                    ["1[45]", inputRow.RKSASNI],
                    "15"); // Anything that follows the object is a reflection of required fields and their AIS ID's
                
                reqObj.formRequest.maxPageSize = self.totalBatchCount.toString();
                if (inputRow.hasOwnProperty("PAGESIZE")) {
                    reqObj.formRequest.maxPageSize = parseInt(inputRow.PAGESIZE);
                }
                if (inputRow.hasOwnProperty("INCSIZE")) {
                    self.incrementalBatchCount = parseInt(inputRow.INCSIZE);
                }
                   
                _.getForm("appstack", reqObj).then(function (data) {
                    if (data.hasOwnProperty("fs_P5541081_W5541081A")) { // Checking for entry form
                        var rowArr = data.fs_P5541081_W5541081A.data.gridData.rowset; // Get rowset back from json object
                        var errObj = data.fs_P5541081_W5541081A.errors;  // Get errors back from json object
                        var rowLength = rowArr.length;

                        var serialNumbers = [];
                        if (rowLength > 0) {
                            $.each(rowArr, function (index, object) {
                                serialNumbers.push(
                                {
                                    "formName" : "P5541081_W5541081B",
                                    "formInputs":[{
                                        "value": object['sAclaraSerialNumber_45'].value,
                                        "id":"3" // Serial Number
                                    },{
                                        "value": object['s2ndItemNumber_28'].value,
                                        "id":"4" // 2nd Item number
                                    }]
                                }
                            );
                            })
                            
                            if (serialNumbers.length > 0) {
                                // var loopCount = Math.ceil(serialNumbers.length / self.incrementalBatchCount);
                                // var startIndex = 0;
                                self.loopingTheBird(0, serialNumbers);
                            } else {
                                _.postError("No records found");
                                _.returnFromError();
                            }
                        }
                    }
                    
                })
                
            } else {
                var reqObj = _.buildAppstackJSON({ // Building our request OBJECT
                    form: "P5541081_W5541081A", // Entry Form
                    type: "open" // Always start with open
                    // returnControlIDs: "1[123]"
                    // maxPageSize: 1000
                },
                    ["23", inputRow.LITM],
                    ["1[94]", inputRow.CO],
                    ["1[45]", inputRow.RKSASNI],
                    "15"); // Anything that follows the object is a reflection of required fields and their AIS ID's
            

                _.getForm("appstack", reqObj).then(function (data) {
                    if (data.hasOwnProperty("fs_P5541081_W5541081A")) { // Checking for entry form
                        var rowArr = data.fs_P5541081_W5541081A.data.gridData.rowset; // Get rowset back from json object
                        var errObj = data.fs_P5541081_W5541081A.errors;  // Get errors back from json object
                        var rowLength = rowArr.length;
                        if (errObj.length > 0) { // If an error exists then...
                            _.getErrorMsgs(errObj); // Get the specific error
                            _.returnFromError(); // Return error
                        } else if (rowArr.length >= 1) {
                            if (rowArr.length === 1) {
                                _.postSuccess('Record Found');
                                self.selectRow(inputRow);
                            } else if (inputRow.EXTRACT) {
                                // add to input Row
                                for (var i = 1; i < rowArr.length; i++) {
                                    var inputRowCopy = JSON.parse(JSON.stringify(inputRow));
                                    inputRowCopy.LITM = rowArr[i].sHdCd_4.value;
                                    inputRowCopy.CO = rowArr[i].sBranchPlant_6.value;
                                    inputRowCopy.RKSASNI = rowArr[i].sBranchPlant_6.value;
                                    globals.processQ.push(inputRowCopy);
                                }

                                _.postSuccess("Records found");
                                self.selectRow(inputRow);
                            } else { // If anything else happens after data was returned display an error
                                _.postError("There was a problem finding the requested record, or there are duplicates");
                                _.returnFromError();
                            }
                        } else if (rowArr.length === 0) { // If nothing exists in array get the Add Form. Jump to getAddForm method
                            _.postSuccess("Adding record");
                            self.getAddForm(inputRow);
                        } else { // If no data was returned then display a general error
                            _.postError("An unknown error occurred in the find/browse form");
                            _.returnFromError();
                        }
                    }
                });
            }
        }

        self.loopingTheBird = function (startIndex, serialNumbers) {
            // for (var x = 0; x <= loopCount; x++) {
                // var finishedIndex = (x * self.incrementalBatchCount) + self.incrementalBatchCount;
            var finishedIndex = startIndex + self.incrementalBatchCount;
            
                var reqObj = _.buildFormRequestJSON({
                    form: "W5541081B", // Entry Form
                    type: "open", // Always start with open
                });
                delete reqObj.formInputs;
                delete reqObj.formActions;
                
            reqObj.formRequests = serialNumbers.slice(startIndex, finishedIndex + 1);
            if (reqObj.formRequests.length > 0) {
                _.getForm("batchrequest", reqObj).then(function (data) {
                    
                    var counter = 0;

                    if (data.hasOwnProperty("fs_" + counter + "_P5541081_W5541081B")) {
                        while (data.hasOwnProperty("fs_" + counter + "_P5541081_W5541081B")) {
                            var fieldObj = data["fs_" + counter + "_P5541081_W5541081B"].data;
                            $.each(fieldObj.gridData.rowset, function (key, notReallyUsed) {
                                if (fieldObj.gridData.rowset[key].hasOwnProperty("MOExist")) {
                                    delete fieldObj.gridData.rowset[key].MOExist;
                                }
                                if (fieldObj.gridData.rowset[key].hasOwnProperty("rowIndex")) {
                                    delete fieldObj.gridData.rowset[key].rowIndex;
                                }
                            });
                            _.appendTable(fieldObj, 0, true);
                            counter++;
                        }
                        
                    } else {
                        _.postError("No records returned.");
                        _.returnFromError();
                    }

                    var newIndex = finishedIndex + 1;
                    if (serialNumbers.length >= newIndex) {
                        globals.showExtractButton(false);
                        self.loopingTheBird(newIndex, serialNumbers);
                    } else {
                        globals.showExtractButton(true);
                        _.postSuccess("Successfully extracting batch data");
                        _.returnFromSuccess();
                    }
                        
                })
            } else {
                globals.showExtractButton(true);
                _.postSuccess("Successfully extracting batch data");
                _.returnFromSuccess();
            }
            
            // }
        }
            // } else { // If DOCO wasn't found display an error
            //     _.postError("There was a problem finding the requested record, or ensure all required fields have values.");
            //     _.returnFromError();
            // }
        self.selectRow = function(inputRow) { // Moving into the selection class
            var optionsObj = {
                form: "W5541081A" // Still on form W5541081A
            };

            if (inputRow.EXTRACT) {
                optionsObj.aliasNaming = true;
            } else {
                if (globals.htmlInputs.length === 0) {  // first row processed
                    optionsObj.returnControlIDs = true;
                    optionsObj.type = "close";
                } else {
                    optionsObj.turbo = true;
                }
			}

            var reqObj = _.buildAppstackJSON(optionsObj,"1.0","14"); // Row number at position 2. Getting the requested Object
            _.getForm("appstack",reqObj).then(function(data){ // Passing in the requested object and wait for data to return
                if (data.hasOwnProperty("fs_P5541081_W5541081B")) { // If Selected Row, Form P5541081_W5541081B exists, do the following...
                    var errObj = data.fs_P5541081_W5541081B.errors; // Getting all the errors from the json
                    if (errObj.length > 0) { // Return errors if any
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
                            globals.htmlInputs = data.fs_P5541081_W5541081B.data; // Store data in globals.htmlInputs
                        }
                        _.postSuccess("Entering the Revisions form"); // Post success message

						if (inputRow.EXTRACT) {
							var fieldObj = data.fs_P5541081_W5541081B.data;
							if (fieldObj.hasOwnProperty('gridData')) {
								$.each(fieldObj.gridData.rowset,function(key,object) {
										if (fieldObj.gridData.rowset[key].hasOwnProperty("MOExist")) 
											delete fieldObj.gridData.rowset[key].MOExist;
										if (fieldObj.gridData.rowset[key].hasOwnProperty("rowIndex")) 
											delete fieldObj.gridData.rowset[key].rowIndex;			
								});
							}

							_.appendTable(fieldObj, 0, true);
							_.postSuccess("Extracting data");
						} else {
							self.updateForm(inputRow); // Update form with relevant input row
						}
                    }
                } else { // If form P5541081_W5541081B wasn't found the display errors
                    var errObj = data.fs_P5541081_W5541081A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        _.postError("There was a problem entering the Revisions form");
                        _.returnFromError();
                    }
                }
            });
        };
        self.updateForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({ // Build out Request Object to update form
                form: "W5541081B", // On the Update form
                type: "close",
                gridUpdate: true,
                customGrid: true,
				rowToSelect: 0
            },  
				["grid","18",inputRow.AN8], // Customer Number *
				["grid","17",inputRow.DOCO], // Works Order Number *
				["grid","19",inputRow.LANO], // Lessor Address *
                ["grid","20",inputRow.LNID], // Line Number * 
                ["grid","21",inputRow.MMCU], // Branch *
                ["grid","22",inputRow.LITM], // 2nd Item Number * 
				["grid","23",inputRow.ITM], // Short Item Number * 

				["grid","48",inputRow.RORN], // Related PO/SO/WO Number  *	
				["grid","85",inputRow.CO], // Company  *
				["grid","24",inputRow.RKSASNI], // ANSI Serial Number * 
				["grid","25",inputRow.PRODF], // Product Family *
				["grid","26",inputRow.PRODM], // Product Model * 
				["grid","27",inputRow.ADDJ], // Actual Ship Date * 
				["grid","84",inputRow.RKSPOL], // Customer PO Line Number *
				["grid","83",inputRow.RKSPLV], // Box License Plate number *
				["grid","82",inputRow.RKSPLP], // Pallet License Plate Number * 

				["grid","28",inputRow.RKSADD1], // Additional Serial Number #1 * 
                ["grid","29",inputRow.RKSADD2], // Additional Serial Number #2 * 
                ["grid","30",inputRow.RKSADD3], // Additional Serial Number #3 *
                ["grid","31",inputRow.RKSADD4], // Additional Serial Number #4 *
                ["grid","32",inputRow.RKSADD5], // Additional Serial Number #5 * 
                ["grid","33",inputRow.RKSADD6], // Additional Serial Number #6 *
                ["grid","34",inputRow.RKSADD7], // Additional Serial Number #7 *
                ["grid","35",inputRow.RKSADD8], // Additional Serial Number #8 *
                ["grid","36",inputRow.RKSADD9], // Additional Serial Number #9 *
                ["grid","37",inputRow.RKSADD10], // Additional Serial Number #10 *
				["grid","38",inputRow.RKSBOX], // Box Number * 
				["grid","39",inputRow.RKSCITM], // Customer Part Number *
				["grid","40",inputRow.RKSCUS1], // Customer Serial #1 *
                ["grid","41",inputRow.RKSCUS2], // Customer Serial #2 *
                ["grid","42",inputRow.RKSCUS3], // Customer Serial #3 * 
                ["grid","43",inputRow.RKSCUS4], // Customer Serial #4 *
                ["grid","44",inputRow.RKSCUS5], // Customer Serial #5 *
				["grid","45",inputRow.RKSPEN], // Pallet End Number *
				["grid","46",inputRow.RKSPON], // Customer PO Number *
				["grid","47",inputRow.RKSSTAT], // Create/Update/Labels Printed *
				["grid","49",inputRow.UORG], // Quantity Ordered *

				["grid","50",inputRow.URSTR01], // User Defined String 1 * 
				["grid","51",inputRow.URSTR02], // Firmware Number *
                ["grid","52",inputRow.URSTR03], // User Defined String 3 *
                ["grid","53",inputRow.URSTR04], // User Defined String 4 *
                ["grid","54",inputRow.URSTR05], // User Defined String 5 *
                ["grid","55",inputRow.URSTR06], // User Defined String 6 *
                ["grid","56",inputRow.URSTR07], // User Defined String 7 *
                ["grid","57",inputRow.URSTR08], // User Defined String 8 * 
                ["grid","58",inputRow.URSTR09], // User Defined String 9 *
                ["grid","59",inputRow.URSTR010], // User Defined String 10 *

				["grid","60",inputRow.WARJ], // Waranty Expiration *
				["grid","61", inputRow.WRLF], // Waranty Days *
				["grid","79", inputRow.VR03], // Data Dictionary Item *
                "12"); 

            _.getForm("appstack",reqObj).then(function(data){ // Get update form, pass in the request object and get the data back
                _.successOrFail(data,{successMsg: "Record updated",isGrid: true}); // Handle successful message
            });
        };
        self.getAddForm = function(inputRow) {
            
            var form = "W5541081A"; // else, execute form if item number was found
        	var type = "execute";
            
            if (globals.htmlInputs.length === 0) { // only an empty array when first declared. When populated with data, it is an object.
            	var reqObj = _.buildAppstackJSON({ // Build request Object
                    form: form,
                    type: type,
                    // returnControlIDs: true
                }, "91");
        }
            _.getForm("appstack",reqObj).then(function(data){ // Get form data back
                if (data.hasOwnProperty("fs_P5541081_W5541081C")) {
                    var errObj = data.fs_P5541081_W5541081C.errors; // Get errors back from data object
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj); // Return the errors
                        _.returnFromError();
                    } else {
    	                if (globals.htmlInputs.length === 0) { // Will only be true if no data has ever been added to that key
    			    		globals.htmlInputs = data.fs_P5541081_W5541081C.data; // Store values in globals.htmlInputs variable
    	                }
                        self.addForm(inputRow); // Add new data
                        _.postSuccess("Entering new Record data");
    	            }
                } else { // Else if no data comes back show and error
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }
            });
        };
        self.addForm = function(inputRow) {
        	var optionsObj = {};
        		optionsObj = {
                    form: "W5541081C",
                    type: "close",
                    gridAdd: true,
                    customGrid: true,
                    dynamic: true,
                    // returnControlIDs: true,
                };

            var reqObj = _.buildAppstackJSON(optionsObj,
                ["grid","18", inputRow.DOCO], // Works Order Number *
                ["grid","17",inputRow.AN8], // Customer Number *
                ["grid","21",inputRow.RORN], // Related PO/SO/WO Number  (changed from 48 to 21) *
                ["grid","70",inputRow.CO], // Company (Chanegd from 85 to 70) *
                ["grid","25",inputRow.RKSASNI], // ANSI Serial Number * 
                ["grid","19",inputRow.LANO], // Lessor Address *
                ["grid","20",inputRow.LNID], // Line Number * 
                ["grid","22",inputRow.MMCU], // Branch *
                ["grid","23",inputRow.LITM], // 2nd Item Number * 
                ["grid","24",inputRow.ITM], // Short Item Number * 
                ["grid","26",inputRow.PRODF], // Product Family * 
                ["grid","27",inputRow.PRODM], // Product Model * 
                ["grid","28",inputRow.ADDJ], // Actual Ship Date * 
                ["grid","29",inputRow.RKSPOL], // Customer PO Line Number *
                ["grid","31",inputRow.RKSPLV], // Box License Plate number *
                ["grid","30",inputRow.RKSPLP], // Pallet License Plate Number * 
                ["grid","32",inputRow.RKSADD1], // Additional Serial Number #1 * 
                ["grid","33",inputRow.RKSADD2], // Additional Serial Number #2 * 
                ["grid","34",inputRow.RKSADD3], // Additional Serial Number #3 *
                ["grid","35",inputRow.RKSADD4], // Additional Serial Number #4 *
                ["grid","36",inputRow.RKSADD5], // Additional Serial Number #5 * 
                ["grid","37",inputRow.RKSADD6], // Additional Serial Number #6 *
                ["grid","38",inputRow.RKSADD7], // Additional Serial Number #7 *
                ["grid","39",inputRow.RKSADD8], // Additional Serial Number #8 *
                ["grid","40",inputRow.RKSADD9], // Additional Serial Number #9 *
                ["grid","41",inputRow.RKSADD10], // Additional Serial Number #10 *
                ["grid","42",inputRow.RKSBOX], // Box Number * 
                ["grid","43",inputRow.RKSCITM], // Customer Part Number *
                ["grid","44",inputRow.RKSCUS1], // Customer Serial #1 *
                ["grid","45",inputRow.RKSCUS2], // Customer Serial #2 *
                ["grid","46",inputRow.RKSCUS3], // Customer Serial #3 * 
                ["grid","47",inputRow.RKSCUS4], // Customer Serial #4 *
                ["grid","48",inputRow.RKSCUS5], // Customer Serial #5 *
                ["grid","49",inputRow.RKSPEN], // Pallet End Number *
                ["grid","50",inputRow.RKSPON], // Customer PO Number *
                ["grid","51",inputRow.RKSSTAT], // Create/Update/Labels Printed *
                ["grid","52",inputRow.UORG], // Quantity Ordered *
                ["grid","53",inputRow.URSTR01], // User Defined String 1 * 
                ["grid","55",inputRow.URSTR03], // User Defined String 3 *
                ["grid","56",inputRow.URSTR04], // User Defined String 4 *
                ["grid","57",inputRow.URSTR05], // User Defined String 5 *
                ["grid","58",inputRow.URSTR06], // User Defined String 6 *
                ["grid","59",inputRow.URSTR07], // User Defined String 7 *
                ["grid","60",inputRow.URSTR08], // User Defined String 8 * 
                ["grid","61",inputRow.URSTR09], // User Defined String 9 *
                ["grid","62",inputRow.URSTR010], // User Defined String 10 *
                ["grid","54",inputRow.URSTR02], // Firmware Number *
                ["grid","63",inputRow.WARJ], // Waranty Expiration *
                ["grid", "64", inputRow.WRLF], // Waranty Days *
                "12");
            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg: "Record added",isGrid: true});
            });
        };
    };
    return new Process();
});