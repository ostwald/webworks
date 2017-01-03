var DATE_FORMAT = "YYYY-MM-DD";
var MAX_YEAR = 2016
var MIN_YEAR = 1997

var LIB_CONFIGS = {
    'jlo' : 'jloAlbumData',
    'video' : 'videoStorageData',
    'purg': 'purgAlbumData',
    'media_1': 'mediaAlbumData_1',
    'media_2': 'mediaAlbumData_2',
}

var LIB_1 = 'purg';
var LIB_2 = 'media_2'

var Controls = Class.extend({
    init: function () {
        this.$dom = $('#controls')

        this.$year_select = $t('select')
            .attr('id', 'year-select')
            .html($t('option')
                .html(' - year -')
                .val(''))

        this.$year_control = $t('div')
                .attr('id', 'year-control')
                .html($t('button')
                    .attr('type','button')
                    .attr('id', 'prev-year')
                    .html('-'))
                .append(this.$year_select)
                .append($t('button')
                    .attr('type','button')
                    .attr('id', 'next-year')
                    .html('+'))

        this.$month_select = $t('select')
            .attr('id', 'month-select')
            .html($t('option')
                .html(' - month -')
                .val(''))

        this.$month_control = $t('div')
                .attr('id', 'month-control')
                .html($t('button')
                    .attr('type','button')
                    .attr('id', 'prev-month')
                    .html('-'))
                .append(this.$month_select)
                .append($t('button')
                    .attr('type','button')
                    .attr('id', 'next-month')
                    .html('+'))

        this.$dom
            .html(this.$year_control)
            .append(this.$month_control)

    }
})

var Controller = Class.extend ({
    init: function () {
        log ("Controller")
        var self=this;
        this.controls = new Controls();
//        this.$month_select = $('select#month-select');
        this.$month_select = this.controls.$month_select;
        this.$year_select = this.controls.$year_select;

        for (var i=1;i<13;i++) {
            this.$month_select
                .append($t('option')
                    .html(month2str(i))
                )
        }
        this.$month_select
            .selectmenu({
                width:'100px',
                change: function (event) {
                    log ("month-select change!")
                    self.handle_month_select(event)

/*
                    var val = $(this).val();
                    if (!val) {
                        return alert("please select a month")
                    }
//                    log ("VAL: " + val)
//                    log ("other: " + parseInt($('select#month-select').val()))
                    self.doAction(event)*/
                }
            })

        $('button#prev-month')
            .button()
            .click (function (event) {
//                log ("PREV_month")
                var month;
                try {
                    month = parseInt(self.$month_select.val())
                } catch (error) {}
                if (month > 1) {
                    month = month - 1;
//                    log ("month now: " + month)
                    self.$month_select.val(month2str(month)).selectmenu('refresh')
                    self.doAction(event)
                }
                else {
                    self.$month_select.val('12').selectmenu('refresh')
                    log ('clicking?')
                    $('button#prev-year').trigger('click')
                }
            })

        $('button#next-month')
            .button()
            .click (function (event) {
                log ("NEXT_MONTH")
                var month;
                try {
                    month = parseInt(self.$month_select.val())
                    if (isNaN(month))
                        throw "Nan"
                } catch (error) {
                    month = 0;
                }
                log ('month: ' + month)

                if (month < 12) {
                    month++;
//                    log ("month now: " + month)
                    self.$month_select.val(month2str(month)).selectmenu('refresh')
                    self.doAction(event)
                } else if (month == 12) {
                    self.$month_select.val('01').selectmenu('refresh')
                    log ('clicking?')
                    $('button#next-year').trigger('click')
                }
            })

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
//                    log ("year select change")
                    var val = $(this).val();
                    if (!val) {
                        return alert("please select a year")
                    }
//                    log ("VAL: " + val)
                    self.doAction(event)
                }
            })


        $('button#prev-year')
            .button()
            .click (function (event) {
//                log ("PREV_YEAR")
                var year;
                try {
                    year = parseInt($('select#year-select').val())
                    if (isNaN(year))
                        throw ("year is Nan")
                } catch (error) {

                }
                if (year > MIN_YEAR) {
                    --year;
//                    log ("year now: " + year)
                    $('select#year-select').val(year).selectmenu('refresh')
                    self.doAction(event)
                }
            })

        $('button#next-year')
            .button()
            .click (function (event) {
                log ("NEXT_YEAR")
                var year;
                try {
                    year = parseInt($('select#year-select').val())
                    if (isNaN(year))
                        throw ("year is Nan")
                } catch (error) {
                    year = MIN_YEAR
                }
                if (year < MAX_YEAR) {
                    year++;
//                    log ("year now: " + year)
                    $('select#year-select').val(year).selectmenu('refresh')
                    self.doAction(event)
                }
            })

    },

    handle_month_select: function (event, val) {
        log ("handle_month_select()")
        var month = this.getMonth();
        if (!month) {
            return alert("please select a month")
        }
        log ("month: " + month)

        // self.doAction(event)

    },

    setYear: function (year) {
        this.$year_select.val(year).selectmenu('refresh')
    },

    getYear: function () {
        return this.$year_select.val();
    },

    setMonth: function(month) {
        this.$month_select.val(month).selectmenu('refresh')
    },

    getMonth: function () {
        return this.$month_select.val();
    },

    doAction: function (event) {
        log ("DO_ACTION overrides me")
    }
})

// UTILS ------------------
function lib_data_path (lib) {
    return 'data/' + LIB_CONFIGS[lib]
}

function month2str (month_num) {
    return month_num < 10 ? "0"+parseInt(month_num) : parseInt(month_num)
}

function fmt (mom) {
    return mom.format(DATE_FORMAT)
}

function getJsonData (url, callback) {
    log ("making call ... " + url)
    $.getJSON(url, function (resp) {
//            log ("resp is a " + typeof resp);
            if (callback)
                callback(resp)
    })
}
