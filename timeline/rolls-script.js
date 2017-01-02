var DATE_FORMAT = "YYYY-MM-DD";
var MAX_YEAR = 2016
var MIN_YEAR = 1997
var ROLL_ATTRS = ['name', 'id', 'start', 'end', 'size', 'comment']

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
        var self=this;
        for (var i=1;i<13;i++) {
            $('select#month-select')
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
                        ROLL_COMPARE.populate()
                    }
                })
                .hide()
        }
        $('button#prev-month')
            .button()
            .click (function (event) {
                log ("PREV_month")
                var month;
                try {
                    month = parseInt($('select#month-select').val())
                } catch (error) {}
                if (month > 1) {
                    --month;
                    log ("month now: " + month)
                    $('select#month-select').val(month).selectmenu('refresh')
                    ROLL_COMPARE.populate()
                }
            })

        $('button#next-month')
            .button()
            .click (function (event) {
                log ("NEXT_YEAR")
                var month;
                try {
                    month = parseInt($('select#month-select').val())
                } catch (error) {}
                if (month < 12) {
                    month++;
                    log ("month now: " + month)
                    $('select#month-select').val(month).selectmenu('refresh')
                    ROLL_COMPARE.populate()
                }
            })

        for (var i=1997;i<=MAX_YEAR;i++) {
            $('select#year-select')
                .append($t('option')
                    .html(parseInt(i))
                )
                .selectmenu({
                    width:'120px',
                    change: function (event) {
                        var val = $(this).val();
                        if (!val) {
                            return alert("please select a year")
                        }
                        log ("VAL: " + val)
                        ROLL_COMPARE.populate()
                    }
                })
        }

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
                    ROLL_COMPARE.populate()
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
                    ROLL_COMPARE.populate()
                }
            })

/*        for (var key in LIB_CONFIGS) {
            log ("-" + key)

            $('select.lib-select').each(function (i, select) {
                $(select).append($t('option')
                    .html(key)
                )
            })
        }*/
    },

})

var RollCompare = Class.extend ({
    init: function (lib1, lib2) {
        this.$dom = $('#rolls-table')
        this.lib1 = lib1
        this.lib2 = lib2
        this.columns = ['date', 'name', 'size', lib1, lib2]

        $([this.lib1, this.lib2]).each (function (i, lib) {
            var url = lib_data_path(lib) + '/roll-data.json';
            getJsonData(url, function (resp) {
                new RollData(resp, lib)
            })
        })

        var self = this;
        this.lib_data = []
        $(document).on('klm:roll-data-loaded', function (event, rolldata) {
            self.lib_data.push(rolldata)
            log (" - loaded rolldata (" + self.lib_data.length + ")")
            if (self.lib_data.length == 2) {
                log ("populating ..")
                // self.populate()
            }
        })
    },

    compile_data: function () {
        var comp_recs = []
        var stats = {}
        var year = parseInt($('select#year-select').val())
        var month = parseInt($('select#month-select').val());

        if (!(year && month)) {
            alert ("please select both a month and a year")
        }

        $(this.lib_data).each (function (i, rollData) {
            stats[rollData.name] = 0
            var records = rollData.getData (function (rec) {
                return rec.start.indexOf(year+"-"+month) > -1;
            })
            log (i + " - " + records.length)

            // massage records if necessary, and add to comp_recs
            $(records).each (function (i, rec) {
//                stats[rollData.name] += 1
                stats[rollData.name] += parseInt(rec.size)
                rec.lib = rollData.name
                comp_recs.push(rec)
            });
        })
        log ("comp_recs has " + comp_recs.length + " records")

        // sort first by date, then by name
        comp_recs.sort (function (a,b) {
            if (a.start == b.start) {
                return a.name.localeCompare(b.name)
            }
           return a.start.localeCompare(b.start)
        })

        prev = null;
        $(comp_recs).each (function (i, rec) {
            if (prev) {
                if (prev.start == rec.start &&
                    prev.name == rec.name &&
                    prev.lib != rec.lib)
                {
                    prev.match = rec.id
                    rec.match = prev.id

                }
                else {
                    rec.match = ''
                }
            }
            prev = rec;
        })

        return {
            records: comp_recs,
            stats:stats
        }
    },

    populate: function () {
        var compiled_data = this.compile_data();
        var records = compiled_data.records
        log ("populate from " + records.length + " records")



        var $header = $t('tr').addClass('header')
        this.$dom.html($header)
        $(this.columns).each (function (i, col) {
            $header.append($t('th').html(col))
        })

        //log(stringify(records));
        for (var j=0;j<records.length;j++) {
            var record = records[j]
            var $row = $t('tr')
                .attr('id', record.id)
                .append($t('td').html(record.start))
//                .append($t('td').html(record.id))
                .append($t('td').html(record.name))
                .append($t('td').html(record.size).addClass('right'))
                .append($t('td').html(record.lib == this.lib1 ? 'X' : '-').addClass('center'))
                .append($t('td').html(record.lib == this.lib2 ? 'X' : '-').addClass('center'))
                .appendTo(this.$dom)

            if (record.match)
                $row.css ({color:'gray'})
        }
        var footer = $t('tr')
            .append($t('td'))
            .append($t('td'))
            .append($t('td'))

            .append($t('td').html(compiled_data.stats[this.lib1]))
            .append($t('td').html(compiled_data.stats[this.lib2]))

            .appendTo(this.$dom)
    },

})

var RollData = Class.extend({
    init: function (data, name) {
        this.name = name;
        this.data = data;
        $(this.data).each(function (i, record) {
            record.start = moment(record.start).format("YYYY-MM-DD")
            record.end = moment(record.end).format("YYYY-MM-DD")

        })
        // log (stringify(this.data).slice (0, 1000))
        $(document).trigger('klm:roll-data-loaded', this)
    },

    getData: function (filterFn) {
        if (!filterFn)
            return this.data
        else
            return this.data.filter(filterFn)
    }


})

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

