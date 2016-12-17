var EMOJI_NAMES = [
    'ant',
    'bee',
    'beerx2',
    'biker',
    'bliss',
    'cake',
    'check',
    'chick',
    'dancer',
    'devil',
    'gift',
    'heart-eyes',
    'heart',
    'gold-heart',
    'house-tree',
    'kiss',
    'lips',
    'notes',
    'party-mega',
    'piano',
    'piece-o-cake',
    'pink-hearts',
    'pink-rose',
    'red-rose',
    'rooster',
    'shack',
    'skis',
    'snow-flake',
    'sun',
    'thanks',
    'treble',
    'wine',
    'wink',
    'x-eyes',
]

var emoji_weights = {
//
//	"pink-rose" : 5,
//	"red-rose": 5,
//	"thanks" : 3,

}

/**
get list of emoji names - can be weighted
*/
function get_emojis () {
    var emojis = []
    $(EMOJI_NAMES).each (function (i, e) {
        var weight = emoji_weights[e] || 1
        for (var i=0;i<weight;i++)
            emojis.push(e);

    })
    return emojis;
}

function random_emoji_name(exclude) {
    exclude = exclude || []
    if ($.type(exclude) == 'string')
        exclude = [exclude]
    var name = EMOJI_NAMES[getRandomIntInclusive(0, EMOJI_NAMES.length-1)]
    if (exclude.indexOf(name) != -1) {
//        log ("collision (" + name + ")")
        return random_emoji_name(exclude)
    }
    else
        return name;
}