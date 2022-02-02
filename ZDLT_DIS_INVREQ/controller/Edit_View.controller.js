sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/format/DateFormat",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/BusyIndicator"
], function(Controller, DateFormat, MessageBox, JSONModel, MessageToast, BusyIndicator) {
	"use strict";

	var that = this;
	var oModel = "";
	var oJModel = "";
	var oFilters = "";
	var v_Plant = "";
	var v_TruckType = "";
	var v_Pricelist = "";
	var v_total_qty = "";
	var v_docketnum = "";
	var setkey = "";
	var oIconTabBar = "";
	var view = "";
	return Controller.extend("ZDLT_UI5_DIS_INV_REQ.controller.Edit_View", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ZDLT_UI5_DIS_INV_REQ.view.Edit_view
		 */
		onInit: function() {
			that = this;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.getRoute("Edit_View").attachPatternMatched(this._onObjectMatched, this);

			//	var vServiceUrl = "http://sapbwdev02.corp.usl.in:8020/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV";
			var vServiceUrl = "/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV";
			var oModel = new sap.ui.model.odata.v2.ODataModel(vServiceUrl, {
				defaultBindingMode: sap.ui.model.BindingMode.TwoWay
			});
			this.getView().setModel(oModel);
			this.getView().setModel(new JSONModel(), "this");
			this.getView().getModel("this").setProperty("/SalesOrderCreated", true);
			that.getView().getModel("this").setProperty("/IsCSDTokenFieldsVisible", false);
			that.getView().getModel("this").setProperty("/IsInvoiceCreated", false);
			that.getView().getModel("this").setProperty("/IsCSDTokenNoVisible", false);

		}, //end of init

		_onObjectMatched: function(oEvent) {
			that = this;
			var view = this.getView().sId + "--";
			var setkey = view + "__filter2";
			var oIconTabBar = that.getView().byId("__bar1");
			oIconTabBar.fireSelect({
				key: setkey,
				item: oIconTabBar.getItems()[0]
			});
			oIconTabBar.setSelectedKey(setkey);
			var setkey = view + "__filter0";
			var oIconTabBar = that.getView().byId("__bar0");
			oIconTabBar.fireSelect({
				key: setkey,
				item: oIconTabBar.getItems()[0]
			});
			oIconTabBar.setSelectedKey(setkey);
			/*	this.getView().bindElement({
					path: "/Edit" + oEvent.getParameter("arguments").docId,
					model: ""
				}); */
			v_total_qty = "";
			oFilters = oEvent.getParameter("arguments").docId;
			v_docketnum = oFilters;
			//	that.getView().getId("BtSLoc").

			//start of code
			//var vServiceUrl = "http://sapbwdev02.corp.usl.in:8020/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV";
			var vServiceUrl = "/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV";
			var oModel = new sap.ui.model.odata.v2.ODataModel(vServiceUrl, {
				defaultBindingMode: sap.ui.model.BindingMode.TwoWay
			});
			this.getView().setModel(oModel);
			/*	var url1 = "/DcktInvEditSet('1006:JAN20:00003')?$expand=DcktEditNavItem,DcktEditNavBat";
			//	var url1 = "/DcktInvEditSet?$filter=(id eq '1006:JAN20:00003')";
					oModel.read(url1, {
					success: function(odata, oResponse) {},
					error: function(oError) {}

				});*/
			//	var oFilters = "1006:JAN20:00003"; //DocketNum= ///DcktInvEditSet('1006:JAN20:00003')"
			//	var oFilters = oEvent.getParameter("arguments");
			oModel.read("/DcktInvEditSet", {
				// filters: oFilters, // use sap.ui.model.Filter for filters
				filters: [
					new sap.ui.model.Filter("DocketNum", sap.ui.model.FilterOperator.EQ, oFilters)
				],
				urlParameters: {
					"$expand": "DcktEditNavItem,DcktEditNavBat"
				},
				success: function(oData, oResponse) {
					if (oResponse.statusCode == 200 && oData.MsgType == "E") {
						var _errMsg = oData.Msg;
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
						return;
					}
					//			alert("success"); 
					var oDateFormat = DateFormat.getDateInstance({
						source: {
							pattern: "timestamp"
						},
						pattern: "yyyy-MM-dd" //"dd/MM/yyyy"
					});
					var it = 0;
					//Converts the dates and set back to oData

					for (var i = 0; i < oData.results.length; i++) {
						var odata1 = oData.results[i];
						odata1.InvDate = (new Date(odata1.InvDate)).getTime() - (it % 10 * 4 * 24 * 60 * 60 * 1000);
						odata1.InvDateStr = oDateFormat.format(new Date(odata1.InvDate));

						odata1.TPermitDate = (new Date(odata1.TpPermitDate)).getTime() - (it % 10 * 4 * 24 * 60 * 60 * 1000);
						odata1.TPermitDateStr = oDateFormat.format(new Date(odata1.TPermitDate));

						odata1.ExpDate = (new Date(odata1.ExpDate)).getTime() - (it % 10 * 4 * 24 * 60 * 60 * 1000);
						odata1.ExpDate = oDateFormat.format(new Date(odata1.ExpDate));
						if (odata1.ExpOrdDate !== null) {
							odata1.ExpOrdDate = (new Date(odata1.ExpOrdDate)).getTime() - (it % 10 * 4 * 24 * 60 * 60 * 1000);
							odata1.ExpOrdDate = oDateFormat.format(new Date(odata1.ExpOrdDate));
						}
						if (odata1.TpOrderDate !== null) {
							odata1.TpOrderDate = (new Date(odata1.TpOrderDate)).getTime() - (it % 10 * 4 * 24 * 60 * 60 * 1000);
							odata1.TpOrderDate = oDateFormat.format(new Date(odata1.TpOrderDate));
						}
					}

					that.getView().byId("Inpinvdate").setValue(oData.results[0].InvDateStr);
					v_Plant = oData.results[0].Plant;

					that.getView().getModel("this").setProperty("/TruckInd", oData.results[0].TruckInd);
					if (oData.results[0].TruckInd === 'P' && oData.results[0].Status === 0) {
						that.getView().getModel("this").setProperty("/TruckEditable", true);
					}

					//ra1vi2 for token38
					if (oData.results[0].DistributChanId === '12' && oData.results[0].TokenInd === 'Y') {

						that.getView().getModel("this").setProperty("/IsCSDTokenNoVisible", true);
						that.getView().byId("idToken").setValue(oData.results[0].TokenNo);
						that.getView().byId("idCSDTokenNumber").setValue(oData.results[0].TokenNo);
						that.getView().byId("idForm38Input").setValue(oData.results[0].Form38);
						if (oData.results[0].Status === 2) {
							that.getView().getModel("this").setProperty("/IsCSDTokenFieldsVisible", true);
							that.getView().byId("idToken").setEnabled(false);
							if (that.getView().byId("idForm38Input").getValue()) {
								that.getView().getModel("this").setProperty("/IsInvoiceCreated", true);
							}
						} else {
							//	that.getView().getModel("this").setProperty("/IsInvoiceCreated", true);
							that.getView().getModel("this").setProperty("/IsCSDTokenFieldsVisible", false);
							that.getView().getModel("this").setProperty("/IsInvoiceCreated", false);
						}
					}
					//ra1vi2 for token38

					that.getView().byId("Combplant").setSelectedKey(oData.results[0].Plant);
					that.getView().byId("InpCompNam").setValue(oData.results[0].Bukrs);
					that.getView().byId("Inpplntnam").setValue(oData.results[0].PlantName);
					that.getView().byId("Inpdckt").setValue(oData.results[0].DocketNum);
					that.getView().byId("Inpcust").setValue(oData.results[0].Customer);
					that.getView().byId("Inptpnum").setValue(oData.results[0].TpPermitNum);
					that.getView().byId("Inpordnum").setValue(oData.results[0].OrderNum);
					that.getView().byId("Inpexpnum").setValue(oData.results[0].ExpNum);
					that.getView().byId("Inpremarks").setValue(oData.results[0].Remarks);
					that.getView().byId("Inpcustname").setValue(oData.results[0].CustName);

					that.getView().byId("Inpslsorg").setValue(oData.results[0].SalesOrganization);
					that.getView().byId("Combdistr").setSelectedKey(oData.results[0].DistributChanId);
					that.getView().byId("Combdiv").setSelectedKey(oData.results[0].DivisionId);
					that.getView().byId("Combslsgrp").setSelectedKey(oData.results[0].SalesGrp);

					that.getView().byId("Inptpdat").setValue(oData.results[0].TPermitDateStr);

					that.getView().byId("Inpexdat").setValue(oData.results[0].ExpDate);
					that.getView().byId("Inpexporddat").setValue(oData.results[0].ExpOrdDate);
					v_Pricelist = oData.results[0].Pricelist; //v_Plant = oData.results[0].Plant;
					that.getView().byId("Combprclst").setSelectedKey(oData.results[0].Pricelist);
					that.getView().byId("Inpcashdcnt").setValue(oData.results[0].CashDiscount);

					that.getView().byId("Inptrpordnum").setValue(oData.results[0].TpOrderNum);
					that.getView().byId("Inptrporddate").setValue(oData.results[0].TpOrderDate);

					that.getView().byId("Inptrpter").setValue(oData.results[0].Transporter);

					that.getView().byId("Inptrpternam").setValue(oData.results[0].TrpName);

					v_TruckType = oData.results[0].TruckType;
					//	that.getView().byId("Combtrcktyp").setSelectedKey(oData.results[0].TruckType);
					that.getView().byId("Inptrcknum").setValue(oData.results[0].TruckNumber);
					that.getView().byId("Inplrnum").setValue(oData.results[0].LrNumber);
					that.getView().byId("Combmilkrun").setSelectedKey(oData.results[0].MilkRun);
					//Start of change by Ramesh Damera as part of New CR
					if (oData.results[0].TpOrderNum == '') {
						that.getView().byId("Idoc").setValue('N/A');
					} else {
						that.getView().byId("Idoc").setValue(oData.results[0].TpOrderNum);
					}
					//End of change

					that.getView().byId("InpSaleOrder").setValue(oData.results[0].SoDocNo);
					if (that.getView().byId("InpSaleOrder").getValue()) {
						that.getView().byId("idToken").setEnabled(false);
					}
					that.getView().byId("InpDelivery").setValue(oData.results[0].DelDocno);
					that.getView().byId("InpShipment").setValue(oData.results[0].ShipDocno);
					that.getView().byId("InpPGINo").setValue(oData.results[0].PgiDocno);
					that.getView().byId("InpInvNo").setValue(oData.results[0].InvDocno);
					//if the status is 2  disalbe submit
					if (oData.results[0].Status == 2) {
						that.getView().byId("Idsubmit").setEnabled(false); //comb distr
						//	var oTitle = that.getPage().getTitle();
						that.getView().byId("Idtexth").setText("Display Invoice");
						//	oTitle.setT("Display Invoice");
					} else {
						that.getView().byId("Idsubmit").setEnabled(true);
						that.getView().byId("Idtexth").setText("Edit Invoice");
					}
					//if the plant type is DE disalbe stoage fetch
					if (oData.results[0].PlantType !== "DE") {
						that.getView().byId("BtSLoc").setEnabled(false); //Fetch Storage Loc
						that.getView().byId("__filter3").setEnabled(false);
						that.getView().byId("Combprclst").setEnabled(false);
					} else {
						that.getView().byId("BtSLoc").setEnabled(true); //Fetch storgage loc
						that.getView().byId("__filter3").setEnabled(true); //sloc tab
						that.getView().byId("Combprclst").setEnabled(true);

					}
					//Sale order validation
					if (oData.results[0].SoDocNo !== "") {
						that.getView().byId("Btadd").setEnabled(false); //Add Button
						that.getView().byId("Btdelete").setEnabled(false);
						//that.getView().byId("idQtyColumn").setEditable(false);
						//	that.getView().byId("Inpinvdate").setEnabled(false);
						that.getView().byId("Inpcust").setEnabled(false);
						that.getView().getModel("this").setProperty("/SalesOrderCreated", false);
						//Commented as per confirmation from Rajesh Shoney	on 17-09-2021		
						/*						if (oData.results[0].DelDocno !== "") {
													that.getView().byId("Inptpnum").setEnabled(false);
												} else {
													that.getView().byId("Inptpnum").setEnabled(true);
												}*/
						//End of Comment
						//Start of new change by Ramesh on 17-09-2021
						if (oData.results[0].InvDocno !== "") {
							that.getView().byId("Inptpnum").setEnabled(false);
						} else {
							that.getView().byId("Inptpnum").setEnabled(true);
						}
						//End

						that.getView().byId("Inpordnum").setEnabled(false);
						that.getView().byId("Inpexpnum").setEnabled(false);
						that.getView().byId("Inpremarks").setEnabled(false);

						that.getView().byId("Combslsgrp").setEnabled(false);
						// Start of Comment as part of New CR on 6th September 2021						
						//that.getView().byId("Inptpdat").setEnabled(false);
						//that.getView().byId("Inpexdat").setEnabled(false);
						//End of Comment						
						that.getView().byId("Inpexporddat").setEnabled(false);
						that.getView().byId("Combprclst").setEnabled(false);
						that.getView().byId("Inpcashdcnt").setEnabled(false);

						that.getView().byId("Inptrpordnum").setEnabled(false);
						that.getView().byId("Inptrporddate").setEnabled(false);
						that.getView().byId("Inptrpter").setEnabled(false);
						that.getView().byId("Combtrcktyp").setEnabled(false);
						that.getView().byId("Inptrcknum").setEnabled(false);
						that.getView().byId("Inplrnum").setEnabled(false);
						that.getView().byId("Combmilkrun").setEnabled(false);
					} else {
						that.getView().byId("Btadd").setEnabled(true); //Add Button
						that.getView().byId("Btdelete").setEnabled(true);
						that.getView().getModel("this").setProperty("/SalesOrderCreated", true);
						//	that.getView().byId("Inpinvdate").setEnabled(true);
						that.getView().byId("Inpcust").setEnabled(true);
						//	that.getView().byId("Inptpnum").setEnabled(false);
						that.getView().byId("Inpordnum").setEnabled(true);
						that.getView().byId("Inpexpnum").setEnabled(true);
						that.getView().byId("Inpremarks").setEnabled(true);

						that.getView().byId("Combslsgrp").setEnabled(true);
						// Start of Comment as part of New CR on 6th September 2021
						//	that.getView().byId("Inptpdat").setEnabled(true);
						//	that.getView().byId("Inpexdat").setEnabled(true);
						// End of Comment
						that.getView().byId("Inpexporddat").setEnabled(true);
						that.getView().byId("Combprclst").setEnabled(true);
						that.getView().byId("Inpcashdcnt").setEnabled(true);

						that.getView().byId("Inptrpordnum").setEnabled(true);
						that.getView().byId("Inptrporddate").setEnabled(true);
						that.getView().byId("Inptrpter").setEnabled(true);
						that.getView().byId("Combtrcktyp").setEnabled(true);
						that.getView().byId("Inptrcknum").setEnabled(true);
						that.getView().byId("Inplrnum").setEnabled(true);
						that.getView().byId("Combmilkrun").setEnabled(true);

					} //end of Sale order validation
					//Item Data	
					//	oData.results[0].DcktEditNavItem.results
					var tabledata = new sap.ui.model.json.JSONModel({
						"Result": oData.results[0].DcktEditNavItem.results
					});
					var tab = that.getView().byId("table1");
					var oJModel1 = tab.getModel();
					var datamat = oData.results[0].DcktEditNavItem.results;
					tab.setModel(tabledata);

					tabledata.setData({
						data: datamat
					});
					//calculation for total qty in cases
					//	var v_iqty = 0;
					var v_qty = 0;
					for (var iq = 0; iq < oData.results[0].DcktEditNavItem.results.length; iq++) {
						var v_qty1 = Math.abs(oData.results[0].DcktEditNavItem.results[iq].Quantity);
						var v_qty2 = Math.abs(oData.results[0].DcktEditNavItem.results[iq].Umren);
						var v_iquom = Math.abs(oData.results[0].DcktEditNavItem.results[iq].Uom);
						if (v_iquom == "EA") {
							if (oData.results[0].DcktEditNavItem.results[iq].Umren !== 0) {
								v_qty1 = v_qty1 / v_qty2;
							}
						} //end of each condition

						v_qty = Math.abs(v_qty1);
						v_total_qty = Math.abs(v_total_qty);
						v_total_qty = Math.abs(v_total_qty);
						v_total_qty = v_total_qty + v_qty;
					} //end for loop for totalqty calculation

					//  v_total_qty = v_total_qty.toFixed(3);
					//calling add method
					that.onAddqty(oEvent);
					that.getView().byId("Txt1").setValue(v_total_qty);

					//Batch Item
					var tabledata1 = new sap.ui.model.json.JSONModel({
						"Result": oData.results[0].DcktEditNavBat.results
					});
					var tab1 = that.getView().byId("table2");
					var oJModel2 = tab1.getModel();
					var databatch = oData.results[0].DcktEditNavBat.results;
					tab1.setModel(tabledata1);

					tabledata1.setData({
						data: databatch
					});

					//Start of Code for Truck type dropdown
					/*	var odataModeltr = this.getView().getModel();
								//Setting trucktype values based on Plant value
							var filtervalue = v_Plant;
								odataModeltr.read("/TruckTypeSet", {
									filters: [
										new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, filtervalue)
									],
									success: function(oData, oResponse) {
										var aFiltersComboBoxData = oResponse.data.results;
										var oJModeltr3 = new sap.ui.model.json.JSONModel();
										oJModeltr3.setData(aFiltersComboBoxData);
									that.getView().byId("Combtrcktyp").setModel(oJModeltr3, "namedmodel");
									},
									error: function(oError) {
									}//end of error
								});		*/

					//end of truck type dropdown

				},
				error: function(oError) {
					alert("failure");
				}
			}); //end of read docket

		}, //end of onObjectMatched 
		onSLoc: function(oEvent) {
			that = this;
			//setting icon tab of sloc
			var view = this.getView().sId + "--";
			var setkey = view + "__filter3";
			var oIconTabBar = that.getView().byId("__bar1");
			oIconTabBar.fireSelect({
				key: setkey,
				item: oIconTabBar.getItems()[0]
			});
			oIconTabBar.setSelectedKey(setkey);

			var oTable1 = this.getView().byId("table1");

			// Get the table Model
			var oModel3 = oTable1.getModel();

			// Get Items of the Table
			var aItems = oModel3.getData().data; //oTable.getItems();

			var oTable2 = this.getView().byId("table2");

			// Get the table Model
			var oModel4 = oTable2.getModel();
			var odataModel = this.getView().getModel();
			var aFilter1 = [];
			var aFiltermat = [];
			//Preparing item data
			var v_matcode;

			var atabledatabatch = [];

			for (var iRowIndex = 0; iRowIndex < aItems.length; iRowIndex++) {

				v_matcode = aItems[iRowIndex].MaterialCode;
				var v_Uom = aItems[iRowIndex].Uom;
				var v_qty = aItems[iRowIndex].Quantity;
				//	new sap.ui.model.Filter("MaterialCode", sap.ui.model.FilterOperator.EQ, v_matcode);
				//	aFilter1.push(new sap.ui.model.Filter([(new sap.ui.model.Filter("MaterialCode", sap.ui.model.FilterOperator.EQ, v_matcode))], false));
				aFiltermat.push(new sap.ui.model.Filter("MaterialCode", sap.ui.model.FilterOperator.EQ, v_matcode));
				//		}
				aFilter1.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, v_Plant));
				var materialFilter = new sap.ui.model.Filter(aFiltermat, false);
				var plantFilter = new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, v_Plant);
				var odataFilter = new sap.ui.model.Filter([materialFilter, plantFilter], true);
				//startof new
				odataModel.read("/MatBatchSet", {
					//	filters: odataFilter,
					//	filters: aFilter1,
					filters: [
						new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, v_Plant),
						new sap.ui.model.Filter("MaterialCode", sap.ui.model.FilterOperator.EQ, v_matcode),
						new sap.ui.model.Filter("Uom", sap.ui.model.FilterOperator.EQ, v_Uom),
						new sap.ui.model.Filter("Quantity", sap.ui.model.FilterOperator.EQ, v_qty),
						new sap.ui.model.Filter("DocketNum", sap.ui.model.FilterOperator.EQ, v_docketnum)
						//	new sap.ui.model.Filter("InvDate", sap.ui.model.FilterOperator.BT, date1, date2)
					],
					//	and: false,
					success: function(oData, oResponse) {
						if (oResponse.statusCode == 200 && oData.MsgType == "E") {
							var _errMsg = oData.Msg;
							sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
							return;
						}
						//	alert("success - Go SLOc  called. ");

						/* Json Format
												// Push this entry into array and bind it to the table
												for (var i = 0; i < oData.results.length; i++) {
													var itemRow = {
														MaterialDesc1: oData.results[i].MaterialDesc,
														Quantity1: oData.results[i].Quantity,
														MaterialCode1: oData.results[i].MaterialCode,
														SLoc: oData.results[i].Sloc,
														SLocQty1: oData.results[i].BatchQty,
														Stock: oData.results[i].Slocstock,
														Uom1: oData.results[i].Uom,
														Bottlecase: oData.results[i].Umren
													};
													var oJModel = that.getView().byId("table2").getModel();
													var itemData = oJModel.getProperty("/data1");
													if (typeof itemData !== "undefined" && itemData !== null && itemData.length > 0) {
														// Append the data using .push
														itemData.push(itemRow);
													} else {
														itemData = [];
														//	Append empty row
														itemData.push(itemRow);
													}

													itemData.push(itemRow);
												} //endloop of odata.results

												oJModel.setData({
													data: itemData
												}); 
												*/

						//Odata Format
						//var databatch = oData.results;// oData.results
						var tabledatabatch1 = new sap.ui.model.json.JSONModel({
							"Result": oData.results
						});

						var tabbatch = that.getView().byId("table2");
						var oJModelbatch = tabbatch.getModel();
						var databatch = [];
						for (var id = 0; id < oData.results.length; id++) {
							databatch = oData.results[id];
							atabledatabatch.push(databatch);
							//	databatch.push(databatch);
						}
						//	data1= oData.results;
						//	oJModel1.setData({
						//	data: data1
						//	});
						//	atabledatabatch.push(databatch);
						tabbatch.setModel(tabledatabatch1);
						//   oData.results = atabledatabatch;
						tabledatabatch1.setData({
							data: atabledatabatch
						});

					},
					error: function(oError) {
							var _errMsg = oError.message + ";  " + oError.statusText;
							sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
							return;
							//	alert("failed - Go SLOc  called. ");
						} //end of error
				});
			}

		},
		//	************************Delete Function***************************************
		//	*****************************************************************************
		onItemDelete: function() {

			var oTable = this.getView().byId("table1");
			var oModel2 = oTable.getModel();

			var aRows = oModel2.getData().data;
			var oItems = oTable.getSelectedIndices();

			var i,
				path,
				idx,
				v_qty_del;
			for (i = oItems.length - 1; i >= 0; --i) {

				var id = oItems[i];

				path = oTable.getContextByIndex(id).sPath; //-- > this line made the difference

				idx = parseInt(path.substring(path.lastIndexOf('/') + 1));

				var v_qty_deleted = aRows[idx].Quantity;
				v_qty_deleted = Math.abs(v_qty_deleted);
				var b_case = Math.abs(this.getView().byId("InpUmren").getValue());

				var v_qty = Math.abs(this.getView().byId("Txt1").getValue());
				var v_qty_tot = v_qty - (v_qty_deleted / b_case);
				if (aRows[idx].Uom == "EA") {
					if (b_case !== 0) {
						v_qty_deleted = (v_qty_deleted / b_case);
					}
				} //end of each cond
				v_qty_deleted = Math.abs(v_qty_deleted);
				v_total_qty = Math.abs(v_total_qty);
				v_total_qty = v_total_qty - v_qty_deleted;
				//	v_total_qty =	v_total_qty.toFixed(3);

				//	v_qty_del = v_qty + v_qty_tot ;
				/*	v_qty_del = Math.round(v_qty_del);
					v_total_qty = v_total_qty - v_qty_del; */
				//	this.getView().byId("Txt1").setValue(v_qty);
				//	this.getView().byId("Txt1").setValue(v_total_qty);
				aRows.splice(idx, 1);

			} // end of for
			//	calling add qty function
			this.onAddqty();
			this.getView().byId("Txt1").setValue(v_total_qty);
			oModel2.setData({
				data: aRows
			});
			oTable.removeSelectionInterval(oItems.length);
		},
		//	************************ON Material Input Function***************************************
		//	*****************************************************************************************
		onMatInput: function(oEvent) {
			var that = this;
			var matnr = oEvent.getSource().getValue();
			var vkorg = this.getView().byId("Inpslsorg").getValue();
			var vtweg = this.getView().byId("Combdistr").getSelectedKey();
			var spart = this.getView().byId("Combdiv").getSelectedKey();
			//	var werks= this.getView().byId("Combdiv").getSelectedKey(); 
			if (matnr == "") {
				that.getView().byId("InpMatcode1").setValue("");
				that.getView().byId("InpMatdesc1").setValue("");
				that.getView().byId("InpBrand1").setValue("");
				that.getView().byId("InpPack1").setValue("");
				that.getView().byId("InpQty1").setValue("");
				return;
			}
			var werks = v_Plant;
			var customer = this.getView().byId("Inpcust").getValue();
			var invDate = this.getView().byId("Inpinvdate").getValue();

			var odataModel = this.getView().getModel();
			var url = "/MatGetSet(Matnr='" + matnr + "',Vkorg='" + vkorg + "',Vtweg='" + vtweg + "',Spart='" + spart + "',Werks='" + werks +
				"',Customer='" + customer + "')";
			//	url="/MatGetSet(Matnr='103584',Vkorg='5001',Vtweg='11',Spart='11',Werks='1006',Customer='11358')";
			// this.showBusyIndicator();

			odataModel.read(url, {
				success: function(odata, oResponse) {
					if (oResponse.statusCode == 200 && odata.MsgType == "E") {
						//	that.getView().byId("InpMatcode").setValue("");
						that.getView().byId("InpMatdesc1").setValue("");
						that.getView().byId("InpBrand1").setValue("");
						that.getView().byId("InpPack1").setValue("");
						that.getView().byId("InpQty1").setValue("");
						var _errMsg = odata.Msg;
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
						return;
					}
					// that.hideBusyIndicator();
					that.getView().byId("InpBrand1").setValue(odata.Brand);
					that.getView().byId("InpMatdesc1").setValue(odata.Maktxt);
					that.getView().byId("InpPack1").setValue(odata.Pack);
					that.getView().byId("InpUmren").setValue(odata.Umren);
				},
				error: function(oError) {
					that.getView().byId("InpMatdesc1").setValue("");
					that.getView().byId("InpBrand1").setValue("");
					that.getView().byId("InpPack1").setValue("");
					that.getView().byId("InpQty1").setValue("");
					var _errMsg = oError.message + ";  " + oError.statusText;
					_errMsg = "Invalid Material";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");

				}

			});
		},
		//	************************ON Invoice Date Input Function***************************************
		//	*****************************************************************************************

		onEnterInvDate: function(oEvent) {
			var that = this;
			var tPExpdate = this.getView().byId("Inpexdat").getValue();
			//	var tPPermitdate = this.getView().byId("Inptpdat").getValue();
			var invdate = this.getView().byId("Inpinvdate").getValue();

			if (tPExpdate < invdate) {
				if (tPExpdate !== "") {
					this.getView().byId("Inpinvdate").focus();
					var _errMsg = " Invoice date should be less than equal to TP expiry Date ";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}
			}
		},
		//	************************ON Customer Input Function***************************************
		//	*****************************************************************************************

		onCustInput: function(oEvent) {
			var that = this;
			var customer = oEvent.getSource().getValue();
			var compcode = this.getView().byId("InpCompNam").getValue();
			var sls_org_cust = this.getView().byId("Inpslsorg").getValue();
			var dist_chan_cust = this.getView().byId("Combdistr").getSelectedKey();
			var div_cust = this.getView().byId("Combdiv").getSelectedKey();
			if (customer === "") {
				this.getView().byId("Inpcust").focus();
				var _errMsg = "Enter Customer";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			var odataModel = this.getView().getModel();
			var url = "/CustCheckSet(CompanyCode='" + compcode + "',Customer='" + customer + "',Vkorg='" + sls_org_cust + "',Vtweg='" +
				dist_chan_cust + "',Spart='" + div_cust + "')";
			//	var url = "/CustCheckSet(CompanyCode='" + compcode + "',Customer='" + customer + "')";
			//	var customerName = this.getView().byId("Inpcustname").getValue();
			// /sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV/CustCheckSet(Customer='12354NA' ,CompanyCode='5000')

			// this.showBusyIndicator();
			//	url="/MatGetSet(Matnr='103584',Vkorg='5001',Vtweg='11',Spart='11',Werks='1006',Customer='11358')";
			odataModel.read(url, {
				success: function(odata, oResponse) {
					if (oResponse.statusCode == 200 && odata.MsgType == "E") {
						that.getView().byId("Inpcustname").setValue("");
						var _errMsg = odata.Msg;
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
						return;
					}
					// that.hideBusyIndicator();
					that.getView().byId("Inpcustname").setValue(odata.CustName);

				},
				error: function(oError) {
					that.getView().byId("Inpcustname").setValue("");
					var _errMsg = oError.message;
					_errMsg = "Invalid Customer";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");

				}

			});
		},

		//	************************ON TP Permit Validation Function***************************************
		//	*****************************************************************************************

		onEnterTPPermit: function(oEvent) {
			var that = this;
			var tPPermit = this.getView().byId("Inptpnum").getValue();

			if (tPPermit === "") {

				this.getView().byId("Inptpnum").focus();
				var _errMsg = "Enter TP Permit Number";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
			}

		},

		//	************************ON TP Permit Date Validation Function***************************************
		//	*****************************************************************************************

		onEnterTPPermitDate: function(oEvent) {
			var that = this;
			var tPPermit = this.getView().byId("Inptpdat").getValue();

			if (tPPermit === "") {

				this.getView().byId("Inptpdat").focus();
				var _errMsg = "Enter TP Permit Date";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
			}

		},

		//	************************ON Expiry Date Input Function***************************************
		//	*****************************************************************************************

		onEnterExpdate: function(oEvent) {
			var that = this;
			var tPExpdate = this.getView().byId("Inpexdat").getValue();
			var tPPermitdate = this.getView().byId("Inptpdat").getValue();
			var invdate = this.getView().byId("Inpinvdate").getValue();

			if (tPExpdate >= tPPermitdate && tPExpdate >= invdate) {
				//Nothing to write here
			} else {
				this.getView().byId("Inpexdat").focus();
				var _errMsg = "TP Expiry date should always greater than equal to TP permit date and invoice date";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

		},
		//	************************ON Transporter Input Function***************************************
		//----------------------ON Open Document--------------------------------------//
		onOpend: function(oEvent) {
			that = this;
			var view = this.getView().sId + "--";
			var setkey = view + "__filter4";

			var oIconTabBar0 = that.getView().byId("__bar0");
			oIconTabBar0.fireSelect({
				key: setkey,
				item: oIconTabBar0.getItems()[0]
			});
			//oIconTabBar.setSelectedKey(setkey);

			var sDoc = that.getView().byId("InpSaleOrder").getValue();
			var iDoc = that.getView().byId("InpInvNo").getValue();
			var docketn = that.getView().byId("Inpdckt").getValue();
			iDoc = '';
			docketn = '';
			//If Sales Order is empty
			if (sDoc == "undefined") {
				var _errMsg = "Sale Order number is blank, So action cannot be processed.";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			//var val = oView.byId("LblSaleOrder").getValue();
			var vServiceUrl = "/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV";
			var oModel = new sap.ui.model.odata.v2.ODataModel(vServiceUrl, {
				defaultBindingMode: sap.ui.model.BindingMode.TwoWay
			});
			//this.getView().setModel(oModel);	
			//var url = "/InvCancelSet(SoDocno='" + sDoc + "',InvDocno='" + iDoc + "',DocketNum='" + docketn + "')";

			oModel.read("/InvCancelSet", {
				filters: [
					new sap.ui.model.Filter("SoDocno", sap.ui.model.FilterOperator.EQ, sDoc),
					new sap.ui.model.Filter("InvDocno", sap.ui.model.FilterOperator.EQ, iDoc),
					new sap.ui.model.Filter("DocketNum", sap.ui.model.FilterOperator.EQ, docketn)

				],
				success: function(odata, oResponse) {
					//	if (oResponse.statusCode == 200 && odata.MsgType == "E") {
					if (oResponse.statusCode == 200) {
						//var _errMsg = odata.Msg; && odata.results[0].MsgType == "E"
						var _errMsg = odata.results[0].Msg;
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.INFORMATION, "Information");
						return;
					}

				},
				error: function(oError) {
					var _errMsg = oError.message;
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");

				}

			});

		},

		//---------------------End Open DOcument-------------------------------------//

		//---------------------Re-Process Document-------------------------------------//
		onRpdocket: function(oEvent) {
			that = this;
			debugger;
			var view = this.getView().sId + "--";
			var setkey = view + "__filter4";
			var vData = that.getView().byId("table1").getModel().getProperty("/data");
			//var docIdVal = vData[iIndex].DocketNum;
			var oIconTabBar0 = that.getView().byId("__bar0");
			oIconTabBar0.fireSelect({
				key: setkey,
				item: oIconTabBar0.getItems()[0]
			});
			//oIconTabBar.setSelectedKey(setkey);

			/*	var sDoc = that.getView().byId("InpSaleOrder").getValue();
				var iDoc = that.getView().byId("InpInvNo").getValue();*/
			var sDoc = '';
			var iDoc = '';
			//var docketn = that.getView().byId("Inpdckt").getValue();
			v_docketnum = that.getView().byId("Inpdckt").getValue();
			//docketn = '2222';
			//v_docketnum = '1006J';
			//	sDoc = '';
			//this.getView().setModel(oModel);	
			//	var url = "/InvCancelSet(SoDocno='" + sDoc + "',InvDocno='" + iDoc + "',DocketNum='" + v_docketnum + "')";
			//	var url = "/InvCancelSet(InvDocno='" + iDoc + "',SoDocno='" + sDoc + "',DocketNum='" + docketn + "')";
			//var url1 = "/InvCancelSet(InvDocno='" + iDoc + "',SoDocno='"+ sDoc + "',DocketNum='"+ v_docketnum + "')";

			var vServiceUrl = "/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV";
			var oModel2 = new sap.ui.model.odata.v2.ODataModel(vServiceUrl, {
				defaultBindingMode: sap.ui.model.BindingMode.TwoWay
			});

			//	oModel2.read(url1, {
			oModel2.read("/InvCancelSet", {
				filters: [
					new sap.ui.model.Filter("SoDocno", sap.ui.model.FilterOperator.EQ, sDoc),
					new sap.ui.model.Filter("InvDocno", sap.ui.model.FilterOperator.EQ, iDoc),
					new sap.ui.model.Filter("DocketNum", sap.ui.model.FilterOperator.EQ, v_docketnum)

				],
				success: function(odata, oResponse) {
					//	if (oResponse.statusCode == 200 && odata.MsgType == "E") {
					if (oResponse.statusCode == 200) {
						//var _errMsg = odata.Msg; && odata.results[0].MsgType == "E"
						var _errMsg = odata.results[0].Msg;
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.INFORMATION, "Information");
						return;
					}

				},
				error: function(oError) {
					var _errMsg = oError.message;
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");

				}

			});

		},

		//---------------------End of Re-Process Document-------------------------------------//

		//------------------------Cancel Invoice-----------------------------------------//
		onCancelinv: function(oEvent) {
			that = this;
			debugger;
			var view = this.getView().sId + "--";
			var setkey = view + "__filter4";

			var oIconTabBar0 = that.getView().byId("__bar0");
			oIconTabBar0.fireSelect({
				key: setkey,
				item: oIconTabBar0.getItems()[0]
			});

			var sDoc = that.getView().byId("InpSaleOrder").getValue();
			var iDoc = that.getView().byId("InpInvNo").getValue();
			var docketn = that.getView().byId("Inpdckt").getValue();
			var sNum = that.getView().byId("InpShipment").getValue();
			sDoc = '';
			docketn = '';
			//If Empty Invoice number
			if (iDoc == '') {
				var _errMsg = "Invoice number is blank, So action cannot be processed.";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			var vServiceUrl = "/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV";
			var oModel1 = new sap.ui.model.odata.v2.ODataModel(vServiceUrl, {
				defaultBindingMode: sap.ui.model.BindingMode.TwoWay
			});
			//	var url = "/InvCancelSet(SoDocno='" + sDoc + "',InvDocno='" + iDoc + "',DocketNum='" + docketn + "')";
			oModel1.read("/InvCancelSet", {
				filters: [
					new sap.ui.model.Filter("SoDocno", sap.ui.model.FilterOperator.EQ, sDoc),
					new sap.ui.model.Filter("InvDocno", sap.ui.model.FilterOperator.EQ, iDoc),
					new sap.ui.model.Filter("DocketNum", sap.ui.model.FilterOperator.EQ, docketn)

				],
				success: function(odata, oResponse) {
					//	if (oResponse.statusCode == 200 && odata.MsgType == "E") {
					if (oResponse.statusCode == 200) {
						//var _errMsg = odata.Msg; && odata.results[0].MsgType == "E"
						var _errMsg = odata.results[0].Msg;
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.INFORMATION, "Information");
						return;
					}

				},
				error: function(oError) {
					var _errMsg = oError.message;
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");

				}

			});

		},

		//-----------------------End of Cancel Invoice----------------------------------//

		//	*****************************************************************************************

		onTransporterInput: function(oEvent) {
			var that = this;
			var transporter = this.getView().byId("Inptrpter").getValue();
			var compcode = this.getView().byId("InpCompNam").getValue();

			var odataModel = this.getView().getModel();
			var url = "/ValidateTransporterSet(CompanyCode='" + compcode + "',Transporter='" + transporter + "')";
			// /sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV/ValidateTransporterSet(CompanyCode='5000' ,Transporter='238777')
			if (transporter == "") {
				that.getView().byId("Inptrpternam").setValue("");
				return;
			}
			odataModel.read(url, {
				success: function(odata, oResponse) {
					// that.hideBusyIndicator();
					if (oResponse.statusCode == 200 && odata.MsgType == "E") {
						that.getView().byId("Inptrpternam").setValue("");
						var _errMsg = odata.Msg;
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
						return;

					} //end of If
					that.getView().byId("Inptrpternam").setValue(odata.TransporterName);

				},
				error: function(oError) {
					that.getView().byId("Inptrpternam").setValue("");
					var _errMsg = oError.message;
					_errMsg = "Invalid Transporter";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");

				}

			});
		},

		//	************************ON Cash Discount Validation Function***************************************
		//	*****************************************************************************************

		onEnterCash: function(oEvent) {
			var that = this;
			var cashDiscount = this.getView().byId("Inpcashdcnt").getValue();
			var cashDiscount = this.getView().byId("Inpcashdcnt").getValue();
			if (isNaN(cashDiscount)) {
				var _errMsg = "Input Cash Discount not valid";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			if (cashDiscount > 5) {

				this.getView().byId("Inpcashdcnt").focus();
				var _errMsg = "Cash Discount should be less than or equal To 5%";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

		},
		//	************************ON TruckNumber Validation Function***************************************
		//	*****************************************************************************************

		onTruckNumber: function(oEvent) {

			var TruckNumber = this.getView().byId("Inptrcknum").getValue();
			var iChars = "!@#$%^&*()+=-[]\\\';,./{}|\":<>?";

			for (var i = 0; i < TruckNumber.length; i++) {
				if (iChars.indexOf(TruckNumber.charAt(i)) != -1) {
					this.getView().byId("Inptrcknum").focus();
					// alert ("Your username has special characters. \nThese are not allowed.\n Please remove them and try again.");
					var _errMsg = "Truck Number-Enter Only Alpha Numeric Input";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}
			}

			this.getView().byId("Inptrcknum").setValue(TruckNumber.toUpperCase());
		},
		//	************************ON LRNumber Validation Function***************************************
		//	*****************************************************************************************

		onLRNumber: function(oEvent) {

			var lrNumber = this.getView().byId("Inplrnum").getValue();
			if (isNaN(lrNumber)) {
				this.getView().byId("Inplrnum").focus();
				var _errMsg = "LR Num-Enter Only Numeric Input";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
		},
		//	************************ON select Change Function***************************************
		//	*****************************************************************************************

		onSelectChanged: function(oEvent) {
			var that = this;
			var keys = oEvent.getParameters().key.split("-")[2];
			// On first tabstrip Invoice
			if (keys === "__filter0") {
				//Plant Validation
				/*	var plant1 = this.getView().byId("Combplant").getSelectedKey();
					if (plant1 === "") {
						//	this.getView().byId("Combplant").focus();

						var _errMsg = "Plant can not be blank";
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
						return;
					}*/
				var lrnum = that.getView().byId("Inplrnum").getValue();
				if (lrnum !== "") {
					var setkey0 = view + "__filter1";
					var oIconTabBar0 = that.getView().byId("__bar0");
					if (isNaN(lrnum)) {
						oIconTabBar0.fireSelect({
							key: setkey0,
							item: oIconTabBar0.getItems()[0]
						});
						oIconTabBar0.setSelectedKey(setkey0);
						var _errMsg = "LR Num-Enter Only Numeric Input";
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
						return;
					}
				} //end of lrnum validation
			} // end of filter0
			//On 2nd Tabstrip Transport
			if (keys === "__filter1") {
				setkey = view + "__filter0";
				var oIconTabBar = that.getView().byId("__bar0");
				//Plant Validation
				var plant1 = this.getView().byId("Combplant").getSelectedKey();
				if (plant1 === "") {
					//	this.getView().byId("Combplant").focus();
					oIconTabBar.fireSelect({
						key: setkey,
						item: oIconTabBar.getItems()[0]
					});
					oIconTabBar.setSelectedKey(setkey);
					var _errMsg = "Plant can not be blank";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}

				//company code validation
				var compcode = this.getView().byId("InpCompNam").getValue();
				if (compcode === "") {
					this.getView().byId("InpCompNam").focus();
					var _errMsg = "Company Code can not be blank";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}
				//Plant name validation
				var plantname = this.getView().byId("Inpplntnam").getValue();
				if (plantname === "") {
					this.getView().byId("Inpplntnam").focus();
					var _errMsg = "Plant name can not be blank";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}

				//invoice date validation
				var invdate = this.getView().byId("Inpinvdate").getValue();
				if (invdate === "") {

					this.getView().byId("Inpinvdate").focus();
					oIconTabBar.fireSelect({
						key: setkey,
						item: oIconTabBar.getItems()[0]
					});
					oIconTabBar.setSelectedKey(setkey);
					var _errMsg = "invoice date can not be blank";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}

				//Customer validation

				var customer = this.getView().byId("Inpcust").getValue();
				if (customer === "") {
					this.getView().byId("Inpcust").focus();
					oIconTabBar.fireSelect({
						key: setkey,
						item: oIconTabBar.getItems()[0]
					});
					oIconTabBar.setSelectedKey(setkey);
					var _errMsg = "Customer can not be blank";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}
				//TP/permit Number validation
				var tPPermitNum = this.getView().byId("Inptpnum").getValue();
				if (tPPermitNum === "") {
					this.getView().byId("Inptpnum").focus();
					oIconTabBar.fireSelect({
						key: setkey,
						item: oIconTabBar.getItems()[0]
					});
					oIconTabBar.setSelectedKey(setkey);
					var _errMsg = "TP/Permit Number can not be blank";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}

				//Sales org validation

				var salesOrg = this.getView().byId("Inpslsorg").getValue();
				if (salesOrg === "") {
					this.getView().byId("Inpslsorg").focus();
					oIconTabBar.fireSelect({
						key: setkey,
						item: oIconTabBar.getItems()[0]
					});
					oIconTabBar.setSelectedKey(setkey);
					var _errMsg = "Sales Organization can not be blank";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}

				//Distribution Channel validation
				var distrchn = this.getView().byId("Combdistr").getSelectedKey();
				if (distrchn === "") {
					//	this.getView().byId("Combdistr").focus();
					oIconTabBar.fireSelect({
						key: setkey,
						item: oIconTabBar.getItems()[0]
					});
					oIconTabBar.setSelectedKey(setkey);
					var _errMsg = "Distribution Channel can not be blank";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}

				//Division validation
				var division = this.getView().byId("Combdiv").getSelectedKey();
				if (division === "") {
					//this.getView().byId("Combdiv").focus();
					oIconTabBar.fireSelect({
						key: setkey,
						item: oIconTabBar.getItems()[0]
					});
					oIconTabBar.setSelectedKey(setkey);
					var _errMsg = "Division can not be blank";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}

				//TP Permit Date validation
				var tPPermitDate = this.getView().byId("Inptpdat").getValue();
				if (tPPermitDate === "") {
					this.getView().byId("Inptpdat").focus();
					oIconTabBar.fireSelect({
						key: setkey,
						item: oIconTabBar.getItems()[0]
					});
					oIconTabBar.setSelectedKey(setkey);
					var _errMsg = "TP/Permit Date can not be blank";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}

				//TP Expiry Date validation
				var tPExpDate = this.getView().byId("Inpexdat").getValue();
				if (tPExpDate === "") {
					this.getView().byId("Inpexdat").focus();
					oIconTabBar.fireSelect({
						key: setkey,
						item: oIconTabBar.getItems()[0]
					});
					oIconTabBar.setSelectedKey(setkey);
					var _errMsg = "TP/Expiry Date can not be blank";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}

				var cashDiscount = this.getView().byId("Inpcashdcnt").getValue();
				if (cashDiscount !== "") {
					if (isNaN(cashDiscount)) {
						oIconTabBar.fireSelect({
							key: setkey,
							item: oIconTabBar.getItems()[0]
						});
						oIconTabBar.setSelectedKey(setkey);
						var _errMsg = "Input Cash Discount not valid";
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
						return;
					}
				}
				//Start of Code for Truck type dropdown
				var odataModeltr = this.getView().getModel();
				//Setting trucktype values based on Plant value
				var filtervalue = v_Plant;
				odataModeltr.read("/TruckTypeSet", {
					filters: [
						new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, filtervalue)
					],
					success: function(oData, oResponse) {
						var aFiltersComboBoxData = oResponse.data.results;
						var oJModeltr3 = new sap.ui.model.json.JSONModel();
						oJModeltr3.setData(aFiltersComboBoxData);
						that.getView().byId("Combtrcktyp").setModel(oJModeltr3, "namedmodel");
						that.getView().byId("Combtrcktyp").setSelectedKey(v_TruckType);

					},
					error: function(oError) {} //end of error
				});
				//that.getView().byId("Combtrcktyp").setSelectedKey(v_TruckType);
				//end of code
				//that.getView().byId("__filter1").setEnabled(true);
			} //endif __filter1
			/* {
				this.getView().byId("Inpexdat").focus();
				var _errMsg = "TP Expiry date should always greater than equal to TP permit date and invoice date";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
			}*/

		},

		//	************************On EnterInvoice tab Function**************************************
		//	*************************************************************************************
		onEnterInvoice: function(oEvent) {
			var that = this;
			//Plant Validation
			var plant1 = this.getView().byId("Combplant").getSelectedKey();
			if (plant1 === "") {
				//	this.getView().byId("Combplant").focus();
				var _errMsg = "Plant can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			//company code validation
			var compcode = this.getView().byId("InpCompNam").getValue();
			if (compcode === "") {
				this.getView().byId("InpCompNam").focus();
				var _errMsg = "Company Code can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			//Plant name validation
			var plantname = this.getView().byId("Inpplntnam").getValue();
			if (plantname === "") {
				this.getView().byId("Inpplntnam").focus();
				var _errMsg = "Plant name can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			//invoice date validation
			var invdate = this.getView().byId("Inpinvdate").getValue();
			if (invdate === "") {
				this.getView().byId("Inpinvdate").focus();
				var _errMsg = "invoice date can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			//Customer validation
			var customer = this.getView().byId("Inpcust").getValue();
			if (customer === "") {
				this.getView().byId("Inpcust").focus();
				var _errMsg = "Customer can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			//TP/permit Number validation
			var tPPermitNum = this.getView().byId("Inptpnum").getValue();
			if (tPPermitNum === "") {
				this.getView().byId("Inptpnum").focus();
				var _errMsg = "TP/Permit Number can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			//Sales org validation
			var salesOrg = this.getView().byId("Inpslsorg").getValue();
			if (salesOrg === "") {
				this.getView().byId("Inpslsorg").focus();
				var _errMsg = "Sales Organization can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			//Distribution Channel validation
			var distrchn = this.getView().byId("Combdistr").getSelectedKey();
			if (distrchn === "") {
				//	this.getView().byId("Combdistr").focus();
				var _errMsg = "Distribution Channel can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			//Division validation
			var division = this.getView().byId("Combdiv").getSelectedKey();
			if (division === "") {
				//this.getView().byId("Combdiv").focus();
				var _errMsg = "Division can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			//TP Permit Date validation
			var tPPermitDate = this.getView().byId("Inptpdat").getValue();
			if (tPPermitDate === "") {
				this.getView().byId("Inptpdat").focus();
				var _errMsg = "TP/Permit Date can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			//TP Expiry Date validation
			var tPExpDate = this.getView().byId("Inpexdat").getValue();
			if (tPExpDate === "") {
				this.getView().byId("Inpexdat").focus();
				var _errMsg = "TP/Expiry Date can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			that.getView().byId("__filter1").setEnabled(true);

		},

		//	************************Add Item Function***************************************
		//	*****************************************************************************
		onItemAdd: function() {
			that = this;
			//Header Data Validations
			var plant1 = this.getView().byId("Combplant").getSelectedKey();
			if (plant1 === "") {
				//	this.getView().byId("Combplant").focus();
				var _errMsg = "Plant can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			//company code validation
			var compcode = this.getView().byId("InpCompNam").getValue();
			if (compcode === "") {
				this.getView().byId("InpCompNam").focus();
				var _errMsg = "Company Code can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			//Plant name validation
			var plantname = this.getView().byId("Inpplntnam").getValue();
			if (plantname === "") {
				this.getView().byId("Inpplntnam").focus();
				var _errMsg = "Plant name can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			//invoice date validation
			var invdate = this.getView().byId("Inpinvdate").getValue();
			if (invdate === "") {
				this.getView().byId("Inpinvdate").focus();
				var _errMsg = "invoice date can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			//Customer validation

			var customer = this.getView().byId("Inpcust").getValue();
			if (customer === "") {
				this.getView().byId("Inpcust").focus();
				var _errMsg = "Customer can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			//TP/permit Number validation
			var tPPermitNum = this.getView().byId("Inptpnum").getValue();
			if (tPPermitNum === "") {
				this.getView().byId("Inptpnum").focus();
				var _errMsg = "TP/Permit Number can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			//Sales org validation

			var salesOrg = this.getView().byId("Inpslsorg").getValue();
			if (salesOrg === "") {
				this.getView().byId("Inpslsorg").focus();
				var _errMsg = "Sales Organization can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			//Distribution Channel validation

			var distrchn = this.getView().byId("Combdistr").getSelectedKey();
			if (distrchn === "") {
				//	this.getView().byId("Combdistr").focus();
				var _errMsg = "Distribution Channel can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			//Division validation

			var division = this.getView().byId("Combdiv").getSelectedKey();
			if (division === "") {
				//this.getView().byId("Combdiv").focus();
				var _errMsg = "Division can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			//TP Permit Date validation

			var tPPermitDate = this.getView().byId("Inptpdat").getValue();
			if (tPPermitDate === "") {
				this.getView().byId("Inptpdat").focus();
				var _errMsg = "TP/Permit Date can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			//TP Expiry Date validation

			var tPExpDate = this.getView().byId("Inpexdat").getValue();
			if (tPExpDate === "") {
				this.getView().byId("Inpexdat").focus();
				var _errMsg = "TP/Expiry Date can not be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			//TP Expiry Date against inv date and TP permit date
			var tPExpdate = this.getView().byId("Inpexdat").getValue();
			var tPPermitdate = this.getView().byId("Inptpdat").getValue();
			var invdate = this.getView().byId("Inpinvdate").getValue();

			if (tPExpdate >= tPPermitdate && tPExpdate >= invdate) {

			} else {
				this.getView().byId("Inpexdat").focus();
				var _errMsg = "TP Expiry date should always greater than equal to TP permit date and invoice date";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			var cashDiscount = this.getView().byId("Inpcashdcnt").getValue();
			if (cashDiscount !== "") {
				if (isNaN(cashDiscount)) {
					var _errMsg = "Input Cash Discount not valid";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}
			}
			var lrNumber = this.getView().byId("Inplrnum").getValue();
			if (lrNumber !== "") {
				if (isNaN(lrNumber)) {
					var _errMsg = "LR Num-Enter Only Numeric Input";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}
			}

			// Transporter and Truck Number validation
			var transporter = this.getView().byId("Inptrpter").getValue();
			var trucknumber = this.getView().byId("Inptrcknum").getValue();
			if (transporter !== "" && trucknumber == "") {
				var _errMsg = "Enter Truck Number for the Transporter";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			if (transporter == "" && trucknumber !== "") {
				var _errMsg = "Enter  Transporter for the Truck Number";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			// Get the values of the header input fields
			// Get the values of the input fields.
			var mat = this.getView().byId("InpMatcode1").getValue();
			var matdesc = this.getView().byId("InpMatdesc1").getValue();
			var brand = this.getView().byId("InpBrand1").getValue();
			var pack = this.getView().byId("InpPack1").getValue();
			var umren = this.getView().byId("InpUmren").getValue();
			var qty = this.getView().byId("InpQty1").getValue();
			/*	if (qty !==0){
					
				qty = qty + ".000"	;
				} */
			var uom = this.getView().byId("combuom1").getValue();
			if (uom === "Cases") {
				uom = "CS";
			} else if (uom === "Each") {
				uom = "EA";
			}
			if (mat !== "" && qty !== "" && uom !== "") {

				// Push this entry into array and bind it to the table
				var itemRow = {
					MaterialCode: mat,
					MaterialDesc: matdesc,
					Brand: brand,
					Pack: pack,
					Quantity: qty,
					Uom: uom,
					Umren: umren
				};
				//var oModel1 = this.getView().byId("table1").getModel();
				var oJModel = this.getView().byId("table1").getModel();
				var itemData = oJModel.getProperty("/data");

				if (typeof itemData !== "undefined" && itemData !== null && itemData.length > 0) {
					var oTablematval = this.getView().byId("table1");
					//material validation for the table
					var oModelmatval = oTablematval.getModel();

					var aRowsmatval = oModelmatval.getData().data;
					for (var imatval = 0; imatval < aRowsmatval.length; imatval++) {
						if (mat === aRowsmatval[imatval].MaterialCode) {
							var _errMsg = "Material already existed " + mat;
							sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
							return;
						}
					}
					// Append the data using .push
					itemData.push(itemRow);
				} else {
					itemData = [];
					//	Append empty row
					itemData.push(itemRow);

				}

				// Set Model
				/*
				oJModel.attachRequestCompleted(function() {
				   oJModel.setData(itemData, true);
				}); */
				//oJModel.refresh(true);
				oJModel.setData({
					data: itemData
				});

				oJModel.refresh(true);
				// Clear the input fields.
				this.getView().byId("InpMatcode1").setValue("");
				this.getView().byId("InpMatdesc1").setValue("");
				this.getView().byId("InpBrand1").setValue("");
				this.getView().byId("InpPack1").setValue("");

				var v_qty_add = Math.abs(this.getView().byId("InpQty1").getValue());
				v_qty_add = Math.abs(v_qty_add);
				var b_case = Math.abs(this.getView().byId("InpUmren").getValue());
				b_case = Math.abs(b_case);
				//	var v_qty1 = Math.floor(this.getView().byId("Txt1").getValue());
				if (uom == "EA") {
					if (b_case !== 0) {
						v_qty_add = (v_qty_add / b_case);
					}

				} //End of Each
				//	v_qty_add = Math.abs(v_qty_add);
				v_total_qty = Math.abs(v_total_qty);
				v_total_qty = v_total_qty + v_qty_add;
				//	v_total_qty = v_total_qty.toFixed(3);
				//	calling add qty function
				that.onAddqty();
				this.getView().byId("Txt1").setValue(v_total_qty);
				this.getView().byId("InpQty1").setValue("");

			} else {
				//	MessageBox.show("Material/Quantity/UOM cannot be blank");
				var _errMsg = "Material/Quantity/UOM cannot be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ZDLT_UI5_DIS_INV_REQ.view.Edit_view
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ZDLT_UI5_DIS_INV_REQ.view.Edit_view
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ZDLT_UI5_DIS_INV_REQ.view.Edit_view
		 */
		//	onExit: function() {
		//
		//	}

		//	************************Submit Function***************************************
		//	******************************************************************************
		onSubmit: function() {
			that = this;
			var cashDiscount = this.getView().byId("Inpcashdcnt").getValue();
			if (cashDiscount !== "") {
				if (isNaN(cashDiscount)) {
					var _errMsg = "Input Cash Discount not valid";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}
			}
			//ra1vi2 token
			if (this.getView().byId("idToken").getVisible() && !this.getView().byId("idToken").getValue() && this.getView().byId("idToken").getEnabled()) {
				var _errMsg = "Please Provide Token Number";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			//ra1vi2 token
			var lrNumber = this.getView().byId("Inplrnum").getValue();
			if (lrNumber !== "") {
				if (isNaN(lrNumber)) {
					var _errMsg = "Enter only Numeric Input";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}
			}
			// Transporter and Truck Number validation
			var transporter = this.getView().byId("Inptrpter").getValue();
			var trucknumber = this.getView().byId("Inptrcknum").getValue();
			if (transporter !== "" && trucknumber == "") {
				var _errMsg = "Enter Truck Number for the Transporter";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			if (transporter == "" && trucknumber !== "") {
				var _errMsg = "Enter  Transporter for the Truck Number";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			//Create all the records added to table via Json model
			var oTable = this.getView().byId("table1");

			// Get the table Model
			var oModel1 = oTable.getModel();

			// Get Items of the Table
			var aItems = oModel1.getData().data; //oTable.getItems();
			if (typeof aItems == "undefined") {
				var _errMsg = "Item data can not be empty";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			// Define an empty Array
			var itemData = [];

			for (var iRowIndex = 0; iRowIndex < aItems.length; iRowIndex++) {
				var l_material = oModel1.getProperty("MaterialCode", aItems[iRowIndex]);
				var l_matdesc = oModel1.getProperty("MaterialDesc", aItems[iRowIndex]);
				var l_brand = oModel1.getProperty("Brand", aItems[iRowIndex]);
				var l_pack = oModel1.getProperty("Pack", aItems[iRowIndex]);
				var l_quantity = oModel1.getProperty("Quantity", aItems[iRowIndex]);
				var l_uom = oModel1.getProperty("Uom", aItems[iRowIndex]);
				var l_batchqty = oModel1.getProperty("BatchQuantity", aItems[iRowIndex]);
				if (l_batchqty == undefined) {
					l_batchqty = "0";
				}
				if (l_uom === "Cases") {
					l_uom = "CS";
				} else if (l_uom === "Each") {
					l_uom = "EA";
				}
				//sloc/batch qty and qty validation
				if (l_batchqty > l_quantity) {
					_errMsg = "Entered  qty should not be less than Sloc qty for the material " + l_material;
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}

				if (l_material !== null) {
					itemData.push({
						MaterialCode: l_material,
						MaterialDesc: l_matdesc,
						Brand: l_brand,
						Pack: l_pack,
						Quantity: l_quantity,
						Uom: l_uom,
						BatchQuantity: l_batchqty
					});
				}
			} //end of forloop for item material data

			var oTable1 = this.getView().byId("table2");

			// Get the table Model
			var oModel2 = oTable1.getModel();

			// Get Items of the batch Table
			var chck = oModel2.getData();
			if (chck !== null) {
				var aItems1 = oModel2.getData().data; //oTable.getItems();
				if (typeof aItems1 !== "undefined") {
					/*	var _errMsg = "Item data can not be empty";
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error"); 
						return; 
					} */

					// Define an empty Array
					var itemData1 = [];
					var qty_valid = "";
					var batqty1 = "";
					for (var iRowIndex1 = 0; iRowIndex1 < aItems1.length; iRowIndex1++) {
						var l_material1 = oModel2.getProperty("MaterialCode", aItems1[iRowIndex1]);
						var l_matdesc1 = oModel2.getProperty("MaterialDesc", aItems1[iRowIndex1]);

						var l_quantity1 = oModel2.getProperty("Quantity", aItems1[iRowIndex1]);

						var l_sloc1 = oModel2.getProperty("Sloc", aItems1[iRowIndex1]);

						var l_slocquantity1 = oModel2.getProperty("BatchQty", aItems1[iRowIndex1]);
						var l_stock1 = oModel2.getProperty("Slocstock", aItems1[iRowIndex1]);

						if (l_material1 !== "" && l_matdesc1 !== "") {
							qty_valid = Math.abs(l_quantity1);
							batqty1 = Math.abs(l_slocquantity1);
						}
						if (l_matdesc1 !== "") {
							//Storage location qty against Qty validation
							var batqty2 = 0;
							batqty2 = Math.abs(batqty2);
							var ibval = iRowIndex1 + 1;
							var batqtytmp1 = Math.abs(l_slocquantity1);
							var stock_valid = Math.abs(l_stock1);
							if (batqtytmp1 > l_stock1) {
								_errMsg = "Entered Sloc qty should not be greater than Sloc stock for the material " + l_material1;
								sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
								return;
							}
							for (ibval; ibval <= aItems1.length; ibval++) {
								var batmat = oModel2.getProperty("MaterialDesc", aItems1[ibval]);
								var sloc_stock_valid = oModel2.getProperty("Slocstock", aItems1[ibval]);
								sloc_stock_valid = Math.abs(sloc_stock_valid);
								/*	if(batmat == null){
										batmat = "";
									}*/
								if (batmat !== "") {
									ibval = aItems1.length + 1;
								} else {

									var batqtytmp = oModel2.getProperty("BatchQty", aItems1[ibval]);
									var batqtytmp1 = Math.abs(batqtytmp);
									if (batqtytmp1 > sloc_stock_valid) {
										_errMsg = "Entered Sloc qty should not be greater than Sloc stock for the material " + l_material1;
										sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
										return;
									}
									batqty2 = batqty2 + batqtytmp1;
								}

							} //end of for loop of batmat
							var batqty = batqty1 + batqty2;
							//qty valid is material qty; batqty is of total storage loc enter qty
							if (qty_valid < batqty) {
								_errMsg = "Entered Sloc qty should not be more than Item Quantity for the material " + l_material1;
								sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
								return;
							}
						}

						/*		var l_uom1 = oModel1.getProperty("Uom", aItems[iRowIndex1]); //.getBindingContext());
								if (l_uom1 === "Cases") {
									l_uom1 = "CS";
								} else if (l_uom1 === "Each") {
									l_uom1 = "EA";
								} */
						var l_invid1 = "12345";
						var l_botcase1 = oModel1.getProperty("Umren", aItems1[iRowIndex1]);
						if (l_material1 !== null) {
							itemData1.push({
								InvId: l_invid1,
								MaterialCode: l_material1,
								Item: " ",
								MaterialDesc: l_matdesc1,
								BatchNo: "",
								Quantity: l_quantity1,
								BatchQty: l_slocquantity1,
								Status: "0",
								Sloc: l_sloc1,

								Slocstock: l_stock1,
								//	Quantity1: l_quantity1,
								//	Uom: l_uom1,
								Umren: l_botcase1
							});
						}
					}

				} //end of undefine
			} //end of check

			// Get the values of the header input fields

			// Create one emtpy Object
			var oEntry1 = {};

			oEntry1.InvId = "12345";
			var invdate = this.getView().byId("Inpinvdate").getValue();
			oEntry1.InvDate = invdate + "T00:00:00"; //	oEntry1.InvDate = "2019-12-05T00:00:00";
			oEntry1.DocketNum = this.getView().byId("Inpdckt").getValue();
			oEntry1.Plant = v_Plant;
			oEntry1.PlantName = this.getView().byId("Inpplntnam").getValue();
			oEntry1.DistributChanId = this.getView().byId("Combdistr").getSelectedKey();
			oEntry1.DivisionId = this.getView().byId("Combdiv").getSelectedKey();
			oEntry1.Customer = this.getView().byId("Inpcust").getValue();
			oEntry1.TpPermitNum = this.getView().byId("Inptpnum").getValue();

			oEntry1.TokenNo = this.getView().byId("idToken").getValue(); //ra1vi2

			var perdate = this.getView().byId("Inptpdat").getValue();
			if (perdate !== "") {
				oEntry1.TpPermitDate = perdate + "T00:00:00";
			}
			var expdate = this.getView().byId("Inpexdat").getValue();
			if (expdate !== "") {
				oEntry1.ExpDate = expdate + "T00:00:00";
			}

			oEntry1.Transporter = this.getView().byId("Inptrpter").getValue();
			oEntry1.TruckNumber = this.getView().byId("Inptrcknum").getValue();
			oEntry1.LrNumber = this.getView().byId("Inplrnum").getValue();
			oEntry1.TruckType = this.getView().byId("Combtrcktyp").getSelectedKey();
			oEntry1.MilkRun = this.getView().byId("Combmilkrun").getSelectedKey();

			oEntry1.CashDiscount = this.getView().byId("Inpcashdcnt").getValue();
			//	oEntry1.HisId = "";
			oEntry1.Remarks = this.getView().byId("Inpremarks").getValue();

			//	oEntry1.Status = "";
			//	oEntry1.RequestType = "";

			oEntry1.SalesOrganization = this.getView().byId("Inpslsorg").getValue();
			oEntry1.SalesGrp = this.getView().byId("Combslsgrp").getSelectedKey();

			oEntry1.CustName = this.getView().byId("Inpcustname").getValue();

			oEntry1.TrpName = this.getView().byId("Inptrpternam").getValue();
			oEntry1.OrderNum = this.getView().byId("Inpordnum").getValue();
			oEntry1.TpOrderNum = this.getView().byId("Inptrpordnum").getValue();

			var tporddate = this.getView().byId("Inptrporddate").getValue();
			if (tporddate !== "") {
				oEntry1.TpOrderDate = tporddate + "T00:00:00";
			}
			oEntry1.ExpNum = this.getView().byId("Inpexpnum").getValue();

			var exporddate = this.getView().byId("Inpexporddat").getValue();
			if (exporddate !== "") {
				oEntry1.ExpOrdDate = exporddate + "T00:00:00";
			}
			v_Pricelist = this.getView().byId("Combprclst").getSelectedKey();
			oEntry1.Pricelist = this.getView().byId("Combprclst").getSelectedKey(); // temp comment
			/*
			oEntry1.EmpCode = "";
			oEntry1.BimId = "";
	
		oEntry1.ArrvDt = "";
			oEntry1.UnldcmnceDt = "";
			oEntry1.UnldcmpldDt = "";
			oEntry1.GraNo = "";
			oEntry1.GraDt = "";
			oEntry1.ExciseCh = "";
			oEntry1.ExciseDt = "";
			oEntry1.VendCh = "";
			oEntry1.VendDt = "";
			oEntry1.Haltrate = "";
			oEntry1.EvcDt = "";
			oEntry1.EvcNo = "";
			oEntry1.AcctDt = "";
			oEntry1.DocketCrtdt = "";
			oEntry1.PlacementNo = "";
			oEntry1.MasterinvoiceNumber = ""; */

			//Using Deep entity the data is posted as shown below .
			// Link  items to the  header
			// Very very Important. Here the name should be exactly like the Entity Set at Backend OData
			// DcktInvNavItem is the same name at back end
			//	oEntry1.SoDocNo = "";
			oEntry1.DcktEditNavItem = itemData;
			if (itemData1.length > 0) {
				oEntry1.DcktEditNavBat = itemData1;
			}

			//Set the Model and call the .create function to call the OData Service.
			//	var oModel1 = new sap.ui.model.odata.ODataModel("http://sapbwdev02.corp.usl.in:8020/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV");
			var oModel1 = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV");

			this.getView().setModel(oModel1);

			oModel1.setHeaders({
				"X-Requested-With": "X"
			});
			//DcktInvDstlSet  DcktInvNavItem
			oModel1.create("/DcktInvEditSet", oEntry1, {

				success: function(oData, oResponse) {
					//alert("The backend SAP System is Connected Successfully");
					that.getView().byId("Combtrcktyp").setSelectedKey(v_TruckType);
					that.getView().byId("Combprclst").setSelectedKey(v_Pricelist);
					that.getView().byId("Combplant").setSelectedKey(v_Plant);
					if (oResponse.statusCode == 201 && oData.MsgType == "E") {
						var _errMsg = oData.Msg;
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
						return;
					}
					var successObj = oResponse.data.DocketNum;
					var message = "Docket Number : " + successObj + "  " + "updated successfully";

					jQuery.sap.require("sap.m.MessageBox");

					sap.m.MessageBox.show(message, {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Docket number Update Status",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							that.getOwnerComponent().getRouter().navTo("Main_View");

						}
					});

					//	that.getOwnerComponent().getRouter().navTo("");

				},
				error: function(oError) {
					/*var _errMsg = "Failure - OData Service could not be called.";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;*/
					var _errMsg = oError.message + ";  " + oError.statusText;
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;

				}
			});

		}, // end of submit
		onAddqty: function(oEvent) {
			//that = this;
			var oTableAdd = this.getView().byId("table1");

			// Get the table Model
			var oModelAdd = oTableAdd.getModel();

			// Get Items of the Table
			var aItemsAdd = oModelAdd.getData().data; //oTable.getItems();
			v_total_qty = 0;
			for (var iadd = 0; iadd < aItemsAdd.length; iadd++) {

				var v_qty_add = Math.abs(aItemsAdd[iadd].Quantity);
				var v_bot_case = Math.abs(aItemsAdd[iadd].Umren);
				if ((aItemsAdd[iadd].Uom) == "EA") {
					if (v_bot_case !== 0) {
						v_qty_add = v_qty_add / v_bot_case;

					} //endif v_bot
				}

				v_total_qty = v_total_qty + v_qty_add;

			} //end of for iadd
			v_total_qty = v_total_qty.toFixed(3);
			//	that.getView().byId("Txt1").setValue(v_total_qty);
		}, //end of onAddqty
		//Qtychange
		onQtyChange: function(oEvent) {

			this.onAddqty(oEvent);
			this.getView().byId("Txt1").setValue(v_total_qty);
		}, //end of qty change
		onCancel: function() {
			this.getOwnerComponent().getRouter().navTo("Main_View");
		},
		onPressSaveFileButton: function(oEvent) {
			BusyIndicator.show();
			var sThis = this;
			var oUploader = this.byId("idTokenFileUploader");

			//validate required fields
			if (!this.byId("idForm38Input").getValue()) {
				this.byId("idForm38Input").setValueState("Error");
				this.byId("idForm38Input").setValueStateText("Please provide value for Form 38");
				BusyIndicator.hide();
				return;
			}
			if (!oUploader.getValue()) {
				MessageToast.show("Please Choose any File");
				BusyIndicator.hide();
				return;
			}

			var sInvoiceNo = this.getView().byId("InpInvNo").getValue();
			var sDocketNo = this.getView().byId("Inpdckt").getValue();
			var sForm38 = this.byId("idForm38Input").getValue();
			var sFileName = oUploader.getProperty("value");
			//upload

			oUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "slug",
				value: sInvoiceNo + "," + sForm38 + "," + sDocketNo + "," + sFileName
			}));
			var sToken = sThis.getView().getModel().getSecurityToken();
			oUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "x-csrf-token",
				value: sToken
			}));

			oUploader.setSendXHR(true);
			oUploader.setUploadUrl("/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV/From38fileSet");
			oUploader.upload();
		},
		onBeforeUploadStart: function() {
			//set the upload url 
			//uploader.setUploadUrl(/sap/fileSet(key=value)/$value
		},
		onUploadComplete: function() {
			//handle upload complete here 
			MessageToast.show("File Upload Completed");
			BusyIndicator.hide();
			this.getOwnerComponent().getRouter().navTo("Main_View");
		},
		onPressDownloadAttachment: function() {
			var sInvoiceNo = this.getView().byId("InpInvNo").getValue();
			var sURL = "/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV/From38fileSet('" + sInvoiceNo + "')/$value";
			window.open(sURL.trim(), "_blank");
		}
	});

});