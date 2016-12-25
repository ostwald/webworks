/** BURNS LOCAL INITS **/

// ------- button handlers -------------

$('button').button()
$('input#zoom-factor').val(BURNS.zoom_factor);
$('input#img-name')
    .val(BURNS.img_name)
    .change (function (event) {

        img_name = $(this).val();
        BURNS.initialize_image(img_name);
    })


$('#do-init').click (function (event) {
    BURNS.setState('init');
})

$('#do-final').click (function (event) {
    BURNS.setState('final');
})

$('#do-burns').click (function (event) {
    BURNS.animate();
})

$('#burns-tabs').tabs({active:0});

$('button#set-init-state')
    .button()
    .css({float: 'left'})
    .click (function (event) {
        BURNS.saveState('init');
    })

$('button#set-final-state')
    .button()
    .css({float: 'right'})
    .click (function (event) {
        BURNS.saveState('final');
    })

$('button#do-dump')
    .button()
    .click(function () {
        BURNS.dump_config();
    })

$('#remove-image').click (function (event) {
    BURNS.remove_image();
})

$('#zoom-in').click (function (event) {
    log ("ZOOM IN");
    BURNS.get_current_image().zoom_in($('#zoom-factor').val())

})

$('#zoom-out').click (function (event) {
    log ("ZOOM OUT");
    BURNS.get_current_image().zoom_out($('#zoom-factor').val())

})


/*
$('#zoom-in').click (function (event) {
    log ("ZOOM IN");
    var $img = BURNS.get_current_image().$img

    $img.css({
        width : $img.width() * $('#zoom-factor').val(),
        height : $img.height() * $('#zoom-factor').val(),
    })
})

$('#zoom-out').click (function (event) {
    log ("ZOOM IN");
    var $img = BURNS.get_current_image().$img

    $img.css({
        width : $img.width() / $('#zoom-factor').val(),
        height : $img.height() / $('#zoom-factor').val()
    })
})
*/

CATALOG = new Catalog().populate();
//populateCatalog();
$CARD.on ("klm:current-image-change", function (event) {
    CATALOG.set_current();
});

