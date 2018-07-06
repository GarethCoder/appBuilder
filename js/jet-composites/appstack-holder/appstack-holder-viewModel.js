'use strict';
define(
    ['ojs/ojcore', 'knockout', 'jquery', 'ojL10n!./resources/nls/appstack-holder-strings'], 
    function (oj, ko, $) {

    
    function appStackHolderComponentModel(context) {
        var self = this;
        
        //At the start of your viewModel constructor
        var busyContext = oj.Context.getContext(context.element).getBusyContext();
        var options = {"description": "CCA Startup - Waiting for data"};
        self.busyResolve = busyContext.addBusyState(options);
        
        self.composite = context.element;

        self.appstacksteps = ko.observable([]);

        if (context.properties.steps) {
            console.log(context.properties.steps)
            self.appstacksteps(context.properties.steps)
            console.log(context.properties.steps)
        }

        self.busyResolve();
    };
    

    return appStackHolderComponentModel;
});