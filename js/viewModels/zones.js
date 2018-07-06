define(['ojs/ojcore', 'knockout', 'jquery', 'ais', 'ojs/ojtoolbar', 'ojs/ojnavigationlist', 'ojs/ojrouter', 'jet-composites/form-holder/loader', 'jet-composites/app-holder/loader'],
  function (oj, ko, $, ais) {

    function ZonesViewModel() {
      var self = this;
      self.router = oj.Router.rootInstance;
      self.selectedZone = ko.observable('');
      self.savedApps = ko.observable(JSON.parse(window.localStorage.getItem('savedApps')))
      self.savedZone = ko.observable(JSON.parse(window.localStorage.getItem('savedZones')))
      self.currentLoadedApp1 = ko.observable(false);
      self.currentLoadedApp2 = ko.observable(false);
      self.currentLoadedApp3 = ko.observable(false);
      self.currentLoadedApp4 = ko.observable(false);
      self.currentLoadedApp5 = ko.observable(false);
      self.currentLoadedApp6 = ko.observable(false);
      self.zoneName = ko.observable();
      self.back = function(evt){
        self.router.go('apps')
      }
      // resolve the apps loading into their defined locations
      setTimeout(function(){
        if (self.savedZone()) {
          self.zoneName(self.savedZone().zoneName)
          self.selectedZone(self.savedZone().template)
          self.savedZone().holders.forEach(function (oneHolder) {          
            let curr = {}

            self.savedApps().forEach(function (oneApp) {
              if (oneApp.appID == oneHolder.appId) {
                curr = oneApp
              }
            })
            console.log(curr);
            if(oneHolder.holder == "1"){
              self.currentLoadedApp1(curr)
            }
            if(oneHolder.holder == "2"){
              self.currentLoadedApp2(curr)
            }
            if(oneHolder.holder == "3"){
              self.currentLoadedApp3(curr)
            }
            if(oneHolder.holder == "4"){
              self.currentLoadedApp4(curr)
            }
            if(oneHolder.holder == "5"){
              self.currentLoadedApp5(curr)
            }
            if(oneHolder.holder == "6"){
              self.currentLoadedApp6(curr)
            }
  
  
          })
  
  
        }
      },0)


    }


    return new ZonesViewModel();
  });
