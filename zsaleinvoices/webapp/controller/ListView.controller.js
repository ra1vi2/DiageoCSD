sap.ui.define([
	"../app/BaseController",
	"sap/ui/model/json/JSONModel",
	"../util/Utility",
	"./ListViewBO",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/Fragment"
], function(BaseController, JSONModel, Utility, BO, BusyIndicator, Fragment) {
	"use strict";

	return BaseController.extend("com.diageo.csd.saleinvoiceszsaleinvoices.controller.ListView", {
		onInit: function() {
			this.getView().setModel(new JSONModel({}, true), "this");
			this.getView().getModel("this").setProperty("/selectedOrderIndex", {});
			this.getView().getModel("this").setProperty("/selectedOrders", {});
			// set message model
			var oMessageManager = sap.ui.getCore().getMessageManager();
			this.getView().setModel(oMessageManager.getMessageModel(), "message");
			this.getOwnerComponent().initializeMessagePopover(
				this.getView(), this.getMessageIndicatorButton()
			);

			var oCurrentDate = new Date();
			this.getView().byId("idFilterFromToDate").setDateValue(new Date(oCurrentDate.getFullYear(), oCurrentDate.getMonth(), 1));
			this.getView().byId("idFilterFromToDate").setSecondDateValue(new Date(oCurrentDate.getFullYear(), oCurrentDate.getMonth() + 1, 0));
			this._loadVH();
			this.getOwnerComponent().setModel(new JSONModel({}), "SelectedOrders");

			oMessageManager.registerObject(this.getView(), true);
		},
		onFilterValueChange: function() {
			if (this.getView().getModel("/customerVH")) {
				this.getView().getModel("/customerVH").setData(null);
			}
			this._loadVH(true);
		},
		onGenerateSalesDocket: function(oEvent) {
			//get selected Item
			var that = this;
			var bSameCustomerValidaiton = true;

			var aSelectedIndices = this.byId("idOrdersListTable").getSelectedIndices();
			var aSelectedOrders = Utility.readModelByIndex(aSelectedIndices,
				this.byId("idOrdersListTable").getModel("OrdersListModel"));
			var firstIndexOrder = aSelectedOrders[0].Customer;
			aSelectedOrders.every(function(item) {
				if (firstIndexOrder !== item.Customer) {
					bSameCustomerValidaiton = false;
					return false;
				} else {
					return true;
				}
			});
			if (bSameCustomerValidaiton) {
				//add items in model
				this.getOwnerComponent().getModel("SelectedOrders").setData(aSelectedOrders);
				//navigate
				that.getOwnerComponent().getRouter().navTo("GenerateDocket");
			} else {
				this.removeAllMessages();
				this.addMessage(this.getI18NModelText("sameCustomerValidationFail"));
				this.showMessagePopover(this.getMessageIndicatorButton());
			}
		},
		onPressEditOrder: function(oEvent) {
			var sBulkOrderNo = oEvent.getSource().getBindingContext().getObject().BulkOrderNo;
			var sPlant = oEvent.getSource().getBindingContext().getObject().Plant;
			this.getOwnerComponent().getRouter().navTo("BulkOrderdetail", {
				plant: sPlant,
				bulkOrderNo: sBulkOrderNo
			});
		},
		onSearchOrders: function() {
			//	if(BO.validateFilterSelection(this.getView())){
			BusyIndicator.show();
			if (BO.validateFilters(this.getView())) {
				BusyIndicator.hide();
				var message = this.getI18NModelText(BO.validateFilters(this.getView()) + "requiredFieldError");
				this.addMessage(message);
				this.showMessagePopover(this.getMessageIndicatorButton());
				return;
			} else {
				BO.getOrdersList(this.getView(),
						this.getOwnerComponent().getModel())
					.then(function() {
						this._handleOrderListLoadSuccess.apply(this, arguments);
					}.bind(this))
					.fail(function() {
						BusyIndicator.hide();
						this.showMessagePopover();
					}.bind(this));
			}
		},

		onOrdersRowSelectionChange: function(oEvent) {
			/*var iSelectedIndex = oEvent.getParameters("rowContext").rowIndex;
			var oSelectedRowData = oEvent.getParameters("rowContext").rowContext.getModel().getData()[iSelectedIndex];
			var selectedOrderIndex = this.getView().getModel("this").getProperty("/selectedOrderIndex") || [];
			selectedOrderIndex.push(oSelectedRowData);
			this.getView().getModel("this").getProperty("/selectedOrderIndex")*/
			if (oEvent.getSource().getSelectedIndices().length > 0) {
				this.getView().getModel("this").setProperty("/selectedOrderIndex", oEvent.getSource().getSelectedIndices());
			} else {
				this.getView().getModel("this").setProperty("/selectedOrderIndex", {});
			}
		},
		onPressRequestInvoice: function() {
			var oOutbound = this.getOwnerComponent().getManifestEntry("/sap.app/crossNavigation/outbounds/requestInvoice");
			this.crossAppNav(oOutbound.semanticObject, oOutbound.action);
		},

		_handleOrderListLoadSuccess: function(oResponse) {
			this.getView().setModel(new JSONModel(oResponse.results), "OrdersListModel");
			BusyIndicator.hide();
		},

		_loadVH: function(isCustomerToLoad) {
			//if (!isCustomerToLoad) {
			BO.loadPlant(this.getView(), this.getOwnerComponent().getModel(), this.getOwnerComponent());
			//} else {
			BO.loadCustomer(this.getView(), this.getOwnerComponent().getModel());
			//}
		},
		getMessageIndicatorButton: function() {
			return this.byId("idMessagePopOver");
		}
	});
});