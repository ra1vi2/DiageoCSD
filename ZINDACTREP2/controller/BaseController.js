sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller, Filter, FilterOperator) {
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
		},

		/**
		 ** API call with Summary to add the total count
		 **/
		_fnTotalQuantity: function() {
			var that = this,
				aFilters = [],
				oTotalIndentQuantity = 0,
				oTotalBalanceQuantity = 0,
				oTotalInvoiveQuantity = 0,
				oLocalModel = this.getModel("local"),
				//Region value
				oRegion = this.getView().byId("regionID").getSelectedKey(),
				//Sales Office
				oSalesOffice = this.getView().byId("salesOfficeID").getSelectedKey(),
				//Distribution Channel
				oDistributionChannel = this.getView().byId("DCID").getSelectedKey(),
				//Start Date
				oStartDate = this.getView().byId("DateRangeID").getDateValue(),
				// End Date
				oEndDate = this.getView().byId("DateRangeID").getSecondDateValue();

			aFilters.push(new Filter({
				path: "Region",
				operator: FilterOperator.EQ,
				value1: oRegion
			}));
			aFilters.push(new Filter({
				path: "Vkbur",
				operator: FilterOperator.EQ,
				value1: oSalesOffice
			}));
			aFilters.push(new Filter({
				path: "DcId",
				operator: FilterOperator.EQ,
				value1: oDistributionChannel
			}));
			aFilters.push(new Filter({
				path: "InDate",
				operator: FilterOperator.BT,
				value1: new Date(oStartDate.setHours(5, 30)),
				value2: new Date(oEndDate.setHours(5, 30))
			}));
			aFilters.push(new Filter({
				path: "ReportType",
				operator: FilterOperator.EQ,
				value1: "D"
			}));
			this.getView().setBusy(true);
			this.oDataModel.read("/SalesIndentRptSet", {
				filters: aFilters,
				success: function(oData) {
					that.getView().setBusy(false);
					//get total values
					oData.results.forEach(function(ele) {
						oTotalIndentQuantity = oTotalIndentQuantity + parseFloat(ele.IndQuantity);
						oTotalBalanceQuantity = oTotalBalanceQuantity + parseFloat(ele.BalQuantity);
						oTotalInvoiveQuantity = oTotalInvoiveQuantity + parseFloat(ele.InvQuantity);
					});
					//append total values to localModel
					oLocalModel.setProperty("/totalIndentQuantity", parseFloat(oTotalIndentQuantity).toFixed(3));
					oLocalModel.setProperty("/totalBalanceQuantity", parseFloat(oTotalBalanceQuantity).toFixed(3));
					oLocalModel.setProperty("/totalInvoiceQuantity", parseFloat(oTotalInvoiveQuantity).toFixed(3));
					oLocalModel.refresh(true);
				},
				error: function(oError) {
					that.getView().setBusy(false);
				}
			});
		}

	});

});