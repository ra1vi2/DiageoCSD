sap.ui.define([
	"../app/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"./InvoiceDetailBO",
	"sap/ui/core/BusyIndicator",
	"sap/m/HBox",
	"sap/m/Text",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Button",
	"sap/m/ButtonType"
], function(BaseController, JSONModel, History, BO, BusyIndicator, HBox, Text, Filter, FilterOperator, Button, ButtonType) {
	"use strict";

	return BaseController.extend("com.diageo.csd.saleinvoiceszsaleinvoices.invoicedetail.InvoiceDetail", {
		onInit: function() {

			this.getView().setModel(new JSONModel({}), "orderdetails");
			this.getOwnerComponent().initializeMessagePopover(
				this.getView(), this.getMessageIndicatorButton()
			);

			var oMessageManager = sap.ui.getCore().getMessageManager();
			oMessageManager.registerObject(this.getView(), true);
			this.getOwnerComponent().getRouter().getRoute("GenerateDocket").attachPatternMatched(this._onPatternMatchedGenerateSaleDocket, this);
			this.getOwnerComponent().getRouter().getRoute("EditDocket").attachPatternMatched(this._onPatternMatchedEditDocket, this);

		},
		_onPatternMatchedGenerateSaleDocket: function() {
			this.getView().setModel(new JSONModel(), "this");
			this.currentAction = this.getView().getModel("constants").getData().VIEW_MODES.GENERATE;
			this.getView().getModel("this").setProperty("/IsSwitchVisible", false);
			BusyIndicator.show();
			this.getView().setModel(new JSONModel({
				totalQty: 0
			}), "Total");

			this.getView().getModel("this").setProperty("/CurrViewMode", "GENERATE");
			var aSelectedOrders = this.getOwnerComponent().getModel("SelectedOrders").getData() || [];
			if (aSelectedOrders.length === 0) {
				this.onNavBack();
			}
			BO.getDetailPageData(
					aSelectedOrders, this.getView()
				).then(function() {
					this._handleOrderDetailLoadSuccess.apply(this, arguments);
				}.bind(this))
				.fail(function() {
					this._handleOrderDetailLoadError.apply(this, arguments);
				}.bind(this));
		},
		_onPatternMatchedEditDocket: function(oEvent) {
			this.getView().setModel(new JSONModel(), "this");
			this.currentAction = this.getView().getModel("constants").getData().VIEW_MODES.EDIT;
			this.getView().getModel("this").setProperty("/CurrViewMode", "EDIT");
			this.getView().setModel(new JSONModel({
				totalQty: 0
			}), "Total");
			var bulkOrderNo = oEvent.getParameter("arguments").bulkOrderNo,
				aSelectedOrders = [],
				oSelectedOrder = {
					BulkOrderNo: bulkOrderNo
				};

			aSelectedOrders.push(oSelectedOrder);
			BO.getDetailPageData(
					aSelectedOrders, this.getView()
				).then(function() {
					this._handleOrderDetailLoadSuccess.apply(this, arguments);
				}.bind(this))
				.fail(function() {
					this._handleOrderDetailLoadError.apply(this, arguments);
				}.bind(this));
		},
		_handleOrderDetailLoadSuccess: function(oResponse) {
			if (this.currentAction === this.getView().getModel("constants").getData().VIEW_MODES.EDIT) {
				if (oResponse.results[0].BulkInd === "B") {
					//	this.getView().getModel("this").setProperty("/CurrViewMode", "GENERATE");
					this.getView().getModel("this").setProperty("/IsSwitchVisible", false);
				}
				if (oResponse.results[0].BulkInd === "G") {
					this.getView().getModel("this").setProperty("/CurrViewModeQty", "EDIT_RELEASE");
					this.getView().getModel("this").setProperty("/IsSwitchVisible", true);
					//this.getView().byId("idSwitchQuantityType").setState(false);
				}
			} else {
				this.getView().getModel("this").setProperty("/CurrViewMode", "GENERATE");
				oResponse.results[0].IsDocketDeletable = false;
				this.byId("idOrderItemTable").setRowActionCount(0);
			}

			this.getView().setModel(new JSONModel(oResponse.results[0]), "orderdetailsheader");
			this.getView().setModel(new JSONModel(oResponse.results[0].BulkHedItemNav.results), "orderdetailsItem");

			//get owner component to load plant VH
			this.getView().setModel(this.getOwnerComponent().getModel("PlantVH"), "PlantVH");
			BO.initialiseFields(oResponse.results[0].DistributChanId, this.getView(), oResponse.results[0].TokenInd);

			BO.loadPriceList(this.getModel(), "/GetPriceListSet")
				.then(function(oPriceListResponse) {
					this.getView().setModel(new JSONModel(oPriceListResponse.results), "PriceListVH");
					this.getView().byId("idHeaderFormPriceList").setBusy(false);
				}.bind(this))
				.fail(function() {
					this._handleOrderDetailLoadError.apply(this, arguments);
				}.bind(this));
			BusyIndicator.hide();
		},
		_handleOrderDetailLoadError: function(oError) {
			BusyIndicator.hide();
			this.getOwnerComponent().showMessagePopover(this.getMessageIndicatorButton());
		},
		onReleaseQtySwitch: function(oEvent) {
			var aData = this.getView().getModel("orderdetailsItem").getData();
			if (oEvent.getParameter("state")) {
				this.getView().getModel("this").setProperty("/CurrViewModeQty", "EDIT_RELOCATE");
				this.getView().getModel("this").setProperty("/IsSwitchVisible", true);

				aData.forEach(function(data) {
					data.ReleaseQuantity = "0.00";
				});
				this.getView().getModel("orderdetailsItem").setData(aData);
			} else {
				this.getView().getModel("this").setProperty("/CurrViewModeQty", "EDIT_RELEASE");
				this.getView().getModel("this").setProperty("/IsSwitchVisible", true);

				aData.forEach(function(data) {
					data.RelocateQuantity = "0.00";
				});
				this.getView().getModel("orderdetailsItem").setData(aData);
			}
			this.getView().getModel("Total").setData({
				totalQty: 0
			});
		},
		onReleaseQtyRadio: function(oEvent) {
			var aData = this.getView().getModel("orderdetailsItem").getData();
			if (oEvent.getParameter("selectedIndex") === 1) {
				this.getView().getModel("this").setProperty("/CurrViewModeQty", "EDIT_RELOCATE");
				this.getView().getModel("this").setProperty("/IsSwitchVisible", true);
				aData.forEach(function(data) {
					data.ReleaseQuantity = "0.00";
				});
				this.getView().getModel("orderdetailsItem").setData(aData);
			} else if (oEvent.getParameter("selectedIndex") === 0) {
				this.getView().getModel("this").setProperty("/CurrViewModeQty", "EDIT_RELEASE");
				this.getView().getModel("this").setProperty("/IsSwitchVisible", true);
				aData.forEach(function(data) {
					data.RelocateQuantity = "0.00";
				});
				this.getView().getModel("orderdetailsItem").setData(aData);
			}
			this.getView().getModel("Total").setData({
				totalQty: 0
			});
		},
		onSubmitGenerateDocket: function() {
			var oHeader = this.getView().getModel("orderdetailsheader");
			var oItem = this.getView().getModel("orderdetailsItem");
			if (this.currentAction === this.getView().getModel("constants").getData().VIEW_MODES.GENERATE) {
				if (BO.valiadate(this.getView())) {
					BusyIndicator.show();
					BO.GenerateDocket(oHeader, oItem, this.getModel())
						.then(function(oResponse) {
							BusyIndicator.hide();
							var oSuccessMessageDialog = this.getDocketSuccessDialog(oResponse.DocketNum, "generateDocketSucess");
							oSuccessMessageDialog.open();
							this.showMessagePopover(this.getMessageIndicatorButton());

						}.bind(this))
						.fail(function() {
							BusyIndicator.hide();
						}.bind(this));
				} else {
					this.removeAllMessages();
					this.addMessage(this.getI18NModelText("generateDocketValidationError"));
					this.openMessagePopOver(this.getMessageIndicatorButton());
				}
			}
			if (this.currentAction === this.getView().getModel("constants").getData().VIEW_MODES.EDIT) {
				//if (BO.valiadate(this.getView())) {
					BusyIndicator.show();
					BO.EditDocket(oHeader, oItem, this.getModel())
						.then(function(oResponse) {
							BusyIndicator.hide();
							var oSuccessMessageDialog = this.getDocketSuccessDialog(oResponse.DocketNum, "editDocketSucess");
							oSuccessMessageDialog.open();
							this.showMessagePopover(this.getMessageIndicatorButton());

						}.bind(this))
						.fail(function() {
							BusyIndicator.hide();
						}.bind(this));
			//	} else {
			//		this.removeAllMessages();
			//		this.addMessage(this.getI18NModelText("generateDocketValidationError"));
			//		this.openMessagePopOver(this.getMessageIndicatorButton());
			//	}
			}
		},
		getMessageIndicatorButton: function() {
			return this.getView().byId("idMessagePopOver");
		},
		onEnterDistributionChannel: function(oEvent) {
			var sSelectedDistributionChannelKey = oEvent.getSource().getProperty("selectedKey");
			/*		if (sSelectedDistributionChannelKey === '12') {
					this.byId("idSelectHeaderFormSalesGroup").setSelectedKey("014");
				} else {
					this.byId("idSelectHeaderFormSalesGroup").setSelectedKey("015");
				}*/
			BO.initialiseFields(sSelectedDistributionChannelKey, this.getView());
		},
		getDocketSuccessDialog: function(sDocketNumber, sActionText) {
			var oDialogContent = new HBox({
				items: [
					new Text({
						text: sDocketNumber
					}).addStyleClass("sapUiTinyMarginEnd"),
					new Text({
						text: this.getI18NModelText(sActionText)
					})
				]
			});
			return this.getSuccessDialog(oDialogContent);
		},
		onChangeItemQuantity: function(oEvent) {
			this.removeAllMessages();
			this.TotalQuantity = 0;
			this.TotalQuantity = this.getView().getModel("Total").getData().totalQty;

			var oBindingContext = oEvent.getSource().getBindingContext("orderdetailsItem");
			var sPath = oBindingContext.getPath();
			var oSelectedObject = oBindingContext.getModel().getObject(sPath);
			if (BO.validateEnteredQuantity(oSelectedObject)) {
				this.addMessage(this.getI18NModelText("enteredQuantityValidationFail"));
				this.showMessagePopover(this.getMessageIndicatorButton());
				oEvent.getSource().setValueState("Error");
				oEvent.getSource().setValueStateText(this.getI18NModelText("enteredQuantityValidationFail"));
			} else {
				oEvent.getSource().setValueState("None");
				var aItems = this.getView().getModel("orderdetailsItem").getData();
				var TotalQuantity = 0;
				aItems.forEach(function(item) {
					TotalQuantity = parseInt(TotalQuantity, 10) + parseInt(item.Quantity, 10);
				});
				this.TotalQuantity = parseInt(this.TotalQuantity, 10) + parseInt(oSelectedObject.Quantity, 10);

				this.getView().setModel(new JSONModel({
					totalQty: TotalQuantity
				}), "Total");
			}
		},
		onChangeItemReleaseQuantity: function(oEvent) {
			this.removeAllMessages();
			this.TotalQuantity = 0;
			this.TotalQuantity = this.getView().getModel("Total").getData().totalQty;

			var oBindingContext = oEvent.getSource().getBindingContext("orderdetailsItem");
			var sPath = oBindingContext.getPath();
			var oSelectedObject = oBindingContext.getModel().getObject(sPath);
			if (BO.validateEnteredReleaseQuantity(oSelectedObject)) {
				this.addMessage(this.getI18NModelText("enteredQuantityValidationFail"));
				this.showMessagePopover(this.getMessageIndicatorButton());
				oEvent.getSource().setValueState("Error");
				oEvent.getSource().setValueStateText(this.getI18NModelText("enteredQuantityValidationFail"));
			} else {
				oEvent.getSource().setValueState("None");
				var aItems = this.getView().getModel("orderdetailsItem").getData();
				var TotalQuantity = 0;
				aItems.forEach(function(item) {
					TotalQuantity = parseInt(TotalQuantity, 10) + parseInt(item.ReleaseQuantity, 10);
				});
				this.TotalQuantity = parseInt(this.TotalQuantity, 10) + parseInt(oSelectedObject.ReleaseQuantity, 10);

				this.getView().setModel(new JSONModel({
					totalQty: TotalQuantity
				}), "Total");
			}
		},
		onChangeItemRelocateQuantity: function(oEvent) {
			this.removeAllMessages();
			this.TotalQuantity = 0;
			this.TotalQuantity = this.getView().getModel("Total").getData().totalQty;

			var oBindingContext = oEvent.getSource().getBindingContext("orderdetailsItem");
			var sPath = oBindingContext.getPath();
			var oSelectedObject = oBindingContext.getModel().getObject(sPath);
			if (BO.validateEnteredRelocateQuantity(oSelectedObject)) {
				this.addMessage(this.getI18NModelText("enteredQuantityValidationFail"));
				this.showMessagePopover(this.getMessageIndicatorButton());
				oEvent.getSource().setValueState("Error");
				oEvent.getSource().setValueStateText(this.getI18NModelText("enteredQuantityValidationFail"));
			} else {
				oEvent.getSource().setValueState("None");
				var aItems = this.getView().getModel("orderdetailsItem").getData();
				var TotalQuantity = 0;
				aItems.forEach(function(item) {
					TotalQuantity = parseInt(TotalQuantity, 10) + parseInt(item.RelocateQuantity, 10);
				});
				this.TotalQuantity = parseInt(this.TotalQuantity, 10) + parseInt(oSelectedObject.RelocateQuantity, 10);

				this.getView().setModel(new JSONModel({
					totalQty: TotalQuantity
				}), "Total");
			}
		},
		onChangeTokenNo: function(oEvent) {
			if (oEvent.getParameter("newValue")) {
				this.removeAllMessages();
				oEvent.getSource().setValueState("None");
			}
		},
		onSetDate: function() {
			BO.setAllowedDateRange(this.getView(), false);
		},
		onPressDeleteOrderItem: function(oEvent) {

			var oContext = oEvent.getParameter("item").getBindingContext("orderdetailsItem");
			var sSelectedPath = oContext.getPath();
			var oModel = oEvent.getParameter("item").getBindingContext("orderdetailsItem").getModel();
			var index = parseInt(sSelectedPath.charAt(1), 10);

			var aData = oModel.getData();
			aData[index].ActionIndicator = "D";

			var aDeletedData = oModel.getProperty("/DeletedOrderItemTableData") || [];
			aDeletedData.push(aData[index]);
			aData.splice(index, 1);
			oModel.setData(aData);
			oModel.setProperty("/DeletedOrderItemTableData", aDeletedData);

		},
		onDeleteDocketConfirmation: function() {
			var oDeleteDocketDialog = this.getDocketDeleteDialog(
				new Text({
					text: "Selected Docket will be deleted. Are you sure?"
				}),
				new Button({
					type: ButtonType.Emphasized,
					text: "Delete",
					press: function() {
						this.onDeleteDocket();
						oDeleteDocketDialog.close();
						oDeleteDocketDialog.destroy();
					}.bind(this)
				}));
			oDeleteDocketDialog.open();
		},
		onDeleteDocket: function() {
			BusyIndicator.show();
			var oHeader = this.getView().getModel("orderdetailsheader");
			var oItem = this.getView().getModel("orderdetailsItem");
			BO.DeleteDocket(oHeader, oItem, this.getModel())
				.then(function(oResponse) {
					BusyIndicator.hide();
					var oSuccessMessageDialog = this.getDocketSuccessDialog(oResponse.DocketNum, "deleteDocketSucess");
					oSuccessMessageDialog.open();
					this.showMessagePopover(this.getMessageIndicatorButton());

				}.bind(this))
				.fail(function() {
					BusyIndicator.hide();
				}.bind(this));
		},
		onCancelGenerateDocket: function() {
			this.onNavBack();
		}
	});
});