var _ = require('./util');
var Node = require('./node');

var NONE = [];


var Arc = function() {
  Node.apply(this, arguments);
};

Arc.prototype = _.extend(Arc.prototype, Node.prototype, {
  draw: function(ctx) {
    var source = this.source || {x:0,y:0};
    var dest = this.target || {x:0,y:0};

    ctx.beginPath();
    ctx.strokeStyle = this.strokeStyle || 'black';
    ctx.lineWidth = this.lineWidth || 1;
    ctx.setLineDash(this.lineDash || NONE);
    ctx.setLineDashOffset(this.lineDashOffset || 0);
    ctx.moveTo(source.x,source.y);
    ctx.quadraticCurveTo(source.x,dest.y,dest.x,dest.y);
    ctx.stroke();
    ctx.closePath();
  },

  hitTest: function(ctx, x, y, lx, ly) {
    // no hit testing for arcs
  }
});


module.exports = Arc;
