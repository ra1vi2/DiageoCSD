sap.ui.define([
	"com/diageo/csdzindactrep/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/ui/export/Spreadsheet",
	"sap/m/PDFViewer"
], function(BaseController, JSONModel, MessageToast, Filter, FilterOperator, MessageBox, Spreadsheet, PDFViewer) {
	"use strict";

	return BaseController.extend("com.diageo.csdzindactrep.controller.IndentActual", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.diageo.csdzindactrep.view.IndentActual
		 */
		onInit: function() {
			//reference for oData Model
			this.oComponent = this.getOwnerComponent();
			this.oDataModel = this.oComponent.getModel();

			//RouteMatched Method
			var oRouter = this.oComponent.getRouter();
			oRouter.getRoute("Indent").attachPatternMatched(this._oRouteMatchMethod, this);
		},

		/**
		 ** Internal RouteMatch method
		 ** @Public
		 ** @param{*}
		 **return{*]
		 **/
		_oRouteMatchMethod: function() {

			//Local Model
			var oLocalModel = new JSONModel();
			oLocalModel.setData({
				"printEnabled": false,
				"DefaultViewType": 0,
				"totalIndentQuantity": 0,
				"totalBalanceQuantity": 0,
				"totalInvoiceQuantity": 0,
				"DistributionChannel": [{
					text: "11-DirectSale",
					key: "11"
				}, {
					text: "12-CSD",
					key: "12"
				}]
			});
			this.setModel(oLocalModel, "local");

			//Default the Date Range to current month
			var date = new Date();
			this.getView().byId("DateRangeID").setDateValue(new Date(date.getFullYear(), date.getMonth(), 1));
			this.getView().byId("DateRangeID").setSecondDateValue(new Date(date.getFullYear(), date.getMonth() + 1, 0));

			//Table model declared here to disable to Export button.
			var oModel = new JSONModel();
			this.setModel(oModel, "TableModel");

			//Region API call
			this.onRegionAPICall();

		},

		/**
		 ** Event triggered on Region data requested
		 ** @Public
		 ** @param{*}
		 **return{*]
		 **/
		onRegionAPICall: function() {
			var that = this;
			this.getView().byId("regionID").setBusy(true);
			this.oDataModel.read("/RegionListSet", {
				success: function(oData) {
					var oModel = new JSONModel();
					that.getView().byId("regionID").setBusy(false);
					oModel.setData(oData.results);
					that.setModel(oModel, "RegionModel");
					if (oData.results.length > 0) {
						that.getView().byId("regionID").setSelectedKey(oData.results[0].Region);
						that.onReasonChange();
					}
				},
				error: function(oError) {
					that.getView().byId("regionID").setBusy(false);
					MessageBox.error(that.getResourceBundle().getText("SERVICE_ERROR"));
				}
			});
		},

		/**
		 ** Event triggered on SalesOffice data Received
		 ** @Public
		 ** @param{*}
		 **return{*]
		 **/
		onReasonChange: function() {
			var that = this,
				oModel = new JSONModel(),
				aFilters = [],
				oRegionKey = this.getView().byId("regionID").getSelectedKey();
			if (oRegionKey === "5") {
				this.getView().byId("DCID").setSelectedKey("12");
			} else {
				this.getView().byId("DCID").setSelectedKey("11");
			}
			aFilters.push(new Filter({
				path: "Region",
				operator: FilterOperator.EQ,
				value1: oRegionKey

			}));

			this.getView().byId("salesOfficeID").setBusy(true);
			this.oDataModel.read("/SalesOfficeSet", {
				filters: aFilters,
				success: function(oData) {
					that.getView().byId("salesOfficeID").setBusy(false);
					oModel.setData(oData.results);
					that.setModel(oModel, "SalesOfficeModel");

				},
				error: function(oError) {
					that.getView().byId("salesOfficeID").setBusy(false);
					MessageBox.error(that.getResourceBundle().getText("SERVICE_ERROR"));
				}
			});
		},

		/**
		 ** Event triggered on Date range is changed
		 ** @Public
		 ** @param{*}
		 **return{*]
		 **/
		onDateRangeChange: function(oEvt) {
			if (oEvt.getParameter('valid')) {
				oEvt.getSource().setValueState("None");
			} else {
				oEvt.getSource().setValueState("Error");
			}
		},
		/**
		 ** Event triggered when Go button of filter serach is pressed
		 ** @Public
		 ** @param{*}
		 **return{*]
		 **/
		onFilterSearch: function(oEvent) {
			try {
				if (this.getView().byId("DateRangeID").getValueState() === "Error" || this.getView().byId("DateRangeID").getValue() === "") {
					MessageBox.error(this.getResourceBundle().getText("FILTER_VALIDATION"));
					this.getModel("TableModel").setProperty("/", []);
					this.getModel("TableModel").refresh(true);
					return false;
				}
				var that = this,
					aFilters = [],
					oTotalIndentQuantity = 0,
					oTotalBalanceQuantity = 0,
					oTotalInvoiveQuantity = 0,
					oLocalModel = this.getModel("local"),
					//Table ID referece
					oTable = this.getView().byId("indentTableID"),
					//Region value
					oRegion = this.getView().byId("regionID").getSelectedKey(),
					//Sales Office
					oSalesOffice = this.getView().byId("salesOfficeID").getSelectedKey(),
					//Distribution Channel
					oDistributionChannel = this.getView().byId("DCID").getSelectedKey(),
					//Start Date
					oStartDate = this.getView().byId("DateRangeID").getDateValue(),
					// End Date
					oEndDate = this.getView().byId("DateRangeID").getSecondDateValue();

				aFilters.push(new Filter({
					path: "Region",
					operator: FilterOperator.EQ,
					value1: oRegion
				}));
				aFilters.push(new Filter({
					path: "Vkbur",
					operator: FilterOperator.EQ,
					value1: oSalesOffice
				}));
				aFilters.push(new Filter({
					path: "DcId",
					operator: FilterOperator.EQ,
					value1: oDistributionChannel
				}));
				aFilters.push(new Filter({
					path: "InDate",
					operator: FilterOperator.BT,
					value1: new Date(oStartDate.setHours(5, 30)),
					value2: new Date(oEndDate.setHours(5, 30))
				}));
				aFilters.push(new Filter({
					path: "ReportType",
					operator: FilterOperator.EQ,
					value1: oLocalModel.getProperty("/DefaultViewType") === 0 ? "S" : "D"

				}));

				this.getView().setBusy(true);
				this.oDataModel.read("/SalesIndentRptSet", {
					filters: aFilters,
					success: function(oData) {
						that.getView().setBusy(false);
						if (oData.results.length > 0) {
							//get total values
							if (oLocalModel.getProperty("/DefaultViewType") === 0) {
								oData.results.forEach(function(ele) {
									oTotalIndentQuantity = oTotalIndentQuantity + parseFloat(ele.IndQuantity);
									oTotalBalanceQuantity = oTotalBalanceQuantity + parseFloat(ele.BalQuantity);
									oTotalInvoiveQuantity = oTotalInvoiveQuantity + parseFloat(ele.InvQuantity);
								});
								//append total values to localModel
								oLocalModel.setProperty("/totalIndentQuantity", parseFloat(oTotalIndentQuantity).toFixed(3));
								oLocalModel.setProperty("/totalBalanceQuantity", parseFloat(oTotalBalanceQuantity).toFixed(3));
								oLocalModel.setProperty("/totalInvoiceQuantity", parseFloat(oTotalInvoiveQuantity).toFixed(3));
								oLocalModel.refresh(true);
							} else {
								that._fnTotalQuantity();
							}
						} else {
							oLocalModel.setProperty("/totalIndentQuantity", "");
							oLocalModel.setProperty("/totalBalanceQuantity", "");
							oLocalModel.setProperty("/totalInvoiceQuantity", "");
							oLocalModel.refresh(true);
							oTable.setNoDataText("No Data to display");
						}
						//Table Model
						var oModel = that.getModel("TableModel");
						oModel.setSizeLimit(oData.results.length);
						oModel.setData(oData.results);
						oModel.refresh(true);

					},
					error: function(oError) {
						that.getView().setBusy(false);
						MessageBox.error(that.getResourceBundle().getText("SERVICE_ERROR"));
						oTable.setNoDataText("No Data to display");

					}
				});
			} catch (e) {
				MessageToast.show(that.getResourceBundle().getText("FILTER_VALIDATION_ERROR"));

			}
		},

		/**
		 ** Event triggered on selection of Table Item
		 **/
		onTableItemPress: function(oEvent) {
			var	oViewType = this.getModel("local").getProperty("/DefaultViewType");
			if (oViewType === 1) {
			//	this.getView().byId("indentTableID").setMode(sap.m.ListMode.SingleSelectMaster);
			   this.getModel("local").setProperty("/printEnabled", true);
			}else{
		//	this.getView().byId("indentTableID").setMode(sap.m.ListMode.None);
			this.getModel("local").setProperty("/printEnabled", false);
			}
			this.getModel("local").refresh(true);
		},
		
		/**
		 ** Event triggerd once table is updated with Data
		 **/
		onTableUpdateFinish:function(){
			this.getView().byId("indentTableID").removeSelections();
			this.getModel("local").setProperty("/printEnabled", false);
			this.getModel("local").refresh(true);
			
		},
		
		/**
		 ** Event triggerd to display the PDF on selection of Invoice Record
		 **/
		onPDFPrint:function(){
			var oSelectedItem = this.getView().byId("indentTableID").getSelectedItem().getBindingContext("TableModel").getObject();
				if (oSelectedItem.RequestType !== "") {
					var opdfViewer = new PDFViewer();
					this.getView().addDependent(opdfViewer);
					var sServiceURL = this.getOwnerComponent().getModel("ZDLT_SALES_INVOICE_SRV").sServiceUrl;
					var sSource = sServiceURL + "/InvPdfSet('" + oSelectedItem.RequestType + "')" + "/NavPdfToDoc" + "/$value";
					opdfViewer.setSource(sSource);
					opdfViewer.setTitle("Invoice Print");
					opdfViewer.open();
				}else{
					MessageBox.error("Selected Record doesn't had Invoice number to print");
				}
		},

		/**
		 ** Internal function to return Date format for exporting
		 ** @Public
		 ** @param{Date Value}
		 **return[Date in format dd/MM/yyyy]
		 **/
		onDateFormat: function(oDate) {
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd/MM/yyyy"
			});
			return dateFormat.format(new Date(oDate), false);
		},

		/**
		 ** Internal function to return the table columns
		 ** @Public
		 ** @param{*}
		 **return{table columns]
		 **/
		_fnTableColumns: function() {
			var oColumns = [],
				oLocalModel = this.getModel("local");

			oColumns.push({
				label: this.getResourceBundle().getText("INDENT_NUM"),
				property: "IndDocket"
			});
			oColumns.push({
				label: this.getResourceBundle().getText("INDENT_DATE"),
				property: 'IndDate'

			});
			oColumns.push({
				label: this.getResourceBundle().getText("INDENT_REFERENCE_NUMBER"),
				property: "IndRefno"
			});
			oColumns.push({
				label: this.getResourceBundle().getText("DC"),
				property: "DcId"
			});
			oColumns.push({
				label: this.getResourceBundle().getText("DIVISION"),
				property: "DivisionId"
			});
			oColumns.push({
				label: this.getResourceBundle().getText("CUSTOMER_CODE"),
				property: "Customer"
			});
			oColumns.push({
				label: this.getResourceBundle().getText("CUSTOMER_NAME"),
				property: "CustomerName"
			});
			oColumns.push({
				label: this.getResourceBundle().getText("ORDER_NUM"),
				property: "OrderNum"
			});
			oColumns.push({
				label: this.getResourceBundle().getText("ORDER_DATE"),
				property: "OrderDate"

			});
			oColumns.push({
				label: this.getResourceBundle().getText("PLANT"),
				property: "Werks"
			});
			oColumns.push({
				label: this.getResourceBundle().getText("BRAND"),
				property: "Brand"
			});
			oColumns.push({
				label: this.getResourceBundle().getText("MATCD"),
				property: "Matnr"
			});
			oColumns.push({
				label: this.getResourceBundle().getText("MATERIAL_DESCRIPTION"),
				property: "Maktx"
			});
			oColumns.push({
				label: this.getResourceBundle().getText("PACK"),
				property: "Pack"
			});
			oColumns.push({
				label: this.getResourceBundle().getText("INDENT_QUANTITY"),
				property: "IndQuantity"
			});
			oColumns.push({
				label: this.getResourceBundle().getText("BULK_ORDER_NUM"),
				property: "BulkOrdNo"
			});
			oColumns.push({
				label: this.getResourceBundle().getText("BALANCE_QUANTITY"),
				property: "BalQuantity"
			});
			oColumns.push({
				label: this.getResourceBundle().getText("INVOICE_QUANTITY"),
				property: "InvQuantity"
			});
			if (oLocalModel.getProperty("/DefaultViewType") === 1) {
				oColumns.push({
					label: this.getResourceBundle().getText("INVOICE_NUMBER"),
					property: "RequestType"
				});
				oColumns.push({
					label: this.getResourceBundle().getText("INVOICE_DATE"),
					property: "InvDate"
				});
				oColumns.push({
					label: this.getResourceBundle().getText("QUANTITY"),
					property: "Quantity"
				});
				oColumns.push({
					label: this.getResourceBundle().getText("PERMIT_NUM"),
					property: "TpPermitNum"
				});
				oColumns.push({
					label: this.getResourceBundle().getText("PERMIT_DATE"),
					property: "TpPermitDate"
				});
				oColumns.push({
					label: this.getResourceBundle().getText("DOCKET_NUMBER"),
					property: "DocketNum"
				});
			}
			return oColumns;

		},
		/**
		 ** Event triggered when export button is pressed,it downloads the table data in .xlxs format
		 ** @Public
		 ** @param{*}
		 **return{*]
		 **/
		onTableExportPress: function(oEvent) {

			var that = this,
				oExcelData, oSettings, oSheet;
			oExcelData = JSON.parse(JSON.stringify(this.getModel("TableModel").getProperty("/")), function(key, value) {
				if ((key.includes("IndDate") || key.includes("OrderDate") || key.includes("InvDate") || key.includes("TpPermitDate")) && value) {
					return that.onDateFormat(value);
				}
				return value;
			});
			oSettings = {
				workbook: {
					columns: this._fnTableColumns(),
					context: {
						application: "Indent vs Actual Report",
						title: "Indent vs Actual Report",
						sheetName: "Indent vs Actual Report"
					}
				},

				fileName: "Indent vs Actual Report",
				dataSource: oExcelData
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function() {
					sap.m.MessageToast.show("Indent vs Actual Report sheet export has finished");
				})
				.finally(oSheet.destroy);
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.diageo.csdzindactrep.view.IndentActual
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.diageo.csdzindactrep.view.IndentActual
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.diageo.csdzindactrep.view.IndentActual
		 */
		//	onExit: function() {
		//
		//	}

	});

});