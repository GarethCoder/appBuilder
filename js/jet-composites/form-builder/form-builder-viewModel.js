'use strict';
define(
    ['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojlabel', 'ojs/ojcheckboxset', 'ojL10n!./resources/nls/form-builder-strings'], function (oj, ko, $) {

    function FormBuilderComponentModel(context) {
        var self = this;
        self.composite = context.element;
        var busyContext = oj.Context.getContext(context.element).getBusyContext();
        var options = {"description": "Form Builder Startup - Waiting for data"};
        self.busyResolve = busyContext.addBusyState(options);
        self.callback;
        self.controls = ko.observable([]);

        // parse array and fire callback
        self.saveControls = function() {
            let valuesMap = [];
            $(".myInputs").each(function(i,o){
                //console.log(i)

                valuesMap.push(o.id.split('_')[1])
                
            })
            let newHolder = [];
            self.controls().forEach(function(oneControl){
                valuesMap.forEach(function(oneInput){
                if(oneControl.id == oneInput){
                    newHolder.push(oneControl);
                }
                })
            })
            

            self.callback(newHolder)
            
        }
        
        // remove the form control selected
        self.remove = function(evt){
            $("#"+evt.currentTarget.id).parent().remove();
        } 

        

        if (context.properties.controls) {
            self.controls(context.properties.controls);
        }
        if (context.properties.callback) {
            self.callback = context.properties.callback;
        }

        self.busyResolve();
    };
    

    return FormBuilderComponentModel;
});