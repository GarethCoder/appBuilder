'use strict';
define(
    ['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojinputtext', 'ojs/ojdatagrid', 'ojs/ojarraydatagriddatasource', 'ojL10n!./resources/nls/data-grid-strings'],
    function (oj, ko, $) {


        function DataGridComponentModel(context) {
            var self = this;

            //At the start of your viewModel constructor
            var busyContext = oj.Context.getContext(context.element).getBusyContext();
            var options = {
                "description": "CCA Startup - Waiting for data"
            };
            self.busyResolve = busyContext.addBusyState(options);

            self.composite = context.element;

            // CollectionDataGridDataSource
            self.data = ko.observableArray()
            self.dataSource = ko.observable(new oj.ArrayDataGridDataSource(self.data(), {}));

            // Data Grid Init()
            const DataGridInit = () => {
                const rowManipulation = {
                    cell: [],
                    columnHeaders: {
                        rowHeader: 'rowIndex',
                        columns: []
                    },
                    indexCounter: -1,
                    temporaryRowStore: [],
                    duration: ""
                };

                const dataMapper = (rowset) => {
                    let start = performance.now();

                    rowset.forEach((row) => mapData(row, start));

                    getColumnHeaders(rowset[0]);

                    let duration = performance.now() - start;

                    let seconds = (((duration / 1000 / 60) % 1) * 60).toFixed(3);

                    // set mapping time
                    rowManipulation.duration = `${seconds} seconds`;

                    // clear temporary row store
                    rowManipulation.temporaryRowStore = [];

                    return rowManipulation;

                };

                const mapData = (row, start) => {
                    let currentRow = row;
                    console.log()
                    Object.keys(currentRow).forEach((key) => {
                        let rowIndex = currentRow["rowIndex"];
                        if (key !== 'rowIndex' && key !== "MOExist") {
                            if (rowIndex === rowManipulation.indexCounter) {
                                let currentValue = currentRow[key].internalValue;
                                let id = currentRow[key].id;
                                let newKey = currentRow[key].title;

                                currentRow[newKey] = {
                                    id,
                                    currentValue
                                };

                                delete currentRow[key];

                                rowManipulation.temporaryRowStore.push(currentRow);
                            }
                        } else if (key === 'rowIndex') {
                            // console.log('assigning value')
                            rowManipulation.indexCounter = currentRow['rowIndex'];
                            if (rowManipulation.temporaryRowStore.length > 0) {
                                let prePushRow = rowManipulation.temporaryRowStore[0];

                                delete prePushRow['rowIndex'];
                                delete prePushRow['MOExist'];

                                // order the data alphabetically

                                rowManipulation.cell.push(rowManipulation.temporaryRowStore[0]);
                                rowManipulation.temporaryRowStore = [];
                            }
                        };
                    });
                };

                const getColumnHeaders = (singleRow) => {
                    Object.keys(singleRow).forEach((key) => {
                        rowManipulation.columnHeaders.columns.push(singleRow[key].title);
                        // rowManipulation.columnHeaders.columns.push(key);
                    });
                };
                return {
                    dataMapper
                }
            };
            // returning false in the handle edit event will make the cell read-only
            self.handleEdit = function (event) {

                if (event.detail['cellContext']['keys']['column'] == 'readOnly') {
                    event.preventDefault();
                }
            }

            // the oj.DataCollectionEditUtils.basicHandleEditEnd is a utility method
            // which will handle validation of editable components and also handle
            // canceling the edit
            self.handleEditEnd = function (event) {
                console.log(event.detail.cellContext.data);
            };

            // function to determine which template to use for 
            // rendering depending on mode
            self.getCellTemplate = function (cellContext) {
                var mode;
                mode = cellContext['mode'];
                if (mode === 'edit') {
                    return oj.KnockoutTemplateUtils.getRenderer('editCellTemplate')(cellContext);
                } else if (mode === 'navigation') {
                    return oj.KnockoutTemplateUtils.getRenderer('cellTemplate')(cellContext);
                }
            };


            // PROPS
            self.composite.addEventListener('rowsetChanged', function (event) {
                console.log('into change event');
                self.data(event.detail.value)

                if (self.data()) {
                    let mappedData = DataGridInit().dataMapper(self.data());
                    console.log(mappedData);
                    console.log(mappedData.cell[0]);

                    let sortedMappedData = mappedData.cell.sort();

                    self.dataSource(new oj.ArrayDataGridDataSource(sortedMappedData));
                };
            });

            if (context.properties) {
                self.data(context.properties.rowset);
                if (self.data()) {
                    let mappedData = DataGridInit().dataMapper(self.data());
                    console.log(mappedData);
                    console.log(mappedData.cell[0]);

                    let sortedMappedData = mappedData.cell.sort();

                    self.dataSource(new oj.ArrayDataGridDataSource(sortedMappedData));
                };
            };

            //Once all startup and async activities have finished, relocate if there are any async activities
            self.busyResolve();
        };



        //ExampleComponentModel.prototype.propertyChanged = function(context){
        //};

        return DataGridComponentModel;
    });