sap.ui.define([
	"sap/base/util/merge"
], function(merge) {
	"use strict";
	return {
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
		}
	};
});