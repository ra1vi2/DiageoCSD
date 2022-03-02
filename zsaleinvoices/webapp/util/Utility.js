sap.ui.define([
	"sap/base/util/merge"
], function(merge) {
	"use strict";
	return {
		odataRead: function(oModel, sPath, mParameters) {
			var oReadDeferred = jQuery.Deferred(),
				mRequestProps = jQuery.extend(true, {
					success: oReadDeferred.resolve,
					error: oReadDeferred.reject
				}, mParameters);

			var sPathPrefix = /^\/.*$/.test(sPath) ? "" : "/";
			oModel.read(sPathPrefix + sPath, mRequestProps);

			return oReadDeferred.promise();
		},
		odataCreate: function(oModel, sEntitySet, oEntityData, mParameters) {
			var oCreateDeferred = jQuery.Deferred(),
				mRequestProps = jQuery.extend(true, {
					success: function(oData, oResponse) {
						oCreateDeferred.resolve(oData, oResponse);
					},
					error: oCreateDeferred.reject
				}, mParameters);

			var sPathPrefix = /^\/.*$/.test(sEntitySet) ? "" : "/";
			oModel.create(sPathPrefix + sEntitySet, oEntityData,
				mRequestProps);

			return oCreateDeferred.promise();
		},
		odataUpdate: function(oODataModel, sEntitySet, oUpdatedData, mParameters) {
			var oUpdateDeferred = jQuery.Deferred();
			var mRequestProps = jQuery.extend(true, {
				success: oUpdateDeferred.resolve,
				error: oUpdateDeferred.reject
			}, mParameters);

			var sPathPrefix = /^\/.*$/.test(sEntitySet) ? "" : "/";
			oODataModel.update(sPathPrefix + sEntitySet, oUpdatedData, mRequestProps);

			return oUpdateDeferred.promise();
		},
		/**
		 * 
		 * @param {*} oModel - odata model instance
		 * @param {*} sPath - request path
		 * @param {*} mParameters - parameters map
		 * @returns {Promise} A promise to call ODATA Function Import
		 */
		odataCallFunction: function(oModel, sPath, mParameters) {
			var oCallFunctionDeferred = jQuery.Deferred(),
				mRequestProps = jQuery.extend(true, {
					success: oCallFunctionDeferred.resolve,
					error: oCallFunctionDeferred.reject
				}, mParameters);

			var sPathPrefix = /^\/.*$/.test(sPath) ? "" : "/";
			oModel.callFunction(sPathPrefix + sPath, mRequestProps);

			return oCallFunctionDeferred.promise();
		},
		readModelByIndex: function(aIndices, oModel) {
			var aData = [];
			aIndices.forEach(function(index) {
				aData.push(oModel.getData()[index]);
			});
			return aData;
		},
		getDateinOffsetFormat: function(oDate) {
			return oDate.getFullYear() + "-" + oDate.getMonth() + 1 + "-" + oDate.getDate();
		},
		merge: function(oTarget, oSource1, oSource2) {
			return merge(oTarget, oSource1, oSource2);
		},
		removeMetadata: function(oObject) {
			// Delete metadata from Object directly
			if (oObject) {
				if (oObject.constructor === Array) {
					oObject.map(this.removeMetadata.bind(this));
				} else if (oObject.constructor === Object) {
					delete oObject.__metadata;
				}

				// Loop through all properties of the object
				for (var oProperty in oObject) {
					if (oObject.hasOwnProperty(oProperty) && typeof oObject[oProperty] === "object" && oObject[oProperty]) {
						if (oObject[oProperty].hasOwnProperty("__deferred")) {
							delete oObject[oProperty];
						} else {
							// Remove metadata tag
							// Call method recursively
							this.removeMetadata(oObject[oProperty]);
						}
					}
				}
			}

			return oObject;
		}
	};
});