/*global XLSX*/
sap.ui.define([
	"../util/Utility",
	"sap/ui/export/Spreadsheet"
], function(Utility, Spreadsheet) {
	"use strict";

	return {

		readExcelData: function(file, oView) {
			var excelData = {};
			var oModel = oView.getModel("uploadData");
			if (file && window.FileReader) {
				var reader = new FileReader();
				reader.onload = function(e) {
					var data = e.target.result;
					var workbook = XLSX.read(data, {
						type: "binary",
						cellDates: true,
						dateNF: 'dd-mm-yyyy;@'
					});
					workbook.SheetNames.forEach(function(sheetName) {
						// Here is your object for every sheet in workbook
						excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName], {
							raw: false
						});

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
			if (data.DC === "12" && !data.INDEX) {
				return "indexValidationFailed";
			}
			if (data.DC === "11" && !data.MATERIAL) {
				return "materialCodeValidationFailed";
			}

		},
		prepareUploadPayload: function(oView, aData, sBOAction) {
			var aHeaderData = {};
			aHeaderData.Action = sBOAction;
			aHeaderData.Plant = oView.byId("idUploadFormPlant").getSelectedKey();
			aHeaderData.DC = oView.byId("idUploadDC").getSelectedKey();
			aHeaderData.Date = oView.byId("idUploadDate").getDateValue();
			//aHeaderData.Salesoffice = oView.byId("idSalesOffice").getValue();
			aHeaderData.SalesGroup = oView.byId("idSalesGroup").getSelectedKey();
			aHeaderData.UploadType = "INDENT";
			var oItemData = {};
			oItemData.IndHdrUpldNav = aData;
			var aPayload = Utility.merge({}, aHeaderData, oItemData);
			return aPayload;
		},
		validateDataFromAPI: function(oView, oModel, aData) {
			var aPayload = this.prepareUploadPayload(oView, aData, "VALIDATE");
			return Utility.odataCreate(oModel, "/IndUpldHdrSet", aPayload);
		},

		submitOrderUpload: function(oModel, aData) {
			aData.Action = "SUBMIT";
			return Utility.odataCreate(oModel, "/IndUpldHdrSet", aData);
		},

		exportToExcel: function(oModel, oColumns, oModelProperty) {
			var that = this,
				oExcelData, oSettings, oSheet;

			oExcelData = JSON.parse(JSON.stringify(oModelProperty), function(key, value) {
				if ((key.includes("Date")) && value) {
					return that.onDateFormat(value);
				}
				return value;
			});
			oSettings = {
				workbook: {
					columns: oColumns,
					context: {
						application: "Order Upload Validation",
						title: "Order Upload Validation",
						sheetName: "Order Upload Validation"
					}
				},

				fileName: "Order Upload Validation",
				dataSource: oExcelData
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function() {

				})
				.finally(oSheet.destroy);
		},
		onDateFormat: function(oDate) {
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd/MM/yyyy"
			});
			return dateFormat.format(new Date(oDate), false);
		},
		ValidatedTableColumns: function() {
			var oColumns = [];

			oColumns.push({
				label: "DC",
				property: "DC"
			});
			oColumns.push({
				label: "DIV",
				property: 'DIV'

			});
			oColumns.push({
				label: "ORDER",
				property: "ORDER"
			});
			oColumns.push({
				label: "DATE",
				property: "DATE"
			});
			oColumns.push({
				label: "CUSTOMER",
				property: "CUSTOMER"
			});
			oColumns.push({
				label: "CUSTOMER NAME",
				property: "CustName"
			});
			oColumns.push({
				label: "Sales Office",
				property: "SalesOffice"
			});
			oColumns.push({
				label: "Plant",
				property: "PLANT"
			});
			oColumns.push({
				label: "Plant Name",
				property: "PlantName"

			});
			oColumns.push({
				label: "Index",
				property: "INDEX"
			});
			oColumns.push({
				label: "Quantity",
				property: "QTY"
			});
			oColumns.push({
				label: "Material Code",
				property: "MATERIAL"
			});
			oColumns.push({
				label: "Material Description",
				property: "MaterialDescription"
			});
			oColumns.push({
				label: "Brand",
				property: "Brand"
			});
			oColumns.push({
				label: "Pack",
				property: "Pack"
			});
			oColumns.push({
				label: "Error Message",
				property: "Remarks"
			});

			return oColumns;

		},
		SampleColumns: function() {
			var oColumns = [];

			oColumns.push({
				label: "DC",
				property: "DC"
			});
			oColumns.push({
				label: "DIV",
				property: 'DIV'

			});
			oColumns.push({
				label: "CUSTOMER",
				property: "CUSTOMER"
			});
			oColumns.push({
				label: "ORDER",
				property: "ORDER"
			});
			oColumns.push({
				label: "DATE",
				property: "DATE"
			});
			oColumns.push({
				label: "PLANT",
				property: "PLANT"
			});
			oColumns.push({
				label: "INDEX",
				property: "INDEX"
			});
			oColumns.push({
				label: "QTY",
				property: "QTY"
			});
			oColumns.push({
				label: "MATERIAL",
				property: "MATERIAL"
			});

			return oColumns;

		}
	};

});