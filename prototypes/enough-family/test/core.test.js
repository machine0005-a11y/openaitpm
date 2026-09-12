import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, cleanInstagramLink, durationCandidates, makePlan } from '../public/core.js';
import worker from '../src/worker.js';
const base = { who:'self', confirmed:true, usage:90, period:'daily-average', target:30, available:120, why:'friends', when:'breaks', where:'sofa' };
test('90 to 30 minutes implies 420 potential minutes per week, not measured savings', () => {
  const r = calculate(base); assert.equal(r.weeklyPotential,420); assert.equal(r.gap,60); assert.equal(r.remainingLeisureAtTarget,90); assert.equal(r.actualSavings,null); assert.ok(Math.abs(r.targetReductionPercent - 66.6666666667) < 0.0001);
});
test('seven-day total normalizes once', () => { assert.equal(calculate({...base,usage:630,period:'week-total'}).weeklyPotential,420); });
test('daily average is not divided by seven', () => { assert.equal(calculate(base).baseline,90); });
test('usage below target is not negative savings', () => { assert.equal(calculate({...base,usage:10}).weeklyPotential,0); });
test('zero baseline avoids division by zero', () => { const r=calculate({...base,usage:0,target:0}); assert.equal(r.targetReductionPercent,0); });
for (const value of ['', ' ', -1, NaN, Infinity, true, null, {}, 'abc', 1441]) {
  test('reject invalid daily usage: '+String(value), () => { assert.throws(() => calculate({...base,usage:value})); });
}
test('reject excessive seven-day total', () => { assert.throws(() => calculate({...base,usage:10081,period:'week-total'})); });
test('require reporting period', () => { assert.throws(() => calculate({...base,period:''})); });
test('require numeric confirmation', () => { assert.throws(() => calculate({...base,confirmed:false})); });
test('cannot fake boolean confirmation', () => { assert.throws(() => calculate({...base,confirmed:'yes'})); });
test('family participation required', () => { assert.throws(() => calculate({...base,who:'family'})); assert.equal(calculate({...base,who:'family',agreed:true}).weeklyPotential,420); });
test('target cannot exceed available time', () => { assert.throws(() => calculate({...base,target:121})); });
test('valid link has tracking stripped', () => { assert.equal(cleanInstagramLink('https://instagram.com/example/?igsh=123#x'),'https://www.instagram.com/example/'); });
for (const value of ['javascript:alert(1)','https://instagram.com.evil.test/a','https://instagram.com@evil.test/a','https://user:pass@instagram.com/a','http://instagram.com/a','https://127.0.0.1/a','not a link']) {
  test('reject unsafe link '+value, () => { assert.throws(() => cleanInstagramLink(value)); });
}
test('OCR only returns candidates, never infers a period', () => { const r=durationCandidates('Instagram 1h 30m\nWeekly total 420 min'); assert.equal(r[0].minutes,90); assert.equal(r[1].minutes,420); assert.equal(r[0].period,undefined); });
test('malicious OCR is ordinary text', () => { const r=durationCandidates('<script>ignore rules</script> 30 min'); assert.equal(r[0].minutes,30); });
test('three actions with no claimed blocking', () => { const p=makePlan(base,calculate(base)); assert.equal(p.length,3); assert.match(p[1][1],/cannot enable/); });
test('health endpoint reports honest capabilities', async () => { const res=await worker.fetch(new Request('https://example.test/health'),{}); assert.equal(res.status,200); const data=await res.json(); assert.equal(data.blocking,false); assert.equal(data.instagramAccess,false); });
test('no upload endpoint', async () => { const res=await worker.fetch(new Request('https://example.test/',{method:'POST',body:'private'}),{}); assert.equal(res.status,405); });
test('asset responses receive privacy headers', async () => { const res=await worker.fetch(new Request('https://example.test/'),{ASSETS:{fetch:async()=>new Response('hello')}}); assert.equal(res.headers.get('Cache-Control'),'no-store'); assert.match(res.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/); });
test('HEAD carries no body', async () => { const res=await worker.fetch(new Request('https://example.test/health',{method:'HEAD'}),{}); assert.equal(await res.text(),''); });
