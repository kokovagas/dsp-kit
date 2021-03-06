/* eslint-disable one-var */
// import reverseBinPermute from './reverse-permute'
// Ordering of output:
//
// trans[0]     = re[0] (==zero frequency, purely real)
// trans[1]     = re[1]
//             ...
// trans[n/2-1] = re[n/2-1]
// trans[n/2]   = re[n/2]    (==nyquist frequency, purely real)
//
// trans[n/2+1] = im[n/2-1]
// trans[n/2+2] = im[n/2-2]
//             ...
// trans[n-1]   = im[1]
const { sin, cos, PI, SQRT1_2 } = Math

/**
 * Perform FFT using a real split radix FFT algorithm
 *
 * Code adapted from [dsp.js](https://github.com/corbanbrook/dsp.js) by @corbanbrook
 *
 * @private
 */
export default function forward (bufferSize, buffer, trans, spectrum, table) {
  var n = bufferSize,
    x = trans,
    n2, n4, n8, nn,
    t1, t2, t3, t4,
    i1, i2, i3, i4, i5, i6, i7, i8,
    st1, cc1, ss1, cc3, ss3, e, a

  // reverseBinPermute(bufferSize, x, buffer)

  for (var k = 0, len = table.length; k < len; k++) {
    x[k] = buffer[table[k]]
  }

  for (var ix = 0, id = 4; ix < n; id *= 4) {
    for (var i0 = ix; i0 < n; i0 += id) {
      // sumdiff(x[i0], x[i0+1]); // {a, b}  <--| {a+b, a-b}
      st1 = x[i0] - x[i0 + 1]
      x[i0] += x[i0 + 1]
      x[i0 + 1] = st1
    }
    ix = 2 * (id - 1)
  }

  n2 = 2
  nn = n >>> 1

  while ((nn = nn >>> 1)) {
    ix = 0
    n2 = n2 << 1
    id = n2 << 1
    n4 = n2 >>> 2
    n8 = n2 >>> 3
    do {
      if (n4 !== 1) {
        for (i0 = ix; i0 < n; i0 += id) {
          i1 = i0
          i2 = i1 + n4
          i3 = i2 + n4
          i4 = i3 + n4

          // diffsum3_r(x[i3], x[i4], t1); // {a, b, s} <--| {a, b-a, a+b}
          t1 = x[i3] + x[i4]
          x[i4] -= x[i3]
          // sumdiff3(x[i1], t1, x[i3]);   // {a, b, d} <--| {a+b, b, a-b}
          x[i3] = x[i1] - t1
          x[i1] += t1

          i1 += n8
          i2 += n8
          i3 += n8
          i4 += n8

          // sumdiff(x[i3], x[i4], t1, t2); // {s, d}  <--| {a+b, a-b}
          t1 = x[i3] + x[i4]
          t2 = x[i3] - x[i4]

          t1 = -t1 * SQRT1_2
          t2 *= SQRT1_2

          //  sumdiff(t1, x[i2], x[i4], x[i3]); // {s, d}  <--| {a+b, a-b}
          st1 = x[i2]
          x[i4] = t1 + st1
          x[i3] = t1 - st1

          // sumdiff3(x[i1], t2, x[i2]); // {a, b, d} <--| {a+b, b, a-b}
          x[i2] = x[i1] - t2
          x[i1] += t2
        }
      } else {
        for (i0 = ix; i0 < n; i0 += id) {
          i1 = i0
          i2 = i1 + n4
          i3 = i2 + n4
          i4 = i3 + n4

          // diffsum3_r(x[i3], x[i4], t1); // {a, b, s} <--| {a, b-a, a+b}
          t1 = x[i3] + x[i4]
          x[i4] -= x[i3]

          // sumdiff3(x[i1], t1, x[i3]);   // {a, b, d} <--| {a+b, b, a-b}
          x[i3] = x[i1] - t1
          x[i1] += t1
        }
      }

      ix = (id << 1) - n2
      id = id << 2
    } while (ix < n)

    e = 2 * PI / n2

    for (var j = 1; j < n8; j++) {
      a = j * e
      ss1 = sin(a)
      cc1 = cos(a)

      //  ss3 = sin(3*a); cc3 = cos(3*a)
      cc3 = 4 * cc1 * (cc1 * cc1 - 0.75)
      ss3 = 4 * ss1 * (0.75 - ss1 * ss1)

      ix = 0; id = n2 << 1
      do {
        for (i0 = ix; i0 < n; i0 += id) {
          i1 = i0 + j
          i2 = i1 + n4
          i3 = i2 + n4
          i4 = i3 + n4

          i5 = i0 + n4 - j
          i6 = i5 + n4
          i7 = i6 + n4
          i8 = i7 + n4

          //  cmult(c, s, x, y, &u, &v)
          // cmult(cc1, ss1, x[i7], x[i3], t2, t1); // {u,v} <--| {x*c-y*s, x*s+y*c}
          t2 = x[i7] * cc1 - x[i3] * ss1
          t1 = x[i7] * ss1 + x[i3] * cc1

          // cmult(cc3, ss3, x[i8], x[i4], t4, t3)
          t4 = x[i8] * cc3 - x[i4] * ss3
          t3 = x[i8] * ss3 + x[i4] * cc3

          // sumdiff(t2, t4);   // {a, b} <--| {a+b, a-b}
          st1 = t2 - t4
          t2 += t4
          t4 = st1

          // sumdiff(t2, x[i6], x[i8], x[i3]); // {s, d}  <--| {a+b, a-b}
          // st1 = x[i6]; x[i8] = t2 + st1; x[i3] = t2 - st1
          x[i8] = t2 + x[i6]
          x[i3] = t2 - x[i6]

          // sumdiff_r(t1, t3); // {a, b} <--| {a+b, b-a}
          st1 = t3 - t1
          t1 += t3
          t3 = st1

          // sumdiff(t3, x[i2], x[i4], x[i7]); // {s, d}  <--| {a+b, a-b}
          // st1 = x[i2]; x[i4] = t3 + st1; x[i7] = t3 - st1
          x[i4] = t3 + x[i2]
          x[i7] = t3 - x[i2]

          // sumdiff3(x[i1], t1, x[i6]);   // {a, b, d} <--| {a+b, b, a-b}
          x[i6] = x[i1] - t1
          x[i1] += t1

          // diffsum3_r(t4, x[i5], x[i2]); // {a, b, s} <--| {a, b-a, a+b}
          x[i2] = t4 + x[i5]
          x[i5] -= t4
        }

        ix = (id << 1) - n2
        id = id << 2
      } while (ix < n)
    }
  }

  return spectrum
}

// lookup tables don't really gain us any speed, but they do increase
// cache footprint, so don't use them in here
// the rest was translated from C, see http://www.jjj.de/fxt/
// is the real split radix FFT
