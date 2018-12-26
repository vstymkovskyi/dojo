define([
  'dojo/dom',
], function (dom) {
  return Board;
});

class Board {
  constructor(gameStyle) {
    this.gameStyle = gameStyle;

    this.handleButtonClicks();
    this.handleBoardClick();
    this.playGame();
  }

  handleButtonClicks() {
    const self = this;
    console.log('qweqwe');
    $("#resetButton").on('click', function () {
      self.resetBoard(true);
    });
  }

  handleBoardClick() {
    const self = this;
    $(".item").on('click', function() {
      var thingClicked = this.innerHTML;
      console.log("0. this is: ", this);
      console.log("0. you clicked: ", thingClicked);
      var playerOne = self.getPlayerOne();
      var style = self.gameStyle.getGameStyle();
      console.log('FIX THIS: ***** clickButton gameStyle: ', style);

      if ((playerOne === "X") && (style === "classic")) {
        $(this).addClass("blue");
        $(this).html("X")
      }
      if ((playerOne === "X") && (style === "goth")) {
        $(this).addClass("blue");
        $(this).html("☠️")
      }
      if ((playerOne === "X") && (style === "weapons")) {
        $(this).addClass("blue");
        $(this).html("⚔️")
      }

      if ((playerOne === "O") && (style === "classic")) {
        $(this).addClass("blue");
        $(this).html("O")
      }
      if ((playerOne === "O") && (style === "goth")) {
        $(this).addClass("blue");
        $(this).html("💀")
      }
      if ((playerOne === "O") && (style === "weapons")) {
        $(this).addClass("blue");
        $(this).html("💣")
      }

      self.playGame() //call playGame after every click, to check for winner & whose turn
    })
  }

  playGame() {
    console.log('play game!');
    var winner = this.checkForWinner();
    if (!winner) {
      console.log('no winner yet...');
      this.checkWhoseTurn();
    }
    if (winner) {
      console.log('game over, resetting game');
      setTimeout(this.resetBoard, 3000) //call reset after 3 seconds...
    }
  }

  checkWhoseTurn() { //for this game, playerOne goes first
    var currentTurn;
    var redCount = this.countPoints('red');
    var blueCount = this.countPoints('blue');

    var playerOneTurn = !blueCount || redCount > blueCount || blueCount && redCount === blueCount;
    var computerTurn = redCount < blueCount;
    if (playerOneTurn) {
      console.log("checkWhoseTurn: it is playerOne's turn");
      var notBlueOrRed = document.querySelectorAll("div.item:not(.blue):not(.red)");
      $(notBlueOrRed).removeClass('unclickable');
      $("#compTurn").removeClass('yellow orangeBorder');
      $("#yourTurn").addClass('yellow orangeBorder');
      currentTurn = "playerOneTurn";

      return currentTurn;
    }
    if (computerTurn) {
      console.log("checkWhoseTurn: it is computer's turn");
      var allItems = document.querySelectorAll("div.item");
      $(allItems).addClass('unclickable'); //need to remove this on playerOne's turn
      $("#yourTurn").removeClass('yellow orangeBorder');
      $("#compTurn").addClass('yellow orangeBorder');
      setTimeout(this.computerTakeTurn.bind(this), 1000); //call after 1 second...
      currentTurn = "computerTurn";

      return currentTurn;
    }
  }

  computerTakeTurn() {
    console.log(this);
    var computer = this.getComputer();
    console.log('computerTakeTurn: computer is: ', computer);
    var notBlueOrRed = document.querySelectorAll("div.item:not(.blue):not(.red)");
    console.log('computerTakeTurn: notBlueOrRed: ', notBlueOrRed);
    //choose one at random
    var randomItem = notBlueOrRed[Math.floor(Math.random() * notBlueOrRed.length)];
    console.log('computerTakeTurn: randomItem is: ', randomItem);
    //addClass red to that random item and show computer chose it
    $(randomItem).addClass("red unclickable");
    $(randomItem).html(computer);
    console.log('computerTakeTurn: computer clicked: ', randomItem);
    this.playGame();
  }

  countPoints(type) {
    return $('#gameGrid .'+type).length;
  }

  resetBoard(hard = false) {
    if(hard) {
      console.log("hardResetOnclick: resetting game...");
      $("#playerForm").removeClass("displayNone");
      document.getElementById("playerForm").reset();
      $("#playerOne, #gameResult, #congratsOrSorry").html("");
      $("#gameInfo, #gameGrid, #congratsOrSorry").addClass("displayNone");
      this.gameStyle.styleClassic();
    } else {
      console.log("reset: resetting game, for new game...");
      $("#gameInfo").removeClass("displayNone");
      $("#gameResult, #congratsOrSorry").addClass("displayNone");
    }

    $(".item").removeClass("blue red gray unclickable").html("X/O");
  }

  getComputer() {
    var playerOne = this.getPlayerOne();
    var style = this.gameStyle.getGameStyle();
    //var computer = (playerOne === "X") ? ("O") : ("X")

    var computer;
    if (style === "classic") {
      computer = (playerOne === "X") ? ("O") : ("X")
    }
    if (style === "goth") {
      computer = (playerOne === "X") ? ("💀") : ("☠️")
    }
    if (style === "weapons") {
      computer = (playerOne === "X") ? ("💣") : ("⚔️")
    }

    console.log("getComputer: computer is: ", computer);
    return computer
  }

  getPlayerOne() {
    if (document.getElementById("playerOneSpan") != null) {
      return document.getElementById("playerOneSpan").innerHTML;
    }
  }



  checkForWinner() {
    console.log("checking for winner...");
    var winner;

    var eightWinningCombos = [
      "#one.COLOR, #two.COLOR, #three.COLOR",
      "#four.COLOR, #five.COLOR, #six.COLOR",
      "#seven.COLOR, #eight.COLOR, #nine.COLOR",
      "#one.COLOR, #four.COLOR, #seven.COLOR",
      "#two.COLOR, #five.COLOR, #eight.COLOR",
      "#three.COLOR, #six.COLOR, #nine.COLOR",
      "#one.COLOR, #five.COLOR, #nine.COLOR",
      "#seven.COLOR, #five.COLOR, #three.COLOR"
    ];

    var blueWinArray = this.getWinningArray(eightWinningCombos, "blue");
    var redWinArray = this.getWinningArray(eightWinningCombos, "red");
    var blueWins = blueWinArray.includes(true);
    var redWins = redWinArray.includes(true);
    var fullGrid = this.countPoints('red') + this.countPoints('blue');
    var draw = (fullGrid === 9) && (!blueWins) && (!redWins);

    if (blueWins) { //playerOne is always blue
      this.playerOneWins();
      return winner = blueWins
    }
    if (redWins) { //red is computer
      this.computerWins();
      return winner = redWins
    }
    if (draw) {
      this.drawGame();
      return winner = draw
    } else {
      console.log('game on...')
    }
  }

  getWinningArray(array, string) {
    return array.map(function(combo) {
      var eachCombo = combo.replace(/COLOR/g, string);
      return eachCombo = $(eachCombo).length === 3
    })
  }

  playerOneWins() {
    var playerOne = this.getPlayerOne();
    console.log(`${playerOne} wins!`);
    $("#gameResult").html(`<span class='yellowBig'>${playerOne} wins!</span>`);
    $("#congratsOrSorry").html("<span class='yellow'>Congratulations! You won!</span>");
    this.winLoseOrDraw()
  }

  computerWins() {
    var computer = this.getComputer();
    console.log(`${computer} wins!`);
    $("#gameResult").html(`<span class='redBig'>${computer} wins!</span>`);
    $("#congratsOrSorry").html("<span class='red'>Sorry, you lost.</span>");
    this.winLoseOrDraw()
  }

  drawGame() {
    console.log('Draw game!');
    $("#gameResult").html(`<span class='redBig'>Game is a draw.</span>`);
    $("#congratsOrSorry").html("<span>Game ended in a draw.</span>");
    this.winLoseOrDraw()
  }

  winLoseOrDraw() {
    $("#gameResult, #congratsOrSorry").removeClass("displayNone");
    $("#gameInfo").addClass("displayNone");
    this.disableRemainingItems()
  }

  disableRemainingItems() {
    var notBlueOrRed = document.querySelectorAll("div.item:not(.blue):not(.red)");
    $(notBlueOrRed).addClass("gray");
    $(notBlueOrRed).html("🤷");
    $(notBlueOrRed).addClass("unclickable");
    return false;
  }
}