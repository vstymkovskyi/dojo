define([
  "dojo/_base/declare",
  'dojo/dom',
  'dojo/html',
  'dojo/query',
  'dojo/dom-class',
  'dojo/on',
  'dojo/fx',
  'dojo/_base/fx',
  'dojo/dom-style',
], function (declare, dom, html, query, domClass, on, fx, baseFx, domStyle) {
  return declare('Board', null, {
    playerSide: null,
    AISide: null,
    players: {
      0: {
        name: null,
        pointClass: 'red',
        side: 'O'
      },
      1: {
        name: null,
        pointClass: 'blue',
        side: 'X'
      }
    },

    constructor(gameStyle) {
      this.gameStyle = gameStyle;
      this.gameStyle.changeStyleCallback = this.handleSideButtons;
    
      this.handleButtonClicks();
      this.handleBoardClick();
      this.handleSelectSide();
    },
  
    handleSelectSide() {
      const self = this;
      query("input[name='select-side']").onchange(function() {
        
        self.playerSide = this.value;
        self.AISide     = $("input[name='select-side']:not(:checked)").val();
        
        self.players[self.playerSide].name = dom.byId('player_name').value;
        self.players[self.AISide].name = dom.byId('ai_name').value;
  
        $("#playerForm").addClass("displayNone");
        $("#playerOne").html(`You are: <span id="playerOneSpan" class="yellow">${self.players[self.playerSide].name}</span>`);
        $("#gameInfo, #resetButton, #gameGrid").removeClass("displayNone");
      });
    },
  
    handleButtonClicks() {
      const self        = this;
      const resetBtn    = dom.byId('resetButton');
      const selectStyle = dom.byId('chooseStyle');
      
      on(resetBtn, "click", () => self.resetBoard(true));
      on(selectStyle, "click", () => self.checkNames());

    },
  
    handleBoardClick() {
      const self = this;
      query(".board-item").onclick(function() {
        self.makeStep($(this), self.playerSide);
        self.playGame() //call playGame after every click, to check for winner & whose turn
      })
    },
  
    handleSideButtons() {
      const self = this;
      const sideButtons = dom.byId("select-side");
      this.animate = () => {
        baseFx.animateProperty(
          {
            node: sideButtons,
            properties: {
              opacity: { start: 0, end: 1 }
            },
            duration: 800,
            beforeBegin: () => {
              domClass.remove(sideButtons, 'invisible');
            }
          }).play();
      };

      if(!domClass.contains(sideButtons, 'invisible')) {
        domStyle.set(sideButtons, 'opacity', 0);
        domClass.add(sideButtons, 'invisible');
        return setTimeout(()=> {
          return self.animate();
        }, .8);
      } else {
        return this.animate();
      }
    },
    
    checkNames() {
      const styleSelect = dom.byId('change-style');
      const playerName  = dom.byId('player_name');
      const AIName      = dom.byId('ai_name');
      
      if(playerName.value.trim().length > 0 && AIName.value.trim().length > 0) {
        // TODO: create animation and disable inputs
        domClass.toggle(styleSelect, 'invisible');
      }
    },
  
    playGame() {//for this game, playerOne goes first
      const winner = this.checkForWinner();
      if (winner) {
        console.log('game over, resetting game');
        setTimeout(this.resetBoard, 3000) //call reset after 3 seconds...
      } else {
        console.log('no winner yet...');
        this.checkWhoseTurn();
      }
    },
  
    checkWhoseTurn() {
      let playerTurn, allItems, notBlueOrRed;
      const redCount  = this.countPoints('red');
      const blueCount = this.countPoints('blue');

      if(parseInt(this.playerSide) === 1) {
        playerTurn = !blueCount || redCount > blueCount || blueCount && redCount === blueCount;
      } else {
        playerTurn = !redCount || blueCount > redCount || redCount && blueCount === redCount;
      }

      if (playerTurn) {
        notBlueOrRed = query('.board-item:not(.blue):not(.red)');
        domClass.remove(notBlueOrRed, 'gray unclickable');
      } else {
        allItems = query('.board-item');
        domClass.add(allItems, 'unclickable'); //need to remove this on player's turn
        setTimeout(this.computerTakeTurn.bind(this), 1000); //call after 1 second...
      }
  
      domClass.toggle(dom.byId('compTurn'), 'btn-warning');
      domClass.toggle(dom.byId('yourTurn'), 'btn-warning');
    },
  
    computerTakeTurn() {
      const notBlueOrRed = query('.board-item:not(.blue):not(.red)');
      //choose one at random
      var randomItem = notBlueOrRed[Math.floor(Math.random() * notBlueOrRed.length)];
      //addClass red to that random item and show computer chose it
      this.makeStep($(randomItem), this.AISide);
      this.playGame();
    },
  
    makeStep(item, side) {
      let icon = this.gameStyle.getStyledIcon(this.players[side].side);
      if(item) {
        item.addClass(this.players[side].pointClass).html(icon);
      }
    },

    countPoints(type) {
      return $('#gameGrid .'+type).length;
    },
  
    resetBoard(hard = false) {
      const playerForm   = dom.byId("playerForm");
      const styleButtons = dom.byId("change-style");
      const sideButtons  = dom.byId("select-side");
      const boardItems   = query('.board-item');

      if(hard) {
        domClass.remove(playerForm, 'displayNone');
        playerForm.reset();
        
        html.set(dom.byId('playerOne'), '');
        html.set(dom.byId('gameResult'), '');
        html.set(dom.byId('congratsOrSorry'), '');
  
        domClass.add(dom.byId('gameInfo'), 'displayNone');
        domClass.add(dom.byId('gameGrid'), 'displayNone');
        domClass.add(dom.byId('congratsOrSorry'), 'displayNone');
        

        this.gameStyle.setGameStyle('classic');
        domClass.add(styleButtons, 'invisible');
        domClass.add(sideButtons, 'invisible');
        domStyle.set(sideButtons, 'opacity', 0);

      } else {
        domClass.remove(dom.byId('gameInfo'), 'displayNone');
        domClass.add(dom.byId('gameResult'), 'displayNone');
        domClass.add(dom.byId('congratsOrSorry'), 'displayNone');
      }
      domClass.remove(dom.byId('compTurn'), 'btn-warning');
      domClass.add(dom.byId('yourTurn'), 'btn-warning');

      dojo.map(boardItems, function (item) {
        domClass.remove(item, 'blue red gray unclickable');
        return html.set(item, 'X/O');
      });
      
    },

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
    
      if(this.players[this.playerSide].pointClass === 'blue' && blueWins) {
        this.displayWinner(this.playerSide, this.players[this.playerSide].pointClass);
        return winner = blueWins
      } else if (this.players[this.playerSide].pointClass === 'red' && redWins){
        this.displayWinner(this.playerSide, this.players[this.playerSide].pointClass);
        return winner = redWins
      }
  
      if(this.players[this.AISide].pointClass === 'blue' && blueWins) {
        this.displayWinner(this.AISide, this.players[this.AISide].pointClass);
        return winner = blueWins
      } else if (this.players[this.AISide].pointClass === 'red' && redWins){
        this.displayWinner(this.AISide, this.players[this.AISide].pointClass);
        return winner = redWins
      }

      if (draw) {
        this.drawGame();
        return winner = draw
      } else {
        console.log('game on...')
      }
    },
  
    getWinningArray(array, string) {
      return array.map(function(combo) {
        var eachCombo = combo.replace(/COLOR/g, string);
        return eachCombo = $(eachCombo).length === 3
      })
    },
  
    displayWinner(winner, color) {
      html.set(dom.byId('gameResult'), "<span class='"+color+" bigFont'>"+this.players[winner].name+" wins!</span>");
      html.set(dom.byId('congratsOrSorry'), '<span class="'+color+'">Congratulations! You won!</span>');

      return this.winLoseOrDraw();
    },
    
    drawGame() {
      html.set(dom.byId('gameResult'), '<span class="redBig">Game is a draw.</span>');
      html.set(dom.byId('congratsOrSorry'), '<span>Game ended in a draw.</span>');
  
      return this.winLoseOrDraw();
    },
  
    winLoseOrDraw() {
      domClass.remove(dom.byId('gameResult'), 'displayNone');
      domClass.remove(dom.byId('congratsOrSorry'), 'displayNone');
      domClass.add(dom.byId('gameInfo'), 'displayNone');

      return this.disableRemainingItems();
    },
  
    disableRemainingItems() {
      const notBlueOrRed  = query('.board-item:not(.blue):not(.red)');
      dojo.map(notBlueOrRed, function (item) {
        domClass.add(item, 'gray unclickable');
        return html.set(item, '🤷');
      });
  
      return false;
    },
  });
  
});