define([
  'dojo/dom',
], function (dom) {
  return GameStyle;
});

class GameStyle {

  constructor() {
    console.log('constructor');
    this.setGameStyle();
  }

  setGameStyle() {
    const self = this;
    $("#playerForm #group1 input").on("change", function() {
      var gameStyle = $("input[name='group1']:checked", "#playerForm").val();
      console.log(`game style selected: ${gameStyle}`);
      $("#gameStyle").html(gameStyle);
      self.changeStyle();
    });
  };

  changeStyle() {
    var body = document.body;
    var gameStyle = this.getGameStyle();
    if (gameStyle === "classic") {
      this.styleClassic();
    }
    if (gameStyle === "goth") {
      this.styleGoth();
    }
    if (gameStyle === "weapons") {
      this.styleWeapons();
    }
  };

  getGameStyle() {
    if (document.getElementById("gameStyle") != null) {
      var gameStyle = document.getElementById("gameStyle").innerHTML;
      console.log("gameStyle is:::: ", gameStyle);
      return gameStyle
    }
  };


  styleClassic() {
    var body = document.body;
    $("#gameStyle").html("classic");
    $("#header").addClass("classicHeader").removeClass("gothHeader weaponsHeader");
    $(body).addClass("bodyClassic").removeClass("bodyGoth bodyWeapons")
  };

  styleGoth() {
    var body = document.body;
    $("#gameStyle").html("goth");
    $("#header").addClass("gothHeader").removeClass("classicHeader weaponsHeader");
    $(body).addClass("bodyGoth").removeClass("bodyClassic bodyWeapons")
  };

  styleWeapons() {
    var body = document.body;
    $("#gameStyle").html("weapons");
    $("#header").addClass("weaponsHeader").removeClass("classicHeader gothHeader");
    $(body).addClass("bodyWeapons").removeClass("bodyGoth bodyClassic")
  }


}