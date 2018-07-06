define(['ojs/ojcore', 'knockout', 'jquery', 'ais', 'ojs/ojtoolbar', 'ojs/ojnavigationlist','ojs/ojrouter', 'jet-composites/form-holder/loader', 'jet-composites/app-holder/loader'],
  function (oj, ko, $, ais) {

    function AppsViewModel() {
      var self = this;
      self.router = oj.Router.rootInstance;
      self.currentLoadedApp = ko.observable(false);
      self.currentLoadedApp1 = ko.observable(false);
      self.currentLoadedApp2 = ko.observable(false);
      self.currentLoadedApp3 = ko.observable(false);
      self.currentLoadedApp4 = ko.observable(false);
      self.currentLoadedApp5 = ko.observable(false);
      self.currentLoadedApp6 = ko.observable(false);
      self.savedApps = ko.observable(JSON.parse(window.localStorage.getItem('savedApps')));
      self.appName = ko.observable("");
      self.appLoaded = ko.observable(false);
      self.dataprovider = ko.observable();
      self.headerCols = ko.observable()
      self.count = ko.observable(0);
      self.AIS = ko.observable({});
      self.appType = ko.observable();
      self.formControls = ko.observable();
      self.selectedItem = ko.observable("home");
      self.drawerOpen = ko.observable(false);
      self.display = ko.observable("icons");
      self.goToZones = function(evt){
        self.router.go('zones');
      }
      self.isContrastBackground = ko.observable(false);
      self.isContrastBackground.subscribe(function(newValue){
            if(newValue){
                $("#navlistcontainer").addClass("oj-contrast-background oj-contrast-marker");
            }else{
                $("#navlistcontainer").removeClass("oj-contrast-background oj-contrast-marker");
            }
        });
      self.currentWorkingCanvas = ko.observable({
        holders:[]
      });
      self.savedZones = ko.observable([{
        label: "Dashboard Zone",
        value: "dash"
      },
      {
        label: "Mobile Zone",
        value: "mobile"
      },{
        label: "Default Zone",
        value: "default"
      }
    ])
      self.selectedZone = ko.observable('default');
      
      self.dragOverHandler = function (obj, ev) {
        console.log("dragOver");
        //console.log(ev.originalEvent.target.id);
        // Change the source element's background color to signify drag has started
        ev.originalEvent.currentTarget.style.border = "none"
        ev.originalEvent.currentTarget.style.backgroundColor = "#D3D3D3"
        // Set the drag's format and data. Use the event target's id for the data 
        //ev.originalEvent.dataTransfer.setData("text/plain", ev.originalEvent.target.id);

      }
      self.dragLeaveHandler = function (obj, ev) {
        console.log("dragleave");
        //console.log(ev.originalEvent.target.id);
        // Change the source element's background color to signify drag has started
        ev.originalEvent.currentTarget.style.border = "1px dashed #D3D3D3";
        ev.originalEvent.currentTarget.style.backgroundColor = "#ffffff"
        // Set the drag's format and data. Use the event target's id for the data 
        //ev.originalEvent.dataTransfer.setData("text/plain", ev.originalEvent.target.id);

      }
      self.saveZone = function(ev){
        console.log('save new canvas');
        var zoneName = prompt("zone name");
        self.currentWorkingCanvas().zoneName = zoneName;
        self.currentWorkingCanvas().template = self.selectedZone()
        window.localStorage.setItem('savedZones', JSON.stringify(self.currentWorkingCanvas()))
        

      }
      self.newCanvas = function(){
        console.log('adding new canvas here...')
      }
      self.canvasButtons = function(){
        return [{
          action:"+ add new zone",
          callback: self.newCanvas

        },{
          action:"save zone",
          callback: self.saveZone

        },{
          action:"go to zone",
          callback: self.goToZones

        }]
      }
      self.dropHandler = function (obj, ev) {
        ev.preventDefault();
        console.log('dropped')
        // ev.originalEvent.currentTarget.removeEventListener("dragover",self.dragOverHandler)
        let selectedApp;
        let app = ev.originalEvent.dataTransfer.getData('text/plain');
        // find appConfig
        self.savedApps().forEach(function (oneApp) {
          if (oneApp.appID == app) {
            selectedApp = oneApp
          }
        })
        ev.originalEvent.currentTarget.style.border = "none";
        ev.originalEvent.currentTarget.style.backgroundColor = "#EAEAEA"
        switch (ev.originalEvent.target.id.substring(2)) {
          case '1':
            self.currentLoadedApp1(selectedApp)
            self.currentWorkingCanvas().canvasType =  self.selectedZone()
            self.currentWorkingCanvas().holders.push({
              appId: selectedApp.appID,
              holder: ev.originalEvent.target.id.substring(2)
            })
            break;
            case '2':
            self.currentLoadedApp2(selectedApp)
            self.currentWorkingCanvas().canvasType =  self.selectedZone()
            self.currentWorkingCanvas().holders.push({
              appId: selectedApp.appID,
              holder: ev.originalEvent.target.id.substring(2)
            })
            break;
            case '3':
            self.currentLoadedApp3(selectedApp)
            self.currentWorkingCanvas().canvasType =  self.selectedZone()
            self.currentWorkingCanvas().holders.push({
              appId: selectedApp.appID,
              holder: ev.originalEvent.target.id.substring(2)
            })
            break;
            case '4':
            self.currentLoadedApp4(selectedApp)
            self.currentWorkingCanvas().canvasType =  self.selectedZone()
            self.currentWorkingCanvas().holders.push({
              appId: selectedApp.appID,
              holder: ev.originalEvent.target.id.substring(2)
            })
            break;
            case '5':
            self.currentLoadedApp5(selectedApp)
            self.currentWorkingCanvas().canvasType =  self.selectedZone()
            self.currentWorkingCanvas().holders.push({
              appId: selectedApp.appID,
              holder: ev.originalEvent.target.id.substring(2)
            })
            break;
            case '6':
            self.currentLoadedApp6(selectedApp)
            self.currentWorkingCanvas().canvasType =  self.selectedZone()
            self.currentWorkingCanvas().holders.push({
              appId: selectedApp.appID,
              holder: ev.originalEvent.target.id.substring(2)
            })
            break;
        }
      }


      self.makeApp = function (evt) {
        self.router.go('home');
      }
      self.saveData = function (data) {
        console.log(data);
      }
      self.loadApp = function (evt) {
        console.log('into loadApp')


        self.savedApps().forEach(function (oneApp) {

          if (oneApp.appID == evt.currentTarget.id) {
            //self.currentLoadedApp5(oneApp);
            // self.currentLoadedApp1(oneApp);
            // self.currentLoadedApp2(oneApp);
            // self.currentLoadedApp3(oneApp);

          }

        })

        // console.log(self.currentLoadedApp())


      }

      self.returnToMenu = function (evt) {
        self.appLoaded(null);
        self.currentLoadedApp(null);
        let apps = JSON.parse(window.localStorage.getItem('savedApps'));
        self.savedApps(apps)
      }
      self.transitionCompleted = function () {

        $('.myAppsHook').on('dragstart', function (ev) {
          ev.originalEvent.dataTransfer.setData("text/plain", ev.originalEvent.target.id);
          var img = document.createElement("img");
          img.src = "icon_dragndrop.png";
          img.style.width = "50px";
          ev.originalEvent.dataTransfer.setDragImage(img, 50, 50);
          //console.log(ev.originalEvent.dataTransfer.getData("text/plain"))
        })
        // $('.dropper').on('drop', function(ev){
        //   console.log('test')
        //   console.log(ev.originalEvent.dataTransfer.getData("text/plain"))
        // })
      };

    }


    return new AppsViewModel();
  });
