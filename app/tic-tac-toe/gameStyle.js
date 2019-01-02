define([
  'dojo/dom',
  "dojo/_base/declare",
  'dojo/query',
  'dojo/dom-class',
  'dojo/_base/window',
], function (dom, declare, query, domClass, win) {
  return declare('GameStyle', null, {
    body: null,
    activeStyle: 'classic',
    styles: {
      'classic': {
        style: 'bodyClassic',
        iconX: '<div class="x"></div>',
        iconO: '<div class="o"></div>',
      },
      'goth': {
        style: 'bodyGoth',
        iconX: '<div class="board-item-icon">☠</div>',
        iconO: '<div class="board-item-icon">💀</div>'
      },
      'weapons': {
        style: 'bodyWeapons',
        iconX: '<div class="board-item-icon">⚔</div>',
        iconO: '<div class="board-item-icon">💣</div>',
      },
    },
    changeStyleCallback: null,
    
    constructor() {
      this.body = dom.byId('gameWrapper');
      this.setGameStyle('classic');
      this.handleChangeGameStyle();
    },
  
    handleChangeGameStyle() {
      const self = this;
      query("input[name='change-style']").onchange(function() {
        if(self.styles[this.value]) {
          self.setGameStyle(this.value, true);
        } else {
          console.error('You have selected incorrect style.');
        }
      });
    },
    
    getGameStyle() {
      return this.activeStyle;
    },
    
    setGameStyle(type, callback = false) {
      this.activeStyle = type;
      domClass.remove(this.body);
      domClass.add(this.body, 'gameWrapper displayNone '+this.styles[type].style);
      if(callback && this.changeStyleCallback && typeof this.changeStyleCallback === "function") {
        this.changeStyleCallback();
      }
    },
    
    getStyledIcon(side) {
      return this.styles[this.activeStyle]['icon'+side];
    },
  });
});