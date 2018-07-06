define(['aisclient'],function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [{
                name: "AIT",
                id: 6,
            },{
                name: "ALKY",
                id: 30,
            }],
            isCustomTemplate: false
        };
    	self.closeObj = {
    		subForm: "W03B31G",
    		closeID:"4"
    	};

    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            if (inputRow.hasOwnProperty("AIT") && inputRow.hasOwnProperty("ALKY")) {
                var reqObj = _.buildAppstackJSON({
                    form: "P03B31_W03B31A",
                    type: "open",
                    //returnControlIDs: true
                }, "29");

                _.getForm("appstack",reqObj).then(function(data){
                    if (data.hasOwnProperty("fs_P03B31_W03B31G")) {
                        var errObj = data.fs_P03B31_W03B31G.errors;
                        if (errObj.length > 0) {
                            _.getErrorMsgs(errObj);
                            _.returnFromError();
                        } else {
                            var reqObj = _.buildAppstackJSON({
                                form: "W03B31G",
                                type: "execute",
                                //returnControlIDs: true
                            }, ["6",inputRow.AIT],
                            ["30",inputRow.ALKY],
                            ["18",inputRow["txt__Activity Date__DTI__18"]],
                            ["16",inputRow["txt__Company__CO__16"]],
                            ["12",inputRow["txt__Amount 1__AA1__12"]],
                            ["10",inputRow["txt__Amount 2__AA2__10"]],
                            ["22",inputRow["txt__Remark__RMK__22"]],
                            ["28",inputRow["txt__Activity Priority__AIPR__28"]], "3");

                            _.getForm("appstack", reqObj).then(function(){
                                if (data.hasOwnProperty("fs_P03B31_W03B31G")){
                                    if (errObj.length > 0) {
                                        _.getErrorMsgs(errObj);
                                        _.returnFromError();
                                    } else {
                                        _.successOrFail(data, {
                                            successMsg: 'Activity Log entered'
                                          });
                                    }
                                }
                            })
                            
                        }
                    } else {
                        _.postError("Form Response unexpected. Errors in processing");
                        _.returnFromError();
                    }
                });
            } else {
                _.postError("Key Values not entered");
                _.returnFromError();
                // self.noItemNum = true;
                // _.postSuccess("Adding Item");
                // self.getAddForm(inputRow);
            }            
        };

    };
    return new Process();
});