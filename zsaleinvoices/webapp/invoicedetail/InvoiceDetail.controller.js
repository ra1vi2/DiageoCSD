sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"./InvoiceDetailBO"
], function(Controller, JSONModel, History, BO) {
	"use strict";

	return Controller.extend("com.diageo.csd.saleinvoiceszsaleinvoices.invoicedetail.InvoiceDetail", {
		onInit: function() {
			this.getView().setModel(new JSONModel(), "this");
			this.getOwnerComponent().getRouter().getRoute("GenerateDocket").attachPatternMatched(this._onPatternMatchedGenerateSaleDocket, this);
		},
		_onPatternMatchedGenerateSaleDocket: function() {
			var oSelectedOrders = this.getOwnerComponent().setModel("SelectedOrders");
			BO.getDetailPageData(
				oSelectedOrders, this.getView()
				).then();
			//call method with expand to header and item
			// set respective models
		},
		onNavBack: function(oEvent) {
			var oHistory = History.getInstance();
			var oPreviousHash = oHistory.getPreviousHash();

			if ((oPreviousHash !== undefined) || (oPreviousHash !== "")) {
				window.history.go(-1);
			} else {
				this.getOwnerComponent.getRouter().navTo("View1", false);
			}
		}
	});
});