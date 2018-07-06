'use strict';

requirejs.config({
  baseUrl: 'js',
  // Path mappings for the logical module names
  // Update the main-release-paths.json for release mode when updating the mappings
  waitSeconds: 30,
  paths:
//injector:mainReleasePaths

{
  "aisclient":"libs/SteltixLabs/e1processes/aisclient",
  "processes":"libs/SteltixLabs/e1processes/processes",
  "ais":"libs/SteltixLabs/ais-client",
  "xlsx":"libs/SteltixLabs/xlsx.full.min",
  "jszip":"libs/SteltixLabs/jszip",
  "excel":"libs/SteltixLabs/e1processes/handleExcelDrop",
  "knockout":"libs/knockout/knockout-3.4.2.debug",
  "jquery":"libs/jquery/jquery-3.3.1",
  "jqueryui-amd":"libs/jquery/jqueryui-amd-1.12.1",
  "promise":"libs/es6-promise/es6-promise",
  "hammerjs":"libs/hammer/hammer-2.0.8",
  "ojdnd":"libs/dnd-polyfill/dnd-polyfill-1.0.0",
  "ojs":"libs/oj/v5.0.0/debug",
  "ojL10n":"libs/oj/v5.0.0/ojL10n",
  "ojtranslations":"libs/oj/v5.0.0/resources",
  "text":"libs/require/text",
  "signals":"libs/js-signals/signals",
  "customElements":"libs/webcomponents/custom-elements.min",
  "css":"libs/require-css/css"
}

//endinjector
  ,
  // Shim configurations for modules that do not expose AMD
  shim: {
    'jquery': {
      exports: ['jQuery', '$']
    }
  }
});

require(['ojs/ojcore', 'knockout', 'appController', 'ojs/ojknockout',
    'ojs/ojmodule', 'ojs/ojrouter', 'ojs/ojnavigationlist', 'ojs/ojbutton', 'ojs/ojtoolbar'
  ],
  function (oj, ko, app) { // this callback gets executed when all required modules are loaded

    $(function () {

      function init() {
        oj.Router.sync().then(
          function () {
            // Bind your ViewModel for the content of the whole page body.
            ko.applyBindings(app, document.getElementById('globalBody'));
          },
          function (error) {
            oj.Logger.error('Error in root start: ' + error.message);
          }
        );
      }

      // If running in a hybrid (e.g. Cordova) environment, we need to wait for the deviceready 
      // event before executing any code that might interact with Cordova APIs or plugins.
      if ($(document.body).hasClass('oj-hybrid')) {
        document.addEventListener("deviceready", init);
      } else {
        init();
      }

    });

  }
);