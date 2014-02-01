var domUtils = {};
domUtils.getEventPosition = function (e, obj) {

    var stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(obj, null).paddingLeft, 10) || 0;
    var stylePaddingTop = parseInt(document.defaultView.getComputedStyle(obj, null).paddingTop, 10) || 0;
    var styleBorderLeft = parseInt(document.defaultView.getComputedStyle(obj, null).borderLeftWidth, 10) || 0;
    var styleBorderTop = parseInt(document.defaultView.getComputedStyle(obj, null).borderTopWidth, 10) || 0;
    var html = document.body.parentNode;
    var htmlTop = html.offsetTop;
    var htmlLeft = html.offsetLeft;


    var element = obj,
        offsetX = 0,
        offsetY = 0,
        mx, my;

    // Compute the total offset
    if (typeof element.offsetParent !== 'undefined') {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }

    // Add padding and border style widths to offset
    // Also add the <html> offsets in case there's a position:fixed bar
    offsetX += stylePaddingLeft + styleBorderLeft + htmlLeft;
    offsetY += stylePaddingTop + styleBorderTop + htmlTop;

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;

    // this returns in element's css value, without borders
    var cssWidth = parseInt(document.defaultView.getComputedStyle(obj, null).getPropertyValue("width"), 10) || 0;
    var cssHeight = parseInt(document.defaultView.getComputedStyle(obj, null).getPropertyValue("height"), 10) || 0;

    //var cssWidth  = obj.offsetWidth;
    //var cssHeight = obj.offsetHeight;

    var attrWidth = obj.getAttribute("width");
    var attrHeight = obj.getAttribute("height");
    var widthScale = attrWidth / cssWidth;
    var heightScale = attrHeight / cssHeight;
    //console.log ('*** SCALE', widthScale, heightScale);

    mx *= widthScale;
    my *= heightScale;

    // We return a simple javascript object (a hash) with x and y defined
    return {
        x: mx,
        y: my
    };
};

if (typeof define === "function" && define.amd) {
    define([], function() {
        return domUtils;
    });
}
else {
    window.domUtils = domUtils;
}