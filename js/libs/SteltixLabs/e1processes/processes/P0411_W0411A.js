define(['aisclient'], function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [],
            isCustomTemplate: false
        };
        self.closeObj = {
            subForm: "W0411A",

            closeID: "3"

        };
        self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);
            inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

            // setup json for http request
            var reqObj = _.buildAppstackJSON({
                    form: "P0411_W0411G",
                    type: "open",
                    aliasNaming: true
            } /*,["11.37",inputRow.DOC],["11.38",inputRow.DCT],["11.39",inputRow.KCO],["11.52",inputRow.SFX]*/,"56");

            _.getForm("appstack",reqObj).then(function(data) {
                reqObj = {};
                var errObj = data.fs_P0411_W0411G.errors;
                if (errObj.length > 0) { // errors
                    _.getErrorMsgs(errObj);
                    _.returnFromError(inputRow);
                } else { // no errors
                        // must check if we're ADDING or UPDATING
                        /*var rowArr = data.fs_P0411_W0411G.data.gridData.rowset;
                        var rowObj = data.fs_P0411_W0411G.data;

                        if (rowArr.length === 0) { */
                            _.postSuccess("Adding record");
                            self.add(inputRow);
                        /*} else {
                            _.postSuccess("Record Found in Grid");
                            self.update(inputRow);
                        }*/
                }
            });
        };
        self.add = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W0411G",
                type: "execute"
            }, "34");

            _.getForm("appstack",reqObj).then(function(data) {
                if (data && data.hasOwnProperty("fs_P0411_W0411A")) { 
                    var errObj = data.fs_P0411_W0411A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj,"Error",true);
                        _.returnFromError();
                    } 
                    else {

                        var reqObj = _.buildAppstackJSON({
                            form: "W0411A",
                            type: "execute",
                            aliasNaming: true,
                            dynamic: true
                        });

                        _.getForm("appstack",reqObj).then(function(data) {

                            var reqObj = _.buildAppstackJSON({
                                form: "W0411A",
                                type: "execute",
                                gridAdd: true
                            });

                            _.getForm("appstack",reqObj).then(function(data) {
                                if (data && data.hasOwnProperty("fs_P0411_W0411A"))
                                    self.submitForm(inputRow, true);
                            }); /* end get form */
                        });
                    }
                }
            });
        };

        self.submitForm = function(inputRow, firstAttempt) {
            var reqObj = _.buildAppstackJSON({
                form: "W0411A"
            }, "2");

            _.getForm("appstack",reqObj).then(function(data) {
                if (data && data.hasOwnProperty("fs_P0411_W0411A")) {
                    var errObj = data.fs_P0411_W0411A.errors;
                    if (errObj.length > 0) {
                        _.getErrorMsgs(errObj,"Error",true);
                        _.returnFromError();
                    } 

                    var warningObj = data.fs_P0411_W0411A.warnings;
                    if (warningObj.length > 0) {
                        if (firstAttempt) {
                            self.submitForm(inputRow, false);
                            return;
                        }
                        else {
                            _.getErrorMsgs(warningObj);
                            _.returnFromError();
                        }
                    }
                } else
                if (data && data.hasOwnProperty("fs_P0411_W0411K")) {
                    var reqObj = _.buildAppstackJSON({
                        form: "W0411K",
                        type: "execute",
                        aliasNaming: true,
                        gridAdd: true,
						customGrid: true
                    },["grid", "30", inputRow.ACCNO],"2");

                    _.getForm("appstack",reqObj).then(function(data) {
                        if (data && data.hasOwnProperty("fs_P0411_W0411K")) {
                            var errObj = data.fs_P0411_W0411K.errors; 
                            if (errObj.length > 0) {
                                _.getErrorMsgs(errObj,"Error",true);
                                _.returnFromError();
                            } 
        
                            var warningObj = data.fs_P0411_W0411K.warnings; 
                            if (warningObj.length > 0) {
                                var reqObj = _.buildAppstackJSON({
                                    form: "W0411K",
                                    type: "execute",
                                    aliasNaming: true,
                                    gridAdd: true,
                                }, "2");

                                _.getForm("appstack", reqObj).then(function (data) {
                                    _.successOrFail(data,{successMsg: "Successfully Processed.", successCb:self.closeForm});
                                });
            
                            }
                        } else
                            _.successOrFail(data,{successMsg: "Successfully Processed.", successCb:self.closeForm});
                    });

                } else
                    self.submitExplanation(inputRow, data);
            });
        }

        self.submitExplanation = function (inputRow, data) {
            if (data && data.hasOwnProperty("fs_P0411_W0411B")) {
                var errObj = data.fs_P0411_W0411B.errors;
                if (errObj.length > 0) {
                    _.getErrorMsgs(errObj, "Error", true);
                    _.returnFromError();
                } else {

                    var reqObj = _.buildAppstackJSON({
                        form: "W0411B",
                        type: "execute",

                        aliasNaming: true
                    }, ["74", inputRow.ACCNO], ["11", inputRow.EXPL], "3");

                    _.getForm("appstack", reqObj).then(function (data) {
                        _.successOrFail(data, { successMsg: "Record Added Successfully.", successCb:self.closeForm });
                    });
                }
            }
        };

        // last step is to close Customer Revisions
        self.closeForm = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                form: "W0411A",
                type: "close",
                turbo: true
            },"11");

            _.getForm("appstack",reqObj).then(function(data){
                _.successOrFail(data,{successMsg:'Customer Revisions form closed'});
            });
        };
    };
    return new Process();
});