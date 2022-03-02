sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.diageo.csdzindactrep.controller.BaseController", {

		/**
		 ** Router Method
		 **/
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouteFor(this);
		},

		/**
		 ** Method to call the Model with/without alias name
		 **/
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 ** set Model to view with alias Name
		 **/
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 ** Fragment method called by ID
		 **/
		getFragmentControl: function(that, sFragId, sControlId) {
			return that.getView().byId(sap.ui.core.fragment.createId(sFragId, sControlId));
		},

		/**
		 ** ResourceModel 
		 **/
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		}

	});

});