
/**
Burns effect. Animate from start point to final Point

we read the burns-data file for burns_configs

*/
var Catalog = Class.extend ({

    init: function () {
        this.$dom =  $('#catalog')
        this.$items = $t('ul')
            .attr ('id', 'catalog-items')
            .appendTo(this.$dom)

    },
    populate: function () {
        var names = Object.keys(BURNS_DATA);
        // console.log (names)
        var $items = this.$items;
        $(names).each (function (i, name) {
            // log ('- ' + BURNS.getPath(name))
            if (name != 'template')
                $items.append($t('li')
                    .html($t('img')
                            .attr('src', BURNS.getPath(name))
                            .css({height:'75px'}))
                    .append($t('div')
                        .css({fontSize:'.85em'})
                        .html(name))
                    .click(function () {
                        BURNS.set_current_image(name)
                        $items.children().removeClass('current')
                        $(this).addClass('current')
                    }))

        })

        $items.sortable({
            change: function (event, ui) {
    //            log ("sortable change")
            },
            stop: function (event, ui) {
                log ("sortable stop")
                var sorted_data = {}
                sorted_data['template'] = BURNS_DATA['template']
                $('#catalog-items').find('img').each (function (i, img) {
                    var img_name = $(img).attr('src').replace ('images/','').replace('.jpg','')
                    sorted_data[img_name] = BURNS_DATA[img_name]
                })
                BURNS_DATA = sorted_data
                $('#burns-data').html("BURNS_DATA = " + stringify(sorted_data))
            }
        });

        return this;

    },

    // handles
    set_current_item: function (event) {

//        log ("catalog.set_current_item");

//        log (" self has " + this.$items.children().length + " items")

        this.$items.children().removeClass('current')

        var current_img = BURNS.get_current_image();
        //        var current_img_name = current_img ? current_img.$img

        if (current_img) {
            var t_src = current_img.$img.attr('src');

            this.$items.find("img[src='" + t_src + "']").closest('li').addClass('current');
        } else {
            log ("WARN: Current_Item not set in set_current");
        }

    }
})

// ------------ Script

// load animator with images (do we have to call set current item?)

log ('LOADING');
var images = ['IMG_2278','IMG_2275', 'IMG_2274']


$(function () {

    log ("listening ..")
    log ("BURNS ? " + typeof (BURNS))
    $(document).on ('klm:animator-ready', function (event) {
        log ("ANIMATOR-READY");
        log ("BURNS ? " + typeof (BURNS))
        $(images).each (function (i, img_name) {
            BURNS.set_current_image (img_name);
        })
    })

    var task1 = {
        trigger: function (timer) {
            return (timer == 2000);
        },
        image: images[0],
        action: function () {
            BURNS.set_current_image(this.image)
            BURNS.animate();
        }
    }

    var task2 = {
        trigger: function (timer) {
            return (timer == 3000);
        },
        image: images[1],
        action: function () {
            BURNS.set_current_image(this.image)
            BURNS.animate();
        }
    }

    var tasks = [ task1, task2 ]

    // run a clock
    var period = 250
    var elapsed = 0;
    var limit = 10000
    CLOCK = setInterval ( function () {
        elapsed += period
        if (elapsed % 500 == 0) {
//            log ("tic: " + elapsed)
        }
        if (elapsed > limit) {
            clearInterval(CLOCK)
        }
        doTasks()
    }, period )

    function doTasks() {
        $(tasks).each (function (i, task) {
            if (task.trigger(elapsed)) {
                log ("DO TASK")
                task.action()
            }
        })
    }

})
