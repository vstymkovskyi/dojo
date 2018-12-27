require([
  'dojo/dom',
  './app/tic-tac-toe/gameStyle.js',
  './app/tic-tac-toe/board.js'
], function (dom) {
  const gameStyle = new GameStyle();

  const board = new Board(gameStyle);

  function setPlayerOne() {
    $("#playerForm #group2 input").on("change", function() {
      var playerOne = $("input[name='group2']:checked", "#playerForm").val();
      console.log(`player selected: ${playerOne}`);
      $("#playerForm").addClass("displayNone");
      $("#playerOne").html(`You are: <span id="playerOneSpan" class="yellow">${playerOne}</span>`);
      $("#gameInfo, #resetButton, #gameGrid").removeClass("displayNone")
    });
  }
  setPlayerOne();

});
