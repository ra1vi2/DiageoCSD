sap.ui.define([
	"../util/Utility",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Utility, JSONModel, Filter, FilterOperator) {
	"use strict";
	return {
		
		getDetailPageData:function(SelectedOrders, oView){
		//	var sQuery = this.getFilterQueryForSelectedOrders(SelectedOrders);
		},
		readFromDB: function(oModel, sPath, mParameters) {
			return Utility.odataRead(oModel, sPath, mParameters);
		}/*,
		getFilterQueryForSelectedOrders:function(oModel){
			var aData = oModel.getData();
			aData.forEach(function(data){
			});
		}*/
	};
});