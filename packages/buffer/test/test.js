/* eslint-disable comma-spacing */
const test = require('tst')
const assert = require('assert')
const buffer = require('..')

const from = (x) => Float64Array.from(x || [])

test('zeros', () => {
  const zeros = buffer.zeros(10)
  assert.equal(zeros.length, 10)
  assert.deepEqual(zeros, from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))
})

test('window', () => {
  var signal = buffer.generate(1024, (n) => 1)
  var hamming = buffer.generate(100, (n, N) => 0.54 - 0.46 * Math.cos(2 * Math.PI * n / (N - 1)))
  var windowed = buffer.window(hamming, signal)
  assert.deepEqual(windowed, hamming)
})

test('concat', () => {
  const ones = buffer.generate(5, (x) => 1)
  const twos = buffer.generate(5, (x) => 2)
  assert.deepEqual(buffer.concat(ones, twos), from([1, 1, 1, 1, 1, 2, 2, 2, 2, 2]))
})

test('generate', function () {
  const zeros = buffer.generate(100, (x) => 0)
  assert.deepStrictEqual(zeros, buffer.zeros(100))
  const ones = buffer.generate(10, (x) => 1)
  assert.deepEqual(ones, from([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]))
  const indices = buffer.generate(10, (n, N) => n)
  assert.deepEqual(indices, from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))
  const lens = buffer.generate(10, (n, N) => N)
  assert.deepEqual(lens, from([10, 10, 10, 10, 10, 10, 10, 10, 10, 10]))
})

test('generate sine', function () {
  const PI = Math.PI
  const sine32 = buffer.generate(new Float32Array(10), (n, N) => Math.sin(2 * PI * n / (N - 1)))
  assert.deepEqual(sine32, from([
    0, 0.6427876353263855, 0.9848077297210693, 0.8660253882408142, 0.3420201539993286, -0.3420201539993286, -0.8660253882408142, -0.9848077297210693, -0.6427876353263855, -2.4492937051703357e-16
  ]))
  const sine64 = buffer.generate(new Float64Array(10), (n, N) => Math.sin(2 * PI * n / (N - 1)))
  assert.deepEqual(sine64, from([
    0, 0.6427876096865393, 0.984807753012208, 0.8660254037844387, 0.3420201433256689, -0.34202014332566866, -0.8660254037844385, -0.9848077530122081, -0.6427876096865396, -2.4492935982947064e-16
  ]))
})

test('copy', function () {
  const ones = buffer.generate(100, (x) => 1)
  assert.deepEqual(buffer.copy(ones), ones)
})

test('copy to buffer', function () {
  const ones = buffer.generate(100, (x) => 1)
  const result = buffer.zeros(100)
  buffer.copy(ones, result)
  assert.deepEqual(result, ones)
})

test('copy with offsets', function () {
  const ones = buffer.generate(50, (x) => 1)
  const twos = buffer.add(ones, ones)
  const source = buffer.concat(ones, twos)
  const result = buffer.copy(source, 100, 50, 50)
  assert.equal(result.length, 100)
  const check = buffer.concat(buffer.zeros(50), twos)
  assert.deepEqual(result, check)
})

test('add', function () {
  const ones = buffer.generate(100, (x) => 1)
  const sum = buffer.add(ones, ones)
  assert.deepEqual(sum, buffer.generate(100, (x) => 2))
})

test('add to a buffer', function () {
  const ones = buffer.generate(100, (x) => 1)
  const result = buffer.zeros(100)
  buffer.add(ones, ones, result)
  assert.deepEqual(result, buffer.generate(100, (x) => 2))
})

test('round', function () {
  const signal = buffer.generate(10, (n, N) => Math.sin(2 * Math.PI * n / (N - 1)))
  assert.deepEqual(buffer.round(signal, 2), from([0,0.64,0.98,0.87,0.34,-0.34,-0.87,-0.98,-0.64,0]))
  assert.deepEqual(buffer.round(signal, 3), from([0,0.643,0.985,0.866,0.342,-0.342,-0.866,-0.985,-0.643,0]))
})
