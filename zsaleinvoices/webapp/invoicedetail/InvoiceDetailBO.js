sap.ui.define([
	"../util/Utility",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../controller/ListViewBO"
], function(Utility, JSONModel, Filter, FilterOperator, ListBO) {
	"use strict";
	return {

		getDetailPageData: function(SelectedOrders, oView) {
			var aFilters = this.getFilterArrayForSelectedOrders(SelectedOrders);
			return ListBO.readFromDB(
				oView.getModel(),
				"/BulkOrderHeaderSet", {
					filters: aFilters,
					urlParameters: {
						$expand: "BulkHedItemNav"
					}
				}
			);
		},

		getFilterArrayForSelectedOrders: function(aData) {
			var filters = [];
			var aSelectedOrderFilter = [];
			aData.forEach(function(data) {
				filters.push(new Filter("DocketNum", FilterOperator.EQ, data.BulkOrderNo));

			});
			aSelectedOrderFilter.push(new sap.ui.model.Filter(filters, false));
			return aSelectedOrderFilter;
		},
		GenerateDocket: function(headermodel, itemmodel, viewmodel) {
			var aHeaderData = headermodel.getData();
			aHeaderData = Utility.removeMetadata(aHeaderData);
			var aItemData = itemmodel.getData();
			aItemData = Utility.removeMetadata(aItemData);

			if (aHeaderData) {
				delete aHeaderData.BulkHedItemNav;
			}
			aHeaderData.Action = "GENERATE";
			aHeaderData.BulkHedItemNav = aItemData;
			//	var aPayload = Utility.merge({},  aHeaderData, aItemData);
			return Utility.odataCreate(viewmodel, "/BulkOrderHeaderSet", aHeaderData);

		},
		initialiseFields: function(sSelectedDistributionChannelKey, oView) {
			this.initialiseByDistributionChannel(oView, sSelectedDistributionChannelKey);
		},
		initialiseByDistributionChannel: function(oView, sDistributionChannel) {

			var oContext = oView.byId("idOrderDetailHeaderFormPlant").getSelectedItem().getBindingInfo("key").binding.getContext();
			var sPath = oContext.getPath();
			var oData = oContext.getObject(sPath);

			if (sDistributionChannel === '12' &&
				oData.TokenInd === 'Y') {
				//	oView.getModel("this").getProperty("/CustomerTokenInd") === 'Y') {
				oView.getModel("this").setProperty("/IsCSDTokenFieldsVisible", true);
			} else {
				oView.getModel("this").setProperty("/IsCSDTokenFieldsVisible", false);
			}
		},
		loadPriceList: function(oModel, sPath) {
			return Utility.odataRead(oModel, sPath);
		},
		valiadate: function(oView) {
			if (oView.getModel("this").getProperty("/IsCSDTokenFieldsVisible") && !oView.byId("idHeaderFormExportTokenNo").getValue()) {
				oView.byId("idHeaderFormExportTokenNo").sestValueState('Error');
				return false;
			}
			return true;
		},
		validateEnteredQuantity: function(oSelectedObject) {
			if (parseInt(oSelectedObject.Quantity, 10) > parseInt(oSelectedObject.BalanceQuantity, 10)) {
				return true;
			}
		}
	};
});