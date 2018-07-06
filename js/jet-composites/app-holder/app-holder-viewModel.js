'use strict';
define(
  ['ojs/ojcore', 'knockout', 'jquery', 'ais','ojs/ojinputtext', 'ojL10n!./resources/nls/app-holder-strings', 'ojs/ojarraydataprovider', 'jet-composites/form-holder/loader', 'ojs/ojchart', 'jet-composites/xml-json/loader'],
  function (oj, ko, $, ais) {

    function appHolderComponentModel(context) {
      var self = this;

      var busyContext = oj.Context.getContext(context.element).getBusyContext();
      var options = {
        "description": "CCA Startup - Waiting for data"
      };

      self.pieSeriesValue = ko.observable();
      self.composite = context.element;
      self.busyResolve = busyContext.addBusyState(options);
      self.config = ko.observable({});
      self.inputType = ko.observable('form');
      self.makeTemplate = function(){
        alert('Generating Excel template')
        // var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});
        // FileSaver.saveAs(blob, "hello world.xlsx");
      }
            // main config object 
      self.pieSeriesValue = ko.observable([]);
      if (context.properties.config) {
        self.config(context.properties.config);
        self.pieSeriesValue(self.config().pieSeriesValue)
  
        // console.log(self.pieSeriesValue())
      }

      self.gridEdit = ko.observable(false);
      
      self.AIS = ko.observable();
      self.dataprovider = ko.observable();
      self.headerCols = ko.observable();
      self.loadingMsg = ko.observable('Loading App Data...')
      self.appLoaded = ko.observable(false);
      self.dataprovider = ko.observable();
      self.count = ko.observable(0);

      self.rawData = ko.observable([])
      var count = 0
      self.composite.addEventListener('configChanged', function (event) {
        console.log('into change event')
        console.log("count === " + count)
        self.config(event.detail.value)
        console.log(self.config());
        if (self.config().appType == 'query' && self.config().queryType == 'table') {
          self.getAppData(self.config().dataCols)
        }
        if (self.config().appType == 'query' && self.config().queryType == 'form'){
          self.loadingMsg("")
          self.pieSeriesValue(self.config().pieSeriesValue)
        }

      });
      self.saveOrcData = function (evt) {
        console.log('saving orc data to E1...')
      }
      self.exportToExcel = function (evt) {
        let data = document.getElementById('exportTable');
        console.log(data);
      }
      self.toggleGridEditable = function(evt){
        self.gridEdit(!self.gridEdit());
      }
      self.changeToDropMode = function (evt) {
        console.log('into...')
        self.config().inputType = 'drop';

      }
      self.changeToFormMode = function (evt) {
        self.config().inputType = 'form';
        console.log('into...')
      }
      self.getDropData = function (myDropData) {
        console.log('process to E1...')
        console.log(myDropData);
      }
      self.saveServiceData = function (evt) {
        var formData = [];
        console.log('saving service data to E1...')
        $('.myServiceInputs').each(function (i, o) {
          formData.push({
            key: $(this).attr('id'),
            value: $(this).val()
          })
        })
        var conn = JSON.parse(atob(window.localStorage.getItem('conn')));
        self.AIS(new ais(conn));
        const query = self.AIS().createAppstackCall(self.config().serviceInfo, formData)

      }

      // callback for formHolder
      self.saveData = function (data) {
        // make e1 call here
        console.log(data);
      }
      // map to take dataservice rows and map to object
      // with props for each col in the data set 
      // expressed as JDE ALIAS DD value
      self.dataFieldMapper = (row) => {
        self.count(self.count() + 1);
        const mapped = {};
        Object.keys(row).forEach((field) => {
          // remove the table prefix
          const shortField = field.substring(field.indexOf('_') + 1);
          // remove the MOExist prop
          if (field != 'MOExist') {
            if (field != 'rowIndex') {
              if (typeof row[field].value != 'undefined' || row[field].value != '') {
                mapped[shortField] = row[field].value;
                // mapped.push({value:row[field].value, label:row[field].title});
                // mapped.push({value:row[field].value, label:shortField});
              }
            }
          }

        });
        mapped.rowIndex = self.count();
        return mapped;
      };
      self.init = function () {
       
        if (self.config()) {
          if (self.config().appType == 'query' && self.config().queryType == 'table') {
            console.log('into init if/else ')
            self.getAppData(self.config().dataCols)

          }
          self.appLoaded(true)
        }
      }
      setTimeout(function () {
        self.init()
      }, 0)
      self.getAppData = function (selectCols) {
        // TODO fix dataCols form original config()
        const dataCols = selectCols.map(function (obj) {
          return obj.value
        })
        var conn = JSON.parse(atob(window.localStorage.getItem('conn')));
        self.AIS(new ais(conn));
        var targetQuery;

        targetQuery = self.AIS().createDataQuery(self.config().e1Target).pageSize(100)
          .select(selectCols)

        self.AIS().fetch(targetQuery, self.dataFieldMapper, true).then(function (results) {
          // self.count(0);
      
          // self.loadingMsg('')
          // console.log(results)
          // let rawHolder = [];
          // $.each(results, function(i,o){
          //   console.log(o)
          //   // console.log(o)
          //   let holderObj = []
          //   Object.keys(o).forEach(function(oneKey){
          //     console.log(oneKey)
          //     if(oneKey != 'rowIndex'){
          //       holderObj.push({id:oneKey, value: o[oneKey]})
          //     }
              
          //   })
          //   rawHolder.push(holderObj);
          // })
          // console.log(rawHolder)
          // self.rawData(rawHolder);
          //self.e1Data(results);
          self.dataprovider(results
          //   new oj.ArrayDataProvider(results, {
          //   idAttribute: 'rowIndex'
          // })
        );
        })
      }



      self.busyResolve();
    };



    return appHolderComponentModel;
  });
