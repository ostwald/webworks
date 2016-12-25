/**
initialized with a dom img (which is inside a wrapper)

<div#burns-wrap>
    <img src=../>
</div>

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

        /*
            the wrapper is draggable, responds to clicks, and contains the image.
            it also contains control objects (e.g., for deletion and resizing)
        */
        this.$wrapper
            .draggable()
            .click (function (event) {
                log ('- ' + self.img_name + ' BurnsImage clicked')
                BURNS.set_current_image(self.img_name)
                // self.showState ()
            })
            .append ($t('button')
                .attr('type', 'button')
                .addClass('image-closer')
                .html('x')
                .button()
                .click (function (event) {
                    event.preventDefault();
                    log ("REMOVE")
                    BURNS.remove_image();
                    return false;
                }))
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
                            $(event.target).css({
                                display:'none'
                            })
                    },
                    drag: function (event, ui) {
//                        log ('drag')

                        var init_width = self.$wrapper.data('width');
                        var init_height = self.$wrapper.data('height');

                        var delta_x = ui.position.left - ui.originalPosition.left;
                        var delta_y = ui.position.top - ui.originalPosition.top;
                        var delta_y_aspect = delta_x * init_height / init_width;

//                        log ("- init width: " + init_width)
//                        log ("- init height: " + init_height)

                        self.$wrapper.css({
                            width :  init_width + delta_x,
//                            height : init_height + delta_y
                            height : self.$wrapper.data('height') + delta_y_aspect
                        })



                        //log ('- new: width: ' + self.$wrapper.width() + ',  height: ' + self.$wrapper.height())
                    },
                    stop:function (event, ui) {
                        log ("stop")
//                        console.log(ui)
                        $(event.target).css({
                            top : '',
                            left : '',
                            background:'transparent',
                            display:'block'
                        })

                    },
                }))
    },

    hide: function () {
        log ("image_hide ...")
        this.$wrapper.hide();
    },

    show: function () {
        this.$wrapper.show();
    },

    activate: function () {
//        log ('activating : ' + this.img_name)
        BURNS.$burns_layer.find('.burns-wrap').removeClass('current')
        this.$wrapper.show().addClass('current')
        return this;
    },

    setState: function (state) {
//        log ("set state: " + this.img_name + " (" + state + ")")
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
        log ('SHOW_STATE: ' + this.img_name);
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

