define(['ojs/ojcore', 'knockout', 'jquery', 'ais', 'ojs/ojradioset', 'ojs/ojchart', 'ojs/ojtrain', 'ojs/ojtable', 'ojs/ojpopup', 'ojs/ojinputtext', 'ojs/ojrouter', 'ojs/ojselectcombobox', 'ojs/ojarraydataprovider', 'jet-composites/form-builder/loader', 'jet-composites/xml-json/loader', 'jet-composites/appstack-holder/loader', 'jet-composites/oj-charts-cmp/loader', 'jet-composites/data-grid/loader'],
  function (oj, ko, $, ais) {

    function HomeViewModel() {
      var self = this;

      self.router = oj.Router.rootInstance;
      self.init = function () {
        // grab appShare details
        self.getConnected()
        // check if we have already created apps
        if (window.localStorage.getItem('savedApps')) {
          // go to apps list view


          if (window.localStorage.getItem('savedZones')) {
            // go to apps list view
            self.router.go('zones');
            return;
          } else {
            self.router.go('apps');
          }

          return;
        }
        self.initSuccess(true);
      }

      self.e1Data = ko.observable();
      // VARS
      self.appStackProcess = ko.observable();
      self.gridColumns = ko.observable();
      self.targetCol = ko.observable();

      // callback for the form builder when setting controls for app
      self.setFormControls = function (data) {
        self.tableValuesSelected(data);
      }
      self.pieSeriesValue = ko.observableArray([{
          name: "Series 1",
          items: [42, 22]
        },
        {
          name: "Series 2",
          items: [55, 13]
        },
        {
          name: "Series 3",
          items: [36, 67]
        },
        {
          name: "Series 4",
          items: [10, 11]
        },
        {
          name: "Series 5",
          items: [5, 9]
        }
      ]);
      self.AIS = ko.observable({}); // object to hold our AIS client
      self.conn = ko.observable({}); // object to hold our url params to contruct AIS connection
      self.type = ko.observable('pie');
      self.barGroups = ko.observableArray(["Group A", "Group B"]);
      self.chartData = [{
          name: "Series 1",
          items: [42, 34]
        },
        {
          name: "Series 2",
          items: [55, 30]
        },
        {
          name: "Series 3",
          items: [36, 50]
        },
        {
          name: "Series 4",
          items: [22, 46]
        },
        {
          name: "Series 5",
          items: [22, 46]
        }
      ];

      // master app object vars
      self.appConfig = ko.observable({}); // this gets saved as the master app
      self.appName = ko.observable();
      self.appType = ko.observable();
      var values = [5, 8, 2, 7, 0, 9, 2, 3, 4, 2];
      var colorHandler = new oj.ColorAttributeGroupHandler();
      self.barColor = colorHandler.getValue('barColor');
      self.rangeBarColor = colorHandler.getValue('rangeBarColor');
      self.lineColor = colorHandler.getValue('lineColor');
      self.sparkValues = ko.observableArray([]);
      self.inputType = ko.observable(['form'])
      self.queryType = ko.observable();
      self.transactType = ko.observable();
      self.e1Target = ko.observable();
      self.formDetails = ko.observable({});
      self.formControls = ko.observable([]);
      self.previewControls = ko.observable(false);
      self.orcsDataprovider = ko.observable();
      self.orcInputs = ko.observable();
      self.allOrcs = ko.observable();
      // internal app flags and objects
      self.configStep = ko.observable(1); // controls state in build process 1-7
      self.initSuccess = ko.observable(false);
      self.dataPreview = ko.observable(false);
      self.connected = ko.observable(false);
      self.setUpMessage = ko.observable('');
      self.gridMode = ko.observable(['read']);
      self.makeEditable = ko.observable(false);
      self.count = ko.observable(0);
      self.selectedStep = ko.observable('stp1');
      self.selectedLabel = ko.observable('1');
      self.dataprovider = ko.observable();
      self.selectedStepValue = ko.observable();
      self.selectedStepLabel = ko.observable();
      self.headerCols = ko.observable();
      self.savedApps = ko.observable([]);
      self.orcs = ko.observableArray([]);
      self.tables = ko.observable([]);
      self.tableInfo = ko.observable(false);
      self.tableValuesSelected = ko.observable([]);
      self.selectedTableCols = ko.observable([]);
      self.inputMode = ko.observable('form');
      // internal array of steps during build
      self.stepArray = ko.observableArray(
        [{
            label: '1',
            id: 'stp1'
          },
          {
            label: '2',
            id: 'stp2'
          },
          {
            label: '3',
            id: 'stp3'
          },
          {
            label: '4',
            id: 'stp4'
          },
          {
            label: '5',
            id: 'stp5'
          },
          {
            label: '6',
            id: 'stp6'
          }
        ]);

      // the return object from the xml-json component
      self.processObject = function (jsObject) {
        let stepsArray = [];
        console.log(JSON.stringify(jsObject))
        jsObject.ServiceRequest.serviceRequestSteps.serviceRequestSteps.forEach(function (oneStep) {
          let oneStepObject = {};
          oneStepObject.formActions = [];
          oneStepObject.inputs = [];
          oneStepObject.formName = oneStep['@attributes'].appOID;
          if (oneStep.hasOwnProperty('formActions')) {


            if (oneStep.formActions.formActions.hasOwnProperty('@attributes')) {

              // we have an object with only one action
              console.log('object')
              let tempHolder = []

              if (oneStep.formActions.formActions['@attributes'].type == 'action') {
                oneStepObject.formActions.push({
                  command: oneStep.formActions.formActions.action['#text'],
                  controlID: oneStep.formActions.formActions.controlID['#text']
                })

              }


            } else {
              // now we have an array of inputs and actions
              console.log('array')

              oneStep.formActions.formActions.forEach(function (oneAction) {

                if (oneAction['@attributes']['type'] == 'input') {
                  console.log('we have input')
                  oneStepObject.inputs.push(oneAction.input['#text'])
                  oneStepObject.formActions.push({
                    command: oneAction.action['#text'],
                    controlID: oneAction.mappedTo['#text'],
                    inputValue: oneAction.input['#text']
                  })
                }
                if (oneAction['@attributes']['type'] == 'action') {
                  console.log('we have action')

                  if (oneAction.hasOwnProperty('mappedTo')) {
                    console.log('we have action with mappedTo')
                    console.log(oneAction);
                    oneStepObject.formActions.push({
                      command: oneAction.action['#text'],
                      controlID: oneAction.mappedTo['#text']
                    })
                  } else {
                    console.log('we have action without mappedTo')
                    console.log(oneAction);
                    oneStepObject.formActions.push({
                      command: oneAction.action['#text'],
                      controlID: oneAction.controlID['#text']
                    })
                  }

                }


              })

            }


          } else {
            // no actions array or object
          }
          // now grab single props #text property
          let holder = {};
          Object.keys(oneStep).forEach(function (oneKey) {
            if (oneKey != '@attributes' && oneKey != '#text' && oneKey != 'formActions') {
              holder[oneKey] = oneStep[oneKey]['#text']
            }

          })
          Object.assign(oneStepObject, holder);
          stepsArray.push(oneStepObject);
        })

        // oneStepObject = {};

        self.appStackProcess(stepsArray);
      }


      self.updateLabelText = function (event) {
        var train = document.getElementById("train");
        self.selectedStepLabel(train.getStep(event.detail.value).label);
      };

      // function to get AIS connection
      self.getConnected = function () {

        if (!window.localStorage.getItem('conn')) {
          var url = new URL(window.location.href);

          if (url.searchParams.get("user") == null) {
            console.log("not connected to E1...")
            return;
          }
          self.connected(true);
          self.conn({
            username: url.searchParams.get("user"),
            password: url.searchParams.get("password"),
            url: url.searchParams.get("ais"),
            deviceName: url.searchParams.get("device"),
          })

          window.localStorage.setItem('conn', btoa(JSON.stringify(self.conn())))

        } else {
          self.conn(JSON.parse(atob(window.localStorage.getItem('conn'))))
          self.connected(true);
        }
        self.AIS(new ais(self.conn()))

      }

      // hit AIS orch discover service
      self.fetchOrcs = function () {
        let getOrcJSON = JSON.stringify({
          username: self.conn().username,
          password: self.conn().password
        })

        // fetch from E1

        $.ajax({
          url: self.conn().url + '/jderest/discover',
          method: 'post',
          contentType: 'application/json',
          data: getOrcJSON,
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(self.conn().username + ":" + self.conn().password));
          },
          error: function (jqXHR, textStatus, errorThrown) {
            //console.log('There was an error.'+ errorThrown); 
            console.log(jqXHR);
            self.userMessage("There was an error gathering the list of Orchestrations. Please ensure that the Orchestration Discover service is enabled and running on the url and port that was logged into AppShare.")
          }
        }).done(function (response) {
          console.log(response);
          var holder = []
          self.allOrcs(response.orchestrations);
          response.orchestrations.forEach(function (o) {
            holder.push({
              label: o.name,
              value: o.name
            });
          })
          self.orcs(holder);
          console.log(self.orcs())

        })
      }


      // next button to move through steps
      self.nextConfig = function (evt) {
        console.log("CONFIG STEP === " + self.configStep())
        // increment the steps
        self.configStep(self.configStep() + 1);
        var train = document.getElementById("train");
        var next = train.getNextSelectableStep();
        // init the train if next is null
        if (next != null) {
          self.selectedStep(next);
          self.selectedLabel(train.getStep(next).label);
        }
        // by step 3 we know appType and Query Type
        if (self.configStep() == 3) {

          if (self.appType() == 'transact' && self.queryType() == 'orch') {
            self.fetchOrcs()
          }

          //console.log(self.appType())
        }
        if (self.configStep() == 4) {

          self.tableInfo(false)
          if (self.appType() == 'query' || (self.appType() == 'transact' && self.queryType() == 'form')) {

            if (self.queryType() == 'form') {
              self.tableInfo(false)
              self.fetchTargetInfo();
            } else {
              self.fetchTargetInfo();
            }

          } else if (self.appType() == 'transact' && self.queryType() == 'orch') {
            self.setUpMessage("Click next to confirm your app for : " + self.e1Target())
            self.allOrcs().forEach(function (one) {

              if (one.name == self.e1Target()) {
                self.orcInputs(one.inputs);
              }
            })
            self.configStep(self.configStep() + 1);
          } else if (self.appType() == 'transact' && self.queryType() == 'service') {
            self.configStep(self.configStep() + 2);
          }

        }
        if (self.configStep() == 5) {
          if (self.appType() == 'query' && self.queryType() == 'form') {
            self.configStep(self.configStep() + 1);
          } else if (self.appType() == 'query' && self.queryType() == 'table') {
            self.tableInfo(false);
            self.setUpMessage("Building query app for : " + self.e1Target())
            var t = [];
            self.tableValuesSelected().forEach(function (o) {
              console.log(o)
              t.push(o.value);
            })
            self.selectedTableCols(t);
            self.getDataPreview(self.selectedTableCols());
          }

          if (self.appType() == 'query') {

          } else {
            self.setUpMessage("Click Next to confirm : " + self.e1Target())
            console.log(self.tableValuesSelected())
            self.configStep(self.configStep() + 1);
          }


        }
        if (self.configStep() == 6) {

        }

        if (self.configStep() == 7) {
          console.log("steps completed!")
        }


      }

      // final build step
      self.saveApp = function (evt) {
        self.setUpMessage("Saving App...");
        let currentApp = {
          appID: self.appName().replace(/\s/g, ''),
          appName: self.appName(),
          appType: self.appType(),
          queryType: self.queryType(),
          e1Target: self.e1Target(),
          valuesSelected: self.tableValuesSelected(),
          formControls: self.formControls(),
          orcInputs: self.orcInputs(),
          serviceInfo: self.appStackProcess(),
          dataCols: self.selectedTableCols(),
          headerCols: self.headerCols(),
          gridMode: self.gridMode()[0],
          inputType: self.inputType()[0],
          inputMode: self.inputMode(),
          pieSeriesValue: self.pieSeriesValue()
        };

        let appHolder = [];
        // check for saved apps
        let sapps = window.localStorage.getItem('savedApps');
        if (sapps != null) {
          appHolder = JSON.parse(sapps);
        }
        appHolder.push(currentApp);
        window.localStorage.setItem('savedApps', JSON.stringify(appHolder))
        // reload to go to apps screen
        location.reload();

      }
      
      // reset the steps
      self.backConfig = function (evt) {
        if (self.configStep() != 1) {
          self.selectedStep("stp1");
          self.configStep(1)
          self.dataPreview(false);
          self.appType('query');
          self.queryType('table');
          self.transactType('orchestration');
          self.e1Target('');
          self.count(0);
          self.selectedStep('stp1');
          self.selectedLabel('1');
          self.dataprovider('');
          self.headerCols([]);
          self.savedApps([]);
          self.orcs([]);
          self.tables([]);
          self.tableInfo(false);
          self.tableValuesSelected([]);
          self.selectedTableCols([]);
        }
      }

      // map to take dataservice rows and map to an array 
      // of objects {value,label}
      self.infoFieldMapper = (row) => {
        const mapped = [];
        console.log(row)
        Object.keys(row).forEach((field) => {
          // remove the table prefix
          const shortField = field.substring(field.indexOf('_') + 1);
          // remove the MOExist prop
          if (field != 'MOExist') {
            if (field != 'rowIndex') {
              if (typeof row[field].value != 'undefined' || row[field].value != '') {
                mapped.push({
                  value: shortField,
                  label: row[field].title
                });

              }
            }
          }

        });
        return mapped;
      };

      // map from e1 formservice grid
      self.formInfoGridMapper = (row) => {
        const mapped = [];
        console.log(row)
        Object.keys(row).forEach((field) => {

          if (field.substring(0, 3) != 'lbl') {
            mapped.push({
              value: row[field].id,
              label: row[field].title,
              dataType: row[field].dataType,
              formControlType: row[field].longName.substring(0, 3)
            });
          }

        });
        return mapped;
      };

      // map from e1 formservice
      self.formInfoFieldMapper = (row) => {
        const mapped = [];
        console.log(row)
        Object.keys(row).forEach((field) => {

          if (field.substring(0, 3) != 'lbl') {
            mapped.push({
              value: row[field].id,
              label: row[field].title,
              dataType: row[field].dataType,
              formControlType: row[field].longName.substring(0, 3)
            });

          }



        });
        return mapped;
      };

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

              }
            }
          }

        });
        mapped.rowIndex = self.count();
        return mapped;
      };

      // get table schema to select rows for data
      self.fetchTargetInfo = function () {
        var target = self.e1Target() // | self.e1Target();
        var targetQuery;
        self.setUpMessage("Initializing App for : " + target)

        self.AIS().getToken().then(function (token) {
          self.setUpMessage("Fetching Data Structure Information : " + target)

          if (self.appType() == 'query' && self.queryType() == 'table') {
            targetQuery = self.AIS().createDataQuery(target).pageSize(1)
            //.select(['LITM', 'ITM', 'BUYR'])
            //.where('LITM').eq('230')
            //.and('BUYR').gt(3);
          } else {
            targetQuery = self.AIS().createFormServiceCall(target)
          }

          // decide what mapper to use
          let mapper;
          if (self.queryType() == 'form') {
            mapper = self.formInfoFieldMapper
          } else {
            mapper = self.infoFieldMapper
          }
          // make AIS call
          self.AIS().fetch(targetQuery, mapper).then(function (results) {
            console.log(results);
            
            self.setUpMessage("");
            var h = []
            var t = []
            if (self.queryType() == 'form') {

              self.formDetails(results['fs_' + self.e1Target()].data);
              $.each(self.formDetails(), function (i, o) {

                if (i.substring(0, 3) != 'lbl') {
                  h.push({
                    label: o.title,
                    value: o.id
                  })
                  t.push({
                    label: o.title,
                    id: o.id,
                    type: i.substring(0, 3),
                    key: i
                  })
                }



              })

            } else {

              $.each(results[0], function (i, o) {
                h.push({
                  label: o.label,
                  value: o.value
                })
              })

            }

            if (self.appType() == 'query') {
              
              self.tableInfo(h);
              self.gridColumns(h)
              self.previewControls(false)
            } else {
              self.formControls(t);
              self.previewControls(self.formControls());
            }

          })

        })
      }

      // fetch data on selected rows for preview
      self.getDataPreview = function (selectCols) {
        if (self.appType() == 'query') {
          self.setUpMessage("fetching data for review...");

          var targetQuery = self.AIS().createDataQuery(self.e1Target()).pageSize(10)
            .select(selectCols)
          //.where('LITM').eq('230')
          //.and('BUYR').gt(3);

          self.count(0);
          self.AIS().fetch(targetQuery, self.dataFieldMapper, true).then(function (results) {
            self.count(0);
            self.e1Data(results);
            console.log(results);
            self.setUpMessage("preview data fetched : " + self.e1Target())

            //console.log(results);
            // {"headerText": "Department Name", "field": "DepartmentName","resizable": "enabled"}
            let hc = [];
            self.tableValuesSelected().forEach(function (eachOne) {
              hc.push({
                headerText: eachOne.label,
                field: eachOne.value
              })
              //console.log(eachOne);
            })
            console.log(hc)

            self.headerCols(hc);
            self.dataPreview(results);

            //console.log(self.dataPreview());
            // self.dataprovider(new oj.ArrayDataProvider(results, {
            //   idAttribute: 'rowIndex'
            // }));
            self.setUpMessage("Click next to finish confirguing your app : ");
          })
        } else {
          let htmlHolder;
          // $.each(self.formDetails(), function (i, o) {
          //   if (o.hasOwnProperty('internalValue') && i.substring(0, 3) != 'lbl') {
          //     console.log(o.title)
          //   }
          // })
        }

      }


      // bump to bottom of event queue
      setTimeout(function () {
        self.init();

      }, 0)

      // kick off the init
      //self.init();

    }

    return new HomeViewModel();
  }
);
