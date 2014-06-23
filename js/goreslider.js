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
                maxHeight: 0,
                maxWidth: 0,
                sources: new Array(),
            };
            
            var slider = $(this);
            slider.data('goreslider:vars', vars);
            slider.addClass('goreslider');
            vars.maxWidth = slider.parent().width(); // MaxWidth is based on slider first parent's
            
            // Templates
            var titleTemplate = $('<div class="goreslider-title"><p></p></div>');            
            var controlTemplate = $('<div class="goreslider-control"></div>');
            var slideThumbTemplate = '<a class="goreslider-control-thumb" data-index="__REL_ID__"><img class="control-img" src="__IMG_SRC__"/></a>';
            
            // Getting slider & slides
            var slider = $(this);
            var kids = slider.children('img:not(.control-img)', slider);
            
            // Looping on imgs to find biggest height/width & storing all sources
            kids.each(function() {
                var child = $(this);
                child.attr('data-index', vars.totalSlides);
                child.width = vars.maxWidth;
                if (child.height() > vars.maxHeight) vars.maxHeight = child.height();
                vars.sources.push(child.attr('src'));
                vars.totalSlides++;
                
                child.css('opacity', '0');    // Hiding all slides before starting the animation
            });
            
            // Setting slider size
            slider.height(vars.maxHeight);
            slider.width(vars.maxWidth);
            
            // Initializing the first slidec
            vars.currentSlide = $(kids[vars.currentIndex]);
            
            // Adding titles
            slider.append(
                titleTemplate.css({ display:'none', opacity:settings.transparencytitle })
            );      
            if(vars.currentSlide.attr('title') !== ''){
                var title = vars.currentSlide.attr('title');
                if(title.substr(0,1) === '#') title = $(title).html();
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
                slider.append(controlTemplate);
                for(var i = 0; i < kids.length; i++){
                    var tpl = slideThumbTemplate.replace(/__REL_ID__/, i).replace(/__IMG_SRC__/, vars.sources[i]);
                    controlTemplate.append(tpl);  
                }
                
                // Resizing the thumbnails (keeping 10px between each)
                var width = ((slider.width() - (10 * vars.totalSlides - 1)) / vars.totalSlides);
                $('.goreslider-control-thumb img').width(width);
                $('.goreslider-control').css('bottom', "-" + $('.goreslider-control').height() + "px");

                // Set active the button corresponding to the current slide
                $('.goreslider-control a:eq('+ vars.currentIndex +')', slider).addClass('active');

                // If clicking on a control : we set the clicked side as current and run the slider from 0
                $('.goreslider-control a', slider).on('click', function(){
                    //if(vars.running) return false;
                    if($(this).hasClass('active')) return false;
                    clearInterval(timer);
                    timer = '';
                    vars.currentSlide = $(this).attr('data-index') - 1;
                    goresliderRun(slider, kids, settings, 'control');
                });
            }

            // If autopause is true, stopping the slider at hover
            if(settings.autoPause){
                slider.hover(function(){
                    vars.paused = true;
                    clearInterval(timer);
                    timer = '';
                }, function(){
                    vars.paused = false;
                    if(timer === '' && settings.auto){
                      timer = setInterval(function(){ goresliderRun(slider, kids, settings, false); }, settings.sliderDelay);
                    }
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
                if(nudge === 'prev'){
                    vars.currentIndex--;
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


            if(vars.currentSlide.attr('title') !== '' && !vars.currentSlide.attr('title').match(/\.(jpe?g|png|gif)$/i)){
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
        sliderDelay: 3000,   
        effect:'fade',
        transparencytitle: 0.8,    
        bChange: function(){},
        aChange: function(){},
        goresliderStop: function(){},
        controlNavigation: true
    };


  $.fn._reverse = [].reverse;
  
})(jQuery);