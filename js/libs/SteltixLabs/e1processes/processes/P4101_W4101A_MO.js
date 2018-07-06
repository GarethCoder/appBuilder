define(['aisclient'], function (_) {
	var Process = function () {
		var self = this;
		self.reqFields = {
			titles: [{
				name: "ITM"
			}, {
				name: "text"
			}],
			isCustomTemplate: false
		};
		self.init = function () {
			var inputRow = globals.inputRow = globals.processQ[0];
			_.postSuccess("Processing row " + inputRow.ROW);

			var reqObj = _.buildMediaJSON({
				service: "updatetext",
				form: "P4101_W4101E",
				moStructure: "GT4101",
				moKey: [inputRow.ITM]
			}, inputRow.text);

			_.getForm("mediaUpdate", reqObj).then(function (data) {
				_.returnFromSuccess();
			});
		};
	};
	return new Process();
});