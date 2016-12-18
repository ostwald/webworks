
/**
Burns effect. Animate from start point to final Point

we read the burns-data file for burns_configs

*/

/**
initialized with a dom img
*/
var BurnsImage = Class.extend({
    init: function ($img) {
        this.$img = $img
        this.width = $img.width()
//        this.height = $()
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
        
        this.initialize_UI();
        this.$burns_layer = $('#burns-layer')
        $CARD.append(this.$burns_layer)
        if (img_name)
            this.initialize_image(this.img_name);

    },

    initialize_image: function (img_name) {
         // IMAGE SHOULD BE ON IT'S OWN DIV (BURNS)
         this.img_name = img_name || this.img_name;
         $('input#img-name')
             .val(this.img_name)
         var self = this;

//         this.$img_layer = $t('div').addClass('.burns-layer')

         this.$img = $t('img')
             .attr('src', this.getPath())
             .load (function (event) {
//                 log ("initial load complete")
                 self.$burns_layer
                    .html(self.$img);

                 self.setState('init');
             })
             .draggable()
             .click (function (event) {
                 self.showState (this)
             })
    },

    cache_configs:function () {
        var key = 'klm_configs';
        localStorage.setItem(key, JSON.stringify(this.data));

    },

    initialize_UI: function () {
        var self = this;
        
        $('button').button()
        $('input#zoom-factor').val(this.zoom_factor);
        $('input#img-name')
            .val(this.img_name)
            .change (function (event) {

                img_name = $(this).val();
                self.initialize_image(img_name);
            })
            
        $('#zoom-in').click (function (event) {
            log ("ZOOM IN");
            self.$img.css({
                width : self.$img.width() * self.zoom_factor,
                height : self.$img.height() * self.zoom_factor,
            })
        })
    
        $('#zoom-out').click (function (event) {
            log ("ZOOM IN");
            self.$img.css({
                width : self.$img.width() / $('#zoom-factor').val(),
                height : self.$img.height() / $('#zoom-factor').val()
            })
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
    },
    
    get_config_data: function () {
        var data = BURNS_DATA[this.img_name];
        if (!data) {
            log ("NOTICE: data not found for " + this.img_name);
            var initial_data = {
                pos: {
                    top: 0,
                    left: 0
                },
                dims: {
                    height: this.$img.height(),
                    width: this.$img.width()
                }
            }
            var data = {
                           'init': initial_data,
                           'final': initial_data
                       }
            BURNS_DATA[this.img_name] = data;
        }
        return data;
    },


    showState: function () {
        log (this.img_name);
        log (stringify ({
//            name: this.$img.attr('src'),
            pos: this.$img.position(),
            dims: { height: this.$img.height(), width: this.$img.width() }
        }))
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
       this.$img.css(data.pos);
       this.$img.css(data.dims);
//       log ("... setState done")
       // $('#burns-data').html(stringify(BURNS_DATA))
    },

    animate: function (name) {
        this.setState('init');
        var name = $('#img-name').val()
        var final_state = this.get_config_data().final
        // this.$img.css({opacity:0})
        // rotateAnimation(this.$img, 5)
        this.$img.animate ({
            left: final_state.pos.left,
            top: final_state.pos.top,
            width: final_state.dims.width,
            height: final_state.dims.height,
            opacity: 1.0
        }, this.animation_duration, function () {
            $CARD.trigger('klm:burns-animation-done')
        })
    },

    saveState: function(state) {
        log ("saveState = " + state)

        if (state == 'init' || state == 'final') {

            BURNS_DATA[this.img_name][state] = {
                pos: this.$img.position(),
                dims: {
                    height: this.$img.height(),
                    width: this.$img.width()
                }
            }

            log ("position: " + stringify(this.$img.position()))

            //log ('Updated');
//            log (stringify(this.get_config_data()))
        }
        log ('Updated ' + state + ' config for ' + this.img_name);
        log (stringify(BURNS_DATA[this.img_name][state]))
        $('#burns-data').html(stringify(BURNS_DATA))
    },

    dump_config: function () {
        console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
        log (stringify (BURNS_DATA));
    }

})

function populateCatalog() {
    var $dom = $('#catalog')
    var $items = $t('ul')
        .attr ('id', 'catalog-items')
        .appendTo($dom)

    var names = Object.keys(BURNS_DATA);
    console.log (names)
    $(names).each (function (i, name) {
        log ('- ' + BURNS.getPath(name))
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
                }))

    })

}


