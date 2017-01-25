/**
 * > Discrete Fourier Transformation
 *
 * [![npm install dsp-dft](https://nodei.co/npm/dsp-dft.png?mini=true)](https://npmjs.org/package/dsp-dft/)
 *
 * This module have functions to compute DFT using the correlation algorithm
 * (the simplest and easy to understand, also the slowest)
 *
 * > Various methods are used to obtain DFT for time domain samples including use
 * of Simultaneous Equations using Gaussian elimination, correlation, and using
 * the Fast Fourier Transform algorithm. The first option requires massive work
 * even for a comparitively small number of samples. In actual practice,
 * correlation is the preferred method if the DFT has less than about 32 points.
 *
 * The function of this module is __really slow__, and not intended to be used
 * in production. It has two goals:
 *
 * - Educational: learn how to implement the DFT correlation algorithm
 * - Testing: test more complex algorithms against this to check outputs
 *
 * This is part of [dsp-kit](https://github.com/oramics/dsp-kit)
 *
 * @example
 * // using dsp-kit
 * var dsp = require('dsp-kit')
 * dsp.dft('forward', signal)
 * dsp.dft('inverse', complexSignal)
 *
 * @example
 * // requiring only this module
 * var dft = require('dsp-dft')
 * dft.dft('forward', signal)
 *
 * @module dft
 */
const { sin, cos, PI } = Math

/**
 * Perform a DFT using a _brute force_ correlation algorithm
 *
 * It accepts real and complex signals of any size.
 *
 * It implements the mathematical function as it, without any kind of optimization,
 * so it's the slowest algorithm possible.
 *
 * This algorithm is not intended to be used in production. It's main use
 * (apart from the educational purposes) is to check the output of more
 * complex algorithms
 *
 * @param {String} direction - Can be 'forward' or 'inverse'
 * @param {Array|Object} signal - The (real) signal array, or the complex signal
 * object `{ imag, real }`
 * @param {Object} output - (Optional) the pair of buffers `{ imag, real }` to
 * store the output (or new buffers are created if not provided)
 * @return {Object} the DFT output
 *
 * @example
 * dft('forward', signal)
 * dft('inverse', { real: ..., imag: .... })
 */
export function dft (dir, signal, output) {
  if (dir !== 'forward' && dir !== 'inverse') throw Error('Direction must be "forward" or "inverse" but was ' + dir)
  var inverse = dir === 'inverse'
  signal = toComplex(signal)
  output = toComplex(output, signal.real.length)
  process(inverse, signal, output)
  return output
}

/**
 * Perform the actual DFT correlation
 *
 * @private
 * @param {Boolean} inverse - Perform inverse DFT or not
 * @param {Object} signal - A complex ({ real, imag }) input signal
 * @param {Object} output - The output ({ real, imag }) output signal
 * @return {Object} the output
 */
function process (inverse, signal, output) {
  let r, i, theta
  const { real, imag } = signal
  // we take the size of the output. It can be smaller than the source
  const size = output.real.length
  for (let k = 0; k < size; k++) {
    r = i = 0.0
    for (let n = 0; n < size; n++) {
      theta = 2 * PI * k * n / size
      r += real[n] * cos(theta) - imag[n] * sin(theta)
      i -= real[n] * sin(theta) + imag[n] * cos(theta)
    }
    output.real[k] = inverse ? r / size : r
    output.imag[k] = inverse ? i / size : i
  }
}

/**
 * Given a signal or a size, create a complex signal.
 * @private
 */
function toComplex (signal, size) {
  if (!signal) {
    if (!size) throw Error('A signal is required')
    return { real: new Float32Array(size), imag: new Float32Array(size) }
  } else if (signal.length) {
    return { real: signal, imag: new Float32Array(signal.length) }
  } else if (!signal.real || !signal.imag || signal.real.length !== signal.imag.length) {
    throw Error('Not valid signal: ' + signal + ' (must be an object { real: Array, imag: Array })')
  } else {
    return signal
  }
}
