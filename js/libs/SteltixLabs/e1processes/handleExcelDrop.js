const ProcessExcel = () => {
    var exactExtractHeader = [];
    var dropHeaders = [];

    const resetDropDefaults = () => {
        exactExtractHeader = [];
        dropHeaders = [];
    }

    const getProcess = (data) => {
        let formName = data[0][0].FormName;
        console.log(formName);

        require(["processes/" + formName], function (formObj) {
            console.log('test');
            console.log(formObj);

            formObj.init();
              // ensure token
              
        });
    };

    const process = (files) => {
        var internalDataHolder = []; // this will store all the Excel worksheets in an array
        resetDropDefaults();

        console.log(files);

        var reader = new FileReader;
        var name = files[0].name;
        reader.onload = function (e) {
            var data = reader.content;
            if (data == undefined) {
                data = e.target.result;
            }

            try {
                var workbook = XLSX.read(data, {
                    type: "binary"
                });
            } catch (e) {
                self.fileText("Invalid File (expects .xlsx)");
            };
            dropHeaders = [];
            var count = 0,
                sheet_name_list = workbook.SheetNames,
                jsonData = [],
                worksheet;
            sheet_name_list.forEach(function (y) {
                if (y.substr(0, 1) === 'P' && y.indexOf("_") > 0) {
                    worksheet = workbook.Sheets[y];
                    jsonData = XLSX.utils.sheet_to_json(worksheet, {
                        range: 1,
                        defaultValue: ''
                    });

                    // copy of JSON with headers (used for  extracting)
                    exactExtractHeader = exactExtractHeader.concat(XLSX.utils.sheet_to_json(worksheet, {
                        range: 1,
                        defaultValue: '',
                        header: 1
                    })[0]);

                    // cleanup headers
                    $.each(exactExtractHeader, function (index, headerObj) {
                        headerObj = headerObj.replace('*', '');
                        headerObj = headerObj.replace('†', '');
                        exactExtractHeader[index] = headerObj;
                    });

                    $.each(jsonData, function (inx, ob) {
                        ob.ROW = inx + 2;
                        $.each(ob, function (key, str) {

                            if (key.search(/\undefined/) !== -1) { // check for undefined property in headers
                                alert("Undefined was found in your template. Please download a fresh template.");
                                location.reload();
                            }

                            if (key.search(/\*/) !== -1) { // column title contains asterisk
                                delete ob[key];
                                var newKey = key.replace(/\*/g, '');
                                ob[newKey] = str;
                                if (inx == 0)
                                    dropHeaders.push(newKey);
                            }

                            if (key.search(/\†/) !== -1) { // column title contains cross
                                delete ob[key];
                                var newKey = key.replace(/\†/g, '');
                                ob[newKey] = str;
                                if (inx == 0)
                                    dropHeaders.push(newKey);
                            }

                            if (!(key.search(/\*/) !== -1 || key.search(/\†/) !== -1) && inx == 0 && key !== 'ROW')

                                dropHeaders.push(key);
                            // console.log(dropHeaders);
                        });
                    });
                    internalDataHolder.push(jsonData);
                    count++;
                }
            });

            // console.log(internalDataHolder);
            // console.log(jsonData);

            if (jsonData.length > 0) {
                dropHeaders = dropHeaders.filter(function (item, i, ar) {
                    return ar.indexOf(item) === i;
                });
                getProcess(internalDataHolder);

                // _.prepareDrop(internalDataHolder);

                internalDataHolder = [];
            } else {
                console.log("Your Excel template is in the wrong format. Please redownload it and try again.");
            }
        };
        reader.readAsBinaryString(files[0]);
    }

    return {
        process
    }
}