var PAGE_SIZE = 36,
    imgurAlbumRegex = /http:\/\/imgur.com\/a\//,
    imgurGalleryRegex = /http:\/\/imgur.com\/gallery\//,
    imgurSingleRegex = /http:\/\/imgur.com\/.[^\/]/,
    imgExtensionRegex = /\.(png|jpg|gif|jpeg)$/i,
    DEFAULTIMAGEURL = "reddit-default.png";

var awwDataSource = new kendo.data.DataSource({
    transport: {
        read: {
            url: 'http://www.reddit.com/r/aww.json',
            dataType: 'jsonp',
            jsonp: 'jsonp',
            cache: true
        },

        parameterMap: function(data, type) {
            if (data.skip > 0) { // requesting next page - asking for skip=0 means pull to refresh.
                var items = awwDataSource.data();
                data.after = items[items.length - 1].data.name;
            }

            data.limit = PAGE_SIZE;
            return data;
        }
    },

    serverPaging: true,
    pageSize: PAGE_SIZE,
    schema: {
        data: "data.children",
        total: function() { return 100000; }
    }
});

var ds = new kendo.data.DataSource({
    transport: {
        read: function(options) {

            var results = [], data = options.data;
            for (var i = data.skip; i < data.skip + data.take; i ++) {
                results.push({ foo: i });
            }
            setTimeout(function(){
                options.success(results);
            }, 4000);
        }
    },
    pageSize: 36,
    serverPaging: true,
    schema: {
        total: function() { return 100000; }
    }
});

function isImage(url) {
    return imgExtensionRegex.test(url) || (/http:\/\/(.+)?imgur.com\/.[^\/]+$/i).test(url);
}

function showDetail(e) {
    if (e.target.is("a")) {
        return; // comments link
    }

    if (e.dataItem) {
        navigateTo(e.dataItem);
    }
}

function navigateTo(dataItem) {
    var url = dataItem.data.url;
    if (isImage(url)) {
        app.navigate("#detail?id=" + dataItem.data.name);
    } else {
        window.open(url, "_detail");
    }
}

function resetDetail(e) {
    e.view.element.find("img").attr("src", '');
}

function renderDetail(e) {
    var view = e.view,
        id = view.params.id,
        element = view.element;

    $.ajax('http://reddit.com/api/info.json', {
        data: { id: id },
        dataType: 'jsonp',
        jsonp: 'jsonp',
        success: function(data) {
            var url = data.data.children[0].data.url;
            if(!imgExtensionRegex.test(url)) {
                url += '.jpg';
            };

        var img = element.find('img');
        img.css('visibility', 'hidden').attr('src', url).one('load', function() {
            img.css('visibility', 'visible');
            view.scroller.zoomOut();
        });
        }
    });
}

function renderThumbs(element) {
    element.find(".loading-thumb").each(function() {
        var thumb = $(this).data("thumb");
        if (thumb === "default") {
            thumb = "missing-thumb.png";
        }
        $(this).removeClass("loading-thumb").addClass("thumb").css("backgroundImage", "url(" + thumb + ")");
    });
}

function showThumbsOnScrollComplete(e) {
    var view = e.view;
    var renderThumbsForView = function() {
        renderThumbs(view.element);
    };

    awwDataSource.bind('change', renderThumbsForView);
    view.scroller.bind('scrollEnd', renderThumbsForView);
    view.bind("afterShow", renderThumbsForView);
    kendo.onResize(renderThumbsForView);
}

function canvasInit(e) {
    canvasScrollView = $("#canvas-scrollview").kendoMobileVirtualScrollView({
        contentHeight: 500,
        dataSource: ds,
        batchSize: 6,
        template: kendo.template($("#canvas-template").html()),
        emptyTemplate: kendo.template($("#empty-template").html()),
        changed: updateSrc
    }).data("kendoMobileVirtualScrollView");

    canvasScrollView.element.find(".virtual-page").kendoTouch({
        tap: function (e) {
            var tile = $(e.event.target).closest("div.tile"),
                offset = tile.data("offset");

            app.navigate("#canvas-detail?offset=" + offset);
        }
    });
}

function canvasShow(e) {
    var offset = parseInt(e.view.params.offset),
        canvasScrollView = $("#canvas-scrollview").data("kendoMobileVirtualScrollView");

    if(!isNaN(offset)) {
        canvasScrollView.scrollTo(offset);
    }
}

function goToCanvas(e) {
    var detailScrollView = $("#detail-scrollview").data("kendoMobileVirtualScrollView"),
        canvasScrollView = $("#canvas-scrollview").data("kendoMobileVirtualScrollView"),
        offset = detailScrollView.offset,
        canvasPage;

    canvasPage = Math.floor(offset / canvasScrollView.options.batchSize);
    app.navigate("#canvas?offset=" + canvasPage);
}

function canvasDetailInit(e) {
    $("#detail-scrollview").kendoMobileVirtualScrollView({
        dataSource: ds,
        autoBind: false,
        template: kendo.template($("#canvas-detail-tmp").html())
    }).data("kendoMobileVirtualScrollView");
}

function canvasDetailShow(e) {
    var offset = parseInt(e.view.params.offset),
        detailScrollView = $("#detail-scrollview").data("kendoMobileVirtualScrollView");

    if(!isNaN(offset)) {
        detailScrollView.scrollTo(offset);
    }
}

function calculateOffset(dataItem) {
    var index = $("#canvas-scrollview").data("kendoMobileVirtualScrollView").buffer.buffer.indexOf(dataItem);
    //console.log("index ", index, " dataItem ", dataItem.foo);
    return index;
}

function updateSrc(e) {
    var element = e.element;

    element.find(".item-img").each(function(idx, item) {
        $(item).css("background-image", "url(" + $(item).data("url") + ")");
    });
}

function createImage(data) {
    var domain = data.domain,
        subreddit = data.subreddit,
        thumbnail = data.thumbnail,
        url = data.url,
        imageTemplate = kendo.template('<div class="item-img" style="background-image: url(' + DEFAULTIMAGEURL + ');" data-url="#= data #"></div>');

    if(url.match(imgExtensionRegex)) {
        return imageTemplate(url);
    }

    if(url.match(imgurAlbumRegex) || url.match(imgurGalleryRegex)) {
        return imageTemplate(DEFAULTIMAGEURL);
    }

    if(url.match(imgurSingleRegex)) {
        return imageTemplate(url.concat(".jpg"));
    }

    return imageTemplate(DEFAULTIMAGEURL);
}

function createTile(data) {
    var url = data.url,
        imageTemplate = kendo.template('<div class="item-img" style="background-image: url(#= data #);"></div>'),
        nonImageTemplate = kendo.template('<div><p>Image cannot be loaded</p><a data-role="button" data-rel="external" href="#= data #" target="_blank">Btn</a></div>');

    if(url.match(imgExtensionRegex)) {
        return imageTemplate(url);
    }

    if(url.match(imgurAlbumRegex) || url.match(imgurGalleryRegex)) {
        return nonImageTemplate(url);
    }

    if(url.match(imgurSingleRegex)) {
        return imageTemplate(url.concat(".jpg"));
    }

    return nonImageTemplate(url);
}

var app = new kendo.mobile.Application(document.body, { skin: 'flat' });
