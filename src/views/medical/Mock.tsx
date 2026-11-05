// @ts-nocheck
"use client";
/* eslint-disable */
// Generated from Mock.dc.html by tools/dc2tsx.py. Edit the generator input, not this file, for layout changes.
import { Fragment } from "react";
import { DCLogic, css } from "@/lib/dc";

var MOCK_SRC = {"MOCK-01": "/data/3d327e1fd9427d54da9e26086014aa62.json", "MOCK-02": "/data/dd6fb322f910d28879a32582ae298c5d.json", "MOCK-03": "/data/7acdf978b8d1a2632c6f0ab4064bfdef.json", "MOCK-04": "/data/18926eb00b1bddd013ce03b707774494.json", "MOCK-05": "/data/ca8e1e43110401676c9c2da86b2d62d7.json", "MOCK-06": "/data/d557591458957da523ea50d3c77c1ee2.json", "MOCK-07": "/data/0feeaf855fac98cceb71ebab95ee743e.json", "MOCK-08": "/data/5f81c95432649c111ff13fd4a1fa40b7.json", "MOCK-09": "/data/6220fb6eba3b11d0b70711894ac54908.json", "MOCK-10": "/data/e8731ea2551e7e8948e120ec576d76f7.json"};
var MOCK_IDS = ["MOCK-01", "MOCK-02", "MOCK-03", "MOCK-04", "MOCK-05", "MOCK-06", "MOCK-07", "MOCK-08", "MOCK-09", "MOCK-10"];
var FREE_MOCKS = { "MOCK-01": true };
var LIMIT_SEC = 10800;
var BANDS = [[0,29,"2 미만","찍기 수준과 큰 차이가 없습니다. 유형별 기본 접근법부터 다시 잡아야 합니다."],[30,39,"1~6","UWA 하한(각 영역 25백분위, 약 154점 추정)에도 못 미칠 가능성이 높습니다."],[40,49,"3~25","UWA 하한 경계 아래쪽입니다. 유형별 기본 전략을 익히는 단계입니다."],[50,59,"15~55","UWA 하한은 대체로 넘지만 UNSW 165점에는 아직 부족할 수 있습니다."],[60,64,"35~70","UNSW 최소 165점 경계 구간입니다. 안정권은 정답률 65% 이상입니다."],[65,69,"45~80","UNSW 165점 근처 이상, 모나쉬 최소 기준(종합 170, 영역별 165)의 경계입니다."],[70,74,"60~90","모나쉬 최소 기준 통과 가능 구간입니다. 2027 인터뷰 컷 178에는 아직 부족할 수 있습니다."],[75,79,"70~94","모나쉬 2027 인터뷰 컷(178) 경계 구간입니다. 두 영역을 고르게 유지하는 것이 중요합니다."],[80,84,"80~97","모나쉬 인터뷰 컷 178을 넘길 가능성이 높은 경쟁권입니다."],[85,89,"90~99","상위권입니다(대략 90백분위 이상 추정)."],[90,94,"95~99","최상위권입니다."],[95,100,"97~99+","최상위권입니다. 척도 상단은 압축되어 점수 차이가 작게 나타납니다."]];
var TARGETS = ["UNSW 최소 165점: 정답률 약 62~65% 이상 (안정권 68% 이상)", "모나쉬 최소 기준(종합 170, CR·QR 각 165): 종합 약 67~70% 이상, 두 영역 모두 약 63~65% 이상", "모나쉬 2027 인터뷰 컷 178: 종합 약 76~80% 이상 (안정권 80% 이상), 두 영역 차이 10%p 이내", "UWA 각 영역 25백분위: 영역별 약 50~55% 이상 (가장 불확실한 추정)"];
var CAVEAT = "점수대는 ACER 공식 환산표가 아니라 대학 공식 기준과 공개된 소수의 자료로 만든 추정입니다. 실제 ISAT은 문항 반응 이론으로 점수를 내므로 같은 정답 개수라도 시험지와 응시 집단에 따라 달라집니다. 우리 모의고사는 실제 시험과 동등화되지 않은 창작 문항이므로 결과는 범위로만 보세요. 응시 데이터가 쌓이면 구간을 다시 보정합니다.";
var SECL = { CR: "비판적 추론 (CR)", QR: "수리 추론 (QR)" };
var DIFFL = ["", "쉬움", "보통", "어려움"];

function estCenter(p) {
  if (p < 30) return 100 + p * 35.1 / 30;
  if (p <= 85) return 163 + 0.93 * (p - 60);
  return 186.25 + (p - 85) * 0.72;
}
function est(p) {
  var c = estCenter(p);
  return { mid: Math.round(c), lo: Math.max(100, Math.round(c - 6)), hi: Math.min(200, Math.round(c + 6)) };
}
function band(p) {
  var f = Math.floor(p);
  for (var i = 0; i < BANDS.length; i++) if (f >= BANDS[i][0] && f <= BANDS[i][1]) return BANDS[i];
  return BANDS[BANDS.length - 1];
}
function pctFor(target) { return Math.min(100, Math.max(0, Math.ceil(60 + (target - 163) / 0.93))); }
function lvl(e, cut) { return e.lo >= cut ? 3 : e.mid >= cut ? 2 : e.hi >= cut ? 1 : 0; }
var LV = [
  { t: "아직 부족", chip: "background: #FBF1F3; color: #6E1F2D" },
  { t: "도전권", chip: "background: #F2D9DE; color: #6E1F2D" },
  { t: "가능권", chip: "background: #F3F3F1; color: #454B55" },
  { t: "안정권", chip: "background: #E2F0EB; color: #0A5546" }
];
function fmtClock(s) { s = Math.max(0, Math.floor(s)); var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h + ':' + (m < 10 ? '0' : '') + m + ':' + (x < 10 ? '0' : '') + x; }
function fmtMin(s) { s = Math.round(s || 0); if (s < 60) return s + '초'; var m = Math.floor(s / 60), x = s % 60; return m + '분' + (x ? ' ' + x + '초' : ''); }
function lsGet(k, d) { try { var v = window.localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function lsSet(k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

function scoreMock(items, answers, spent, usedSec) {
  var sec = { CR: { n: 0, ok: 0 }, QR: { n: 0, ok: 0 } }, types = {}, diffs = { 1: { n: 0, ok: 0 }, 2: { n: 0, ok: 0 }, 3: { n: 0, ok: 0 } }, blank = 0, secTime = { CR: 0, QR: 0 };
  items.forEach(function (it) {
    var a = answers[it.id], ok = a === it.answer;
    if (!a) blank++;
    var s = sec[it.section]; if (s) { s.n++; if (ok) s.ok++; }
    var tk = it.section + '|' + it.type; if (!types[tk]) types[tk] = { sec: it.section, label: it.type, n: 0, ok: 0 }; types[tk].n++; if (ok) types[tk].ok++;
    var d = diffs[it.difficulty]; if (d) { d.n++; if (ok) d.ok++; }
    if (secTime[it.section] !== undefined) secTime[it.section] += (spent && spent[it.id]) || 0;
  });
  var crP = sec.CR.n ? sec.CR.ok / sec.CR.n * 100 : 0, qrP = sec.QR.n ? sec.QR.ok / sec.QR.n * 100 : 0;
  var cr = est(crP), qr = est(qrP);
  var ovC = (estCenter(crP) + estCenter(qrP)) / 2;
  var ov = { mid: Math.round(ovC), lo: Math.max(100, Math.round(ovC - 6)), hi: Math.min(200, Math.round(ovC + 6)) };
  return { at: Date.now(), crOk: sec.CR.ok, crN: sec.CR.n, qrOk: sec.QR.ok, qrN: sec.QR.n, crP: crP, qrP: qrP, cr: cr, qr: qr, ov: ov, types: types, diffs: diffs, blank: blank, usedSec: usedSec, secTime: secTime };
}

function uniRows(R) {
  var cr = R.cr, qr = R.qr, ov = R.ov, rows = [];
  var weak = R.crP < R.qrP ? 'CR' : 'QR';
  var m1 = Math.min(lvl(ov, 170), lvl(cr, 165), lvl(qr, 165));
  var m1c;
  if (m1 === 3) m1c = '종합과 두 영역 모두 기준을 여유 있게 넘는 범위입니다. 지원 자격은 무난하고, 실제 경쟁은 아래 인터뷰 컷에서 갈립니다.';
  else if (m1 === 2) m1c = '추정 중앙값은 기준을 넘지만 범위 하단이 걸칩니다. 한 영역만 165 아래로 떨어져도 지원 자체가 막히므로 ' + (weak === 'CR' ? '비판적 추론' : '수리 추론') + ' 보강이 먼저입니다.';
  else if (m1 === 1) m1c = '범위 상단에서만 기준에 닿습니다. 종합 정답률 약 ' + pctFor(170) + '%, 두 영역 각각 약 ' + pctFor(165) + '% 이상을 목표로 하세요.';
  else m1c = '현재 추정으로는 기준 아래입니다. 영역별 정답률을 약 ' + pctFor(165) + '% 이상으로 올리는 것이 첫 목표입니다.';
  rows.push({ name: '모나쉬 의대 (멜버른) · 지원 최소 기준', rule: '공식 · 종합 170 이상, CR·QR 각 165 이상', lv: m1, comment: m1c });
  var m2 = lvl(ov, 178), m2c;
  if (m2 === 3) m2c = '2027 인터뷰 컷 178을 넘는 범위입니다. 모나쉬는 인터뷰 대상자를 ISAT 점수만으로 고르기 때문에 이 점수대는 큰 무기입니다.';
  else if (m2 === 2) m2c = '인터뷰 컷 178 바로 위쪽입니다. 시험 당일 컨디션에 따라 갈릴 수 있으니 2~3점 여유를 더 만들어 두는 것이 좋습니다.';
  else if (m2 === 1) m2c = '178은 범위 상단에서만 닿습니다. 종합 정답률 약 ' + pctFor(178) + '% 이상이면 경계권에 들어옵니다.';
  else m2c = '인터뷰 컷 178과는 거리가 있습니다. 먼저 지원 최소 기준(170, 165/165)을 안정적으로 넘기는 것을 목표로 하세요.';
  rows.push({ name: '모나쉬 의대 (멜버른) · 2027 인터뷰 컷', rule: '공식 · 종합 178 (인터뷰 선발은 ISAT만으로)', lv: m2, comment: m2c });
  var u = lvl(ov, 165), uc;
  if (u >= 2) uc = '최소 기준 165는 ' + (u === 3 ? '여유 있게 ' : '') + '넘는 범위입니다. UNSW는 기준을 넘은 지원자를 학업 성적과 함께 순위를 매겨 약 300명을 인터뷰에 부르므로, 기준을 넘은 뒤에도 점수가 높을수록 유리합니다.';
  else if (u === 1) uc = '165에 걸치는 범위입니다. 정답률 약 ' + pctFor(165) + '% 이상이면 경계를 넘고, 안정권은 약 68% 이상입니다.';
  else uc = '최소 기준 165 아래입니다. 정답률 약 ' + pctFor(165) + '% 이상이 필요합니다.';
  rows.push({ name: 'UNSW 의대', rule: '공식 · 최소 165, 이후 학업 성적과 함께 순위', lv: u, comment: uc });
  var w = Math.min(lvl(cr, 154), lvl(qr, 154)), wc;
  if (w >= 2) wc = '두 영역 모두 25백분위(약 154점으로 추정)를 넘는 범위입니다. UWA는 이 하한을 넘은 지원자를 ISAT과 학업 성적으로 다시 선별합니다.';
  else wc = '한 영역 이상이 25백분위(약 154점 추정) 근처이거나 아래입니다. 영역별 정답률 약 50~55% 이상을 먼저 확보하세요.';
  rows.push({ name: 'UWA 의대·치대 (보장 경로)', rule: '공식 · 두 영역 모두 25백분위 이상 (점수 환산은 추정)', lv: w, comment: wc });
  var ws = ov.mid >= 175 ? 3 : ov.mid >= 165 ? 2 : ov.mid >= 155 ? 1 : 0;
  rows.push({ name: '웨스턴시드니대 의대', rule: '공식 · 최저 점수 없음, 지원자가 많으면 ISAT으로 순위', lv: ws, neutral: true, comment: '정해진 커트라인은 없고 점수가 높을수록 순위에서 앞섭니다. ' + (ov.mid >= 165 ? '현재 추정은 응시자 평균(약 163 추정)보다 위쪽이라 순위 경쟁에 도움이 됩니다.' : '현재 추정은 응시자 평균(약 163 추정) 근처나 아래라, 학업 성적으로 보완해야 합니다.') });
  var ut = lvl(ov, 163);
  rows.push({ name: '태즈메이니아대 의대', rule: '비공식 · 종합 50백분위 이상이라는 유학원 설명 (공식 확인 안 됨)', lv: ut, comment: '공식 페이지에서 확인되지 않은 기준이라 참고만 하세요. 50백분위는 약 163점으로 추정되며, 현재 범위는 ' + (ut >= 2 ? '그 위쪽입니다.' : ut === 1 ? '그 경계입니다.' : '그 아래입니다.') });
  var mm = ov.mid >= 170 ? 3 : ov.mid >= 160 ? 2 : ov.mid >= 150 ? 1 : 0;
  rows.push({ name: '모나쉬 말레이시아 의대', rule: '공식 · 순위에 반영, 기준 점수 미공개', lv: mm, neutral: true, comment: '기준 점수를 공개하지 않아 정확한 비교는 어렵습니다. 멜버른 캠퍼스보다 경쟁이 덜한 대안으로 함께 검토할 만합니다.' });
  return rows;
}

function comments(R) {
  var out = [], ov = R.ov, gap = Math.round(Math.abs(R.crP - R.qrP));
  var unis = uniRows(R), ok = unis.filter(function (u) { return u.lv >= 2 && !u.neutral && u.rule.indexOf('비공식') < 0; }).map(function (u) { return u.name.replace(' · ', ' '); });
  out.push('종합 추정 ' + ov.lo + '~' + ov.hi + '점(중앙값 ' + ov.mid + ')입니다. ' + band(R.crP / 2 + R.qrP / 2)[3]);
  if (ok.length) out.push('ISAT 기준선만 보면 ' + ok.join(', ') + ' 쪽이 가능권 이상입니다.');
  else out.push('아직 공식 기준선을 넘는 대학이 없습니다. 유형별 기본기를 잡으면 점수가 가장 빨리 오르는 구간입니다.');
  var nextCut = [154, 163, 165, 170, 178, 185].filter(function (c) { return c > ov.mid; })[0];
  if (nextCut) out.push('다음 목표는 종합 ' + nextCut + '점으로, 정답 개수로는 100문항 중 약 ' + pctFor(nextCut) + '개 이상입니다.');
  if (gap >= 10) out.push((R.crP < R.qrP ? '비판적 추론' : '수리 추론') + ' 정답률이 다른 영역보다 ' + gap + '%p 낮습니다. 모나쉬는 영역별 최소 점수가 따로 있어 약한 영역 하나가 지원을 막을 수 있습니다.');
  return out;
}

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { view: 'lobby', mock: null, cache: {}, loading: false, loadErr: false, idx: 0, now: Date.now(), submitOpen: false, revFilter: 'all', sessions: lsGet('mock-sessions', {}), results: lsGet('mock-results', {}), admin: lsGet('bank-admin', 0) === 1 };
    this.enterAt = Date.now();
  }
  componentDidMount() {
    var self = this;
    this.timer = setInterval(function () {
      if (self.state.view !== 'exam') return;
      var s = self.state.sessions[self.state.mock];
      if (s && Date.now() >= s.deadline) { self.submit(true); return; }
      self.setState({ now: Date.now() });
    }, 1000);
  }
  componentWillUnmount() { if (this.timer) clearInterval(this.timer); }
  load(id, cb) {
    var self = this;
    if (this.state.cache[id]) { cb(this.state.cache[id]); return; }
    if (!MOCK_SRC[id]) { this.setState({ loadErr: true, loading: false, view: 'lobby' }); return; }
    this.setState({ loading: true, loadErr: false });
    fetch(MOCK_SRC[id]).then(function (r) { return r.json(); }).then(function (d) {
      var c = Object.assign({}, self.state.cache); c[id] = (d.items || []).slice().sort(function (a, b) { return a.order - b.order; }); if (FREE_MOCKS[id] && !self.state.admin) c[id] = c[id].slice(0, 5);
      self.setState({ cache: c, loading: false }); cb(c[id]);
    }).catch(function () { self.setState({ loading: false, loadErr: true, view: 'lobby' }); });
  }
  saveSessions(ss) { lsSet('mock-sessions', ss); }
  logTime() {
    var S = this.state; if (S.view !== 'exam') return S.sessions;
    var items = S.cache[S.mock] || [], it = items[S.idx], ss = S.sessions;
    if (it && ss[S.mock]) {
      var add = Math.min(1800, (Date.now() - this.enterAt) / 1000);
      ss = Object.assign({}, ss); var s = Object.assign({}, ss[S.mock]); s.spent = Object.assign({}, s.spent || {}); s.spent[it.id] = (s.spent[it.id] || 0) + add; ss[S.mock] = s;
    }
    this.enterAt = Date.now();
    return ss;
  }
  go(i) {
    var S = this.state, items = S.cache[S.mock] || [];
    if (i < 0 || i >= items.length) return;
    var ss = this.logTime(); this.saveSessions(ss);
    this.setState({ idx: i, sessions: ss, submitOpen: false });
  }
  start(id) {
    var self = this;
    this.load(id, function () {
      var ss = Object.assign({}, self.state.sessions), s = ss[id];
      if (!s || s.done) { s = { answers: {}, flags: {}, spent: {}, startedAt: Date.now(), deadline: Date.now() + LIMIT_SEC * 1000, done: false }; ss[id] = s; }
      self.saveSessions(ss); self.enterAt = Date.now();
      self.setState({ sessions: ss, mock: id, view: 'exam', idx: s.lastIdx || 0, now: Date.now(), submitOpen: false });
    });
  }
  submit(auto) {
    var S = this.state, items = S.cache[S.mock] || [];
    var ss = this.logTime(); ss = Object.assign({}, ss);
    var s = Object.assign({}, ss[S.mock]);
    if (FREE_MOCKS[S.mock] && !S.admin) { s.done = true; s.result = null; ss[S.mock] = s; this.saveSessions(ss); this.setState({ sessions: ss, view: 'review', revFilter: 'all', idx: 0, submitOpen: false }); return; }
    var used = Math.min(LIMIT_SEC, (Date.now() - s.startedAt) / 1000);
    var R = scoreMock(items, s.answers || {}, s.spent || {}, used); R.auto = !!auto;
    s.done = true; s.result = R; ss[S.mock] = s;
    var res = Object.assign({}, S.results); res[S.mock] = (res[S.mock] || []).concat([{ at: R.at, ov: R.ov, cr: R.cr, qr: R.qr, crOk: R.crOk, qrOk: R.qrOk }]);
    this.saveSessions(ss); lsSet('mock-results', res);
    this.setState({ sessions: ss, results: res, view: 'result', submitOpen: false });
  }
  renderVals() {
    var self = this, S = this.state;
    var sessions = S.sessions || {}, results = S.results || {};
    var mocks = MOCK_IDS.map(function (id, i) {
      var s = sessions[id], open = S.admin || FREE_MOCKS[id], hist = results[id] || [], last = hist[hist.length - 1];
      var inProg = s && !s.done && Date.now() < s.deadline;
      return {
        title: '모의고사 ' + (i + 1) + '회', tag: FREE_MOCKS[id] ? '맛보기 5문항' : (i < 2 ? '진단' : '실전'), tagStyle: FREE_MOCKS[id] ? 'background: #E2F0EB; color: #0A5546' : 'background: #F3F3F1; color: #454B55',
        desc: i < 2 ? '진단용 · 쉬운 문항 비중이 조금 높아 첫 응시에 적합' : '실전형 · 실제 시험 난이도 배분',
        last: last ? '최근 결과 종합 ' + last.ov.lo + '~' + last.ov.hi + '점 (응시 ' + hist.length + '회)' : (inProg ? '진행 중 · 남은 시간 ' + fmtClock((s.deadline - Date.now()) / 1000) : ''),
        canStart: !!open, startLabel: inProg ? '이어 풀기' : (last ? '다시 응시' : '시작하기'), locked: !open, hasResult: !!(s && s.done && s.result),
        start: function () { self.start(id); },
        showResult: function () { self.load(id, function () { self.setState({ mock: id, view: 'result' }); }); }
      };
    });
    var base = {
      isLobby: S.view === 'lobby' && !S.loading, isLoading: S.loading, inExam: S.view === 'exam' && !S.loading, notExam: S.view !== 'exam', isReview: S.view === 'review' && !S.loading, isResult: S.view === 'result' && !S.loading,
      showPaper: (S.view === 'exam' || S.view === 'review') && !S.loading,
      mocks: mocks, targets: TARGETS, caveat: CAVEAT, loadErr: S.loadErr, admin: S.admin,
      toggleAdmin: function () { var v = !self.state.admin; lsSet('bank-admin', v ? 1 : 0); self.setState({ admin: v }); },
      examTitle: '', answeredN: 0, timeLeft: '', timerStyle: '', openSubmit: function () {}, navTitle: '', navs: [], legend: [], revFilters: [], q: { options: [], th: [], tr: [] }, pace50: '', leftN: 0, totalN: 100, flagN: 0,
      submitOpen: false, submitMsg: '', doSubmit: function () {}, closeSubmit: function () {}, prev: function () {}, next: function () {}, toggleFlag: function () {}, clearAns: function () {},
      backToResult: function () { var s0 = (self.state.sessions || {})[self.state.mock]; self.setState({ view: s0 && s0.result ? 'result' : 'lobby' }); }, openReview: function () { self.setState({ view: 'review', idx: 0, revFilter: 'all' }); }, toLobby: function () { self.setState({ view: 'lobby' }); },
      r: { secs: [], unis: [], types: [], diffs: [], times: [], next: [], comments: [] }
    };
    var items = S.mock ? (S.cache[S.mock] || []) : [];
    var sess = S.mock ? sessions[S.mock] : null;
    var mockNo = S.mock ? MOCK_IDS.indexOf(S.mock) + 1 : 0;
    if ((S.view === 'exam' || S.view === 'review') && items.length && sess) {
      var exam = S.view === 'exam', A = sess.answers || {}, F = sess.flags || {};
      var order = items.map(function (it, i) { return i; });
      if (!exam && S.revFilter === 'wrong') order = order.filter(function (i) { return A[items[i].id] !== items[i].answer; });
      if (!exam && S.revFilter === 'flag') order = order.filter(function (i) { return F[items[i].id]; });
      var cur = items[S.idx] || items[0];
      var left = (sess.deadline - S.now) / 1000;
      var answeredN = items.filter(function (it) { return A[it.id]; }).length;
      var flagN = items.filter(function (it) { return F[it.id]; }).length;
      base.examTitle = '모의고사 ' + mockNo + '회'; base.answeredN = answeredN; base.leftN = items.length - answeredN; base.totalN = items.length; if (items.length < 100) base.examTitle = '모의고사 ' + mockNo + '회 맛보기'; base.flagN = flagN;
      base.timeLeft = fmtClock(left); base.timerStyle = left < 600 ? 'background: #8E2A3B; color: #FFFFFF' : left < 1800 ? 'background: #F2D9DE; color: #1C1F24' : 'background: rgba(255,255,255,.12); color: #FFFFFF';
      base.pace50 = '1시간 30분 (지금 ' + fmtClock(LIMIT_SEC - left) + ' 경과)';
      base.navTitle = exam ? '문항 이동' : '문항별 정오';
      base.navs = order.map(function (i) {
        var it = items[i], a = A[it.id], st;
        if (exam) st = a ? 'border: 1px solid #1C1F24; background: #1C1F24; color: #FFFFFF' : 'border: 1px solid #C8C9C6; background: #FFFFFF; color: #1C1F24';
        else st = a === it.answer ? 'border: 1px solid #0F6E5A; background: #0F6E5A; color: #FFFFFF' : a ? 'border: 1px solid #8E2A3B; background: #8E2A3B; color: #FFFFFF' : 'border: 1px dashed #8E2A3B; background: #FFFFFF; color: #8E2A3B';
        if (F[it.id]) st += '; box-shadow: inset 0 -4px 0 #F2D9DE';
        if (i === S.idx) st += '; outline: 2px solid #F2D9DE; outline-offset: 1px';
        return { no: it.order, style: st, aria: it.order + '번' + (a ? ' 답함' : ' 안 함') + (F[it.id] ? ', 다시 볼 문항' : ''), pick: function () { exam ? self.go(i) : self.setState({ idx: i }); } };
      });
      base.legend = exam ? [{ label: '답함', style: 'background: #1C1F24' }, { label: '안 함', style: 'border: 1px solid #C8C9C6; background: #FFFFFF' }, { label: '다시 볼 문항', style: 'background: #FFFFFF; box-shadow: inset 0 -4px 0 #F2D9DE; border: 1px solid #C8C9C6' }]
        : [{ label: '정답', style: 'background: #0F6E5A' }, { label: '오답', style: 'background: #8E2A3B' }, { label: '안 풂', style: 'border: 1px dashed #8E2A3B; background: #FFFFFF' }];
      base.revFilters = [['all', '전체'], ['wrong', '틀린 문항'], ['flag', '표시한 문항']].map(function (f) { var on = S.revFilter === f[0]; return { label: f[1], style: on ? 'border: 0; background: #1C1F24; color: #FFFFFF; font-weight: 700' : 'border: 1px solid #C8C9C6; background: #FFFFFF; color: #1C1F24', pick: function () { var o2 = items.map(function (x, i) { return i; }).filter(function (i) { return f[0] === 'all' || (f[0] === 'wrong' ? A[items[i].id] !== items[i].answer : F[items[i].id]); }); self.setState({ revFilter: f[0], idx: o2.length ? o2[0] : self.state.idx }); } }; });
      var setItems = cur.setId ? items.filter(function (x) { return x.setId === cur.setId; }) : [];
      var mine = A[cur.id], okq = mine === cur.answer;
      base.q = {
        no: cur.order, sec: SECL[cur.section] || cur.section, type: cur.type, diff: DIFFL[cur.difficulty] || '', inSet: setItems.length > 1, setPos: (setItems.indexOf(cur) + 1) + '/' + setItems.length,
        flagged: F[cur.id] ? 'true' : 'false', flagLabel: F[cur.id] ? '★ 다시 볼 문항' : '☆ 다시 볼 문항 표시', flagStyle: F[cur.id] ? 'border: 0; background: #F2D9DE; color: #1C1F24' : 'border: 1px solid #C8C9C6; background: #FFFFFF; color: #1C1F24',
        spent: fmtMin((sess.spent || {})[cur.id]),
        hasStim: !!cur.stimulus, stimulus: cur.stimulus || '', hasTable: !!cur.table, tableTitle: cur.table ? cur.table.title || '' : '', th: cur.table ? cur.table.headers || [] : [], tr: cur.table ? cur.table.rows || [] : [],
        question: cur.question, explanation: cur.explanation_ko || '',
        verdict: !mine ? '풀지 않은 문항입니다. 정답은 ' + cur.answer + '입니다.' : okq ? '정답입니다.' : '내 답 ' + mine + ', 정답은 ' + cur.answer + '입니다.',
        verdictBox: okq ? 'background: #E2F0EB' : 'background: #FBF1F3',
        options: (cur.options || []).map(function (o) {
          var sel = mine === o.id, right = o.id === cur.answer, st = 'border: 1px solid #C8C9C6; background: #FFFFFF; color: #1C1F24', tag = '';
          if (exam && sel) st = 'border: 2px solid #1C1F24; background: #F3F3F1; color: #1C1F24';
          if (!exam && right) { st = 'border: 2px solid #0F6E5A; background: #E2F0EB; color: #1C1F24'; tag = '정답'; }
          if (!exam && sel && !right) { st = 'border: 2px solid #8E2A3B; background: #FBF1F3; color: #1C1F24'; tag = '내 답'; }
          return { id: o.id, text: o.text, style: st, tag: tag, checked: sel ? 'true' : 'false', pick: function () {
            if (!exam) return;
            var ss = Object.assign({}, self.state.sessions), s = Object.assign({}, ss[S.mock]); s.answers = Object.assign({}, s.answers); s.answers[cur.id] = o.id; s.lastIdx = S.idx; ss[S.mock] = s; self.saveSessions(ss); self.setState({ sessions: ss });
          } };
        })
      };
      var pos = order.indexOf(S.idx);
      base.prev = function () { var t = exam ? S.idx - 1 : order[pos - 1]; if (t === undefined || t < 0) return; exam ? self.go(t) : self.setState({ idx: t }); };
      base.next = function () { var t = exam ? S.idx + 1 : order[pos + 1]; if (t === undefined || t >= items.length) { if (exam) self.setState({ submitOpen: true }); return; } exam ? self.go(t) : self.setState({ idx: t }); };
      base.toggleFlag = function () { var ss = Object.assign({}, self.state.sessions), s = Object.assign({}, ss[S.mock]); s.flags = Object.assign({}, s.flags); if (s.flags[cur.id]) delete s.flags[cur.id]; else s.flags[cur.id] = 1; ss[S.mock] = s; self.saveSessions(ss); self.setState({ sessions: ss }); };
      base.clearAns = function () { var ss = Object.assign({}, self.state.sessions), s = Object.assign({}, ss[S.mock]); s.answers = Object.assign({}, s.answers); delete s.answers[cur.id]; ss[S.mock] = s; self.saveSessions(ss); self.setState({ sessions: ss }); };
      base.openSubmit = function () { self.setState({ submitOpen: true }); };
      base.closeSubmit = function () { self.setState({ submitOpen: false }); };
      base.doSubmit = function () { self.submit(false); };
      base.submitOpen = exam && S.submitOpen;
      base.submitMsg = items.length < 100 ? '맛보기 ' + items.length + '문항을 제출하면 정답과 해설을 바로 볼 수 있습니다. 전체 100문항 실전 세트는 30,000원입니다.' : (100 - answeredN ? '아직 ' + (100 - answeredN) + '문항을 풀지 않았습니다. 틀려도 감점이 없으니 비워 두지 말고 고르는 편이 유리합니다. ' : '100문항 모두 답했습니다. ') + (flagN ? '다시 볼 문항 ' + flagN + '개가 남아 있습니다. ' : '') + '남은 시간 ' + fmtClock(left) + '. 제출하면 답을 바꿀 수 없습니다.';
    }
    if (S.view === 'result' && sess && sess.result) {
      var R = sess.result;
      var b = band((R.crP + R.qrP) / 2);
      var typeRows = Object.keys(R.types).map(function (k) { return R.types[k]; }).sort(function (a, b2) { return (a.ok / a.n) - (b2.ok / b2.n) || b2.n - a.n; });
      var weak = typeRows.filter(function (t) { return t.n >= 2 && t.ok / t.n < 0.7; }).slice(0, 3);
      var spent = sess.spent || {};
      var slow = items.filter(function (it) { return (spent[it.id] || 0) > (it.timeSec || 108) * 2; }).length;
      var nx = [];
      if (weak.length) nx.push('약한 유형부터: ' + weak.map(function (t) { return t.label + ' (' + t.ok + '/' + t.n + ')'; }).join(', '));
      if (R.blank) nx.push('비워 둔 문항이 ' + R.blank + '개입니다. 감점이 없으니 마지막 5분은 남은 문항을 모두 찍는 데 쓰세요.');
      if (slow) nx.push('권장 시간의 두 배 넘게 쓴 문항이 ' + slow + '개입니다. 2분이 넘어가면 표시하고 넘어가는 연습을 하세요.');
      nx.push('틀린 문항 해설을 먼저 읽고, 일주일 뒤 같은 회차를 다시 풀어 보면 유형 이해도가 확인됩니다.');
      var unis = uniRows(R);
      base.r = {
        title: '모의고사 ' + mockNo + '회' + (R.auto ? ' (시간 종료 자동 제출)' : ''), when: new Date(R.at).toLocaleString('ko-KR'),
        ovRange: R.ov.lo + '–' + R.ov.hi, ovMid: R.ov.mid, totRaw: R.crOk + R.qrOk, totPct: Math.round((R.crOk + R.qrOk) / Math.max(1, R.crN + R.qrN) * 100), ovPctile: b[2],
        secs: [['CR', R.cr, R.crOk, R.crP], ['QR', R.qr, R.qrOk, R.qrP]].map(function (x) { return { label: SECL[x[0]], range: x[1].lo + '–' + x[1].hi, mid: x[1].mid, raw: x[2], pct: Math.round(x[3]), bar: 'width: ' + Math.round(x[3]) + '%', note: band(x[3])[3] }; }),
        comments: comments(R),
        unis: unis.map(function (u) { return { name: u.name, rule: u.rule, level: u.neutral ? '기준 없음 · 순위 반영' : LV[u.lv].t, chip: u.neutral ? 'background: #F3F3F1; color: #454B55' : LV[u.lv].chip, comment: u.comment }; }),
        types: typeRows.map(function (t) { var p = Math.round(t.ok / t.n * 100); return { sec: t.sec, label: t.label, raw: t.ok + '/' + t.n, pct: p + '%', bar: 'width: ' + p + '%; background: ' + (p >= 70 ? '#0F6E5A' : p >= 50 ? '#F2D9DE' : '#8E2A3B') }; }),
        diffs: [1, 2, 3].map(function (d) { var x = R.diffs[d]; return { label: DIFFL[d], val: x.n ? x.ok + '/' + x.n + ' (' + Math.round(x.ok / x.n * 100) + '%)' : '-' }; }),
        times: [{ label: '사용 시간', val: fmtClock(R.usedSec) + ' / 3:00:00' }, { label: 'CR에 쓴 시간', val: fmtMin(R.secTime.CR) }, { label: 'QR에 쓴 시간', val: fmtMin(R.secTime.QR) }, { label: '비워 둔 문항', val: R.blank + '개' }],
        next: nx
      };
    }
    return base;
  }
}

Component.prototype.__tpl = function (v: any) {
  return (<><style dangerouslySetInnerHTML={{ __html: "html,body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}\nh1,h2,h3,h4{letter-spacing:-0.035em;line-height:1.28;text-wrap:balance}\np,li,td,th,dd,dt,span,a,button{letter-spacing:-0.012em}\nstrong{letter-spacing:-0.02em}\nbody{margin:0;background:#F3F3F1}\na{color:#0F6E5A}a:hover{color:#0A5546}\nbutton:focus-visible,a:focus-visible{outline:3px solid #9CCFC0;outline-offset:2px}\n.navb:hover{filter:brightness(.96)}\n.mcard:hover{border-color:#0F6E5A}" }} />
<div style={{"fontFamily": "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif", "color": "#1C1F24", "background": "#F3F3F1", "width": "100%", "minHeight": "1400px", "fontSize": "16px", "lineHeight": "1.7", "wordBreak": "keep-all", "overflowWrap": "break-word"}}>{" "}<header style={{"background": "#1C1F24", "color": "#FFFFFF", "position": "sticky", "top": "0", "zIndex": "5"}}>{" "}<div style={{"maxWidth": "1320px", "margin": "0 auto", "padding": "12px 24px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "10px 20px"}}>{" "}<a href={"/medical"} style={{"display": "flex", "alignItems": "center", "gap": "10px", "textDecoration": "none", "color": "#FFFFFF", "marginRight": "auto"}}>{" "}<svg width={"32"} height={"32"} viewBox={"0 0 34 34"} aria-hidden={"true"}><rect width={"34"} height={"34"} rx={"9"} fill={"#FFFFFF"}></rect><path d={"M17 8v18M8 17h18"} stroke={"#F2D9DE"} strokeWidth={"3"} strokeLinecap={"round"}></path></svg>{" "}<span style={{"fontWeight": "800", "fontSize": "18px"}}>{"AusUhak 메디컬 · ISAT 실전 모의고사"}</span>{" "}</a>{" "}{v?.inExam ? (<>{" "}<span style={{"display": "flex", "alignItems": "center", "gap": "12px", "flexWrap": "wrap"}}>{" "}<span style={{"fontSize": "14px", "color": "#E7E7E4"}}>{v?.examTitle}{" · 푼 문항 "}<strong style={{"color": "#FFFFFF"}}>{v?.answeredN}</strong>{"/"}{v?.totalN}</span>{" "}<span role={"timer"} aria-live={"off"} style={css(`min-width: 118px; text-align: center; padding: 6px 14px; border-radius: 10px; font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums; ${v?.timerStyle ?? ''}`)}>{v?.timeLeft}</span>{" "}<button type={"button"} onClick={v?.openSubmit} style={{"minHeight": "40px", "padding": "0 18px", "borderRadius": "10px", "border": "0", "background": "#8E2A3B", "color": "#FFFFFF", "font": "inherit", "fontWeight": "800", "cursor": "pointer"}}>{"제출하기"}</button>{" "}</span>{" "}</>) : null}{" "}{v?.notExam ? (<>{" "}<nav style={{"display": "flex", "gap": "6px", "flexWrap": "wrap"}}>{" "}<a href={"/medical/ucat-mock"} style={{"color": "#FFFFFF", "textDecoration": "none", "padding": "8px 12px", "borderRadius": "8px", "border": "1px solid rgba(255,255,255,.3)", "fontSize": "14px"}}>{"UCAT 모의고사"}</a>{" "}<a href={"/medical/isat"} style={{"color": "#FFFFFF", "textDecoration": "none", "padding": "8px 12px", "borderRadius": "8px", "border": "1px solid rgba(255,255,255,.3)", "fontSize": "14px"}}>{"문제은행"}</a>{" "}<a href={"/medical/scores"} style={{"color": "#FFFFFF", "textDecoration": "none", "padding": "8px 12px", "borderRadius": "8px", "border": "1px solid rgba(255,255,255,.3)", "fontSize": "14px"}}>{"합격선"}</a>{" "}<a href={"/medical/services"} style={{"color": "#1C1F24", "background": "#F2D9DE", "textDecoration": "none", "padding": "8px 12px", "borderRadius": "8px", "fontSize": "14px", "fontWeight": "800"}}>{"요금·상담"}</a>{" "}</nav>{" "}</>) : null}{" "}</div>{" "}</header>{" "}{v?.isLobby ? (<>{" "}<div style={{"maxWidth": "1320px", "margin": "0 auto", "padding": "28px 24px 48px", "display": "flex", "flexDirection": "column", "gap": "22px"}}>{" "}<section style={{"background": "#1C1F24", "color": "#FFFFFF", "borderRadius": "22px", "padding": "32px", "display": "flex", "flexWrap": "wrap", "gap": "24px", "alignItems": "center"}}>{" "}<div style={{"flex": "1 1 460px", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<span style={{"alignSelf": "flex-start", "padding": "4px 10px", "borderRadius": "6px", "background": "#F2D9DE", "color": "#1C1F24", "fontSize": "12px", "fontWeight": "800"}}>{"ISAT 실전 10회분"}</span>{" "}<h1 style={{"margin": "0", "fontSize": "34px"}}>{"실제 시험처럼 3시간, 100문항"}</h1>{" "}<p style={{"margin": "0", "color": "#E7E7E4", "fontSize": "17px"}}>{"비판적 추론(CR) 50문항과 수리 추론(QR) 50문항이 실제 시험처럼 섞여 나옵니다. 계산기 없이 풀고, 제출하면 영역별 추정 점수대와 함께 모나쉬·UNSW·UWA 같은 대학 기준에 어디쯤인지 코멘트를 드립니다."}</p>{" "}</div>{" "}<div style={{"flex": "1 1 300px", "display": "grid", "gridTemplateColumns": "repeat(2, minmax(0, 1fr))", "gap": "10px"}}>{" "}<div style={{"background": "rgba(255,255,255,.08)", "borderRadius": "14px", "padding": "14px"}}><strong style={{"display": "block", "fontSize": "24px"}}>{"100"}</strong><span style={{"fontSize": "13px", "color": "#E7E7E4"}}>{"문항 (4지선다 위주)"}</span></div>{" "}<div style={{"background": "rgba(255,255,255,.08)", "borderRadius": "14px", "padding": "14px"}}><strong style={{"display": "block", "fontSize": "24px"}}>{"3시간"}</strong><span style={{"fontSize": "13px", "color": "#E7E7E4"}}>{"타이머, 새로고침해도 유지"}</span></div>{" "}<div style={{"background": "rgba(255,255,255,.08)", "borderRadius": "14px", "padding": "14px"}}><strong style={{"display": "block", "fontSize": "24px"}}>{"CR · QR"}</strong><span style={{"fontSize": "13px", "color": "#E7E7E4"}}>{"영역별 점수대 따로"}</span></div>{" "}<div style={{"background": "rgba(255,255,255,.08)", "borderRadius": "14px", "padding": "14px"}}><strong style={{"display": "block", "fontSize": "24px"}}>{"해설"}</strong><span style={{"fontSize": "13px", "color": "#E7E7E4"}}>{"전 문항 한국어 해설"}</span></div>{" "}</div>{" "}</section>{" "}{v?.loadErr ? (<><div style={{"background": "#FBF1F3", "color": "#6E1F2D", "borderRadius": "12px", "padding": "14px 18px"}}>{"문제를 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요."}</div></>) : null}{" "}<section style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fill, minmax(240px, 1fr))", "gap": "14px"}}>{" "}{(v?.mocks || []).map((m: any, __i0: number) => (<Fragment key={__i0}>{" "}<article className={"mcard"} style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "padding": "18px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<span style={{"display": "flex", "justifyContent": "space-between", "alignItems": "center", "gap": "8px"}}>{" "}<strong style={{"fontSize": "19px"}}>{m?.title}</strong>{" "}<span style={css(`padding: 2px 9px; border-radius: 6px; font-size: 12px; font-weight: 800; ${m?.tagStyle ?? ''}`)}>{m?.tag}</span>{" "}</span>{" "}<span style={{"fontSize": "14px", "color": "#5C6370"}}>{m?.desc}</span>{" "}<span style={{"fontSize": "13px", "color": "#454B55", "minHeight": "22px"}}>{m?.last}</span>{" "}<span style={{"display": "flex", "gap": "6px", "flexWrap": "wrap", "marginTop": "auto"}}>{" "}{m?.canStart ? (<><button type={"button"} onClick={m?.start} style={{"minHeight": "42px", "padding": "0 16px", "borderRadius": "10px", "border": "0", "background": "#0F6E5A", "color": "#FFFFFF", "font": "inherit", "fontWeight": "800", "cursor": "pointer"}}>{m?.startLabel}</button></>) : null}{" "}{m?.hasResult ? (<><button type={"button"} onClick={m?.showResult} style={{"minHeight": "42px", "padding": "0 14px", "borderRadius": "10px", "border": "1px solid #C8C9C6", "background": "#FFFFFF", "color": "#1C1F24", "font": "inherit", "cursor": "pointer"}}>{"결과 보기"}</button></>) : null}{" "}{m?.locked ? (<><a href={"/medical/services"} style={{"display": "inline-flex", "alignItems": "center", "minHeight": "42px", "padding": "0 16px", "borderRadius": "10px", "background": "#F2D9DE", "color": "#6E1F2D", "textDecoration": "none", "fontWeight": "800"}}>{"세트당 30,000원"}</a></>) : null}{" "}</span>{" "}</article>{" "}</Fragment>))}{" "}</section>{" "}<section style={{"display": "flex", "flexWrap": "wrap", "gap": "14px"}}>{" "}<div style={{"flex": "1 1 420px", "minWidth": "0", "background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<h2 style={{"margin": "0", "fontSize": "20px"}}>{"대학 기준, 정답률로 보면"}</h2>{" "}<ul style={{"margin": "0", "paddingLeft": "20px", "display": "flex", "flexDirection": "column", "gap": "6px", "fontSize": "15px", "color": "#454B55"}}>{(v?.targets || []).map((t: any, __i0: number) => (<Fragment key={__i0}><li >{t}</li></Fragment>))}</ul>{" "}</div>{" "}<div style={{"flex": "1 1 420px", "minWidth": "0", "background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<h2 style={{"margin": "0", "fontSize": "20px"}}>{"시험 보기 전에"}</h2>{" "}<ul style={{"margin": "0", "paddingLeft": "20px", "display": "flex", "flexDirection": "column", "gap": "6px", "fontSize": "15px", "color": "#454B55"}}><li >{"조용한 곳에서 3시간을 한 번에 확보하세요. 중간에 창을 닫아도 남은 시간은 계속 흐릅니다."}</li><li >{"계산기 없이 종이와 펜만 준비하세요. 실제 ISAT도 계산기를 쓸 수 없습니다."}</li><li >{"틀려도 감점이 없으니 모르는 문항도 비워 두지 말고 고르세요."}</li><li >{"헷갈리는 문항은 \"다시 볼 문항\"으로 표시해 두고 마지막에 돌아오세요."}</li></ul>{" "}</div>{" "}</section>{" "}<p style={{"margin": "0", "fontSize": "12px", "color": "#5C6370"}}>{v?.caveat}</p>{" "}<p style={{"margin": "0", "fontSize": "12px", "color": "#5C6370"}}>{"모든 문항은 공식 안내서의 유형을 분석해 새로 만든 오리지널 문항입니다. 실제 시험 문제가 아니며 ACER와 제휴 관계가 없습니다."}</p>{" "}<label style={{"display": "flex", "gap": "8px", "alignItems": "center", "fontSize": "12px", "color": "#5C6370"}}><input type={"checkbox"} onChange={v?.toggleAdmin} checked={!!(v?.admin)} />{"검수 모드 (전체 회차 열기)"}</label>{" "}</div>{" "}</>) : null}{" "}{v?.isLoading ? (<>{" "}<div style={{"maxWidth": "1320px", "margin": "0 auto", "padding": "40px 24px"}}><div style={{"background": "#FFFFFF", "borderRadius": "16px", "padding": "28px", "color": "#5C6370"}}>{"문제를 불러오는 중입니다…"}</div></div>{" "}</>) : null}{" "}{v?.showPaper ? (<>{" "}<div style={{"maxWidth": "1320px", "margin": "0 auto", "padding": "22px 24px 48px", "display": "flex", "flexWrap": "wrap", "gap": "20px", "alignItems": "flex-start"}}>{" "}<aside style={{"flex": "1 1 280px", "maxWidth": "330px", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "12px"}}>{" "}<div style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "16px", "padding": "16px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<strong style={{"fontSize": "14px"}}>{v?.navTitle}</strong>{" "}{v?.isReview ? (<>{" "}<div style={{"display": "flex", "gap": "6px", "flexWrap": "wrap"}}>{" "}{(v?.revFilters || []).map((f: any, __i0: number) => (<Fragment key={__i0}>{" "}<button type={"button"} onClick={f?.pick} style={css(`min-height: 34px; padding: 0 12px; border-radius: 999px; font: inherit; font-size: 13px; cursor: pointer; ${f?.style ?? ''}`)}>{f?.label}</button>{" "}</Fragment>))}{" "}</div>{" "}</>) : null}{" "}<div style={{"display": "grid", "gridTemplateColumns": "repeat(10, minmax(0, 1fr))", "gap": "4px"}}>{" "}{(v?.navs || []).map((n: any, __i0: number) => (<Fragment key={__i0}>{" "}<button type={"button"} className={"navb"} onClick={n?.pick} aria-label={n?.aria} style={css(`aspect-ratio: 1; min-width: 0; padding: 0; border-radius: 6px; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; ${n?.style ?? ''}`)}>{n?.no}</button>{" "}</Fragment>))}{" "}</div>{" "}<div style={{"display": "flex", "flexWrap": "wrap", "gap": "6px 12px", "fontSize": "12px", "color": "#5C6370"}}>{" "}{(v?.legend || []).map((l: any, __i0: number) => (<Fragment key={__i0}><span style={{"display": "inline-flex", "alignItems": "center", "gap": "5px"}}><span style={css(`width: 12px; height: 12px; border-radius: 3px; ${l?.style ?? ''}`)}></span>{l?.label}</span></Fragment>))}{" "}</div>{" "}</div>{" "}{v?.isReview ? (<>{" "}<button type={"button"} onClick={v?.backToResult} style={{"minHeight": "44px", "borderRadius": "10px", "border": "1px solid #C8C9C6", "background": "#FFFFFF", "color": "#1C1F24", "font": "inherit", "fontWeight": "700", "cursor": "pointer"}}>{"← 돌아가기"}</button>{" "}</>) : null}{" "}{v?.inExam ? (<>{" "}<div style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "16px", "padding": "14px 16px", "fontSize": "13px", "color": "#454B55", "display": "flex", "flexDirection": "column", "gap": "4px"}}>{" "}<span >{"권장 페이스: 50번까지 약 "}{v?.pace50}</span>{" "}<span >{"남은 문항 "}{v?.leftN}{"개 · 다시 볼 문항 "}{v?.flagN}{"개"}</span>{" "}</div>{" "}</>) : null}{" "}</aside>{" "}<main style={{"flex": "999 1 600px", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "14px"}}>{" "}<article style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "overflow": "hidden"}}>{" "}<div style={{"padding": "14px 22px", "background": "#F3F3F1", "borderBottom": "1px solid #E7E7E4", "display": "flex", "flexWrap": "wrap", "gap": "8px 14px", "alignItems": "center", "justifyContent": "space-between"}}>{" "}<span style={{"display": "flex", "gap": "8px", "flexWrap": "wrap", "alignItems": "center"}}>{" "}<strong style={{"fontSize": "18px"}}>{v?.q?.no}{"번"}</strong>{" "}<span style={{"padding": "3px 10px", "borderRadius": "6px", "background": "#1C1F24", "color": "#FFFFFF", "fontSize": "12px", "fontWeight": "800"}}>{v?.q?.sec}</span>{" "}{v?.isReview ? (<><span style={{"padding": "3px 10px", "borderRadius": "6px", "background": "#E2F0EB", "color": "#0A5546", "fontSize": "12px", "fontWeight": "700"}}>{v?.q?.type}{" · "}{v?.q?.diff}</span></>) : null}{" "}{v?.q?.inSet ? (<><span style={{"fontSize": "13px", "color": "#5C6370"}}>{"같은 지문 "}{v?.q?.setPos}</span></>) : null}{" "}</span>{" "}{v?.inExam ? (<>{" "}<button type={"button"} onClick={v?.toggleFlag} aria-pressed={v?.q?.flagged} style={css(`min-height: 36px; padding: 0 14px; border-radius: 999px; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; ${v?.q?.flagStyle ?? ''}`)}>{v?.q?.flagLabel}</button>{" "}</>) : null}{" "}{v?.isReview ? (<><span style={{"fontSize": "13px", "color": "#5C6370"}}>{"내 시간 "}{v?.q?.spent}</span></>) : null}{" "}</div>{" "}<div style={{"padding": "24px", "display": "flex", "flexDirection": "column", "gap": "18px"}}>{" "}{v?.q?.hasStim ? (<><div lang={"en"} style={{"background": "#F3F3F1", "borderLeft": "4px solid #1C1F24", "borderRadius": "8px", "padding": "16px 18px", "fontSize": "16px", "lineHeight": "1.75", "whiteSpace": "pre-line"}}>{v?.q?.stimulus}</div></>) : null}{" "}{v?.q?.hasTable ? (<>{" "}<div style={{"overflowX": "auto", "border": "1px solid #E7E7E4", "borderRadius": "10px"}}>{" "}<div lang={"en"} style={{"padding": "8px 12px", "fontSize": "13px", "fontWeight": "700", "background": "#F3F3F1"}}>{v?.q?.tableTitle}</div>{" "}<table lang={"en"} style={{"width": "100%", "borderCollapse": "collapse", "fontSize": "14px", "fontVariantNumeric": "tabular-nums"}}><thead ><tr >{(v?.q?.th || []).map((h: any, __i0: number) => (<Fragment key={__i0}><th style={{"padding": "8px 12px", "textAlign": "left", "background": "#1C1F24", "color": "#FFFFFF", "whiteSpace": "nowrap"}}>{h}</th></Fragment>))}</tr></thead><tbody >{(v?.q?.tr || []).map((tr: any, __i0: number) => (<Fragment key={__i0}><tr style={{"borderTop": "1px solid #E7E7E4"}}>{(tr || []).map((c: any, __i2: number) => (<Fragment key={__i2}><td style={{"padding": "8px 12px"}}>{c}</td></Fragment>))}</tr></Fragment>))}</tbody></table>{" "}</div>{" "}</>) : null}{" "}<p lang={"en"} style={{"margin": "0", "fontSize": "18px", "fontWeight": "600", "lineHeight": "1.6"}}>{v?.q?.question}</p>{" "}<div role={"radiogroup"} aria-label={"보기"} style={{"display": "flex", "flexDirection": "column", "gap": "8px"}}>{" "}{(v?.q?.options || []).map((o: any, __i0: number) => (<Fragment key={__i0}>{" "}<button type={"button"} role={"radio"} aria-checked={o?.checked} onClick={o?.pick} lang={"en"} style={css(`min-height: 52px; padding: 10px 16px; border-radius: 10px; font: inherit; font-size: 16px; text-align: left; cursor: pointer; display: flex; gap: 12px; align-items: flex-start; ${o?.style ?? ''}`)}><strong style={{"flex": "none"}}>{o?.id}{"."}</strong><span style={{"flex": "1"}}>{o?.text}</span><span style={{"flex": "none", "fontSize": "13px", "fontWeight": "800"}}>{o?.tag}</span></button>{" "}</Fragment>))}{" "}</div>{" "}<div style={{"display": "flex", "flexWrap": "wrap", "gap": "8px", "justifyContent": "space-between", "alignItems": "center"}}>{" "}<span style={{"display": "flex", "gap": "8px"}}>{" "}<button type={"button"} onClick={v?.prev} style={{"minHeight": "46px", "padding": "0 18px", "borderRadius": "10px", "border": "1px solid #C8C9C6", "background": "#FFFFFF", "color": "#1C1F24", "font": "inherit", "cursor": "pointer"}}>{"← 이전"}</button>{" "}<button type={"button"} onClick={v?.next} style={{"minHeight": "46px", "padding": "0 18px", "borderRadius": "10px", "border": "0", "background": "#1C1F24", "color": "#FFFFFF", "font": "inherit", "fontWeight": "700", "cursor": "pointer"}}>{"다음 →"}</button>{" "}</span>{" "}{v?.inExam ? (<><button type={"button"} onClick={v?.clearAns} style={{"minHeight": "40px", "padding": "0 14px", "borderRadius": "10px", "border": "0", "background": "transparent", "color": "#5C6370", "font": "inherit", "fontSize": "14px", "textDecoration": "underline", "cursor": "pointer"}}>{"선택 지우기"}</button></>) : null}{" "}</div>{" "}{v?.isReview ? (<>{" "}<div style={css(`border-radius: 12px; padding: 18px 20px; display: flex; flex-direction: column; gap: 8px; ${v?.q?.verdictBox ?? ''}`)}>{" "}<strong style={{"fontSize": "17px"}}>{v?.q?.verdict}</strong>{" "}<p style={{"margin": "0", "fontSize": "15px", "lineHeight": "1.85", "color": "#454B55", "whiteSpace": "pre-line"}}>{v?.q?.explanation}</p>{" "}</div>{" "}</>) : null}{" "}</div>{" "}</article>{" "}{v?.submitOpen ? (<>{" "}<div role={"dialog"} aria-label={"제출 확인"} style={{"background": "#1C1F24", "color": "#FFFFFF", "borderRadius": "18px", "padding": "24px", "display": "flex", "flexDirection": "column", "gap": "12px"}}>{" "}<strong style={{"fontSize": "21px"}}>{"제출할까요?"}</strong>{" "}<span style={{"color": "#E7E7E4"}}>{v?.submitMsg}</span>{" "}<span style={{"display": "flex", "gap": "8px", "flexWrap": "wrap"}}>{" "}<button type={"button"} onClick={v?.doSubmit} style={{"minHeight": "46px", "padding": "0 22px", "borderRadius": "10px", "border": "0", "background": "#8E2A3B", "color": "#FFFFFF", "font": "inherit", "fontWeight": "800", "cursor": "pointer"}}>{"네, 제출하고 결과 보기"}</button>{" "}<button type={"button"} onClick={v?.closeSubmit} style={{"minHeight": "46px", "padding": "0 18px", "borderRadius": "10px", "border": "1px solid rgba(255,255,255,.4)", "background": "transparent", "color": "#FFFFFF", "font": "inherit", "cursor": "pointer"}}>{"계속 풀기"}</button>{" "}</span>{" "}</div>{" "}</>) : null}{" "}</main>{" "}</div>{" "}</>) : null}{" "}{v?.isResult ? (<>{" "}<div style={{"maxWidth": "1180px", "margin": "0 auto", "padding": "28px 24px 56px", "display": "flex", "flexDirection": "column", "gap": "18px"}}>{" "}<div style={{"display": "flex", "flexWrap": "wrap", "justifyContent": "space-between", "alignItems": "center", "gap": "10px"}}>{" "}<div ><span style={{"fontSize": "14px", "color": "#5C6370"}}>{v?.r?.title}{" · "}{v?.r?.when}</span><h1 style={{"margin": "2px 0 0", "fontSize": "30px"}}>{"결과 리포트"}</h1></div>{" "}<span style={{"display": "flex", "gap": "8px", "flexWrap": "wrap"}}>{" "}<button type={"button"} onClick={v?.openReview} style={{"minHeight": "46px", "padding": "0 18px", "borderRadius": "10px", "border": "0", "background": "#0F6E5A", "color": "#FFFFFF", "font": "inherit", "fontWeight": "800", "cursor": "pointer"}}>{"문항별 해설 보기"}</button>{" "}<button type={"button"} onClick={v?.toLobby} style={{"minHeight": "46px", "padding": "0 18px", "borderRadius": "10px", "border": "1px solid #C8C9C6", "background": "#FFFFFF", "color": "#1C1F24", "font": "inherit", "cursor": "pointer"}}>{"회차 목록"}</button>{" "}</span>{" "}</div>{" "}<section style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(250px, 1fr))", "gap": "14px"}}>{" "}<div style={{"background": "#1C1F24", "color": "#FFFFFF", "borderRadius": "18px", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "6px"}}>{" "}<span style={{"fontSize": "14px", "color": "#E7E7E4"}}>{"종합 추정 점수대"}</span>{" "}<strong style={{"fontSize": "40px", "lineHeight": "1.1", "fontVariantNumeric": "tabular-nums"}}>{v?.r?.ovRange}</strong>{" "}<span style={{"fontSize": "14px", "color": "#E7E7E4"}}>{"중앙값 "}{v?.r?.ovMid}{" · 정답 "}{v?.r?.totRaw}{"/100 ("}{v?.r?.totPct}{"%)"}</span>{" "}<span style={{"fontSize": "13px", "color": "#F2D9DE"}}>{"추정 백분위 "}{v?.r?.ovPctile}</span>{" "}</div>{" "}{(v?.r?.secs || []).map((s: any, __i0: number) => (<Fragment key={__i0}>{" "}<div style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "6px"}}>{" "}<span style={{"fontSize": "14px", "color": "#5C6370"}}>{s?.label}</span>{" "}<strong style={{"fontSize": "34px", "lineHeight": "1.1", "fontVariantNumeric": "tabular-nums"}}>{s?.range}</strong>{" "}<span style={{"fontSize": "14px", "color": "#454B55"}}>{"정답 "}{s?.raw}{"/50 ("}{s?.pct}{"%) · 중앙값 "}{s?.mid}</span>{" "}<div style={{"height": "8px", "borderRadius": "999px", "background": "#E7E7E4", "overflow": "hidden"}}><div style={css(`height: 100%; background: #0F6E5A; ${s?.bar ?? ''}`)}></div></div>{" "}<span style={{"fontSize": "13px", "color": "#5C6370"}}>{s?.note}</span>{" "}</div>{" "}</Fragment>))}{" "}</section>{" "}<section style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "padding": "24px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<h2 style={{"margin": "0", "fontSize": "22px"}}>{"한 줄 코멘트"}</h2>{" "}{(v?.r?.comments || []).map((c: any, __i0: number) => (<Fragment key={__i0}><p style={{"margin": "0", "fontSize": "16px", "color": "#454B55"}}>{c}</p></Fragment>))}{" "}</section>{" "}<section style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "overflow": "hidden"}}>{" "}<div style={{"padding": "20px 24px 8px"}}><h2 style={{"margin": "0", "fontSize": "22px"}}>{"대학별 ISAT 기준과 비교"}</h2><span style={{"fontSize": "14px", "color": "#5C6370"}}>{"추정 점수대(±6점)를 각 대학이 공개한 ISAT 기준과 맞춰 본 결과입니다. 합격 여부가 아니라 ISAT 기준선에 대한 위치입니다."}</span></div>{" "}<div style={{"display": "flex", "flexDirection": "column"}}>{" "}{(v?.r?.unis || []).map((u: any, __i0: number) => (<Fragment key={__i0}>{" "}<div style={{"display": "grid", "gridTemplateColumns": "minmax(0, 1.2fr) auto", "gap": "6px 14px", "padding": "16px 24px", "borderTop": "1px solid #F3F3F1"}}>{" "}<span style={{"minWidth": "0"}}><strong style={{"display": "block", "fontSize": "16px"}}>{u?.name}</strong><span style={{"fontSize": "13px", "color": "#5C6370"}}>{u?.rule}</span></span>{" "}<span style={css(`align-self: start; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 800; white-space: nowrap; ${u?.chip ?? ''}`)}>{u?.level}</span>{" "}<span style={{"gridColumn": "1 / -1", "fontSize": "15px", "color": "#454B55"}}>{u?.comment}</span>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}</section>{" "}<section style={{"display": "flex", "flexWrap": "wrap", "gap": "14px"}}>{" "}<div style={{"flex": "1 1 460px", "minWidth": "0", "background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<h2 style={{"margin": "0", "fontSize": "20px"}}>{"유형별 정답률"}</h2>{" "}{(v?.r?.types || []).map((t: any, __i0: number) => (<Fragment key={__i0}>{" "}<div style={{"display": "grid", "gridTemplateColumns": "34px minmax(0, 1fr) 54px 46px", "gap": "8px", "alignItems": "center", "fontSize": "14px"}}>{" "}<span style={{"fontSize": "11px", "fontWeight": "800", "color": "#5C6370"}}>{t?.sec}</span>{" "}<span style={{"minWidth": "0"}}><span style={{"display": "block"}}>{t?.label}</span><span style={{"display": "block", "height": "6px", "borderRadius": "999px", "background": "#E7E7E4", "overflow": "hidden"}}><span style={css(`display: block; height: 100%; ${t?.bar ?? ''}`)}></span></span></span>{" "}<span style={{"textAlign": "right", "color": "#5C6370", "fontVariantNumeric": "tabular-nums"}}>{t?.raw}</span>{" "}<strong style={{"textAlign": "right", "fontVariantNumeric": "tabular-nums"}}>{t?.pct}</strong>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}<div style={{"flex": "1 1 320px", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "14px"}}>{" "}<div style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "8px"}}>{" "}<h2 style={{"margin": "0", "fontSize": "20px"}}>{"난이도별"}</h2>{" "}{(v?.r?.diffs || []).map((d: any, __i0: number) => (<Fragment key={__i0}><div style={{"display": "flex", "justifyContent": "space-between", "fontSize": "15px"}}><span >{d?.label}</span><strong style={{"fontVariantNumeric": "tabular-nums"}}>{d?.val}</strong></div></Fragment>))}{" "}</div>{" "}<div style={{"background": "#FFFFFF", "border": "1px solid #E7E7E4", "borderRadius": "18px", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "8px"}}>{" "}<h2 style={{"margin": "0", "fontSize": "20px"}}>{"시간 관리"}</h2>{" "}{(v?.r?.times || []).map((d: any, __i0: number) => (<Fragment key={__i0}><div style={{"display": "flex", "justifyContent": "space-between", "gap": "10px", "fontSize": "15px"}}><span >{d?.label}</span><strong style={{"fontVariantNumeric": "tabular-nums", "textAlign": "right"}}>{d?.val}</strong></div></Fragment>))}{" "}</div>{" "}<div style={{"background": "#E2F0EB", "borderRadius": "18px", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "8px"}}>{" "}<h2 style={{"margin": "0", "fontSize": "20px"}}>{"다음에 할 일"}</h2>{" "}{(v?.r?.next || []).map((x: any, __i0: number) => (<Fragment key={__i0}><span style={{"fontSize": "15px", "color": "#1C1F24"}}>{"· "}{x}</span></Fragment>))}{" "}<a href={"/medical/isat"} style={{"alignSelf": "flex-start", "display": "inline-flex", "alignItems": "center", "minHeight": "42px", "padding": "0 16px", "borderRadius": "10px", "background": "#0F6E5A", "color": "#FFFFFF", "textDecoration": "none", "fontWeight": "800"}}>{"문제은행에서 약점 유형 풀기"}</a>{" "}</div>{" "}</div>{" "}</section>{" "}<section style={{"background": "#1C1F24", "color": "#FFFFFF", "borderRadius": "18px", "padding": "24px", "display": "flex", "flexWrap": "wrap", "gap": "14px", "alignItems": "center", "justifyContent": "space-between"}}>{" "}<span style={{"flex": "1 1 420px"}}><strong style={{"display": "block", "fontSize": "19px"}}>{"점수만으로는 합격이 정해지지 않습니다"}</strong><span style={{"color": "#E7E7E4", "fontSize": "15px"}}>{"대학마다 학업 성적(ATAR·IB·수능 등), 인터뷰, 영어 요건을 함께 봅니다. 내 성적과 이 결과를 함께 놓고 지원 전략을 짜 드립니다."}</span></span>{" "}<a href={"/medical#consult"} style={{"display": "inline-flex", "alignItems": "center", "minHeight": "48px", "padding": "0 20px", "borderRadius": "12px", "background": "#F2D9DE", "color": "#1C1F24", "textDecoration": "none", "fontWeight": "800"}}>{"결과 들고 상담 예약"}</a>{" "}</section>{" "}<p style={{"margin": "0", "fontSize": "12px", "color": "#5C6370"}}>{v?.caveat}</p>{" "}</div>{" "}</>) : null}{" "}</div></>);
};

export default Component;
