/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';
define(
  ['ojs/ojcore', 'knockout', 'jquery', 'excel', 'xlsx', 'jszip', 'ojL10n!./resources/nls/xml-json-strings'],
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
      self.callback = '';

      self.dragOverHandler = function (ev) {
        console.log('File(s) in drop zone');

        // Prevent default behavior (Prevent file from being opened)
        // ev.preventDefault();
      }

      self.dropHandler = function (data, evt) {
        console.log(evt.originalEvent.dataTransfer);
        evt.stopPropagation();
        evt.preventDefault();
        var dt = evt.originalEvent.dataTransfer
        var files = dt.files

        // // files is a FileList of File objects. List some properties.
        var output = [];
        for (var i = 0, f; f = files[i]; i++) {
          output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
            f.size, ' bytes, last modified: ',
            f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
            '</li>');
        }
        document.getElementById('list').innerHTML = '<ul style="list-style:none">' + output.join('') + '</ul>';
        var reader = new FileReader;
        var name = files[0].name;

        if (name.includes('xlsx')) {
          let excel = ProcessExcel();

          excel.process(files);
        } else {

          reader.onload = function (e) {
            var data = reader.content;

            if (data == undefined) {
              data = e.target.result;
            }
            // Pass event to removeDragData for cleanup
            self.getXML(data);
            self.removeDragData(event)
          }
          reader.readAsBinaryString(files[0]);
        };


      }

      self.removeDragData = function (ev) {
        console.log('Removing drag data')

      }
      // Example for parsing context properties
      if (context.properties.callback) {
        self.callback = context.properties.callback
      }
      self.parseXml = function (xml) {
        var dom = null;
        if (window.DOMParser) {
          try {
            dom = (new DOMParser()).parseFromString(xml, "text/xml");
          } catch (e) {
            dom = null;
          }
        } else if (window.ActiveXObject) {
          try {
            dom = new ActiveXObject('Microsoft.XMLDOM');
            dom.async = false;
            if (!dom.loadXML(xml)) // parse error ..

              window.alert(dom.parseError.reason + dom.parseError.srcText);
          } catch (e) {
            dom = null;
          }
        } else
          alert("cannot parse xml string!");
        return dom;
      }

      self.xmlToJson = function (xml) {

        // Create the return object
        var obj = {};

        if (xml.nodeType == 1) { // element
          // do attributes
          if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
              var attribute = xml.attributes.item(j);
              obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
          }
        } else if (xml.nodeType == 3) { // text
          obj = xml.nodeValue;
        }

        // do children
        if (xml.hasChildNodes()) {
          for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof (obj[nodeName]) == "undefined") {
              obj[nodeName] = self.xmlToJson(item);
            } else {
              if (typeof (obj[nodeName].push) == "undefined") {
                var old = obj[nodeName];
                obj[nodeName] = [];
                obj[nodeName].push(old);
              }
              obj[nodeName].push(self.xmlToJson(item));
            }
          }
        }
        return obj;
      };

      self.getXML = function (data) {
        if (typeof self.callback == 'function') {
          // console.log('calling callback');
          // self.callback(self.xmlToJson(self.parseXml(data)));
        }
      }

      self.xlsxToJSON = function (data) {


      };

      //Once all startup and async activities have finished, relocate if there are any async activities
      self.busyResolve();
    };

    //Lifecycle methods - uncomment and implement if necessary 
    //ExampleComponentModel.prototype.activated = function(context){
    //};

    //ExampleComponentModel.prototype.attached = function(context){
    //};

    //ExampleComponentModel.prototype.bindingsApplied = function(context){
    //};

    //ExampleComponentModel.prototype.detached = function(context){
    //};

    //ExampleComponentModel.prototype.propertyChanged = function(context){
    //};

    return ExampleComponentModel;
  });