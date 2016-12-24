
/**
Burns effect. Animate from start point to final Point

we read the burns-data file for burns_configs

*/

/**
initialized with a dom img inside a wrapper

the img is styled at 100% width and height
all position and dimensions applied to wrapper. img fills appropriately
*/
var BurnsImage = Class.extend({
    init: function (img) {
        this.$img = $(img)
        this.$wrapper = this.$img.closest('.burns-wrap')
        log ("BUrNS IMAGE for: " + this.$img.attr('src'));
        var self = this;
        this.img_name = $(img).attr('src').replace ('images/','').replace('.jpg','')
        this.$wrapper
            .draggable()
            .click (function (event) {
                log ('- ' + self.img_name + ' clicked')
                BURNS.initialize_image(self.img_name)
                self.showState ()
            })
            .append ($t('button')
                .attr('type', 'button')
                .addClass('image-closer')
                .html('x')
                .button())
            .append ($t('img')
                .attr('src', '../assets/se-grab.png')
                .addClass('image-se')
                .css({
                    'position': 'absolute',
                    height:'20px',
                    width: '20px'
                })
                // .html('?')
//                .button()
                .draggable( {
                    start:function (event, ui) {
                        log ("start")
                        self.$wrapper
                            .data('width', self.$wrapper.width())
                            .data('height', self.$wrapper.height())
                    },
                    drag: function (event, ui) {
//                        log ('drag')

                        var delta_x = ui.position.left - ui.originalPosition.left
                        var delta_y = ui.position.top - ui.originalPosition.top
//                        log ("- deltas  x: " + delta_x + ", y: " + delta_y);

                        var init_width = self.$wrapper.data('width');
                        var init_height = self.$wrapper.data('height');

                        log ("- init width: " + init_width)
//                        log ("- init height: " + init_height)

                        self.$wrapper.css({
                            width : init_width + delta_x,
//                            height : init_height + delta_y
                            height : init_height + (delta_x * init_height / init_width)
                        })

                        //log ('- new: width: ' + self.$wrapper.width() + ',  height: ' + self.$wrapper.height())
                    },
                    stop:function (event, ui) {
                        log ("stop")
//                        console.log(ui)
                        $(event.target).css({
                            top : '',
                            left : '',
                            background:'transparent'
                        })

                    },
                }))
    },

    hide: function () {
        this.$wrapper.hide();
    },

    show: function () {
        this.$wrapper.show();
    },

    activate: function () {
        log ('activating : ' + this.img_name)
        BURNS.$burns_layer.find('.burns-wrap').removeClass('current')
        this.$wrapper.show().addClass('current')
        return this;
    },

    setState: function (state) {
        log ("set state: " + this.img_name + " (" + state + ")")
        var data;
        // log (stringify(BURNS_DATA))
        try {
           data = this.get_config_data()[state]
//           log ("setState data - " + stringify(data));
        } catch (error) {
            log ("setState Error: could not get data for " + name);
            this.$img.css ({left: 0, top: 0, width: '', height: ''})
            return;
        }

        this.$wrapper.css(data);

       return this;
    },

    saveState: function (state) {
        log ("image saveState")
        var pos = this.$wrapper.position();
        BURNS_DATA[this.img_name][state] = {
            left: pos.left,
            top: pos.top,
            height: this.$img.height(),
            width: this.$img.width()
        }

        log ("position: " + stringify(this.$img.position()));
        return this;
    },

    showState: function () {
        log (this.img_name);
        var pos = this.$wrapper.position();
        log (stringify ({
//            name: this.$img.attr('src'),
            top: pos.top,
            left: pos.left,
            height: this.$img.height(),
            width: this.$img.width()
        }))
    },

    get_config_data: function () {
        var data = BURNS_DATA[this.img_name];
        if (this.$img.length) {
//            console.log (this.$img)
//            log ("$img exists?")
//            log (' -- ' + this.$img.height())
        }
        if (!data) {
            log ("NOTICE: data not found for " + this.img_name);
            var initial_data = {
                top: 0,
                left: 0,
                height: this.$img.height(),
                width: this.$img.width()
            }
            var data = {
                'init': initial_data,
                'final': initial_data
            }
            BURNS_DATA[this.img_name] = data;
        }
        return data;
    },

    zoom_in: function (zoom_factor) {
        zoom_factor = zoom_factor || 1.2;
        this.$wrapper.css({
            width : this.$wrapper.width() * zoom_factor,
            height : this.$wrapper.height() * zoom_factor,
        })
    },
    zoom_out: function (zoom_factor) {
        zoom_factor = zoom_factor || 1.2;
        this.$wrapper.css({
            width : this.$wrapper.width() / zoom_factor,
            height : this.$wrapper.height() / zoom_factor,
        })
    }

});


var BurnsAnimator = Class.extend({
    init: function (img_name) {
        this.$img = null;

        // define some defaults
        this.pics_dir = 'images/'
        this.zoom_factor = 1.2;
        this.animation_duration = 5000;
        this.img_ext = '.jpg'
        this.$burns_layer = $('#burns-layer')
//        this.initialize_UI();
        $CARD.append(this.$burns_layer)
        this.images = {}
        this.img_name = null;
        if (img_name)
            this.initialize_image(img_name);

    },

    get_current_image: function () {
        return this.images[this.img_name];
    },

    // instantiate an image if necessary, and then
    // side-effect sets this.img_name
    initialize_image: function (img_name) {
        // IMAGE SHOULD BE ON IT'S OWN DIV (BURNS)
        this.img_name = img_name || this.img_name;

        $('input#img-name')
            .val(this.img_name)

        this.$burns_layer.children('img').removeClass('current')

        var image = this.images[this.img_name]
        if (!image) {

            var self = this;
            log ('path: ' + this.getPath())

            var $img = $t('img')
                .attr('src', this.getPath())
                .addClass('burns-image current')
                .load (function (event) {
                    log ("image load complete")
                    self.$burns_layer
                        .append($t('div')
                            .addClass('burns-wrap')
                            .html(this));
                    var burns_image = new BurnsImage(this)
                         .setState('init')
                         .activate()
                    log ("set Burns image (" + burns_image.img_name + ") in self.images")
                    self.images[burns_image.img_name] = burns_image

                    self.current_image = burns_image;
                    log ("calling update state table from initialize impage")
                    self.update_state_table()
                })

        }
        else {
            image.activate();
        }

    },

    cache_configs:function () {
        var key = 'klm_configs';
        localStorage.setItem(key, JSON.stringify(this.data));

    },

    remove_image: function () {
        var image = this.images[this.img_name]
        log ("preparing to delete: " + this.img_name)
        if (!image) {
            log (" BurnsImage not found for: " + this.image_name)
            return;
        }
        image.hide();
        // delete this.
    },

/*    initialize_UI: function () {
        var self = this;
        
        $('button').button()
        $('input#zoom-factor').val(this.zoom_factor);
        $('input#img-name')
            .val(this.img_name)
            .change (function (event) {

                img_name = $(this).val();
                self.initialize_image(img_name);
            })

    
        $('#do-init').click (function (event) {
            self.setState('init');
        })
    
        $('#do-final').click (function (event) {
            self.setState('final');
        })
    
        $('#do-burns').click (function (event) {
            self.animate();
        })

    },*/
    
    get_config_data: function () {
        log ("Animator get_config_data - image_name: " + this.img_name)
        var image = this.get_current_image();
        if (!image) {
            log ("image not found for " + this.image_name)
        }
        return image.get_config_data()
    },

    showState: function () {
        var image = this.get_current_image().showState();
    },

    getPath: function (name) {
        name = name || this.img_name
        return this.pics_dir + name + this.img_ext
    },

    /**
    set state to either initial or final (shouldn't this really take
    a state obj?
    */
    setState: function (state) {
        var image = this.get_current_image().setState(state);
    },

    animate: function (name) {
        var image = this.get_current_image();
        image.setState('init');
        var final_state = image.get_config_data().final
        var self = this;
        // this.$img.css({opacity:0})
        // rotateAnimation(this.$img, 5)
        image.$wrapper.animate (final_state, this.animation_duration, function () {
            $CARD.trigger('klm:burns-animation-done', this)
        })
    },

    saveState: function(state) {
        log ("saveState = " + state)

        var image = this.get_current_image();

        if (state == 'init' || state == 'final') {
            image.saveState(state)
        }
        log ('Updated ' + state + ' config for ' + this.img_name);
        log (stringify(BURNS_DATA[this.img_name][state]))
        $('#burns-data').html("BURNS_DATA = " + stringify(BURNS_DATA))
        this.update_state_table()
    },

    convert_config: function () {
        log ("BURNS_DATA")

        function get_state_data(img_data, state) {
            var old_data = img_data[state]
            var new_data = {}
            new_data.top = old_data.pos.top;
            new_data.left = old_data.pos.left;
            new_data.width = old_data.dims.width;
            new_data.height = old_data.dims.height;
            return new_data;

        }
        var NEW_BURNS = {}
        for (var key in BURNS_DATA) {
            log (" - " + key)
            var old_data = BURNS_DATA[key]
            var new_data = {}
            $(['init', 'final']).each (function (i, state) {
                var sdata = {}
                try {
                    sdata = get_state_data(old_data, state)
//                    log (stringify (sdata))
                } catch (error) {
                    log ("ERROR (" + key + "): " + error)
                }
                new_data[state] = sdata
            })
            NEW_BURNS[key] = new_data;
        }
        return NEW_BURNS;
    },

    dump_config: function () {
        console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
        log (stringify (BURNS_DATA));
    },

    update_state_table:function () {
        log("update_state_table")
        var $tbody = $('#state-table').find('tbody')
         $tbody.html('')
        log ("about to get config data")

        var config_data = this.get_config_data();
        log ("about to show config data")
        log(stringify(config_data))
        $(['top', 'left', 'height', 'width', 'opacity']).each (function (i, attr) {
//            log ('attr: ' + attr)
//            log (" - "+ config_data['init'][attr])
            var row = $t('tr')
                .append($t('td')
                    .attr('id', attr)
                    .html(attr))
                .append($t('td')
                    .html($t('input')
                        .attr('type', 'text')
                        .attr('class', 'init')
                        .change(function (event) {
                            log ("CHANGE!")
                        })
                        .val(config_data['init'][attr])))
                .append($t('td')
                    .html($t('input')
                        .attr('class', 'final')
                        .change(function (event) {
                            log ("CHANGE!")
                        })
                        .val(config_data['final'][attr])))
                .appendTo($tbody)
        })

        log (" .... update_state_table done")
    }

})

function populateCatalog() {
    var $dom = $('#catalog')
    var $items = $t('ul')
        .attr ('id', 'catalog-items')
        .appendTo($dom)

    var names = Object.keys(BURNS_DATA);
    // console.log (names)
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
                    BURNS.initialize_image(name)
                    $items.children().removeClass('current')
                    $(this).addClass('current')
                }))

    })

    $('#catalog-items').sortable({
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

    log ("catalog populated")

}


