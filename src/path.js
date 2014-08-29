var _ = require('./util');
var Node = require('./node');
var svg = require('./svg');



var Path = function() {
  Node.apply(this, arguments);
};


Path.prototype = _.extend(Path.prototype, Node.prototype, {

  attr: function(attributes) {
    Node.prototype.attr.call(this, attributes);
    if (attributes.path) {
      this.commandCache = null;
    }
    return this;
  },

  // Much from Fabric.js - https://github.com/kangax/fabric.js/blob/master/src/shapes/path.class.js
  sketch: function(ctx) {
    if (this.path && this.path.length > 0) {
      var pathCommands = this.commandCache || (this.commandCache = svg.parse(this.path));
      svg.render(ctx, pathCommands);
    }
  },

  draw: function(ctx) {
    if (!this.visible) {
      return;
    }

    ctx.save();
    ctx.translate(this.x || 0, this.y || 0);

    if (this.fillStyle) {
      ctx.fillStyle = this.fillStyle;
    }

    if (this.strokeStyle) {
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = this.lineWidth || 1;
      ctx.lineCap = this.lineCap || 'butt';
      ctx.lineJoin = this.lineJoin || 'miter';
    }

    this.sketch(ctx);

    if (this.strokeStyle) {
      ctx.stroke();
    }
    if (this.fillStyle) {
      ctx.fill();
    }

    ctx.restore();
  },

  pick: function(ctx, x, y, lx, ly) {
    var isHit = false;

    if (!this.visible) {
      return;
    }

    ctx.save();
    ctx.translate(this.x || 0, this.y || 0);

    this.sketch(ctx);

    if (this.fillStyle) {
      isHit = ctx.isPointInPath(x,y);
    }
    if (!isHit && this.stroke) {
      isHit = ctx.isPointInStroke(x,y);
    }

    ctx.restore();
    return isHit && this;
  }
});


module.exports = Path;