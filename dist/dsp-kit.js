(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.dsp = require('./build/index.js')

},{"./build/index.js":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function zeros(size) {
  return new Float64Array(size);
}

function fill(N, fn, output) {
  if (arguments.length < 3) output = zeros(N);
  for (var n = 0; n < N; n++) {
    output[n] = fn(n, N);
  }return output;
}

function concat(a, b) {
  var dest = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

  var al = a.length;
  var bl = b.length;
  if (dest === null) dest = zeros(al + bl + offset);
  for (var i = 0; i < al; i++) {
    dest[i + offset] = a[i];
  }for (var _i = 0; _i < bl; _i++) {
    dest[_i + al + offset] = b[_i];
  }return dest;
}

function add(N, a, b, out) {
  out = out || zeros(N);
  for (var i = 0; i < N; i++) {
    out[i] = a[i] + b[i];
  }return out;
}

function mult(N, a, b, out) {
  out = out || zeros(N);
  for (var i = 0; i < N; i++) {
    out[i] = a[i] * b[i];
  }return out;
}



var isSame = Object.is;

var round = roundTo(8);

function roundTo(dec) {
  return function round(arr) {
    var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : dec;
    var output = arguments[2];

    var size = arr.length;
    if (!output) output = new Float64Array(size);
    var limit = Math.min(size, output.length);
    var m = Math.pow(10, n);
    for (var i = 0; i < limit; i++) {
      var r = Math.round(arr[i] * m) / m;
      output[i] = isSame(r, -0) ? 0 : r;
    }
    return output;
  };
}

function testAll(N, fn, array) {
  for (var i = 0; i < N; i++) {
    if (!fn(array[i])) return false;
  }
  return true;
}

var sin = Math.sin;
var cos = Math.cos;
var PI = Math.PI;


function dft(dir, signal, output) {
  if (dir !== 'forward' && dir !== 'inverse') throw Error('Direction must be "forward" or "inverse" but was ' + dir);
  var inverse = dir === 'inverse';
  signal = toComplex(signal);
  output = toComplex(output, signal.real.length);
  process(inverse, signal, output);
  return output;
}

function process(inverse, signal, output) {
  var r = void 0,
      i = void 0,
      theta = void 0;
  var real = signal.real,
      imag = signal.imag;


  var size = output.real.length;
  for (var k = 0; k < size; k++) {
    r = i = 0.0;
    for (var n = 0; n < size; n++) {
      theta = 2 * PI * k * n / size;
      r += real[n] * cos(theta) - imag[n] * sin(theta);
      i -= real[n] * sin(theta) + imag[n] * cos(theta);
    }
    output.real[k] = inverse ? r / size : r;
    output.imag[k] = inverse ? i / size : i;
  }
}

function toComplex(signal, size) {
  if (!signal) {
    if (!size) throw Error('A signal is required');
    return { real: new Float32Array(size), imag: new Float32Array(size) };
  } else if (signal.length) {
    return { real: signal, imag: new Float32Array(signal.length) };
  } else if (!signal.real || !signal.imag || signal.real.length !== signal.imag.length) {
    throw Error('Not valid signal: ' + signal + ' (must be an object { real: Array, imag: Array })');
  } else {
    return signal;
  }
}

Object.defineProperty(exports, '__esModule', { value: true });

function isPow2(v) {
  return !(v & v - 1) && !!v;
}
function _zeros(n) {
  return new Float32Array(n);
}

function fft(size, dir, complex, output) {
  if (arguments.length > 1) return fft(size)(dir, complex, output);

  var cached = tables(size);

  return function process(dir, complex, output) {
    dir = dir || 'forward';
    if (dir !== 'forward' && dir !== 'inverse') throw Error('Direction must be "forward" or "inverse", but was ' + dir);
    var inverse = dir === 'inverse';

    var rs = complex.real || complex;
    var is = complex.imag || cached.zeros;
    if (rs.length !== size) throw Error('Signal real length should be ' + size + ' but was ' + rs.length);
    if (is.length !== size) throw Error('Signal real length should be ' + size + ' but was ' + is.length);

    if (!output) output = { real: _zeros(size), imag: _zeros(size) };
    var _output = output;
    var real = _output.real;
    var imag = _output.imag;
    var cosTable = cached.cosTable;
    var sinTable = cached.sinTable;
    var reverseTable = cached.reverseTable;

    var phaseShiftStepReal = void 0,
        phaseShiftStepImag = void 0,
        currentPhaseShiftReal = void 0,
        currentPhaseShiftImag = void 0;
    var off = void 0,
        tr = void 0,
        ti = void 0,
        tmpReal = void 0,
        i = void 0;
    var halfSize = 1;

    for (i = 0; i < size; i++) {
      real[i] = rs[reverseTable[i]];
      imag[i] = -1 * is[reverseTable[i]];
    }

    while (halfSize < size) {
      phaseShiftStepReal = cosTable[halfSize];
      phaseShiftStepImag = sinTable[halfSize];
      currentPhaseShiftReal = 1;
      currentPhaseShiftImag = 0;

      for (var fftStep = 0; fftStep < halfSize; fftStep++) {
        i = fftStep;

        while (i < size) {
          off = i + halfSize;
          tr = currentPhaseShiftReal * real[off] - currentPhaseShiftImag * imag[off];
          ti = currentPhaseShiftReal * imag[off] + currentPhaseShiftImag * real[off];

          real[off] = real[i] - tr;
          imag[off] = imag[i] - ti;
          real[i] += tr;
          imag[i] += ti;

          i += halfSize << 1;
        }

        tmpReal = currentPhaseShiftReal;
        currentPhaseShiftReal = tmpReal * phaseShiftStepReal - currentPhaseShiftImag * phaseShiftStepImag;
        currentPhaseShiftImag = tmpReal * phaseShiftStepImag + currentPhaseShiftImag * phaseShiftStepReal;
      }

      halfSize = halfSize << 1;
    }

    if (inverse) {
      for (i = 0; i < size; i++) {
        real[i] /= size;
        imag[i] /= size;
      }
    }

    return output;
  };
}

function tables(size) {
  if (!isPow2(size)) throw Error('Size must be a power of 2, and was: ' + size);
  var reverseTable = new Uint32Array(size);
  var sinTable = _zeros(size);
  var cosTable = _zeros(size);
  var zeros = _zeros(size);
  var limit = 1;
  var bit = size >> 1;
  var i = void 0;

  while (limit < size) {
    for (i = 0; i < limit; i++) {
      reverseTable[i + limit] = reverseTable[i] + bit;
    }
    limit = limit << 1;
    bit = bit >> 1;
  }

  for (i = 0; i < size; i++) {
    sinTable[i] = Math.sin(-Math.PI / i);
    cosTable[i] = Math.cos(-Math.PI / i);
  }
  return { reverseTable: reverseTable, sinTable: sinTable, cosTable: cosTable, zeros: zeros };
}

function generateReverseTable(bufferSize) {
  var reverseTable = new Uint32Array(bufferSize);
  var halfSize = bufferSize >>> 1;
  var nm1 = bufferSize - 1;
  var i = 1;
  var r = 0;
  var h;

  reverseTable[0] = 0;

  do {
    r += halfSize;

    reverseTable[i] = r;
    reverseTable[r] = i;

    i++;

    h = halfSize << 1;
    while (h = h >> 1, !((r ^= h) & h)) {}

    if (r >= i) {
      reverseTable[i] = r;
      reverseTable[r] = i;

      reverseTable[nm1 - i] = nm1 - r;
      reverseTable[nm1 - r] = nm1 - i;
    }
    i++;
  } while (i < halfSize);

  reverseTable[nm1] = nm1;
  return reverseTable;
}

var sin$1 = Math.sin;
var cos$1 = Math.cos;
var PI$1 = Math.PI;
var SQRT1_2 = Math.SQRT1_2;


function forward(bufferSize, buffer, trans, spectrum, table) {
  var n = bufferSize,
      x = trans,
      n2,
      n4,
      n8,
      nn,
      t1,
      t2,
      t3,
      t4,
      i1,
      i2,
      i3,
      i4,
      i5,
      i6,
      i7,
      i8,
      st1,
      cc1,
      ss1,
      cc3,
      ss3,
      e,
      a;

  for (var k = 0, len = table.length; k < len; k++) {
    x[k] = buffer[table[k]];
  }

  for (var ix = 0, id = 4; ix < n; id *= 4) {
    for (var i0 = ix; i0 < n; i0 += id) {

      st1 = x[i0] - x[i0 + 1];
      x[i0] += x[i0 + 1];
      x[i0 + 1] = st1;
    }
    ix = 2 * (id - 1);
  }

  n2 = 2;
  nn = n >>> 1;

  while (nn = nn >>> 1) {
    ix = 0;
    n2 = n2 << 1;
    id = n2 << 1;
    n4 = n2 >>> 2;
    n8 = n2 >>> 3;
    do {
      if (n4 !== 1) {
        for (i0 = ix; i0 < n; i0 += id) {
          i1 = i0;
          i2 = i1 + n4;
          i3 = i2 + n4;
          i4 = i3 + n4;

          t1 = x[i3] + x[i4];
          x[i4] -= x[i3];

          x[i3] = x[i1] - t1;
          x[i1] += t1;

          i1 += n8;
          i2 += n8;
          i3 += n8;
          i4 += n8;

          t1 = x[i3] + x[i4];
          t2 = x[i3] - x[i4];

          t1 = -t1 * SQRT1_2;
          t2 *= SQRT1_2;

          st1 = x[i2];
          x[i4] = t1 + st1;
          x[i3] = t1 - st1;

          x[i2] = x[i1] - t2;
          x[i1] += t2;
        }
      } else {
        for (i0 = ix; i0 < n; i0 += id) {
          i1 = i0;
          i2 = i1 + n4;
          i3 = i2 + n4;
          i4 = i3 + n4;

          t1 = x[i3] + x[i4];
          x[i4] -= x[i3];

          x[i3] = x[i1] - t1;
          x[i1] += t1;
        }
      }

      ix = (id << 1) - n2;
      id = id << 2;
    } while (ix < n);

    e = 2 * PI$1 / n2;

    for (var j = 1; j < n8; j++) {
      a = j * e;
      ss1 = sin$1(a);
      cc1 = cos$1(a);

      cc3 = 4 * cc1 * (cc1 * cc1 - 0.75);
      ss3 = 4 * ss1 * (0.75 - ss1 * ss1);

      ix = 0;id = n2 << 1;
      do {
        for (i0 = ix; i0 < n; i0 += id) {
          i1 = i0 + j;
          i2 = i1 + n4;
          i3 = i2 + n4;
          i4 = i3 + n4;

          i5 = i0 + n4 - j;
          i6 = i5 + n4;
          i7 = i6 + n4;
          i8 = i7 + n4;

          t2 = x[i7] * cc1 - x[i3] * ss1;
          t1 = x[i7] * ss1 + x[i3] * cc1;

          t4 = x[i8] * cc3 - x[i4] * ss3;
          t3 = x[i8] * ss3 + x[i4] * cc3;

          st1 = t2 - t4;
          t2 += t4;
          t4 = st1;

          x[i8] = t2 + x[i6];
          x[i3] = t2 - x[i6];

          st1 = t3 - t1;
          t1 += t3;
          t3 = st1;

          x[i4] = t3 + x[i2];
          x[i7] = t3 - x[i2];

          x[i6] = x[i1] - t1;
          x[i1] += t1;

          x[i2] = t4 + x[i5];
          x[i5] -= t4;
        }

        ix = (id << 1) - n2;
        id = id << 2;
      } while (ix < n);
    }
  }

  return spectrum;
}

var sqrt = Math.sqrt;


function rfft(bufferSize) {
  var trans = new Float64Array(bufferSize);
  var spectrum = new Float64Array(bufferSize / 2);
  var table = generateReverseTable(bufferSize);

  return function (buffer) {
    forward(bufferSize, buffer, trans, spectrum, table);
    return trans;
  };
}

function rotate(src, n) {
  var len = src.length;
  reverse(src, 0, len);
  reverse(src, 0, n);
  reverse(src, n, len);
  return src;
}
function reverse(src, from, to) {
  --from;
  while (++from < --to) {
    var tmp = src[from];
    src[from] = src[to];
    src[to] = tmp;
  }
}

function fftshift(src) {
  var len = src.length;
  return rotate(src, Math.floor(len / 2));
}

function ifftshift(src) {
  var len = src.length;
  return rotate(src, Math.floor((len + 1) / 2));
}

var sqrt$1 = Math.sqrt;
var cos$2 = Math.cos;
var sin$2 = Math.sin;
var atan2 = Math.atan2;

function zeros$1(l) {
  return new Float64Array(l);
}

function bandWidth(size, sampleRate) {
  return 2 / size * sampleRate / 2;
}

function bandFrequency(index, size, sampleRate) {
  var width = bandWidth(size, sampleRate);
  return width * index + width / 2;
}

function polar(result, output) {
  var real = result.real,
      imag = result.imag;

  var len = real.length;
  if (!output) output = { magnitudes: zeros$1(len), phases: zeros$1(len) };
  var _output = output,
      magnitudes = _output.magnitudes,
      phases = _output.phases;

  var limit = Math.min(len, magnitudes.length);
  var rval = void 0,
      ival = void 0;
  for (var i = 0; i < limit; i++) {
    rval = real[i];
    ival = imag[i];
    if (magnitudes) magnitudes[i] = sqrt$1(rval * rval + ival * ival);
    if (phases) phases[i] = atan2(ival, rval);
  }
  return output;
}

function rectangular(spectrum, complex) {
  var magnitudes = spectrum.magnitudes,
      phases = spectrum.phases;

  var size = magnitudes.length;
  if (!complex) complex = { real: zeros$1(size), imag: zeros$1(size) };
  var _complex = complex,
      real = _complex.real,
      imag = _complex.imag;

  var limit = Math.min(size, real.length);
  for (var i = 0; i < limit; i++) {
    real[i] = magnitudes[i] * cos$2(phases[i]);
    imag[i] = magnitudes[i] * sin$2(phases[i]);
  }
  return complex;
}

var PI$3 = Math.PI;
var cos$3 = Math.cos;

var PI2$1 = PI$3 * 2;

var rectangular$1 = function rectangular() {
  return function (n, N) {
    return 1;
  };
};
rectangular$1.rov = 0.5;
var none = rectangular$1;

var hanning = function hanning() {
  return function (n, N) {
    var z = PI2$1 * n / (N - 1);
    return 0.5 * (1 - cos$3(z));
  };
};

var hamming = function hamming() {
  return function (n, N) {
    var z = PI2$1 * n / (N - 1);
    return 0.54 - 0.46 * cos$3(z);
  };
};

var blackman = function blackman(a) {
  return function (n, N) {
    var z = PI2$1 * n / (N - 1);
    return (1 - a) / 2 - 0.5 * cos$3(z) + a * cos$3(2 * z) / 2;
  };
};

var blackmanHarris = function blackmanHarris() {
  return function (n, N) {
    var z = PI2$1 * n / (N - 1);
    return 0.35875 - 0.48829 * cos$3(z) + 0.14128 * cos$3(2 * z) - 0.01168 * cos$3(3 * z);
  };
};

var win = Object.freeze({
	rectangular: rectangular$1,
	none: none,
	hanning: hanning,
	hamming: hamming,
	blackman: blackman,
	blackmanHarris: blackmanHarris
});

var window = win;

exports.window = window;
exports.add = add;
exports.mult = mult;
exports.zeros = zeros;
exports.fill = fill;
exports.concat = concat;
exports.round = round;
exports.testAll = testAll;
exports.dft = dft;
exports.fft = fft;
exports.rfft = rfft;
exports.fftshift = fftshift;
exports.ifftshift = ifftshift;
exports.bandWidth = bandWidth;
exports.bandFrequency = bandFrequency;
exports.polar = polar;
exports.rectangular = rectangular;

},{}]},{},[1]);