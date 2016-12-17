
var HappyBirthdayLayer = function () {

    var $HB_LAYER = $('#hb-layer');

    var off_card_positions = get_off_card_positions($HB_LAYER)

    function clear_letters() {
        $HB_LAYER.html("");
    }

    /** FLY_IN */
    function get_fly_in_letter (name) {

        var start_pos = off_card_positions[getRandomIntInclusive(0, off_card_positions.length-1)]

        var $letter = $t('img')
                .attr('src', get_path(name))
                .addClass('letter')
                .css ({left:start_pos.left, top:start_pos.top, position:'absolute', opacity:0})


        if (Object.keys(positioned_letters).indexOf(name) != -1) {
//            log (" -  " + name + " is positioned")
            var pos = positioned_letters[name];
            log (stringify(pos))
            rotateAnimation($letter);
            $letter.animate ({
                left: pos.left,
                top: pos.top,
                opacity:1,
//                }, 4000,
                }, getRandomIntInclusive(4000, 5000),
                function (event) {
                    // animation complete for this object
                    // rotateAnimation(this);
                });
        } else {
            log (" - " + name + " is not positioned")
        }

        return $letter;
    }

    function do_fly_in () {
        log ("do_fly_in")
        $(letters).each(function (i, letter) {
            $HB_LAYER.append(get_fly_in_letter(letter));
        })        
    }

    /** FLY_OUT */
    function fly_out_init () {
        log ("fly_out_init")
        $(letters).each(function (i, letter) {
//            log ("- " + letter)
            $HB_LAYER.append(get_fly_out_letter(letter))
        })
    }

    function get_fly_out_letter(name) {
        var pos = positioned_letters[name];
        var $letter = $t('img')
            .attr('src', get_path(name))
            .addClass('letter')
            .css ({left:pos.left, top:pos.top, position:'absolute', opacity:1})

        return $letter;
    }

    function do_fly_out () {

        $HB_LAYER.find('.letter').each (function (i, letter) {

            var $letter = $(letter)
            var end_pos = off_card_positions[getRandomIntInclusive(0, off_card_positions.length-1)]
            rotateAnimation($letter);

            $letter.animate ({
                left: end_pos.left,
                top: end_pos.top,
                opacity:0,
    //                }, 4000,
                }, getRandomIntInclusive(4000, 5000),
                function (event) {
                    // animation complete for this object
                    // rotateAnimation(this);
                });

        })
    }

    /** DRAGGABLE LETTERS */
    function get_draggable_letter (name) {
       var $letter = $t('img')
                .attr('src', get_path(name))
                .draggable()
                .click (function (event) {
                    log (name)
                    log (" - position - " + stringify($(event.target).position()));
                })

        if (Object.keys(positioned_letters).indexOf(name) != -1) {
//            log (" -  " + name + " is positioned")
            $letter
                .css(positioned_letters[name])
                .css('position', 'absolute')
        } else {
            log (" - " + name + " is not positioned")
        }

        return $letter;
    }

    function show_draggable_letters() {
        log ("show_letters")
        $(letters).each(function (i, letter) {
            $HB_LAYER.append(get_draggable_letter(letter));
        })
    }

    function showLetterPositions () {
        var positions = {}

        $($HB_LAYER).find('img').each(function (i, img) {
            var $img = $(img);
            var src = $img.attr('src')
            var name = src.replace('letters/','').replace('.png', '')
//            log ("src: " + src)
//            log (" - position: " + stringify($img.position()))
            positions[name] = $img.position();
        })
        log ("Positions")
        log (stringify(positions))
    }

    // --------- end draggable letters  ------------------

    function get_path(name) {
        return 'letters/'+name+'.png';
    }

    function moveHappy (x, y) {
        var set = ['h1', 'a1', 'p1', 'p2', 'y1']
        moveSet (set, x, y)
    }

    function moveBirthday (x, y) {
        var set = ['b1', 'i1', 'r1', 't1', 'h2', 'd1', 'a2', 'y2', 'bang']
        moveSet (set, x, y)
    }

    function hide() {
        log ("HIDE");
        $HB_LAYER.hide()
    }

    function doEffect (effectFn) {
        effectFn($HB_LAYER);
    }

    function moveSet (set, x, y) {
        $(set).each (function (i, name) {
            var filename = get_path(name);
    //        log ("filename: " + filename)
            var $img = $("img[src='"+filename+"']")
            if (!$img)
                log ("$img not found for " + filename)
            var pos = $img.position();
            if (!$img)
                log ("$img not found for " + filename)
            $img.css({left:pos.left+x, top:pos.top+y});
        })
    }

    // EVENT HANDLERS - should be defined local to page that uses them!
        $('#show-hb').click(function (event) {
            show_letters();
        })

        $('#show-positions').click(function (event) {
            showLetterPositions();
        })

        $('#do-fly-in').click(function (event) {
            $HB_LAYER.show();
            do_fly_in();
        })

        $('#do-fly-out').click(function (event) {
            do_fly_out();
        })

        $('#fly-out-init').click(function (event) {
            clear_letters();
            fly_out_init();
            $HB_LAYER.show();
        })

        $('#apply-mask').click(function (event) {
            $HB_LAYER.fadeOut();

            $HB_MASK_LAYER
                .css('zIndex', 6)
                .fadeIn()

        })

    return {
       fly_out_init: fly_out_init,
       hide: hide,
       fly_out_init: fly_out_init,
       do_fly_out:do_fly_out,
       clear: clear_letters,
       doEffect, doEffect
    }



}

