sap.ui.define([
    "sap/fe/core/AppComponent"
], function (AppComponent) {
    "use strict";

    // Fiori Elements uygulamasi: kok view ve routing FE tarafindan olusturulur.
    return AppComponent.extend("com.gilgar.aquamonitor.Component", {
        metadata: {
            manifest: "json"
        }
    });
});
