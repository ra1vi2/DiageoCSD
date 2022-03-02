sap.ui.define([
	"sap/ui/core/mvc/Controller",
	//"sap/ui/core/mvc/Controller", 
	//	"sap/ui/model/json/JSONModel",
	//	'jquery.sap.global',
	//JSONModel,
	"sap/ui/core/format/DateFormat",
	"sap/m/MessageBox",
	"sap/ui/core/BusyIndicator",
	"sap/ui/model/json/JSONModel"
], function(Controller, DateFormat, MessageBox, BusyIndicator, JSONModel) {
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
	var setkey = "";
	var oIconTabBar = "";
	var v_total_qty = "";
	var view = "";

	return Controller.extend("ZDLT_UI5_DIS_INV.controller.Main_view", {
		//	************************On Init Function***************************************
		//	*****************************************************************************
		onInit: function() {
			that = this;
			view = this.getView().sId + "--"; //__xmlview0--
			oJModel = new sap.ui.model.json.JSONModel();
			this.getView().byId("table1").setModel(oJModel);
			var oDateFormatinit = DateFormat.getDateInstance({
				source: {
					pattern: "timestamp"
				},
				pattern: "yyyy-MM-dd" //"dd/MM/yyyy"
			});
			var iinit = 0;
			var dateinit = new Date();
			var dateinv = (new Date(dateinit)).getTime() - (iinit % 10 * 4 * 24 * 60 * 60 * 1000);
			dateinv = oDateFormatinit.format(new Date(dateinit));
			this.getView().byId("Inpinvdate").setValue(dateinv);
			//	var vServiceUrl = "http://sapbwdev02.corp.usl.in:8020/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV";
			var vServiceUrl = "/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV";
			var oModel = new sap.ui.model.odata.v2.ODataModel(vServiceUrl, {
				defaultBindingMode: sap.ui.model.BindingMode.TwoWay
			});
			//	var oModel = new sap.ui.model.odata.v2.ODataModel();
			//Disable invoice tab and transport tab
			/*	this.getView().byId("__filter1").setEnabled(false);*/
			/*	this.getView().byId("__filter0").setEnabled(false); */
			this.getView().setModel(oModel);
			this.getView().setModel(new JSONModel(), "this");

			this.getView().getModel("this").setProperty("/IsCSDTokenFieldsVisible", false);

			var url1 = "/GetPlantsSet";
			oModel.read(url1, {
				success: function(odata, oResponse) {
					//if (odata.results.length === 1) { //Commented on 21st July 2021
					that.getView().byId("Combplant").setSelectedKey(odata.results[0].Plant);
					that.getView().getModel("this").setProperty("/TokenInd", odata.results[0].TokenInd);
					that.getView().getModel("this").setProperty("/TruckInd", odata.results[0].TruckInd);
					//-------------Added by Ramesh 23rd July---------------------//
					var plant = odata.results[0].Plant;

					var url = "/SalesOrgSet(Werks='" + plant + "')";
					oModel.read(url, {
						success: function(odata, oResponse) {

							that.getView().byId("Inpslsorg").setValue(odata.Vkorg);
							that.getView().byId("InpCompNam").setValue(odata.Bukrs);
							that.getView().byId("Inpplntnam").setValue(odata.Name1);

							oModel.read("/TruckTypeSet", {
								filters: [new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant)],
								success: function(oData, oResponse) {
									var aFiltersComboBoxData = oResponse.data.results;
									var oJModel3 = new sap.ui.model.json.JSONModel();
									oJModel3.setData(aFiltersComboBoxData);
									that.getView().byId("Combtrcktyp").setModel(oJModel3, "namedmodel");
								},
								error: function(oError) {
									var _errMsg1 = JSON.parse(oError.response.body).error.message.value;
									sap.m.MessageBox.show(_errMsg1, sap.m.MessageBox.Icon.ERROR, "Error");
								}
							});
						},
						error: function(oError) {

							var _errMsg = JSON.parse(oError.response.body).error.message.value;
							sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");

						}

					});

					//-----------end by Ramesh 23rd July-----------------------//

					//} //Commented on 21st July 2021
					/*
										if (odata.PlantType !== "DE") {
						that.getView().byId("Combprclst").setEnabled(false);
					} else {

						that.getView().byId("Combprclst").setEnabled(true);

					} */
				},
				error: function(oError) {
					var message = "No Authorized plants for the user";
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.show(message, {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Authorization Status",
						actions: [sap.m.MessageBox.Action.OK]
					});
				}
			});

		}, //End of Init

		//	************************On Input Plant Function**************************************
		//	*************************************************************************************
		onEnterPlant: function(oEvent) {
			var that = this;
			var idp = oEvent.getSource().getSelectedKey();
			Plant = idp;
			if (Plant === "") {
				//	this.getView().byId("Combplant").;
				/*	that.getView().byId("__filter1").setEnabled(false);
					that.getView().byId("__filter0").setEnabled(false); */
				//	var bt = sap.ui.dom.document.getElementById("Idsubmit");
				// bt.disabled = true;
				var _errMsg = "Select Plant";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			} else {
				var odataModelPlType = this.getView().getModel();
				odataModelPlType.read("/GetPlantsSet", {

					filters: [
						new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, Plant)
					],

					success: function(oData, oResponse) {
						that.getView().getModel("this").setProperty("/TokenInd", oData.results[0].TokenInd);
						that.getView().getModel("this").setProperty("/TruckInd", oData.results[0].TruckInd);
						if (oData.results[0].PlantType === "DI") {
							that.getView().byId("Idtexth").setText("Distillery Invoice");
						}
						if (oData.results[0].PlantType === "DE") {
							that.getView().byId("Idtexth").setText("Depot Invoice");
						} else {
							//Nothing to do here
						}
					},
					error: function(oError) {

						var _errMsg1 = JSON.parse(oError.response.body).error.message.value;
						sap.m.MessageBox.show(_errMsg1, sap.m.MessageBox.Icon.ERROR, "Error");

					}
				});
			}

			//-----Start of Code for Truck type dropdown-----
			var odataModel = this.getView().getModel();
			//Setting trucktype values based on Plant value
			var filtervalue = oEvent.getParameter("newValue");

			odataModel.read("/TruckTypeSet", {

				filters: [
					new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, filtervalue)
				],

				success: function(oData, oResponse) {
					var aFiltersComboBoxData = oResponse.data.results;
					var oJModel3 = new sap.ui.model.json.JSONModel();
					oJModel3.setData(aFiltersComboBoxData);
					that.getView().byId("Combtrcktyp").setModel(oJModel3, "namedmodel");
				},
				error: function(oError) {

					var _errMsg1 = JSON.parse(oError.response.body).error.message.value;
					sap.m.MessageBox.show(_errMsg1, sap.m.MessageBox.Icon.ERROR, "Error");

				}
			});

			//	var odataModel = this.getView().getModel();
			var url = "/SalesOrgSet(Werks='" + idp + "')";

			odataModel.read(url, {
				success: function(odata, oResponse) {

					that.getView().byId("Inpslsorg").setValue(odata.Vkorg);
					that.getView().byId("InpCompNam").setValue(odata.Bukrs);
					that.getView().byId("Inpplntnam").setValue(odata.Name1);
					/*
										if (odata.PlantType !== "DE") {
						that.getView().byId("Combprclst").setEnabled(false);
					} else {

						that.getView().byId("Combprclst").setEnabled(true);

					} */

				},
				error: function(oError) {

					var _errMsg = JSON.parse(oError.response.body).error.message.value;
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");

				}

			});

		},
		onEnterDistrchn: function(oEvent) {
			this.byId("idToken").setValue();
			var sSelectedDistributionChannelKey = oEvent.getSource().getProperty("selectedKey");
			if (sSelectedDistributionChannelKey === '12') {
				this.byId("Combslsgrp").setSelectedKey("014");
			} else {
				this.byId("Combslsgrp").setSelectedKey("015");
			}
			if (sSelectedDistributionChannelKey === '12' &&
				that.getView().getModel("this").getProperty("/TokenInd") === 'Y' &&
				that.getView().getModel("this").getProperty("/CustomerTokenInd") === 'Y') {
				this.getView().getModel("this").setProperty("/IsCSDTokenFieldsVisible", true);
			} else {
				this.getView().getModel("this").setProperty("/IsCSDTokenFieldsVisible", false);
			}
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
			var plant = this.getView().byId("Combplant").getSelectedKey();
			if (customer === "") {
				this.getView().byId("Inpcust").focus();
				var _errMsg = "Enter Customer";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			var odataModel = this.getView().getModel();
			//	var url = "/CustCheckSet(CompanyCode='" + compcode + "',Customer='" + customer + "')";
			var url = "/CustCheckSet(CompanyCode='" + compcode + "',Customer='" + customer + "',Vkorg='" + sls_org_cust + "',Vtweg='" +
				dist_chan_cust + "',Spart='" + div_cust + "',Plant='" + plant + "')";
			//	var customerName = this.getView().byId("Inpcustname").getValue();
			// /sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV/CustCheckSet(Customer='12354NA' ,CompanyCode='5000')

			//	url="/MatGetSet(Matnr='103584',Vkorg='5001',Vtweg='11',Spart='11',Werks='1006',Customer='11358')";
			odataModel.read(url, {
				success: function(odata, oResponse) {

					if (oResponse.statusCode == 200 && odata.MsgType == "E") {
						that.getView().byId("Inpcustname").setValue("");
						var _errMsg = odata.Msg;
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
						return;
					}
					that.getView().byId("Inpcustname").setValue(odata.CustName);
					that.getView().getModel("this").setProperty("/CustomerTokenInd", odata.CustTkInd);
					if (that.byId("Combdistr").getProperty("selectedKey") === '12' &&
						that.getView().getModel("this").getProperty("/TokenInd") === 'Y' &&
						odata.CustTkInd === 'Y'
					) {
						that.getView().getModel("this").setProperty("/IsCSDTokenFieldsVisible", true);
					} else {
						that.getView().getModel("this").setProperty("/IsCSDTokenFieldsVisible", false);
					}

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
			var invdate = this.getView().byId("Inpinvdate").getValue();
			if (tPPermit === "") {

				this.getView().byId("Inptpdat").focus();
				var _errMsg = "Enter TP Permit Date";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
			}

			if (tPPermit > invdate) {
				if (tPPermit !== "") {
					this.getView().byId("Inptpdat").focus();
					var _errMsg = " TP Permit Date should be less than or equals to Invoice Date ";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}
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
				//Nothing to do here
			} else {
				this.getView().byId("Inpexdat").focus();
				var _errMsg = "TP Expiry date should always greater than equal to TP permit date and invoice date";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

		},

		//	************************ON Cash Discount Validation Function***************************************
		//	*****************************************************************************************

		onEnterCash: function(oEvent) {
			var that = this;
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
				var plant1 = this.getView().byId("Combplant").getSelectedKey();
				if (plant1 === "") {
					//	this.getView().byId("Combplant").focus();

					var _errMsg = "Plant can not be blank";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}
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

		//	************************ON Transporter Input Function***************************************
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

					if (oResponse.statusCode == 200 && odata.MsgType == "E") {
						that.getView().byId("Inptrpternam").setValue("");
						var _errMsg = odata.Msg;
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
						return;
					}
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
			Plant = this.getView().byId("Combplant").getSelectedKey();
			var werks = Plant;
			var customer = this.getView().byId("Inpcust").getValue();
			var invDate = this.getView().byId("Inpinvdate").getValue();

			var odataModel = this.getView().getModel();
			var url = "/MatGetSet(Matnr='" + matnr + "',Vkorg='" + vkorg + "',Vtweg='" + vtweg + "',Spart='" + spart + "',Werks='" + werks +
				"',Customer='" + customer + "')";
			//	url="/MatGetSet(Matnr='103584',Vkorg='5001',Vtweg='11',Spart='11',Werks='1006',Customer='11358')";

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
					that.getView().byId("InpBrand1").setValue(odata.Brand);
					that.getView().byId("InpMatdesc1").setValue(odata.Maktxt);
					that.getView().byId("InpPack1").setValue(odata.Pack);
					that.getView().byId("InpUmren").setValue(odata.Umren);
				},
				error: function(oError) {
					//that.getView().byId("InpMatcode").setValue("");
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
				//Nothing to do here
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
			var uom = this.getView().byId("combuom1").getValue();
			if (uom === "Cases") {
				uom = "CS";
			} else if (uom === "Each") {
				uom = "EA";
			}
			if (mat !== "" && matdesc !== "" && qty !== "" && uom !== "") {

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
					this.getView().byId("Combdistr").setEnabled(false); //comb distr
					this.getView().byId("Combdiv").setEnabled(false); //comb div
					this.getView().byId("Combplant").setEnabled(false); //Plant
				}

				// Set Model

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
				var b_case = Math.abs(this.getView().byId("InpUmren").getValue());
				//	var v_qty1 = Math.floor(this.getView().byId("Txt1").getValue());
				if (uom == "EA") {
					if (b_case !== 0) {
						v_qty_add = (v_qty_add / b_case);
					}

				} //End of Each
				v_qty_add = Math.abs(v_qty_add);
				v_total_qty = Math.abs(v_total_qty);
				v_total_qty = v_total_qty + v_qty_add;
				v_total_qty = v_total_qty.toFixed(3);
				this.getView().byId("Txt1").setValue(v_total_qty);
				this.getView().byId("InpQty1").setValue("");
			} else {
				//	MessageBox.show("Material/Quantity/UOM cannot be blank");
				var _errMsg = "Material/Material Desc/Quantity/UOM cannot be blank";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
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
				var v_qty_deleted = Math.abs(v_qty_deleted);
				var b_case = Math.abs(this.getView().byId("InpUmren").getValue());
				var v_qty = Math.abs(this.getView().byId("Txt1").getValue());
				//	var v_qty_tot = v_qty - (v_qty_deleted / b_case);
				if (aRows[idx].Uom == "EA") {
					if (b_case !== 0) {
						v_qty_deleted = (v_qty_deleted / b_case);
					}
				} //end of each condition
				v_qty_deleted = Math.abs(v_qty_deleted);
				v_total_qty = Math.abs(v_total_qty);
				v_total_qty = v_total_qty - v_qty_deleted;
				v_total_qty = v_total_qty.toFixed(3);
				this.getView().byId("Txt1").setValue(v_total_qty);
				aRows.splice(idx, 1);

			}
			//	calling add qty function
			this.onAddqty();
			oModel2.setData({
				data: aRows
			});
			oTable.removeSelectionInterval(0, oItems.length);
			//To check if item data is empty , distr chan n division should get enabled
			var oTabledel = this.getView().byId("table1");
			var oModeldel = oTable.getModel();
			var aRowsdel = oModel2.getData().data;
			if (aRowsdel.length == 0) {
				this.getView().byId("Combdistr").setEnabled(true); //comb distr
				this.getView().byId("Combdiv").setEnabled(true); //comb div	
			}
		},
		//	************************Submit Function***************************************
		//	******************************************************************************
		onSubmit: function() {
			BusyIndicator.show();
			that = this;
			//Create all the records added to table via Json model
			var oTable = this.getView().byId("table1");

			// Get the table Model
			var oModel1 = oTable.getModel();

			if (this.byId("Inpcustname").getValue() === "") {
				BusyIndicator.hide();
				var _errMsg = "Please provide valid customer code";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			var bPlacementUsed = false;
			if (this.byId("Inptrpter").getValue() ||
				this.byId("Inptrcknum").getValue() ||
				this.byId("Inplrnum").getValue()) {
				bPlacementUsed = true;
			}

			if (bPlacementUsed) {
				if (!this.byId("Inptrpter").getValue() ||
					!this.byId("Inptrcknum").getValue() ||
					!this.byId("Inplrnum").getValue()) {
					BusyIndicator.hide();
					var _errMsg = "Please provide all mandatory values for Placement tab";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;
				}
			}

			if (!this.byId("idToken").getValue() && this.byId("idToken").getVisible()) {
				BusyIndicator.hide();
				var _errMsg = "Please Provide Token No";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			// Get Items of the Table
			var aItems = oModel1.getData().data; //oTable.getItems();
			if (typeof aItems == "undefined") {
				BusyIndicator.hide();
				var _errMsg = "Item List cannot be empty.";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}
			if (aItems.length == 0) {
				BusyIndicator.hide();
				var _errMsg = "Item List cannot be empty.";
				sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
				return;
			}

			// Define an empty Array
			var itemData = [];

			for (var iRowIndex = 0; iRowIndex < aItems.length; iRowIndex++) {
				var l_material = oModel1.getProperty("MaterialCode", aItems[iRowIndex]); //.getBindingContext());
				var l_matdesc = oModel1.getProperty("MaterialDesc", aItems[iRowIndex]); //.getBindingContext());
				var l_brand = oModel1.getProperty("Brand", aItems[iRowIndex]); //.getBindingContext());
				var l_pack = oModel1.getProperty("Pack", aItems[iRowIndex]); //.getBindingContext());
				var l_quantity = oModel1.getProperty("Quantity", aItems[iRowIndex]); //.getBindingContext());
				var l_uom = oModel1.getProperty("Uom", aItems[iRowIndex]); //.getBindingContext());
				var l_umren = oModel1.getProperty("Umren", aItems[iRowIndex]);
				if (l_uom === "Cases") {
					l_uom = "CS";
				} else if (l_uom === "EA") {
					l_uom = "EA";
				}
				if (l_material !== null) {
					itemData.push({
						MaterialCode: l_material,
						MaterialDesc: l_matdesc,
						Brand: l_brand,
						Pack: l_pack,
						Quantity: l_quantity,
						Uom: l_uom,
						Umren: l_umren
					});
				}
			}
			// Get the values of the header input fields

			// Create one emtpy Object
			var oEntry1 = {};

			oEntry1.InvId = "12345";
			var invdate = this.getView().byId("Inpinvdate").getValue();
			oEntry1.InvDate = invdate + "T00:00:00"; //	oEntry1.InvDate = "2019-12-05T00:00:00";
			oEntry1.DocketNum = "";
			oEntry1.Plant = Plant;
			oEntry1.DistributChanId = this.getView().byId("Combdistr").getSelectedKey();
			oEntry1.DivisionId = this.getView().byId("Combdiv").getSelectedKey();
			oEntry1.Customer = this.getView().byId("Inpcust").getValue();
			oEntry1.TpPermitNum = this.getView().byId("Inptpnum").getValue();

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
			oEntry1.TokenNo = this.byId("idToken").getValue();
			//	oEntry1.HisId = "";
			oEntry1.Remarks = this.getView().byId("Inpremarks").getValue();

			//	oEntry1.Status = "";
			//	oEntry1.RequestType = "";

			oEntry1.SalesOrganization = this.getView().byId("Inpslsorg").getValue();
			oEntry1.SalesGrp = this.getView().byId("Combslsgrp").getSelectedKey();

			//oEntry1.CustName = this.getView().byId("Inpcustname").getValue();

			//	oEntry1.TrpName = this.getView().byId("Inptrpternam").getValue();
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
			oEntry1.Pricelist = this.getView().byId("Combprclst").getSelectedKey();
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
			oEntry1.DcktInvNavItem = itemData;

			//Set the Model and call the .create function to call the OData Service.
			//	var oModel1 = new sap.ui.model.odata.ODataModel("http://sapbwdev02.corp.usl.in:8020/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV");
			var oModel1 = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZDLT_SALES_INVOICE_SRV");
			this.getView().setModel(oModel1);

			oModel1.setHeaders({
				"X-Requested-With": "X"
			});

			//DcktInvDstlSet  DcktInvNavItem
			oModel1.create("/DcktInvDstlSet", oEntry1, {

				success: function(oData, oResponse) {

					if (oResponse.statusCode == 201 && oData.MsgType == "E") {
						var _errMsg = oData.Msg;
						sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
						return;
					}
					var successObj = oResponse.data.DocketNum;
					var message = "Docket Number : " + successObj + "  " + "created successfully";

					jQuery.sap.require("sap.m.MessageBox");

					sap.m.MessageBox.show(message, {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Docket number Update Status",
						actions: [sap.m.MessageBox.Action.OK]
					});

					//To Refresh Item Data
					that.getView().byId("table1").getModel().setData({
						data: []
					});
					//	that.getView().byId("InpCompNam").setValue("");
					//	that.getView().byId("Inpplntnam").setValue("");
					var iinit = 0;
					var oDateFormatinit = DateFormat.getDateInstance({
						source: {
							pattern: "timestamp"
						},
						pattern: "yyyy-MM-dd" //"dd/MM/yyyy"
					});
					var dateinit = new Date();
					var dateinv = (new Date(dateinit)).getTime() - (iinit % 10 * 4 * 24 * 60 * 60 * 1000);
					dateinv = oDateFormatinit.format(new Date(dateinit));
					that.getView().byId("Inpinvdate").setValue(dateinv);
					//	that.getView().byId("Inpinvdate").setValue("");
					that.getView().byId("Inpcust").setValue("");
					that.getView().byId("Inptpnum").setValue("");
					that.getView().byId("Inpordnum").setValue("");
					that.getView().byId("Inpexpnum").setValue("");
					that.getView().byId("Inpremarks").setValue("");
					that.getView().byId("Inpcustname").setValue("");
					//	that.getView().byId("Inpslsorg").setValue("");
					that.getView().byId("Combdistr").setSelectedKey("11");
					that.getView().byId("Combdiv").setSelectedKey("11");
					that.getView().byId("Combslsgrp").setValue("015");
					that.getView().byId("Inptpdat").setValue("");
					that.getView().byId("Inpexdat").setValue("");
					that.getView().byId("Inpexporddat").setValue("");
					that.getView().byId("Combprclst").setSelectedKey("");
					that.getView().byId("Inpcashdcnt").setValue("0.00");
					that.getView().byId("Inptrpordnum").setValue("");
					that.getView().byId("Inptrporddate").setValue("");
					that.getView().byId("Inptrpter").setValue("");
					that.getView().byId("Inptrpternam").setValue("");
					that.getView().byId("Combtrcktyp").setSelectedKey("");
					that.getView().byId("Inptrcknum").setValue("");
					that.getView().byId("Inplrnum").setValue("");
					that.getView().byId("Combmilkrun").setSelectedKey("0001");
					that.getView().byId("Txt1").setSelectedKey("");
					that.getView().byId("Combplant").setSelectedKey(Plant);
					that.getView().byId("Combplant").setEnabled(true);
					that.getView().byId("Combdistr").setEnabled(true);
					that.getView().byId("Combdiv").setEnabled(true);
					that.getView().byId("idToken").setValue("");
					that.getView().getModel("this").setProperty("/IsCSDTokenFieldsVisible", false);
					v_total_qty = 0;
					that.getView().byId("Txt1").setValue(v_total_qty);
					setkey = view + "__filter0";
					var oIconTabBar = that.getView().byId("__bar0");
					oIconTabBar.fireSelect({
						key: setkey,
						item: oIconTabBar.getItems()[0]
					});
					oIconTabBar.setSelectedKey(setkey);
					BusyIndicator.hide();
				},
				error: function(oError) {
					/*var _errMsg = "Failure - OData Service could not be called.";
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;*/
					BusyIndicator.hide();
					var _errMsg = oError.message + ";  " + oError.statusText;
					sap.m.MessageBox.show(_errMsg, sap.m.MessageBox.Icon.ERROR, "Error");
					return;

				}
			}); //end of create method

		},
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
			} //end of onAddqty

	});
});