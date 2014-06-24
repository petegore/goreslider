GoreSlider
==========

GoreSlider is a basic image slider compatible with IE6.

# How does it work ?
GoreSlider use jQuery.

# How to use
A simple call on the element you want to "goreslide".

```
$('#operation-slider img').hide();  // Hiding images during their load
$(window).load(function(){
    $('#operation-slider img').show();
    $('#operation-slider').goreslider({
        // Params
    });
});
```

@todo finish