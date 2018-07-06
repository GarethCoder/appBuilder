define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "RTNM"
            }],
            isCustomTemplate: false
        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            var reqObj = _.buildFormRequestJSON({
                form: "P4972_W4972I"
            },["input","14",inputRow.RTNM]);

            _.getForm("formrequest",reqObj).then(function(data){
                if (data.hasOwnProperty("fs_P4972_W4972I")) {
                    var errObj = data.fs_P4972_W4972I.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj);
                        _.returnFromError();
                    } else {
                        globals.htmlInputs = data.fs_P4972_W4972I.data;
                        _.postSuccess("Rate Detail Revision found");
                        self.getRateDetailFormStep2(inputRow);
                    }
                } else {
                    _.postError("An unknown error occurred during step 1");
                    _.returnFromError();
                }            
            });
        };
        self.getRateDetailFormStep2 = function(inputRow) {
            var reqObj = _.buildFormRequestJSON({
                form: "P4972_W4972I",
                dynamic: true
            },["input","14",inputRow.RTNM],"11");

            _.getForm("formrequest",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Rate Detail Revisions form updated'});
            });
        };
    };
    return new Process();
});