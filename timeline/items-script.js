// accept only rolls that start before end AND end after start

var START_YEAR = 1997
var END_YEAR = 2017

var ItemController = Controller.extend ({
    init: function (lib1, lib2) {
        this.name = 'item'
        this._super(lib1, lib2)
        var self = this;

        this.itemCompare = new SimpleItemCompare(lib1, lib2);

    },

    handle_month_select: function (event, val) {
        log ("handle_month_select()")
        var month = this.getMonth();
        if (!month) {
            return alert("please select a month")
        }
        log ("month: " + month)

        this.doAction(event)

    },


    /* ensure that both month and year are selected, and then
        call render
    */
    doAction: function (event) {
        log ("ItemController.doAction()")
        var year = this.getYear();
        var month = this.getMonth();
        if (event)
            log (" - event target:" + event.target.id)
        if (!year)
            log ("- year is not defined")
        if (!month) {
            log ("- month is not defined")
            // this.rollCompare.render_summary(this.getYear());
            }
        if (month && year)
            this.itemCompare.render(year, month);
    }
})

var SimpleItemCompare = Class.extend ({
    init: function (lib1, lib2) {
        this.$dom = $('#items-table')
        this.lib1 = lib1;
        this.lib2 = lib2;


        if (PARAMS.year) {
            $('select#year-select')
                .val(PARAMS.year)
                .selectmenu('refresh')

            if (PARAMS.month)
                $('select#month-select')
                    .val(PARAMS.month)
                    .selectmenu('refresh')

            this.render(PARAMS.year, PARAMS.month)
        }

    },

    /*
        calculate start and end dates
        get data
        construct comp table
    */

    render: function (year, month) {
        log ("SimpleItemCompare RENDER!")

        // for now require year and month
        if (!(year && month)) {
            throw ("please select both a month and a year")
        }

        var start = moment([year, month])
        var end = moment(start).endOf('month')

        log ("START: " + fmt(start))
        log ("END: " + fmt(end))
        var self = this;

        getCompareData(start, end, function (comp_data) {
            log ("got compare Data")
            log ("lib1: " + self.lib1)
            self.compile_data(comp_data)

        })

    },

    /**
        we want to know what resources in lib1 are NOT represented in lib2.
        can we simply use the photo filenames?? (i doubt it)
    */
    compile_data (comp_data) {
        log ("compile_data")
        for (var lib in comp_data) {
            log (" - " + lib + ': ' + comp_data[lib].length)
        }
        var lib2_map = {}
        $(comp_data[this.lib2]).each (function (i, item) {
//            log (item.filename)
            if (lib2_map[item.filename]) {
                log (" - DUPs");
                log ('-- '+ stringify(item))
                log ('-- '+ stringify(lib2_map[item.filename]))
            }
            lib2_map[item.filename] = item
        })

//        log ("lib2_map keys (" + this.lib2 + ")")
//        $(Object.keys(lib2_map)).each (function (i, key) {
//            log (" - " + key)
//        })

        log ("lib1 filenames (" + this.lib1 + ")")
        $(comp_data[this.lib1]).each (function (i, item) {
//            log (" - " + item.filename)
//            log (stringify(item))
            if (lib2_map[item.filename])
                log ("match: " + item.filename)
        })

    }
})

function getPhotos (lib, start, end, callback) {
    log ('getPhotos - library: ' + lib)
    log ('- from ' + fmt(start) + ' to ' + fmt(end))

    var PHOTOS = []

    function rollDateRangeFilter (roll) {
        return !moment(roll.start).isAfter(end) && !moment(roll.end).isBefore(start)
    }

    function photoDateRangeFilter (photo) {
        return !moment(photo.start).isAfter(end) && !moment(photo.start).isBefore(start)
    }

    var rolls_to_get = END_YEAR - START_YEAR + 1;
    var rolls_processed = 0

    function file_tally (filename) {
        rolls_processed += 1;
//        log ("processed " + filename + " " + rolls_processed + "/" + rolls_to_get)
        if (rolls_processed == rolls_to_get) {
            if (callback)
                callback (PHOTOS)
        }
    }

    var loop_date = moment([START_YEAR])

    while (!loop_date.isAfter (moment([END_YEAR]))) {

        var mydate = moment(loop_date)

        // does this file contain photos within the range?
        if (!mydate.isAfter(end) && !moment(mydate).endOf('year').isBefore(start)) {
            url = lib_data_path(lib) + '/' + fmt(mydate) + '.json';
            getJsonData(url, function (photo_data) {
                // find the dates that fall within our range
                for (var date in photo_data) {
                    // log (" - " + date)
                    var pdate = moment(date)
                    if (!pdate.isBefore(start) && !pdate.isAfter(end)) {
//                        log (" ... reading")
                        $(photo_data[date]).each (function (i, photo) {
//                            log (" -- " + photo.filename + " (" + photo.date + ")")
                            PHOTOS.push (photo)
                        })
                    } else
                        log (" ... skipping")

                }
                file_tally(fmt(mydate))
            });
        }
        else
            file_tally(fmt(mydate))
        loop_date.add (1, 'year')
    }
}

function getCompareData (start, end, callback) {

    log ("getCompareData")
    var cmp_photos = {}

    function handle_photos (lib, photos) {
        log ("handle_photos: " + lib + ": " + photos.length)
        cmp_photos[lib] = photos;
        if (Object.keys(cmp_photos).length == 2)
            callback(cmp_photos)
    }

    getPhotos(LIB_1, start, end, function (photos) {
        handle_photos(LIB_1, photos)
    })

    getPhotos(LIB_2, start, end, function (photos) {
        handle_photos(LIB_2, photos)
    })

}

$(function() {

//    getCompareData (function (cmp_photos) {
//        for (var lib in cmp_photos) {
//            log (" - " + lib + ': ' + cmp_photos[lib].length)
//        }
//        CONTROL.render();
//    })

})