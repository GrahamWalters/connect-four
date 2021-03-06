var P1coin = 1;
var P2coin = 2;
var P1avatar = 1;
var P2avatar = 2;
var P1wins = 0;
var P2wins = 0;
var turn = 'P1';
var numbers = {};
var numberMax = 10;
var autoRotate = false;
var music = true;
var count = 20;
var counter;
var sameIcon = false;
var moves = 0;

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
 */
function toggleMusic() {
  if (music) {
    document.getElementById('background-sound').pause();
    $(document).find('.music-toggle').html('<span class="icon-music icon-white"></span> Play Music');
    music = false;
  } else {
    document.getElementById('background-sound').play();
    $(document).find('.music-toggle').html('<span class="icon-music"></span> Stop Music');
    music = true;
  }
  $(document).find('.music-toggle').toggleClass('btn-inverse');
  $(document).find('.music-toggle').find('span').toggleClass('icon-white');
}

/* 
 * Toggle the auto rotate feature
 */
function toggleAutoRotate() {
  if (autoRotate) {
    $('#p2-start').removeClass('rotate');
    $('#play-screen').removeClass('rotate');
    $('#sidebar').removeClass('rotate');
    autoRotate = false;
  } else {
    $('#p2-start').addClass('rotate');
    autoRotate = true;
  }
  $(document).find('.rotate-toggle').toggleClass('btn-inverse');
  $(document).find('.rotate-toggle').find('span').toggleClass('icon-white');
}

/* 
 * Changes the images in the selectors, on the start screen.
 * @param name - the object to be changed
 * @param step - 1 or -1 for right or left.
 */
function changeImage(name, step) {
  if (name.substr(2) == 'coin') {
    window[name] = ((window[name]+step)%10<1 ? 10 : (window[name]+step)%10);
    $('#'+name).attr('src','/img/coins/coin'+window[name]+'.png');
  } else {
    window[name] = ((window[name]+step)%12<1 ? 12 : (window[name]+step)%12);
    $('#'+name).attr('src','/img/avatars/avatar'+window[name]+'.png');
  }
  if (P1coin == P2coin || P1avatar == P2avatar) {
    $('.start-btn').addClass('disabled');
    $('#same-icon-error').css('display', 'block');
    sameIcon = true;
  } else {
    $('.start-btn').removeClass('disabled');
    $('#same-icon-error').css('display', 'none');
    sameIcon = false;
  }
}

/* 
 * Move timer
 */
function timer() {
    count--;
    $('#timer').html('Move before: <strong>' + (count%60) + '</strong> seconds');
    if (count <= 0) {
        clearInterval(counter);
        if (turn == 'P1')
          turn = 'P2';
        else 
          turn = 'P1';
        finishGame();
        return false;
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
    numbers = {};
    line = 0;
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
    numbers = {};
    line = 0;
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
    numbers = {};
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
    numbers = {};
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
    numbers = {};
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
    numbers = {};
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
    $('#r'+low+'c'+c).find('.coin').html('<img class="grid-box-coin" src="/img/coins/coin'+window[turn+'coin']+'.png" />');
    $('#r'+low+'c'+c).find('.grid-box-number').css('display', 'block');
    state[c][low][0] = turn;

    moves ++;

    /* IF 4 IN A LINE */
    if (line()) {
      if (turn == 'P1') {
        $('#questionAvatar').attr('src', '/img/avatars/avatar'+P1avatar+'.png');
        $('#questionPlayer').html('Player 1');
      } else {
        $('#questionAvatar').attr('src', '/img/avatars/avatar'+P2avatar+'.png');
        $('#questionPlayer').html('Player 2');
      }
      $('#questionNumbers').text(numbers[0]+' + '+numbers[1]+' + '+numbers[2]+' + '+numbers[3]+' =');


      clearInterval(counter);
      $('#question').modal({
        keyboard: false,
        backdrop: 'static'
      });
      $('#question').modal('show');
      window.setTimeout(function(){
        $('#questionAnswer').focus();
      }, 1500);
    } else {
      if (turn == 'P1') {
        if (music == true)
          document.getElementById('game-sound1').play();
        turn = 'P2';
        $('#currentAvatar').attr('src', '/img/avatars/avatar'+P2avatar+'.png');
        $('#currentMove').html('Player 2\'s Move');
      } else {
        if (music == true)
          document.getElementById('game-sound2').play();
        turn = 'P1';
        $('#currentAvatar').attr('src', '/img/avatars/avatar'+P1avatar+'.png');
        $('#currentMove').html('Player 1\'s Move');
      }

      if (autoRotate) {
        $('#play-screen').toggleClass('rotate');
        $('#sidebar').toggleClass('rotate');
      }
      count = 20;
    }
  }
  if (moves == 7*6) {
      $('#errorModalLabel').text('Game Over!');
      $('#error-body').html('<p>Nether player wins...</p>');
      $('#error-footer').html('<a href="#" class="btn btn-primary" aria-hidden="true" onclick="newGame(); $(\'#error-modal\').modal(\'hide\');">New Game</a>'+
        '<button id="popover-menu3" class="btn btn-primary" aria-hidden="false" type="button" rel="popover" title="Warning!" onclick="fixErrorPop();" data-content="1.2.3." data-html="true">Main Menu</button>'
      );
      $('#error-modal').modal({
        keyboard: false,
        backdrop: 'static'
      });
      $('#error-modal').modal('show');
      $('#popover-menu3').popover();
  } 
}

/* 
 * New Game
 */
function newGame() {
  if (sameIcon == true)
    return false;

  if (turn == 'P1') {
    $('#currentAvatar').attr('src', '/img/avatars/avatar'+P1avatar+'.png');
    $('#currentMove').html('Player 1\'s Move');
  } else {
    $('#currentAvatar').attr('src', '/img/avatars/avatar'+P2avatar+'.png');
    $('#currentMove').html('Player 2\'s Move');
  }

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

  moves = 0;
  
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
  count = 20;
  clearInterval(counter);
  counter = setInterval(timer, 1000);
}

/* 
 * Check if the 
 */
function checkAnswer() {
  if ($('#questionAnswer').val() == numbers[0]+numbers[1]+numbers[2]+numbers[3]) {
    $('#question').modal('hide');
    window.setTimeout(finishGame, 1500);
  } else {
    if (turn == 'P1') {
      $('#questionAvatar').attr('src', '/img/avatars/avatar'+P2avatar+'.png');
      $('#questionPlayer').html('Player 2');
      turn = 'P2';
    } else {
      $('#questionAvatar').attr('src', '/img/avatars/avatar'+P1avatar+'.png');
      $('#questionPlayer').html('Player 1');
      turn = 'P1';
    }
    $('#questionAnswer').val('');
    $('#questionAnswer').focus();
  }
}

/* 
 * Check if the 
 */
function giveAnswer() {
  $('#question').modal('hide');
  $('#errorModalLabel').text('Game Over!');
  $('#error-body').html('<div class="input-prepend">'+
      '<span class="add-on">'+numbers[0]+' + '+numbers[1]+' + '+numbers[2]+' + '+numbers[3]+' ='+'</span>'+
      '<input class="span1" disabled value="'+(numbers[0]+numbers[1]+numbers[2]+numbers[3])+'" type="text">'+
    '</div>'+
    '<p>Nether player wins...</p>'
    );
  $('#error-footer').html('<a href="#" class="btn btn-primary" aria-hidden="true" onclick="newGame(); $(\'#error-modal\').modal(\'hide\');">New Game</a>'+
    '<button id="popover-menu3" class="btn btn-primary" aria-hidden="false" type="button" rel="popover" title="Warning!" onclick="fixErrorPop();" data-content="1.2.3." data-html="true">Main Menu</button>'
  );
  $('#error-modal').modal({
    keyboard: false,
    backdrop: 'static'
  });
  $('#error-modal').modal('show');
  $('#popover-menu3').popover();
}

/* 
 * Finish Game
 */
function finishGame() {
  $('#questionAnswer').val('');
  $('#start-screen').css('display','none');
  $('#play-screen').css('display','none');
  $('#sidebar').css('display','none');
  $('#end-screen').css('display','block');

  if(count == 0)
    $('#time-up').css('display', 'block');
  else
    $('#time-up').css('display', 'none');

  if (turn == 'P1') {
    P1wins ++;
    $('#time-up').find('.span8').html('<h2 style="margin-bottom:0;">Player 2 ran out of time!</h2>');
    $('#winner').text('Player 1 Wins!');
    $('#loser').text('Player 2 Loses!');
    $('#winner-img').attr('src', '/img/avatars/avatar'+P1avatar+'.png');
    $('#loser-img').attr('src', '/img/avatars/avatar'+P2avatar+'.png');
    $('#winner-stats').html('Player 1 has won <strong>'+P1wins+'</strong> '+(P1wins>1 || P1wins<1 ? 'times.' : 'time.'));
    $('#loser-stats').html('Player 2 has won <strong>'+P2wins+'</strong> '+(P2wins>1 || P2wins<1 ? 'times.' : 'time.'));
            
  } else {
    P2wins ++;
    $('#time-up').find('.span8').html('<h2 style="margin-bottom:0;">Player 2 ran out of time!</h2>');
    $('#winner').text('Player 2 Wins!');
    $('#loser').text('Player 1 Loses!');
    $('#winner-img').attr('src', '/img/avatars/avatar'+P2avatar+'.png');
    $('#loser-img').attr('src', '/img/avatars/avatar'+P1avatar+'.png');
    $('#winner-stats').html('Player 2 has won <strong>'+P2wins+'</strong> '+(P2wins>1 || P2wins<1 ? 'times.' : 'time.'));
    $('#loser-stats').html('Player 1 has won <strong>'+P1wins+'</strong> '+(P1wins>1 || P1wins<1 ? 'times.' : 'time.'));
  }
}

/* 
 * Display start screen
 */
function startScreen() {
  P1wins = 0;
  P2wins = 0;
  $('#start-screen').css('display','block');
  $('#play-screen').css('display','none');
  $('#sidebar').css('display','none');
  $('#end-screen').css('display','none');
}

/* 
 * Error popover hack!
 */
function fixErrorPop() {
  window.setTimeout(function() {
    $('#error-footer').find('.popover').find('.popover-inner').find('.popover-content').html('This will reset your game stats. <a href="#" class="btn btn-block btn-primary" onclick="$(\'#popover-menu3\').popover(\'hide\'); startScreen(); $(\'#error-modal\').modal(\'hide\');">Continue</a>')
  }, 100);
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
  $('#popover-menu1').popover();
  $('#popover-menu2').popover();
});
$(window).resize(function() {
  $('#play-screen').css('max-width', $(window).height());
});