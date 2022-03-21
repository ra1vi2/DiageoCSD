sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/diageo/csd/indentuploadzindentupload/model/models",
	"sap/ui/core/syncStyleClass"
], function(UIComponent, Device, models, SyncStyleClass) {
	"use strict";

	return UIComponent.extend("com.diageo.csd.indentuploadzindentupload.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			this._oMessageManager = sap.ui.getCore().getMessageManager();

			this.setModel(
				sap.ui.getCore().getMessageManager().getMessageModel(),
				"message");

			var jQueryScript = document.createElement('script');
			jQueryScript.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.10.0/jszip.js");
			document.head.appendChild(jQueryScript);

			var jQueryScript2 = document.createElement("script");
			jQueryScript2.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.10.0/xlsx.js");
			document.head.appendChild(jQueryScript2);

		},
		initializeMessagePopover: function(oView, oButton) {
			this._oMessageButton = oButton;
			this._oMessagePopover = sap.ui.xmlfragment(
				oView.getId(),
				"com.diageo.csd.indentuploadzindentupload.fragments.MessagePopover",
				this
			);

			var oMessageModel = this._oMessageManager.getMessageModel();
			this._oMessagePopover.setModel(oMessageModel, "message");
			oView.addDependent(this._oMessagePopover);
		},
		getMessageModel: function() {
			return this._oMessageManager.getMessageModel();
		},
		showMessagePopover: function(oMessageButton) {
			var oButton = oMessageButton || this._oMessageButton,
				aMessages = this._oMessageManager.getMessageModel().getData();

			if (oButton.getDomRef()) {
				if (aMessages.length > 0) {
					this._openMessagePopover(oButton);
				} else {
					// Log.info("No messages found");
				}
			} else {
				var oRenderingDelegate = {
					onAfterRendering: function() {
						// UI5 fires onAfterRendering before focus of the last focused element is restored
						// One has to wait for focus to restore so that the the last element is still focused after closing a popover
						setTimeout(this._openMessagePopover.bind(this), 0, oButton);
						oButton.removeEventDelegate(oRenderingDelegate);
					}
				};

				oButton.addEventDelegate(oRenderingDelegate, this);
			}
		},
		_openMessagePopover: function(oMessageButton) {
			// Sync the style class for mobiles & desktops as Popovers don't auto inherit it
			SyncStyleClass(
				"sapUiSizeCompact",
				oMessageButton,
				this._oMessagePopover
			);
			this._oMessagePopover.openBy(oMessageButton);
		}
	});
});