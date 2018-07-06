/**
 * Helper method for export_table_to_excel & export_table_to_excel_multi. Converts HTML table to a JavaScript array of arrays
 *
 * @method generateArray
 * @return {object} Array of arrays, rows and columns
 *
 * @param {object} data HTML table DOM node
 */
function generateArray(table) {
  var out = [];
  var rows = table.querySelectorAll('tr');
  var ranges = [];
  for (var R = 0; R < rows.length; ++R) {
    var outRow = [];
    var row = rows[R];
    var columns = row.querySelectorAll('td');
    for (var C = 0; C < columns.length; ++C) {
      var cell = columns[C];
      var colspan = cell.getAttribute('colspan');
      var rowspan = cell.getAttribute('rowspan');
      var cellValue = cell.innerText;
      if (cellValue !== "" && cellValue == +cellValue) cellValue = +cellValue;

      //Skip ranges
      ranges.forEach(function (range) {
        if (R >= range.s.r && R <= range.e.r && outRow.length >= range.s.c && outRow.length <= range.e.c) {
          for (var i = 0; i <= range.e.c - range.s.c; ++i) outRow.push(null);
        }
      });

      //Handle Row Span
      if (rowspan || colspan) {
        rowspan = rowspan || 1;
        colspan = colspan || 1;
        ranges.push({
          s: {
            r: R,
            c: outRow.length
          },
          e: {
            r: R + rowspan - 1,
            c: outRow.length + colspan - 1
          }
        });
      };

      //Handle Value
      outRow.push(cellValue !== "" ? cellValue : null);

      //Handle Colspan
      if (colspan)
        for (var k = 0; k < colspan - 1; ++k) outRow.push(null);
    }
    out.push(outRow);
  }
  return [out, ranges];
};

function datenum(v, date1904) {
  if (date1904) v += 1462;
  var epoch = Date.parse(v);
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}
/**
 * Helper method for export_table_to_excel & export_table_to_excel_multi
 *
 * @method sheet_from_array_of_arrays
 * @return {object} The input for XLSX.write
 *
 * @param {object} data Array of arrays, with each top-level array being a row, and within each row element is an array of strings which represent the cell values
 * @param {object} opts Options object
 */
function sheet_from_array_of_arrays(data, opts) {
  var ws = {};
  var range = {
    s: {
      c: 10000000,
      r: 10000000
    },
    e: {
      c: 0,
      r: 0
    }
  };
  for (var R = 0; R != data.length; ++R) {
    for (var C = 0; C != data[R].length; ++C) {
      if (range.s.r > R) range.s.r = R;
      if (range.s.c > C) range.s.c = C;
      if (range.e.r < R) range.e.r = R;
      if (range.e.c < C) range.e.c = C;
      var cell = {
        v: data[R][C]
      };
      if (cell.v == null) continue;
      var cell_ref = XLSX.utils.encode_cell({
        c: C,
        r: R
      });

      if (typeof cell.v === 'number') cell.t = 'n';
      else if (typeof cell.v === 'boolean') cell.t = 'b';
      else if (cell.v instanceof Date) {
        cell.t = 'n';
        cell.z = XLSX.SSF._table[14];
        cell.v = datenum(cell.v);
      } else cell.t = 's';

      ws[cell_ref] = cell;
    }
  }
  if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
  return ws;
}

function Workbook() {
  if (!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  this.Sheets = {};
}

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

/**
 * Single drop template builder
 *
 * @method export_table_to_excel
 * @return void (Saves Excel file to disk)
 *
 * @param {string} mode For switching output options
 * @param {string} form String with name of form
 * @param {string} id ID of the HTML table that contains the template data
 * @param {string} id2 ID of the HTML table that contains the descriptions data
 */

 // E1 PROCESSES
function export_table_to_excel(mode, form, id, id2) {
  var theTable = document.getElementById(id);
  var oo = generateArray(theTable);
  var ranges = oo[1];
  /* original data */
  var data = oo[0];
  var ws_name = form;
  console.log(data);
  var wb = new Workbook()
  ws = sheet_from_array_of_arrays(data);

  /* add ranges to worksheet */
  ws['!merges'] = ranges;

  /* add worksheet to workbook */
  wb.SheetNames.push(ws_name);

  wb.Sheets[ws_name] = ws;

  if (id2) {
    var secondTable = document.getElementById(id2);
    var ooo = generateArray(secondTable);
    var ranges2 = ooo[1];
    var data2 = ooo[0];
    var ws2_name = "Description";
    ws2 = sheet_from_array_of_arrays(data2);
    ws2['!merges'] = ranges2;
    wb.SheetNames.push(ws2_name);
    wb.Sheets[ws2_name] = ws2;
  }
  if (mode == "Summary") {
    var dtName = "test"
    var dateName = form + "-ERROR SUMMARY-" + dtName + ".xlsx";
  } else if (mode == "Raw") {
    var dtName = moment().format('MMMM Do YYYY h:mm:ss');
    var dateName = form + "-RAW ERROR DATA-" + dtName + ".xlsx";
  } else if (mode == "Raw2") {
    var dtName = moment().format('MMMM Do YYYY h:mm:ss');
    var dateName = form + ".xlsx";
  } else if (mode == "Raw3") {
    var dtName = moment().format('MMMM Do YYYY h:mm:ss');
    var dateName = "DROPZONE_TEMPLATE_" + form + ".xlsx";
  } else if (mode == "Output") {
    var dtName = moment().format('MMMM Do YYYY h:mm:ss');
    var dateName = "DROPZONE_OUTPUT_" + form + "_" + dtName + ".xlsx";
  } else {
    var dtName = moment().format('MMMM Do YYYY h:mm:ss');
    var dateName = form + "-INPUT-FILE-" + dtName + ".xlsx";
  }




  var wbout = XLSX.write(wb, {
    bookType: 'xlsx',
    bookSST: false,
    type: 'binary'
  });

  saveAs(new Blob([s2ab(wbout)], {
    type: "application/octet-stream"
  }), dateName)
}
/**
 * Multi drop template builder
 *
 * @method export_table_to_excel_multi
 * @return void (Saves Excel file to disk)
 *
 * @param {string} mode For switching output options
 * @param {string} entity Name of entity
 * @param {object} formsArr Array of strings which are IDs of the HTML tables to target for, OR array of arrays according to the output of the generateArray function
 * @param {string} descriptions ID of the HTML table that contains the description data
 */
// E1 PROCESSES
function export_table_to_excel_multi(mode, entity, formsArr) {

  var wb = new Workbook();

  $.each(formsArr, function (i, o) {
    if (typeof o === 'string') {
      if (mode === "Output") {
        var secondTable = $('#outputHolder').find('.' + o)[0];
      } else {
        var secondTable = document.getElementById(o);
      }
      var ooo = generateArray(secondTable);
    } else {
      var ooo = o;
    }
    var ranges2 = ooo[1];
    var data2 = ooo[0];

    if (o.substr(0, 1) === 'P' && o.indexOf("_") > 0) {
      var ws2_name = o;
    } else {
      var ws2_name = "P_ORCH";
    }
    ws2 = sheet_from_array_of_arrays(data2);
    ws2['!merges'] = ranges2;
    wb.SheetNames.push(ws2_name);
    wb.Sheets[ws2_name] = ws2;
  })

  if (mode === "Raw3") {
    var descTable = document.getElementById("descriptions");
    var ooo2 = generateArray(descTable);
    var ranges3 = ooo2[1];
    var data3 = ooo2[0];
    var ws3_name = "Descriptions";
    ws3 = sheet_from_array_of_arrays(data3);
    ws3['!merges'] = ranges3;
    wb.SheetNames.push(ws3_name);
    wb.Sheets[ws3_name] = ws3;
    // wb.SheetNames[0] = "P_ORCH";
  }

  if (mode == "Summary") {
    var dtName = "test"
    var dateName = entity + "-ERROR SUMMARY-" + dtName + ".xlsx";
  } else if (mode == "Raw") {
    var dtName = moment().format('MMMM Do YYYY h:mm:ss');
    var dateName = "ERROR DATA-" + dtName + ".xlsx";
  } else if (mode == "Raw2") {
    var dtName = moment().format('MMMM Do YYYY h:mm:ss');
    var dateName = entity + ".xlsx";
  } else if (mode == "Raw3") {
    var dtName = moment().format('MMMM Do YYYY h:mm:ss');
    var dateName = "DROPZONE_TEMPLATE_" + entity + ".xlsx";
  } else if (mode == "Output") {
    var dtName = moment().format('MMMM Do YYYY h:mm:ss');
    var dateName = "DROPZONE_OUTPUT_" + entity + "_" + dtName + ".xlsx";
  } else {
    var dtName = moment().format('MMMM Do YYYY h:mm:ss');
    var dateName = entity + "-INPUT-FILE-" + dtName + ".xlsx";
  }
  // console.log(wb.Workbook.Names);
  var wbout = XLSX.write(wb, {
    bookType: 'xlsx',
    bookSST: false,
    type: 'binary'
  });

  saveAs(new Blob([s2ab(wbout)], {
    type: "application/octet-stream"
  }), dateName)
}