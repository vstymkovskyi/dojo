require([
  'dojo/dom',
  './app/tic-tac-toe/gameStyle.js',
  './app/tic-tac-toe/board.js'
], function (dom) {
  const gameStyle = new GameStyle();
  const board = new Board(gameStyle);
});
