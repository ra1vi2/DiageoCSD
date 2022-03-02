/*global XLSX*/
sap.ui.define([
	"../util/Utility"
], function(Utility) {
	"use strict";

	return {

		readExcelData: function(file, oView) {
			var that = this;
			var excelData = {};
			var oModel = oView.getModel("uploadData");
			if (file && window.FileReader) {
				var reader = new FileReader();
				reader.onload = function(e) {
					var data = e.target.result;
					var workbook = XLSX.read(data, {
						type: 'binary'
					});
					workbook.SheetNames.forEach(function(sheetName) {
						// Here is your object for every sheet in workbook
						excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);

					});
					// Setting the data to the local model 
					oModel.setData({
						items: excelData
					});
					oModel.refresh(true);
					oView.byId("idUploadStepCompleteButton").setVisible(true);
				};
				reader.onerror = function(ex) {

				};
				reader.readAsBinaryString(file);
			}
		},

		validateUploadFields: function(oView) {
			if (oView.byId("idUploadDate").getValueState() === "Error" || oView.byId("idUploadDate").getValue() === "") {
				oView.byId("idUploadDate").setValueState("Error");
				return false;
			}
			if (!oView.byId("idTokenFileUploader").getValue()) {
				oView.byId("idTokenFileUploader").setValueState("Error");
				return false;
			}
			return true;
		},
		validateTableLine: function(data) {
			if (!data.DC ||
				!data.DIV ||
				!data.ORDER ||
				!data.DATE ||
				!data.CUSTOMER ||
				!data.PLANT ||
				!data.QTY) {
				return "mandatoryValidationFailed";
			}
			if (data.DC === '12' && !data.INDEX) {
				return "indexValidationFailed";
			}
			if (data.DC === '11' && !data.MATERIALCD) {
				return "materialCodeValidationFailed";
			}

		},
		validateDataFromAPI: function(oModel, aData) {
			aData.BOAction = "VALIDATE";
			return Utility.odataCreate(oModel, "\entitySetname", aData);
		}
	};

});