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
            this.set_current_image(img_name);
        log ("SENDING READY")
        setTimeout (function () {
            $(document).trigger ('klm:animator-ready')
        }, 500)
    },

    get_current_image: function () {
        return this.images[this.img_name];
    },

    // instantiate an image if necessary, and then
    // side-effect sets this.img_name
    set_current_image: function (img_name) {
        log ("\nset_current_image: " + img_name)
        this.img_name = img_name || this.img_name;

        $('input#img-name')
            .val(this.img_name)

        this.$burns_layer.children('img').removeClass('current')

        var self = this;

        function finalize (burns_image) {
            burns_image.activate()
            // log ("set Burns image (" + burns_image.img_name + ") in self.images")
            self.images[burns_image.img_name] = burns_image

            self.current_image = burns_image;
            self.update_state_table()
            $CARD.trigger ("klm:current-image-change", burns_image)

        }

        var image = this.images[this.img_name]
        if (!image) {

            log ('path: ' + this.getPath())

            var $img = $t('img')
                .attr('src', this.getPath())
                .addClass('burns-image current')
                .load (function (event) {
                    // log ("image load complete")
                    self.$burns_layer
                        .append($t('div')
                            .addClass('burns-wrap')
                            .html(this)); // this is the img which has been loaded
                    var burns_image = new BurnsImage(this) // BurnsImage wraps the img
                         .setState('init')
                   finalize(burns_image)
                })
        }
        else {
//            image.activate();
            finalize(image)
        }

    },

    cache_configs:function () {
        var key = 'klm_configs';
        localStorage.setItem(key, JSON.stringify(this.data));

    },

    remove_image: function () {
//        var image = this.images[this.img_name]
        var image = this.get_current_image();
        log ("preparing to delete: " + this.img_name)
        if (!image) {
            log (" BurnsImage not found for: " + this.image_name)
            return;
        }
        image.hide();
        // delete this.
    },

    get_config_data: function () {
//        log ("Animator get_config_data - image_name: " + this.img_name)
        var image = this.get_current_image();
        if (!image) {
            log ("image not found for " + this.image_name)
            return null;
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

    animate: function (all) {
        var images = []
        if (all) {
            // get all visible .burns-wrap
            for (var img_name in this.images) {
                var image = this.images[img_name]
                if (image.$img.is(':visible'))
                    images.push(image)
            }
        } else {
            images = [this.get_current_image(),];
        }

        var self = this;
        $(images).each (function (i, image) {
            image.setState('init');
            var final_state = image.get_config_data().final

            // this.$img.css({opacity:0})
            // rotateAnimation(this.$img, 5)
            log ('animating with duration: ' + self.animation_duration)
            image.$wrapper.animate (final_state, self.animation_duration, function () {
                $CARD.trigger('klm:burns-animation-done', self)
            })

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
//        log("update_state_table")
        var $tbody = $('#state-table').find('tbody')

        $tbody.html('')

        var config_data = this.get_config_data();

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

    }

})