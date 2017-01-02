var DATE_FORMAT = "YYYY-MM-DD";

var LIB_CONFIGS = {
    'jlo' : 'jloAlbumData',
    'video' : 'videoStorageData',
    'purg': 'purgAlbumData',
    'media': 'mediaAlbumData'
}

function lib_data_path (lib) {
    return 'data/' + LIB_CONFIGS[lib]
}

var Controller = Class.extend ({
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
                        log ("VAL: " + val)
                    }
                })
                .hide()
        }

        for (var i=1997;i<2017;i++) {
            $('select#year-select')
                .append($t('option')
                    .html(parseInt(i))
                )
                .selectmenu({
                    width:'100px',
                    change: function (event) {
                        var val = $(this).val();
                        log ("VAL: " + val)
                        self.render_timeline (val)
                    }
                })
        }

        for (var key in LIB_CONFIGS) {
            $('select#library-select')
                .append($t('option')
//                    .val(LIB_CONFIGS[key])
                    .html(key)
                )
                .selectmenu({
                    width:'100px',
                    change: function (event) {
                        var val = $(this).val();
                        log ("VAL: " + val)
                        self.set_lib (val)
                    }
                })

        }
    },

    set_lib: function (lib) {
        this.lib = lib;
    },

    render_timeline: function (year) {
        if (!this.lib)
            throw ("render_timeline requires that lib is intialized")
        var url = lib_data_path(this.lib) + '/' + year + '-01-01.json';
        getTimelineData(url, function (resp) {
            var timeline = new Timeline(resp, {year:year})
            timeline.render();
        })

    }
})

/* for now, hard-coding it to a year */
var Timeline = Class.extend ({
    init: function (data, args) {
        this.year = args.year
        this.height = args.height || 500;
        this.width = args.width || 800;
        this.data = data

        this.start = args.start
        if (!this.start && this.year) {
            this.start = moment(this.year + "-01-01")
        }
        this.end = args.end
        if (!this.end && this.year) {
            this.end = moment(this.year + "-12-31")
        }

        // these should be optional args (like year)

    },

    getDateExtents: function  () {
        var dates = Object.keys(this.data)
        dates.sort()
        var start_str = dates[0]
        var end_str = dates.slice(-1)[0]

        var start = moment(start_str, DATE_FORMAT)
        var end = moment(end_str, DATE_FORMAT)
        var days = Math.abs(end - start) / 60 / 60 / 24 /1000


        var max_height = 0
        for (var day in this.data) {
            max_height = Math.max(max_height, this.data[day].length)
        }

        return {
            start: start,
            end: end,
            days: days,
            max_height: max_height
        }
    },
    render: function () {
        $('#timeline').html('')

        var extents = this.getDateExtents();

        log ("EXTENTS: " + stringify(extents))

        var y_factor = this.height/extents.max_height;

        var start_date = this.start || extents.start
        var end_date = this.end || extents.end

        var days = Math.abs(end_date - start_date) / (60 * 60 * 24)
        // add day for inclusive
        var day_px = Math.floor(this.width/(days+1));

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

            $('#timeline').append($t('div')
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
            .html(fmt(this.start))
            .addClass('axis-label')
            .css({left:0, bottom:0})
            .appendTo($('#timeline'))

        $t('div')
//            .html(fmt(extents.end))
            .html(fmt(this.end))
            .addClass('axis-label')
            .css({right:0, bottom:0})
            .appendTo($('#timeline'))

        $t('div')
            .html(extents.max_height)
            .addClass('axis-label')
            .css({left:0,top:0})
            .appendTo($('#timeline'))

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

