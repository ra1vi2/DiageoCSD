sap.ui.define([
	"../app/BaseController",
	"sap/m/MessageToast",
	"sap/ui/core/BusyIndicator",
	"./BulkOrderUploadBO",
	"sap/ui/model/json/JSONModel"
], function(BaseController, MessageToast, BusyIndicator, BO, JSONModel) {
	"use strict";

	return BaseController.extend("com.diageo.csd.bulkuploadzbulkupload.object.BulkOrderUpload", {

		onInit: function() {
			this.UploadData = new JSONModel();
			this.getView().setModel(this.UploadData, "uploadData");
			var oMessageManager = sap.ui.getCore().getMessageManager();
			this.getView().setModel(oMessageManager.getMessageModel(), "message");
			this.getOwnerComponent().initializeMessagePopover(
				this.getView(), this.getMessageIndicatorButton()
			);
			// activate automatic message generation for complete view
			oMessageManager.registerObject(this.getView(), true);
			this.getRouter().getRoute("bulkupload").attachPatternMatched(this._onBulkUpload, this);
			this.getRouter().attachBypassed(this.onBypassed, this);

			this.oWizard = this.byId("UploadWizard");
		},
		_onBulkUpload: function() {

		},
		onPressSaveFileButton: function(oEvent) {
			BusyIndicator.show();
			var oUploader = this.byId("idTokenFileUploader");
			if (!oUploader.getValue()) {
				MessageToast.show("Please Choose any File");
				BusyIndicator.hide();
				return;
			}
		},
		onBeforeUploadStart: function() {
			//set the upload url 
			//uploader.setUploadUrl(/sap/fileSet(key=value)/$value
		},
		onUploadComplete: function() {
			//handle upload complete here 
			MessageToast.show("File Upload Completed");
			BusyIndicator.hide();
			this.getOwnerComponent().getRouter().navTo("Main_View");
		},
		onUpload: function(oEvent) {
			BO.readExcelData(oEvent.getParameter("files") && oEvent.getParameter("files")[0], this.getView());
		},

		onUploadStepComplete: function() {
			if (BO.validateUploadFields(this.getView())) {
				this.oWizard.validateStep(this.byId("UploadFileStep"));
				this.oWizard.nextStep();
			} else {
				this.oWizard.invalidateStep(this.byId("UploadFileStep"));
			}
		},
		onValidateStepComplete: function() {
			var oView = this.getView();
			BusyIndicator.show();
			var oModel = oView.getModel("uploadData");
			var aData = oModel.getData().items;
			var that = this;
			var bUIValidationSuccess = true;
			var index = 1;

			aData.forEach(function(data) {
				var message = BO.validateTableLine(data);
				if (message) {
					that.addMessage(that.getI18NModelText(message) + index);
					message = null;
					bUIValidationSuccess = false;
					index++;
				}
			});
			if (bUIValidationSuccess) {
				BO.validateDataFromAPI(oView, this.getModel(), aData)
					.then(function() {
						this._handlevalidateDataFromAPISuccess.apply(this, arguments);
					}.bind(this))
					.fail(function() {
						BusyIndicator.hide();
						this.showMessagePopover();
					}.bind(this));
				this.oWizard.nextStep();
			} else {
				BusyIndicator.show();
				that.showMessagePopover(this.getMessageIndicatorButton());
			}
		},
		_handlevalidateDataFromAPISuccess: function(oResponse) {
			this.getView().setModel(new JSONModel(oResponse.results), "ValidatedDataModel");
		},
		onPressCancel: function() {

		},
		onUploadDateChange: function(oEvent) {
			if (oEvent.getParameter('valid')) {
				oEvent.getSource().setValueState("None");
			} else {
				oEvent.getSource().setValueState("Error");
			}
		},
		getMessageIndicatorButton: function() {
			return this.byId("idMessagePopOver");
		}
	});
});