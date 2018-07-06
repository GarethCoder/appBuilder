// Item Master Additional Systems Info
define([''], function(_){
    var Process = function(){
        var self = this;
        
    	self.init = function() {
            var inputRow = globals.inputRow = globals.processQ[0];
            _.postSuccess("Processing row " + inputRow.ROW);

        	_.callOrchestration(globals.formName, inputRow).then(function(results){
                Object.keys(results).forEach(function(oneKey){
                    if(results[oneKey].hasOwnProperty('errors')){
                        if(results[oneKey].errors.length > 0){
                            
                        }
                    }
                })
            })

        	// _.getForm("appstack",reqObj).then(function(data){
            //     if (data.hasOwnProperty("fs_P4101_W4101E")) {
            //         var rowArr = data.fs_P4101_W4101E.data.gridData.rowset;
            //         var errObj = data.fs_P4101_W4101E.errors;
            //         var noItem = rowArr.length === 0 || rowArr[0].sItemNumber_123.value.toLowerCase() !== inputRow.LITM.toLowerCase();
            //         if (errObj.length > 0) {
            //             _.getErrorMsgs(errObj);
            //             _.returnFromError();
            //         } else if (noItem && inputRow.EXTRACT) {
            //             _.postError("No item found. Please add the item before attempting to extract the data.");
            //             _.returnFromError();
            //         } else if (noItem) {
            //             _.postError("No item found. Please add the item using the Item Master Revisions form: P4101_W4101A");
            //             _.returnFromError();
            //         } else if (rowArr.length === 1) {
            //             self.selectRow(inputRow);
            //             _.postSuccess("Item found");
            //         } else {
            //             _.postError("There was a problem finding the requested record, or there are duplicates");
            //             _.returnFromError();
            //         }
            //     } else {
            //         _.postError("An unknown error occurred in the find/browse form");
            //         _.returnFromError();
            //     }
            // });
        };

    };
    return new Process();
});