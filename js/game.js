var P1coin = 1;
var P2coin = 2;
var P1avatar = 1;
var P2avatar = 2;
var turn = 'P1';
var numbers = {};
var numberMax = 17;
var autoRotate = false;
var music = false;

/* 
 * state - the board state.
 * [column][row][0] = player
 * [column][row][0] = number
 */
var state = new Array(7);
for (var c=0; c<7; c++) {
  state[c] = new Array(6);
  for (var r=0; r<6; r++)
    state[c][r] = new Array(2);
}

/* 
 * Set numberMax
 * @param n - new numberMax
 */
function setNumberMax(n) {
  numberMax = n;
}

/* 
 * Toggle the difficulty buttons.
 * @param t - the object
 */
function toggle(t) {
  $('#difficulty').find('.btn').removeClass('active');
  $(t).addClass('active');
}

/* 
 * Toggle the music
 * @param t - the object
 */
function toggleMusic(t) {
  if (music) {
    music = false;
    $(t).html('<span class="icon-music icon-white"></span> Play Music');
  } else {
    music = true;
    $(t).html('<span class="icon-music"></span> Stop Music');
  }
  $(t).toggleClass('btn-inverse');
  $(t).find('span').toggleClass('icon-white');
}

/* 
 * Toggle the auto rotate feature
 * @param t - the object
 */
function toggleAutoRotate(t) {
  if (autoRotate) {
    autoRotate = false;
  } else {
    autoRotate = true;
  }
  $(t).toggleClass('btn-inverse');
  $(t).find('span').toggleClass('icon-white');
}

/* 
 * Changes the images in the selectors, on the start screen.
 * @param name - the object to be changed
 * @param step - 1 or -1 for right or left.
 */
 function changeImage(name, step) {
  if (name.substr(2) == 'coin') {
    window[name] = ((window[name]+step)%11<1 ? 11 : (window[name]+step)%11);
    $('#'+name).attr('src','/img/coins/coin'+window[name]+'.gif');
  } else {
    window[name] = ((window[name]+step)%6<1 ? 6 : (window[name]+step)%6);
    $('#'+name).attr('src','/img/avatars/avatar'+window[name]+'.png');
  }
 }


/* 
 * Checks for 4 coins in a row.
 * Sets numbers equal to the four numbers in a row.
 */
function line() {
  var line = 0;
  numbers = {};
  /* ROWS */
  for (var r=0; r<6; r++) {
    for (var c=0; c<7; c++) {
      if (state[c][r][0] == turn) {
        numbers[line] = state[c][r][1];
        line ++;
      } else {
        numbers = {};
        line = 0;
      }
      if (line == 4)
        return true;
    }
  }
  /* COLUMN */
  for (var c=0; c<7; c++) {
    for (var r=0; r<6; r++) {
      if (state[c][r][0] == turn) {
        numbers[line] = state[c][r][1];
        line ++;
      } else {
        numbers = {};
        line = 0;
      }
      if (line == 4)
        return true;
    }
  }
  /* DIAGONAL */
  /* Bottom left to top right */
  for (var r=0; r<=2; r++) {
    for (var d=0; d<(6-r); d++) {
      if (state[d][d+r][0] == turn) {
        numbers[line] = state[d][d+r][1];
        line ++;
      } else {
        numbers = {};
        line = 0;
      }
      if (line == 4)
        return true;
    }
    line = 0;
  }

  for (var c=1; c<=3; c++) {
    for (var d=0; d<(7-c); d++) {
      if (state[d+c][d][0] == turn) {
        numbers[line] = state[d+c][d][1];
        line ++;
      } else {
        numbers = {};
        line = 0;
      }
      if (line == 4)
        return true;
    }
    line = 0;
  }
  /* Top left to bottom right */
  for (var r=0; r<=2; r++) {
    for (var d=0; d<(6-r); d++) {
      if (state[d][5-r-d][0] == turn) {
        numbers[line] = state[d][5-r-d][1];
        line ++;
      } else {
        numbers = {};
        line = 0;
      }
      if (line == 4)
        return true;
    }
    line = 0;
  }

  for (var c=1; c<=3; c++) {
    for (var d=0; d<(7-c); d++) {
      if (state[d+c][5-d][0] == turn) {
        numbers[line] = state[d+c][5-d][1];
        line ++;
      } else {
        numbers = {};
        line = 0;
      }
      if (line == 4)
        return true;
    }
    line = 0;
  }
  return false;
}

/* 
 * Drop the coin function.
 * @param r - the row
 * @param c - the column
 */
function drop(r, c) {
  var low = 0;
  for (var i=0; i<state[c].length; i++)
    if (state[c][i][0] != null)
      low = i+1;

  if(low < 6) {
    $('#r'+low+'c'+c).find('.coin').html('<img class="grid-box-coin" src="/img/coins/coin'+window[turn+'coin']+'.gif" />');
    $('#r'+low+'c'+c).find('.grid-box-number').css('display', 'block');
    state[c][low][0] = turn;

    if (line()) {
      finishGame();
    } else {
      if (turn == 'P1')
        turn = 'P2';
      else
        turn = 'P1'

      if (autoRotate) {
        $('#play-screen').toggleClass('rotate');
        $('#sidebar').toggleClass('rotate');
      }
    }
  }
}

/* 
 * New Game
 */
function newGame() {
  $('#start-screen').css('display','none');
  $('#play-screen').css('display','block');
  $('#sidebar').css('display','block');
  $('#end-screen').css('display','none');

  state = new Array(7);
  for (var c=0; c<7; c++) {
    state[c] = new Array(6);
    for (var r=0; r<6; r++)
      state[c][r] = new Array(2);
  }
  
  $("#table-grid").html('');
  for (var r=0; r<6; r++) {
    $("#table-grid").prepend('<tr id="row-'+r+'" class="">');
    $row = $("#row-"+r);

    for (var c=0; c<7; c++) {
      var number = Math.floor((Math.random()*numberMax)+1);
      $row.append(
        '<td class="box" id="r'+r+'c'+c+'">'+
          '<div class="grid-box" onclick="drop('+r+','+c+');">'+
            '<div class="grid-box-hack">'+
              '<img class="grid-box-img" src="/img/grid.png" />'+
            '</div>'+
            '<div class="coin"></div>'+
            '<div class="grid-box-number">'+number+'</div>'+
          '</div>'+
        '</td>');
      state[c][r][1] = number;
    }
  }
}

/* 
 * Finish Game
 */
function finishGame() {
    $('#start-screen').css('display','none');
    $('#play-screen').css('display','none');
    $('#sidebar').css('display','none');
    $('#end-screen').css('display','block');

  if (turn == 'P1') {
    $('#winner').html('Player 1 Wins!');
    $('#loser').html('Player 2 Loses!');
    $('#winner-img').attr('src', '/img/avatars/avatar'+P1avatar+'.png');
    $('#loser-img').attr('src', '/img/avatars/avatar'+P2avatar+'.png');
  } else {
    $('#winner').html('Player 2 Wins!');
    $('#loser').html('Player 1 Loses!');
    $('#winner-img').attr('src', '/img/avatars/avatar'+P2avatar+'.png');
    $('#loser-img').attr('src', '/img/avatars/avatar'+P1avatar+'.png');
  }
}


/* 
 * Comment
 */
$(document).ready(function() {
  $('#play-screen').css('max-width', $(window).height());
  $('#start-screen').css('display','block');
  $('#play-screen').css('display','none');
  $('#sidebar').css('display','none');
  $('#end-screen').css('display','none');
});
$(window).resize(function() {
  $('#play-screen').css('max-width', $(window).height());
});