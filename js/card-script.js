
/**
    This must come first because components depend on it
    - close all card-layers to initialize
*/


/* ----------------------------- */

var SPIN_NUM = 0;
var slot_winners = [
    'cake',
    'chick',
    'red-rose',
    'pink-rose'
]

$('button').button();

$('#slot-start-button')
    .css({
        boxShadow: '2px 2px 7px #666666',
        border: 'black solid thin'
    })
    .click (function (event) {
        log ("START")
        // CLEAR EMOJIS - this makes slot more efficient
        $('#emoji-layer').html("");
        SLOT.spin(slot_winners[SPIN_NUM], function (obj) {
            setTimeout (function () {
                SLOT.deactivate(function () {
                    init_step(++SPIN_NUM);
                    SLOT.initialize();
                })
            }, 2000);
        });
        $(this).fadeOut();

});

// Preload big images. we can start as soon as the first is loaded

var burns_images_to_preload = ['k_blowing',
    'k_keystone', 'fun_bike', 'grass_with_leo','okaboji_tube', // 1
    'iceland_falls', 'alps_glacier', 'eiffel','alps_vista',   // 2
    'jk_vail_hike', 'okaboji_bench_JK','okaboji_stoners', 'j&k_keystone' // 3
    ]


function start_card () {

    $('#text-layer')
        .addClass ('step_'+SPIN_NUM)
//        .html($t('div').html("Happy Birthday Karen!").css({margin:0, padding:0}))
        .html($t('div')
            .html("loading ...").css({paddingTop:"25px", fontSize:'1.0em'})
            .append($t('img')
                .addClass('spinner')
                .attr('src', 'spinner.gif')))
        .fadeIn( function () {
            $(burns_images_to_preload).each (function (i, name) {
                $t('img')
                    .attr('src', BURNS.getPath(name))
                    .load (function (event) {
                    log ("loaded " + name);
                    if (name == 'k_blowing') {
                        $('#text-layer').fadeOut(100, function () {
                            init_step()
                        });
                    }
                })
            });
        });
}

// use step param to start at particular step
if (PARAMS.step)
    init_step(parseInt(PARAMS.step))
else
    start_card();


function init_step(step) {
    SPIN_NUM = step || SPIN_NUM
    switch (SPIN_NUM) {
        case 0:
            log ("STEP: " + SPIN_NUM);
            setTimeout (function () {
                try {
                    BURNS.set_current_image ('k_blowing');
                    BURNS.$burns_layer.show()
                    BURNS.$img.animate({
                        opacity:0.3
                    }, 4000, function (event) {
                        SLOT.activate();
                        $('#text-layer').fadeOut(1000)
                    })
                } catch (error) {
                    log ("ERROR: " + error);
                }
            }, 500)
            break;
        case 1:
            log ("STEP: " + SPIN_NUM);
            SLOT.deactivate()
            ;
            $('#text-layer')
                .addClass ('step_'+SPIN_NUM)
                .css({zIndex:20, position:'absolute', top:200})
                .html("You're not getting older, You're getting better!")
                .fadeIn()


            var images = ['k_keystone', 'fun_bike', 'grass_with_leo','okaboji_tube']
            do_burns (images);

            break;
        case 2:
            log ("STEP: " + SPIN_NUM);
            SLOT.deactivate();

            $('#text-layer')
                .addClass ('step_'+SPIN_NUM)
                .css({zIndex:20, position:'absolute', top:200})
                .html("You really do get around, baby!")
                .fadeIn()

            var images = ['iceland_falls', 'alps_glacier', 'eiffel','alps_vista' ]
            do_burns (images);

            break;
        case 3:
            log ("STEP: " + SPIN_NUM);
            SLOT.deactivate()
            $('#text-layer')
                .addClass ('step_'+SPIN_NUM)
                .css({zIndex:20, position:'absolute', top:200})
                .html("Let's maintain frequent contact!")
                .fadeIn()

            var images = ['jk_vail_hike', 'okaboji_bench_JK','okaboji_stoners', 'j&k_keystone' ]
            do_burns (images);

            break;
        case 4:
            log ("STEP 4")
            SLOT.deactivate()


            HB_LAYER.hide();
            HB_LAYER.fly_out_init();

            $CARD.css({backgroundColor:'black'});
            if (BURNS.$img)
                BURNS.$img.fadeOut(2000)

            if (screen.availWidth < 667) { // MOBILE - skipp emoji)

                HB_LAYER.doEffect(function (obj) {
                    obj.fadeIn (4000, doHBFlyout)
                })
            }
            else {

                EMOJI_LAYER.doEffect (function (obj) {
                    obj.fadeIn(1000,
                        EMOJI_LAYER.start())
                })
            }

            // -------------------------------------
            $CARD.on('klm:emojis-stopped', function () {
                log ("klm:emojis-stopped");
                setTimeout ( function () {
                    $HB_MASK_LAYER.fadeIn(2000, function () {
//                        $CARD.trigger('klm:mask-displayed')
                        doCycleEmojis()
                    });

                }, 3000);
            });

            break;
    }
}

function doCycleEmojis () {
    log ("doCycleEmojis")
    EMOJI_LAYER.cycle()
    setTimeout (function () {
        // show letters
//        HB_LAYER.fadeIn();

        HB_LAYER.doEffect(function (obj) {
            obj.fadeIn (4000, doHBFlyout)
        })
    }, 10000)
}

function doHBFlyout() {
    log ("doHBFlyout");
    EMOJI_LAYER.clear();
    $HB_MASK_LAYER.hide();
    HB_LAYER.do_fly_out()
}

function do_burns (images) {
    var img_cnt = 0;
    if (BURNS.$img)
        BURNS.$img.fadeOut(2000)
    var interval = setInterval(function () {
            if (img_cnt == images.length -1) {
                log ("stopping step 1 images")
                clearInterval(interval);
                log ("step 2 - cleared interval to fade in slot: " + interval)
                setTimeout (function () {
                    SLOT.activate();
                    $('#text-layer').fadeOut()

                }, 8000)
            }
            var image = images[img_cnt]
            BURNS.set_current_image (image);
            BURNS.$burns_layer.show()
            BURNS.animate()
            img_cnt++;
    }, 5000)
}