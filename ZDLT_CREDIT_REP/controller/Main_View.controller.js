sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/format/DateFormat",
	"sap/m/MessageBox",
	'sap/m/library',
	'sap/ui/export/Spreadsheet',
	'sap/ui/export/library',
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV'
], function(Controller, DateFormat, MessageBox, mobileLibrary, Spreadsheet, exportLibrary, Export, ExportTypeCSV) {
	"use strict";
	var Region = "";
	var URLHelper = mobileLibrary.URLHelper;
	var EdmType = exportLibrary.EdmType;
	return Controller.extend("ZDLT_UI5_CREDIT_APPREP.controller.Main_View", {
		onInit: function() {
			var that = this;
			var oDateFormatinit = DateFormat.getDateInstance({
				source: {
					pattern: "timestamp"
				},
				pattern: "yyyy-MM-dd" //"dd/MM/yyyy"
			});
			var dateinit = new Date();
			var firstDay = new Date(dateinit.getFullYear(), dateinit.getMonth(), 1);
			var iinit = 0;
			var dateFrom = (new Date(firstDay)).getTime() - (iinit % 10 * 4 * 24 * 60 * 60 * 1000);
			dateFrom = oDateFormatinit.format(new Date(dateFrom));
			this.getView().byId("InpCrdfrmdat").setValue(dateFrom);
			var lastDay = new Date(dateinit.getFullYear(), dateinit.getMonth() + 1, 0);
			var dateTo = (new Date(lastDay)).getTime() - (iinit % 10 * 4 * 24 * 60 * 60 * 1000);
			dateTo = oDateFormatinit.format(new Date(dateTo));
			this.getView().byId("InpCrdtodat").setValue(dateTo);

			//	var vServiceUrl = "http://sapbwdev02.corp.usl.in:8020/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV";
			var vServiceUrl = "/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV";
			var oModel = new sap.ui.model.odata.v2.ODataModel(vServiceUrl, {
				defaultBindingMode: sap.ui.model.BindingMode.TwoWay
			});
			oModel.setSizeLimit(600);
			//	var oModel = new sap.ui.model.odata.v2.ODataModel();
			this.getView().setModel(oModel);

			oModel.read("/RegionListSet", {
				success: function(odata) {
					that.getView().byId("CombRegion").setSelectedKey(odata.results[0].Region);
					that.getView().byId("CombRegion").setBusy(false);
					oModel.read("/SalesOfficeSet", {

						filters: [
							new sap.ui.model.Filter("Region", sap.ui.model.FilterOperator.EQ, odata.results[0].Region)
						],
						success: function(oData, oResponse) {
							var aFiltersComboBoxData = oResponse.data.results;
							var oJModel3 = new sap.ui.model.json.JSONModel();
							oJModel3.setData(aFiltersComboBoxData);
							that.getView().byId("CombSlsOff").setModel(oJModel3, "namedmodel");
							that.getView().byId("CombSlsOff").setSelectedKey("000");
							that.getView().byId("CombSlsOff").setBusy(false);
						},
						error: function(oError) {
							var _errMsg1 = JSON.parse(oError.response.body).error.message.value;
							sap.m.MessageBox.show(_errMsg1, sap.m.MessageBox.Icon.ERROR, "Error");
						}
					});
				}
			});

		}, //end Init
		//	************************On Etner Region Function**************************************
		//	*************************************************************************************
		onEnterRegion: function(oEvent) {
			var that = this;
			Region = oEvent.getSource().getSelectedKey();
			var odataModel = this.getView().getModel();
			//Setting sales office values based on Region value
			var filtervalue = oEvent.getParameter("newValue");
			odataModel.read("/SalesOfficeSet", {

				filters: [
					new sap.ui.model.Filter("Region", sap.ui.model.FilterOperator.EQ, Region)
				],

				success: function(oData, oResponse) {
					var aFiltersComboBoxData = oResponse.data.results;
					var oJModel3 = new sap.ui.model.json.JSONModel();
					oJModel3.setData(aFiltersComboBoxData);
					that.getView().byId("CombSlsOff").setModel(oJModel3, "namedmodel");
					that.getView().byId("CombSlsOff").setSelectedKey("000");
				},
				error: function(oError) {

					var _errMsg1 = JSON.parse(oError.response.body).error.message.value;
					sap.m.MessageBox.show(_errMsg1, sap.m.MessageBox.Icon.ERROR, "Error");

				}
			});
		},

		//Added by Ramesh on 25-07-2021 for approval
		onEnterStatus: function(oEvent) {
			var that = this;
			var oTable = this.byId("table1");
			var v_Status = this.getView().byId("CombStatus").getSelectedKey();
			var appr = this.getView().byId("btLinkapprvl");
			if (v_Status == '') {
				appr.setVisible(true);
			} else {
				appr.setVisible(false);
			}
		},

		onLinkapprvl: function(RequestLink, Newtab) {
			var that = this;
			var oTable = this.byId("table1");
			//Condition to trigger when No record is selected for process by Ramesh on 27-07-2021
			var select = this.getView().byId("table1")._oSelection.aSelectedIndices.length;
			if (select == 0) {
				var _errMsg = "Please select atleast one row to Approve.";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			var iIndex = oTable.getSelectedIndex();
			// Indices for Selected Row
			var aIndices = this.byId("table1").getSelectedIndices();
			//Get selected Row Records
			var vSrdata = oTable.getContextByIndex(iIndex).getObject();
			var URLHelper = mobileLibrary.URLHelper;
			URLHelper.redirect(vSrdata.RequestLink, true);
		},

		onExportToExcel: sap.m.Table.prototype.exportData || function() {

			var oModel = this.getView().byId("table1").getModel();
			var oExport = new Export({
				exportType: new ExportTypeCSV({
					fileExtension: "xls",
					separatorChar: "\t",
					charset: "utf-8"
				}),
				models: oModel,
				rows: {
					path: "/data"
				},
				columns: [{
					name: "Date",
					template: {
						content: "{InvDateStr}"
					}
				}, {
					name: "Docket Number",
					template: {
						content: "{DocketNum}"
					}
				}, {
					name: "Status",
					template: {
						content: "{RequestType}"
					}
				}, {
					name: "SalesOrder",
					template: {
						content: "{SalesOrder}"
					}
				}, {
					name: "InvDocno",
					template: {
						content: "{InvDocno}"
					}
				}]
			});
			oExport.saveFile("Credit Report").catch(function() {}).then(function() {
				oExport.destroy();
			});
		},

		onSubmit: function() {
				debugger;
				var that = this;
				var datefrom = this.getView().byId("InpCrdfrmdat").getValue();

				var date1 = datefrom;
				if (date1 !== "") {
					date1 = date1 + "T00:00:00";
				} else {
					this.getView().byId("InpCrdfrmdat").focus();

					var _errMsg = "From date can not be blank";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}
				var dateto = this.getView().byId("InpCrdtodat").getValue();

				var date2 = dateto;
				if (date2 !== "") {
					date2 = date2 + "T00:00:00";
				} else {

					this.getView().byId("InpCrdtodat").focus();

					var _errMsg = "To date can not be blank";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}
				if (dateto < datefrom) {
					var _errMsg = "To Date should not be less than From Date";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}
				var v_slsoff = that.getView().byId("CombSlsOff").getSelectedKey();
				var v_status = that.getView().byId("CombStatus").getSelectedKey();
				//Create all the records added to table via Json model
				var oTable = this.getView().byId("table1");

				// Get the table Model
				var oModel1 = oTable.getModel();

				//start of new
				var odataModel = this.getView().getModel();
				odataModel.read("/CreditCheckReptSet", {
					filters: [
						new sap.ui.model.Filter("Region", sap.ui.model.FilterOperator.EQ, Region),
						new sap.ui.model.Filter("SalesOffice", sap.ui.model.FilterOperator.EQ, v_slsoff),
						new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, v_status),
						new sap.ui.model.Filter("InvDate", sap.ui.model.FilterOperator.BT, date1, date2)

					],
					success: function(oData, oResponse) {

						var tabledata = new sap.ui.model.json.JSONModel({
							"Result": oData.results
						});
						var oDateFormat = DateFormat.getDateInstance({
							source: {
								pattern: "timestamp"
							},
							pattern: "dd/MM/yyyy"
						});
						var it = 0;
						//Converts the dates and set back to oData
						for (var i = 0; i < oData.results.length; i++) {
							var odata1 = oData.results[i];
							odata1.InvDate = (new Date(odata1.InvDate)).getTime() - (it % 10 * 4 * 24 * 60 * 60 * 1000);
							odata1.InvDateStr = oDateFormat.format(new Date(odata1.InvDate));
							//  oData.results[i].InvDate = odata1.InvDateStr ;
							odata1.ApprovedOn = (new Date(odata1.ApprovedOn)).getTime() - (it % 10 * 4 * 24 * 60 * 60 * 1000);
							odata1.ApprovedOnStr = oDateFormat.format(new Date(odata1.ApprovedOn));
							//  oData.results[i].ApprovedOn = odata1.ApprovedOnStr ;

						}
						var tab = that.getView().byId("table1");
						var oJModel1 = tab.getModel();
						var data1 = oData.results;
						//	data1= oData.results;
						//	oJModel1.setData({
						//	data: data1
						//	});
						tab.setModel(tabledata);

						tabledata.setData({
							data: data1
						});
						if (v_status !== "") {
							// tab.getColumns()[15].setVisible(false);	
						}
					},
					error: function(oError) {
						//	that.hideBusyIndicator();
						var _errMsg1 = JSON.parse(oError.response.body).error.message.value;
						sap.m.MessageBox.show(_errMsg1, sap.m.MessageBox.Icon.ERROR, "Error");
						//	that.hideBusyIndicator();
					}
				});

			} //end submit	

	});
});