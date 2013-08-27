slideStrips v1.0
==========

Goals
-----
* Fully Responsive
* Allow all styling to happen through CSS
* Work well on mobile
* Use as little JavaScript as possible. (working on losing the jQuery dependency)


How to use
----------

Basic form:

```javascript
$('#slides').slideStrip();
```

Sliding + adding controls:

```javascript
$('#slides').slideStrip({controls:'add', slide:true});
```

Lazy Loading:

If your images include a ref property, the slideStrip will compare that to the current image src and load a new image if it needs to.
The src and ref image files should be of the same aspect ratio.

```html
 <ul class="slide-strip">
     <li><img ref="/images/image1.jpg" src="/images/image1_low.jpg"></li>
```

Paramaters:

```javascript
start : 0, // slide to start on
pause : 5, // time in seconds between slides
autoPlay : true, // should it play automatically? 
slide : false, // does this slide from left to right?
touch : true, // allow for mouse and touch events?
controls : null, // #id of container to place controls, or 'add' to automagicly create.
trueFit : true, // should I avoid showing empty white space?
slingBack : false, // if I go to far should I stop or slide all the way back.
threshold : 30, //
fallBacks : { // fallbacks for ie8 & 9
				fadeTime:0.5,
				slideTime:0.5
			},
onSlideChange:function(){} // event that fires when the slide changes.
```

Events:

```javascript
$('#who').trigger('loadSlide', number); // number = the slide to load

$('#who').trigger('play', pause); // pause = boolean;

$('#who').trigger('nextSlide'); // causes the slideStrip to advance

$('#who').trigger('previousSlide'); // causes the slideStrip to go back
```
