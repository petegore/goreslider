GoreSlider
==========

GoreSlider is a basic image slider compatible with IE6.
It requires jQuery.

## How does it work ?
GoreSlider can create a slider using basic <div> tags, or <table> tag for better IE compatibility.
Just create a container and put your pictures on it.

## How to use

### Step 1 : CSS
Don't forget to the IE6 compatibily stylesheet with conditional comments.

```html
<link rel="stylesheet" href="../css/goreslider.css"/>
<!--[if lte IE 8]>
    <link rel="stylesheet" href="{{ asset('./css/goreslider-ie6.css') }}">
<![endif]-->
```

### Step 2 : Javascript
Load the GoreSlider Javascript main file and the jQuery one if you don't use it in your application :

```html
<script src="../js/jquery.js"></script>
<script src="../js/goreslider.js"></script>
```

### Step 3 : preparing the HTML
GoreSlider needs a div to insert the slider.
This div should have a parent element with a given width, or the slider width will be 100% of the page.
Check the example for further information.

```html
<div class="slider-container" style="width:800px">
    <div id="my-table-slider">
        <img src="pictures/picture_1.jpg"/>
        <img src="pictures/picture_2.jpg"/>
        <img src="pictures/picture_3.jpg"/>
    </div>
</div>
```

### Step 4 : GoreSliding the element
A simple call on the element you want to "goreslide".

```Javascript
$('#operation-slider img').hide();  // Hiding images during their load
$(window).load(function(){
    $('#operation-slider img').show();
    $('#operation-slider').goreslider({
        // Params
    });
});
```


### Step 5 : customize the slider
Let's have a look at the different options you can use through an example. Here are the default options :

```Javascript
$(window).load(function(){
    $('#operation-slider img').show();
    $('#operation-slider').goreslider({
        auto: true,                     // Autorun one loaded
        autoPause: true,                // Autostop when mouse hover
        speedStrip: 500,                // Transition duration between pictures
        maxWidth: "auto",               // Slider maximal width ; if auto it will use the parent width
        maxPicturesWidth: 600,          // Max picture width inside the slider
        maxHeight: 450,                 // Max picture height inside the slider
        picturesPadding: 5,             // Padding between picture and its border
        sliderDelay: 3000,              // Delay between each picture
        controlNavigation: true,        // Display or not the control thumbnails at the bottom
        table: false                    // Table mode or div mode
    });
});
```