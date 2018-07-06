// Process P555201_W555201D for Veritas

define(['aisclient'], function (_) {
  var Process = function () {
    var self = this;
    self.reqFields = {
      titles: [{
          name: "DOCO", // Contract Number
          id: "85",
        },
        {
          name: "DCTO", // Contract Type
          id: "86",
        },
      ],
    };

    self.closeObj = {
      subForm: "W555201D",
      closeID: "12",
    };

    // P555201_W555201A ENTRY FORM
    // P555201_W555201D CHANGE / EDIT FORM

    self.init = function () {
      var inputRow = globals.inputRow = globals.processQ[0];
      _.postSuccess("Processing row " + inputRow.ROW);
      inputRow.EXTRACT = _.stringToBoolean(inputRow.EXTRACT);

      if (inputRow.hasOwnProperty("txt__Contract Company__KCOO__14") && inputRow["txt__Contract Company__KCOO__14"].substr(0, 1) == "'") {
        inputRow["txt__Contract Company__KCOO__14"] = inputRow["txt__Contract Company__KCOO__14"].substr(1);
      }

      if (inputRow.hasOwnProperty("txt__Payment Terms__PTC__223") && inputRow["txt__Payment Terms__PTC__223"].substr(0, 1) == "'") {
        inputRow["txt__Payment Terms__PTC__223"] = inputRow["txt__Payment Terms__PTC__223"].substr(1);
      }

      if (inputRow.hasOwnProperty("txt__Business Unit__MCUS__24") && inputRow["txt__Business Unit__MCUS__24"].substring(0,1) === "'")
					inputRow["txt__Business Unit__MCUS__24"] = inputRow["txt__Business Unit__MCUS__24"].substring(1);

      reqObj = _.buildAppstackJSON({
          form: "P555201_W555201A",
          type: "open",
        }, ["72[85]", inputRow.DOCO], ["72[86]", inputRow.DCTO],
        "15");

      _.getForm("appstack", reqObj).then(function (data) {
        var rowArr = data.fs_P555201_W555201A.data.gridData.rowset;
        var errObj = data.fs_P555201_W555201A.errors;
        if (inputRow.DOCO === undefined || inputRow.DCTO === undefined || rowArr.length === 0 && !inputRow.EXTRACT) {
          _.postSuccess("Adding record to Job Master");
          self.getAddForm(inputRow);
        } else if (errObj.length > 0) {
          _.getErrorMsgs(errObj);
          _.returnFromError();
        } else if (rowArr.length === 1) {
          _.postSuccess("Selecting Job Master record");
          self.selectRow(inputRow);
        } else {
          _.postError("There was a problem finding the requested record, or there are duplicates");
          _.returnFromError();
        }
      });
    };

    // P555201_W555201A ENTRY FORM
    // P555201_W555201D CHANGE / EDIT FORM

    self.getAddForm = function (inputRow) {

      var reqObj = _.buildAppstackJSON({
        form: "W555201A",
      }, "45");

      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty("fs_P555201_W555201D")) {
          var errObj = data.fs_P555201_W555201D.errors;
          var fieldData = data.fs_P555201_W555201D.data;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else {
            globals.htmlInputs = fieldData;
            self.insertNewData(inputRow);
          }
        } else {
          _.postError("An unknown error occurred while entering the ADD form");
          _.returnFromError();
        }
      });
    };

    // P555201_W555201A ENTRY FORM
    // P555201_W555201D CHANGE / EDIT FORM

    self.insertNewData = function (inputRow) {

      var reqObj = _.buildAppstackJSON({
        form: "W555201D",
        dynamic: true
      }, "11", "11"); // To overriding customer warnings

      _.getForm("appstack", reqObj).then(function (data) {

        if (data.hasOwnProperty("fs_P555201_W555201D")) {
          var errObj = data.fs_P555201_W555201D.errors;
          var fieldData = data.fs_P555201_W555201D.data;

          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else {
            _.postError("Unknown error occured on P555201_W555201D");
            _.returnFromError();
          }
        } else {

          if (data.hasOwnProperty('fs_P554210_W554210I')) {

            var reqObj = _.buildAppstackJSON({
              form: "W554210I"
            }, "13");

            _.getForm("appstack", reqObj).then(function (data) {

              if (data.hasOwnProperty("fs_P554210_W554210A")) {
                var errObj = data.fs_P554210_W554210A.errors;
                var fieldData = data.fs_P554210_W554210A.data;

                if (errObj.length > 0) {
                  _.getErrorMsgs(errObj)
                  _.returnFromError();
                } else {
                  self.insertSalesOrderDetails(inputRow);
                }
              }
            })
          } else {
            _.postError("Unknown form.");
            _.returnFromError();
          }
        }
      });
    };

    self.insertSalesOrderDetails = function (inputRow) {

      var reqObj = _.buildAppstackJSON({
          form: "W554210A",
          gridAdd: true,
          customGrid: true
        }, ['grid', '53', inputRow.UORG], ['grid', '1069', inputRow.SBLT], ['grid', '1070', inputRow.SBL], ['grid', '52', inputRow.UOM], ['grid', '838', inputRow.SQOR], ['grid', '839', inputRow.UOM2], ['grid', '89', inputRow.UITM], ['grid', '44', inputRow.LNTY], ['grid', '214', inputRow.FUP], ['grid', '215', inputRow.FEA], ['grid', '35', inputRow.MCU], ['grid', '132', inputRow.LOCN], ['grid', '133', inputRow.LOTN], ['grid', '34', inputRow.LNID], ['grid', '846', inputRow.MCLN], ['grid', '165', inputRow.DRQJ], ['grid', '908', inputRow.DRQT], ['grid', '42', inputRow.DSC1], ['grid', '135', inputRow.LTTR], ['grid', '134', inputRow.NXTR], ['grid', '136', inputRow.UOM4], ['grid', '137', inputRow.SOQS], ['grid', '138', inputRow.SOBK], ['grid', '139', inputRow.SOCN], ['grid', '166', inputRow.PDDJ], ['grid', '910', inputRow.PDTT], ['grid', '674', inputRow.PPDJ], ['grid', '909', inputRow.PMDT], ['grid', '167', inputRow.CNDJ], ['grid', '168', inputRow.RSDJ], ['grid', '911', inputRow.RSDT], ['grid', '856', inputRow.PEFJ], ['grid', '216', inputRow.FUC], ['grid', '217', inputRow.FEC], ['grid', '456', inputRow.PRP5], ['grid', '463', inputRow.VEND], ['grid', '164', inputRow.SHAN], ['grid', '169', inputRow.DSC2], ['grid', '186', inputRow.TAX1], ['grid', '485', inputRow.WTUM], ['grid', '483', inputRow.ITWT], ['grid', '502', inputRow.RYIN], ['grid', '658', inputRow.INMG], ['grid', '608', inputRow.VR01], ['grid', '634', inputRow.AGRE], ['grid', '633', inputRow.BLKT], ['grid', '632', inputRow.ASSC], ['grid', '631', inputRow.SBST], ['grid', '892', inputRow.UPEX], ['grid', '657', inputRow.DMCT], ['grid', '656', inputRow.DMCS], ['grid', '661', inputRow.MOT], ['grid', '662', inputRow.DTYS], ['grid', '673', inputRow.CARS], ['grid', '663', inputRow.LOB], ['grid', '664', inputRow.EUSE], ['grid', '665', inputRow.EMCU], ['grid', '666', inputRow.UPC1], ['grid', '667', inputRow.UPC2], ['grid', '668', inputRow.UPC3], ['grid', '677', inputRow.DL01], ['grid', '672', inputRow.PRMG], ['grid', '833', inputRow.CRDC], ['grid', '832', inputRow.CRRD], ['grid', '835', inputRow.UOM3], ['grid', '836', inputRow.UNCS], ['grid', '837', inputRow.ECST], ['grid', '995', inputRow.KITDIRTY], ['grid', '1076', inputRow.URAB], ['grid', '1077', inputRow.PTC], ['grid', '998', inputRow.TXA1], ['grid', '670', inputRow.QAVAL], ['grid', '1053', inputRow.TUPRC], ['grid', '1035', inputRow.TAEXP],
        "4", "4");

      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty('fs_P554210_W554210A')) {

          var warningsObj = data.fs_P554210_W554210A.warnings;
          var errObj = data.fs_P554210_W554210A.errors;
          var fieldData = data.fs_P554210_W554210A.data;

          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else if (warningsObj.length > 0) {
            _.getErrorMsgs(warningsObj);
            _.returnFromError();
          } else {
            _.successOrFail(data, {
              successMsg: "Form successfully closed.",
            });
          }
        } else {
          if (data.hasOwnProperty('fs_P42232_W42232A')) {

            var reqObj = _.buildAppstackJSON({
              form: "W42232A",
            }, "156");
              _.getForm("appstack", reqObj).then(function (data) {
              _.successOrFail(data, {successMsg: "Order placed successfully"})
            })
            
            // 157 is revise btn
            // 156 is place order btn  

          } else {
            _.successOrFail(data, {successMsg: "Successfully added record"})
          }
        }

      });
    };

    // P555201_W555201A ENTRY FORM
    // P555201_W555201D CHANGE / EDIT FORM

    self.selectRow = function (inputRow) {
      var optionsObj = {
        form: "W555201A",
      };

      if (inputRow.EXTRACT) {
        optionsObj.aliasNaming = true;
        optionsObj.type = "close";
      }

      var reqObj = _.buildAppstackJSON(optionsObj, "1.0", "14");
      _.getForm("appstack", reqObj).then(function (data) {
        if (data.hasOwnProperty("fs_P555201_W555201D")) {
          var errObj = data.fs_P555201_W555201D.errors;
          var fieldData = data.fs_P555201_W555201D.data;
          if (errObj.length > 0) {
            _.getErrorMsgs(errObj);
            _.returnFromError();
          } else if (inputRow.EXTRACT) {
            fieldData["z_MCUS_24"].value = "'" + fieldData["z_MCUS_24"].value;
            fieldData["z_KCOO_14"].value = "'" + fieldData["z_KCOO_14"].value;
            fieldData["z_PTC_223"].value = "'" + fieldData["z_PTC_223"].value;

            _.appendTable(fieldData);
            _.postSuccess("Extracting data");

          } else {
            globals.htmlInputs = fieldData;
            self.updateForm(inputRow);
          }
        } else if (data.hasOwnProperty("fs_P555201_W555201G")) {
          _.postError("The form requested cannot be updated, because the Contract Type is C.");
          _.returnFromError();
        } else {
          _.postError("An unknown error occurred while entering the UPDATE form");
          _.returnFromError();
        }
      });
    };

    // P555201_W555201A ENTRY FORM
    // P555201_W555201D CHANGE / EDIT FORM

    self.updateForm = function (inputRow) {

      var reqObj = _.buildAppstackJSON({
          form: "W555201D",
          dynamic: true,
          type: "close",
        }, ["34", inputRow.USD1], ["36", inputRow.USD2], ["269", inputRow.RPER], ["283", inputRow.MCIF], ["285", inputRow.NTEF],
        "11", "11");

      _.getForm("appstack", reqObj).then(function (data) {
        _.successOrFail(data, {
          successMsg: "Job Master Record updated.",
        });
      });
    };
  };
  return new Process();
});