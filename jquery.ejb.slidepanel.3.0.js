//*******************************************************************************************************
//
//  v3.0
//	Eric J. Basti
//
//	Complete Rewrite
//	Going for full responsive here.
//	CSS animated transitions.
//
//  3/3/13: fixing issues with single panel slideshows... the forgotten.
//	3/1/13: bad day...
//			I added in the fallback code for older/bad browsers (as I see them atleast),
//			the differences were just too small to warrent another file.
//
//*******************************************************************************************************


(function($){
	function checkSupport(prefixes) {
		for(var i = 0; i < prefixes.length; i++) {
			if(document.createElement('div').style[prefixes[i]] !== undefined) {
				return prefixes[i];
			}
		}
		return false;
	}

	function isTouchDevice() {
		var temp = document.createElement('div');
		temp.setAttribute('ontouchstart', 'return;');
		if(typeof temp.ontouchstart == "function") return true;
		return false;
	}


	$.fn.slidepanel = function(options) {
		var defaults = {
			start:0,
			pause:5,
			autoPlay:true,
			slide:false,
			touch:false,
			controls: null,
			trueFit:true,
			slingBack:false,
			onSlideChange:function(){}
		};
		
		options = $.extend(defaults, options);
	
		return this.each(function() {
			var slidepanel = this;
			var holder = $(this).wrap("<div class='slidepanel'>").parent();
			var slides = $(this).find('li');

			// ok, so you could pass in an #id for this, but in some situation you won't want to already have these places on the screen.
			// this 'add' check allows the controls to be inside the 'slidepanel'.
			// this might become standard ill have to think about it.
			if (options.controls=='add') {
				$(holder).append('<div class="controls"></div>');
				options.controls=$(holder).find('.controls');
			}

			var now = options.start;
			var timer = null;
			var paused = !options.autoPlay;
			var maxX=0;
			var minX=0;

			var slideWidth=1;

			// ok so we need to get the height of this slidepanel, we need it to be responsive... lets make a sizing element.
			// inorder to make sure the sizing is correct, we want to use the exact markup of an original element.
			// however we need to make sure a few things are true, so we inline those styles.
			var heightElement = $(slidepanel).prepend("<li class='sp_invisible' style='visibility:hidden;position:relative;'>"+$(slides[now]).html()+"</li>");
			// awesome now that we've done that our css and markup should be much cleaner... and valid.

			// time to check what is supported.
			var transform = checkSupport(['transform','WebkitTransform','MozTransform','OTransform','msTransform']);
			var transition = checkSupport(['transition','WebkitTransition','MozTransition','OTransition','msTransition']);

			// if we want this to work as a series of slides places next to one another,
			// well need to space them out accordingly, 100% works, since the 'ul' tells each child element how wide it can be,
			// and that width equates to 100%... imagine that.
			if(options.slide){
				$(slides).each(function(i){
					$(this).css('left',(i*100)+'%');
				});
			}

			var activeSlide = function(id){
				if(!transition)	$(slidepanel).clearQueue();
				$(slides).removeClass('active');
				$(slides[id]).addClass('active');
				if(options.slide){
					var newX=-(id*100);
					if(options.trueFit){
						if(id+slideWidth>slides.length){
							newX=-maxX;
							now=(Math.round(newX/100))*-1;
						}
					}
					if(transition){
						slidepanel.style[transform] = 'translateX('+newX+'%)';
					}else{
						// So close, but for some reason I have to divide by the slideWidth, guess the positioning is messing with my 100%.
						$(slidepanel).animate({left:newX/slideWidth+"%"},1000);
					}
				}
				if (options.controls){
					$(options.controls).find('.button').removeClass('active');
					if(options.trueFit){
						id=Math.round((id/slideWidth)+0.4)*slideWidth;
					}
					$(options.controls).find('.button[name='+id+']').addClass('active');
					if (now>=slides.length-slideWidth) {
						$(options.controls).find('.button:last-child').addClass('active');
					}
				}
			};


			var play = function(pause){
				activeSlide(now);
				options.onSlideChange(now);
				clearTimeout(timer);
				if(pause){
				}else{
					timer = setTimeout(function(){
						nextSlide();
					},options.pause*1000);
				}
			};

			var nextSlide = function(){
				now+=slideWidth;
				if (now>slides.length-1) {
					if(options.slingBack){
						now=0;
					}else{
						now=slides.length-1;
					}
				}
				play(paused);
			};

			var previousSlide = function(){
				now-=slideWidth;
				if (now<0) {
					if(options.slingBack && now<=-slideWidth){
						now=slides.length-1;
					}else{
						now=0;
					}
				}
				play(paused);
			};

			// lets create the controls...
			var controls = function(){
				if(options.controls){
					var buttons='';
					var count=0;
					for (var i=0;i<slides.length;i+=slideWidth){
						buttons+='<div class="button" name="'+i+'"></div>';
						count++;
					}
					// if we only have one panel, we shouldn't create a single button,
					// otherwise, let them live.
					if (count==1){
						$(options.controls).html('');
					}else{
						$(options.controls).html(buttons);
						$(options.controls).find('.button').click(function(){
							var id=parseFloat($(this).attr('name'));
							now=id;
							play(paused);
						});
					}
				}

			};

			var init = function(){
				controls();
				play(paused);
				if(options.slide){
					slideWidth=(($(holder).width()/$(slides[0]).width())|0) || 1;
				}
			};

			// ok now we have some 'touch' options, in my world touch and mouse are the same
			// they only act differently in certain situations. So we'll catch those situation,
			// but for the most part, keep everything the same.
			if(options.touch){
				var touch={active:false,x:0,y:0,deltaX:0,deltaY:0};
				var original={width:0,x:0,y:0};
				var percent=0;

				var onPressEvent=function(event){
					if(navigator.msMaxTouchPoints) event.preventDefault();
					if (!event) event = window.event;

					var onPress=function(event){
						if(transition){
							original.x=parseFloat((slidepanel.style[transform]).replace('translateX(',''));
						}else{
							original.x=parseFloat(slidepanel.style.left);
						}
						original.width=$(slidepanel).find('.active').width();
						percent=0;
						touch.active=true;
						touch.x=parseFloat(event.clientX);
						touch.y=parseFloat(event.clientY);
						touch.deltaX=touch.deltaY=0;
						clearTimeout(timer);
						paused=true;
						if(transition) slidepanel.style[transition+'Duration'] = '0s';
						if(event.type=='mousedown'){
							event.preventDefault();
						}
					};

					var onMove=function(event,e){
						if(touch.active){
							touch.deltaX = touch.x-parseFloat(event.clientX);
							touch.deltaY = touch.y-parseFloat(event.clientY);
							percent = (touch.deltaX/original.width)*100;
							if(options.slide){
								var newX = original.x-percent;

								if (newX>0){
									newX = newX/4;
								}
								if (newX<-maxX){
									if(original.x>-maxX){
										newX = -maxX+25-(percent*0.25);
									}else{
										newX = -maxX-(percent*0.25);
									}
								}
								if(transition){
									slidepanel.style[transform] = 'translateX('+newX+'%)';
								}else{
									$(slidepanel).css({'left':newX+'%'});
								}
							}
							if(touch.deltaX>=10 || touch.deltaX<=-10) {
								e.preventDefault();
								$(slidepanel).addClass('moving');
							}
						}
					};
						
					var onRelease=function(event){
						// lets rest the duration so it will use the CSS setting
						if(transition){
							slidepanel.style[transition+'Duration'] = '';
						}
						var newX;
						if(percent>30){
							nextSlide();
						}else if (percent<-30){
							previousSlide();
						}else{
							activeSlide(now);
						}
						touch.active=false;
						if(percent>=10 || percent<=-10) {
							event.preventDefault();
							setTimeout(function(){
								$(slidepanel).removeClass('moving');
							},100);
						}
					};
					if(event.type){
						switch(event.type){
							case "mousemove":onMove(event,event);break;
							case "mouseup":onRelease(event);break;
							case "mousedown":onPress(event);break;

							case "touchstart":onPress(event.targetTouches[0]);break;
							case "touchmove":onMove(event.targetTouches[0],event);break;
							case "touchend":onRelease(event.targetTouches[0]);break;
							case "touchcancel":onRelease(event.targetTouches[0]);break;
							case "touchleave":onRelease(event.targetTouches[0]);break;
								
							case "MSPointerMove":onMove(event,event);break;
							case "MSPointerUp":onRelease(event);break;
							case "MSPointerDown":onPress(event);break;
							case "MSPointerCancel":onRelease(event);break;
							case "MSPointerOut":onRelease(event);break;
						}
					}
				};
				if(options.touch){
					slidepanel.onmousedown	=	onPressEvent;
					slidepanel.onmouseup	=	onPressEvent;
					slidepanel.onmousemove	=	onPressEvent;
					
					if(isTouchDevice){
						slidepanel.ontouchstart	=	onPressEvent;
						slidepanel.ontouchmove	=	onPressEvent;
						slidepanel.ontouchend	=	onPressEvent;
						slidepanel.ontouchcancel=	onPressEvent;
						slidepanel.ontouchleave	=	onPressEvent;
					}
				}
			}

			// CALL: $('#who').trigger('loadSlide', number);
			$(this).bind('loadSlide',function(event,id){
				if(now!=id){
					now=id;
					activeSlide(now);
				}
			});

			$(this).bind('play',function(event,pause){
				play(pause);
			});

			// CALL: $('#who').trigger('nextSlide');
			$(this).bind('nextSlide',function(event){
				nextSlide();
			});
			
			// CALL: $('#who').trigger('previousSlide');
			$(this).bind('previousSlide',function(event){
				previousSlide();
			});
			if(options.slide){
				$(window).resize(function(){
					var newWidth=$(holder).width()/$(slidepanel).width();
					slideWidth=Math.round(newWidth)||1;
					controls();
					activeSlide(now=0);
					maxX=(slides.length*100)-(newWidth*100);
				});
				setTimeout(function(){
					$(window).trigger('resize');
				},1000);
			}
			init();
		});
	};
})(jQuery);