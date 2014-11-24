var _ = require('./util');
var Node = require('./node');

var NONE = [];


var Arrow = function() {
  Node.apply(this, arguments);
};

Arrow.prototype = _.extend(Arrow.prototype, Node.prototype, {
  draw: function(ctx) {
    var source = this.source || {x:0,y:0};
    var dest = this.target || {x:0,y:0};
    var headlen = 10 || this.headLength;
    var headAngle = Math.PI/6 || this.headAngle;
    var headOffset = 0 || this.headOffset;

    ctx.beginPath();
    ctx.strokeStyle = this.strokeStyle || 'black';
    ctx.lineWidth = this.lineWidth || 1;
    var angle = Math.atan2(dest.y-source.y,dest.x-source.x);

    var xCompOffset = 0, yCompOffset = 0;
    if (headOffset) {
      xCompOffset = headOffset * Math.cos(angle);
      yCompOffset = headOffset * Math.sin(angle);
    }
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(dest.x, dest.y);
    ctx.moveTo(dest.x-xCompOffset,dest.y-yCompOffset);
    ctx.lineTo(dest.x-xCompOffset-headlen*Math.cos(angle-headAngle),dest.y-yCompOffset-headlen*Math.sin(angle-headAngle));
    ctx.moveTo(dest.x-xCompOffset,dest.y-yCompOffset);
    ctx.lineTo(dest.x-xCompOffset-headlen*Math.cos(angle+headAngle),dest.y-yCompOffset-headlen*Math.sin(angle+headAngle));
    ctx.stroke();
    ctx.closePath();
  },

  hitTest: function(ctx, x, y, lx, ly) {
    // no hit testing for Arrows
  }
});


module.exports = Arrow;
