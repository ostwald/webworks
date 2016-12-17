
// PRE-LOAD EMOJIS


//$(function() {

    var EmojiLayer = function () {

        var EMOJI_INTERVAL_ID;
        var CYCLE_INTERVAL_ID;
        var emojis_to_display = 500;
        var emoji_size = 75;
        var emojis = get_emojis();
        var DISPLAYED = 0;
        var snap_to = 25;
        var $EMOJI_LAYER = $('#emoji-layer');

        var img_ext = '.jpg'
//        var img_ext = '.png'

        var emoji_dir;  // dependent on img_ext

        if (img_ext == '.png')
            emoji_dir = 'emoji-png/';
        else if (img_ext == '.jpg')
            emoji_dir = 'emoji-jpg/';

        function getPath(name) {
            return emoji_dir + getFilename(name);
        }

        function getFilename (name) {
            return name + img_ext;
        }

        function getRandomEmoji () {
            return emojis[getRandomIntInclusive(0, emojis.length-1)]
        }

        function show() {
            $EMOJI_LAYER.show()
        }

        function hide() {
            $EMOJI_LAYER.hide()
        }

        /**
        usage
            EMOJI_LAYER.doEffect(function (obj) {
                log ('doEffect callback')
                obj.show();
                obj.animate({
                    backgroundColor:'green',
                    opacity:1,
                }, 4000)
            })
        */
        function doEffect(effectFn) {
            effectFn($EMOJI_LAYER);
        }

        function getRandomPosition () {
            var pos = $('#emoji-layer').position();
            var dims = {width: $('#emoji-layer').width(), height:$('#emoji-layer').height()}
            var x = getRandomIntInclusive (-(emoji_size/2), dims.width);
            var y = getRandomIntInclusive (-(emoji_size/2), dims.height);

            // ROUND (snap_to) to grid
            x = Math.round(x/snap_to)*snap_to;
            y = Math.round(y/snap_to)*snap_to;

            // log (DISPLAYED + ' - random pos: ' + x + ', ' + y);
            return {left:x, top:y}
        }

        function placeRandomEmoji () {
            var pos = getRandomPosition ();
            var emoji = getRandomEmoji();
//            log ("src: " + getPath(emoji))
            var emoji = $t('img')
                .addClass ('emoji')
                .css(pos)
                .css({height:emoji_size, width:emoji_size, borderRadius:emoji_size/2})
                .css('display', 'none')
                .attr('src', getPath(emoji))
                .appendTo($EMOJI_LAYER)

            var degrees = getRandomIntInclusive(-45, 45);
    //        log (degrees);
            rotate_img (emoji, degrees)

            return emoji;
        }

        function toggleEmojis() {
            if (EMOJI_INTERVAL_ID)
                stopEmojis();
            else
                startEmojis();
        }

        function startEmojis () {
            var i=0;
            EMOJI_INTERVAL_ID = setInterval(function () {
                if (i<emojis_to_display - 1) {
                    // emojis[i].fadeIn();
                    var emoji = placeRandomEmoji();
                    emoji.fadeIn();
                    DISPLAYED++;
                } else {
                    stopEmojis()
                }
                i++;
            }, 5)
        }

        function stopEmojis () {
            clearInterval (EMOJI_INTERVAL_ID)
            EMOJI_INTERVAL_ID = null;
            $CARD.trigger("klm:emojis-stopped");
        }

        function hideEmojis (name) {
    //        $('img[src="emoji/'+name+'"]').fadeOut();

            $EMOJI_LAYER.find('img[src="' + getPath(name)+'"]').animate ({
                opacity:0
            }, 2000)


            // bring roses to top
    //        $('img[src="emoji/pink-rose.png"], img[src="emoji/red-rose.png"]').animate({
    //            zIndex: 10
    //        }, 2000)


        }

        function shakeEmojis() {
            var left_i = $EMOJI_LAYER.position().left;
            var top_i = $EMOJI_LAYER.position().top;
            var INTERVAL_ID = setInterval(function () {
                var x = getRandomIntInclusive(-30, 30)
                var y = getRandomIntInclusive(-30, 30)
                $($EMOJI_LAYER).css ({
                    top:top_i + y,
                    left:left_i + x
                });
    //            $EMOJI_LAYER.animate ({
    //                top:top_i + y,
    //                left:left_i + x
    //            }, 300);

            }, 400)

            setTimeout(function () {
                clearInterval(INTERVAL_ID)
    //    	    INTERVAL_ID = null;
            }, 10000)
        }

        function toggleCycle() {
            if (CYCLE_INTERVAL_ID)
                stopCycle();
            else
                startCycle();
        }

        function startCycle() {
            var keepers = ['pink-rose', 'red-rose','heart', 'cake']
            var i = 0;
            CYCLE_INTERVAL_ID = setInterval (function () {
                var name =  keepers[i++ % keepers.length]
               $EMOJI_LAYER.find('.emoji').attr('src', getPath(name))
            }, 500)
        }

        function stopCycle() {
            clearInterval(CYCLE_INTERVAL_ID);
            CYCLE_INTERVAL_ID = null;

        }

        function clear() {
            $EMOJI_LAYER.html("");
        }


        /**
        EVENT HANDLERS SHOULD BE DEFINED LOCALLY - NOT HERE
        */

/*        $('#toggle-emojis').click (function (event) {
            log ("TOGGLE: " + EMOJI_INTERVAL_ID)
            if (EMOJI_INTERVAL_ID)
                stopEmojis();
            else
                startEmojis();

        })

        $('#fade-emojis').click (function (event) {
            var opacity = $('#emoji-layer').css('opacity');
            log ("opacity: " + opacity)
            if (opacity == 1)
                $('#emoji-layer').animate({
                    'opacity': .2
                }, 1000)
            else
                $('#emoji-layer').animate({
                    'opacity': 1
                }, 1000)
        })

        $('#hide-emojis').click (function (event) {
            var keepers = ['pink-rose', 'red-rose']
            $(EMOJI_NAMES).each(function (i, name) {
                if (keepers.indexOf(name) == -1)
                    hideEmojis(name)
            });
        })

        $('#cycle-emojis').click (function (event) {
            log ("CYCLE: " + CYCLE_INTERVAL_ID)
            if (CYCLE_INTERVAL_ID)
                stopCycle();
            else
                startCycle();
        })

        $('#shake-emojis').click (function (event) {
            shakeEmojis();
        })*/


   // API
   return {
             start: startEmojis,
             stop: stopEmojis,
             toggleEmojis: toggleEmojis,
             cycle: startCycle,
             stopCycle: stopCycle,
             toggleCycle: toggleCycle,
             clear:clear,
             show:show,
             hide:hide,
             doEffect: doEffect,
             shakeEmojis: shakeEmojis
           }

    }



//})
