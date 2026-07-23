# Aqua Monitor — Backend (RAP) Annotation Karşılığı — Opsiyonel

Frontend'deki `webapp/annotations/annotations.xml` şu an UI'yı **local annotation** olarak
sürüyor ve backend'e dokunmadan çalışır. Aynı annotation'ları **RAP tarafında** (CDS metadata
extension) tanımlamak isterseniz — böylece UI metadata'sı servisin `$metadata`'sından gelir —
aşağıdaki şablonları kullanın. Bu durumda `annotations.xml`'i silip manifest'teki
`localAnnotations` data source'unu kaldırabilirsiniz; `views.paths` aynen kalır.

> `ZC_AQUA_FEEDING` vb. isimler **örnektir** — kendi projection (C_) view adlarınızla değiştirin.

## 1) Metadata extension ile UI annotation (view'ı değiştirmeden)

```abap
@Metadata.layer: #CORE
@UI: { headerInfo: { typeName: 'Yemleme', typeNamePlural: 'Yemleme' } }
annotate entity ZC_AQUA_FEEDING with
{
  @UI.lineItem:      [{ position: 10 }]
  @UI.selectionField:[{ position: 10 }]
  CreatedAt;

  @UI.selectionField:[{ position: 20 }]
  @UI.lineItem:      [{ position: 30 }]
  Batch;

  @UI.selectionField:[{ position: 30 }]
  @UI.lineItem:      [{ position: 20 }]
  Tank;

  @UI.lineItem:      [{ position: 40 }]
  Quantity;

  @UI.lineItem:      [{ position: 50 }]
  ERPFeedCode;

  @UI.lineItem:      [{ position: 60 }]
  AMFeedCode;

  @UI.lineItem:      [{ position: 70 }]
  ProductionOrder;

  @UI.lineItem:      [{ position: 80 }]
  MaterialDocumentNumber;

  @UI.lineItem:      [{ position: 90, criticality: 'Criticality' }]
  @UI.selectionField:[{ position: 40 }]
  Success;

  @UI.lineItem:      [{ position: 100 }]
  ErrorText;
}
```

DeadFish / Transfer / Harvest için aynı desen: her entity'nin
`webapp/annotations/annotations.xml` içindeki `LineItem` / `SelectionFields` sırasını birebir
tekrarlayın.

## 2) Durum renklendirmesi (yeşil/kırmızı) — "extension" gereken tek yer

Local annotation'da `Success` sadece Evet/Hayır gösterir; renk için bir **criticality**
elemanı gerekir (0=nötr, 1=kırmızı, 2=sarı, 3=yeşil). Projection view'a hesaplanan bir eleman
ekleyin (RAP extension):

```abap
define view entity ZC_AQUA_FEEDING
  as projection on ZI_AQUA_FEEDING
{
  key ...,
      ...,
      // 3 = başarılı (yeşil), 1 = hata (kırmızı)
      @UI.hidden: true
      case Success
        when 'X' then 3
        else 1
      end as Criticality,
      ...
}
```

Sonra 1. adımdaki `@UI.lineItem: [{ ..., criticality: 'Criticality' }]` bu elemanı kullanır ve
FE `ObjectStatus`'u eski freestyle uygulamadaki gibi yeşil/kırmızı boyar.

> Aynı renklendirmeyi backend'e dokunmadan yapmak isterseniz `annotations.xml` içindeki
> `Success` DataField'ını `DataFieldForAnnotation` + `Criticality` (path) ile besleyebilirsiniz —
> ama yine servis metadata'sında 0-3 değerinde bir `Criticality` alanı bulunması gerekir.
