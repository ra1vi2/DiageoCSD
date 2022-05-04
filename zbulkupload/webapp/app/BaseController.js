sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/Fragment",
	"sap/ui/core/message/Message",
	"sap/ui/core/library",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/DialogType",
	"sap/ui/core/ValueState"
], function(Controller, History, Fragment, Message, library, Dialog, Button, ButtonType, DialogType, ValueState) {
	"use strict";

	return Controller.extend("com.diageo.csd.bulkuploadzbulkupload.app.BaseController", {
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("bulkupload", {}, true);
			}
		},
		openMessagePopOver: function(oSource) {
			this._getMessagePopover(this.getView()).then(function(oMessagePopover) {
				oMessagePopover.openBy(oSource);
			});
		},

		onMessagePopoverPress: function(oEvent) {
			var oSourceControl = oEvent.getSource();
			this._getMessagePopover(this.getView()).then(function(oMessagePopover) {
				oMessagePopover.openBy(oSourceControl);
			});
		},
		removeAllMessages: function() {
			this._oMessageManager = sap.ui.getCore().getMessageManager();
			this._oMessageManager.removeAllMessages();
		},
		_getMessagePopover: function(oView) {
			//var oView = this.getView();
			// create popover lazily (singleton)
			if (!this._pMessagePopover) {
				this._pMessagePopover = Fragment.load({
					id: oView.getId(),
					name: "com.diageo.csd.bulkuploadzbulkupload.fragments.MessagePopover"
				}).then(function(oMessagePopover) {
					oView.addDependent(oMessagePopover);
					return oMessagePopover;
				});
			}
			return this._pMessagePopover;
		},

		addMessage: function(message) {
			var MessageType = library.MessageType;
			var oMessage = new Message({
				message: message,
				type: MessageType.Error,
				target: "/Dummy",
				processor: this.getView().getModel()
			});
			sap.ui.getCore().getMessageManager().addMessages(oMessage);
		},
		getI18NModelText: function(sText) {
			return this.getView().getModel("i18n").getResourceBundle().getText(sText);
		},
		showMessagePopover: function(oMessageButton) {
			this.getOwnerComponent().showMessagePopover(oMessageButton);
		},
		getSuccessDialog: function(oDialogContent) {
			var oSuccessMessageDialog = new Dialog({
				type: DialogType.Message,
				title: ValueState.Success,
				state: ValueState.Success,
				content: oDialogContent,
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: "OK",
					press: function() {
						oSuccessMessageDialog.close();
						oSuccessMessageDialog.destroy();
						this.onNavBack();
					}.bind(this)
				})
			});

			return oSuccessMessageDialog;
		}
	});
});