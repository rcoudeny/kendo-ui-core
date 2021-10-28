---
title: Filtering
page_title: Filtering
description: "Learn filtering capabilities of the Telerik UI ComboBox HtmlHelper for {{ site.framework }}."
slug: htmlhelpers_combobox_filtering_aspnetcore
position: 5
---

# Filtering

The Telerik UI ComboBox HtmlHelper for {{ site.framework }} allows the user to filter the available items by their text so they can find the one they need more quickly.

To enable the filtering, set the `Filter` to the desired filter operator such as `contains`. When the filtering is enabled, the user can decide where the actual filtering happens:

* [Client Filtering](#client-filtering)
* [Server Filtering](#server-filtering)

## Client Filtering 

By design, the Telerik UI ComboBox uses client-side filtering and there is no specific option that should be set. The actual operation is performed via JavaScript directly on the client. No requests are being made to the server-side. 

## Server Filtering

To enable server filtering set the `ServerFiltering` option to `true`. Doing so, the filtering will be perfomed on the server-side. The widget performs an AJAX request and sends the filter's value and operator to the server-side. The data is filtered on the server and the ready-to-use subset is returned back to the widget.

```
    @(Html.Kendo().ComboBox()
          .Name("products")
          .DataSource(source =>
          {
              source.Read(read =>
              {
                  read.Action("ServerFiltering_GetProducts", "ComboBox");
              })
              .ServerFiltering(true);
          })
    )
```

## See Also

* [Client Filtering of the ComboBox HtmlHelper for {{ site.framework }} (Demo)](https://demos.telerik.com/{{ site.platform }}/combobox/clientfiltering)
* [Server Filtering of the ComboBox HtmlHelper for {{ site.framework }} (Demo)](https://demos.telerik.com/{{ site.platform }}/combobox/serverfiltering)
* [Server-Side API](/api/combobox)