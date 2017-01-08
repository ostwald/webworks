
var RollController = Controller.extend({
    init: function (lib1, lib2) {
        this.name = 'roll'
        this._super();

        var self = this;
        $('#timeline-link').click (function (event) {
            log ("timeline link click")
            try {

                var url = "index.html?year=" + self.getYear() + "&month=" + self.getMonth();
                log ("url: " + url)
                location = url;
            } catch (error) {
                log ("ERROR could not create url: " + error)
            }

            return false;
        })

        // Here is where to instantiate ROLL COMPARE
        this.rollCompare = new RollCompare(lib1, lib2)
        log ("DOM: " + this.controls.$dom.attr('id'))
        log ("RollController initiated")
    },

    handle_month_select: function (event) {
        this.doAction(event);
    },

    doAction: function (event) {
        if (event)
            log (" - event target:" + event.target.id)
        if (!this.getYear())
            log ("year is not defined")
        else if (!this.getMonth()) {
            log ("month is not defined")
            this.rollCompare.render_summary(this.getYear());
            }
        else {
            this.rollCompare.render();
        }

    }
})

var SimpleRoleCompare = Class.extend({
    init: function (lib1, lib2) {

        this.$dom = $('#rolls-table')
        this.lib1 = lib1
        this.lib2 = lib2

        this.columns = ['date', 'name', 'size', lib1, lib2]
        this.$month_select = $('select#month-select');
        this.$year_select = $('select#year-select');

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
                $(document).trigger ('klm:all-data-loaded')
            }
        })
    },

})

/**
   montitors loading of data, and when complete,
   "compiles" (i.e, merges) the data from different libs and
   messages (e.g., filter, sort) before returning
   {
      records: <merged record list>
      stats: <e.g. number of items from each lib>
   }
*/
var RollCompare = SimpleRoleCompare.extend ({
    init: function (lib1, lib2) {
        this._super(lib1, lib2)
        var self = this;
        $(document).on ('klm:all-data-loaded', function (event) {
            if (PARAMS.year) {
                $('select#year-select')
                    .val(PARAMS.year)
                    .selectmenu('refresh')

                if (PARAMS.month) {
                    $('select#month-select')
                        .val(PARAMS.month)
                        .selectmenu('refresh')

                    self.render()
                } else {
                    self.render_summary(PARAMS.year);
                }
            }

        })
    },

    render: function () {
        log ("-----------------\nrender")
        var compiled_data;
        try {
            compiled_data = this.compile_data();
        } catch (error) {
            log (error)
            return;
        }
        var records = compiled_data.records
        log ("render from " + records.length + " records")

        $('#year-summary-table').hide();
        $('#rolls-table').show();

        var $header = $t('tr').addClass('header')
        this.$dom.html($header)
        $(this.columns).each (function (i, col) {
            $header.append($t('th').html(col))
        })

        //log(stringify(records));
        for (var j=0;j<records.length;j++) {
            var record = records[j]
            var $row = $t('tr')
                .data('lib', record.lib)
                .addClass(record.match ? 'match' : '')
                .attr('id', record.id)
                .append($t('td').addClass('center').html(record.start))
//                .append($t('td').html(record.id))
                .append($t('td').html(record.name))
                .append($t('td').html(record.size).addClass('right'))
                .append($t('td').html(record.lib == this.lib1 ? 'X' : '-').addClass('center'))
                .append($t('td').html(record.lib == this.lib2 ? 'X' : '-').addClass('center'))
                .appendTo(this.$dom)

        }
        var footer = $t('tr').addClass('totals')
            .append($t('td'))
            .append($t('td'))
            .append($t('td'))

            .append($t('td').addClass('center').html(compiled_data.stats[this.lib1]))
            .append($t('td').addClass('center').html(compiled_data.stats[this.lib2]))

            .appendTo(this.$dom)

        var self = this;
        CONTROL.controls.$dom.append($t('div')
            .html("toggle matches")
            .css({
                position: 'absolute',
                bottom: 5,
                right: 5,
                fontSize:'.85em',
            })
//            .click (function (event) {
//                log ("WHAT??")
//                self.$dom.find('tr.match').each (function (i, li) {
//                    $(li).toggle();
//                })
//            })
            .click (function (event) {
                log ("WHAT??")
                self.$dom.find('tr.match').toggle();
            })  )

    },

    compile_data: function () {
        log ("compiling")
        var comp_recs = []
        var stats = {}
//        var year = parseInt($('select#year-select').val())
//        var month = parseInt($('select#month-select').val());

        var year = $('select#year-select').val();
        var month = $('select#month-select').val();

        if (!(year && month)) {
            throw ("please select both a month and a year")
        }

        log ('-- ' + year + '-' + month)

        $(this.lib_data).each (function (i, rollData) {
            stats[rollData.name] = 0
            var records = rollData.getData (function (rec) {
//                if (rollData.name == 'purg')
//                    log ('- ' + rec.id + " - " + rec.start)
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
                if (a.name == b.name) {
                    return parseInt(a.size) > parseInt(b.size)
                }
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

    /*
    create an object as follows
    summmary = {
        purg: {
            january : {
                role_count : 10,
                item_count : 1000
            },
        media: {
            ...
        }
    }

    */
    summarize_data: function (year) {
        log ("Summarizing (" + year + ") ...")
        var summary = {} // track roll-level monthly stats
        $(this.lib_data).each (function (i, rollData) {
            var lib = rollData.name
            summary[lib] = {}
            var records = rollData.getData (function (rec) {
//                if (rollData.name == 'purg')
//                    log ('- ' + rec.id + " - " + rec.start)
                return rec.start.indexOf(year) > -1;
            })
            log (i + " - " + records.length)

            // massage records if necessary, and add to comp_recs
            $(records).each (function (i, rec) {
 //                stats[rollData.name] += 1

                // what month are we
                var month = moment(rec.start).format("MMMM")
                try {
                    if (!summary[lib][month]) {
                        summary[lib][month] = {
                            roll_count: 0,
                            item_count: 0
                        }
                    }
                } catch (error) {
                    log (error)
                }
                var month_bin = summary[lib][month]
                month_bin.roll_count += 1
                month_bin.item_count += parseInt(rec.size)
             });
         })

         // calculate totals
         var totals = {}
         for (var lib in summary) {
            totals[lib] = {roll_count:0, item_count:0}
            for (var month in summary[lib]) {
               totals[lib].roll_count += summary[lib][month].roll_count
               totals[lib].item_count += summary[lib][month].item_count
            }
            summary[lib].totals = {
                item_count:totals[lib].item_count,
                roll_count:totals[lib].roll_count
            }
         }

//         log ("DONE")
//         log (stringify(summary))
         return summary;
    },

    render_summary: function (year) {
        log ('render_summary')
        var summary_data = this.summarize_data (year);

        $('#rolls-table').hide();
        var $dom = $('#year-summary-table').show();

        var mom = moment('2001-6-01')

        var $header = $t('tr').addClass('header')
        $dom.html($header)
        var summary_cols = ['', this.lib1 + '_rolls', this.lib2 + '_rolls', this.lib1 + '_items', this.lib2 + '_items']
        $(summary_cols).each (function (i, col) {
            $header.append($t('th').html(col))
        })

        //log(stringify(records));
        for (var i=1;i<13;i++) {
            var mom = moment('2011-' + i < 10 ? i.toString() : '0'+ i.toString())
            var month = mom.format("MMMM")
            var month_str = mom.format("MM")
            var lib1_data = summary_data[this.lib1][month]
            var lib2_data = summary_data[this.lib2][month]
            var self = this;
            var $row = $t('tr')
                .attr('id', month)
                .data('month', month_str)
                .append($t('td').html(month))
//                .append($t('td').html(record.id))
                .append($t('td').addClass('int').html(lib1_data && lib1_data.roll_count))
                .append($t('td').addClass('int').html(lib2_data && lib2_data.roll_count))
                .append($t('td').addClass('int').html(lib1_data && lib1_data.item_count))
                .append($t('td').addClass('int').html(lib2_data && lib2_data.item_count))
                .click (function (event) {
                    log (" - " + this.id + " was clicked")
                    log ("month_str: " + $(this).data('month'))
                    $('select#month-select').val($(this).data('month')).selectmenu('refresh')
                    self.render()
                })
                .appendTo($dom)

        }
        var footer = $t('tr').addClass('totals')
            .append($t('td'))
            .append($t('td').addClass('int').html(summary_data[this.lib1].totals.roll_count))
            .append($t('td').addClass('int').html(summary_data[this.lib2].totals.roll_count))
            .append($t('td').addClass('int').html(summary_data[this.lib1].totals.item_count))
            .append($t('td').addClass('int').html(summary_data[this.lib2].totals.item_count))
            .appendTo($dom)
    },

})

/*
    probably misnamed.
    this class cosumes data in roll_data file, which contains id, start and end times
    of each roll in a library.

    Therefore it represents the library, since it can access any item
    via the roll files (of which the id is stored with roll data)
*/

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
