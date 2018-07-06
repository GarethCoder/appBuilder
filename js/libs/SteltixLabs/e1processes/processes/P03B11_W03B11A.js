define(['aisclient'], function(_){    

    /* NOTES

    - this process reads the entire spreadshet first before processing. If any issues, entire job stops.
    - grid__Amount To Distribute__ATAD__438 MUST be negative value
    - custom error processing has been implemented.

    */

    var Process = function(){
        var self = this;
        var invoiceList = []; 
        var lastCustomer = ''; 
        var invoiceObj = {};
        var totalRowRead = 0;
        var accountRow = 0;
        var currInvoiceObj = {}; // variable used for looping purposes
        var sheetErrors = 0;
        var rowsWithErrors = [];
        self.reqFields = {
            titles: [{
                "name": "CUSTOMER_NUMBER"
            },
            {
                "name": "ACCOUNT_NUMBER"
            }],
            isCustomTemplate: false
        },
        self.closeObj = {}, // stop dropZone from closing the find/browse for after an error
        self.isFirst = true,
        self.init = function() { // only use this for the very first row
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            totalRowRead++;
            accountRow=0;

            if (!inputRow.hasOwnProperty("CUSTOMER_NUMBER") || 
                !inputRow.hasOwnProperty("grid__Amount To Distribute__ATAD__438") ||
                !inputRow.hasOwnProperty("ACCOUNT_NUMBER")) {
                    // _.postError(globals.inputRow.ROW + ': ACCOUNT_NUMBER, CUSTOMER_NUMBER and grid__Amount To Distribute__ATAD__438 are required for sheet to be processed.');
                    // self.addErrorToTable(globals.inputRow.ROW + ': ACCOUNT_NUMBER, CUSTOMER_NUMBER and grid__Amount To Distribute__ATAD__438 are required for sheet to be processed.');
                    sheetErrors++;
                    rowsWithErrors.push(globals.inputRow.ROW);
            }
            else {
                if (lastCustomer !== inputRow.CUSTOMER_NUMBER) {
                    if (lastCustomer === '' || invoiceList[invoiceList.length-1].customerNumber !== inputRow.CUSTOMER_NUMBER) {
                        var invoiceObj = {};
                        invoiceObj.inputRows = [];
                        invoiceObj.customerIndex = totalRowRead;
                        invoiceObj.customerNumber = inputRow.CUSTOMER_NUMBER;
                        invoiceObj.accountNumbers = inputRow.ACCOUNT_NUMBER;
                        invoiceObj.accountAmounts = inputRow["grid__Amount To Distribute__ATAD__438"];
                        invoiceList.push(invoiceObj);
                        lastCustomer = inputRow.CUSTOMER_NUMBER;
                    }
                }

                invoiceList[invoiceList.length-1].inputRows.push(inputRow); 
            }
                
            if (totalRowRead === _.totalRows()) {
                $("#rawHolder table").empty(); // clear error table before actual errors begin
                $("#rawHolder table").append("<tr><td>Error Summary</td></tr>");
                $("#rawHolder table").append("<tr><td>Customer</td><td>Error</td></tr>");
                if (sheetErrors == 0) {
                    self.doInvoiceLoop();
                }
                else {
                    // errorRows(_.totalRows()-1);
                    // _.postError('Sheet could not be processed due to missing info on rows: '+rowsWithErrors.join(', ')+' (ACCOUNT_NUMBER, CUSTOMER_NUMBER and grid__Amount To Distribute__ATAD__438). Please fix and try again.')

                    var invoiceObj = {};
                    invoiceObj.customerIndex = 'NA';
                    invoiceObj.customerNumber = 'NA';
                    
                    self.addErrorToTable(invoiceObj, 'Sheet could not be processed due to missing info on rows: '+rowsWithErrors.join(', ')+' (ACCOUNT_NUMBER, CUSTOMER_NUMBER and grid__Amount To Distribute__ATAD__438). Please fix and try again.');
                    errorRows(_.totalRows()-1);
                    _.returnFromError();
                }
                    // _.returnFromSuccess();
            } else {
                _.postSuccess("Reading "+inputRow.ROW+" row.");
            }

            if (totalRowRead < _.totalRows()) 
                _.returnFromSuccess();

            /*

            if (self.isFirst.length === 0) { // using "execute" on subsequent rows keeps all rows as part of the same batch
                type = "open";
                self.isFirst = {};
            } else {
                type = "execute";
            }
            var reqObj = _.buildAppstackJSON({
                form: "P03B2002_W03B2002A",
                type: type
            },["289",inputRow.CUSTOMER_NUMBER], "62");

            _.getForm("appstack",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P03B11_W03B11A")) {
                    globals.htmlInputs = data.fs_P03B11_W03B11A.data;
                    globals.titleList = data.fs_P03B11_W03B11A.data.gridData.titles;
                    self.noResponse = false;
                    _.postSuccess("Inserting values");
                    self.addToGrid(inputRow);
                } else {
                    _.postError("An unknown error occurred while entering the ADD form");
                    _.returnFromError();
                }
            });
            */
        },

        self.doInvoiceLoop = function () {
                if (invoiceList.length > 0) {
                    invoiceObj = invoiceList[0];
                    //var type = "execute";
                    //if (self.isFirst)
                        type = "open";

                    var reqObj = _.buildAppstackJSON({
                            form: "P03B2002_W03B2002A",
                            type: type
                        }, ["289",invoiceObj.customerNumber], "62");

                    self.isFirst = false;

                    _.getForm("appstack",reqObj).then(function(data){
                            if (data.hasOwnProperty("fs_P03B11_W03B11A")) {
                                globals.htmlInputs = data.fs_P03B11_W03B11A.data;
                                globals.titleList = data.fs_P03B11_W03B11A.data.gridData.titles;
                                self.noResponse = false;
                                // _.postSuccess ("Inserting invoice");
                                self.addInvoiceRows(invoiceObj);
                            } else {
                                // _.postError("An unknown error occurred while entering the ADD form");
                                self.addErrorToTable("An unknown error occurred while entering the ADD form for customer: "+invoiceObj.customerNumber);
                                _.returnFromError();
                            }
                    });
                }
        }

        self.addInvoiceRows = function(invoiceObj) {
                // now add to the grid
                globals.processQ = invoiceObj.inputRows;
                globals.inputRow = invoiceObj.inputRows[0];
                _.postSuccess('Adding invoices rows for client: '+invoiceObj.customerNumber);

                var reqObj = _.buildAppstackJSON({
                    form: "W03B11A",
                    dynamic: true,
                    gridAddMultiple: true
                }, ["347",invoiceObj.customerNumber], "4");

                _.getForm("appstack",reqObj).then(function(data){
                    if (data.hasOwnProperty("fs_P03B11_W03B11C")) {
                        self.doCForm(invoiceObj);
                    }
                    else 
                    if (data.hasOwnProperty("fs_P03B11_W03B11A")) {
                        var errObj = data.fs_P03B11_W03B11A.errors;
                        if (errObj.length > 0) {
                            //_.getErrorMsgs(errObj);
                            // errorRows(errorRows() + 1);
                            self.doManualErrorHandling(invoiceObj, errObj);

                            invoiceList.shift();
                            if (invoiceList.length>0) {
                                accountRow = 0; 
                                self.doInvoiceLoop();
                            }
                            else {
                                totalRowRead = 0;
                                accountRow = 0;
                                // _.returnFromSuccess();
                                _.cleanUp();
                            }
                        } else {

                            var errObj = data.fs_P03B11_W03B11A.warnings;
                            if (errObj.length > 0) {

                                // force a tick click and if it then errors / warns, we post
                                var reqObj = _.buildAppstackJSON({
                                    form: "W03B11A"
                                },  "4");

                                _.getForm("appstack",reqObj).then(function(data){
                                    if (data.hasOwnProperty("fs_P03B11_W03B11C")) {
                                        self.doCForm(invoiceObj);
                                    }
                                });
                            } else {
                                // _.postError("An unknown error occurred while resubmitting the ADD form after warnings received.");
                                self.addErrorToTable("An unknown error occurred while resubmitting the ADD form after warnings received."+invoiceObj.customerNumber);
                                _.returnFromError();
                            }
                        } 
                    }
                });
        },

        self.doCForm = function (invoiceObj) {
            if (invoiceObj.inputRows.length>1) {
                var accountNumberArr = [];
                var accountAmounts = [];
                $.each(invoiceObj.inputRows, function (i, accNo){
                    var accArrTemp = invoiceObj.inputRows[i].ACCOUNT_NUMBER.split(';');
                    var accAmtTemp = invoiceObj.inputRows[i]["grid__Amount To Distribute__ATAD__438"].split(';');
                    accountNumberArr = $.merge( accountNumberArr, accArrTemp );
                    accountAmounts = $.merge( accountAmounts, accAmtTemp );
                });
            }
            else {
                var accountNumberArr = invoiceObj.accountNumbers.split(';');
                var accountAmounts = invoiceObj.accountAmounts.split(';');
            }

             if (accountNumberArr.length > 0) {
                self.doAccountLoop(accountNumberArr, accountAmounts, invoiceObj);
             }
        },

        self.doManualErrorHandling = function(invoiceObj, errorObj) {
            var errArr = [];
            $.each(errorObj, function(i, o) {
                errArr.push({
                    id: o.ERRORCONTROL,
                    msg: _.replaceUnicode(o.MOBILE)
                });
            });
            $.each(errArr, function(i, o) {
               // $("#rawHolder table").find("td:last").after("<td>" + o.msg + "</td>");
               // errorRows(errorRows() + 1);
               self.addErrorToTable(invoiceObj, o.msg);
            });
        },

        self.addErrorToTable = function (invoiceObj, errorMsg) {
            if ($('#rawHolder table').find('tr.'+invoiceObj.customerIndex).length > 0) {
                $("#rawHolder table").find('tr.'+invoiceObj.customerIndex).append("<td>" + errorMsg + "</td>");
            }
            else {
                $("#rawHolder table").append('<tr class="'+invoiceObj.customerIndex+'"><td>'+invoiceObj.customerNumber+'</td><td>' + errorMsg + '</td></tr>');
                errorRows(errorRows() + 1);
            }
        }

        self.doAccountLoop = function (accountList, accountAmountList, invoiceObj) {
            if (accountList.length > 0) {
                accountNoObj = accountList[0];
                accountAmtObj = accountAmountList[0];
                _.postSuccess('Adding G/L Distribution information for client: '+invoiceObj.customerNumber);
                globals.inputRow = [];

                if (accountList.length > 1) {
                    var reqObj = _.buildAppstackJSON({
                                 form: "W03B11C",
                                 gridUpdate: true,
                                 customGrid: true,
                                 rowToSelect: accountRow,
                                 suppressDynamicGrid: "true"
                    },["grid","38",$.trim(accountNoObj)], ["grid", "124",$.trim(accountAmtObj)]);
                }
                else {
                    var reqObj = _.buildAppstackJSON({
                                 form: "W03B11C",
                                 gridUpdate: true,
                                 customGrid: true,
                                 rowToSelect: accountRow,
                                 suppressDynamicGrid: "true"
                    },["grid","38",$.trim(accountNoObj)], ["grid", "124",$.trim(accountAmtObj)], "4");
                }

                accountRow++;

                _.getForm("appstack",reqObj).then(function(data){
                    if (data.hasOwnProperty("fs_P03B11_W03B11C")) {
                        accountList.shift();
                        accountAmountList.shift();
                        if (accountList.length>0) 
                            self.doAccountLoop(accountList, accountAmountList, invoiceObj);
                        else {
                            if (data.fs_P03B11_W03B11C.hasOwnProperty("errors")) {
                                var errObj = data.fs_P03B11_W03B11C.errors;
                                if (errObj.length > 0) {
                                    //_.getErrorMsgs(errObj);
                                    self.doManualErrorHandling(invoiceObj, errObj);
                                    _.returnFromError;
                                }
                            }

                            if (data.fs_P03B11_W03B11C.hasOwnProperty("warnings")) {
                                var errObj = data.fs_P03B11_W03B11C.warnings;
                                if (errObj.length > 0) {
                                    self.doManualErrorHandling(invoiceObj, errObj);
                                    _.returnFromError;
                                }
                            }

                            invoiceList.shift();
                            if (invoiceList.length>0) {
                                accountRow = 0; 
                                self.doInvoiceLoop();
                            }
                            else {
                                totalRowRead = 0;
                                accountRow = 0;
                                _.cleanUp();
                            }
                        }
                    }
                    else
                    if (data.hasOwnProperty("fs_P03B11_W03B11A")) {
                        // we know it was successful
                        invoiceList.shift();
                        if (invoiceList.length>0) {
                            accountRow = 0; 
                            self.doInvoiceLoop();
                        }
                        else {
                            totalRowRead = 0;
                            accountRow = 0;
                            invoiceList = []; 
                            lastCustomer = ''; 
                            invoiceObj = {};
                            currInvoiceObj = {}; // variable used for looping purposes
                            sheetErrors = 0;
                            rowsWithErrors = [];
                           // if (errorRows() === 0)
                             //   $('#rawHolder table').empty();
                            _.returnFromSuccess();
                            _.cleanUp();
                        }
                    }
                });
            }
        }
    };
    return new Process();
});