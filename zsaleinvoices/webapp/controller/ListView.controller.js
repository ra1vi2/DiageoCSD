sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("com.diageo.csd.saleinvoiceszsaleinvoices.controller.ListView", {
		onInit: function() {
			this.getView().setModel(new JSONModel(), "this");
			this.getView().getModel("this").setProperty("/selectedOrders", {});
		}
	});
});