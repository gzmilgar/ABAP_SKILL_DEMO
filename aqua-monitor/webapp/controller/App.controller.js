sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, MessageToast) {
    "use strict";

    var SERVICE_URL = "/sap/opu/odata4/sap/zgilgar_ui_aqua_o4/srvd/sap/zgilgar_ui_aqua/0001/";

    var TABS = ["Feeding", "DeadFish", "Transfer", "Harvest"];

    // Her tab icin: tab'a ozel ekstra filtre alaninin property'si
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

            var oData = { counts: {}, busy: {} };
            TABS.forEach(function (s) {
                oData[s] = [];
                oData.counts[s] = "";
                oData.busy[s] = false;
            });
            this.getOwnerComponent().getModel("data").setData(oData);
            // Buyuk listelerde tum kayitlar client'a cekildigi icin limiti yukselt
            this.getOwnerComponent().getModel("data").setSizeLimit(5000);

            this._loadAll();
        },

        /**
         * Tum entity set'leri duz GET ile ceker (backend $orderby/$filter
         * isteklerine cevap vermedigi icin siralama/filtreleme client'ta yapilir).
         */
        _loadAll: function () {
            TABS.forEach(this._loadSet.bind(this));
        },

        _loadSet: function (sSet) {
            var oModel = this.getOwnerComponent().getModel("data"),
                oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            oModel.setProperty("/busy/" + sSet, true);

            fetch(SERVICE_URL + sSet + "?$count=true", {
                headers: { "Accept": "application/json" }
            }).then(function (oResponse) {
                if (!oResponse.ok) {
                    throw new Error("HTTP " + oResponse.status);
                }
                return oResponse.json();
            }).then(function (oJson) {
                var aRows = oJson.value || [];
                // CreatedAt'e gore azalan sirala (EntryDateTime cogu kayitta bos)
                aRows.sort(function (a, b) {
                    var sA = a.EntryDateTime || a.CreatedAt || "",
                        sB = b.EntryDateTime || b.CreatedAt || "";
                    return sB.localeCompare(sA);
                });
                oModel.setProperty("/" + sSet, aRows);
                oModel.setProperty("/counts/" + sSet,
                    String(oJson["@odata.count"] !== undefined ? oJson["@odata.count"] : aRows.length));
                oModel.setProperty("/busy/" + sSet, false);
            }).catch(function (oError) {
                oModel.setProperty("/busy/" + sSet, false);
                MessageToast.show(oBundle.getText("loadError", [sSet, oError.message]));
            });
        },

        /**
         * Yenile: veriyi bastan ceker.
         */
        onRefresh: function () {
            this._loadAll();
        },

        /**
         * Go (Baslat) butonu / Input submit -> app:tab custom data'sindan
         * hangi tab oldugunu bulur, filtreleri client-side uygular.
         */
        onGo: function (oEvent) {
            var sTab = oEvent.getSource().data("tab");
            this._applyFilters(sTab);
        },

        /**
         * Temizle: filtre kontrollerini sifirlar, filtresiz liste gosterir.
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

            // Tarih araligi: EntryDateTime bos olabildigi icin CreatedAt'e de bakilir (OR)
            var oDR = this.byId("fDate" + sTab),
                dFrom = oDR.getDateValue(),
                dTo = oDR.getSecondDateValue() || dFrom;
            if (dFrom) {
                var dStart = new Date(dFrom);
                dStart.setHours(0, 0, 0, 0);
                var dEnd = new Date(dTo);
                dEnd.setHours(23, 59, 59, 999);
                var sStart = dStart.toISOString(),
                    sEnd = dEnd.toISOString();
                aFilters.push(new Filter({
                    filters: [
                        new Filter("EntryDateTime", FilterOperator.BT, sStart, sEnd),
                        new Filter("CreatedAt", FilterOperator.BT, sStart, sEnd)
                    ],
                    and: false
                }));
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
         * ISO tarih -> yerel okunabilir format.
         * EntryDateTime bossa CreatedAt gosterilir.
         */
        formatEntryDate: function (sEntry, sCreated) {
            var sValue = sEntry || sCreated;
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
