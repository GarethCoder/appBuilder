define(['ojs/ojcore', 'knockout', 'ais', 'init', 'modaal', 'xlsx', 'e2', 'filesaver', 'ojs/ojrouter', 'ojs/ojlistview', 'promise', 'ojs/ojselectcombobox', 'ojs/ojtable', 'ojs/ojtrain', 'ojs/ojpopup', 'ojs/ojdialog', 'ojs/ojprogressbar', 'ojs/ojinputnumber', 'ojs/ojinputtext'],
	function (oj, ko, _, init, game) {

		function zoneViewModel() {
			var self = this;
			init.init();
			self.dropProgress = ko.observable(0);
			globals.totalRows = ko.observable(0);
			self.errorRows = ko.observable(0),
				self.processedRows = ko.observable(0),
				self.preDropFlag = ko.observableArray([]);
			self.isPreviousDrop = ko.observable(false);
			self.isTimerRunning = ko.observable(false);
			self.timePerRow = ko.observableArray([]);
			self.timePerRowEst = ko.observableArray([0]);
			self.timeElapsed = ko.observable(0);
			self.timeRowBegins = ko.observable(0);
			self.timeRowEnds = ko.observable(0);
			self.timeDropBegins = ko.observable(0);
			self.lastPercent = ko.observable(0);
			self.formNamesArray = ko.observableArray([]);
			self.currentFormIndex = ko.observable(0);
			self.errorLog = ko.observableArray([]);
			self.processLog = ko.observableArray([]);
			self.warningLog = ko.observableArray([]);
			self.showPreDropModal = ko.observable(false);
			self.fileText = ko.observable("No file chosen");

			self.resetDropDefaults = function () {
				globals.allFormNames = [];
				globals.debug.current = [];
				globals.hasOutput(false);
				self.formNamesArray([]);
				self.dropProgress(0);
				self.errorRows(0);
				self.processedRows(0);
				globals.totalRows(0);
				self.preDropFlag([]);
				self.isTimerRunning(false);
				self.timePerRow([]);
				self.timePerRowEst([0]);
				self.timeElapsed(0);
				self.timeRowBegins(0);
				self.timeRowEnds(0);
				self.timeDropBegins({});
				self.lastPercent(0);
				self.currentFormIndex(0);
				self.errorLog([]);
				self.processLog([]);
				self.warningLog([]);
				self.canDrop(false);
				$('#preDropWarnings > div').empty();
				$('#rawHolder').empty();
				$('#outputHolder').empty();
				$('#fileName').val('No file chosen');
				globals.showExtractButton(true);
				globals.showErrorButton(true);

				$('#filePicker').unbind('click').bind('click', function (e) {
					$(this).val(null);
				});
			};

			function seconds(num) {
				var singular = num === 1 ? 'second' : 'seconds';
				return singular;
			}

			self.resetDrop = function () {
				$('#hours, #minutes, #seconds, #fileName').html('')
				globals.dropState(0);
				$('#fileName').html('');
				self.fileText('No file chosen');
			};
			self.hasPreDropMsgs = ko.computed(function () {
				var msgs = self.preDropFlag().length > 0 ? true : false;
				return msgs;
			});
			self.successRows = ko.computed(function () {
				return globals.totalRows() - self.errorRows();
			});
			self.avgTimePerRowSaved = ko.computed(function () {
				var timePerRowTot = self.timePerRowEst().reduce(function (a, b) {
					return a + b;
				});
				return (timePerRowTot / self.timePerRowEst().length) || 180000;
			});
			self.initialDurationEst = ko.computed(function () {
				var duration = moment.duration(globals.totalRows() * 1000);
				return duration.humanize();
			});
			self.timeSavedEst = ko.computed(function () {
				var duration = moment.duration(globals.totalRows() * self.avgTimePerRowSaved());
				return duration.humanize();
			});
			self.timePerRowMedian = ko.computed(function () {
				var length = self.timePerRow().length;
				if (length < 3) {
					return 1000;
				} else if (length === 3) {
					return self.timePerRow.sort()()[1];
				} else if (length % 2 > 0) { // odd
					var medianRank = (length + 1) / 2 - 1;
					return self.timePerRow.sort(function (a, b) {
						return a - b;
					})()[medianRank];
				} else { // even
					var medianRankPart1 = length / 2 - 1;
					var medianRankPart2 = length / 2;
					return (self.timePerRow.sort(function (a, b) {
						return a - b;
					})()[medianRankPart1] + self.timePerRow.sort(function (a, b) {
						return a - b;
					})()[medianRankPart2]) / 2;
				}
			});
			self.timePerRowAverage = ko.computed(function () {
				var length = self.timePerRow().length;
				if (length < 3) {
					return 1000;
				} else if (length === 3) {
					return self.timePerRow.sort()()[1];
				} else {
					var sum = self.timePerRow().reduce(function (a, b) {
						return a + b;
					});
					return sum / self.timePerRow().length;
				}
			});
			self.progressPercent = ko.computed(function () {
				var currentPercent = timeElapsed() / (((globals.totalRows() - self.processedRows()) * self.timePerRowAverage()) + timeElapsed()) * 100,
					newPercent = 0;
				if (currentPercent < self.lastPercent()) { // prevent backpedalling
					newPercent = self.lastPercent();
				} else {
					newPercent = currentPercent;
				}
				self.lastPercent(newPercent);
				return newPercent;
			});
			self.timeElapsedDisplay = ko.computed(function () {
				var second = moment.duration(timeElapsed()).seconds();
				if (moment.duration(timeElapsed()).minutes() === 0) {
					return moment.duration(timeElapsed()).seconds() + ' ' + seconds(second);
				} else {
					return moment.duration(timeElapsed()).minutes() + ' minutes and ' + second + ' ' + seconds(second);
				}
			});
			self.timeTakenDisplay = ko.computed(function () {
				var second = moment.duration(timeElapsed()).seconds();
				if (moment.duration(timeElapsed()).minutes() === 0) {
					return second + ' ' + seconds(second);
				} else {
					return moment.duration(timeElapsed()).minutes() + ' minutes and ' + second + ' ' + seconds(second);
				}
			});



			self.timePerRowAvg = ko.computed(function () {
				return self.timeElapsed() / self.timePerRow().length;
			});
			self.timeRemaining = ko.computed(function () {
				// timePerRowMedian * rows remaining
				var rowsRemaining = globals.totalRows() - self.processedRows();
				var remainingMilliSecs = self.timePerRowMedian() * rowsRemaining;
				var duration = moment.duration(remainingMilliSecs);
				var second = duration.seconds();
				if (duration.minutes() === 0) {
					return second + ' ' + seconds(second);
				} else {
					return duration.minutes() + ' minutes and ' + second + ' ' + seconds(second);
				}
			});
			self.log = function (el, data, index) {
				console.log(el, data, index);
			};

			// self.errorCheck = function () {
			// 	if (self.errorRows() > 0) {
			// 		$("#downloadErrorBtn").show();
			// 	} else {
			// 		$("#downloadErrorBtn").hide();
			// 	}
			// }

			self.downloadErrorData = function () {
				export_table_to_excel_multi("Raw", "", self.formNamesArray());
			};
			self.downloadSpecialData = function () {
				export_table_to_excel_multi("Output", "", globals.outputList());
				globals.outputList([]);
			};
			self.timer = function () {
				setTimeout(self.timer, 100);
			};
			self.handleActivated = function (info) {
				// Implement if needed
				// doc is ready - wire up drag and drop events
				// $(document).on("updateProgEvent", {
				// 	foo: "bar"
				// }, function (event, arg1, arg2) {
				// 	self.progressValue(arg1)
				// });
			};

			/* Begin Drag n Drop UI */
			self.hovered = ko.observable(false);
			self.hoverOn = function () {
				self.hovered(true);
			}
			self.hoverOff = function () {
				self.hovered(false);
			}
			/* End Drag n Drop UI */

			/* Begin File Chooser */
			self.checkEmptyFile = function (koData, event) {
				var pickerEl = document.getElementById("filePicker");
				if (globals.connectedToE1() !== true) {
					alertInit("You are not connected to E1. Please view the status of your connection in the status bar below.", false, "danger");
					setTimeout(alertClose, 3000);
				} else if (pickerEl.files.length) {
					self.processExcel(pickerEl.files);
				} else {
					self.fileText("Please choose a file...");
				}
			};

			self.canDrop = ko.observable(false);
			self.handleFileSelect = function (koData, event) { // update file name to screen
				if (event) {
					var fileNameArr = event.originalEvent.currentTarget.value.split("\\");
					var index = fileNameArr.length - 1;
					var fileName = fileNameArr[index];
					self.fileText(fileName || "No file chosen");
					self.canDrop(true);
				} else {
					self.canDrop(false);
				}
			};
			/* End File Chooser */

			/* Begin Template Downloads */
			ko.components.register('downloads', {
				require: 'viewModels/downloads'
			});
			/* End Template Downloads */

			/* Kick Off Drop */
			/* Receives excel file, passes it to ais to begin the drop */
			self.processExcel = function (koData, event) { // fired once per multidrop to convert the excel to json
				//$('.preDrop').modaal();
				// remove UI
				var internalDataHolder = []; // this will store all the Excel worksheets in an array
				self.resetDropDefaults();
				self.hovered(false);
				if (!koData === false) { // file chooser
					var files = koData;
				} else { // drop                   
					var files = event.originalEvent.dataTransfer.files;
				}
				var reader = new FileReader;
				var name = files[0].name;
				reader.onload = function (e) {


					var data = reader.content;
					if (data == undefined) {
						data = e.target.result;
					}

					/*if(!e){
						if (!e) {
							var data = reader.content;
						}
						else {
							var data = e.target.result;
						}
					}*/


					try {
						var workbook = XLSX.read(data, {
							type: "binary"
						});
					} catch (e) {
						self.fileText("Invalid File (expects .xlsx)");
					};
					globals.dropHeaders = [];
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
							globals.exactExtractHeader = globals.exactExtractHeader.concat(XLSX.utils.sheet_to_json(worksheet, {
								range: 1,
								defaultValue: '',
								header: 1
							})[0]);

							// cleanup headers
							$.each(globals.exactExtractHeader, function (index, headerObj) {
								headerObj = headerObj.replace('*', '');
								headerObj = headerObj.replace('†', '');
								globals.exactExtractHeader[index] = headerObj;
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
											globals.dropHeaders.push(newKey);
									}

									if (key.search(/\†/) !== -1) { // column title contains cross
										delete ob[key];
										var newKey = key.replace(/\†/g, '');
										ob[newKey] = str;
										if (inx == 0)
											globals.dropHeaders.push(newKey);
									}

									if (!(key.search(/\*/) !== -1 || key.search(/\†/) !== -1) && inx == 0 && key !== 'ROW')

										globals.dropHeaders.push(key);
									// console.log(globals.dropHeaders);
								});
							});
							internalDataHolder.push(jsonData);
							count++;
						}
					});
					if (jsonData.length > 0) {
						globals.dropHeaders = globals.dropHeaders.filter(function (item, i, ar) {
							return ar.indexOf(item) === i;
						});
						_.prepareDrop(internalDataHolder);
						internalDataHolder = [];
					} else {
						self.fileText("Your Excel template is in the wrong format. Please redownload it and try again.");
					}
				};
				reader.readAsBinaryString(files[0]);
			}

			self.handlePreDropModal = function (data, event) {
				self.startTime = moment();
				self.isTimerRunning(true);
				handleTimer();
				globals.dropState(1);
				_.initSingleDrop();
				self.showPreDropModal(false);
				if (self.isTimerRunning()) {
					self.processTimer();
				}
			};
			self.closePreDropModal = function () {
				self.showPreDropModal(false);
				self.handleClosePreDropModal();
			};
			self.handleClosePreDropModal = function () {
				document.getElementById("filePicker").value = null;
			};

			self.handleTimer = function () {
				if (isTimerRunning() === true) {
					setTimeout(function () {
						var msElapsed = moment().diff(self.startTime);
						self.timeElapsed(moment.duration(msElapsed));
						self.handleTimer();
					}, 1000);
				}
			};
			self.stateUpcoming = function () {
				globals.dropState(0);
			};
			self.stateCurrent = function () {
				globals.dropState(1);
			};

			self.stateComplete = function () {
				globals.dropState(2);
			};
			self.addBgFirst = function () {
				var parent = $('.log-holder')[0];
				var el = $(parent).find('li:first');
				if (globals.modifierOne === 0) {
					el.addClass('bg-ltGrey');
					globals.modifierOne = 1;
				} else {
					globals.modifierOne = 0;
				}
			};
			self.addBgLast = function () {
				var parent = $('.log-holder')[1];
				var el = $(parent).find('li:first');
				if (globals.modifierTwo === 0) {
					el.addClass('bg-ltGrey');
					globals.modifierTwo = 1;
				} else {
					globals.modifierTwo = 0;
				}
			};
			if (globals.passwordWasReset() === true) {
				alertInit("Your password has been successfully reset! Now go save some time with dropZone (and don't waste the time you save!", null, "success");
				setTimeout(alertClose, 5000);
			}

			// ABORT BUTTON

			$(document).ready(function () {
				$("button#abort").click(function (e) {
					e.preventDefault();
					var r = confirm("Are you sure you want to cancel this drop and start again?");
					if (r == true) {
						console.log("ABORT DROP");
						location.reload();
					}
				});
			});

			self.handleAttached = function (info) {
				// Implement if needed

			};


			self.handleBindingsApplied = function (info) {
				$('.loader').fadeOut(100);
			};

			self.handleDetached = function (info) {
				// Implement if needed
			};


			self.processTimer = function () {
				$.extend({
					APP: {
						formatTimer: function (a) {
							if (a < 10) {
								a = '0' + a;
							}
							return a;
						},

						startTimer: function (dir) {

							var a;

							// save type
							$.APP.dir = dir;

							// get current date
							$.APP.d1 = new Date();

							switch ($.APP.state) {

								case 'pause':

									// resume timer
									// get current timestamp (for calculations) and
									// substract time difference between pause and now
									$.APP.t1 = $.APP.d1.getTime() - $.APP.td;

									break;

								default:

									// get current timestamp (for calculations)
									$.APP.t1 = $.APP.d1.getTime();

									// if countdown add ms based on seconds in textfield
									if ($.APP.dir === 'cd') {
										$.APP.t1 += parseInt($('#cd_seconds').val()) * 1000;
									}

									break;

							}

							// reset state
							$.APP.state = 'alive';

							// start loop
							$.APP.loopTimer();

						},

						loopTimer: function () {

							var td;
							var d2, t2;

							var ms = 0;
							var s = 0;
							var m = 0;
							var h = 0;

							if ($.APP.state === 'alive') {

								// get current date and convert it into 
								// timestamp for calculations
								d2 = new Date();
								t2 = d2.getTime();

								// calculate time difference between
								// initial and current timestamp
								if ($.APP.dir === 'sw') {
									td = t2 - $.APP.t1;
									// console.log(td);
									// reversed if countdown
								} else {
									td = $.APP.t1 - t2;
									if (td <= 0) {
										// if time difference is 0 end countdown
										$.APP.endTimer(function () {
											$.APP.resetTimer();
										});
									}
								}

								// calculate milliseconds
								ms = td % 1000;
								if (ms < 1) {
									ms = 0;
								} else {
									// calculate seconds
									s = (td - ms) / 1000;
									if (s < 1) {
										s = 0;
									} else {
										// calculate minutes   
										var m = (s - (s % 60)) / 60;
										if (m < 1) {
											m = 0;
										} else {
											// calculate hours
											var h = (m - (m % 60)) / 60;
											if (h < 1) {
												h = 0;
											}
										}
									}
								}

								// substract elapsed minutes & hours
								ms = Math.round(ms / 100);
								s = s - (m * 60);
								m = m - (h * 60);

								// update display
								$('#' + $.APP.dir + '_ms').html($.APP.formatTimer(ms));
								$('#' + $.APP.dir + '_s').html($.APP.formatTimer(s));
								$('#' + $.APP.dir + '_m').html($.APP.formatTimer(m));
								$('#' + $.APP.dir + '_h').html($.APP.formatTimer(h));

								// loop
								$.APP.t = setTimeout($.APP.loopTimer, 1);

							} else {

								// kill loop
								clearTimeout($.APP.t);
								return true;

							}

						}

					}

				});

				if (globals.dropState() === 1) {
					$.APP.startTimer('sw');
				} else if (globals.dropState() === 2) {
					var hours = $("#sw_h")[0].innerHTML;
					var minutes = $("#sw_m")[0].innerHTML;
					var seconds = $("#sw_s")[0].innerHTML;

					$("#hours").append(hours);
					$("#minutes").append(minutes);
					$("#seconds").append(seconds);
				}
			};
		}


		return zoneViewModel();
	}
);