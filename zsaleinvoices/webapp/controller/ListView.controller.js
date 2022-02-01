sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"../util/Utility",
	"./ListViewBO",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/Fragment"
], function(Controller, JSONModel, Utility, BO, BusyIndicator, Fragment) {
	"use strict";

	return Controller.extend("com.diageo.csd.saleinvoiceszsaleinvoices.controller.ListView", {
		onInit: function() {
			this._loadVH();
			this.getView().setModel(new JSONModel({}, true), "this");
			this.getView().getModel("this").setProperty("/selectedOrderIndex", {});
			this.getView().getModel("this").setProperty("/selectedOrders", {});
			// set message model
			var oMessageManager = sap.ui.getCore().getMessageManager();
			this.getView().setModel(oMessageManager.getMessageModel(), "message");

			// activate automatic message generation for complete view
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
			var aSelectedIndices = this.byId("idOrdersListTable").getSelectedIndices();
			//add items in model
			this.getOwnerComponent().setModel(new JSONModel( Utility.readModelByIndex(aSelectedIndices,
					this.byId("idOrdersListTable").getBindingInfo("rows").binding.getModel())),
				"SelectedOrders");
			//navigate
			that.getOwnerComponent().getRouter().navTo("GenerateDocket");
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
			BO.getOrdersList(this.getView(), this.getOwnerComponent().getModel()).then(function() {
					this._handleOrderListLoadSuccess.apply(this, arguments);
				}.bind(this))
				.fail(function() {
					BusyIndicator.hide();
					//	that.onMessagePopoverPress();
				}.bind(this));
			
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

		_handleOrderListLoadSuccess: function(oResponse) {
			this.getView().setModel(new JSONModel(oResponse.results), "OrdersListModel");
			BusyIndicator.hide();
		},

		_loadVH: function(isCustomerToLoad) {
			if (!isCustomerToLoad) {
				BO.loadPlant(this.getView(), this.getOwnerComponent().getModel());
			} else {
				BO.loadCustomer(this.getView(), this.getOwnerComponent().getModel());
			}
		},
		onMessagePopoverPress: function(oEvent) {
			var oSourceControl = oEvent.getSource();
			this._getMessagePopover().then(function(oMessagePopover) {
				oMessagePopover.openBy(oSourceControl);
			});
		},
		_getMessagePopover: function() {
			var oView = this.getView();

			// create popover lazily (singleton)
			if (!this._pMessagePopover) {
				this._pMessagePopover = Fragment.load({
					id: oView.getId(),
					name: "com.diageo.csd.saleinvoiceszsaleinvoices.view.fragments.MessagePopover"
				}).then(function(oMessagePopover) {
					oView.addDependent(oMessagePopover);
					return oMessagePopover;
				});
			}
			return this._pMessagePopover;
		}
	});
});