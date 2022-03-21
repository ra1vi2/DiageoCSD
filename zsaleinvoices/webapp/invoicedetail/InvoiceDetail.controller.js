sap.ui.define([
	"../app/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"./InvoiceDetailBO",
	"sap/ui/core/BusyIndicator",
	"sap/m/HBox",
	"sap/m/Text"

], function(BaseController, JSONModel, History, BO, BusyIndicator, HBox, Text) {
	"use strict";

	return BaseController.extend("com.diageo.csd.saleinvoiceszsaleinvoices.invoicedetail.InvoiceDetail", {
		onInit: function() {
			this.getView().setModel(new JSONModel(), "this");
			this.getView().setModel(new JSONModel({}), "orderdetails");
			this.getOwnerComponent().initializeMessagePopover(
				this.getView(), this.getMessageIndicatorButton()
			);

			var oMessageManager = sap.ui.getCore().getMessageManager();
			oMessageManager.registerObject(this.getView(), true);
			this.getOwnerComponent().getRouter().getRoute("GenerateDocket").attachPatternMatched(this._onPatternMatchedGenerateSaleDocket, this);
			//this.getOwnerComponent().getRouter().getRoute("EditDocket").attachPatternMatched(this._onPatternMatchedEditDocket, this);

		},
		_onPatternMatchedGenerateSaleDocket: function() {
			BusyIndicator.show();
			this.getView().setModel(new JSONModel({
				totalQty: 0
			}), "Total");

			this.getView().getModel("this").setProperty("/CurrViewMode", "GENERATE");
			var aSelectedOrders = this.getOwnerComponent().getModel("SelectedOrders").getData() || [];
			if (aSelectedOrders.length === 0) {
				this.onNavBack();
			}
			BO.getDetailPageData(
					aSelectedOrders, this.getView()
				).then(function() {
					this._handleOrderDetailLoadSuccess.apply(this, arguments);
				}.bind(this))
				.fail(function() {
					this._handleOrderDetailLoadError.apply(this, arguments);
				}.bind(this));
		},
		_onPatternMatchedEditDocket: function() {
			this.getView().getModel("this").setProperty("/CurrViewMode", "EDIT");
			//coming soon...
		},
		_handleOrderDetailLoadSuccess: function(oResponse) {
			this.getView().setModel(new JSONModel(oResponse.results[0]), "orderdetailsheader");
			this.getView().setModel(new JSONModel(oResponse.results[0].BulkHedItemNav.results), "orderdetailsItem");

			//get owner component to load plant VH
			this.getView().setModel(this.getOwnerComponent().getModel("PlantVH"), "PlantVH");
			BO.initialiseFields(oResponse.results[0].DistributChanId, this.getView(), oResponse.results[0].TokenInd);

			BO.loadPriceList(this.getModel(), "/GetPriceListSet")
				.then(function(oPriceListResponse) {
					this.getView().setModel(new JSONModel(oPriceListResponse.results), "PriceListVH");
					this.getView().byId("idHeaderFormPriceList").setBusy(false);
				}.bind(this))
				.fail(function() {
					this._handleOrderDetailLoadError.apply(this, arguments);
				}.bind(this));
			BusyIndicator.hide();
		},
		_handleOrderDetailLoadError: function(oError) {
			BusyIndicator.hide();
			this.getOwnerComponent().showMessagePopover(this.getMessageIndicatorButton());
		},
		onSubmitGenerateDocket: function() {
			var oHeader = this.getView().getModel("orderdetailsheader");
			var oItem = this.getView().getModel("orderdetailsItem");
			//if (this.getModel("message").getData().length === 0) {
			if (BO.valiadate(this.getView())) {
				BusyIndicator.show();
				BO.GenerateDocket(oHeader, oItem, this.getModel())
					.then(function(oResponse) {
						BusyIndicator.hide();
						var oSuccessMessageDialog = this.getDocketSuccessDialog(oResponse.DocketNum);
						oSuccessMessageDialog.open();
						this.showMessagePopover(this.getMessageIndicatorButton());

					}.bind(this))
					.fail(function() {
						BusyIndicator.hide();
					}.bind(this));
			} else {
				this.removeAllMessages();
				this.addMessage(this.getI18NModelText("generateDocketValidationError"));
				this.openMessagePopOver(this.getMessageIndicatorButton());
			}
			//}
		},
		getMessageIndicatorButton: function() {
			return this.getView().byId("idMessagePopOver");
		},
		onEnterDistributionChannel: function(oEvent) {
			var sSelectedDistributionChannelKey = oEvent.getSource().getProperty("selectedKey");
			/*		if (sSelectedDistributionChannelKey === '12') {
					this.byId("idSelectHeaderFormSalesGroup").setSelectedKey("014");
				} else {
					this.byId("idSelectHeaderFormSalesGroup").setSelectedKey("015");
				}*/
			BO.initialiseFields(sSelectedDistributionChannelKey, this.getView());
		},
		getDocketSuccessDialog: function(sDocketNumber) {
			var oDialogContent = new HBox({
				items: [
					new Text({
						text: sDocketNumber + " _"
					}),
					new Text({
						text: this.getI18NModelText("generateDocketSucess")
					})
				]
			});
			return this.getSuccessDialog(oDialogContent);
		},
		onChangeItemQuantity: function(oEvent) {
			this.removeAllMessages();
			this.TotalQuantity = 0;
			this.TotalQuantity = this.getView().getModel("Total").getData().totalQty;

			var oBindingContext = oEvent.getSource().getBindingContext("orderdetailsItem");
			var sPath = oBindingContext.getPath();
			var oSelectedObject = oBindingContext.getModel().getObject(sPath);
			if (BO.validateEnteredQuantity(oSelectedObject)) {
				this.addMessage(this.getI18NModelText("enteredQuantityValidationFail"));
				this.showMessagePopover(this.getMessageIndicatorButton());
				oEvent.getSource().setValueState("Error");
				oEvent.getSource().setValueStateText(this.getI18NModelText("enteredQuantityValidationFail"));
			} else {
				oEvent.getSource().setValueState("None");
				var aItems = this.getView().getModel("orderdetailsItem").getData();
				var TotalQuantity = 0;
				aItems.forEach(function(item) {
					TotalQuantity = parseInt(TotalQuantity, 10) + parseInt(item.Quantity, 10);
				});
				this.TotalQuantity = parseInt(this.TotalQuantity, 10) + parseInt(oSelectedObject.Quantity, 10);

				this.getView().setModel(new JSONModel({
					totalQty: TotalQuantity
				}), "Total");
			}
		},
		onChangeTokenNo: function(oEvent) {
			if (oEvent.getParameter("newValue")) {
				this.removeAllMessages();
				oEvent.getSource().setValueState("None");
			}
		},
		onSetDate: function() {
			BO.setAllowedDateRange(this.getView(), false);
		}
	});
});