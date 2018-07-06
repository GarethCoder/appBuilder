define(['ojs/ojcore', 'knockout', 'ojs/ojmodule-element-utils', 'ojs/ojmodule-element', 'ojs/ojrouter', 'ojs/ojknockout', 'ojs/ojarraytabledatasource'],
  function(oj, ko, moduleUtils) {
     function ControllerViewModel() {
       var self = this;

      // Media queries for repsonsive layouts
      var smQuery = oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
      self.smScreen = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);

       // Router setup
       self.router = oj.Router.rootInstance;
       self.router.configure({
         'home': {label: 'Home', isDefault: true},
         'apps': {label: 'Saved Apps'},
         'zones': {label: 'Saved Zones'}
       });
      oj.Router.defaults['urlAdapter'] = new oj.Router.urlParamAdapter();

      self.moduleConfig = ko.observable({'view':[], 'viewModel':null});
      ko.computed(function() {
        var name = self.router.moduleConfig.name();
        var viewPath = 'views/' + name + '.html';
        var modelPath = 'viewModels/' + name;
        var masterPromise = Promise.all([
          moduleUtils.createView({'viewPath':viewPath}),
          moduleUtils.createViewModel({'viewModelPath':modelPath})
        ]);
        masterPromise.then(
          function(values){ 
            self.moduleConfig({'view':values[0],'viewModel':values[1]}); 
          },
          function(reason){}
        );
      });

      // Navigation setup
      var navData = [
      {name: 'Home', id: 'home',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-chart-icon-24'},
      {name: 'Apps', id: 'apps',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-fire-icon-24'},
       {name: 'Zones', id: 'zones',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-chart-icon-24'}

      ];
      self.navDataSource = new oj.ArrayTableDataSource(navData, {idAttribute: 'id'});

      // Header
      // Application Name used in Branding Area
      self.appName = ko.observable("App Name");
      // User Info used in Global Navigation area
      self.userLogin = ko.observable("christian@steltix.com");

      // Footer
      function footerLink(name, id, linkTarget) {
        this.name = name;
        this.linkId = id;
        this.linkTarget = linkTarget;
      }
      var smQuery = oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
        self.smScreen = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);

        // Fix header on phone sizes and adjust content top margin when screen size changes.
       

      self.footerLinks = ko.observableArray([
        // new footerLink('About Oracle', 'aboutOracle', 'http://www.oracle.com/us/corporate/index.html#menu-about'),
        // new footerLink('Contact Us', 'contactUs', 'http://www.oracle.com/us/corporate/contact/index.html'),
        // new footerLink('Legal Notices', 'legalNotices', 'http://www.oracle.com/us/legal/index.html'),
        // new footerLink('Terms Of Use', 'termsOfUse', 'http://www.oracle.com/us/legal/terms/index.html'),
        // new footerLink('Your Privacy Rights', 'yourPrivacyRights', 'http://www.oracle.com/us/legal/privacy/index.html')
      
      ]);
     }

     return new ControllerViewModel();
  }
);
