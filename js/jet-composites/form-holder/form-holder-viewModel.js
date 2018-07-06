'use strict';
define(
  ['ojs/ojcore', 'knockout', 'jquery', 'ojL10n!./resources/nls/form-holder-strings'],
  function (oj, ko, $) {

    function FormHolderComponentModel(context) {
      var self = this;
      var busyContext = oj.Context.getContext(context.element).getBusyContext();
      var options = {
        "description": "CCA Startup - Waiting for data"
      };
      self.busyResolve = busyContext.addBusyState(options);
      self.composite = context.element;
      self.controls = ko.observable();
      self.callback = ko.observable();
      self.holderObject = {};

      self.action = function () {
        let valuesMap = [];
        $(".myInputs").each(function (i, o) {
          if (o.id.length != 0) {
            if ($("#" + o.id.split('|')[0]).val().length != 0) {
              let cleanedID = o.id.split('|')[0]
              valuesMap.push({
                id: cleanedID.split('_')[1],
                value: $("#" + cleanedID).val()
              })
            }
          }
        })
        self.callback(valuesMap)
      }

      if (context.properties.controls) {
        self.controls(context.properties.controls);
      }
      if (context.properties.callback) {
        self.callback = context.properties.callback;
      }

      self.busyResolve();
    };


    return FormHolderComponentModel;
  });
