/*** ADD Equipment Work Orders
/*
/* commented out code is for the DELETE function
/*
***/
define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [], // TO DO: fill these in!!
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W13700B",
            closeID: "16"
        };
        self.init = function() {

            var runOnce = function() {
                $('#outputHolder').append('<table class="' + globals.formNAME + '"></table>');
                $outputTable = $('#outputHolder .' + globals.formNAME);
                globals.outputList.push(globals.formNAME);
                $outputTable.append('<tr><td>Row Number</td><td>Work Order Number</td><td>Equipment Number</td><td>Description</td></tr>');
                runOnce = function() {return false};
            };
            runOnce();
            var inputRow = globals.inputRow = globals.processQ[0];

            if (!inputRow.hasOwnProperty("DCTO")) {
                _.postError("DCTO field must be specified before drop can continue.");
                _.returnFromError();
            } else {
                           
                _.postSuccess("Processing row " + inputRow.ROW);

                var reqObj = _.buildAppstackJSON({
                    form: "P13700_W13700B",
                    type: "open"
                },["186",inputRow.ASII],["1[20]",inputRow.DL01],["1[18]",inputRow.DOCO],
                ["1[19]",inputRow.DCTO],["1[188]",inputRow.TYPS],"15");

                _.getForm("appstack",reqObj).then(function(data) {
                    if (data.fs_P13700_W13700B.errors.length === 0) {
                        // if (inputRow.DELETE) {
                        //     if (inputRow.DELETE.toLowerCase() === "yes") {
                        //         _.postSuccess("Deleting record");
                        //         self.deleteRow(inputRow);
                        //     } else {
                        //         _.postError("Incorrect delete instruction -- please enter \"yes\" in the DELETE field to delete this record");
                        //         _.returnFromError();
                        //     }
                        // } else
                        if (data.fs_P13700_W13700B.data.gridData.rowset.length === 1) {
                        _.postError("Work Order found - Please use the template P13714_W13714B to update the record");
                        _.returnFromError();
                        } else {
                            _.postSuccess("Adding new record");
                            self.getAddForm(inputRow);
                        }
                    } else {
                        _.getErrorMsgs(data.fs_P13700_W13700B.errors);
                        _.returnFromError();
                    }
                });
            }
        };
        // self.selectRow = function(inputRow) {
        //     var selObj = _.buildAppstackJSON({form: "W13700B"},["1.0"],"14");
        //     globals.htmlInputs = data.fs_P13714_W13714A.data;
        //     _.getForm("appstack",selObj).then(function(data) {
        //         if (data.hasOwnProperty("fs_P13700_W13700B")) {
        //              var errObj = data.fs_P13700_W13700B.errors;
        //             if (errObj.length > 0) {
        //                 _.getErrorMsgs(errObj);
        //                 _.returnFromError();
        //             } else {
        //                 _.postError("Error selecting record")
        //                 _.returnFromError();
        //             }
        //         } else if (data.hasOwnProperty("fs_P13714_W13714B")) {
        //              var errObj = data.fs_P13714_W13714B.errors;
        //             if (errObj.length > 0) {
        //                 _.getErrorMsgs(errObj);
        //                 _.returnFromError();
        //             } else {
        //                 _.postSuccess("Updating work order");
        //                 self.submitDetails();
        //             }
        //         }
        //     })

        // };
        self.getAddForm = function(inputRow) {
            var reqObj1 = _.buildAppstackJSON({
                form: "W13700B"
            },"28");
            _.getForm("appstack",reqObj1).then(function(data) {
                reqObj1 = {};

                globals.htmlInputs = data.fs_P13714_W13714A.data;
                // $.each(globals.htmlInputs, function(i, o) {
                //     var tempObj = {};
                //     tempObj.name = i;
                //     tempObj.id = o.id;
                //     _.tempArr.push(tempObj);
                // });
                self.submitDetails(inputRow);
            });
        };
        // deleteRow: function(inputRow) {

        //     var delObj = _.buildAppstackJSON({form: "W13700B",type: "close"},"1.0","30","14");

        //     _.getForm("appstack",delObj).then(function(data) {
        //         delObj = {};

        //         if (data.hasOwnProperty("fs_P13700_W13700B")) {
        //             _.postSuccess("Record deleted");
        //             _.returnFromSuccess(inputRow); // DELETE
        //         } else {
        //             _.postError("Error with the delete operation");
        //             _.returnFromError(inputRow);
        //         }
        //     });
        // },
        self.submitDetails = function(inputRow) {
            var reqObj2 = _.buildAppstackJSON({
                form: "W13714A",
                dynamic: true
            },
            ["20", inputRow.ASII],
            ["17", inputRow.DL01],
         //   [inputRow.DCTO,"26"],
            ["38", inputRow.TYPS],
            "311"); // push "Save and Continue"
            _.getForm("appstack",reqObj2).then(function(data) {
                reqObj2 = {};
                if (data.hasOwnProperty("fs_P13714_W13714B")) {
                    var errObj = data.fs_P13714_W13714B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError(inputRow);
                    } else {
                        var woNum = data.fs_P13714_W13714B.data.txtOrderNumber_DOCO_39.value;
                        self.getWoNumber(inputRow,woNum); // pass Works Order number to returnFromSuccess() function
                    }
                } else if (data.hasOwnProperty("fs_P13714_W13714A")) {
                    var errObj = data.fs_P13714_W13714A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError(inputRow);
                    } else {
                        _.postError("Unknown error occured while submitting the record");
                        _.returnFromError(inputRow);
                    }
                } else if (data.hasOwnProperty("fs_P13700_13700B")) {
                    var errObj = data.fs_P13700_13700B.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError(inputRow);
                    } else {
                        _.postSuccess("Record successfully updated");
                        _.returnFromSuccess(inputRow);
                    }
                } else {
                    _.postError("Unknown return point of submitDetails function.");
                    _.returnFromError();
                }
            });
        };
        self.getWoNumber = function(inputRow, woNum) {
            var woObj = _.buildAppstackJSON({
                form: "W13714B",
                type: "close"
            },"32");
            _.getForm("appstack",woObj).then(function(data) {
                reqObj3 = {};

                // if ($("#outputHolder table").length === 0) {
                //    $("#outputHolder").append("<table><tr><td>" + inputRow.ROW + "</td><td>" + woNum + "</td><td>" + inputRow.ASII + "</td><td>" + inputRow.DL01 + "</td></tr></table>");
                // } else {
                    $("#outputHolder table").last().append("<tr><td>" + inputRow.ROW + "</td><td>" + woNum + "</td><td>" + inputRow.ASII + "</td><td>" + inputRow.DL01 + "</td></tr>");
                // }

                // var outputHTML = $("#outputHolder").html();
                // outputHTML = outputHTML.replace('<body>', '');
                // outputHTML = outputHTML.replace('</body>', '');
                // $("#outputHolder").html(outputHTML);

                globals.hasOutput(true);
                _.returnFromSuccess();
            });
        };
    };
    return new Process();
});