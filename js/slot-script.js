

var emoji_size = 75;
var LAST_TOP = 0; // to stagger tops

var SlotMachine = Class.extend ({
    init:function (dom_root) {
        this.$wrapper = $(dom_root)
        var slot1 = new Slot($('#slot1'))
        var slot2 = new Slot($('#slot2'))
        var slot3 = new Slot($('#slot3'))
        this.slots = [slot1,slot2, slot3]
        this.initialize();

    },

    initialize: function () {
        log ("INITIALIZE")
        var emojis_used = []
        $(this.slots).each (function (i, slot) {
            var emoji = random_emoji_name(emojis_used);
            slot.move_img (slot.get_img(emoji), true)
            emojis_used.push(emoji)
        })
    },

    show: function (callback) {
        this.$wrapper.fadeIn (2000)
    },

    doEffect: function (effectFn) {
        effectFn(this.$wrapper);
    },

    activate: function () {
        this.$wrapper.find('button').show();
        this.$wrapper.fadeIn();
    },

    deactivate: function (callback) {
        var self = this
        this.$wrapper.fadeOut(function () {
            if (callback)
                callback()
        });
    },

    spin:function (stop_emoji, callback) {
       $(this.slots).each (function (i, slot) {
            slot.start_spin ();
            var duration = 3000 + getRandomIntInclusive(0, 1500)
            // log (duration)
            setTimeout (function () {
                slot.stop_spin(stop_emoji)
            }, duration);
        });

        var self = this;
        // when the slots are stopped, do next step
        var slots_stopped = 0;
        $('#slots').on ('klm:slot-stopped', function (event, slot) {
            slots_stopped++;
//            log('slots_stopped: ' + slots_stopped )
            if (slots_stopped == 3) {
/*                $('#slot-wrapper').fadeOut(3000, function (event) {
                    init_step(++SPIN_NUM)
                })*/
                self.$wrapper.trigger('klm:spin-complete', self)
                if (callback) {
                    callback (self); // send this instance back
                }
            }
        })
    },

    stop:function () {
        $(this.slots).each (function (i, slot) {
            slot.stop_spin ();
        })
    },


})


var Slot = Class.extend({
    init: function (dom_root) {

//        this.img_ext = '.png'
        this.img_ext = '.jpg'

        this.emoji_dir;  // dependent on img_ext

        if (this.img_ext == '.png')
            this.emoji_dir = 'emoji-png/';
        else if (this.img_ext == '.jpg')
            this.emoji_dir = 'emoji-jpg/';

        this.$dom = $(dom_root);
        this.width = this.$dom.width();
        this.height = this.$dom.height();
        this.emojis = {};
        this.start_top = LAST_TOP;
        LAST_TOP = LAST_TOP + getRandomIntInclusive(0, 150);
        this.pre_Load();
        this.INTERVAL_ID = null;

    },

    getPath: function (name) {
        return this.emoji_dir + this.getFilename(name);
    },

    getFilename: function (name) {
        return name + this.img_ext;
    },

    pre_Load: function () {
       // log ('PRELOAD')
        var self = this;
        $(EMOJI_NAMES).each (function (i, e) {
            self.emojis[e] = self.load_img (e)
        })
    },

    start_spin: function () {
		var i=0;
		if (this.INTERVAL_ID) {
		    log ("already spinning")
		    return;
		}
		this.$dom.find ("img").css({top:-100})
        var last_name;
        var self = this;
    	this.INTERVAL_ID = setInterval(function () {
            var name = random_emoji_name(last_name);
            last_name = name;
            var img = self.get_img(name);
            self.move_img($(img))
    	}, 150)
    },

    stop_spin: function(emoji, callback) {
//        log ('stop-spin: ' + emoji)
        emoji = emoji || 'gold-heart'
        clearInterval (this.INTERVAL_ID)
        this.INTERVAL_ID = null;
        this.move_img (this.get_img(emoji), true)
        this.$dom.trigger('klm:slot-stopped', this)
    },

    get_img: function (name) {
        try {
            return this.emojis[name]
        } catch (error) {
            log ("get_img ERROR: " + error)
        }
    },

    load_img: function (name) {
        return emoji = $t('img')
            .addClass ('emoji')
            .css({
                height:emoji_size,
                width:emoji_size,
                borderRadius:emoji_size/2,
                left:this.width/2 - emoji_size/2 - 2, // 2 is fudge factor
                top:'-100px'
            })
            .css('display', 'none')
            .attr('src', this.getPath(name))
            .appendTo(this.$dom)
//            .load( function(event) { log ('- ' + name + ' loaded')})
            .show()
    },

    move_img: function ($img, final) {
//        log ($img.attr('src'))
        var img_top = final ? (this.height/2 - emoji_size/2) : (this.height + 10);
        $img.css({top:-100 - this.start_top})
        $img.animate({
            top: img_top
        }, 500)
    }

})
