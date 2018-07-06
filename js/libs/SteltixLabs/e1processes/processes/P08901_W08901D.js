define(['aisclient'],function(_){
    var Process = function(){
        var self = this;
        self.reqFields = {
            titles: [/*{
                name: "ENDYOW",
                id: 86
            }, */ {
                name: "ALPH",
                id: "28"
            }, {
                name: "DBEN",
                id: 132
            }, {
                name: "RELA",
                id: 130
            }, {
                name: "SEX",
                id: 34
            }],
            isCustomTemplate: false
        };
    	self.closeObj = {
    		subForm: "W08901D",
    		closeID:"12"
    	};
        self.isExtract = false;
    	self.sysGenItemNum = "";
    	self.noItemNum = false;
    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

            if (inputRow.hasOwnProperty("SEX") &&
                inputRow.hasOwnProperty("ALPH") &&
                inputRow.hasOwnProperty("RELA") &&
                inputRow.hasOwnProperty("DBEN") /* &&
                inputRow.hasOwnProperty("ENDYOW") */
            ) {

                // enter rate type and effective date and click the search button
                var reqObj = _.buildAppstackJSON({
                    form: "P08901_W08901A",
                    type: "open",
                }, "41");

                _.getForm("appstack",reqObj).then(function(data){
                    if (data.hasOwnProperty("fs_P08901_W08901D")) { // is form being returned? if not, lets try add.
                        var fieldObj = data.fs_P08901_W08901D.data;
                        globals.htmlInputs = data.fs_P08901_W08901D.data;
                        var errObj = data.fs_P08901_W08901D.errors;
                        if (errObj.length > 0) {
                            _.getErrorMsgs(errObj);
                            _.returnFromError();
                        } else {
                            self.addRow(inputRow);
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
        
        self.addRow = function(inputRow) {
            var reqObj = _.buildAppstackJSON({
                    form: "W08901D",
                    type: "execute",
                }, ["34", inputRow["SEX"]], ["123", inputRow["txt__Date of Birth__DDOB__123"]], ["86", inputRow["ENDYOW"]], ["130", inputRow["RELA"]], ["132", inputRow["DBEN"]], ["121", inputRow["txt__Country Code__CCPR__121"]], ["18", inputRow["txt__High School Graduate__HSG__18"]], ["16", inputRow["txt__Employed__EMP__16"]], ["20", inputRow["txt__Full Time Student__FTS__20"]], ["14", inputRow["txt__School Attending__SCA__14"]], ["32", inputRow["txt__Disability Flag__DSBF__32"]], ["26", inputRow["txt__Date of Disability__DSBD__26"]], ["28", inputRow["txt__Date of Medicare__MCDT__28"]], ["24", inputRow["txt__Date of Death__DTDH__24"]], ["36", inputRow["txt__Send Initial Letter (Y/N)__ILET__36"]], ["30", inputRow["txt__Date of Notification__NDT__30"]], "11");
            _.getForm("appstack",reqObj).then(function(data){

                        if (data.hasOwnProperty("fs_P01012_W01012A")) {
                            var fieldObj = data.fs_P01012_W01012A.data;
                            var errObj = data.fs_P01012_W01012A.errors;
                            var warningObj = data.fs_P01012_W01012A.warnings;
                            
                            if (warningObj.length > 0) {
                                _.getErrorMsgs(warningObj);
                                _.returnFromError();  
                            } else if (errObj.length > 0) {
                                _.getErrorMsgs(errObj);
                                _.returnFromError();
                            }
                            
                            var reqObj = _.buildAppstackJSON({
                                form: "W01012A",
                                type: "execute",
                            }, ["28", inputRow["ALPH"]], "11");
                            
                            _.getForm("appstack", reqObj).then((data) => {
                                if (data.hasOwnProperty("fs_P08901_W08901D")) {
                                    var fieldObj = data.fs_P08901_W08901D.data;
                                    var errObj = data.fs_P08901_W08901D.errors;
                                    var warningObj = data.fs_P08901_W08901D.warnings;

                                    
                                    if (errObj.length > 0) {
                                        _.getErrorMsgs(errObj);
                                        _.returnFromError();      
                                    } else if (warningObj.length > 0) {
                                        _.getErrorMsgs(warningObj);
                                        _.returnFromError();
                                    } else {
                                        _.postSuccess("Row added successfully");
                                        _.returnFromSuccess();
                                    }
                                } else if (data.hasOwnProperty("fs_P01012_W01012A")) {
                                    var fieldObj = data.fs_P01012_W01012A.data;
                                    var errObj = data.fs_P01012_W01012A.errors;
                                    var warningObj = data.fs_P01012_W01012A.warnings;
                                    if (warningObj.length > 0) {
                                        _.getErrorMsgs(warningObj);
                                        _.returnFromError();  
                                    } else if (errObj.length > 0) {
                                        _.getErrorMsgs(errObj);
                                        _.returnFromError();
                                    } else {
                                        _.postError("Unknown error");
                                        _.returnFromError();
                                    }
                                } else {
                                    _.postError("Unknown error");
                                    _.returnFromError();
                                }
                            });
                        } else {
                            _.postError("An unknown error occurred when attempting to add a new dependent/beneficiary");
                            _.returnFromError();
                        }
                });

        };
    };
    return new Process();
});
