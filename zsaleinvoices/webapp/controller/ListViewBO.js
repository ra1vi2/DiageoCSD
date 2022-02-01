sap.ui.define([
	"../util/Utility",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Utility, JSONModel, Filter, FilterOperator) {
	"use strict";
	return {
		loadPlant: function(oView, oModel) {
			oView.byId("idFilterPlant").setBusy(true);
			this.readFromDB(
					oModel,
					"/PlantSet"
				).then(function(oResponse) {
					oView.setModel(new JSONModel(oResponse.results), "plantVH");
					oView.byId("idFilterPlant").setBusy(false);
				})
				.fail(function(oError) {
					oView.byId("idFilterPlant").setBusy(false);
				});
		},
		loadCustomer: function(oView, oModel) {
			oView.byId("idFilterCustomer").setBusy(true);
			var sFilter = this.prepareFilterBarFilters(oView);
			this.readFromDB(
					oModel,
					"/CustomerSet", {
						urlParameters: {
							$filter: sFilter
						}
					}
				).then(function(oResponse) {
					oView.setModel(new JSONModel(oResponse.results), "customerVH");
					oView.byId("idFilterCustomer").setBusy(false);
				})
				.fail(function() {
					oView.byId("idFilterCustomer").setBusy(false);
				});
		},
		getOrdersList: function(oView, oModel) {
			var sFilter = this.prepareFilterBarFilters(oView, true);
			return this.readFromDB(
				oModel,
				"/BulkOrderListSet", {
					urlParameters: {
						$filter: sFilter
					}
				}
			);
		},

		readFromDB: function(oModel, sPath, mParameters) {
			return Utility.odataRead(oModel, sPath, mParameters);
		},
		prepareFilterBarFilters: function(oView, isListLoading) {
			var sFilter = "";
			sFilter = "Plant eq '" + oView.byId("idFilterPlant").getSelectedKey() +
				"' and DistributChanId eq '" + oView.byId("idFilterDC").getSelectedKey() +
				"' and (Date ge datetimeoffset'" + Utility.getDateinOffsetFormat(oView.byId("idFilterFromToDate").getDateValue()) + "T14:49:52" +
				"' and Date le datetimeoffset'" +
				Utility.getDateinOffsetFormat(oView.byId("idFilterFromToDate").getSecondDateValue()) + "T14:49:52" + "')";
			if (isListLoading && oView.getModel("/customerVH")) {
				sFilter = sFilter + " and Customer eq '" + oView.byId("idFilterCustomer").getSelectedKey() + "'";
			}
			/*	var oPlant = new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, 'A1HG');
				var oMatType = new sap.ui.model.Filter("MaterialType", sap.ui.model.FilterOperator.EQ, 'PS01');
				var matNum1 = new sap.ui.model.Filter("MaterialNumber", sap.ui.model.FilterOperator.EQ, '61345280');
				var matNum2 = new sap.ui.model.Filter("MaterialNumber", sap.ui.model.FilterOperator.EQ, '61345280');
				// adding or filter for all the material numbers. 
				var orFilter = new sap.ui.model.Filter({
					filters: [matNum1, matNum2],
					and: false
				});
				var oFilter = new sap.ui.model.Filter({
					filters: [orFilter, oPlant, oMatType],
					and: true
				});*/
			return sFilter;
		},
		validateFilterSelection: function(oView) {
			if (!oView.byId("idFilterFromToDate").getValue()) {
				return false;
			}
		}
	};
});