var DATE_FORMAT = "YYYY-MM-DD";

function getDateExtents () {
    var dates = Object.keys(TIMELINE_DATA)
    dates.sort()
    var start_str = dates[0]
    var end_str = dates.slice(-1)[0]

    var start = moment(start_str, DATE_FORMAT)
    var end = moment(end_str, DATE_FORMAT)
    var days = Math.abs(end - start) / 60 / 60 / 24 /1000


    var max_height = 0
    for (var day in TIMELINE_DATA) {
        max_height = Math.max(max_height, TIMELINE_DATA[day].length)
    }

    return {
        start: start,
        end: end,
        days: days,
        max_height: max_height
    }
}

function fmt (mom) {
    return mom.format(DATE_FORMAT)
}

function render () {

    var extents = getDateExtents();

    log ("EXTENTS: " + stringify(extents))

    // we have 800px so each day gets 800/days pixels
    // add day for inclusive and take away 2 px for border.still only approx
    var day_px = Math.floor(800/(extents.days+1))-2;
    var y_factor = 500/extents.max_height;
    var dt = extents.start.clone()


    n = 0
    while (!dt.isAfter(extents.end)) {
        var key = dt.format(DATE_FORMAT)
        log ('-' + key)
        var height = 2;
        var count = 0;
        if (TIMELINE_DATA[key]) {
            var count = TIMELINE_DATA[key].length
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
        .html(fmt(extents.start))
        .addClass('axis-label')
        .css({left:0, bottom:0})
        .appendTo($('#timeline'))

    $t('div')
        .html(fmt(extents.end))
        .addClass('axis-label')
        .css({right:0, bottom:0})
        .appendTo($('#timeline'))

    $t('div')
        .html(extents.max_height)
        .addClass('axis-label')
        .css({left:0,top:0})
        .appendTo($('#timeline'))

}