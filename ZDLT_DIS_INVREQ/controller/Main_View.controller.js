sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/format/DateFormat",
	"sap/m/MessageBox",
	"sap/ui/layout/Grid",
	"sap/ui/commons/Panel",
	"sap/ui/core/HTML",
	"sap/m/PDFViewer",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/ui/core/Fragment"

], function(Controller, DateFormat, MessageBox, Grid, Panel, HTML, PDFViewer, Dialog, DialogType, List, StandardListItem, Fragment) {
	"use strict";
	var that = this;
	var Plant = "";
	var oJModel = "";
	var oModel = "";
	var itemData = "";
	var _that1 = "";
	var oJModel = "";
	var oModel1 = "";
	var oModel2 = "";
	var oModel = "";
	var v_Plant = "";
	var v_date1 = "";
	var v_date2 = "";
	var v_Status = "";
	var v_dlist;
	return Controller.extend("ZDLT_UI5_DIS_INV_REQ.controller.Main_View", {
		onInit: function() {
			that = this;
			//---------------PRINT button enable only for Invoice option--------------//
			var v_Sts = this.getView().byId("Combstatus").getSelectedKey();
			var v_bInvdis = this.getView().byId("btInvldis");
			var v_bPrint = this.getView().byId("btPrint");
			if (v_Sts !== '2') {
				//if (v_bPrint.getVisible()) {
				v_bPrint.setVisible(false);
				v_bInvdis.setVisible(false);
				//	}
			}
			//----------------End of PRINT enable---------------------------------------//
			//--------------------------Defualt Button for TMS Process----------------//
			var v_inv = this.getView().byId("RB3-1").getSelected();
			var inv = this.getView().byId("btRqinv");

			if (v_inv == true) {
				v_inv = 'X';
			}

			if (v_inv == 'X') {
				if (inv.getVisible()) {
					inv.setVisible(false);
				}
			}
			//-------------------------End of Button for TMS Process-------------------//
			// create dialog via fragment factory
			//var oDialog1 = sap.ui.xmlfragment( "ZDLT_UI5_DIS_INV_REQ.InvoiceList");
			//Accessing the table from the fragment by it's Id	
			var oTable = that.byId("detailList");
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
			this.getView().byId("Inpreqfrmdat").setValue(dateFrom);
			var lastDay = new Date(dateinit.getFullYear(), dateinit.getMonth() + 1, 0);
			var dateTo = (new Date(lastDay)).getTime() - (iinit % 10 * 4 * 24 * 60 * 60 * 1000);
			dateTo = oDateFormatinit.format(new Date(dateTo));
			this.getView().byId("Inpreqtodat").setValue(dateTo);

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.getRoute("Main_View").attachPatternMatched(this._onObjectMatched1, this);

			//	var vServiceUrl = "http://sapbwdev02.corp.usl.in:8020/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV";
			var vServiceUrl = "/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV";
			var oModel = new sap.ui.model.odata.v2.ODataModel(vServiceUrl, {
				defaultBindingMode: sap.ui.model.BindingMode.TwoWay
			});
			//	var oModel = new sap.ui.model.odata.v2.ODataModel();
			this.getView().setModel(oModel);
			var url1 = "/GetPlantsSet";
			oModel.read(url1, {
				success: function(odata, oResponse) {
					//if (odata.results.length === 1) {
					that.getView().byId("Combplant").setSelectedKey(odata.results[0].Plant);
					//	}
				},
				error: function(oError) {
					//	var _errMsg = JSON.parse(oError.response.body).error.message.value;
					/*	var _errMsg = "No Authorized plants for the user";
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");*/
					var message = "No Authorized plants for the user";
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.show(message, {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Authorization Status",
						actions: [sap.m.MessageBox.Action.OK]
					});
				}
			});

		}, //end of on it
		//----------------------------Radio button changes----------------------------------------//
		handleSelect: function(oEvent) {
			debugger;
			var v_tms = this.getView().byId("RB3-2").getSelected();
			var tms = this.getView().byId("btRqtms");
			var v_inv = this.getView().byId("RB3-1").getSelected();
			var inv = this.getView().byId("btRqinv");
			v_Status = this.getView().byId("Combstatus").getSelectedKey();
			if (v_Status == '0' || v_Status == '9') {
				tms.setVisible(false);
				inv.setVisible(true);
			}
		},
		//---------------------------End of Radio button changes--------------------------------//
		//	************************ON Object Matched***************************************
		//	*****************************************************************************************
		_onObjectMatched1: function(oEvent) {
			that = this;
			var plantnav = this.getView().byId("Combplant").getSelectedKey();
			if (plantnav !== "") {
				that.onSubmit();
			}
		},
		//	************************Hide Busy Indicator Function**************************************
		//	*************************************************************************************
		hideBusyIndicator: function() {
			sap.ui.core.BusyIndicator.hide();
		},
		//	************************Show Busy Indicator Function**************************************
		//	*************************************************************************************
		showBusyIndicator: function() {
			sap.ui.core.BusyIndicator.show();
		},

		//	---------------------------------------------------------------------------------------//
		//						 Click on PRINT Button                                             //
		//	---------------------------------------------------------------------------------------//
		onItemPrint: function(oEvent) {
			var print = this;
			//window.print();
			var select = this.getView().byId("table1")._oSelection.aSelectedIndices.length;
			if (select == 0) {
				var _errMsg = "Please select atleast one row to Print Invoice.";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			} else if (select > 1) {
				var _errMsg = "Select only one row to Print";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			/************************Get selected Invoice number to Print*********************/
			var sIndex = this.getView().byId("table1")._oSelection.iLeadIndex;
			var vData = this.getView().byId("table1").getModel().getProperty("/data");
			var vInvoicenum = vData[sIndex].ReqInv;
			var vSrvUrl = "/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV";
			var oModel = new sap.ui.model.odata.v2.ODataModel(vSrvUrl, {
				defaultBindingMode: sap.ui.model.BindingMode.TwoWay
			});
		//	this.getView().setModel(oModel);
			// added on 22 June
			var opdfViewer = new PDFViewer();
			this.getView().addDependent(opdfViewer);
			var sServiceURL = this.getView().getModel().sServiceUrl;
			var sSource = sServiceURL + "/InvPdfSet('" + vInvoicenum + "')" + "/NavPdfToDoc" + "/$value";
			opdfViewer.setSource(sSource);
			opdfViewer.setTitle("Invoice Print");
			opdfViewer.open();
		},
		//------------------------End of PRINT Button---------------------------------------------//
		//------------------------------Invoice LIst Display----------------------------------------------//
		onInvlist: function(oEvent) {

			var that = this;
			var select = this.getView().byId("table1")._oSelection.aSelectedIndices.length;
			if (select == 0) {
				var _errMsg = "Please select atleast one row to see Invoice List.";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			var oTable = this.byId("table1");
			//Index  number for Selected Row
			var iIndex = oTable.getSelectedIndex();
			// Indices for Selected Row
			var aIndices = this.byId("table1").getSelectedIndices();
			//Get selected Row Records
			var vSrdata = oTable.getContextByIndex(iIndex).getObject();
			var vData = that.getView().byId("table1").getModel().getProperty("/data");
			var docIdVal = vData[iIndex].DocketNum;
			var vSrvUrl = "/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV";
			var oModel = new sap.ui.model.odata.v2.ODataModel(vSrvUrl, {
				defaultBindingMode: sap.ui.model.BindingMode.TwoWay
			});
			//	var sServiceURL = that.getView().getModel().sServiceUrl;
			//var sSource = "/HouListSet('" + docIdVal + "')";
			//sap.ui.getCore().setModel(oModel);
			// Get the table Model
			oModel.read("/HouListSet", {
				filters: [
					new sap.ui.model.Filter("DocketNum", sap.ui.model.FilterOperator.EQ, docIdVal)

				],
				success: function(oData, oResponse) {
					var trr = new sap.ui.model.json.JSONModel({
						"Result": oData.results
					});
					//var tab = that.getView().byId("detailList");
					var oform = sap.ui.getCore().byId("detailList");
					// oform.setModel(oModel);
					var oModel = oform.getModel();
					var data1 = oData.results;
					oform.setModel(trr);

					trr.setData({
						ldata: data1
					});
				}
			});
			//After creation of Order, Delivery and PGI - Start of change by 1st July 2021 by Ramesh
			// access List from the fragment by its ID
			var oView = that.getView();
			//	var oDialog = oForm.byId("iDialog");
			var oDialog = oView.byId("iDialog");
			//	var path = oEvent.getSource().getBindingContext("sample").getPath();
			if (!that.iDialog) {
				that.iDialog = sap.ui.core.Fragment.load({
					name: "ZDLT_UI5_DIS_INV_REQ.view.InvoiceList",
					//	name: "ZDLT_UI5_DIS_INV_REQ.view.detailList",
					//path: sSource,
					//containingView: "ZDLT_UI5_DIS_INV_REQ.controller.Main_View",
					controller: that
				}).then(function(oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					//var oForm = sap.ui.getCore().byId("detailList");
					oDialog.setModel(oModel);
					// Get Data and fill List	
					//oDialog.bindElement('/HouListSet', v_dlist);
					oDialog.open();
					return oDialog;
				});
			}

			//	}
			that.iDialog.then(function(iDialog) {
				iDialog.open();
			});

		},

		//-----------------------------End of Invoice List Display---------------------------------------//

		//	************************ON enterPlant Function***************************************
		//	*****************************************************************************************

		onEnterStatus: function(oEvent) {
			v_Status = this.getView().byId("Combstatus").getSelectedKey();
			var v_bPrint = this.getView().byId("btPrint");
			var v_bInvdis = this.getView().byId("btInvldis");
			var v_tms = this.getView().byId("RB3-2").getSelected();
			var tms = this.getView().byId("btRqtms");
			var v_inv = this.getView().byId("RB3-1").getSelected();
			var v_bDel = this.getView().byId("Btdelete");
			var v_bReqa = this.getView().byId("btReqapprvl");
			var inv = this.getView().byId("btRqinv");
			//---------------PRINT button enable only for Invoice option--------------//			
			if (v_Status == '2') {
				//if (v_bPrint.getVisible()) {
				v_bPrint.setVisible(true);
				v_bInvdis.setVisible(true);
				//}
			} 
			else if(v_Status === '0' || v_Status === '9'){
				this.getView().byId("rbg3").setVisible(true);
			}/*else if (v_Status == '12') {
				v_bInvdis.setVisible(true);
			}*/ else {
				//if (v_bPrint.getVisible()) {
				this.getView().byId("rbg3").setVisible(false);
				v_bPrint.setVisible(false);
				v_bInvdis.setVisible(false);
				//}			
			}
			//------------------------------------------------------------------------//			
			//Make Buttons Invisible when Status has selected as "Invoice"
			if (v_Status == '2') {
				inv.setVisible(false);
				tms.setVisible(false);
				v_bDel.setVisible(false);
				v_bReqa.setVisible(false);
				this.getView().byId("rbg3").setVisible(false);
			} else {
				if (v_tms == true) {
					v_tms = 'X';
				}
				if (v_tms == 'X') {
					tms.setVisible(false);
					inv.setVisible(true);
				}

				if (v_inv == true) {
					v_inv = 'X';
				}

				if (v_inv == 'X') {
					inv.setVisible(false);
					tms.setVisible(true);

				}
				v_bDel.setVisible(true);
				v_bReqa.setVisible(true);
			}
			//---------------------In-Process TMS------------------------//
			if (v_Status == '12') {
				inv.setVisible(false);
				tms.setVisible(false);
				v_bDel.setVisible(false);
				v_bReqa.setVisible(false);
				v_bInvdis.setVisible(true);
			}
			//----------------End of In-Process TMS----------------------//

			//---------------------Credit Check Rejected------------------------//
			if (v_Status == '10') {
				inv.setVisible(false);
				tms.setVisible(false);
				v_bDel.setVisible(false);
				v_bReqa.setVisible(false);
				v_bInvdis.setVisible(false);
			}
			//----------------End of Credit Check Rejected----------------------//

			//---------------------Cancelled Invoice------------------------//
			if (v_Status == '20') {
				inv.setVisible(false);
				tms.setVisible(false);
				v_bDel.setVisible(false);
				v_bReqa.setVisible(false);
				v_bInvdis.setVisible(false);
			}
			//----------------End of Cancelled Invoice----------------------//			
		},

		//	************************ON submit Go Function***************************************
		//	*****************************************************************************************

		onSubmit: function(oEvent) {

			var that = this;
			//Plant Validation
			var plant1 = this.getView().byId("Combplant").getSelectedKey();
			if (plant1 === "") {
				//	this.getView().byId("Combplant").focus();

				var _errMsg = "Plant can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			//Status Validation
			var status1 = this.getView().byId("Combstatus").getSelectedKey();
			if (status1 === "") {
				//this.getView().byId("Combstatus").focus();

				var _errMsg = "Status can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			var datefrom = this.getView().byId("Inpreqfrmdat").getValue();

			var date1 = datefrom;
			if (date1 !== "") {
				date1 = date1 + "T00:00:00";
			} else {
				this.getView().byId("Inpreqfrmdat").focus();

				var _errMsg = "From date can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			var dateto = this.getView().byId("Inpreqtodat").getValue();

			var date2 = dateto;
			if (date2 !== "") {
				date2 = date2 + "T00:00:00";
			} else {

				this.getView().byId("Inpreqtodat").focus();

				var _errMsg = "To date can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			if (dateto < datefrom) {
				var _errMsg = "To Date should not be less than From Date";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			var v_plant = that.getView().byId("Combplant").getSelectedKey();
			var v_status = that.getView().byId("Combstatus").getSelectedKey();

			//Added by Ramesh on 27-07-2021 for Distribution Channel
			var v_dc = that.getView().byId("Combdistr").getSelectedKey();
			//end by Ramesh on 27-07-2021

			//TMS Process
			var v_nontmsprocess = this.getView().byId("RB3-2").getSelected();
			var v_tmsprocess = this.getView().byId("RB3-1").getSelected();
			//TMS Process Selected
			if (v_tmsprocess == 'true') {
				v_tmsprocess = 'X';
			}
			//Non-TMS Process Selected
			if (v_nontmsprocess == 'true') {
				v_nontmsprocess = 'X';
			}

			if (v_nontmsprocess == true) {
				//Create all the records added to table via Json model
				var oTable = this.getView().byId("table1");

				// Get the table Model
				var oModel1 = oTable.getModel();

				//start of new
				var odataModel = this.getView().getModel();
				//if ( v_nontmsprocess = 'X'){
				odataModel.read("/InvReqGrpSet", {
					filters: [
						new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, v_plant),
						new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, v_status),
						new sap.ui.model.Filter("InvDate", sap.ui.model.FilterOperator.BT, date1, date2),
						new sap.ui.model.Filter("DistributChanId", sap.ui.model.FilterOperator.EQ, v_dc),
						//For NOn-TMS process
						new sap.ui.model.Filter("TMSProcess", sap.ui.model.FilterOperator.EQ, '')

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
							//   oData.results[i].InvDate = odata1.InvDateStr ;
							odata1.TPermitDate = (new Date(odata1.TPermitDate)).getTime() - (it % 10 * 4 * 24 * 60 * 60 * 1000);
							odata1.TPermitDateStr = oDateFormat.format(new Date(odata1.TPermitDate));
							//	oData.results[i].TPermitDate = odata1.TPermitDateStr ;
							//Update to request type
							if (odata1.Status == 2) {
								odata1.ReqInv = odata1.RequestType;
							}

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

					},
					error: function(oError) {
						//	that.hideBusyIndicator();
						var _errMsg1 = JSON.parse(oError.response.body).error.message.value;
						sap.m.MessageBox.show(_errMsg1, sap.m.MessageBox.Icon.ERROR, "Error");
						//	that.hideBusyIndicator();
					}
				});
			}
			//end of new 
			//TMS Process
			if (v_tmsprocess == true) {
				//Create all the records added to table via Json model
				var oTable = this.getView().byId("table1");

				// Get the table Model
				var oModel1 = oTable.getModel();

				//start of new
				var odataModel = this.getView().getModel();
				//if ( v_nontmsprocess = 'X'){
				odataModel.read("/InvReqGrpSet", {
					filters: [
						new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, v_plant),
						new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, v_status),
						new sap.ui.model.Filter("InvDate", sap.ui.model.FilterOperator.BT, date1, date2),
						new sap.ui.model.Filter("TMSProcess", sap.ui.model.FilterOperator.EQ, 'X'),
						new sap.ui.model.Filter("DistributChanId", sap.ui.model.FilterOperator.EQ, v_dc)

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
							//   oData.results[i].InvDate = odata1.InvDateStr ;
							odata1.TPermitDate = (new Date(odata1.TPermitDate)).getTime() - (it % 10 * 4 * 24 * 60 * 60 * 1000);
							odata1.TPermitDateStr = oDateFormat.format(new Date(odata1.TPermitDate));
							//	oData.results[i].TPermitDate = odata1.TPermitDateStr ;
							//Update to request type
							if (odata1.Status == 2) {
								odata1.ReqInv = odata1.RequestType;
							}
						}
						var tab = that.getView().byId("table1");
						var oJModel1 = tab.getModel();
						var data1 = oData.results;
						tab.setModel(tabledata);

						tabledata.setData({
							data: data1
						});

					},
					error: function(oError) {
						//	that.hideBusyIndicator();
						var _errMsg1 = JSON.parse(oError.response.body).error.message.value;
						sap.m.MessageBox.show(_errMsg1, sap.m.MessageBox.Icon.ERROR, "Error");
						//	that.hideBusyIndicator();
					}
				});
			}

			// Newly added this by Ramesh D
		},

		//	************************On Edit Docket Function***************************************
		//	*****************************************************************************************
		onItemEdit: function(oEvent) {
			var select = this.getView().byId("table1")._oSelection.aSelectedIndices.length;
			if (select == 0) {
				var _errMsg = "Please select atleast one row to Edit/Display record.";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			} else if (select > 1) {
				var _errMsg = "Please select only one row to Edit/Display record.";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			} else {
				var selectindex = this.getView().byId("table1")._oSelection.iLeadIndex;
				var itemedit = this.getView().byId("table1").getModel().getProperty("/data");
				var docIdVal = itemedit[selectindex].DocketNum;
				/*  for (var iedit = selectindex; iedit < itemedit.length + 1; iedit++) {
				  if(selectindex == iedit){
				  	var docIdVal= itemedit[selectindex].DocketNum	;
				  }
				  }*/
			}

			//	var docIdVal="1006:JAN20:00003"	;
			this.getOwnerComponent().getRouter().navTo("Edit_View", {
				docId: docIdVal
			});
		},

		//	************************On Delete Docket Function***************************************
		//	*****************************************************************************************
		onItemDelete: function(oEvent) {
			that = this;
			var select = this.getView().byId("table1")._oSelection.aSelectedIndices.length;
			if (select == 0) {
				var _errMsg = "Please select atleast one row to delete a record.";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			} else if (select > 1) {
				var _errMsg = "Please select only one row to delete a record.";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			} else {
				var selectindex = this.getView().byId("table1")._oSelection.iLeadIndex;
				var itemedit = this.getView().byId("table1").getModel().getProperty("/data");
				var docIdVal = itemedit[selectindex].DocketNum;
				if (itemedit[selectindex].SoDocno !== "") {
					var _errMsg = "Sale Order-" + itemedit[selectindex].SoDocno + " is exists for the Docket Id-" + docIdVal + " Cannot delete";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.INFORMATION, "Information");
					return;
				}

				sap.m.MessageBox.show("Are you sure to delete Docket-" + docIdVal, {
					icon: sap.m.MessageBox.Icon.SUCCESS,
					title: "Deletion of Document",
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					onClose: function(oAction) {
							if (oAction === "YES") {

								/*  code to delete document id */
								var oModel = that.getView().getModel();
								var delurl = "/DcktInvEditSet(DocketNum='" + docIdVal + "')";
								oModel.setUseBatch(false);
								/*	oModel.setHeaders({
										"X-Requested-With": "X"
									}); */
								oModel.remove(delurl, {
									success: function(oData, oResponse) {
										var message = "Docket-" + docIdVal + " Removed successfully";
										jQuery.sap.require("sap.m.MessageBox");
										sap.m.MessageBox.show(message, {
											icon: sap.m.MessageBox.Icon.SUCCESS,
											title: "Status",
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function(oAction) {
												that.onSubmit();
											}
										});
									},
									error: function(err, oResponse) {
										var _errMsg = "Error-" + err.response.statusText;
										sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
										return;
									}
								}); //end of remove docket
							} //End of Action-Yes
						} //End of Action
				}); //end of delete doc id message box
			}
		},

		//	************************On ItemRefresh Function***************************************
		//	*****************************************************************************************
		onItemRefresh: function(oEvent) {
			var that = this;
			//Plant Validation
			var plant1 = this.getView().byId("Combplant").getSelectedKey();
			if (plant1 === "") {
				//	this.getView().byId("Combplant").focus();

				var _errMsg = "Plant can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			//Status Validation
			var status1 = this.getView().byId("Combstatus").getSelectedKey();
			if (status1 === "") {
				//this.getView().byId("Combstatus").focus();

				var _errMsg = "Status can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			var datefrom = this.getView().byId("Inpreqfrmdat").getValue();
			var date1 = datefrom;
			if (date1 !== "") {
				date1 = date1 + "T00:00:00";
			} else {
				this.getView().byId("Inpreqfrmdat").focus();

				var _errMsg = "From date can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			var dateto = this.getView().byId("Inpreqtodat").getValue();
			var date2 = dateto;
			if (date2 !== "") {
				date2 = date2 + "T00:00:00";
			} else {

				this.getView().byId("Inpreqtodat").focus();

				var _errMsg = "To date can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			if (dateto < datefrom) {
				var _errMsg = "To Date should not be less than From Date";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			var v_plant = that.getView().byId("Combplant").getSelectedKey();
			var v_status = that.getView().byId("Combstatus").getSelectedKey();
			//Create all the records added to table via Json model
			var oTable = this.getView().byId("table1");

			// Get the table Model
			var oModel1 = oTable.getModel();

			var odataModel = this.getView().getModel();
			/*			odataModel.read("/InvReqGrpSet", {
							filters: [
								new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, v_plant),
								new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, v_status),
								new sap.ui.model.Filter("InvDate", sap.ui.model.FilterOperator.BT, date1, date2)

								/* new Filter("EndDate", FilterOperator.EQ, "9999.12.31"),
								 new Filter("DayOfWeek", FilterOperator.EQ, "0"),
								 new Filter("SequenceNumber", FilterOperator.EQ, "00"), */
			/*	],
				success: function(oData, oResponse) {
					//	alert(" Refresh  called. ");
					//  oTable.setModel(oModel1);
					// oTable.setEntitySet("/InvReqGrpSet");
					if (oResponse.statusCode == 200 && oData.MsgType == "E") {
						var _errMsg = oData.Msg;
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
						return;
					}
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
					//Converts the date and set back to the oData
					for (var i = 0; i < oData.results.length; i++) {
						var odata1 = oData.results[i];
						odata1.InvDate = (new Date(odata1.InvDate)).getTime() - (it % 10 * 4 * 24 * 60 * 60 * 1000);
						odata1.InvDateStr = oDateFormat.format(new Date(odata1.InvDate));

						odata1.TPermitDate = (new Date(odata1.TPermitDate)).getTime() - (it % 10 * 4 * 24 * 60 * 60 * 1000);
						odata1.TPermitDateStr = oDateFormat.format(new Date(odata1.TPermitDate));
					}
					var tab = that.getView().byId("table1");
					var oJModel1 = tab.getModel();
					var data1 = oData.results;
					tab.setModel(tabledata);

					tabledata.setData({
						data: data1
					});

				},
				error: function(oError) {
					//	that.hideBusyIndicator();
					var _errMsg1 = JSON.parse(oError.response.body).error.message.value;
					sap.m.MessageBox.show(_errMsg1, sap.m.MessageBox.Icon.ERROR, "Error");
					//	that.hideBusyIndicator();
				}
			});*/

		},

		//-------------------------on Proforma Invoice Request-----------------------------------//

		onProrequest: function(oEvent) {
			that = this;
			//Create all the records added to table via Json model
			var oTable1 = this.getView().byId("table1");
			// Get the table Model
			var oModel3 = oTable1.getModel();
			// Get Items of the Table
			var aItems = oModel3.getData().data; //oTable.getItems();
			var i = 0,
				path,
				idx;
			path = oEvent.getSource().getBindingContext().sPath;
			idx = parseInt(path.substring(path.lastIndexOf('/') + 1));
			var selRow = oEvent.getSource().getBindingContext().getObject();
			// Define an empty Array
			var sel_truckNumber = selRow.TruckNumber;
			var oDateFormat = DateFormat.getDateInstance({
				source: {
					pattern: "timestamp"
				},
				pattern: "yyyy-MM-dd"
			});
			var itemData = [];
			//Preparing item data
			for (var iRowIndex = idx; iRowIndex < aItems.length; iRowIndex++) {
				var l_Status = oModel3.getProperty("Status", aItems[iRowIndex]);
				var l_ReqInv = oModel3.getProperty("ReqInv", aItems[iRowIndex]);
				var l_Plant = oModel3.getProperty("Plant", aItems[iRowIndex]);
				var l_TruckNumber = oModel3.getProperty("TruckNumber", aItems[iRowIndex]);
				var l_DocketNum = oModel3.getProperty("DocketNum", aItems[iRowIndex]);
				if ((sel_truckNumber !== "" && sel_truckNumber == l_TruckNumber) ||
					(sel_truckNumber == "" && selRow.DocketNum == l_DocketNum)) {
					//	if (sel_truckNumber == l_TruckNumber) {
					var l_InvDate = oModel3.getProperty("InvDate", aItems[iRowIndex]);
					l_InvDate = oDateFormat.format(new Date(l_InvDate));

					if (l_InvDate !== "") {
						l_InvDate = l_InvDate + "T00:00:00";
					}
					//	var l_DocketNum = oModel3.getProperty("DocketNum", aItems[iRowIndex]);
					var l_SoDocno = oModel3.getProperty("SoDocno", aItems[iRowIndex]);
					var l_VendorCode = oModel3.getProperty("VendorCode", aItems[iRowIndex]);

					var l_TruckType = oModel3.getProperty("TruckType", aItems[iRowIndex]);
					var l_MilkRun = oModel3.getProperty("MilkRun", aItems[iRowIndex]);
					var l_Customer = oModel3.getProperty("Customer", aItems[iRowIndex]);
					var l_CustName = oModel3.getProperty("CustName", aItems[iRowIndex]);

					var l_TPermitNum = oModel3.getProperty("TPermitNum", aItems[iRowIndex]);
					var l_TPermitDate = oModel3.getProperty("TPermitDate", aItems[iRowIndex]);
					l_TPermitDate = oDateFormat.format(new Date(l_TPermitDate));
					if (l_TPermitDate !== "") {
						l_TPermitDate = l_TPermitDate + "T00:00:00";
					}
					var l_RequestType = oModel3.getProperty("RequestType", aItems[iRowIndex]);

					itemData.push({
						DocketNum: l_DocketNum,
						SoDocno: l_SoDocno,
						VendorCode: l_VendorCode,
						TruckType: l_TruckType,
						MilkRun: l_MilkRun,
						Customer: l_Customer,
						CustName: l_CustName,
						TruckNumber: l_TruckNumber,
						TPermitNum: l_TPermitNum,
						TPermitDate: l_TPermitDate,
						RequestType: l_RequestType,
						Status: l_Status,
						InvDate: l_InvDate,
						ReqInv: l_ReqInv,
						Plant: l_Plant

					}); // end item datapush
				} //end of truck number
			} //end forloop
			//adding on 31 st May by Ramesh D 
			//Getting Invoice Process 
			var v_ProformaInv = '';
			var v_ProformaInv = selRow.Profermaind;
			// End of change by Ramesh D
			// Create one emtpy Object
			var oEntry1 = {};
			if (selRow.Status !== "") {
				oEntry1.Status = selRow.Status;
			}
			var invdate = selRow.InvDate;
			invdate = oDateFormat.format(new Date(invdate));
			if (invdate !== "") {
				oEntry1.InvDate = invdate + "T00:00:00";
			}
			if (selRow.DocketNum !== "") {
				oEntry1.DocketNum = selRow.DocketNum;
			}
			if (selRow.SoDocno !== "") {
				oEntry1.SoDocno = selRow.SoDocno;
			}
			if (selRow.VendorCode !== "") {
				oEntry1.VendorCode = selRow.VendorCode;
			}
			if (selRow.TruckType !== "") {
				oEntry1.TruckType = selRow.TruckType;
			}
			if (selRow.MilkRun !== "") {
				oEntry1.MilkRun = selRow.MilkRun;
			}
			if (selRow.Customer !== "") {
				oEntry1.Customer = selRow.Customer;
			}
			if (selRow.CustName !== "") {
				oEntry1.CustName = selRow.CustName;
			}
			if (selRow.TruckNumber !== "") {
				oEntry1.TruckNumber = selRow.TruckNumber;
			}
			if (selRow.TPermitNum !== "") {
				oEntry1.TPermitNum = selRow.TPermitNum;
			}
			var tpermitdate = selRow.TPermitDate;
			tpermitdate = oDateFormat.format(new Date(tpermitdate));
			if (tpermitdate !== "") {
				oEntry1.TPermitDate = tpermitdate + "T00:00:00";
			}
			if (selRow.RequestType !== "") {
				oEntry1.RequestType = selRow.RequestType;
			}
			if (selRow.Plant !== "") {
				oEntry1.Plant = selRow.Plant;
			}
			//This is for Proforma Invoice creation
			if (v_ProformaInv == 'SalesOrder') {
				if (itemData.length > 0) {
					oEntry1.SlsGrpNavReq = itemData;
				}
			}
			// End of Proforma condition
			// New condition for creating Sales Order Invoice for Proforma
			if (v_ProformaInv == 'SalesOrder') {
				//Set the Model and call the .create function to call the OData Service.
				//	var oModel3 = new sap.ui.model.odata.ODataModel("http://sapbwdev02.corp.usl.in:8020/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV");
				var oModel3 = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV");

				this.getView().setModel(oModel3);

				oModel3.setHeaders({
					"X-Requested-With": "X"
				});
				sap.m.MessageBox.show("Sales Order is requested", {
					icon: sap.m.MessageBox.Icon.SUCCESS,
					title: "Status",
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function(oAction) {

						//DcktInvDstlSet  DcktInvNavItem
						oModel3.create("/SlsReqGrpSet", oEntry1, {

							success: function(oData, oResponse) {
								//Update the table
								that.getView().byId("Combplant").setSelectedKey(l_Plant);
								that.getView().byId("Combstatus").setSelectedKey(l_Status);
								if (oResponse.statusCode == 201 && oData.MsgType == "E") {
									that.onSubmit();
									var _errMsg = oData.Msg;
									sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
									return;
								} else {
									//End of Invoice List Dialog
									var successObj = ""; //oResponse.data.DocketNum;
									var message = "Sales Order : " + successObj + "  " + "created successfully";

									jQuery.sap.require("sap.m.MessageBox");

									sap.m.MessageBox.show(message, {
										icon: sap.m.MessageBox.Icon.SUCCESS,
										title: "Sales Order Update Status",
										actions: [sap.m.MessageBox.Action.OK],
										onClose: function(oAction) {
											that.onSubmit();
										}
									});

								}
							},
							error: function(oError) {
								var _errMsg = oError.message + ";  " + oError.statusText;
								sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
								//that.getView().setBusy(false);
								return;
							}

						}); //end of create Proforma request method
					}
				}); //end of message on request ok button
			}
		}, //End of On  Proforma Invoice Request
		//-----------------------End of Proforma Invoice Request------------------------------//

		//	************************Submit Function***************************************
		//	******************************************************************************
		//onRequest: function(oEvent) {
		onRqinv: function(oEvent) {
			that = this;
			//Condition to trigger when No record is selected for process by Ramesh on 25-07-2021
			var select = this.getView().byId("table1")._oSelection.aSelectedIndices.length;
			if (select == 0) {
				var _errMsg = "Please select atleast one row to Process Document.";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			//added on 26-07-2021 by Ramesh
			var oForm = sap.ui.getCore().byId("detailList");
			//end on 26-07-2021 by Ramesh
			//End of Selected for process by Ramesh on 25-07-2021
			var oTable = this.byId("table1");
			//Index  number for Selected Row
			var iIndex = oTable.getSelectedIndex();
			// Indices for Selected Row
			var aIndices = this.byId("table1").getSelectedIndices();
			//Get selected Row Records
			var vSrdata = oTable.getContextByIndex(iIndex).getObject();
			//	sap.ui.core.BusyIndicator.show(0);
			var vData = that.getView().byId("table1").getModel().getProperty("/data");
			var docIdVal = vData[iIndex].DocketNum;
			var vSrvUrl = "/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV";
			var oModel = new sap.ui.model.odata.v2.ODataModel(vSrvUrl, {
				defaultBindingMode: sap.ui.model.BindingMode.TwoWay
			});
			that.getView().setModel(oModel);
			//	var sServiceURL = that.getView().getModel().sServiceUrl;
			var sSource = "/HouListSet('" + docIdVal + "')";
			sap.ui.getCore().setModel(oModel);
			// Get the table Model
			oModel.read(sSource, {
				/*	filters: [
						new sap.ui.model.Filter("DocketNum", sap.ui.model.FilterOperator.EQ, docIdVal)

					],*/
				success: function(oData, oResponse) {
					var trr = new sap.ui.model.json.JSONModel({
						"list": oData.results
					});
				}
			});

			var oTable1 = this.getView().byId("table1");
			// Get the table Model
			var oModel3 = oTable1.getModel();
			// Get Items of the Table
			var aItems = oModel3.getData().data; //oTable.getItems();
			//Local Variable Declarations
			var i = 0,
				path,
				idx;
			//Commented by Ramesh on 25-07-2021
			//	path = oEvent.getSource().getBindingContext().sPath;
			//	idx = parseInt(path.substring(path.lastIndexOf('/') + 1));
			//var selRow = oEvent.getSource().getBindingContext().getObject();
			//End 25-07-2021
			idx = oTable1.getSelectedIndex();
			var selRow = oTable.getContextByIndex(idx).getObject();
			// Define an empty Array
			var sel_truckNumber = selRow.TruckNumber;
			var oDateFormat = DateFormat.getDateInstance({
				source: {
					pattern: "timestamp"
				},
				pattern: "yyyy-MM-dd"
			});
			var itemData = [];
			/*	if(idx == 0){
					idx = -1;
				}*/
			//Added by Ramesh Damera as part New CR on 31st August 2021
			var l_Ctms = this.getView().byId("RB3-1").getSelected();
			if (l_Ctms == true) {
				var l_Tms = 'X';
			}
			//End
			//Preparing item data
			for (var iRowIndex = idx; iRowIndex < aItems.length; iRowIndex++) {
				//	var l_material = oModel3.getProperty("MaterialCode", aItems[iRowIndex]); 

				var l_Status = oModel3.getProperty("Status", aItems[iRowIndex]);
				var l_ReqInv = oModel3.getProperty("ReqInv", aItems[iRowIndex]);
				var l_Plant = oModel3.getProperty("Plant", aItems[iRowIndex]);
				var l_TruckNumber = oModel3.getProperty("TruckNumber", aItems[iRowIndex]);
				var l_DocketNum = oModel3.getProperty("DocketNum", aItems[iRowIndex]);
				if ((sel_truckNumber !== "" && sel_truckNumber == l_TruckNumber) ||
					(sel_truckNumber == "" && selRow.DocketNum == l_DocketNum)) {
					//	if (sel_truckNumber == l_TruckNumber) {
					var l_InvDate = oModel3.getProperty("InvDate", aItems[iRowIndex]);
					l_InvDate = oDateFormat.format(new Date(l_InvDate));

					if (l_InvDate !== "") {
						l_InvDate = l_InvDate + "T00:00:00";
					}
					//	var l_DocketNum = oModel3.getProperty("DocketNum", aItems[iRowIndex]);
					var l_SoDocno = oModel3.getProperty("SoDocno", aItems[iRowIndex]);
					var l_VendorCode = oModel3.getProperty("VendorCode", aItems[iRowIndex]);

					var l_TruckType = oModel3.getProperty("TruckType", aItems[iRowIndex]);
					var l_MilkRun = oModel3.getProperty("MilkRun", aItems[iRowIndex]);
					var l_Customer = oModel3.getProperty("Customer", aItems[iRowIndex]);
					var l_CustName = oModel3.getProperty("CustName", aItems[iRowIndex]);

					var l_TPermitNum = oModel3.getProperty("TPermitNum", aItems[iRowIndex]);
					var l_TPermitDate = oModel3.getProperty("TPermitDate", aItems[iRowIndex]);
					l_TPermitDate = oDateFormat.format(new Date(l_TPermitDate));
					if (l_TPermitDate !== "") {
						l_TPermitDate = l_TPermitDate + "T00:00:00";
					}
					var l_RequestType = oModel3.getProperty("RequestType", aItems[iRowIndex]);
					//	var l_Plant= oModel3.getProperty("Plant", aItems[iRowIndex]); 

					itemData.push({
						//	MaterialCode: l_material,

						DocketNum: l_DocketNum,
						SoDocno: l_SoDocno,
						VendorCode: l_VendorCode,
						TruckType: l_TruckType,
						MilkRun: l_MilkRun,
						Customer: l_Customer,
						CustName: l_CustName,
						TruckNumber: l_TruckNumber,
						TPermitNum: l_TPermitNum,
						TPermitDate: l_TPermitDate,
						RequestType: l_RequestType,
						Status: l_Status,
						InvDate: l_InvDate,
						ReqInv: l_ReqInv,
						Plant: l_Plant

					}); // end item datapush

				} //end of truck number
				//if truck num is initial; then take docket number as group
				/*	if(sel_truckNumber == "" && selRow.DocketNum == l_DocketNum) {
					var l_InvDate = oModel3.getProperty("InvDate", aItems[iRowIndex]);
					l_InvDate = oDateFormat.format(new Date(l_InvDate));

					if (l_InvDate !== "") {
						l_InvDate = l_InvDate + "T00:00:00";
					}
				//	var l_DocketNum = oModel3.getProperty("DocketNum", aItems[iRowIndex]);
					var l_SoDocno = oModel3.getProperty("SoDocno", aItems[iRowIndex]);
					var l_VendorCode = oModel3.getProperty("VendorCode", aItems[iRowIndex]);

					var l_TruckType = oModel3.getProperty("TruckType", aItems[iRowIndex]);
					var l_MilkRun = oModel3.getProperty("MilkRun", aItems[iRowIndex]);
					var l_Customer = oModel3.getProperty("Customer", aItems[iRowIndex]);
					var l_CustName = oModel3.getProperty("CustName", aItems[iRowIndex]);

					var l_TPermitNum = oModel3.getProperty("TPermitNum", aItems[iRowIndex]);
					var l_TPermitDate = oModel3.getProperty("TPermitDate", aItems[iRowIndex]);
					l_TPermitDate = oDateFormat.format(new Date(l_TPermitDate));
					if (l_TPermitDate !== "") {
						l_TPermitDate = l_TPermitDate + "T00:00:00";
					}
					var l_RequestType = oModel3.getProperty("RequestType", aItems[iRowIndex]);
					//	var l_Plant= oModel3.getProperty("Plant", aItems[iRowIndex]); 

					itemData.push({
						//	MaterialCode: l_material,

						DocketNum: l_DocketNum,
						SoDocno: l_SoDocno,
						VendorCode: l_VendorCode,
						TruckType: l_TruckType,

						MilkRun: l_MilkRun,
						Customer: l_Customer,
						CustName: l_CustName,
						TruckNumber: l_TruckNumber,
						TPermitNum: l_TPermitNum,
						TPermitDate: l_TPermitDate,
						RequestType: l_RequestType,
						Status: l_Status,
						InvDate: l_InvDate,
						ReqInv: l_ReqInv,
						Plant: l_Plant

					}); // end item datapush
					}*/ //endif 
			} //end forloop
			//adding on 31 st May by Ramesh D 
			//Getting Invoice Process 
			var v_Reqinv = '';
			var v_Reqinv = itemData[0].ReqInv;
			var v_ProformaInv = '';
			var v_ProformaInv = itemData[0].Profermaind;
			// End of change by Ramesh D
			// Create one emtpy Object
			var oEntry1 = {};
			if (selRow.Status !== "") {
				oEntry1.Status = selRow.Status;
			}
			var invdate = selRow.InvDate;
			invdate = oDateFormat.format(new Date(invdate));
			if (invdate !== "") {
				oEntry1.InvDate = invdate + "T00:00:00";
			}
			if (selRow.DocketNum !== "") {
				oEntry1.DocketNum = selRow.DocketNum;
			}
			if (selRow.SoDocno !== "") {
				oEntry1.SoDocno = selRow.SoDocno;
			}
			if (selRow.VendorCode !== "") {
				oEntry1.VendorCode = selRow.VendorCode;
			}
			if (selRow.TruckType !== "") {
				oEntry1.TruckType = selRow.TruckType;
			}
			if (selRow.MilkRun !== "") {
				oEntry1.MilkRun = selRow.MilkRun;
			}
			if (selRow.Customer !== "") {
				oEntry1.Customer = selRow.Customer;
			}
			if (selRow.CustName !== "") {
				oEntry1.CustName = selRow.CustName;
			}
			if (selRow.TruckNumber !== "") {
				oEntry1.TruckNumber = selRow.TruckNumber;
			}
			if (selRow.TPermitNum !== "") {
				oEntry1.TPermitNum = selRow.TPermitNum;
			}
			var tpermitdate = selRow.TPermitDate;
			tpermitdate = oDateFormat.format(new Date(tpermitdate));
			if (tpermitdate !== "") {
				oEntry1.TPermitDate = tpermitdate + "T00:00:00";
			}
			if (selRow.RequestType !== "") {
				oEntry1.RequestType = selRow.RequestType;
			}
			if (selRow.Plant !== "") {
				oEntry1.Plant = selRow.Plant;
			}
			//Added by Ramesh Damera as part of New CR on 31st August 2021
			if (selRow.TMSProcess == "") {
				oEntry1.TMSProcess = l_Tms;
			}
			//End
			// Link Pack items to the Pack header
			// Very very Important. Here the name should be exactly like the Entity Set at Backend OData
			// InvGrpToReqSet is the same name at back end
			//Condition to trigger the TMS process and Non-TMS process
			if (v_Reqinv == 'RequestInvoice') {
				if (itemData.length > 0) {
					oEntry1.InvGrpNavReq = itemData;
				}
			} else {
				if (itemData.length > 0) {
					oEntry1.TMSGrpNavReq = itemData;
				}

			}
			//This is for Proforma Invoice creation
			if (v_ProformaInv == 'SalesOrder') {
				if (itemData.length > 0) {
					oEntry1.SlsGrpNavReq = itemData;
				}
			}
			// End of Proforma condition
			// New condition for creating Sales Order Invoice for Proforma
			if (v_ProformaInv == 'SalesOrder') {
				//Set the Model and call the .create function to call the OData Service.
				//	var oModel3 = new sap.ui.model.odata.ODataModel("http://sapbwdev02.corp.usl.in:8020/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV");
				var oModel3 = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV");

				this.getView().setModel(oModel3);

				oModel3.setHeaders({
					"X-Requested-With": "X"
				});
				sap.m.MessageBox.show("Sales Order is requested", {
					icon: sap.m.MessageBox.Icon.SUCCESS,
					title: "Status",
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function(oAction) {

						//DcktInvDstlSet  DcktInvNavItem
						oModel3.create("/SlsReqGrpSet", oEntry1, {

							success: function(oData, oResponse) {
								//Update the table
								that.getView().byId("Combplant").setSelectedKey(l_Plant);
								that.getView().byId("Combstatus").setSelectedKey(l_Status);
								if (oResponse.statusCode == 201 && oData.MsgType == "E") {
									that.onSubmit();
									var _errMsg = oData.Msg;
									sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
									return;
								} else {
									//End of Invoice List Dialog
									var successObj = ""; //oResponse.data.DocketNum;
									var message = "Sales Order : " + successObj + "  " + "created successfully";

									jQuery.sap.require("sap.m.MessageBox");

									sap.m.MessageBox.show(message, {
										icon: sap.m.MessageBox.Icon.SUCCESS,
										title: "Sales Order Update Status",
										actions: [sap.m.MessageBox.Action.OK],
										onClose: function(oAction) {
											that.onSubmit();
										}
									});

								}
							},
							error: function(oError) {
								var _errMsg = oError.message + ";  " + oError.statusText;
								jQuery.sap.require("sap.m.MessageBox");
								sap.m.MessageBox.show(_errMsg, {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error"
								});
								//that.getView().setBusy(false);
								return;
							}

						}); //end of crate request method
					}

				}); //end of message on request ok button
			}
			//

			//Non-TMS Process		
			if (v_Reqinv == 'RequestInvoice') {
				//Set the Model and call the .create function to call the OData Service.
				//	var oModel3 = new sap.ui.model.odata.ODataModel("http://sapbwdev02.corp.usl.in:8020/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV");
				var oModel3 = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV");

				this.getView().setModel(oModel3);

				oModel3.setHeaders({
					"X-Requested-With": "X"
				});
				sap.m.MessageBox.show("Invoice is requested", {
					icon: sap.m.MessageBox.Icon.SUCCESS,
					title: "Status",
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function(oAction) {

						//DcktInvDstlSet  DcktInvNavItem
						oModel3.create("/InvReqGrpSet", oEntry1, {

							success: function(oData, oResponse) {
								//Update the table
								var tabledata = new sap.ui.model.json.JSONModel({
									"list": oData
								});

								that.getView().byId("Combplant").setSelectedKey(l_Plant);
								that.getView().byId("Combstatus").setSelectedKey(l_Status);
								if (oResponse.statusCode == 201 && oData.MsgType == "E") {
									that.onSubmit();
									//v_dlist = oResponse.data.InvGrpNavReq.results[0].DocketNum;

									that.getView().byId("Combplant").setSelectedKey(l_Plant);
									that.getView().byId("Combstatus").setSelectedKey(l_Status);
									//Based on Rajesh Shoney comments - Commented this code by 28thJuly2021
									/*jQuery.sap.require("sap.m.MessageBox");
									var _errMsg = oData.Msg;
									sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.INFORMATION, "Information");*/
									return;
									// End of Rajesh Shoney Comments
								} else {
									//End of Invoice List Dialog
									var successObj = ""; //oResponse.data.DocketNum;
									var message = "Invoices : " + successObj + "  " + "created successfully";
									jQuery.sap.require("sap.m.MessageBox");
									sap.m.MessageBox.show(message, {
										icon: sap.m.MessageBox.Icon.SUCCESS,
										title: "Invoice Update Status",
										actions: [sap.m.MessageBox.Action.OK],
										onClose: function(oAction) {
											/*											var oView = that.getView();
																						var oDialog = oView.byId("iDialog");
																						if (!that.iDialog) {
																							that.iDialog = Fragment.load({
																								//id: oView.getId(),	
																								name: "ZDLT_UI5_DIS_INV_REQ.view.detailList",
																								controller: that
																							}).then(function(oDialog) {
																								// connect dialog to the root view of this component (models, lifecycle)
																								oView.addDependent(oDialog);
																								oDialog.bindElement({
																									path: path,
																									model: oModel
																								});
																								oDialog.open();
																								return oDialog;
																							});
																						}
																						that.iDialog.then(function(iDialog) {
																							iDialog.open();
																						});*/
											//End of change by Ramesh
											that.onSubmit();
										}
									});

								}
							},
							error: function(oError) {
								var _errMsg = oError.message + ";  " + oError.statusText;
								sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
								//that.getView().setBusy(false);
								return;
							}

						}); //end of crate request method
					}

				}); //end of message on request ok button
			}
			//TMS Process

			if (v_Reqinv == 'ProcessToTMS') {
				//Set the Model and call the .create function to call the OData Service.
				//	var oModel3 = new sap.ui.model.odata.ODataModel("http://sapbwdev02.corp.usl.in:8020/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV");
				var oModel3 = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV");

				this.getView().setModel(oModel3);

				oModel3.setHeaders({
					"X-Requested-With": "X"
				});
				sap.m.MessageBox.show("TMS Process is requested", {
					icon: sap.m.MessageBox.Icon.SUCCESS,
					title: "Status",
					actions: [sap.m.MessageBox.Action.OK],
					onClose: function(oAction) {
						//DcktInvDstlSet  DcktInvNavItem
						oModel3.create("/TMSReqGrpSet", oEntry1, {

							success: function(oData, oResponse) {
								//Update the table
								that.getView().byId("Combplant").setSelectedKey(l_Plant);
								that.getView().byId("Combstatus").setSelectedKey(l_Status);
								if (oResponse.statusCode == 201 && oData.MsgType == "E") {
									that.onSubmit();
									var _errMsg = oData.Msg;
									sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
									return;
								} else {
									var successObj = ""; //oResponse.data.DocketNum;
									var message = "Sent to TMS " + successObj + "  " + "successfully";

									jQuery.sap.require("sap.m.MessageBox");

									sap.m.MessageBox.show(message, {
										icon: sap.m.MessageBox.Icon.SUCCESS,
										title: "Invoice Update Status",
										actions: [sap.m.MessageBox.Action.OK],
										onClose: function(oAction) {
											that.onSubmit();
										}
									});

								}
							},
							error: function(oError) {
								var _errMsg = oError.message + ";  " + oError.statusText;
								sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
								//that.getView().setBusy(false);
								return;
							}

						}); //end of crate request method
					}
				}); //end of message on request ok button
			}
			//End of TMS Process

		}, //End of On Request
		//	************************For Close Invoice List Dialog Function***************************************
		//	*****************************************************************************************************
		onCloseDialog: function() {
			that.iDialog.then(function(iDialog) {
				iDialog.close();
			});
		},
		//	************************Request for Credit check approval Function***************************************
		//	*********************************************************************************************************
		//onCrdCheck: function(oEvent) {

		onReqapprvl: function(oEvent) {
				that = this;
				var oTable = this.byId("table1");
				//Added by Ramesh on 25-7-2021 for No records selection condition
				var sel = this.getView().byId("table1")._oSelection.aSelectedIndices.length;
				if (sel == 0) {
					var _errMsg = "Please select atleast one row for Approval Request.";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}
				//End by Ramesh on 25-07-2021
				var path,
					idx;
				idx = oTable.getSelectedIndex();
				var selRow = oTable.getContextByIndex(idx).getObject();
				//path = oEvent.getSource().getBindingContext().sPath;
				//Commented by Ramesh on 25-07-2021
				// idx = parseInt(path.substring(path.lastIndexOf('/') + 1));
				// var selRow = oEvent.getSource().getBindingContext().getObject();
				// // Define an empty Array
				//End of Comment by Ramesh on 25-07-2021
				// Create one emtpy Object
				var oEntry1 = {};

				if (selRow.DocketNum !== "") {
					oEntry1.DocketNum = selRow.DocketNum;
				}
				var l_plantcr = that.getView().byId("Combplant").getSelectedKey();
				var l_statuscr = that.getView().byId("Combstatus").getSelectedKey();
				if (selRow.CrdCheck == "Request for Approval") {
					//Set the Model and call the .create function to call the OData Service.
					//	var oModelCr1 = new sap.ui.model.odata.ODataModel("http://sapbwdev02.corp.usl.in:8020/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV");
					var oModelCr1 = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV");

					this.getView().setModel(oModelCr1);

					oModelCr1.setHeaders({
						"X-Requested-With": "X"
					});
					/*	sap.m.MessageBox.show("Send for Approval ", {
							icon: sap.m.MessageBox.Icon.SUCCESS,
							title: "Status",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {  */

					oModelCr1.create("/CreditRequestSet", oEntry1, {

						success: function(oData, oResponse) {

							//Update the table

							that.getView().byId("Combplant").setSelectedKey(l_plantcr);
							that.getView().byId("Combstatus").setSelectedKey(l_statuscr);
							if (oResponse.statusCode == 201 && oData.MsgType == "E") {
								that.onSubmit();
								var _errMsg = oData.Msg;
								sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
								return;

							} else {
								var successObj = ""; //oResponse.data.DocketNum;
								var message = "Sent for Approval"; //: " + successObj + "  " + "sent successfully";

								jQuery.sap.require("sap.m.MessageBox");

								sap.m.MessageBox.show(message, {
									icon: sap.m.MessageBox.Icon.SUCCESS,
									title: "Request for Credit Approve",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {
										that.onSubmit();
									}
								});

							} //end of else
						},
						error: function(oError) {
							that.getView().byId("Combplant").setSelectedKey(l_plantcr);
							that.getView().byId("Combstatus").setSelectedKey(l_statuscr);
							var _errMsg = oError.message + ";  " + oError.response.statusText;
							sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
							//that.getView().setBusy(false);
							return;
						}

					}); //end of crate request method
					/*		} // end of onClose action of message on request ok 
					}); //end of message on request ok button */
				} //end of status
			} //End of Oncrdchk

	});
});