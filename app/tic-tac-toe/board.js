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
  'dojo/dom-construct',
], function (declare, dom, html, query, domClass, on, fx, baseFx, domStyle, domConstruct) {
  return declare('Board', null, {
    gameID: null,
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

    constructor(gameID, gameStyle) {
      this.gameID = gameID;
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
        self.showGameBoard();
      });
    },
  
    handleButtonClicks() {
      const self        = this;
      const resetBtn    = dom.byId('resetButton');
      const selectStyle = dom.byId('chooseStyle');
      const saveGameBtn = dom.byId('saveGame');
      const loadGamesBtn = dom.byId('loadGames');
      
      on(resetBtn, "click", () => self.resetBoard(true));
      on(selectStyle, "click", () => self.checkNames());
      on(saveGameBtn, "click", () => self.saveGame());
      on(loadGamesBtn, "click", () => self.loadGames());
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
    
    showGameBoard() {
      html.set(dom.byId('playerOne'), `You are: <span id="playerName">${this.players[this.playerSide].name}</span>`);
      domClass.add(dom.byId('configuration'), 'displayNone');
      domClass.remove(dom.byId('gameWrapper'), 'displayNone');
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
        setTimeout(this.resetBoard, 3000) //call reset after 3 seconds...
      } else {
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
        dojo.map(notBlueOrRed, function (item) {
          return domClass.remove(item, 'gray unclickable');
        });
      } else {
        allItems = query('.board-item');
        dojo.map(allItems, function (item) {
          return domClass.add(item, 'unclickable');
        }); //need to remove this on player's turn

        setTimeout(this.AITakeTurn.bind(this), 1000);
      }
  
      domClass.toggle(dom.byId('compTurn'), 'btn-warning');
      domClass.toggle(dom.byId('yourTurn'), 'btn-warning');
    },
  
    AITakeTurn() {
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
      return $('#boardContainer .'+type).length;
    },
  
    resetBoard(hard = false) {
      const configuration   = dom.byId("configuration");
      const configurationForm = dom.byId("configurationForm");
      const styleButtons = dom.byId("change-style");
      const sideButtons  = dom.byId("select-side");
      const boardItems   = query('.board-item');
  
      html.set(dom.byId('gameResult'), '');
      html.set(dom.byId('congratsOrSorry'), '');
      domClass.remove(dom.byId('compTurn'), 'btn-warning');
      domClass.add(dom.byId('yourTurn'), 'btn-warning');
      
      if(hard) {
        configurationForm.reset();
        domClass.add(dom.byId('gameWrapper'), 'displayNone');
        this.gameStyle.setGameStyle('classic');
  
        domClass.add(styleButtons, 'invisible');
        domClass.add(sideButtons, 'invisible');
        domStyle.set(sideButtons, 'opacity', 0);

        domClass.remove(configuration, 'displayNone');
      }

      dojo.map(boardItems, function (item) {
        domClass.remove(item, 'blue red gray unclickable');
        return html.set(item, '');
      });
      
    },

    checkForWinner() {
      let winner;
    
      const eightWinningCombos = [
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
      }
    },
  
    getWinningArray(array, string) {
      return array.map(function(combo) {
        var eachCombo = combo.replace(/COLOR/g, string);
        return eachCombo = $(eachCombo).length === 3
      })
    },
  
    displayWinner(winner, color) {
      html.set(dom.byId('gameResult'), "<span class='"+color+"'>"+this.players[winner].name+" wins!</span>");
      let congratulations = 'Congratulations! You won!';
      if(this.playerSide !== winner) {
        congratulations = 'Sorry, you lose, try again.';
      }
      html.set(dom.byId('congratsOrSorry'), congratulations);

      //remove saved game
      this.removeGame(this.gameID);
      
      return this.winLoseOrDraw();
    },
    
    drawGame() {
      html.set(dom.byId('gameResult'), '<span class="redBig">Game is a draw.</span>');
      html.set(dom.byId('congratsOrSorry'), '<span>Game ended in a draw.</span>');
  
      return this.winLoseOrDraw();
    },
  
    winLoseOrDraw() {
      return this.disableRemainingItems();
    },
  
    disableRemainingItems() {
      const notBlueOrRed  = query('.board-item:not(.blue):not(.red)');
      dojo.map(notBlueOrRed, function (item) {
        domClass.add(item, 'gray unclickable');
        return html.set(item, '<div class="board-item-icon">🤷</div>');
      });
  
      return false;
    },
    
    saveGame() {
      const boardItems = query('.board-item');
      let boardArray = [
        null,null,null,
        null,null,null,
        null,null,null
      ];
      let gamesArray = [];

      dojo.map(boardItems, (item, i) => {
        if(domClass.contains(item, 'red')) {
          boardArray[i] = 'red'
        } else if(domClass.contains(item, 'blue')) {
          boardArray[i] = 'blue'
        }
      });
  
      const gameObj = {
        gameID: this.gameID,
        boardArray: boardArray,
        playerSide: this.playerSide,
        AISide: this.AISide,
        players: this.players,
        gameStyleType: this.gameStyle.getGameStyle(),
      };
      
      if(localStorage.getItem('Games')) {
        let gamesData = localStorage.getItem('Games');
        gamesArray = JSON.parse(gamesData);
  
        const gameData = gamesArray.findIndex(item => item.gameID === this.gameID);
        //update existing game
        if(gameData !== -1) {
          gamesArray.splice(gameData, 1);
        }
        gamesArray.push(gameObj);
      } else {
        gamesArray.push(gameObj);
      }
      localStorage.setItem('Games', JSON.stringify(gamesArray));
      alert('Game was saved');
    },
    
    removeGame(id) {
      if(localStorage.getItem('Games')) {
        let gamesData = localStorage.getItem('Games');
        let gamesArray = JSON.parse(gamesData);
    
        const gameData = gamesArray.findIndex(item => item.gameID === id);
        //update existing game
        if(gameData !== -1) {
          gamesArray.splice(gameData, 1);
          localStorage.setItem('Games', JSON.stringify(gamesArray));
          alert('Game was removed because you have finished it.');
        }
      }
    },
  
    loadGames() {
      let gamesArray = [];
      if(localStorage.getItem('Games')) {
        let gamesData = localStorage.getItem('Games');
        gamesArray = JSON.parse(gamesData);

      }
      
      this.displaySavedGames(gamesArray);
    },
    
    displaySavedGames(gamesArray) {
      const wrapper = dom.byId('loadedGames');
      domConstruct.empty("loadedGames");
  
      new Promise((resolve) => {
        let output = '<ul class="list-group">';
        dojo.map(gamesArray, (item) => {
          output += '<li class="list-group-item loaded-game" data-id="'+item.gameID+'">';
            output += '<div class="row">';
              output += '<span class="col-3">ID: '+item.gameID+'</span>';
              output += '<span class="col-3">Player: '+item.players[item.playerSide].name+'</span>';
              output += '<span class="col-3">AI: '+item.players[item.AISide].name+'</span>';
            output += '</div>';
          
          output += '</li>'
        });
        output += '</ul>';
        domConstruct.place(output, wrapper);
        resolve();
      }).then(()=> {
        const loadGameLI = query('.loaded-game');
        on(loadGameLI, "click", (e) => this.restoreBoard(e));
      });
    },
    
    restoreBoard(e) {
      const id = $(e.target).data('id');
      const gamesData = localStorage.getItem('Games');
      const gamesArray = JSON.parse(gamesData);
  
      const gameData = gamesArray.find(obj => obj.gameID === id);
      const boardArray = gameData.boardArray;
      const boardItems = query('.board-item');

      this.gameID     = gameData.gameID;
      this.playerSide = gameData.playerSide;
      this.AISide     = gameData.AISide;
      this.players    = gameData.players;

      this.gameStyle.setGameStyle(gameData.gameStyleType);

      let playerIcon = this.gameStyle.getStyledIcon(this.players[this.playerSide].side);
      let AIIcon = this.gameStyle.getStyledIcon(this.players[this.AISide].side);

      new Promise((resolve)=> {
        dojo.map(boardItems, (item, i) => {
          if(boardArray[i] !== null) {
            domClass.add(item, boardArray[i]);
      
            if(domClass.contains(item, boardArray[i]) && boardArray[i] === this.players[this.playerSide].pointClass) {
              return html.set(item, playerIcon);
            } else {
              return html.set(item, AIIcon);
            }
          }
        });
        resolve();
      }).then(() => {
        this.showGameBoard();
      });
    }
  });
});