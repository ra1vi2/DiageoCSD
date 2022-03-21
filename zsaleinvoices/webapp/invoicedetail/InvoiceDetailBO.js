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
		initialiseFields: function(sSelectedDistributionChannelKey, oView, sTokenIndicator) {
			this.initialiseByDistributionChannel(oView, sSelectedDistributionChannelKey, sTokenIndicator);
			this.setAllowedDateRange(oView, true);
		},
		initialiseByDistributionChannel: function(oView, sDistributionChannel, sTokenIndicator) {

			/*	var oContext = oView.byId("idOrderDetailHeaderFormPlant").getSelectedItem().getBindingInfo("key").binding.getContext();
				var sPath = oContext.getPath();
				var oData = oContext.getObject(sPath);*/

			if (sDistributionChannel === '12' &&
				sTokenIndicator === 'Y') {
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
				oView.byId("idHeaderFormExportTokenNo").setValueState("Error");
				return false;
			}

			if (!oView.byId("idOrderHeaderExpiryDate").getValue()) {
				oView.byId("idOrderHeaderExpiryDate").setValueState("Error");
				return false;
			}

			if (!oView.byId("idOrderHeaderPermitDate").getValue()) {
				oView.byId("idOrderHeaderPermitDate").setValueState("Error");
				return false;
			}
			return true;
		},
		validateEnteredQuantity: function(oSelectedObject) {
			if (parseInt(oSelectedObject.Quantity, 10) > parseInt(oSelectedObject.BalanceQuantity, 10)) {
				return true;
			}
		},
		setAllowedDateRange: function(oView, IsInitialLoad) {
			this.setMinMaxDate(oView.byId("idOrderHeaderPermitDate"), false, oView.byId("idOrderHeaderInvoiceDate").getDateValue());
			this.setMinMaxDate(oView.byId("idOrderHeaderExpiryDate"), oView.byId("idOrderHeaderPermitDate").getDateValue(), false);
			
			if(!IsInitialLoad){
			this.setMinMaxDate(oView.byId("idOrderHeaderInvoiceDate"), false, oView.byId("idOrderHeaderExpiryDate").getDateValue());
			}
		},
		setMinMaxDate: function(oControl, oMinDate, oMaxDate) {
			if (oMinDate) {
				oControl.setMinDate(oMinDate);
			}
			if (oMaxDate) {
				oControl.setMaxDate(oMaxDate);
			}
		}
	};
});