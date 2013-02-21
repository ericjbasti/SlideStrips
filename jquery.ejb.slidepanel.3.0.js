//*******************************************************************************************************
//
//  v3.0
//
//	complete rewrite
//
//
//
//*******************************************************************************************************

(function($){
	$.fn.slidepanel = function(options) {
		var defaults = {
			start:0,
			pause:5,
			slide:true,
			touch:false,
			controls: null
		};
		
		var options = $.extend(defaults, options);
	
		return this.each(function() {
			var slidepanel = this;
			var slides = $(this).find('li');
			var now = options.start;
			var timer = null;
			var heightElement = $(slidepanel).prepend("<div class='sp_invisible' style='visibility:hidden'>"+$(slides[now]).html()+"</div>")
			var touch={};

			var activeSlide = function(id){
				$(slides).removeClass('active');
				$(slides[id]).addClass('active');
				if(options.slide){
					$(slides).removeClass('next');
					if(slides[id+1]){
						$(slides[id+1]).addClass('next');
					}else{
						$(slides[0]).addClass('next');
					}
					$(slides).removeClass('previous');
					if(slides[id-1]){
						$(slides[id-1]).addClass('previous');
					}else{
						$(slides[slides.length-1]).addClass('previous');
					}
				}
				if (options.controls){
					$(options.controls).find('.button').removeClass('active');
					$(options.controls).find('.button[name='+id+']').addClass('active');
				}
			}
			var play = function(pause){
				activeSlide(now);
				clearTimeout(timer);
				if(pause){

				}else{
					timer = setTimeout(function(){
						nextSlide();
					},options.pause*1000);
				}
			}

			var nextSlide = function(){
				now++;
				if (now>=slides.length) now=0;
				play();
			}

			var controls = function(){
				if(options.controls){
					var buttons=''
					for (var i=0;i!=slides.length;i++){
						buttons+='<div class="button" name="'+i+'"></div>';
					}
					$(options.controls).html(buttons);
					$(options.controls).find('.button').click(function(){
						var id=$(this).attr('name');
						now=id;
						play();
					})
				}

			}

			var init = function(){
				controls();
				play();
			}




			var onPressDown=function(e){
				var e= e.targetTouches[0];
				touch.x=parseInt(e.clientX);
				touch.y=parseInt(e.clientY);
				touch.deltaX=0;
				touch.deltaY=0;
				clearTimer(timer)
			}
			var onPressMove=function(e){
				var e= e.targetTouches[0];
				touch.deltaX=touch.x-parseInt(e.clientX);
				touch.deltaY=touch.y-parseInt(e.clientY);
				
			}
			var onPressUp=function(e){
				touch.deltaX=0;
				touch.deltaY=0;
			}

			if (options.touch){
				slidepanel.ontouchstart= onPressDown;
				slidepanel.ontouchmove= onPressMove;
				slidepanel.ontouchend= onPressUp;
				slidepanel.ontouchcancel= onPressUp;
				slidepanel.ontouchleave= onPressUp;
			}
			init();
			$(window).resize(function(){
				
			});
		});
	}
	
})(jQuery);
