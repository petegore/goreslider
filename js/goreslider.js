/************************************************************
 * GoreSlider v0.1
 *
 * Coded by Pierre GORI
 *
 * Copyright 2014
 * Licence: MIT - http://fr.wikipedia.org/wiki/Licence_MIT
************************************************************/


(function($) {
    
    $.fn.goreslider = function(options) {
        var settings = $.extend({}, $.fn.goreslider.defaults, options);

        return this.each(function() {
            // Vars for slider calculations
            var vars = {
                currentSlide: 0,
                currentIndex: 0,
                totalSlides: 0,
                randAnim: '',
                running: false,
                paused: false,
                stop: false,
                sliderWidth: 0,
                picturesWidth: 0,
                sources: new Array()
            };
            
            var slider = $(this);
            slider.data('goreslider:vars', vars);
            
            // Defining max sizes
            var containerWidth = slider.parent().width();
            vars.sliderWidth = (settings.maxWidth === "auto") ? containerWidth : Math.min(containerWidth, settings.maxWidth);
            vars.picturesWidth = (settings.maxWidth === "auto") ? Math.min(containerWidth, settings.maxPicturesWidth) : Math.min(containerWidth, settings.maxWidth, settings.maxPicturesWidth);
            
            // Getting slider & slides
            var slider = $(this);
            var kids = slider.children('img:not(.control-img)', slider);
            
            // Templates
            var arraySlider = settings.table;
            if (arraySlider){
                var baseTableTemplate       = $('<table></table>');
                var titleTemplate           = $('<tr><td colspan="3" class="goreslider-title"><p></p></td></tr>');
                var pauseImageTemplate      = $('<tr><td colspan="3" class="goreslider-pause"></td></tr>');
                var previousButtonTemplate  = $('<td class="goreslider-previous" title="Previous"></td>');
                var slidersContainerTpl     = $('<td></td>');
                var nextButtonTemplate      = $('<td class="goreslider-next" title="Next"></td>');
                var controlTemplate         = $('<tr><td colspan="3" class="goreslider-control"></td></tr>');
            } else {
                var titleTemplate           = $('<div class="goreslider-title"><p></p></div>');
                var pauseImageTemplate      = $('<div class="goreslider-pause"></div>');
                var previousButtonTemplate  = $('<div class="goreslider-previous" title="Previous"></div>');
                var nextButtonTemplate      = $('<div class="goreslider-next" title="Next"></div>');
                var controlTemplate         = $('<div class="goreslider-control"></div>');
            }
            var slideThumbTemplate          = '<a class="goreslider-control-thumb" data-index="__REL_ID__" style="background-image:url(\'__IMG_SRC__\'); background-size:__BG_SIZE__;"></a>';
            
            // Looping on imgs to find biggest height/width & storing all sources
            var zIndex = kids.length;
            kids.each(function(index) {
                var child = $(this);
                
                // if it's a table slider we need to move images into a cell
                if (arraySlider){
                    child.css('position', 'absolute');  // avoid positioning position in IE6-7-8
                    slidersContainerTpl.append(child);
                }
                
                child.attr('data-index', index);
                child.css('z-index', zIndex--);
                child.width(vars.picturesWidth);
                if (child.height() > settings.maxHeight){
                    child.width("auto");
                    child.height(settings.maxHeight);
                }
                vars.sources.push(child.attr('src'));
                vars.totalSlides++;
                
                child.css('left', ((vars.sliderWidth - child.width() - 2 * settings.picturesPadding) / 2) + 'px');
                child.css('padding', settings.picturesPadding + 'px');
                if (index > 0) child.css('opacity', '0');    // Hiding all slides before starting the animation
            });
            
            // Adding previous and next buttons (& pause)
            if (arraySlider){
                var centralContainer = $('<tr></tr>');
                centralContainer.append(previousButtonTemplate);
                centralContainer.append(slidersContainerTpl);
                centralContainer.append(nextButtonTemplate);
                
                // forcing the previous and next cells heights
                setTimeout(function(){
                    var tmpMaxheight = 0;
                    kids.each(function(index) {
                        var child = $(this);
                        if (child.height() > tmpMaxheight) tmpMaxheight = child.height();
                    });
                    centralContainer.height(tmpMaxheight);
                }, 300);
                
                baseTableTemplate.addClass('goreslider');
                
                baseTableTemplate.append(pauseImageTemplate);
                baseTableTemplate.append(centralContainer);
                
                // removing the old div tag to replace it by the table tag
                slider.append(baseTableTemplate);
                //slider.remove();
                //slider = baseTableTemplate;
            } else {
                slider.prepend(previousButtonTemplate);
                slider.prepend(nextButtonTemplate);
                slider.prepend(pauseImageTemplate);
                slider.addClass('goreslider');
            }
            
            $(".goreslider-previous, .goreslider-next").width((vars.sliderWidth - (vars.picturesWidth + settings.picturesPadding * 2)) / 2);
            $('.goreslider-next', slider).on('click', function(){
                clearInterval(timer);
                timer = '';
                goresliderRun(slider, kids, settings, 'next');
            });
            $('.goreslider-previous', slider).on('click', function(){
                clearInterval(timer);
                timer = '';
                goresliderRun(slider, kids, settings, 'previous');
            });

            
            // Setting slider size
            slider.height(settings.maxHeight + 50);
            slider.width(vars.maxWidth);
            
            // Initializing the first slidec
            vars.currentSlide = $(kids[vars.currentIndex]);
            
            // Adding titles
            slider.append(
                titleTemplate.css({ display:'none', opacity:settings.transparencytitle })
            );      
            if(vars.currentSlide.attr('title') !== ''){
                var title = vars.currentSlide.attr('title');
                //if(title.substr(0,1) === '#') title = $(title).html();
                $('.goreslider-title p', slider).html(title);          
                $('.goreslider-title', slider).fadeIn(settings.speedStrip);
            }

            // Starting to slide !
            var timer = 0;
            if(settings.auto && kids.length > 1){
              timer = setInterval(function(){ goresliderRun(slider, kids, settings, false); }, settings.sliderDelay);
            }

            // Creating the slider control bar if asked
            if(settings.controlNavigation){
                if (arraySlider){
                    baseTableTemplate.append(controlTemplate);
                } else {
                    slider.append(controlTemplate);
                }
                
                for(var i = 0; i < kids.length; i++){
                    var tpl = slideThumbTemplate.replace(/__REL_ID__/, i).replace(/__IMG_SRC__/, vars.sources[i]);
                    var bgSize = ($(kids[i]).width() >= $(kids[i]).height()) ? "auto 100%" : "100% auto";
                    tpl = tpl.replace(/__BG_SIZE__/, bgSize);
                    
                    if (arraySlider){
                        controlTemplate.children('td').append(tpl); 
                    } else {
                        controlTemplate.append(tpl); 
                    }
                     
                }
                
                // Resizing the thumbnails (keeping 10px between each)
                var width = ((slider.width() - ((10 + 4) * vars.totalSlides)) / vars.totalSlides); /* 5px padding & 2px border */
                if (width > 100) width = 100; // Limiting to 100px, prettier !
                $('.goreslider-control-thumb').width(width);
                $('.goreslider-control-thumb').height(width);
                
                if (!arraySlider){
                    var ctrlHeight = $('.goreslider-control').height();
                    $('.goreslider-control').css('bottom', "-" + ctrlHeight + "px");
                    slider.css('margin-bottom', (ctrlHeight) + "px");
                }
                
                // Set active the button corresponding to the current slide
                $('.goreslider-control a:eq('+ vars.currentIndex +')', slider).addClass('active');

                // If clicking on a control : we set the clicked side as current and run the slider from 0
                $('.goreslider-control a', slider).on('click', function(){
                    if($(this).hasClass('active')) return false;
                    clearInterval(timer);
                    timer = '';
                    vars.currentIndex = $(this).attr('data-index');
                    goresliderRun(slider, kids, settings, 'control');
                });
                
            }
            
            // If autopause is true, stopping the slider at hover
            if(settings.autoPause){
                slider.hover(function(){
                    vars.paused = true;
                    clearInterval(timer);
                    timer = '';
                    $(".goreslider-pause").show();
                }, function(){
                    vars.paused = false;
                    if(timer === '' && settings.auto){
                        timer = setInterval(function(){ goresliderRun(slider, kids, settings, false); }, settings.sliderDelay);
                    }
                    $(".goreslider-pause").hide();
                });
            }

            // Listening for the end of the slide : looping is the auto parameter is on
            slider.bind('goreslider:finished', function(){ 
                vars.running = false; 
                if(timer === '' && !vars.paused && settings.auto){
                    timer = setInterval(function(){ goresliderRun(slider, kids, settings, false); }, settings.sliderDelay);
                }
                settings.aChange.call(this);
            });
        });





        // Main function : starting to run the slider
        function goresliderRun(slider, kids, settings, nudge){
            // No run
            var vars = slider.data('goreslider:vars');
            if((!vars || vars.stop) && !nudge) return false;

            settings.bChange.call(this);

            // Updating
            if(!nudge){
                vars.currentIndex++;
            } else {
                if(nudge === 'previous'){
                    vars.currentIndex = (vars.currentIndex - 1 < 0) ? (vars.totalSlides - 1) : (vars.currentIndex - 1);
                }
                if(nudge === 'next'){
                    vars.currentIndex++;
                }
            }
            
            if(vars.currentIndex >= vars.totalSlides){ 
                vars.currentIndex = 0;
            }
            if(vars.currentIndex < 0) vars.currentIndex = (vars.totalSlides - 1);


            if(settings.controlNavigation){
                $('.goreslider-control a', slider).removeClass('active');
                $('.goreslider-control a:eq('+ vars.currentIndex +')', slider).addClass('active');
            }


            if(vars.currentSlide.attr('title') !== undefined && vars.currentSlide.attr('title') !== '' && !vars.currentSlide.attr('title').match(/\.(jpe?g|png|gif)$/i)){
                var title = vars.currentSlide.attr('title');
                if(title.substr(0,1) === '#') title = $(title).html(); 

                if($('.goreslider-title', slider).css('display') === 'block'){
                    $('.goreslider-title p', slider).fadeOut(settings.speedStrip, function(){
                        $(this).html(title);
                        $(this).fadeIn(settings.speedStrip);
                    });
                } else {
                    $('.goreslider-title p', slider).html(title);
                }         
                $('.goreslider-title', slider).fadeIn(settings.speedStrip);
            } else {
              $('.goreslider-title', slider).fadeOut(settings.speedStrip);
            }

            // Running the slider
            vars.running = true;
            if(settings.effect === 'fade' || vars.randAnim === 'fade'){
                $('img[data-index!=' + vars.currentIndex + ']:not(.control-img)', slider).animate({ opacity:'0.0' }, (settings.speedStrip * 2), '', function(){ $('img[data-index!=' + vars.currentIndex + ']:not(.control-img)', slider).css('display', 'none')});
                $('img[data-index=' + vars.currentIndex + ']:not(.control-img)', slider).each(function(){
                    var slide = $(this);
                    slide.css('display', '');
                    if(vars.currentIndex === settings.numberStrips - 1){
                        slide.animate({ opacity:'1.0' }, (settings.speedStrip * 2), '', function(){ slider.trigger('goreslider:finished'); });
                    } else {
                        slide.animate({ opacity:'1.0' }, (settings.speedStrip * 2));
                    }
                });
            }
        }
    };
  
  
  
    $.fn.goreslider.defaults = {
        auto: true,
        autoPause: true,   
        speedStrip: 500,
        maxWidth: "auto",
        maxPicturesWidth: 600,
        maxHeight: 450,
        picturesPadding: 5,
        sliderDelay: 3000,   
        effect:'fade',
        transparencytitle: 0.8,    
        bChange: function(){},
        aChange: function(){},
        goresliderStop: function(){},
        controlNavigation: true,
        table: false
    };


  $.fn._reverse = [].reverse;
  
})(jQuery);