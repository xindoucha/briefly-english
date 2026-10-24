import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons, sentenceAt, duration, formatTime} from '../src/data.js';
import {readState, writeState, toggleFavorite, emptyState} from '../src/storage.js';

test('course timelines contain every caption, remain ordered, and have matching translations', () => {
  const ids = new Set();
  for (const lesson of lessons) {
    assert.ok(!ids.has(lesson.id)); ids.add(lesson.id);
    assert.ok(duration(lesson) > 0);
    assert.ok(lesson.start >= 0 && lesson.end > lesson.start);
    let previous = lesson.start;
    for (const line of lesson.lines) {
      assert.ok(line.start >= previous, `overlapping caption in ${lesson.id}`);
      assert.ok(line.end > line.start && line.end <= lesson.end);
      assert.ok(line.en && line.zh && line.tip && line.speaker);
      previous = line.end;
    }
    assert.ok(lesson.correct >= 0 && lesson.correct < lesson.options.length);
  }
});
test('caption lookup treats end boundaries as exclusive and allows silence between sentences', () => {
  const lesson = lessons[0];
  assert.equal(sentenceAt(lesson, 0), -1);
  assert.equal(sentenceAt(lesson, 3.29), 0);
  assert.equal(sentenceAt(lesson, 4.59), 1);
  assert.equal(sentenceAt(lesson, lesson.end), -1);
});
test('malformed, unavailable, and unexpected browser storage fall back to a safe empty state', () => {
  for (const raw of ['bad json', 'null', '{"favorites":[],"progress":null}', '{}']) {
    assert.deepEqual(readState({getItem: () => raw}), emptyState());
  }
  assert.deepEqual(readState({getItem: () => {throw new Error('denied');}}), emptyState());
});
test('favorites and progress round-trip without mutation or duplicates', () => {
  const initial = emptyState();
  const next = toggleFavorite(initial, 'opening:line:0');
  assert.deepEqual(initial.favorites, []);
  assert.deepEqual(next.favorites, ['opening:line:0']);
  assert.deepEqual(toggleFavorite(next, 'opening:line:0').favorites, []);
  const storage = new Map();
  const adapter = {getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v)};
  next.progress.opening = {step: 1, line: 2, completed: true};
  next.last = 'opening';
  writeState(adapter, next);
  assert.deepEqual(readState(adapter), next);
});
test('storage write failures reach the caller for a visible error instead of silent loss', () => {
  assert.throws(() => writeState({setItem: () => {throw new Error('quota');}}, emptyState()), /quota/);
});
test('timestamps handle invalid and negative input', () => {
  assert.equal(formatTime(61.9), '1:01');
  assert.equal(formatTime(-12), '0:00');
  assert.equal(formatTime(NaN), '0:00');
});
