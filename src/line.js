var _ = require('./util');
var Node = require('./node');

var NONE = [];

/**
 * Rectangle Node
 *
 * Properties inherited from Node: visible, x, y, rotation, scaleX, scaleY, opacity
 *
 * width: width of the rectangle
 * height: height of the rectangle
 * fillStyle, strokeStyle, lineWidth, lineCap, lineJoin, miterLimit:
 *   as specified in the HTML5 Canvas API
 * lineDash: an array specifying on/off pixel pattern
 *   (e.g. [10, 5] = 10 pixels on, 5 pixels off) (not supported in all browsers)
 * lineDashOffset: a pixel offset to start the dashes (not supported in all browsers)
 *
 * Note: picking is always enabled on the entire rect (no stroke-only picking) at
 * the moment.
 */
var Line = function() {
  Node.apply(this, arguments);
};

Line.prototype = _.extend(Line.prototype, Node.prototype, {
  _drawLine: function(ctx) {
    var source = this.source || {x:0,y:0};
    var dest = this.target || {x:0,y:0};
    ctx.beginPath();
    ctx.strokeStyle = this.strokeStyle || 'black';
    ctx.lineWidth = this.lineWidth || 1;
    ctx.setLineDash(this.lineDash || NONE);
    ctx.setLineDashOffset(this.lineDashOffset || 0);
    ctx.moveTo(source.x,source.y);
    ctx.lineTo(dest.x,dest.y);
    ctx.stroke();
    ctx.closePath();
  },
  _drawArc: function(ctx) {
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
  _drawArrow: function(ctx) {
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


  draw: function(ctx) {
    if (this.type === 'arc') {
      this._drawArc(ctx);
    } else if (this.type === 'arrow') {
      this._drawArrow(ctx);
    } else {
      this._drawLine(ctx);
    }
  },

  hitTest: function(ctx, x, y, lx, ly) {
    // no hit testing for lines
  }
});


module.exports = Line;
