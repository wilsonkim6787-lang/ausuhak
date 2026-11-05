// @ts-nocheck
"use client";
/* eslint-disable */
// Generated from UcatMock.dc.html by tools/dc2tsx.py. Edit the generator input, not this file, for layout changes.
import { Fragment } from "react";
import { DCLogic, css } from "@/lib/dc";

var MOCK_SRC = {"MOCK-01": "/api/content/6f315da3d17ce6f0f9ca1d3bb4590264", "MOCK-02": "/api/content/a06b579ab4ad979c8d9ecdf743500a5b", "MOCK-03": "/api/content/a49cdddf9bdbbc00ffd2882d2c461421", "MOCK-04": "/api/content/46586a4bfa7d00c653a15dcf0115adc8", "MOCK-05": "/api/content/9cb26636205971528fd1ba7626de0ff8", "MOCK-06": "/api/content/f20396ae9084d635f10d7324118cb9c1", "MOCK-07": "/api/content/5c5c489183b8bf5c9e234c13ce1dd91a", "MOCK-08": "/api/content/ced6c6e91607a79e8c03dff3fd54dbab", "MOCK-09": "/api/content/09cc0704403b4c0d18810b3ad518396f", "MOCK-10": "/api/content/53a5400f2024cd969345bfbdf007a18f"};
var MOCK_IDS = ["MOCK-01", "MOCK-02", "MOCK-03", "MOCK-04", "MOCK-05", "MOCK-06", "MOCK-07", "MOCK-08", "MOCK-09", "MOCK-10"];
var FREE_MOCKS = { "MOCK-01": true };
var SECS = [
  { code: 'VR', name: '언어추론 (Verbal Reasoning)', n: 44, instr: 90, sec: 1320, calc: false, guide: '지문 11개에 4문항씩입니다. 참/거짓/판단불가 문항은 지문에 적힌 내용만으로 판단하세요. 상식으로 채우면 틀립니다.', guideEn: 'Read each passage and answer the questions using only the information given.' },
  { code: 'DM', name: '의사결정 (Decision Making)', n: 35, instr: 90, sec: 2220, calc: true, guide: '논리 퍼즐, 삼단논법, 정보 해석, 가장 강한 논거, 벤 다이어그램, 확률 문항입니다. Yes/No 다섯 진술 문항은 진술마다 따로 판단하세요. 계산기를 쓸 수 있습니다.', guideEn: 'Some questions ask you to place Yes or No against five statements.' },
  { code: 'QR', name: '수리추론 (Quantitative Reasoning)', n: 36, instr: 120, sec: 1560, calc: true, guide: '표와 그래프 자료에 4문항씩 딸린 세트가 대부분입니다. 화면 계산기를 쓸 수 있지만, 어림으로 보기를 줄이면 훨씬 빠릅니다.', guideEn: 'An on-screen calculator is available for this subtest.' },
  { code: 'SJT', name: '상황판단 (Situational Judgement)', n: 69, instr: 90, sec: 1560, calc: false, guide: '의대생·의료진이 겪는 상황에서 각 대응이 얼마나 적절한지, 각 고려 사항이 얼마나 중요한지 평가합니다. 정직, 환자 안전, 비밀 유지, 팀워크, 능력 범위 안에서 행동하기가 기준입니다.', guideEn: 'Rate the appropriateness or importance of each response or consideration.' }
];
var KNOTS = {"VR":[[0.1,345],[1,410],[5,469],[10,510],[20,550],[30,570],[40,600],[50,610],[60,630],[70,660],[80,680],[90,730],[95,751],[99,810],[99.9,875],[100,900]],"DM":[[0.1,361],[1,432],[5,496],[10,530],[20,570],[30,610],[40,630],[50,650],[60,680],[70,710],[80,740],[90,770],[95,804],[99,868],[99.9,900],[100,900]],"QR":[[0.1,300],[1,362],[5,455],[10,530],[20,580],[30,610],[40,640],[50,680],[60,710],[70,760],[80,820],[90,880],[95,900],[99,900],[99.9,900],[100,900]],"SJT":[[0.1,374],[1,427],[5,475],[10,486],[20,525],[30,550],[40,570],[50,589],[60,607],[70,621],[80,640],[90,664],[95,703],[99,751],[99.9,804],[100,900]],"Total":[[0.1,1070],[1,1287],[5,1482],[10,1610],[20,1720],[30,1800],[40,1880],[50,1950],[60,2040],[70,2120],[80,2220],[90,2340],[95,2418],[99,2613],[99.9,2700],[100,2700]]};
var RAW = { VR: [58, 13], DM: [62, 13], QR: [60, 15], SJT: [72, 8] };
var HALF = { VR: 6, DM: 6, QR: 6, SJT: 5 };
var MEDIAN26 = { VR: 610, DM: 650, QR: 680, SJT: 589 };
var SECL = { VR: '언어추론 (VR)', DM: '의사결정 (DM)', QR: '수리추론 (QR)', SJT: '상황판단 (SJT)' };
var DIFFL = ['', '쉬움', '보통', '어려움'];
var UNI_USE = ["UCAT 필수: UQ(ISAT 불인정), Adelaide(인터뷰 초청을 UCAT으로만 결정), Newcastle·UNE JMP, Auckland 1학년 입학, Curtin(공식 FAQ 기준 모든 지원자)", "UCAT 또는 ISAT 중 선택: UNSW (UCAT 50백분위 이상 또는 ISAT 165 이상)", "유학생은 ISAT 사용: Monash, UWA, WSU · 시험 없음: Flinders 유학생", "SJT 반영: Auckland·Otago는 4영역 모두, Monash·Adelaide는 동점자 구분용, UNSW·Curtin은 미반영", "시민권·영주권자는 국내생 기준(UCAT)으로 지원합니다. 같은 대학이라도 국내생과 유학생 기준이 다릅니다."];
var CAVEAT = "추정 점수는 UCAT ANZ 공식 환산이 아닙니다. 2026년 공식 분위수 표와 응시자 원점수 분포에 대한 가정으로 만든 범위이며, 우리 모의고사는 실제 시험과 동등화되지 않은 창작 문항입니다. 범위로만 보시고, 응시 데이터가 쌓이면 다시 보정합니다. 대학 기준은 2026~2027 입학 공식 발표 기준이며, 공식이 아닌 수치는 따로 표시했습니다.";

function erf(x) { var s = x < 0 ? -1 : 1; x = Math.abs(x); var t = 1 / (1 + 0.3275911 * x); var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; }
function phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
function interp(kn, p) { if (p <= kn[0][0]) return kn[0][1]; for (var i = 1; i < kn.length; i++) { if (p <= kn[i][0]) { var a = kn[i - 1], b = kn[i]; return a[1] + (b[1] - a[1]) * (p - a[0]) / (b[0] - a[0]); } } return kn[kn.length - 1][1]; }
function inv(kn, v) { if (v <= kn[0][1]) return kn[0][0]; for (var i = 1; i < kn.length; i++) { if (v <= kn[i][1]) { var a = kn[i - 1], b = kn[i]; if (b[1] === a[1]) return a[0]; return a[0] + (b[0] - a[0]) * (v - a[1]) / (b[1] - a[1]); } } return 100; }
function pctileOf(sec, rawPct) { var r = RAW[sec]; return Math.max(0.1, Math.min(99.9, phi((rawPct - r[0]) / r[1]) * 100)); }
function scaled(sec, rawPct) { return interp(KNOTS[sec], pctileOf(sec, rawPct)); }
function r10(v) { return Math.round(v / 10) * 10; }
function estSec(sec, rawPct) { var h = HALF[sec]; var mid = scaled(sec, rawPct), lo = scaled(sec, Math.max(0, rawPct - h)), hi = scaled(sec, Math.min(100, rawPct + h)); return { mid: r10(mid), lo: r10(Math.max(300, lo)), hi: r10(Math.min(900, hi)), pctile: Math.round(pctileOf(sec, rawPct)), raw: rawPct }; }
function fmtClock(s) { s = Math.max(0, Math.floor(s)); var m = Math.floor(s / 60), x = s % 60; return m + ':' + (x < 10 ? '0' : '') + x; }
function fmtMin(s) { s = Math.round(s || 0); if (s < 60) return s + '초'; var m = Math.floor(s / 60), x = s % 60; return m + '분' + (x ? ' ' + x + '초' : ''); }
function lsGet(k, d) { try { var v = window.localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function lsSet(k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

function itemMax(it) { return it.format === 'yesno5' ? 2 : 1; }
function itemScore(it, a) {
  if (a === undefined || a === null) return 0;
  var f = it.format;
  if (f === 'yesno5') { var k = it.yesNoKey || [], c = 0; for (var i = 0; i < 5; i++) if (a[i] && a[i] === k[i]) c++; return c === 5 ? 2 : c === 4 ? 1 : 0; }
  if (f === 'sjt-mostleast') { var mk = it.mostLeastKey || {}, s = 0; if (a.most && a.most === mk.most) s += 0.5; if (a.least && a.least === mk.least) s += 0.5; return s; }
  if (f === 'sjt-appropriateness' || f === 'sjt-importance') { var d = Math.abs('ABCD'.indexOf(a) - 'ABCD'.indexOf(it.answer)); return d === 0 ? 1 : d === 1 ? 0.5 : 0; }
  return a === it.answer ? 1 : 0;
}
function isAnswered(it, a) {
  if (a === undefined || a === null) return false;
  if (it.format === 'yesno5') { for (var i = 0; i < 5; i++) if (!a[i]) return false; return true; }
  if (it.format === 'sjt-mostleast') return !!(a.most && a.least);
  return !!a;
}

function scoreMock(items, answers, spent, secUsed) {
  var sec = {}, types = {}, blank = 0;
  SECS.forEach(function (s) { sec[s.code] = { got: 0, max: 0, time: 0 }; });
  items.forEach(function (it) {
    var a = answers[it.id], g = itemScore(it, a), mx = itemMax(it), S = sec[it.subtest];
    if (!S) return;
    S.got += g; S.max += mx; S.time += (spent && spent[it.id]) || 0;
    if (!isAnswered(it, a)) blank++;
    var tk = it.subtest + '|' + it.type; if (!types[tk]) types[tk] = { sec: it.subtest, label: it.type, got: 0, max: 0 }; types[tk].got += g; types[tk].max += mx;
  });
  var est = {};
  ['VR', 'DM', 'QR', 'SJT'].forEach(function (k) { var S = sec[k]; est[k] = estSec(k, S.max ? S.got / S.max * 100 : 0); });
  var tm = est.VR.mid + est.DM.mid + est.QR.mid;
  var hw = Math.sqrt(['VR', 'DM', 'QR'].reduce(function (acc, k) { var h = (est[k].hi - est[k].lo) / 2; return acc + h * h; }, 0));
  var tot = { mid: tm, lo: Math.max(900, r10(tm - hw)), hi: Math.min(2700, r10(tm + hw)), pctile: Math.round(inv(KNOTS.Total, tm)) };
  return { at: Date.now(), sec: sec, est: est, tot: tot, types: types, blank: blank, secUsed: secUsed || {} };
}

function lv(e, cut) { return e.lo >= cut ? 3 : e.mid >= cut ? 2 : e.hi >= cut ? 1 : 0; }
var LV = [
  { t: '아직 부족', chip: 'background: #FBF1F3; color: #6E1F2D' },
  { t: '도전권', chip: 'background: #F2D9DE; color: #6E1F2D' },
  { t: '가능권', chip: 'background: #F3F3F1; color: #454B55' },
  { t: '안정권', chip: 'background: #E2F0EB; color: #0A5546' }
];
function uniRows(R) {
  var t = R.tot, rows = [], p50 = 1950;
  var u = lv(t, p50);
  rows.push({ name: 'UNSW 의대 (국내생·유학생 공통 최저)', rule: '공식 · 총점 50백분위 이상 (2026 기준 약 1950), SJT 미반영 · 유학생은 ISAT 165로 대신 가능', lv: u, comment: u >= 2 ? '최저 기준은 넘는 범위입니다. 최저선을 넘은 뒤에는 학업 성적과 함께 순위를 매겨 약 300명을 인터뷰에 부르므로 높을수록 유리합니다.' : '50백분위(약 1950)에 아직 못 미치거나 걸쳐 있습니다. 유학생이라면 ISAT 165를 대안으로 함께 준비할 만합니다.' });
  var q = lv(t, 2290);
  rows.push({ name: 'UQ 의대 (조건부 입학)', rule: '공식 · 2026 입학 국내생 일반 인터뷰 최저 2290 (농촌 1960) · 유학생은 UCAT 필수, ISAT 불인정, 컷 미공개', lv: q, comment: '유학생 컷은 공개되지 않아 국내생 일반 최저 2290을 참고선으로 씁니다. ' + (q >= 2 ? '현재 범위는 그 위쪽입니다.' : q === 1 ? '범위 상단에서만 닿습니다.' : '아직 거리가 있습니다.') + ' 유학생 정원은 약 100명입니다.' });
  var m = lv(t, 2380);
  rows.push({ name: 'Monash 의대 (국내생 전용)', rule: '공식 · 2026 입학 빅토리아 일반 인터뷰 컷 2380 (94백분위), 농촌 2050 · 유학생은 ISAT 사용', lv: m, comment: '시민권·영주권자에게만 해당합니다. ' + (m >= 2 ? '일반 전형 컷 근처 이상입니다.' : '일반 전형 컷 2380은 상위 6% 수준이라 현재 범위로는 ' + (m === 1 ? '도전권입니다.' : '어렵습니다.')) });
  var j = lv(t, 2510);
  rows.push({ name: 'Newcastle·UNE JMP', rule: '비공식 · 2026 입학 일반 2510 (98백분위, 사설 기관 보도) · 유학생도 UCAT 필수, 유학생 최저선은 매년 따로 결정', lv: j, comment: '공식 수치가 아니므로 참고만 하세요. 국내생 경쟁은 최상위권에서 갈리며, 유학생 기준은 해마다 달라 지원 전 확인이 필요합니다.' });
  var ad = t.mid >= 2220 ? 3 : t.mid >= 2040 ? 2 : t.mid >= 1880 ? 1 : 0;
  rows.push({ name: 'Adelaide 의대·치대', rule: '공식 · 유학생 포함 UCAT 필수, 인터뷰 초청은 UCAT으로만 결정 (유학생 약 160명 초청), 컷 미공개', lv: ad, neutral: true, comment: '공개 컷이 없어 점수가 높을수록 유리하다는 것만 확실합니다. 현재 추정은 2026년 응시자 중 약 ' + t.pctile + '백분위입니다. SJT는 동점자 구분에만 씁니다.' });
  var cu = t.mid >= 2120 ? 3 : t.mid >= 1950 ? 2 : t.mid >= 1800 ? 1 : 0;
  rows.push({ name: 'Curtin 의대', rule: '공식 · UCAT과 Casper 모두 필수, 인터뷰 순위는 성적 35 : Casper 35 : UCAT 30 (총점 2700 기준, SJT 미반영), 컷 미공개', lv: cu, neutral: true, comment: 'UCAT 비중이 30%라 성적과 Casper로 보완할 여지가 있습니다. 2027 유학생 안내서는 아직 확인되지 않았습니다.' });
  var sj = R.est.SJT;
  var ak = sj.mid >= 630 ? 3 : sj.mid >= 589 ? 2 : sj.mid >= 539 ? 1 : 0;
  rows.push({ name: 'Auckland·Otago 의대 (SJT 포함 4영역)', rule: '공식 · 4개 영역 점수를 모두 반영 (Auckland 최종 순위의 15%), Auckland 유학생 1학년 입학도 UCAT 필수', lv: ak, neutral: true, comment: '이 두 대학은 SJT까지 점수에 들어갑니다. 현재 SJT 추정 ' + sj.lo + '~' + sj.hi + '점은 2026 중앙값 589 대비 ' + (sj.mid >= 589 ? '위쪽입니다.' : '아래쪽이라 보강이 필요합니다.') });
  return rows;
}
function comments(R) {
  var out = [], t = R.tot, e = R.est;
  out.push('인지 영역 총점 추정 ' + t.lo + '~' + t.hi + '점(중앙값 ' + t.mid + '), 2026년 응시자 중 약 ' + t.pctile + '백분위입니다.');
  var arr = ['VR', 'DM', 'QR'].map(function (k) { return [k, e[k].pctile]; }).sort(function (a, b) { return a[1] - b[1]; });
  out.push('가장 약한 영역은 ' + SECL[arr[0][0]] + '(약 ' + arr[0][1] + '백분위), 가장 강한 영역은 ' + SECL[arr[2][0]] + '(약 ' + arr[2][1] + '백분위)입니다. 총점으로 보는 대학이 많아 약한 영역 하나를 끌어올리는 것이 가장 효율적입니다.');
  var next = [1950, 2290, 2380, 2510].filter(function (c) { return c > t.mid; })[0];
  if (next) out.push('다음 목표선은 총점 ' + next + '점(' + (next === 1950 ? 'UNSW 최저 50백분위' : next === 2290 ? 'UQ 국내 일반 참고선' : next === 2380 ? 'Monash 국내 일반 컷' : 'JMP 비공식 보도치') + ')입니다. 영역당 약 ' + Math.ceil((next - t.mid) / 3 / 10) * 10 + '점씩 올리면 닿습니다.');
  out.push('SJT 추정 ' + e.SJT.lo + '~' + e.SJT.hi + '점입니다. UNSW·Curtin은 SJT를 보지 않고, Auckland·Otago는 점수에 넣습니다. 지원 대학에 맞춰 비중을 정하세요.');
  return out;
}

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { view: 'lobby', mock: null, cache: {}, loading: false, loadErr: false, idx: 0, now: Date.now(), endOpen: false, revSec: 'VR', revFilter: 'all', calc: '', sessions: lsGet('ucat-sessions', {}), results: lsGet('ucat-results', {}), admin: false, owned: {}, pay: null };
    this.enterAt = Date.now();
  }
  componentDidMount() {
    var self = this;
    fetch('/api/pay/status').then(function (r) { return r.json(); }).then(function (s) { self.setState({ admin: !!s.admin, owned: (s.owned || {})['ucat'] || {}, pay: s }); }).catch(function () {});
        this.timer = setInterval(function () {
      var S = self.state; if (S.view !== 'exam' && S.view !== 'intro') return;
      var s = S.sessions[S.mock]; if (!s) return;
      var now = Date.now();
      if (S.view === 'intro' && now >= s.introEnd) { self.beginSection(); return; }
      if (S.view === 'exam' && now >= s.deadline) { self.endSection(true); return; }
      self.setState({ now: now });
    }, 1000);
  }
  componentWillUnmount() { if (this.timer) clearInterval(this.timer); }
  items(id) { return this.state.cache[id || this.state.mock] || []; }
  secItems(code) { return this.items().filter(function (it) { return it.subtest === code; }); }
  load(id, cb) {
    var self = this;
    if (this.state.cache[id]) { cb(); return; }
    if (!MOCK_SRC[id]) { this.setState({ loadErr: true, view: 'lobby' }); return; }
    this.setState({ loading: true, loadErr: false });
    fetch(MOCK_SRC[id]).then(function (r) { return r.json(); }).then(function (d) {
      var order = { VR: 0, DM: 1, QR: 2, SJT: 3 };
      var c = Object.assign({}, self.state.cache); c[id] = (d.items || []).slice().sort(function (a, b) { return (order[a.subtest] - order[b.subtest]) || (a.order - b.order); }); if (FREE_MOCKS[id] && !self.state.admin && !(self.state.owned || {})[id]) c[id] = c[id].slice(0, 5);
      self.setState({ cache: c, loading: false }); cb();
    }).catch(function () { self.setState({ loading: false, loadErr: true, view: 'lobby' }); });
  }
  save(ss) { lsSet('ucat-sessions', ss); }
  patch(fn) { var S = this.state, ss = Object.assign({}, S.sessions), s = Object.assign({}, ss[S.mock]); fn(s); ss[S.mock] = s; this.save(ss); this.setState({ sessions: ss }); return ss; }
  logTime() {
    var S = this.state; if (S.view !== 'exam') return;
    var list = this.secItems(SECS[S.sessions[S.mock].sec].code), it = list[S.idx];
    if (!it) return;
    var add = Math.min(1200, (Date.now() - this.enterAt) / 1000); this.enterAt = Date.now();
    var ss = Object.assign({}, S.sessions), s = Object.assign({}, ss[S.mock]); s.spent = Object.assign({}, s.spent || {}); s.spent[it.id] = (s.spent[it.id] || 0) + add; ss[S.mock] = s; this.save(ss); this.state.sessions = ss;
  }
  start(id) {
    var self = this;
    this.load(id, function () {
      var ss = Object.assign({}, self.state.sessions), s = ss[id];
      if (!s || s.done) { s = { answers: {}, flags: {}, spent: {}, secUsed: {}, sec: 0, phase: 'intro', introEnd: Date.now() + SECS[0].instr * 1000, startedAt: Date.now(), done: false }; ss[id] = s; }
      self.save(ss);
      if (s.phase === 'intro') self.setState({ sessions: ss, mock: id, view: 'intro', idx: 0, now: Date.now(), endOpen: false, calc: '' });
      else { self.enterAt = Date.now(); self.setState({ sessions: ss, mock: id, view: 'exam', idx: s.lastIdx || 0, now: Date.now(), endOpen: false, calc: '' }); }
    });
  }
  beginSection() {
    var S = this.state, sec = SECS[S.sessions[S.mock].sec];
    this.patch(function (s) { s.phase = 'exam'; s.secStart = Date.now(); s.deadline = Date.now() + sec.sec * 1000; s.lastIdx = 0; });
    this.enterAt = Date.now();
    this.setState({ view: 'exam', idx: 0, now: Date.now(), calc: '' });
  }
  endSection(auto) {
    this.logTime();
    var S = this.state, cur = S.sessions[S.mock], code = SECS[cur.sec].code;
    var used = Math.min(SECS[cur.sec].sec, (Date.now() - (cur.secStart || Date.now())) / 1000);
    if (FREE_MOCKS[S.mock] && !S.admin && !(S.owned || {})[S.mock]) { this.patch(function (s) { s.done = true; s.result = null; s.phase = 'done'; }); this.setState({ view: 'review', revSec: 'VR', revFilter: 'all', idx: 0, endOpen: false }); return; }
    if (cur.sec >= SECS.length - 1) {
      var self = this;
      this.patch(function (s) { s.secUsed = Object.assign({}, s.secUsed); s.secUsed[code] = used; });
      var s2 = this.state.sessions[S.mock];
      var R = scoreMock(this.items(), s2.answers || {}, s2.spent || {}, s2.secUsed);
      var res = Object.assign({}, S.results); res[S.mock] = (res[S.mock] || []).concat([{ at: R.at, tot: R.tot, sjt: R.est.SJT }]);
      lsSet('ucat-results', res);
      this.patch(function (s) { s.done = true; s.result = R; s.phase = 'done'; });
      this.setState({ view: 'result', endOpen: false, results: res });
      return;
    }
    var nx = cur.sec + 1;
    this.patch(function (s) { s.secUsed = Object.assign({}, s.secUsed); s.secUsed[code] = used; s.sec = nx; s.phase = 'intro'; s.introEnd = Date.now() + SECS[nx].instr * 1000; });
    this.setState({ view: 'intro', idx: 0, endOpen: false, calc: '' });
  }
  go(i) { var n = this.secItems(SECS[this.state.sessions[this.state.mock].sec].code).length; if (i < 0 || i >= n) return; this.logTime(); this.patch(function (s) { s.lastIdx = i; }); this.setState({ idx: i, endOpen: false }); }
  press(k) {
    var c = this.state.calc || '';
    if (c === 'Error') c = '';
    if (k === 'C') c = ''; else if (k === '⌫') c = c.slice(0, -1);
    else if (k === '=') { try { if (/^[0-9+\-*/.() ]+$/.test(c) && c) { var v = Function('"use strict";return (' + c + ')')(); c = isFinite(v) ? String(Math.round(v * 1e8) / 1e8) : 'Error'; } } catch (e) { c = 'Error'; } }
    else if (k === '√') { var x = parseFloat(c); c = isNaN(x) || x < 0 ? 'Error' : String(Math.round(Math.sqrt(x) * 1e8) / 1e8); }
    else if (k === '%') { var y = parseFloat(c); c = isNaN(y) ? c : String(y / 100); }
    else c += ({ '×': '*', '÷': '/', '−': '-' })[k] || k;
    this.setState({ calc: c.slice(0, 32) });
  }
  renderVals() {
    var self = this, S = this.state, sessions = S.sessions || {}, results = S.results || {};
    var mocks = MOCK_IDS.map(function (id, i) {
      var s = sessions[id], ready = !!MOCK_SRC[id], open = ready && (S.admin || FREE_MOCKS[id] || (S.owned || {})[id]), hist = results[id] || [], last = hist[hist.length - 1];
      var inProg = s && !s.done;
      return {
        title: 'UCAT 모의고사 ' + (i + 1) + '회', tag: FREE_MOCKS[id] ? '맛보기 5문항' : (i < 2 ? '진단' : '실전'), tagStyle: FREE_MOCKS[id] ? 'background: #E2F0EB; color: #0A5546' : 'background: #F3F3F1; color: #454B55',
        desc: i < 2 ? '진단용 · 쉬운 문항 비중이 조금 높아 첫 응시에 적합' : '실전형 · 실제 시험 난이도 배분',
        last: last ? '최근 결과 총점 ' + last.tot.lo + '~' + last.tot.hi + ' (응시 ' + hist.length + '회)' : (inProg ? '진행 중 · ' + SECS[s.sec].code + ' 영역' : ''),
        canStart: !!open, startLabel: inProg ? '이어 풀기' : (last ? '다시 응시' : '시작하기'), locked: ready && (!open || (!!FREE_MOCKS[id] && !S.admin && !(S.owned || {})[id])), buy: function () { if (window.ausuhakBuy) window.ausuhakBuy('ucat', id); else location.href = '/medical/services'; }, buyLabel: S.pay && S.pay.payEnabled ? '30,000원에 전체 풀기' : '세트당 30,000원', soon: !ready, hasResult: !!(s && s.done && s.result),
        start: function () { self.start(id); }, showResult: function () { self.load(id, function () { self.setState({ mock: id, view: 'result' }); }); }
      };
    });
    var sess = S.mock ? sessions[S.mock] : null, mockNo = S.mock ? MOCK_IDS.indexOf(S.mock) + 1 : 0;
    var base = {
      isLobby: S.view === 'lobby' && !S.loading, isLoading: S.loading, isIntro: S.view === 'intro' && !S.loading, inExam: S.view === 'exam' && !S.loading, notExam: S.view !== 'exam' && S.view !== 'intro',
      isReview: S.view === 'review' && !S.loading, isResult: S.view === 'result' && !S.loading, showPaper: (S.view === 'exam' || S.view === 'review') && !S.loading,
      mocks: mocks, secInfo: SECS.map(function (s) { return { code: s.code, n: s.n, name: s.name.split(' (')[0], min: Math.round(s.sec / 60) }; }), uniUse: UNI_USE, caveat: CAVEAT, loadErr: S.loadErr, admin: S.admin,
      toggleAdmin: function () { var v = !self.state.admin; lsSet('bank-admin', v ? 1 : 0); self.setState({ admin: v }); },
      examTitle: 'UCAT 모의고사 ' + mockNo + '회', secName: '', secAnswered: 0, secTotal: 0, timeLeft: '', timerStyle: '', endLabel: '', openEnd: function () {},
      intro: {}, beginSection: function () { self.beginSection(); },
      navTitle: '', navs: [], legend: [], revTabs: [], revFilters: [], q: { options: [], th: [], tr: [], statements: [], mlRows: [] },
      showCalc: false, calcView: S.calc || '0', calcKeys: [],
      endOpen: false, endTitle: '', endMsg: '', endConfirm: '', doEnd: function () {}, closeEnd: function () { self.setState({ endOpen: false }); },
      prev: function () {}, next: function () {}, toggleFlag: function () {}, clearAns: function () {},
      backToResult: function () { var s0 = (self.state.sessions || {})[self.state.mock]; self.setState({ view: s0 && s0.result ? 'result' : 'lobby' }); }, openReview: function () { self.setState({ view: 'review', revSec: 'VR', revFilter: 'all', idx: 0 }); }, toLobby: function () { self.setState({ view: 'lobby' }); },
      r: { secs: [], unis: [], types: [], times: [], next: [], comments: [] }
    };
    if (S.view === 'intro' && sess) {
      var si = SECS[sess.sec];
      base.intro = { step: (sess.sec + 1) + ' / 4 영역', name: si.name, n: si.n, min: Math.round(si.sec / 60), calc: si.calc ? '계산기 사용 가능' : '계산기 없음', guide: si.guide, guideEn: si.guideEn, left: fmtClock((sess.introEnd - S.now) / 1000) };
    }
    if ((S.view === 'exam' || S.view === 'review') && sess && this.items().length) {
      var exam = S.view === 'exam', A = sess.answers || {}, F = sess.flags || {};
      var code = exam ? SECS[sess.sec].code : S.revSec, secDef = SECS.filter(function (x) { return x.code === code; })[0];
      var list = this.secItems(code);
      var order = list.map(function (x, i) { return i; });
      if (!exam && S.revFilter === 'wrong') order = order.filter(function (i) { return itemScore(list[i], A[list[i].id]) < itemMax(list[i]); });
      var idx = Math.min(S.idx, list.length - 1), cur = list[idx];
      var left = exam ? (sess.deadline - S.now) / 1000 : 0;
      var answered = list.filter(function (it) { return isAnswered(it, A[it.id]); }).length;
      base.secName = secDef.name.split(' (')[0]; base.secAnswered = answered; base.secTotal = list.length;
      base.timeLeft = fmtClock(left); base.timerStyle = left < 120 ? 'background: #8E2A3B; color: #FFFFFF' : left < 300 ? 'background: #F2D9DE; color: #2A2E35' : 'background: rgba(255,255,255,.12); color: #FFFFFF';
      base.endLabel = sess.sec >= 3 ? '시험 제출' : '이 영역 마치기';
      base.openEnd = function () { self.setState({ endOpen: true }); };
      base.navTitle = exam ? secDef.name.split(' (')[0] + ' 문항' : '영역별 해설';
      base.navs = order.map(function (i) {
        var it = list[i], a = A[it.id], st, g = itemScore(it, a), mx = itemMax(it);
        if (exam) st = isAnswered(it, a) ? 'border: 1px solid #2A2E35; background: #2A2E35; color: #FFFFFF' : 'border: 1px solid #C8C9C6; background: #FFFFFF; color: #1C1F24';
        else st = g >= mx ? 'border: 1px solid #0F6E5A; background: #0F6E5A; color: #FFFFFF' : g > 0 ? 'border: 1px solid #F2D9DE; background: #F2D9DE; color: #2A2E35' : 'border: 1px solid #8E2A3B; background: #8E2A3B; color: #FFFFFF';
        if (F[it.id]) st += '; box-shadow: inset 0 -4px 0 #F2D9DE';
        if (i === idx) st += '; outline: 2px solid #F2D9DE; outline-offset: 1px';
        return { no: it.order, style: st, aria: it.order + '번', pick: function () { exam ? self.go(i) : self.setState({ idx: i }); } };
      });
      base.legend = exam ? [{ label: '답함', style: 'background: #2A2E35' }, { label: '안 함', style: 'border: 1px solid #C8C9C6; background: #FFFFFF' }, { label: '다시 볼 문항', style: 'background: #FFFFFF; box-shadow: inset 0 -4px 0 #F2D9DE; border: 1px solid #C8C9C6' }]
        : [{ label: '만점', style: 'background: #0F6E5A' }, { label: '부분 점수', style: 'background: #F2D9DE' }, { label: '0점', style: 'background: #8E2A3B' }];
      base.revTabs = SECS.map(function (x) { var on = S.revSec === x.code; return { label: x.code, style: on ? 'border: 0; background: #2A2E35; color: #FFFFFF; font-weight: 700' : 'border: 1px solid #C8C9C6; background: #FFFFFF; color: #1C1F24', pick: function () { self.setState({ revSec: x.code, idx: 0, revFilter: 'all' }); } }; });
      base.revFilters = [['all', '전체'], ['wrong', '감점된 문항']].map(function (f) { var on = S.revFilter === f[0]; return { label: f[1], style: on ? 'border: 0; background: #454B55; color: #FFFFFF' : 'border: 1px solid #C8C9C6; background: #FFFFFF; color: #1C1F24', pick: function () { var o2 = list.map(function (x, i) { return i; }).filter(function (i) { return f[0] === 'all' || itemScore(list[i], A[list[i].id]) < itemMax(list[i]); }); self.setState({ revFilter: f[0], idx: o2.length ? o2[0] : 0 }); } }; });
      base.showCalc = exam && secDef.calc;
      base.calcKeys = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '%', '+', 'C', '⌫', '√', '='].map(function (k) { var op = '÷×−+='.indexOf(k) >= 0; return { label: k, aria: k === '⌫' ? '한 글자 지우기' : k === 'C' ? '모두 지우기' : k, style: k === '=' ? 'background: #454B55; color: #FFFFFF; border-color: #454B55' : op ? 'background: #F3F3F1; color: #2A2E35' : 'background: #FFFFFF; color: #1C1F24', press: function () { self.press(k); } }; });
      var setItems = cur.setId ? list.filter(function (x) { return x.setId === cur.setId; }) : [];
      var mine = A[cur.id], f = cur.format, g = itemScore(cur, mine), mx = itemMax(cur);
      var setAns = function (v) { if (!exam) return; self.patch(function (s) { s.answers = Object.assign({}, s.answers); s.answers[cur.id] = v; }); };
      var q = {
        no: cur.order, sec: SECL[cur.subtest], type: cur.type, diff: DIFFL[cur.difficulty] || '', inSet: setItems.length > 1, setPos: (setItems.indexOf(cur) + 1) + '/' + setItems.length,
        flagged: F[cur.id] ? 'true' : 'false', flagLabel: F[cur.id] ? '★ 다시 볼 문항' : '☆ 다시 볼 문항 표시', flagStyle: F[cur.id] ? 'border: 0; background: #F2D9DE; color: #2A2E35' : 'border: 1px solid #C8C9C6; background: #FFFFFF; color: #1C1F24',
        hasStim: !!cur.stimulus, stimulus: cur.stimulus || '', hasTable: !!cur.table, tableTitle: cur.table ? cur.table.title || '' : '', th: cur.table ? cur.table.headers || [] : [], tr: cur.table ? cur.table.rows || [] : [],
        question: cur.question, explanation: cur.explanation_ko || '', got: g, max: mx,
        isChoice: f !== 'yesno5' && f !== 'sjt-mostleast', isYesNo: f === 'yesno5', isMostLeast: f === 'sjt-mostleast',
        verdict: g >= mx ? '만점입니다.' : g > 0 ? '부분 점수를 받았습니다.' : (isAnswered(cur, mine) ? '감점된 문항입니다.' : '풀지 않은 문항입니다.'),
        verdictBox: g >= mx ? 'background: #E2F0EB' : g > 0 ? 'background: #F2D9DE' : 'background: #FBF1F3',
        options: [], statements: [], mlRows: []
      };
      if (q.isChoice) q.options = (cur.options || []).map(function (o) {
        var sel = mine === o.id, right = o.id === cur.answer, st = 'border: 1px solid #C8C9C6; background: #FFFFFF; color: #1C1F24', tag = '';
        if (exam && sel) st = 'border: 2px solid #2A2E35; background: #F3F3F1; color: #1C1F24';
        if (!exam && right) { st = 'border: 2px solid #0F6E5A; background: #E2F0EB; color: #1C1F24'; tag = '정답'; }
        if (!exam && sel && !right) { st = 'border: 2px solid #8E2A3B; background: #FBF1F3; color: #1C1F24'; tag = '내 답'; }
        return { id: o.id, text: o.text, style: st, tag: tag, checked: sel ? 'true' : 'false', pick: function () { setAns(o.id); } };
      });
      if (q.isYesNo) {
        var arr = Array.isArray(mine) ? mine : [null, null, null, null, null], key = cur.yesNoKey || [];
        var on = 'border: 0; background: #2A2E35; color: #FFFFFF', off = 'border: 1px solid #C8C9C6; background: #FFFFFF; color: #1C1F24';
        q.statements = (cur.statements || []).map(function (stx, i) {
          var a = arr[i], k = key[i], ok = a === k;
          var mk = function (v) { return function () { var curA = (self.state.sessions[S.mock].answers || {})[cur.id]; var n = Array.isArray(curA) ? curA.slice() : [null, null, null, null, null]; n[i] = v; setAns(n); }; };
          return { n: stx.id || (i + 1), text: stx.text, yesOn: a === 'Yes' ? 'true' : 'false', noOn: a === 'No' ? 'true' : 'false', yesStyle: a === 'Yes' ? on : off, noStyle: a === 'No' ? on : off, yes: mk('Yes'), no: mk('No'),
            box: exam ? 'border: 1px solid #E7E7E4' : (ok ? 'border: 1px solid #0F6E5A; background: #F1F8F5' : 'border: 1px solid #8E2A3B; background: #FDF4F2'), tag: exam ? '' : '정답 ' + k };
        });
      }
      if (q.isMostLeast) {
        var ml = mine && typeof mine === 'object' ? mine : {}, mk2 = cur.mostLeastKey || {};
        q.mlRows = (cur.options || []).map(function (o) {
          var isM = ml.most === o.id, isL = ml.least === o.id;
          var tag = '';
          if (!exam) tag = mk2.most === o.id ? 'background: #E2F0EB' : mk2.least === o.id ? 'background: #FBF1F3' : '';
          return { id: o.id, text: o.text, box: tag, mostOn: isM ? 'true' : 'false', leastOn: isL ? 'true' : 'false',
            mostStyle: isM ? 'border: 0; background: #0F6E5A; color: #FFFFFF' : 'border: 1px solid #C8C9C6; background: #FFFFFF; color: #1C1F24',
            leastStyle: isL ? 'border: 0; background: #8E2A3B; color: #FFFFFF' : 'border: 1px solid #C8C9C6; background: #FFFFFF; color: #1C1F24',
            most: function () { var c0 = (self.state.sessions[S.mock].answers || {})[cur.id]; var n = Object.assign({}, c0 && typeof c0 === 'object' ? c0 : {}, { most: o.id }); if (n.least === o.id) delete n.least; setAns(n); },
            least: function () { var c0 = (self.state.sessions[S.mock].answers || {})[cur.id]; var n = Object.assign({}, c0 && typeof c0 === 'object' ? c0 : {}, { least: o.id }); if (n.most === o.id) delete n.most; setAns(n); } };
        });
      }
      base.q = q;
      var pos = order.indexOf(idx);
      base.prev = function () { var t = exam ? idx - 1 : order[pos - 1]; if (t === undefined || t < 0) return; exam ? self.go(t) : self.setState({ idx: t }); };
      base.next = function () { var t = exam ? idx + 1 : order[pos + 1]; if (t === undefined || t >= list.length) { if (exam) self.setState({ endOpen: true }); return; } exam ? self.go(t) : self.setState({ idx: t }); };
      base.toggleFlag = function () { self.patch(function (s) { s.flags = Object.assign({}, s.flags); if (s.flags[cur.id]) delete s.flags[cur.id]; else s.flags[cur.id] = 1; }); };
      base.clearAns = function () { self.patch(function (s) { s.answers = Object.assign({}, s.answers); delete s.answers[cur.id]; }); };
      base.endOpen = exam && S.endOpen;
      var lastSec = sess.sec >= 3;
      base.endTitle = lastSec ? '시험을 제출할까요?' : secDef.name.split(' (')[0] + ' 영역을 마칠까요?';
      base.endMsg = (list.length - answered ? '아직 ' + (list.length - answered) + '문항이 남았습니다. 감점이 없으니 비워 두지 않는 편이 유리합니다. ' : '이 영역의 문항을 모두 풀었습니다. ') + '남은 시간 ' + fmtClock(left) + '. ' + (lastSec ? '제출하면 결과 리포트로 넘어갑니다.' : '마치면 이 영역으로 돌아올 수 없습니다.');
      base.endConfirm = lastSec ? '네, 제출하고 결과 보기' : '네, 다음 영역으로';
      base.doEnd = function () { self.endSection(false); };
    }
    if (S.view === 'result' && sess && sess.result) {
      var R = sess.result, e = R.est;
      var typeRows = Object.keys(R.types).map(function (k) { return R.types[k]; }).sort(function (a, b) { return (a.got / a.max) - (b.got / b.max); });
      var weak = typeRows.filter(function (t) { return t.max >= 3 && t.got / t.max < 0.65; }).slice(0, 3);
      var nx = [];
      if (weak.length) nx.push('약한 유형부터: ' + weak.map(function (t) { return t.label + ' (' + Math.round(t.got / t.max * 100) + '%)'; }).join(', '));
      if (R.blank) nx.push('비워 둔 문항이 ' + R.blank + '개입니다. 감점이 없으니 영역 마지막 30초는 남은 문항을 모두 고르는 데 쓰세요.');
      nx.push('VR은 문항당 30초, SJT는 23초 안팎입니다. 한 문항에서 오래 막히면 표시하고 넘어가는 연습을 하세요.');
      nx.push('감점된 문항의 해설을 먼저 읽고, 일주일 뒤 같은 회차를 다시 풀어 유형 이해도를 확인하세요.');
      var us = R.secUsed || {};
      base.r = {
        title: 'UCAT 모의고사 ' + mockNo + '회', when: new Date(R.at).toLocaleString('ko-KR'),
        totRange: R.tot.lo + '–' + R.tot.hi, totMid: R.tot.mid, totPctile: R.tot.pctile,
        sjtRange: e.SJT.lo + '–' + e.SJT.hi, sjtRaw: Math.round(R.sec.SJT.got * 10) / 10, sjtBand: e.SJT.mid >= 630 ? '1 (상위 25%)' : e.SJT.mid >= 589 ? '2' : e.SJT.mid >= 539 ? '3' : '4 (하위 25%)',
        secs: ['VR', 'DM', 'QR'].map(function (k) { var x = R.sec[k], p = x.max ? Math.round(x.got / x.max * 100) : 0; return { label: SECL[k], range: e[k].lo + '–' + e[k].hi, raw: x.got + ' / ' + x.max + '점', pct: p, bar: 'width: ' + p + '%', pctile: e[k].pctile, median: MEDIAN26[k] }; }),
        comments: comments(R),
        unis: uniRows(R).map(function (u) { return { name: u.name, rule: u.rule, level: u.neutral ? '컷 미공개 · ' + LV[u.lv].t.replace('아직 부족', '보강 필요') : LV[u.lv].t, chip: u.neutral ? 'background: #F3F3F1; color: #454B55' : LV[u.lv].chip, comment: u.comment }; }),
        types: typeRows.map(function (t) { var p = Math.round(t.got / t.max * 100); return { sec: t.sec, label: t.label, raw: (Math.round(t.got * 10) / 10) + '/' + t.max, pct: p + '%', bar: 'width: ' + p + '%; background: ' + (p >= 70 ? '#0F6E5A' : p >= 50 ? '#F2D9DE' : '#8E2A3B') }; }),
        times: SECS.map(function (x) { return { label: x.name.split(' (')[0] + ' 사용 시간', val: fmtClock(us[x.code] || 0) + ' / ' + fmtClock(x.sec) }; }).concat([{ label: '비워 둔 문항', val: R.blank + '개' }]),
        next: nx
      };
    }
    return base;
  }
}

Component.prototype.__tpl = function (v: any) {
  return (<><style dangerouslySetInnerHTML={{ __html: "html,body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}\nh1,h2,h3,h4{letter-spacing:-0.035em;line-height:1.28;text-wrap:balance}\np,li,td,th,dd,dt,span,a,button{letter-spacing:-0.012em}\nbody{margin:0;background:#F3F3F1}\na{color:#0F6E5A}a:hover{color:#0A5546}\nbutton:focus-visible,a:focus-visible{outline:3px solid #9CCFC0;outline-offset:2px}\n.navb:hover{filter:brightness(.96)}\n.mcard:hover{border-color:#454B55}" }} />
<div style={{"fontFamily": "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif", "color": "#1C1F24", "background": "#F3F3F1", "width": "100%", "minHeight": "1500px", "fontSize": "16px", "lineHeight": "1.7", "wordBreak": "keep-all", "overflowWrap": "break-word"}}>{" "}<header style={{"background": "#2A2E35", "color": "#FFFFFF", "position": "sticky", "top": "0", "zIndex": "5"}}>{" "}<div style={{"maxWidth": "1320px", "margin": "0 auto", "padding": "12px 24px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "10px 20px"}}>{" "}<a href={"/medical"} style={{"display": "flex", "alignItems": "center", "gap": "10px", "textDecoration": "none", "color": "#FFFFFF", "marginRight": "auto"}}>{" "}<svg width={"32"} height={"32"} viewBox={"0 0 34 34"} aria-hidden={"true"}><rect width={"34"} height={"34"} rx={"9"} fill={"#FFFFFF"}></rect><path d={"M17 8v18M8 17h18"} stroke={"#F2D9DE"} strokeWidth={"3"} strokeLinecap={"round"}></path></svg>{" "}<span style={{"fontWeight": "800", "fontSize": "18px"}}>{"AusUhak 메디컬 · UCAT ANZ 실전 모의고사"}</span>{" "}</a>{" "}{v?.inExam ? (<>{" "}<span style={{"display": "flex", "alignItems": "center", "gap": "12px", "flexWrap": "wrap"}}>{" "}<span style={{"fontSize": "14px", "color": "#E7E7E4"}}>{v?.examTitle}{" · "}<strong style={{"color": "#FFFFFF"}}>{v?.secName}</strong>{" · 푼 문항 "}{v?.secAnswered}{"/"}{v?.secTotal}</span>{" "}<span role={"timer"} aria-live={"off"} style={css(`min-width: 96px; text-align: center; padding: 6px 14px; border-radius: 10px; font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums; ${v?.timerStyle ?? ''}`)}>{v?.timeLeft}</span>{" "}<button type={"button"} onClick={v?.openEnd} style={{"minHeight": "40px", "padding": "0 16px", "borderRadius": "10px", "border": "0", "background": "#8E2A3B", "color": "#FFFFFF", "font": "inherit", "fontWeight": "800", "cursor": "pointer"}}>{v?.endLabel}</button>{" "}</span>{" "}</>) : null}{" "}{v?.notExam ? (<>{" "}<nav style={{"display": "flex", "gap": "6px", "flexWrap": "wrap"}}>{" "}<a href={"/medical/isat-mock"} style={{"color": "#FFFFFF", "textDecoration": "none", "padding": "8px 12px", "borderRadius": "8px", "border": "1px solid rgba(255,255,255,.3)", "fontSize": "14px"}}>{"ISAT 모의고사"}</a>{" "}<a href={"/medical/isat"} style={{"color": "#FFFFFF", "textDecoration": "none", "padding": "8px 12px", "borderRadius": "8px", "border": "1px solid rgba(255,255,255,.3)", "fontSize": "14px"}}>{"문제은행"}</a>{" "}<a href={"/medical/services"} style={{"color": "#2A2E35", "background": "#F2D9DE", "textDecoration": "none", "padding": "8px 12px", "borderRadius": "8px", "fontSize": "14px", "fontWeight": "800"}}>{"요금·상담"}</a>{" "}</nav>{" "}</>) : null}{" "}</div>{" "}</header>{" "}{v?.isLobby ? (<>{" "}<div style={{"maxWidth": "1320px", "margin": "0 auto", "padding": "28px 24px 48px", "display": "flex", "flexDirection": "column", "gap": "22px"}}>{" "}<section style={{"background": "#2A2E35", "color": "#FFFFFF", "borderRadius": "22px", "padding": "32px", "display": "flex", "flexWrap": "wrap", "gap": "24px", "alignItems": "center"}}>{" "}<div style={{"flex": "1 1 460px", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<span style={{"alignSelf": "flex-start", "padding": "4px 10px", "borderRadius": "6px", "background": "#F2D9DE", "color": "#2A2E35", "fontSize": "12px", "fontWeight": "800"}}>{"2026 시험 · 2027 입학 구성"}</span>{" "}<h1 style={{"margin": "0", "fontSize": "34px"}}>{"4개 영역 184문항, 실제처럼 영역별 시간제한"}</h1>{" "}<p style={{"margin": "0", "color": "#E7E7E4", "fontSize": "17px"}}>{"언어추론, 의사결정, 수리추론, 상황판단을 실제 순서대로 풉니다. 영역마다 시간이 따로 흐르고, 끝난 영역으로는 돌아갈 수 없습니다. 의사결정·수리추론에는 화면 계산기가 있습니다. 제출하면 영역별 추정 점수(300~900)와 총점, 2026년 응시자 대비 위치, 대학별 기준 비교 코멘트를 드립니다."}</p>{" "}</div>{" "}<div style={{"flex": "1 1 320px", "display": "grid", "gridTemplateColumns": "repeat(2, minmax(0, 1fr))", "gap": "10px"}}>{" "}{(v?.secInfo || []).map((s: any, __i0: number) => (<Fragment key={__i0}><div style={{"background": "rgba(255,255,255,.08)", "borderRadius": "14px", "padding": "14px"}}><strong style={{"display": "block", "fontSize": "20px"}}>{s?.code}{" · "}{s?.n}{"문항"}</strong><span style={{"fontSize": "13px", "color": "#E7E7E4"}}>{s?.name}{" · "}{s?.min}{"분"}</span></div></Fragment>))}{" "}</div>{" "}</section>{" "}{v?.loadErr ? (<><div style={{"background": "#FBF1F3", "color": "#6E1F2D", "borderRadius": "12px", "padding": "14px 18px"}}>{"문제를 불러오지 못했습니다. 아직 공개 전인 회차이거나 연결이 불안정합니다."}</div></>) : null}{" "}<section style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fill, minmax(240px, 1fr))", "gap": "14px"}}>{" "}{(v?.mocks || []).map((m: any, __i0: number) => (<Fragment key={__i0}>{" "}<article className={"mcard"} style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "padding": "18px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<span style={{"display": "flex", "justifyContent": "space-between", "alignItems": "center", "gap": "8px"}}>{" "}<strong style={{"fontSize": "19px"}}>{m?.title}</strong>{" "}<span style={css(`padding: 2px 9px; border-radius: 6px; font-size: 12px; font-weight: 800; ${m?.tagStyle ?? ''}`)}>{m?.tag}</span>{" "}</span>{" "}<span style={{"fontSize": "14px", "color": "#5C6370"}}>{m?.desc}</span>{" "}<span style={{"fontSize": "13px", "color": "#454B55", "minHeight": "22px"}}>{m?.last}</span>{" "}<span style={{"display": "flex", "gap": "6px", "flexWrap": "wrap", "marginTop": "auto"}}>{" "}{m?.canStart ? (<><button type={"button"} onClick={m?.start} style={{"minHeight": "42px", "padding": "0 16px", "borderRadius": "10px", "border": "0", "background": "#454B55", "color": "#FFFFFF", "font": "inherit", "fontWeight": "800", "cursor": "pointer"}}>{m?.startLabel}</button></>) : null}{" "}{m?.hasResult ? (<><button type={"button"} onClick={m?.showResult} style={{"minHeight": "42px", "padding": "0 14px", "borderRadius": "10px", "border": "1px solid #C8C9C6", "background": "#FFFFFF", "color": "#1C1F24", "font": "inherit", "cursor": "pointer"}}>{"결과 보기"}</button></>) : null}{" "}{m?.locked ? (<><button type={"button"} onClick={m?.buy} style={{"display": "inline-flex", "alignItems": "center", "minHeight": "42px", "padding": "0 16px", "borderRadius": "10px", "background": "#F2D9DE", "color": "#6E1F2D", "textDecoration": "none", "fontWeight": "800", "border": "0", "font": "inherit", "cursor": "pointer"}}>{m?.buyLabel}</button></>) : null}{" "}{m?.soon ? (<><span style={{"display": "inline-flex", "alignItems": "center", "minHeight": "42px", "padding": "0 14px", "borderRadius": "10px", "background": "#F3F3F1", "color": "#5C6370", "fontWeight": "700"}}>{"공개 준비 중"}</span></>) : null}{" "}</span>{" "}</article>{" "}</Fragment>))}{" "}</section>{" "}<section style={{"display": "flex", "flexWrap": "wrap", "gap": "14px"}}>{" "}<div style={{"flex": "1 1 420px", "minWidth": "0", "background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<h2 style={{"margin": "0", "fontSize": "20px"}}>{"유학생이 알아야 할 UCAT 사용 대학 (2027 입학)"}</h2>{" "}<ul style={{"margin": "0", "paddingLeft": "20px", "display": "flex", "flexDirection": "column", "gap": "6px", "fontSize": "15px", "color": "#454B55"}}>{(v?.uniUse || []).map((t: any, __i0: number) => (<Fragment key={__i0}><li >{t}</li></Fragment>))}</ul>{" "}</div>{" "}<div style={{"flex": "1 1 420px", "minWidth": "0", "background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<h2 style={{"margin": "0", "fontSize": "20px"}}>{"시험 보기 전에"}</h2>{" "}<ul style={{"margin": "0", "paddingLeft": "20px", "display": "flex", "flexDirection": "column", "gap": "6px", "fontSize": "15px", "color": "#454B55"}}><li >{"약 2시간을 한 번에 확보하세요. 영역 시간은 창을 닫아도 계속 흐릅니다."}</li><li >{"틀려도 감점이 없습니다. 시간이 모자라면 남은 문항을 모두 고르세요."}</li><li >{"의사결정의 Yes/No 다섯 진술 문항은 5개 모두 맞으면 2점, 4개 맞으면 1점입니다."}</li><li >{"상황판단은 정답과 한 단계 차이면 절반 점수를 줍니다(우리 채점 방식)."}</li></ul>{" "}</div>{" "}</section>{" "}<p style={{"margin": "0", "fontSize": "12px", "color": "#5C6370"}}>{v?.caveat}</p>{" "}<p style={{"margin": "0", "fontSize": "12px", "color": "#5C6370"}}>{"모든 문항은 공식 안내의 형식을 분석해 새로 만든 오리지널 문항입니다. 실제 시험 문제가 아니며 UCAT ANZ Consortium과 제휴 관계가 없습니다."}</p>{" "}</div>{" "}</>) : null}{" "}{v?.isLoading ? (<>{" "}<div style={{"maxWidth": "1320px", "margin": "0 auto", "padding": "40px 24px"}}><div style={{"background": "#FFFFFF", "borderRadius": "16px", "padding": "28px", "color": "#5C6370"}}>{"문제를 불러오는 중입니다…"}</div></div>{" "}</>) : null}{" "}{v?.isIntro ? (<>{" "}<div style={{"maxWidth": "860px", "margin": "0 auto", "padding": "40px 24px", "display": "flex", "flexDirection": "column", "gap": "16px"}}>{" "}<div style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "20px", "padding": "32px", "display": "flex", "flexDirection": "column", "gap": "12px"}}>{" "}<span style={{"fontSize": "14px", "color": "#5C6370"}}>{v?.examTitle}{" · "}{v?.intro?.step}</span>{" "}<h1 style={{"margin": "0", "fontSize": "30px"}}>{v?.intro?.name}</h1>{" "}<span style={{"fontSize": "17px", "color": "#454B55"}}>{v?.intro?.n}{"문항 · "}{v?.intro?.min}{"분 · "}{v?.intro?.calc}</span>{" "}<p style={{"margin": "0", "fontSize": "16px", "color": "#454B55"}}>{v?.intro?.guide}</p>{" "}<p lang={"en"} style={{"margin": "0", "fontSize": "15px", "color": "#5C6370"}}>{v?.intro?.guideEn}</p>{" "}<span style={{"fontSize": "14px", "color": "#6E1F2D"}}>{"지시문 시간 "}{v?.intro?.left}{" 후 자동으로 시작합니다."}</span>{" "}<button type={"button"} onClick={v?.beginSection} style={{"alignSelf": "flex-start", "minHeight": "50px", "padding": "0 26px", "borderRadius": "12px", "border": "0", "background": "#454B55", "color": "#FFFFFF", "font": "inherit", "fontWeight": "800", "cursor": "pointer"}}>{"지금 시작"}</button>{" "}</div>{" "}</div>{" "}</>) : null}{" "}{v?.showPaper ? (<>{" "}<div style={{"maxWidth": "1320px", "margin": "0 auto", "padding": "22px 24px 48px", "display": "flex", "flexWrap": "wrap", "gap": "20px", "alignItems": "flex-start"}}>{" "}<aside style={{"flex": "1 1 280px", "maxWidth": "330px", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "12px"}}>{" "}<div style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "16px", "padding": "16px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<strong style={{"fontSize": "14px"}}>{v?.navTitle}</strong>{" "}{v?.isReview ? (<>{" "}<div style={{"display": "flex", "gap": "6px", "flexWrap": "wrap"}}>{" "}{(v?.revTabs || []).map((f: any, __i0: number) => (<Fragment key={__i0}><button type={"button"} onClick={f?.pick} style={css(`min-height: 34px; padding: 0 12px; border-radius: 999px; font: inherit; font-size: 13px; cursor: pointer; ${f?.style ?? ''}`)}>{f?.label}</button></Fragment>))}{" "}</div>{" "}<div style={{"display": "flex", "gap": "6px", "flexWrap": "wrap"}}>{" "}{(v?.revFilters || []).map((f: any, __i0: number) => (<Fragment key={__i0}><button type={"button"} onClick={f?.pick} style={css(`min-height: 32px; padding: 0 12px; border-radius: 999px; font: inherit; font-size: 12px; cursor: pointer; ${f?.style ?? ''}`)}>{f?.label}</button></Fragment>))}{" "}</div>{" "}</>) : null}{" "}<div style={{"display": "grid", "gridTemplateColumns": "repeat(8, minmax(0, 1fr))", "gap": "4px"}}>{" "}{(v?.navs || []).map((n: any, __i0: number) => (<Fragment key={__i0}>{" "}<button type={"button"} className={"navb"} onClick={n?.pick} aria-label={n?.aria} style={css(`aspect-ratio: 1; min-width: 0; padding: 0; border-radius: 6px; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; ${n?.style ?? ''}`)}>{n?.no}</button>{" "}</Fragment>))}{" "}</div>{" "}<div style={{"display": "flex", "flexWrap": "wrap", "gap": "6px 12px", "fontSize": "12px", "color": "#5C6370"}}>{" "}{(v?.legend || []).map((l: any, __i0: number) => (<Fragment key={__i0}><span style={{"display": "inline-flex", "alignItems": "center", "gap": "5px"}}><span style={css(`width: 12px; height: 12px; border-radius: 3px; ${l?.style ?? ''}`)}></span>{l?.label}</span></Fragment>))}{" "}</div>{" "}</div>{" "}{v?.showCalc ? (<>{" "}<div style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "16px", "padding": "14px", "display": "flex", "flexDirection": "column", "gap": "8px"}}>{" "}<strong style={{"fontSize": "13px", "color": "#5C6370"}}>{"계산기"}</strong>{" "}<div lang={"en"} style={{"minHeight": "44px", "borderRadius": "8px", "background": "#F3F3F1", "padding": "8px 12px", "textAlign": "right", "fontSize": "20px", "fontWeight": "700", "fontVariantNumeric": "tabular-nums", "overflowX": "auto"}}>{v?.calcView}</div>{" "}<div style={{"display": "grid", "gridTemplateColumns": "repeat(4, minmax(0, 1fr))", "gap": "6px"}}>{" "}{(v?.calcKeys || []).map((k: any, __i0: number) => (<Fragment key={__i0}><button type={"button"} onClick={k?.press} aria-label={k?.aria} style={css(`min-height: 42px; border-radius: 8px; border: 1px solid #C8C9C6; font: inherit; font-weight: 700; cursor: pointer; ${k?.style ?? ''}`)}>{k?.label}</button></Fragment>))}{" "}</div>{" "}</div>{" "}</>) : null}{" "}{v?.isReview ? (<>{" "}<button type={"button"} onClick={v?.backToResult} style={{"minHeight": "44px", "borderRadius": "10px", "border": "1px solid #C8C9C6", "background": "#FFFFFF", "color": "#1C1F24", "font": "inherit", "fontWeight": "700", "cursor": "pointer"}}>{"← 돌아가기"}</button>{" "}</>) : null}{" "}</aside>{" "}<main style={{"flex": "999 1 600px", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "14px"}}>{" "}<article style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "overflow": "hidden"}}>{" "}<div style={{"padding": "14px 22px", "background": "#F3F3F1", "borderBottom": "1px solid #E7E7E4", "display": "flex", "flexWrap": "wrap", "gap": "8px 14px", "alignItems": "center", "justifyContent": "space-between"}}>{" "}<span style={{"display": "flex", "gap": "8px", "flexWrap": "wrap", "alignItems": "center"}}>{" "}<strong style={{"fontSize": "18px"}}>{v?.q?.no}{"번"}</strong>{" "}<span style={{"padding": "3px 10px", "borderRadius": "6px", "background": "#2A2E35", "color": "#FFFFFF", "fontSize": "12px", "fontWeight": "800"}}>{v?.q?.sec}</span>{" "}{v?.isReview ? (<><span style={{"padding": "3px 10px", "borderRadius": "6px", "background": "#F3F3F1", "color": "#454B55", "fontSize": "12px", "fontWeight": "700"}}>{v?.q?.type}{" · "}{v?.q?.diff}</span></>) : null}{" "}{v?.q?.inSet ? (<><span style={{"fontSize": "13px", "color": "#5C6370"}}>{"같은 지문 "}{v?.q?.setPos}</span></>) : null}{" "}</span>{" "}{v?.inExam ? (<><button type={"button"} onClick={v?.toggleFlag} aria-pressed={v?.q?.flagged} style={css(`min-height: 36px; padding: 0 14px; border-radius: 999px; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; ${v?.q?.flagStyle ?? ''}`)}>{v?.q?.flagLabel}</button></>) : null}{" "}{v?.isReview ? (<><span style={{"fontSize": "13px", "color": "#5C6370"}}>{"점수 "}{v?.q?.got}{" / "}{v?.q?.max}</span></>) : null}{" "}</div>{" "}<div style={{"padding": "24px", "display": "flex", "flexDirection": "column", "gap": "18px"}}>{" "}{v?.q?.hasStim ? (<><div lang={"en"} style={{"background": "#F3F3F1", "borderLeft": "4px solid #2A2E35", "borderRadius": "8px", "padding": "16px 18px", "fontSize": "16px", "lineHeight": "1.75", "whiteSpace": "pre-line", "maxHeight": "520px", "overflowY": "auto"}}>{v?.q?.stimulus}</div></>) : null}{" "}{v?.q?.hasTable ? (<>{" "}<div style={{"overflowX": "auto", "border": "1px solid #E7E7E4", "borderRadius": "10px"}}>{" "}<div lang={"en"} style={{"padding": "8px 12px", "fontSize": "13px", "fontWeight": "700", "background": "#F3F3F1"}}>{v?.q?.tableTitle}</div>{" "}<table lang={"en"} style={{"width": "100%", "borderCollapse": "collapse", "fontSize": "14px", "fontVariantNumeric": "tabular-nums"}}><thead ><tr >{(v?.q?.th || []).map((h: any, __i0: number) => (<Fragment key={__i0}><th style={{"padding": "8px 12px", "textAlign": "left", "background": "#2A2E35", "color": "#FFFFFF", "whiteSpace": "nowrap"}}>{h}</th></Fragment>))}</tr></thead><tbody >{(v?.q?.tr || []).map((tr: any, __i0: number) => (<Fragment key={__i0}><tr style={{"borderTop": "1px solid #E7E7E4"}}>{(tr || []).map((c: any, __i2: number) => (<Fragment key={__i2}><td style={{"padding": "8px 12px"}}>{c}</td></Fragment>))}</tr></Fragment>))}</tbody></table>{" "}</div>{" "}</>) : null}{" "}<p lang={"en"} style={{"margin": "0", "fontSize": "18px", "fontWeight": "600", "lineHeight": "1.6"}}>{v?.q?.question}</p>{" "}{v?.q?.isChoice ? (<>{" "}<div role={"radiogroup"} aria-label={"보기"} style={{"display": "flex", "flexDirection": "column", "gap": "8px"}}>{" "}{(v?.q?.options || []).map((o: any, __i0: number) => (<Fragment key={__i0}>{" "}<button type={"button"} role={"radio"} aria-checked={o?.checked} onClick={o?.pick} lang={"en"} style={css(`min-height: 50px; padding: 10px 16px; border-radius: 10px; font: inherit; font-size: 16px; text-align: left; cursor: pointer; display: flex; gap: 12px; align-items: flex-start; ${o?.style ?? ''}`)}><strong style={{"flex": "none"}}>{o?.id}{"."}</strong><span style={{"flex": "1"}}>{o?.text}</span><span style={{"flex": "none", "fontSize": "13px", "fontWeight": "800"}}>{o?.tag}</span></button>{" "}</Fragment>))}{" "}</div>{" "}</>) : null}{" "}{v?.q?.isYesNo ? (<>{" "}<div style={{"display": "flex", "flexDirection": "column", "gap": "8px"}}>{" "}{(v?.q?.statements || []).map((st: any, __i0: number) => (<Fragment key={__i0}>{" "}<div style={css(`display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 10px 14px; border-radius: 10px; ${st?.box ?? ''}`)}>{" "}<span lang={"en"} style={{"fontSize": "15px"}}>{st?.n}{". "}{st?.text}</span>{" "}<span style={{"display": "flex", "gap": "6px", "alignItems": "center"}}>{" "}<button type={"button"} aria-pressed={st?.yesOn} onClick={st?.yes} style={css(`min-width: 58px; min-height: 40px; border-radius: 8px; font: inherit; font-weight: 800; cursor: pointer; ${st?.yesStyle ?? ''}`)}>{"Yes"}</button>{" "}<button type={"button"} aria-pressed={st?.noOn} onClick={st?.no} style={css(`min-width: 58px; min-height: 40px; border-radius: 8px; font: inherit; font-weight: 800; cursor: pointer; ${st?.noStyle ?? ''}`)}>{"No"}</button>{" "}<span style={{"minWidth": "44px", "fontSize": "12px", "fontWeight": "800"}}>{st?.tag}</span>{" "}</span>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}</>) : null}{" "}{v?.q?.isMostLeast ? (<>{" "}<div style={{"display": "flex", "flexDirection": "column", "gap": "8px"}}>{" "}{(v?.q?.mlRows || []).map((r: any, __i0: number) => (<Fragment key={__i0}>{" "}<div style={css(`display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 10px 14px; border-radius: 10px; border: 1px solid #E7E7E4; ${r?.box ?? ''}`)}>{" "}<span lang={"en"} style={{"fontSize": "15px"}}><strong >{r?.id}{"."}</strong>{" "}{r?.text}</span>{" "}<span style={{"display": "flex", "gap": "6px", "flexWrap": "wrap"}}>{" "}<button type={"button"} aria-pressed={r?.mostOn} onClick={r?.most} style={css(`min-height: 40px; padding: 0 12px; border-radius: 8px; font: inherit; font-size: 13px; font-weight: 800; cursor: pointer; ${r?.mostStyle ?? ''}`)}>{"가장 적절"}</button>{" "}<button type={"button"} aria-pressed={r?.leastOn} onClick={r?.least} style={css(`min-height: 40px; padding: 0 12px; border-radius: 8px; font: inherit; font-size: 13px; font-weight: 800; cursor: pointer; ${r?.leastStyle ?? ''}`)}>{"가장 부적절"}</button>{" "}</span>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}</>) : null}{" "}<div style={{"display": "flex", "flexWrap": "wrap", "gap": "8px", "justifyContent": "space-between", "alignItems": "center"}}>{" "}<span style={{"display": "flex", "gap": "8px"}}>{" "}<button type={"button"} onClick={v?.prev} style={{"minHeight": "46px", "padding": "0 18px", "borderRadius": "10px", "border": "1px solid #C8C9C6", "background": "#FFFFFF", "color": "#1C1F24", "font": "inherit", "cursor": "pointer"}}>{"← 이전"}</button>{" "}<button type={"button"} onClick={v?.next} style={{"minHeight": "46px", "padding": "0 18px", "borderRadius": "10px", "border": "0", "background": "#2A2E35", "color": "#FFFFFF", "font": "inherit", "fontWeight": "700", "cursor": "pointer"}}>{"다음 →"}</button>{" "}</span>{" "}{v?.inExam ? (<><button type={"button"} onClick={v?.clearAns} style={{"minHeight": "40px", "padding": "0 14px", "borderRadius": "10px", "border": "0", "background": "transparent", "color": "#5C6370", "font": "inherit", "fontSize": "14px", "textDecoration": "underline", "cursor": "pointer"}}>{"선택 지우기"}</button></>) : null}{" "}</div>{" "}{v?.isReview ? (<>{" "}<div style={css(`border-radius: 12px; padding: 18px 20px; display: flex; flex-direction: column; gap: 8px; ${v?.q?.verdictBox ?? ''}`)}>{" "}<strong style={{"fontSize": "17px"}}>{v?.q?.verdict}</strong>{" "}<p style={{"margin": "0", "fontSize": "15px", "lineHeight": "1.85", "color": "#454B55", "whiteSpace": "pre-line"}}>{v?.q?.explanation}</p>{" "}</div>{" "}</>) : null}{" "}</div>{" "}</article>{" "}{v?.endOpen ? (<>{" "}<div role={"dialog"} aria-label={"영역 마치기 확인"} style={{"background": "#2A2E35", "color": "#FFFFFF", "borderRadius": "18px", "padding": "24px", "display": "flex", "flexDirection": "column", "gap": "12px"}}>{" "}<strong style={{"fontSize": "21px"}}>{v?.endTitle}</strong>{" "}<span style={{"color": "#E7E7E4"}}>{v?.endMsg}</span>{" "}<span style={{"display": "flex", "gap": "8px", "flexWrap": "wrap"}}>{" "}<button type={"button"} onClick={v?.doEnd} style={{"minHeight": "46px", "padding": "0 22px", "borderRadius": "10px", "border": "0", "background": "#8E2A3B", "color": "#FFFFFF", "font": "inherit", "fontWeight": "800", "cursor": "pointer"}}>{v?.endConfirm}</button>{" "}<button type={"button"} onClick={v?.closeEnd} style={{"minHeight": "46px", "padding": "0 18px", "borderRadius": "10px", "border": "1px solid rgba(255,255,255,.4)", "background": "transparent", "color": "#FFFFFF", "font": "inherit", "cursor": "pointer"}}>{"계속 풀기"}</button>{" "}</span>{" "}</div>{" "}</>) : null}{" "}</main>{" "}</div>{" "}</>) : null}{" "}{v?.isResult ? (<>{" "}<div style={{"maxWidth": "1180px", "margin": "0 auto", "padding": "28px 24px 56px", "display": "flex", "flexDirection": "column", "gap": "18px"}}>{" "}<div style={{"display": "flex", "flexWrap": "wrap", "justifyContent": "space-between", "alignItems": "center", "gap": "10px"}}>{" "}<div ><span style={{"fontSize": "14px", "color": "#5C6370"}}>{v?.r?.title}{" · "}{v?.r?.when}</span><h1 style={{"margin": "2px 0 0", "fontSize": "30px"}}>{"결과 리포트"}</h1></div>{" "}<span style={{"display": "flex", "gap": "8px", "flexWrap": "wrap"}}>{" "}<button type={"button"} onClick={v?.openReview} style={{"minHeight": "46px", "padding": "0 18px", "borderRadius": "10px", "border": "0", "background": "#454B55", "color": "#FFFFFF", "font": "inherit", "fontWeight": "800", "cursor": "pointer"}}>{"문항별 해설 보기"}</button>{" "}<button type={"button"} onClick={v?.toLobby} style={{"minHeight": "46px", "padding": "0 18px", "borderRadius": "10px", "border": "1px solid #C8C9C6", "background": "#FFFFFF", "color": "#1C1F24", "font": "inherit", "cursor": "pointer"}}>{"회차 목록"}</button>{" "}</span>{" "}</div>{" "}<section style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(260px, 1fr))", "gap": "14px"}}>{" "}<div style={{"background": "#2A2E35", "color": "#FFFFFF", "borderRadius": "18px", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "6px"}}>{" "}<span style={{"fontSize": "14px", "color": "#E7E7E4"}}>{"인지 영역 총점 추정 (VR+DM+QR)"}</span>{" "}<strong style={{"fontSize": "40px", "lineHeight": "1.1", "fontVariantNumeric": "tabular-nums"}}>{v?.r?.totRange}</strong>{" "}<span style={{"fontSize": "14px", "color": "#E7E7E4"}}>{"중앙값 "}{v?.r?.totMid}{" / 2700"}</span>{" "}<span style={{"fontSize": "13px", "color": "#F2D9DE"}}>{"2026년 응시자 중 약 "}{v?.r?.totPctile}{"백분위 추정"}</span>{" "}</div>{" "}<div style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "6px"}}>{" "}<span style={{"fontSize": "14px", "color": "#5C6370"}}>{"상황판단 (SJT) 추정"}</span>{" "}<strong style={{"fontSize": "34px", "lineHeight": "1.1", "fontVariantNumeric": "tabular-nums"}}>{v?.r?.sjtRange}</strong>{" "}<span style={{"fontSize": "14px", "color": "#454B55"}}>{v?.r?.sjtRaw}{"점 / 69점 · 참고 등급 "}{v?.r?.sjtBand}</span>{" "}<span style={{"fontSize": "13px", "color": "#5C6370"}}>{"참고 등급은 2026년 사분위 기준의 우리 표시입니다. 호주·뉴질랜드 UCAT은 SJT를 300~900점으로 따로 보고합니다."}</span>{" "}</div>{" "}</section>{" "}<section style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(220px, 1fr))", "gap": "14px"}}>{" "}{(v?.r?.secs || []).map((s: any, __i0: number) => (<Fragment key={__i0}>{" "}<div style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "padding": "20px", "display": "flex", "flexDirection": "column", "gap": "6px"}}>{" "}<span style={{"fontSize": "14px", "color": "#5C6370"}}>{s?.label}</span>{" "}<strong style={{"fontSize": "30px", "lineHeight": "1.1", "fontVariantNumeric": "tabular-nums"}}>{s?.range}</strong>{" "}<span style={{"fontSize": "14px", "color": "#454B55"}}>{s?.raw}{" · 정답률 "}{s?.pct}{"%"}</span>{" "}<div style={{"height": "8px", "borderRadius": "999px", "background": "#E7E7E4", "overflow": "hidden"}}><div style={css(`height: 100%; background: #454B55; ${s?.bar ?? ''}`)}></div></div>{" "}<span style={{"fontSize": "13px", "color": "#5C6370"}}>{"2026년 응시자 대비 약 "}{s?.pctile}{"백분위 · 2026 중앙값 "}{s?.median}</span>{" "}</div>{" "}</Fragment>))}{" "}</section>{" "}<section style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "padding": "24px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<h2 style={{"margin": "0", "fontSize": "22px"}}>{"한 줄 코멘트"}</h2>{" "}{(v?.r?.comments || []).map((c: any, __i0: number) => (<Fragment key={__i0}><p style={{"margin": "0", "fontSize": "16px", "color": "#454B55"}}>{c}</p></Fragment>))}{" "}</section>{" "}<section style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "overflow": "hidden"}}>{" "}<div style={{"padding": "20px 24px 8px"}}><h2 style={{"margin": "0", "fontSize": "22px"}}>{"대학별 UCAT 기준과 비교"}</h2><span style={{"fontSize": "14px", "color": "#5C6370"}}>{"추정 총점 범위를 대학이 공개한 기준과 맞춰 본 결과입니다. 합격 여부가 아니라 UCAT 기준선에 대한 위치이며, 지원 자격(국내생·유학생)에 따라 적용되는 기준이 다릅니다."}</span></div>{" "}<div style={{"display": "flex", "flexDirection": "column"}}>{" "}{(v?.r?.unis || []).map((u: any, __i0: number) => (<Fragment key={__i0}>{" "}<div style={{"display": "grid", "gridTemplateColumns": "minmax(0, 1.2fr) auto", "gap": "6px 14px", "padding": "16px 24px", "borderTop": "1px solid #F3F3F1"}}>{" "}<span style={{"minWidth": "0"}}><strong style={{"display": "block", "fontSize": "16px"}}>{u?.name}</strong><span style={{"fontSize": "13px", "color": "#5C6370"}}>{u?.rule}</span></span>{" "}<span style={css(`align-self: start; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 800; white-space: nowrap; ${u?.chip ?? ''}`)}>{u?.level}</span>{" "}<span style={{"gridColumn": "1 / -1", "fontSize": "15px", "color": "#454B55"}}>{u?.comment}</span>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}</section>{" "}<section style={{"display": "flex", "flexWrap": "wrap", "gap": "14px"}}>{" "}<div style={{"flex": "1 1 460px", "minWidth": "0", "background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<h2 style={{"margin": "0", "fontSize": "20px"}}>{"유형별 득점률"}</h2>{" "}{(v?.r?.types || []).map((t: any, __i0: number) => (<Fragment key={__i0}>{" "}<div style={{"display": "grid", "gridTemplateColumns": "38px minmax(0, 1fr) 62px 46px", "gap": "8px", "alignItems": "center", "fontSize": "14px"}}>{" "}<span style={{"fontSize": "11px", "fontWeight": "800", "color": "#5C6370"}}>{t?.sec}</span>{" "}<span style={{"minWidth": "0"}}><span style={{"display": "block"}}>{t?.label}</span><span style={{"display": "block", "height": "6px", "borderRadius": "999px", "background": "#E7E7E4", "overflow": "hidden"}}><span style={css(`display: block; height: 100%; ${t?.bar ?? ''}`)}></span></span></span>{" "}<span style={{"textAlign": "right", "color": "#5C6370", "fontVariantNumeric": "tabular-nums"}}>{t?.raw}</span>{" "}<strong style={{"textAlign": "right", "fontVariantNumeric": "tabular-nums"}}>{t?.pct}</strong>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}<div style={{"flex": "1 1 320px", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "14px"}}>{" "}<div style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "8px"}}>{" "}<h2 style={{"margin": "0", "fontSize": "20px"}}>{"시간 관리"}</h2>{" "}{(v?.r?.times || []).map((d: any, __i0: number) => (<Fragment key={__i0}><div style={{"display": "flex", "justifyContent": "space-between", "gap": "10px", "fontSize": "15px"}}><span >{d?.label}</span><strong style={{"fontVariantNumeric": "tabular-nums", "textAlign": "right"}}>{d?.val}</strong></div></Fragment>))}{" "}</div>{" "}<div style={{"background": "#F3F3F1", "borderRadius": "18px", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "8px"}}>{" "}<h2 style={{"margin": "0", "fontSize": "20px"}}>{"다음에 할 일"}</h2>{" "}{(v?.r?.next || []).map((x: any, __i0: number) => (<Fragment key={__i0}><span style={{"fontSize": "15px", "color": "#1C1F24"}}>{"· "}{x}</span></Fragment>))}{" "}<a href={"/medical/isat"} style={{"alignSelf": "flex-start", "display": "inline-flex", "alignItems": "center", "minHeight": "42px", "padding": "0 16px", "borderRadius": "10px", "background": "#454B55", "color": "#FFFFFF", "textDecoration": "none", "fontWeight": "800"}}>{"문제은행에서 약점 유형 풀기"}</a>{" "}</div>{" "}</div>{" "}</section>{" "}<section style={{"background": "#2A2E35", "color": "#FFFFFF", "borderRadius": "18px", "padding": "24px", "display": "flex", "flexWrap": "wrap", "gap": "14px", "alignItems": "center", "justifyContent": "space-between"}}>{" "}<span style={{"flex": "1 1 420px"}}><strong style={{"display": "block", "fontSize": "19px"}}>{"UCAT만으로 합격이 정해지지 않습니다"}</strong><span style={{"color": "#E7E7E4", "fontSize": "15px"}}>{"대학마다 학업 성적, 인터뷰, Casper, 영어 요건을 함께 보고, 국내생·유학생 기준도 다릅니다. 이 결과와 성적표를 함께 놓고 지원 전략을 짜 드립니다."}</span></span>{" "}<a href={"/medical#consult"} style={{"display": "inline-flex", "alignItems": "center", "minHeight": "48px", "padding": "0 20px", "borderRadius": "12px", "background": "#F2D9DE", "color": "#2A2E35", "textDecoration": "none", "fontWeight": "800"}}>{"결과 들고 상담 예약"}</a>{" "}</section>{" "}<p style={{"margin": "0", "fontSize": "12px", "color": "#5C6370"}}>{v?.caveat}</p>{" "}</div>{" "}</>) : null}{" "}</div></>);
};

export default Component;
