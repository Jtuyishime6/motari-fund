import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normPhone, toInt, cleanText, isUuid, isPhotoUrl, projectReturn, MIN_PLEDGE } from '../../shared/rules.js';

test('normPhone accepts MTN and Airtel numbers in local and international form', () => {
  assert.equal(normPhone('0788123456'), '0788123456');
  assert.equal(normPhone('+250 788 123 456'), '0788123456');
  assert.equal(normPhone('250728123456'), '0728123456');
  assert.equal(normPhone('0731234567'), '0731234567');
});

test('normPhone rejects numbers outside Rwandan mobile ranges', () => {
  for (const bad of ['0748123456', '078812345', '07881234567', '', null, 'abc']) assert.equal(normPhone(bad), null, String(bad));
});

test('toInt treats blanks and decimals as missing', () => {
  assert.equal(toInt('25000'), 25000);
  assert.equal(toInt(0), 0);
  assert.ok(Number.isNaN(toInt('')));
  assert.ok(Number.isNaN(toInt(undefined)));
  assert.ok(Number.isNaN(toInt('12.5')));
});

test('cleanText trims and caps length', () => {
  assert.equal(cleanText('  Kigali  '), 'Kigali');
  assert.equal(cleanText('x'.repeat(100), 10).length, 10);
  assert.equal(cleanText(null), '');
});

test('isUuid and isPhotoUrl guard what reaches the database', () => {
  assert.ok(isUuid('3f2b8a2e-6f0e-4b2a-9c1d-1a2b3c4d5e6f'));
  assert.ok(!isUuid('1; drop table pledges'));
  assert.ok(isPhotoUrl('/images/OIP (1).webp'));
  assert.ok(isPhotoUrl('https://cdn.example.com/bike.png'));
  assert.ok(!isPhotoUrl('javascript:alert(1)'));
  assert.ok(!isPhotoUrl('http://insecure.example.com/a.png'));
});

test('projectReturn matches the published 65% projection', () => {
  assert.deepEqual(projectReturn(100000), { total: 165000, profit: 65000, monthly: 6875 });
  assert.equal(projectReturn(MIN_PLEDGE).total, 16500);
});
