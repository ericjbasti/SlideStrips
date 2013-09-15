//*******************************************************************************************************
//
// Copyright 2013 Eric J. Basti
// http://www.ericjbasti.com
//
// Released under the MIT license
// 
//*******************************************************************************************************
//
//  slideStrips
//
//	Full Responsive Slideshow w/ CSS animated transitions... 
//
// 9/13/13: Fixed some lingering IE8 bugs. Compensated for IE9s inability to transition.
//
// 8/27/13: Minor bug fix, made slingBack go back an entire slideWidth.
//
//  8/1/13: Fixed a bug that prevented multiple dynamic control sets.
//			Each slideshow now has a localized variable containing the controls.
//			Fixed issue with 3 slides of 2 panel width, never dragging to the last slide.
//			Added in a very basic form of lazy loading.
//
//	6/5/13: updateWidths() now checks to see if we see over 98% of a slide, 
//			and if so cound it as in view.
//
//  6/4/13: updated the way active is applied to visible slides. 
//			this allows multiple slides to be marked as active.
//
//  3/3/13: fixing issues with single panel slideshows... the forgotten.
//
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


	$.fn.slideStrip = function(options) {
		var defaults = {
			start:0,
			pause:5,
			autoPlay:true,
			slide:false,
			touch:true,
			controls: null,
			trueFit:true,
			slingBack:false,
			threshold:20,
			fallBacks:{fadeTime:0.5,slideTime:0.5},
			onSlideChange:function(){}
		};

		options = $.extend(defaults, options);

		return this.each(function() {
			var slideStrip = this;
			var slideControls= null;
			var holder = $(this).wrap("<div class='slideStrip'>").parent();
			var slides = $(this).find('li');

			// ok, so you could pass in an #id for this, but in some situation you won't want to already have these places on the screen.
			// this 'add' check allows the controls to be inside the 'slideStrip'.
			// this might become standard ill have to think about it.
			if (options.controls=='add') {
				$(holder).append('<div class="controls"></div>');
				slideControls=$(holder).find('.controls');
			}

			var now = options.start;
			var timer = null;
			var paused = !options.autoPlay;
			var maxX=0;
			var minX=0;
			var trueWidth=1;
			var slideWidth=1;

			// ok so we need to get the height of this slideStrip, we need it to be responsive... lets make a sizing element.
			// inorder to make sure the sizing is correct, we want to use the exact markup of an original element.
			// however we need to make sure a few things are true, so we inline those styles.
			var heightElement = $(slideStrip).prepend("<li class='sp_invisible' style='visibility:hidden;position:relative;'>"+$(slides[now]).html()+"</li>");
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
				if(!transform)	$(slideStrip).clearQueue();
				$(slides).removeClass('active');
				for (var i=0; i!= slideWidth; i++){
					$(slides[id+i]).addClass('active');
					var img= $(slides[id+i]).find('img');
					if($(img).attr('ref') && $(img).attr('ref')!= $(img).attr('src')){
						$(img).attr('src',$(img).attr('ref'));
						//$(slideStrip).removeClass('accelerate');
					}
				}

				if(options.slide){
					var newX=-(id*100);
					if(options.trueFit){
						if(id+slideWidth>slides.length-1){
							newX=-maxX;
							now=(Math.round(newX/100))*-1;
						}
					}
					if(transition){
						slideStrip.style[transform] = 'translateX('+newX+'%)';
					}else{
						// So close, but for some reason I have to divide by the slideWidth, guess the positioning is messing with my 100%.
						if(transform){ //ie9
							$(slideStrip).animate({'transform': newX}, {
							    step: function(newX) {
							      $(this).css('-ms-transform','translateX('+newX+'%)');
							    }},options.fallBacks.slideTime*1000);
						}else{ // ie8
							console.log('ie8')
							$(slideStrip).animate({left:newX/trueWidth+"%"},options.fallBacks.slideTime*1000);
						}
					}
				}else{
					if(!options.slide && !transition){
						$(slides).fadeOut(options.fallBacks.fadeTime);
						$(slides[id]).fadeIn(options.fallBacks.fadeTime);
					}
				}
				if (slideControls){
					$(slideControls).find('.button').removeClass('active');
					if(options.trueFit){
						id=Math.round((id/slideWidth)+0.4)*slideWidth;
					}
					$(slideControls).find('.button[name='+id+']').addClass('active');
					if (now>=slides.length-slideWidth) {
						$(slideControls).find('.button:last-child').addClass('active');
					}
				}
			};

			var play = function(pause){
				activeSlide(now);
				options.onSlideChange(now,slides.length-slideWidth);
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
				//console.log(now,slideWidth,slides.length,now-1>slides.length-slideWidth)
				if (now-(slideWidth/2)>slides.length-slideWidth) {
					if(options.slingBack){
						now=0;
					}else{
						now=slides.length-slideWidth;
					}
				}
				play(paused);
			};

			var previousSlide = function(){
				now-=slideWidth;
				if (now<0) {
					if(options.slingBack && now<=-slideWidth){
						now=slides.length-slideWidth;
					}else{
						now=0;
					}
				}
				play(paused);
			};

			// lets create the controls...
			var controls = function(){
				if(slideControls){
					var buttons='';
					var count=0;
					for (var i=0;i<slides.length;i+=slideWidth){
						buttons+='<div class="button" name="'+i+'"></div>';
						count++;
					}
					// if we only have one panel, we shouldn't create a single button,
					// otherwise, let them live.
					if (count==1){
						$(slideControls).html('');
					}else{
						$(slideControls).html(buttons);
						$(slideControls).find('.button').click(function(){
							var id=parseFloat($(this).attr('name'));
							now=id;
							play(paused);
						});
					}
				}

			};

			var updateWidths = function (){
				trueWidth=$(holder).width()/$(slideStrip).width();
				slideWidth=Math.floor(trueWidth) || 1;
				// to many situation when a browser rounds our css% so we need to take action
				// if your within a range that I would consider a 5% margin of error, we are going to upgrade you.
				// seing 98% of a slide should count as seeing the whole thing.
				if(trueWidth-slideWidth>.95) slideWidth++;
			};

			var init = function(){
				if (options.slide) updateWidths();
				controls();
				play(paused);
			};

			// ok now we have some 'touch' options, in my world touch and mouse are the same
			// they only act differently in certain situations. So we'll catch those situation,
			// but for the most part, keep everything the same.
			if(options.touch){
				holder.addClass('touch');
				var touch={active:false,x:0,y:0,deltaX:0,deltaY:0};
				var original={width:0,x:0,y:0};
				var percent=0;

				var onPressEvent=function(event){
					if(navigator.msMaxTouchPoints) event.preventDefault();
					if (!event) event = window.event;

					var onPress=function(event){
						if(transform){
							original.x=parseFloat((slideStrip.style[transform]).replace('translateX(',''));
							$(slideStrip).addClass('accelerate');
						}else{
							$(slideStrip).clearQueue();
							original.x=parseFloat(slideStrip.style.left);
						}
						original.width=$(slideStrip).find('.active').width();
						percent=0;
						touch.active=true;
						touch.x=parseFloat(event.clientX);
						touch.y=parseFloat(event.clientY);
						touch.deltaX=touch.deltaY=0;
						clearTimeout(timer);
						paused=true;
						if(transition) slideStrip.style[transition+'Duration'] = '0s';
						if(event.type=='mousedown'){
	
							if(event.preventDefault){
								event.preventDefault();
							}else{
								// window.event.returnValue = false;
								// window.event.cancelBubble = true;
							}
						}
					};

					var onMove=function(event,e){
						if(touch.active){
							touch.deltaX = touch.x-parseFloat(event.clientX);
							touch.deltaY = touch.y-parseFloat(event.clientY);
							percent = (touch.deltaX/original.width)*100;
							if (!transform) percent = percent/trueWidth;
							if(options.slide && slides.length>slideWidth){
								var newX = original.x-percent;
								if (newX>0){
									newX = newX/4;
								}
								if(transform){
									if (newX<=-maxX){
										if(original.x>-maxX+25){
											newX = -maxX+25-(percent*0.25);
										}else{
											newX = -maxX-(percent*0.25);
										}
									}
									slideStrip.style[transform] = 'translateX('+newX+'%)';
								}else{
									if (newX<=-(maxX-(slideWidth*100))){
										newX = -maxX+(slideWidth*100)-(percent*0.25);
									}
									$(slideStrip).css({'left':newX+'%'});
								}
							}
							if(touch.deltaX>=10 || touch.deltaX<=-10) {
								if(e.preventDefault) {
									e.preventDefault();
								}else{
									window.event.returnValue = false;
									window.event.cancelBubble = true;
								}
								$(slideStrip).addClass('moving');
							}
						}
					};

					var onRelease=function(event){
						// lets rest the duration so it will use the CSS setting
						if(transition){
							slideStrip.style[transition+'Duration'] = '';
						}
						var newX;
						var maxDelta=options.threshold;
						if (!transform) maxDelta=maxDelta/trueWidth;
						if(percent>maxDelta){
							nextSlide();
						}else if (percent<-maxDelta){
							previousSlide();
						}else{
							activeSlide(now);
						}
						touch.active=false;
						if(percent>=5 || percent<=-5) {
							//event.preventDefault();
							setTimeout(function(){
								$(slideStrip).removeClass('moving');
							},100);
						}else{
							return true
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
					slideStrip.onmousedown	=	onPressEvent;
					slideStrip.onmouseup	=	onPressEvent;
					slideStrip.onmousemove	=	onPressEvent;

					if(isTouchDevice){
						slideStrip.ontouchstart	=	onPressEvent;
						slideStrip.ontouchmove	=	onPressEvent;
						slideStrip.ontouchend	=	onPressEvent;
						slideStrip.ontouchcancel=	onPressEvent;
						slideStrip.ontouchleave	=	onPressEvent;
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
					if (options.slide) updateWidths();
					controls();
					now=0;
					play(true);
					maxX=(slides.length*100)-(trueWidth*100);
				});
				setTimeout(function(){
					$(window).trigger('resize');
					$(slideStrip).addClass('accelerate');
					// we set this class after everything is placed on the screen 
				},500);
			}
			init();
		});
	};
})(jQuery);