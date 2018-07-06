if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
      'use strict';
      if (typeof start !== 'number') {
        start = 0;
      }
      
      if (start + search.length > this.length) {
        return false;
      } else {
        return this.indexOf(search, start) !== -1;
      }
    };
  }

  if (FileReader.prototype.readAsBinaryString === undefined) {
    FileReader.prototype.readAsBinaryString = function (fileData) {
        var binary = "";
        var pt = this;
        var reader = new FileReader();
        reader.onload = function (e) {
            var bytes = new Uint8Array(reader.result);
            var length = bytes.byteLength;
            for (var i = 0; i < length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            //pt.result  - readonly so assign content to another property
            pt.content = binary;
            pt.onload(); // thanks to @Denis comment
        }
        reader.readAsArrayBuffer(fileData);
    }
}

define(["aisclient","jquery"],function(_,$){
    var initObj = {};
    initObj.init = function() { // init is for all users.
        var df = $.Deferred();
        var noDetails = false;
        var config = null;
        if (localStorage.getItem("JDEUser") !== null) {
            config = JSON.parse(localStorage.getItem("JDEUser"))
        }
        if (globals.demoMode() === true) {
            config = globals.JDEuser = {
                JDEusername: 'demo',
                JDEpassword: 'demo',
                JDEurl: 'demo.steltix.com'
            };
            localStorage.setItem("JDEUser",JSON.stringify(config));
        } else if (config === null) {
            oj.Router.rootInstance.stateId('configuration');
            noDetails = true;
            return false;
        } else {
            globals.JDEuser = config;
        }
        if (noDetails) {
            // alertInit("Please enter your E1 credentials to begin using dropZone");
            // setTimeout(function(){
            //     alertClose();
            // },4000);
            globals.connStatus.changeStatus(0,"Please enter your JDE credentials to begin using dropZone");
        } else {
            // refactor into array loop
            globals.configUrl = "//" + config.JDEurl + "/jderest/defaultconfig";
            globals.tokenUrl = "//" + config.JDEurl + "/jderest/tokenrequest";
            globals.formUrl = "//" + config.JDEurl + "/jderest/formservice";
            globals.batchUrl = "//" + config.JDEurl + "/jderest/appstack";
            globals.mediaUpdateUrl = "//" + config.JDEurl + "/jderest/file/updatetext";
            globals.mediaGetUrl = "//" + config.JDEurl + "/jderest/file/gettext";
            globals.poUrl = "//" + config.JDEurl + "/jderest/poservice";
            
            // perform settings check
            _.getConfig().done(function(data){ // Check #2: Is AIS correctly set up
                if (data) {
                    if (data.keepJasSessionOpen === false) {
                        globals.connStatus.changeStatus(0,"Please contact your CNC to configure AIS for dropZone. <code>keepJasSessionOpen</code> needs to be set to <code>true</code>");
                    } else {
                        globals.connStatus.changeStatus(2,"You are <b>" + config.JDEusername + "</b> at <b>" + config.JDEurl + "</b>");
                        _.checkToken(config).then(function(validObj) {
                            if (validObj.valid === true) {
                                var userInfo = JSON.parse(localStorage.getItem("userInfo"));
                                _.statusConnect(config,userInfo);
                                globals.stopTokenChecking(false);
                                _.tokenIntervalCheck(config);
                            } else if (validObj.reason === "connection") {
                                globals.connStatus.changeStatus(0,"There is a problem with your connection. Check your VPN and internet connection, and that the dropZone environment matches your AIS protocol (http or https).");
                                df.reject();
                            } else if (validObj.valid === false && validObj.reason === "invalid") {
                                _.getToken().then(function(data) {                          
                                    globals.stopTokenChecking(false);
                                    _.tokenIntervalCheck(config);
                                });
                            } else {
                                globals.connStatus.changeStatus(0,"An unknown error occurred while obtaining a token");
                            }
                        });
                    }
                } else {
                    globals.connStatus.changeStatus(0,"Unable to verify AIS settings. Please check your internet or network connection and log in again.");
                }
            }).fail(function(error) {
                globals.connStatus.changeStatus(0,"There's a problem with your internet or VPN connection. Please reconnect and log in again.");
            });
        } 
    }
    return initObj;
});
