import test from 'node:test';
import assert from 'node:assert/strict';
import { Colors } from '../constants/Colors.js';

test('light theme background color', () => {
  assert.strictEqual(Colors.light.background, '#fff');
});

