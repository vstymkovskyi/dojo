define([
  'dojo/dom',
], function (dom) {
  return GameStyle;
});

class GameStyle {

  constructor() {
    this.body = document.body;
    this.activeStyle = 'classic';
    this.styles = {
        'classic': 'bodyClassic',
        'goth': 'bodyGoth',
        'weapons': 'bodyWeapons'
    };
    this.changeGameStyle();
    this.setGameStyle('classic');
  }

  changeGameStyle() {
    const self = this;
    $("#change-style input[name='change-style']").on("change", function() {
      if(self.styles[this.value]) {
          self.setGameStyle(this.value);
      } else {
        console.error('You have selected incorrect style.');
      }
    });
  };

  getGameStyle() {
    return this.activeStyle;
  };

  setGameStyle(type) {
    this.activeStyle = type;
    $(this.body).removeClass().addClass(this.styles[type]);
  }
}