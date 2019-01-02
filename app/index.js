require([
  'dojo/dom',
  './app/tic-tac-toe/gameStyle.js',
  './app/tic-tac-toe/board.js'
], function (dom, GameStyle, Board) {
  const gameID = guid();
  let gameIDfield = dom.byId('gameID');
  $(gameIDfield).attr("value", gameID);
  
  const gameStyle = new GameStyle();
  const board = new Board(gameID, gameStyle);
});


function guid() {
  return '_' + Math.random().toString(36).substr(2, 9);
}