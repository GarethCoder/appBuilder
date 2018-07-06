'use strict';
define(
    ['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojbutton', 'ojs/ojchart', 'ojL10n!./resources/nls/oj-charts-cmp-strings'],
    function (oj, ko, $) {
        function ExampleComponentModel(context) {
            var self = this;

            //At the start of your viewModel constructor
            var busyContext = oj.Context.getContext(context.element).getBusyContext();
            var options = {
                "description": "CCA Startup - Waiting for data"
            };
            self.busyResolve = busyContext.addBusyState(options);

            self.composite = context.element;

            // Chart props
            self.type = ko.observable('bar');
            self.data = ko.observableArray();
            self.barGroupsValue = ko.observableArray();

            // bar chart attributes
            self.stackValue = ko.observable('off');
            self.orientationValue = ko.observable('vertical');
            self.barSeriesValue = ko.observableArray([]);

            // pie chart attributes
            self.threeDValue = ko.observable('off');
            self.pieSeriesValue = ko.observableArray([]);

            // Props
            if (context.properties) {
                // parse the context properties here
                let props = context.properties;
                // props being passed in
                console.log(props)
                self.type(props.chartType);
                self.data(props.data);
                self.barGroupsValue(props.barGroups);
             
            };

            // Init
            const chartInitilizion = () => {
                const determineType = (type) => {
                    console.log("chart type on init ==== "+ type)
              
                    let chartType = "";

                    type == 'bar' ? chartType = "init.bar" : chartType = "init.pie";

                    return chartType;
                };

                const bar = (data, barGroups) => {
                    console.log(data);
                    // show bar chart  || hide pie chart
                    $('#pieChart').addClass('hidden');
                    

                    // initialise bar chart
                    self.barSeriesValue(data);
                    self.barGroupsValue(barGroups);
                    // $("#barChart").removeClass('hidden');
                };

                const pie = (data) => {
                    // show pie chart  || hide bar chart
                    $('#barChart').addClass('hidden');
                    $("#pieChart").removeClass('hidden');

                    // initialise pie chart
                    self.pieSeriesValue(data);
                };

                return {
                    determineType,
                    bar,
                    pie
                }
            };

            let init = chartInitilizion();

            let chart = eval(init.determineType(self.type()))(self.data(), self.barGroupsValue());

            //  Once all startup and async activities have finished, relocate if there are any async activities
            self.busyResolve();
        };

        return ExampleComponentModel;
    });