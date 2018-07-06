/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
define(
    ['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'promise', 'ojs/ojtable', 'ojs/ojinputtext', 'ojs/ojbutton', 'ojs/ojarraydataprovider', 'serviceworker'],
    function(oj, ko, $) {
        'use strict';

        function FilterTableComponentModel(context) {
            var self = this;
            self.composite = context.element;
            let days = { days: 10 };
            self.highlightChars = [];
            self.filter = ko.observable();
            self.logArray = ko.observableArray([]);
            // add new props for idAttribute
            self.dataprovider = new ko.observable(new oj.ArrayDataProvider(self.logArray, { idAttribute: 'accountId' }));

            /// ACCOUNTS TABLE
            const AccountFunctions = () => {
                const initialiseTable = async(logData) => {
                    // Get Data
                    let modifiedLogs = modifyData(logData);

                    self.logArray(modifiedLogs);
                };

                const modifyData = (logData) => {
                    let Accounts = [];

                    logData.forEach(log => {
                        Accounts.push({ accountId: log._id, account: log.account, user: log.user, server: log.server, aisVersion: log.aisVersion, action: log.action });
                    });

                    return Accounts;
                };

                const filter = function() {
                    self.highlightChars = [];
                    var filter = document.getElementById('filter').rawValue;
                    if (filter.length == 0) {
                        self.clearClick();
                        return;
                    }
                    var filterArray = [];
                    var i, id;
                    for (i = self.logArray().length - 1; i >= 0; i--) {
                        id = self.logArray()[i].accountId;
                        Object.keys(self.logArray()[i]).forEach(function(field) {
                            if (self.logArray()[i][field].toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
                                self.highlightChars[id] = self.highlightChars[id] || {};
                                self.highlightChars[id][field] = getHighlightCharIndexes(filter, self.logArray()[i][field]);
                                if (filterArray.indexOf(self.logArray()[i]) < 0) {
                                    filterArray.push(self.logArray()[i]);
                                }
                            }
                        });
                    }
                    filterArray.reverse();
                    self.dataprovider(new oj.ArrayDataProvider(filterArray, { idAttribute: 'accountId' }));

                    function getHighlightCharIndexes(highlightChars, text) {
                        var highlightCharStartIndex = text.toString().toLowerCase().indexOf(highlightChars.toString().toLowerCase());
                        return { startIndex: highlightCharStartIndex, length: highlightChars.length };
                    };
                };

                const clearSearch = function(data, event) {
                    try {
                        self.filter('');
                        self.dataprovider(new oj.ArrayDataProvider(self.logArray, { idAttribute: 'accountId' }));
                        self.highlightChars = [];
                        document.getElementById('filter').value = "";
                        return true;
                    } catch (error) {
                        // console.log(error);
                    }
                };

                const clearDefaultSearch = function(data, event) {
                    try {
                        self.filter('');
                        self.highlightChars = [];
                        document.getElementById('filter').value = "";
                        return true;
                    } catch (error) {
                        // console.log(error);
                    }
                };

                const cellRenderer = function(context) {
                    var id = context.row.accountId;
                    var startIndex = null;
                    var length = null;
                    var field = null;
                    if (context.columnIndex === 0) {
                        field = 'account';
                    } else if (context.columnIndex === 1) {
                        field = 'user';
                    } else if (context.columnIndex === 2) {
                        field = 'server';
                    } else if (context.columnIndex === 3) {
                        field = 'aisVersion';
                    } else if (context.columnIndex === 4) {
                        field = 'action';
                    }
                    var data = context.row[field].toString();
                    if (self.highlightChars[id] != null &&
                        self.highlightChars[id][field] != null) {
                        startIndex = self.highlightChars[id][field].startIndex;
                        length = self.highlightChars[id][field].length;
                    }
                    if (startIndex != null &&
                        length != null) {
                        var highlightedSegment = data.substr(startIndex, length);
                        data = data.substr(0, startIndex) + '<b>' + highlightedSegment + '</b>' + data.substr(startIndex + length, data.length - 1);
                    }
                    $(context.cellContext.parentElement).append(data);
                };

                const parseTableData = function() {
                    return [{
                            headerText: 'Account',
                            renderer: self.highlightingCellRenderer
                        },
                        {
                            headerText: 'User',
                            renderer: self.highlightingCellRenderer
                        },
                        {
                            headerText: 'Server',
                            renderer: self.highlightingCellRenderer
                        },
                        {
                            headerText: 'AIS Version',
                            renderer: self.highlightingCellRenderer
                        },
                        {
                            headerText: 'Action',
                            renderer: self.highlightingCellRenderer
                        }
                    ];
                }
                return {
                    initialiseTable,
                    filter,
                    clearSearch,
                    clearDefaultSearch,
                    cellRenderer,
                    parseTableData
                };
            };



            self.handleValueChanged = AccountFunctions().filter;

            self.clearClick = AccountFunctions().clearSearch;

            self.highlightingCellRenderer = AccountFunctions().cellRenderer;

            self.columnArray = AccountFunctions().parseTableData();

            self.dataLabelPositionValue = ko.observable('outsideSlice');
       
            self.hiddenCategories = ko.observableArray([]);

            self.data = ko.observableArray();

            // context.props.then(function(propertyMap) {
            //     //Store a reference to the properties for any later use
            //     self.properties = propertyMap;

            //     setTimeout(() => {
            //         AccountFunctions().initialiseTable(self.properties.data);
            //         actionChart.initialiseChart(self.properties.data);
            //         self.data(self.properties.data);

            //         setInterval(() => {
            //             if (self.properties.data !== self.data()) {

            //                 AccountFunctions().initialiseTable(self.properties.data);
            //                 actionChart.initialiseChart(self.properties.data);
            //                 self.data(self.properties.data);
            //                 AccountFunctions().clearDefaultSearch();
            //             }
            //         }, 1000)
            //     }, 1000)
            // });
        };
        return FilterTableComponentModel;
    });