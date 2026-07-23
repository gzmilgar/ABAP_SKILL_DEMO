sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("com.gilgar.aquamonitor.controller.App", {

        onInit: function () {
            this.getOwnerComponent().getContentDensityClass &&
                this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        },

        /**
         * Tum tablolardaki listeleri ve tab sayaclarini yeniler.
         */
        onRefresh: function () {
            this.getView().getModel().refresh();
        },

        /**
         * SearchField -> app:tableId custom data'si ile ilgili tabloyu bulur,
         * Batch alaninda "contains" filtresi uygular.
         */
        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query"),
                sTableId = oEvent.getSource().data("tableId"),
                oTable = this.byId(sTableId),
                oBinding = oTable.getBinding("items"),
                aFilters = [];

            if (sQuery) {
                aFilters.push(new Filter({
                    path: "Batch",
                    operator: FilterOperator.Contains,
                    value1: sQuery,
                    caseSensitive: false
                }));
            }
            oBinding.filter(aFilters);
        },

        /**
         * ISO tarih -> yerel okunabilir format
         */
        formatDateTime: function (sValue) {
            if (!sValue) {
                return "";
            }
            var oDate = new Date(sValue);
            if (isNaN(oDate.getTime())) {
                return sValue;
            }
            return oDate.toLocaleString("tr-TR", {
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit"
            });
        }
    });
});
