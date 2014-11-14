var _ = require('./util');

var ID = 0;

/**
 * Base Node object for all scenegraph objects
 *
 * id: non-visual, unique value for all nodes
 * visible: if false, this node (and descendents) will not render nor pick
 * x: the x position (translation) applied to this node
 * y: the y position (translation) applied to this node
 * rotation: rotation in radians applied to this node and any descendents
 * scaleX, scaleY: x and y scale applied to this node and any descendents
 * opacity: the global opacity [0,1] of this node
 */
var Node = function(attributes) {
  this.id = ID++;
  this.parent = null;
  this.visible = true;
  this.handlers = {};

  _.extend(this, attributes);
};

Node.prototype = {
  /**
   * Simple
   */
  data: function(data) {
    if (arguments.length === 0) {
      return this._data;
    } else {
      this._data = data;
    }
  },

  /**
   * Bulk sets a group of node properties, takes a map of property names
   * to values. Functionally equivalent to setting each property via
   * `node.propertyName = value`
   */
  attr: function(attributes) {
    _.extend(this, attributes);
    return this;
  },

  tweenObj: function(baseProp,attributes,transition) {
	  this.tweenAttr.call(this[baseProp],attributes,transition);
  },

  /**
   * Queues a set of node properties for an animated transition. Only
   * numeric properties can be animated. The length of the transition
   * is specified in the transition property, defaults to 1 second. An
   * optional callback can be provided which will be called on animation
   * completion.
   *
   * Calling `update()` on the scene root will trigger the start of all
   * queued animations and cause them to run (and render) to completion.
   */
  tweenAttr: function(attributes, transition) {
    var self = this;
    var key, statics;
    transition = transition || {};

    // Only support tweening numbers - statically set everything else
    for (key in attributes) {
      if (attributes.hasOwnProperty(key) && typeof attributes[key] != 'number') {
        statics = statics || {};
        statics[key] = attributes[key];
        delete attributes[key];
      }
    }

    if (statics) {
      this.attr(statics);
    }

    if (this.tween) {
      // TODO Jump to end state of vars not being transitioned
      this.tween.stop();
    }

    this.tween = new TWEEN.Tween(this)
      .to(attributes, transition.duration || 1000)
      .onComplete(function() {
        self.tween = null;
        if (transition.callback) {
          transition.callback(this, attributes);
        }
      })
      .start();
  },

  /**
   * Adds an event handler to this node. For example:
   * ```
   * node.on('click', function(event) {
   *   // do something
   * });
   * ```
   * An event object will be passed to the handler when the event
   * is triggered. The event object will be a standard JavaScript
   * event and will contain a `targetNode` property containing the
   * node that was the source of the event. Events bubble up the
   * scenegraph until handled. Handlers returning a truthy value
   * signal that the event has been handled.
   */
  on: function(type, handler) {
    var handlers = this.handlers[type];
    if (!handlers) {
      handlers = this.handlers[type] = [];
    }
    handlers.push(handler);
    return this;
  },

  /**
   * Removes an event handler of the given type. If no handler is
   * provided, all handlers of the type will be removed.
   */
  off: function(type, handler) {
    if (!handler) {
      this.handlers[type] = [];
    } else {
      var handlers = this.handlers[type];
      var idx = handlers.indexOf(handler);
      if (idx >= 0) {
        handlers.splice(idx, 1);
      }
    }
    return this;
  },

  /**
   * Triggers an event and begins bubbling. Returns truthy if the
   * event was handled.
   */
  trigger: function(type, event) {
    var handled = false;
    var handlers = this.handlers[type];

    if (handlers) {
      handlers.forEach(function(handler) {
        handled = handler(event) || handled;
      });
    }

    if (!handled && this.parent) {
      handled = this.parent.trigger(type, event);
    }

    return handled;
  },

  /**
   * Removes this node from its parent
   */
  remove: function() {
    if (this.parent) {
      this.parent.remove(this);
    }
  },

  /**
   * Internal: renders the node given the context
   */
  render: function(ctx) {
    if (!this.visible) {
      return;
    }

    var x = this.x || 0;
    var y = this.y || 0;
    var scaleX = this.scaleX == null ? 1 : this.scaleX;
    var scaleY = this.scaleY == null ? 1 : this.scaleY;
    var transformed = !!x || !!y || !!this.rotation || scaleX !== 1 || scaleY !== 1 || this.opacity != null;

    // TODO Investigate cost of always save/restore
    if (transformed) {
      ctx.save();
    }

    if (x || y) {
      ctx.translate(x,y);
    }

    if (scaleX !== 1 || scaleY !== 1) {
      ctx.scale(scaleX, scaleY);
    }

    if (this.rotation) {
      ctx.rotate(this.rotation);
    }

    if (this.opacity != null) {
      ctx.globalAlpha = this.opacity;
    }

    this.draw(ctx);

    if (transformed) {
      ctx.restore();
    }
  },

  /**
   * Internal: tests for pick hit given context, global and local
   * coordinate system transformed pick coordinates.
   */
  pick: function(ctx, x, y, lx, ly) {
    if (!this.visible) {
      return;
    }

    var result = null;
    var s, c, temp;

    var tx = this.x || 0;
    var ty = this.y || 0;
    var scaleX = this.scaleX == null ? 1 : this.scaleX;
    var scaleY = this.scaleY == null ? 1 : this.scaleY;
    var transformed = !!tx || !!ty || !!this.rotation || scaleX !== 1 || scaleY !== 1 || this.opacity != null;

    // TODO Investigate cost of always save/restore
    if (transformed) {
      ctx.save();
    }

    if (tx || ty) {
      ctx.translate(tx,ty);
      // Reverse translation on picked point
      lx -= tx;
      ly -= ty;
    }

    if (scaleX !== 1 || scaleY !== 1) {
      ctx.scale(scaleX, scaleY);
      // Reverse scale
      lx /= scaleX;
      ly /= scaleY;
    }

    if (this.rotation) {
      ctx.rotate(this.rotation);
      // Reverse rotation
      s = Math.sin(-this.rotation);
      c = Math.cos(-this.rotation);
      temp = c*lx - s*ly;
      ly = s*lx + c*ly;
      lx = temp;
    }

    result = this.hitTest(ctx, x, y, lx, ly);

    if (transformed) {
      ctx.restore();
    }

    return result;
  },

  /**
   * Template method for derived objects to actually perform draw operations.
   * The calling `render` call handles general transforms and opacity.
   */
  draw: function(ctx) {
    // template method
  },

  /**
   * Template method for derived objects to test if they (or child) is hit by
   * the provided pick coordinate. If hit, return object that was hit.
   */
  hitTest: function(ctx, x, y, lx, ly) {
    // template method
  }
}

module.exports = Node;