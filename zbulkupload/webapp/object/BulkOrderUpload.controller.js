sap.ui.define([
	"../app/BaseController",
	"sap/m/MessageToast",
	"sap/ui/core/BusyIndicator",
	"./BulkOrderUploadBO",
	"sap/ui/model/json/JSONModel",
	"sap/m/HBox",
	"sap/m/Text"
], function(BaseController, MessageToast, BusyIndicator, BO, JSONModel, HBox, Text) {
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
			this.getView().setModel(new JSONModel(), "this");
			this.getModel("this").setProperty("/isValidaionSuccess", false);
			this.oWizard = this.byId("UploadWizard");

			this.getModel("this").setProperty("/IsValidationError", true);

			// activate automatic message generation for complete view
			oMessageManager.registerObject(this.getView(), true);
			this.getRouter().getRoute("bulkupload").attachPatternMatched(this._onBulkUpload, this);
			this.getRouter().attachBypassed(this.onBypassed, this);

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
		onPressSampleDownload: function() {
			BO.exportToExcel(this.getModel("sample"), BO.SampleColumns(), this.getModel("sample").getProperty("/sample"),
				"Order Upload Template"
			);
			//window.open(sap.ui.require.toUrl("com/diageo/csd/bulkuploadzbulkupload/model/sample_upload_format.xlsx"));
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
				this.byId("idUploadStepCompleteButton").setEnabled(false);
			} else {
				this.oWizard.invalidateStep(this.byId("UploadFileStep"));
			}
		},
		onValidateStepComplete: function() {
			this.removeAllMessages();
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
			} else {
				BusyIndicator.hide();
				that.showMessagePopover(this.getMessageIndicatorButton());
			}
		},
		_handlevalidateDataFromAPISuccess: function(oResponse) {
			this.oWizard.nextStep();
			this.getView().setModel(new JSONModel(oResponse), "ValidatedDataModel");
			this.getModel("this").setProperty("/IsValidationError", oResponse.IsValidationError);
			BusyIndicator.hide();
		},
		handleWizardCancel: function() {
			this.byId("idUploadStepCompleteButton").setEnabled(true);
			var oFirstStep = this.oWizard.getSteps()[0];
			this.oWizard.discardProgress(oFirstStep);
			this.oWizard.goToStep(oFirstStep);
			//this.oWizard.setValidated(false);
			this.byId("idTokenFileUploader").setValue();
			this.removeAllMessages();
		},
		onSubmitOrderUpload: function() {
			this.removeAllMessages();
			var oDataModel = this.getView().getModel("ValidatedDataModel");
			BO.submitOrderUpload(this.getModel(), oDataModel.getData())
				.then(function() {
					this._handleValidateDataUploadSuccess.apply(this, arguments);
				}.bind(this))
				.fail(function() {
					BusyIndicator.hide();
					this.showMessagePopover();
				}.bind(this));
		},

		_handleValidateDataUploadSuccess: function() {
			BusyIndicator.hide();
			var oSuccessMessageDialog = this.getDocketSuccessDialog();
			oSuccessMessageDialog.open();
		},

		onExportValidatedList: function() {
			BO.exportToExcel(this.getModel("ValidatedDataModel"), BO.ValidatedTableColumns(), this.getModel("ValidatedDataModel").getProperty(
				"/IndHdrUpldNav/results"), "Order Upload Validation");
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
		},
		getDocketSuccessDialog: function(sDocketNumber) {
			var oDialogContent = new HBox({
				items: [
					new Text({
						text: "File Uploaded Successfully!"
					})
				]
			});
			return this.getSuccessDialog(oDialogContent);
		},
		onChangeDC: function() {
			var sSelectedDC = this.byId("idUploadDC").getSelectedKey();
			if (sSelectedDC === '11') {
				this.byId("idSalesGroup").setSelectedKey("015");
			}
			if (sSelectedDC === '12') {
				this.byId("idSalesGroup").setSelectedKey("014");
			}
		}
	});
});