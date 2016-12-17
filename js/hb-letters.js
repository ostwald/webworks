var letters = [
    'h1', 'a1', 'p1', 'p2', 'y1',
    'b1', 'i1', 'r1', 't1', 'h2', 'd1', 'a2', 'y2', 'bang'
]

var positioned_letters =
   {
   "h1": {
     "top": 9,
     "left": 156
   },
   "a1": {
     "top": 27,
     "left": 276
   },
   "p1": {
     "top": 39,
     "left": 383
   },
   "p2": {
     "top": 56,
     "left": 476
   },
   "y1": {
     "top": 24,
     "left": 518
   },
   "b1": {
     "top": 239,
     "left": 26
   },
   "i1": {
     "top": 244,
     "left": 116
   },
   "r1": {
     "top": 264,
     "left": 180
   },
   "t1": {
     "top": 245,
     "left": 255
   },
   "h2": {
     "top": 242,
     "left": 348
   },
   "d1": {
     "top": 270,
     "left": 451
   },
   "a2": {
     "top": 267,
     "left": 519
   },
   "y2": {
     "top": 243,
     "left": 559
   },
   "bang": {
     "top": 247,
     "left": 665
   }
 }

function get_off_card_positions ($target) {
    var width = $target.width();
    var height = $target.height();
    var pos = $target.position()
    var top = pos.top;
    var left = pos.left;
//    var right = pos.left + $target.width();
//    var bottom = pos.top + $target.height();

    var margin = 200;

//    log ("TARGET POS: " + stringify(pos))
//    log ("top: " + top)
//    log ("height: " + $target.height())
//    log ("bottom: " + bottom)
//    log ("")
//
//    log ("left: " + left)
//    log ("width: " + $target.width())
//    log ("right: " + right)

    return [
        // along the top
        {top:-margin, left: -margin },
        {top:-margin, left: 0 * (width/4) },
        {top:-margin, left: 1 * (width/4) },
        {top:-margin, left: 2 * (width/4) },
        {top:-margin, left: 3 * (width/4) },
        {top:-margin, left: 4 * (width/4) },

        // along the bottom
        {top:height + margin, left: width + margin },
        {top:height + margin, left: 0 * (width/4) },
        {top:height + margin, left: 1 * (width/4) },
        {top:height + margin, left: 2 * (width/4) },
        {top:height + margin, left: 3 * (width/4) },
        {top:height + margin, left: 4 * (width/4) },

        // along the left
        {top:0 * (height/4), left: -margin },
        {top:1 * (height/4), left: -margin },
        {top:2 * (height/4), left: -margin },
        {top:3 * (height/4), left: -margin },
        {top:4 * (height/4), left: -margin },
        {top:height + margin, left: -margin },

        // along the right
        {top:0 * (height/4), left: width + margin },
        {top:1 * (height/4), left: width + margin },
        {top:2 * (height/4), left: width + margin },
        {top:3 * (height/4), left: width + margin },
        {top:4 * (height/4), left: width + margin },
        {top:-margin, left: width + margin },

    ]
}