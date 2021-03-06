goog.provide('app.Application');

goog.require('app.Square');
goog.require('pl.Stats');
goog.require('pl.ex');
goog.require('qr.Code');
goog.require('qr.ErrorCorrectLevel');

/**
 @constructor
 @export
 @param {!HTMLCanvasElement} canvas
 */
app.Application = function(canvas, input) {
  if (COMPILED) {
    pl.Stats.addGoogleAnalytics('UA-22691951-1');
    pl.Stats.addStatCounter(6793701, '6b3ec070');
  }

  this.canvas = canvas;
  this.input = input;
  this.typeNumber = 10;
  this.size = this.typeNumber * 4 + 17;
  this.scale = 5;
  this._dim = (this.size + app.Application.PADDING * 2) * this.scale;

  $(input).width(this._dim).val('Type your message here...').bind('keyup', goog.bind(this._create, this));

  $(this.canvas).attr('width', this._dim).attr('height', this._dim).mousemove(goog.bind(this._mouseMove, this)).mouseout(goog.bind(this._mouseOut, this)).mouseleave(goog.bind(this._mouseOut, this)).mouseenter(goog.bind(this._mouseOut, this));

  this.context = this.canvas.getContext('2d');
  this.context.setTransform(1, 0, 0, 1, this.scale * app.Application.PADDING, this.scale * app.Application.PADDING);
  this._squares = [];
  this._create();
  this._tick();
};

app.Application.prototype._mouseOut = function(args) {
  this._mouse = null;
};

app.Application.prototype._mouseMove = function(args) {
  var offset = $(this.canvas).offset();
  var x, y;
  x = args.pageX - offset.left - (app.Application.PADDING + 0.5) * this.scale;
  y = args.pageY - offset.top - (app.Application.PADDING + 0.5) * this.scale;
  this._mouse = new goog.math.Coordinate(x, y);
};

app.Application.prototype._create = function() {
  var code, value;
  value = /** @type {string} */ ($(this.input).val());
  if (this.value !== value) {
    this.value = value;
    code = new qr.Code(this.typeNumber, qr.ErrorCorrectLevel.Q);
    code.addData(value);
    code.make();
    this._updateSquareTargets(code);
  }
};

app.Application.prototype._updateSquareTargets = function(qr) {
  var i, s, targets, x, y;
  targets = [];
  y = 0;
  while (y < this.size) {
    x = 0;
    while (x < this.size) {
      if (qr.isDark(y, x)) {
        targets.push(new goog.math.Coordinate(x * this.scale, y * this.scale));
      }
      x++;
    }
    y++;
  }
  while (this._squares.length > targets.length) {
    i = goog.math.randomInt(this._squares.length);
    goog.array.removeAt(this._squares, i);
  }
  while (this._squares.length < targets.length) {
    x = y = (this.size - 1) * this.scale / 2;
    s = new app.Square(x, y);
    i = goog.math.randomInt(this._squares.length);
    goog.array.insertAt(this._squares, s, i);
  }
  goog.array.rotate(this._squares, this.size);
  i = 0;
  while (i < targets.length) {
    this._squares[i].target.x = targets[i].x;
    this._squares[i].target.y = targets[i].y;
    i++;
  }
  this._initial = false;
};

app.Application.prototype._tick = function() {
  var i, s;
  this.context.fillStyle = 'white';
  this.context.fillRect(-app.Application.PADDING * this.scale, -app.Application.PADDING * this.scale, this._dim, this._dim);
  this.context.fillStyle = 'black';
  i = 0;
  while (i < this._squares.length) {
    s = this._squares[i];
    this._updateSquare(s);
    i++;
  }
  pl.ex.requestAnimationFrame(goog.bind(this._tick, this));
};

app.Application.prototype._updateSquare = function(s) {
  s.update(this._mouse);
  return this.context.fillRect(s.current.x, s.current.y, this.scale, this.scale);
};

app.Application.PADDING = 10;
