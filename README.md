# Aqua Monitor

Su ürünleri operasyonlarının **Feeding (Yemleme)**, **Dead Fish (Ölü Balık)**,
**Transfer** ve **Harvest (Hasat)** kayıtlarını tek bir uygulamada izleyen SAP Fiori
uygulaması.

## Mimari

- **Backend:** Tek bir RAP OData V4 servisi — `zgilgar_ui_aqua` (service binding
  `zgilgar_ui_aqua_o4`), 4 entity set: `Feeding`, `DeadFish`, `Transfer`, `Harvest`.
- **Frontend:** **Fiori Elements (OData V4) List Report** — custom controller/view kodu
  **yoktur**. 4 alan, FE'nin native **Multiple Views** (farklı entity set'ler) özelliğiyle
  **tek uygulamada 4 sekme** olarak gösterilir. Sekmeler, kolonlar, filtre alanları ve
  sıralama tamamen **annotation** ile sürülür.

> Önceki sürüm freestyle/custom UI5 (elle yazılmış `IconTabBar` + controller) idi. Backend
> değişmeden Fiori Elements'e taşındı.

## Proje yapısı

```
abap-skill-demo/
├─ aqua-monitor/                    # Fiori Elements uygulaması
│  ├─ webapp/
│  │  ├─ annotations/
│  │  │  └─ annotations.xml         # Yerel UI annotation'ları (LineItem, SelectionFields,
│  │  │                             #   HeaderInfo, SelectionPresentationVariant#Main, etiketler)
│  │  ├─ i18n/i18n.properties       # Metinler (TR)
│  │  ├─ Component.js               # sap/fe/core/AppComponent
│  │  ├─ manifest.json              # FE ListReport + views.paths (4 entity set)
│  │  └─ index.html
│  ├─ ui5.yaml                      # fiori-tools-proxy (backend + ui5 CDN)
│  ├─ ui5-deploy.yaml               # ABAP'a deploy (deploy-to-abap)
│  ├─ package.json
│  └─ BACKEND-RAP-ANNOTATIONS.md    # (Opsiyonel) annotation'ları CDS metadata extension'a
│                                   #   taşıma + durum renklendirmesi (Criticality) rehberi
└─ .agents/skills/                  # sap-abap ve sap-abap-cds skill referansları
```

## Çalıştırma

```bash
cd aqua-monitor
npm install
npm start          # fiori run --open index.html  (proxy backend'e reentrance ticket ile bağlanır)
```

## Build & Deploy

```bash
npm run build      # ui5 build --clean-dest  ->  dist/
npm run deploy     # build + fiori deploy (ui5-deploy.yaml)
```

`ui5-deploy.yaml` içindeki `transport: REPLACE_WITH_TRANSPORT` değerini kendi transport
isteğinizle değiştirin.

## Backend'e bağlı doğrulama notu

`webapp/annotations/annotations.xml` içindeki annotation `Target`'ları RAP V4 standart
isimlendirmesine göre yazılmıştır:

- Namespace: `com.sap.gateway.srvd.zgilgar_ui_aqua.v0001`
- Entity type'lar: `FeedingType`, `DeadFishType`, `TransferType`, `HarvestType`

Sekmelerde kolon/etiketler boş görünürse, servisin `$metadata`'sını açıp bu iki ismi teyit
edip `Target` string'lerini güncelleyin.

## Bilinen sınır

Durum sütunu (`Success`) annotation ile Evet/Hayır + `ErrorText` olarak gösterilir. Eski
uygulamadaki yeşil/kırmızı `ObjectStatus` renklendirmesi için serviste 0–3 değerli bir
`Criticality` alanı gerekir — bkz. `aqua-monitor/BACKEND-RAP-ANNOTATIONS.md`.
