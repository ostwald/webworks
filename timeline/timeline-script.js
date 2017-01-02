var DATE_FORMAT = "YYYY-MM-DD";
var MAX_YEAR = 2016
var MIN_YEAR = 1997

var LIB_CONFIGS = {
    'jlo' : 'jloAlbumData',
    'video' : 'videoStorageData',
    'purg': 'purgAlbumData',
    'media': 'mediaAlbumData'
}

function lib_data_path (lib) {
    return 'data/' + LIB_CONFIGS[lib]
}

var TimelineController = Controller.extend({

    init: function () {
        this._super()

        this.timelines = {
            'timeline-1': new Timeline('purg', '#timeline-1', 'select#library-1-select'),
            'timeline-2': new Timeline('media', '#timeline-2', 'select#library-2-select'),
        }

        var self = this;
        $('#rolls-link').click (function (event) {
            event.preventDefault();
            log ("rolls link click")
            var url = "rolls.html?year=" + self.getYear() + "&month=" + self.getMonth();
            log ("url: " + url)
            location = url;
            return false;
        })

        if  (PARAMS.year) {
            this.setYear(PARAMS.year);
            this.doAction()
        }

        log ("TimelineController instiated")
    },

    doAction: function (event) {
        log ('TimelineController doAction - ');
        if (event)
            log (" - event target:" + event.target.id)
        if (!event || event.target.id.indexOf('month') == -1) {

            for (var id in this.timelines) {
                this.timelines[id].render();
            }
        }

    }

});

/* for now, hard-coding it to a year */
var Timeline = Class.extend ({
    init: function (lib, dom, args) {
        args = args || {}
        log ("TIMELINE")
        this.$dom = $(dom)
//        this.$select = $(select)
        this.year = args.year
        this.height = this.$dom.height();
        this.width = this.$dom.width();
        this.data = null;
        this.lib = lib;
        $('#' + this.$dom.attr('id') + '-title')
            .html(this.lib)
            .css({
                width:this.width
            })

//        this.initialize_select()
    },

/*    set_lib: function (lib) {
        this.lib = lib;
        // this.$select.val(lib).selectmenu('refresh')
    },*/

/*    initialize_select_OFF: function (current) {
        log ('initialize_select')
        var self=this;
        for (var key in LIB_CONFIGS) {
            this.$select
                .selectmenu({
                    width:'100px',
                    change: function (event) {
                        var val = $(this).val();
                        if (!val) {
                            return alert("please select a library")
                        }
                        log ("VAL: " + val)
                        self.set_lib (val)
                        self.render()
                    }
                })
        }
    },*/

    getDateExtents: function  () {
        var dates = Object.keys(this.data)
        dates.sort()
        var start_str = dates[0]
        var end_str = dates.slice(-1)[0]

        var start = moment(start_str, DATE_FORMAT)
        var end = moment(end_str, DATE_FORMAT)
        var days = Math.abs(end - start) / 60 / 60 / 24 /1000

        var total = 0
        var max_height = 0
        for (var day in this.data) {
            var num_items = this.data[day].length
            max_height = Math.max(max_height, num_items)
            total += num_items
        }

        return {
            start: start,
            end: end,
            days: days,
            max_height: max_height,
            total:total
        }
    },

    render: function () {
        if (!this.lib)
            throw ("render_timeline requires that lib is intialized")
        var year;
        try {
            year = parseInt($('select#year-select').val())
        } catch (error) {}
        if (year) {
            this.start = moment(year + "-01-01")
            this.end = moment(year + "-12-31")
            var url = lib_data_path(this.lib) + '/' + year + '-01-01.json';
            var lib = this.lib;
            var self = this;
            getTimelineData(url, function (resp) {
                self.data = resp
                self.update_dom(year);
            })
        }
    },

    update_dom: function (year) {
        this.$dom.html('')

        var extents = this.getDateExtents();
        // log ("EXTENTS: " + stringify(extents))

        var y_factor = this.height/extents.max_height;

        var start_date = this.start || extents.start
        var end_date = this.end || extents.end

        var days = Math.abs(end_date - start_date) / (60 * 60 * 24 * 1000)
        var day_px = Math.floor(this.width/(days+0));

        log ("start_date: " + fmt(start_date));
        log ("end_date: " + fmt(end_date));
        log ("days: " + days);
        log ("day_px: " + day_px);

        // add day for inclusive

        var dt = start_date.clone()

        n = 0
        while (!dt.isAfter(end_date)) {
            var key = dt.format(DATE_FORMAT)
            // log ('-' + key)
            var height = 2;
            var count = 0;
            if (this.data[key]) {
                var count = this.data[key].length
                height = count * y_factor;
            }

            this.$dom.append($t('div')
                .addClass('vertical-box')
                .attr('title', key + ' - ' + count)
                .css({
                    width: day_px,
                    height: height,
                }))

            dt.add(1, 'days')
            n += 1
            if (n > 500)
                break;
        }

        $t('div')
//            .html(fmt(extents.start))
            .html(fmt(start_date))
            .addClass('axis-label')
            .css({left:0, bottom:0})
            .appendTo(this.$dom)

        $t('div')
//            .html(fmt(extents.end))
            .html(fmt(end_date))
            .addClass('axis-label')
            .css({right:0, bottom:0})
            .appendTo(this.$dom)

        $t('div')
            .html(extents.max_height)
            .addClass('axis-label')
            .css({left:0,top:0})
            .appendTo(this.$dom)

            $t('div')
                .html(parseInt(extents.total))
                .addClass('axis-label')
                .css({right:0,top:0})
                .appendTo(this.$dom)
    }

})



function fmt (mom) {
    return mom.format(DATE_FORMAT)
}


function getTimelineData (url, callback) {
    log ("making call ... " + url)
    $.getJSON(url, function (resp) {
            log ("resp is a " + typeof resp);
            if (callback)
                callback(resp)
    })
}

// ------------------------

var ControllerOff = Class.extend ({
    init: function () {
        this.lib = null;
        var self=this;
        for (var i=1;i<13;i++) {
            $('select#month-select-OFF')
                .append($t('option')
                    .html(i<10 ? "0"+parseInt(i) : parseInt(i))
                )
                .selectmenu({
                    width:'100px',
                    change: function (event) {
                        var val = $(this).val();
                        if (!val) {
                            return alert("please select a month")
                        }
                        log ("VAL: " + val)
                    }
                })
                .hide()
        }

        for (var i=1997;i<=MAX_YEAR;i++) {
            $('select#year-select')
                .append($t('option')
                    .html(parseInt(i))
                )
        }
        $('select#year-select')
            .selectmenu({
                width:'120px',
                change: function (event) {
                    var val = $(this).val();
                    if (!val) {
                        return alert("please select a year")
                    }
                    log ("VAL: " + val)
                    for (var id in self.timelines) {
                        self.timelines[id].render();
                    }
//                        self.render_timeline ()
                }
            })

        $('button#prev-year')
            .button()
            .click (function (event) {
                log ("PREV_YEAR")
                var year;
                try {
                    year = parseInt($('select#year-select').val())
                } catch (error) {}
                if (year > MIN_YEAR) {
                    --year;
                    log ("year now: " + year)
                    $('select#year-select').val(year).selectmenu('refresh')
                    for (var id in self.timelines) {
                        self.timelines[id].render();
                    }
                }
            })

        $('button#next-year')
            .button()
            .click (function (event) {
                log ("NEXT_YEAR")
                var year;
                try {
                    year = parseInt($('select#year-select').val())
                } catch (error) {}
                if (year < MAX_YEAR) {
                    year++;
                    log ("year now: " + year)
                    $('select#year-select').val(year).selectmenu('refresh')
                    for (var id in self.timelines) {
                        self.timelines[id].render();
                    }
                }
            })

        for (var key in LIB_CONFIGS) {
            log ("-" + key)

            $('select.lib-select').each(function (i, select) {
                $(select).append($t('option')
                    .html(key)
                )
            })
        }

        this.timelines = {
            'timeline-1': new Timeline('#timeline-1', 'select#library-1-select'),
            'timeline-2': new Timeline('#timeline-2', 'select#library-2-select'),
        }
    },

})