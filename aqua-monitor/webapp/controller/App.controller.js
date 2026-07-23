sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
    "use strict";

    // Her tab icin: tab'a ozel ekstra filtre alaninin OData property'si
    var TAB_EXTRA_FIELD = {
        Feeding: "Tank",
        DeadFish: "Unit",
        Transfer: "WayBillCode",
        Harvest: "CageLotID"
    };

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
         * Go (Baslat) butonu / Input submit -> app:tab custom data'sindan
         * hangi tab oldugunu bulur, filtre kontrollerini okuyup tabloya uygular.
         */
        onGo: function (oEvent) {
            var sTab = oEvent.getSource().data("tab");
            this._applyFilters(sTab);
        },

        /**
         * Temizle butonu -> filtre kontrollerini sifirlar, filtresiz liste gosterir.
         */
        onClear: function (oEvent) {
            var sTab = oEvent.getSource().data("tab");

            this.byId("fDate" + sTab).setDateValue(null).setSecondDateValue(null).setValue("");
            this.byId("fBatch" + sTab).setValue("");
            this.byId("fExtra" + sTab).setValue("");
            this.byId("fStatus" + sTab).setSelectedKey("ALL");

            this.byId("tbl" + sTab).getBinding("items").filter([]);
        },

        _applyFilters: function (sTab) {
            var aFilters = [];

            // Tarih araligi (EntryDateTime)
            var oDR = this.byId("fDate" + sTab),
                dFrom = oDR.getDateValue(),
                dTo = oDR.getSecondDateValue() || dFrom;
            if (dFrom) {
                var dStart = new Date(dFrom);
                dStart.setHours(0, 0, 0, 0);
                var dEnd = new Date(dTo);
                dEnd.setHours(23, 59, 59, 999);
                aFilters.push(new Filter("EntryDateTime", FilterOperator.BT,
                    dStart.toISOString(), dEnd.toISOString()));
            }

            // Batch (contains)
            var sBatch = this.byId("fBatch" + sTab).getValue().trim();
            if (sBatch) {
                aFilters.push(new Filter("Batch", FilterOperator.Contains, sBatch));
            }

            // Tab'a ozel alan (Tank / Unit / WayBillCode / CageLotID)
            var sExtra = this.byId("fExtra" + sTab).getValue().trim();
            if (sExtra) {
                aFilters.push(new Filter(TAB_EXTRA_FIELD[sTab], FilterOperator.Contains, sExtra));
            }

            // Durum (Success)
            var sStatus = this.byId("fStatus" + sTab).getSelectedKey();
            if (sStatus === "OK") {
                aFilters.push(new Filter("Success", FilterOperator.EQ, true));
            } else if (sStatus === "ERR") {
                aFilters.push(new Filter("Success", FilterOperator.EQ, false));
            }

            this.byId("tbl" + sTab).getBinding("items").filter(aFilters);
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
