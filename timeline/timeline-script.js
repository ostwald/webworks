
var TimelineController = Controller.extend({

    init: function () {
        this._super()

        this.timelines = {
            'timeline-1': new Timeline(LIB_1, '#timeline-1'),
            'timeline-2': new Timeline(LIB_2, '#timeline-2'),
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

        if (PARAMS.year) {
            this.setYear(PARAMS.year);
            this.setMonth(PARAMS.month);
            this.doAction()
        }

        log ("TimelineController instiated")
    },

    doAction: function (event) {
        log ('TimelineController doAction - ');
        if (event)
            log (" - event target:" + event.target.id)

        for (var id in this.timelines) {
            this.timelines[id].render();
        }
    },

    handle_month_select: function (event, val) {
        log ("TIMELINE controller handle_month_select")
        this.doAction();
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

    getDateExtents: function  (windowOpen, windowClose) {
        var dates = Object.keys(this.data)
        dates.sort()
        var start_str = dates[0]
        var end_str = dates.slice(-1)[0]

        function accept(datestr) {
            var date = moment(datestr)
            return !date.isBefore(windowOpen) && !date.isAfter(windowClose)
        }

        var start = moment(start_str, DATE_FORMAT)
        var end = moment(end_str, DATE_FORMAT)
        var days = Math.abs(end - start) / 60 / 60 / 24 /1000

        var total = 0
        var max_height = 0
        for (var day in this.data) {
            if (accept(day)) {
                var num_items = this.data[day].length
                max_height = Math.max(max_height, num_items)
                total += num_items
            }
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

        var year = $('select#year-select').val().trim()
        var month = $('select#month-select').val().trim()

        log ("MONTH: " + month)

       // if (!isNaN(year) && !isNaN(month)) {

        var granularity = null; // year | month

        if (year && month) {
            granularity = 'month'
            log("MONth vIEW")
            this.start = moment(year + "-" + month + "-01")
        }
        else if (year) {
            granularity = 'year'
            this.start = moment(year + "-01-01")
            log ('year view')
        }

        if (granularity) {

            log ('granularity: ' + granularity)
            this.end = this.start.clone().endOf(granularity)
            var url = lib_data_path(this.lib) + '/' + year + '-01-01.json';
            var lib = this.lib;
            var self = this;
            getTimelineData(url, function (resp) {
                self.data = resp
                self.update_dom(granularity);
            })
        }

    },

    update_dom: function (granularity) {
        this.$dom.html('')

        var extents = this.getDateExtents(this.start, this.end);
        // log ("EXTENTS: " + stringify(extents))

        var y_factor = this.height/extents.max_height;

        var start_date = this.start || extents.start
        var end_date = this.end || extents.end

        var days = Math.abs(end_date - start_date) / (60 * 60 * 24 * 1000)
        var day_px = Math.floor(this.width/(days+1));

        log ("start_date: " + fmt(start_date));
        log ("end_date: " + fmt(end_date));
//        log ("days: " + days);
//        log ("day_px: " + day_px);

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

        // not ready for prime time
        if (false && granularity == 'year') {
            // make clickable regions for months

            for (var i=0;i<12;i++) {

                $t('div')
                    .addClass ('timeline-overlay')
                    .css ({
                        position:'absolute',
                        left:Math.floor((i/12) * this.width),
                        top:0,
                        width:Math.floor (this.width/12),
                        height:this.height,
                        border:'orange solid thin',
                        background:'transparent'
                    })
                    .appendTo(this.$dom)
            }
        }
    }

})

function getTimelineData (url, callback) {
    getJsonData(url, callback);
//    log ("making call ... " + url)
//    $.getJSON(url, function (resp) {
//            log ("resp is a " + typeof resp);
//            if (callback)
//                callback(resp)
//    })
}

