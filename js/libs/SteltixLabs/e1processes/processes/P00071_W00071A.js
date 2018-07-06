define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = { // IDs are for the A form
            titles: [{
                name: "EXTRACT",
                id: null,
            },{
                name: "MMCU",
                id: 6,
            },{
                name: "WDCT",
                id: 413,
            },{
                name: "WDCK",
                id: 411,
            },{
                name: "MT",
                id: 8,
            },{
                name: "VC02A",
                id: 416,
            },{
                name: "SHFT",
                id: 381,
            }],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W00071B",
            closeID: "5"
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            var reqObj = _.buildAppstackJSON({
                form: "P00071_W00071B",
                type: "open"
            },["8",inputRow.MMCU],["56", inputRow.WDCT],["52",inputRow.WDCK],["10", inputRow.MT],["36", inputRow.VC02A],["50", inputRow.SHFT],"6")

            _.getForm("appstack",reqObj).then(function(data){
                var errObj = data.fs_P00071_W00071B.errors;
                if (errObj.length > 0) {
                    _.getErrorMsgs(errObj);
                    _.returnFromError();
                } else if (data.fs_P00071_W00071B.data.gridData.rowset.length === 0) { // NEED helper function for writing to dataHolder
                    _.postSuccess("Adding new workday calendar revision")
                    self.getAddForm(inputRow); // ADD
                } else if (data.fs_P00071_W00071B.data.gridData.rowset.length > 0) {
                    self.selectRow(inputRow); // UPDATE OR EXTRACT
                }
            });
        };
        self.selectRow = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form:"W00071B"
            },"1.0","4");

            _.getForm("appstack",reqObj).then(function(data){
                // check that form is correct in response
                if (data.hasOwnProperty("fs_P00071_W00071A")) {
                    if ( inputRow.hasOwnProperty("EXTRACT") && inputRow.EXTRACT.toLowerCase().search("y") !== -1 ) {
                        _.postSuccess("Extracting data");
                        _.appendTable(data.fs_P00071_W00071A.data, self.reqFields.titles);
                    } else {
                        globals.htmlInputs = data.fs_P00071_W00071A.data;
                        _.postSuccess("Entering workday calendar revision");
                        self.updateRecord(inputRow);
                    }                    
                } else {
                    _.postError("Error selecting the row");
                    _.returnFromError();
                }
            });
        };
        self.getAddForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W00071B"
            },"42");

            _.getForm("appstack",reqObj).then(function(data){
                reqObj = {};

                globals.htmlInputs = data.fs_P00071_W00071A.data;
                console.log("inputs");
                console.log(globals.htmlInputs);

                self.insertNewRecord(inputRow,true);
            });
        };
        self.insertNewRecord = function(inputRow) {

            var reqObj = _.buildAppstackJSON({
                form: "W00071A",
                type: "close",
                dynamic: true
            },["6",inputRow.MMCU],["413", inputRow.WDCT],["411",inputRow.WDCK],["8", inputRow.MT],["416", inputRow.VC02A],["381", inputRow.SHFT],"3");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{ successMsg:'Workday calendar revision successfully added' });
            });
        };
        self.updateRecord = function(inputRow) {
            _.postSuccess("Updating workday calendar revision");
            var reqObj = _.buildAppstackJSON({
                form: "W00071A",
                type: "close",
                dynamic: true
            },"3");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{ successMsg:'Workday calendar revision successfully updated' });
            });
        }
    };
    return new Process();;
});