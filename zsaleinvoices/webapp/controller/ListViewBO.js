sap.ui.define([
	"../util/Utility",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/format/DateFormat"
], function(Utility, JSONModel, Filter, FilterOperator, DateFormat) {
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
			var aFilter = this.prepareFilterBarFilters(oView);
			this.readFromDB(
					oModel,
					"/CustomerSet", {
						filters: aFilter
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
			var aFilter = this.prepareFilterBarFilters(oView, true);
			return this.readFromDB(
				oModel,
				"/BulkOrderListSet", {
					filters: aFilter
				}
			);
		},

		readFromDB: function(oModel, sPath, mParameters) {
			return Utility.odataRead(oModel, sPath, mParameters);
		},
		prepareFilterBarFilters: function(oView, isListLoading) {
			/*	var sFilter = "";
				sFilter = "Plant eq '" + oView.byId("idFilterPlant").getSelectedKey() +
					"' and DistributChanId eq '" + oView.byId("idFilterDC").getSelectedKey() +
					"' and (Date ge datetimeoffset'" + Utility.getDateinOffsetFormat(oView.byId("idFilterFromToDate").getDateValue()) + "T14:49:52" +
					"' and Date le datetimeoffset'" +
					Utility.getDateinOffsetFormat(oView.byId("idFilterFromToDate").getSecondDateValue()) + "T14:49:52" + "')";
				if (isListLoading && oView.getModel("/customerVH")) {
					sFilter = sFilter + " and Customer eq '" + oView.byId("idFilterCustomer").getSelectedKey() + "'";
				}*/

			var aFilter = [];
			aFilter.push(new Filter("Plant", FilterOperator.EQ, oView.byId("idFilterPlant").getSelectedKey()));
			aFilter.push(new Filter("DistributChanId", FilterOperator.EQ, oView.byId("idFilterDC").getSelectedKey()));

			aFilter.push(new Filter("Date", FilterOperator.BT, oView.byId("idFilterFromToDate").getDateValue(), oView.byId("idFilterFromToDate").getSecondDateValue()));
			if (isListLoading && oView.getModel("/customerVH")) {
				aFilter.push(new Filter("Customer", FilterOperator.EQ, oView.byId("idFilterCustomer").getSelectedKey()));
			}
			return aFilter;
		},
		validateFilterSelection: function(oView) {
			if (!oView.byId("idFilterFromToDate").getValue()) {
				return false;
			}
		}
	};
});