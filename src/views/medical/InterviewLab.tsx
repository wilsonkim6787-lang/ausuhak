// @ts-nocheck
"use client";
/* eslint-disable */
// Generated from InterviewLab.dc.html by tools/dc2tsx.py. Edit the generator input, not this file, for layout changes.
import { Fragment } from "react";
import { DCLogic, css } from "@/lib/dc";

class Component extends DCLogic {
  constructor(props) {
    super(props);
    var h = [];
    try { h = JSON.parse(window.localStorage.getItem('lab-history') || '[]'); } catch (e) { h = []; }
    var used = 0;
    this.state = { login: false, used: used, fmt: 'monash', theme: 'all', qi: 0, q: null, phase: 'ready', left: 0, showKo: false, words: 0, busy: false, busyMsg: '', fb: null, ai: 'pending', aiMsg: '', hist: h };
    this._answer = '';
  }
  componentDidMount() {
    var self = this;
    this.pick(0);
    fetch('/api/ai/interview', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
      self.setState({ ai: d.enabled ? 'on' : 'off', login: !!d.loggedIn, used: Number(d.used) || 0, aiMsg: d.enabled ? '' : 'AI 채점을 준비하고 있습니다. 문제은행과 타이머 연습은 지금 바로 할 수 있습니다.' });
    }).catch(function () { self.setState({ ai: 'off', aiMsg: 'AI 채점에 연결하지 못했습니다. 문제은행과 타이머 연습은 계속할 수 있습니다.' }); });
  }
  componentWillUnmount() { if (this._t) clearInterval(this._t); if (this._ctl) this._ctl.abort(); }
  FORMATS() {
    return {
      monash: { label: '모나쉬형 MMI', sub: '읽기 2분 · 답변 8분', read: 120, ans: 480, target: '700~900' },
      uq: { label: 'UQ형 MMI', sub: '읽기 2분 · 답변 7분', read: 120, ans: 420, target: '600~800' },
      melb: { label: '멜버른형 녹화 MMI', sub: '스테이션당 5분 · 녹화형', read: 0, ans: 300, target: '450~600' },
      panel: { label: '패널 인터뷰', sub: 'UNSW·UWA형 · 질문당 약 3분 (연습 기준)', read: 0, ans: 180, target: '250~350' },
      short: { label: '빠른 연습', sub: '읽기 30초 · 답변 2분', read: 30, ans: 120, target: '180~250' }
    };
  }
  BANK() {
    return [
      { th: 'motivation', p: 'Why do you want to study medicine in Australia rather than in your home country?', ko: '왜 한국이 아니라 호주에서 의학을 공부하려 하나요? — 호주 의료 시스템·교육 방식에 대한 구체적 이해와 졸업 후 계획을 보여주세요.' },
      { th: 'motivation', p: 'Tell us about an experience that showed you what the work of a doctor is really like.', ko: '의사의 실제 일을 보여준 경험 — 미화보다 힘든 면을 본 경험과 그것이 생각을 어떻게 바꿨는지가 핵심입니다.' },
      { th: 'motivation', p: 'What do you think will be the most difficult part of a medical career for you, and how will you prepare for it?', ko: '의사로서 가장 어려울 부분과 준비 방법 — 자기 인식과 현실적인 대처 계획을 봅니다.' },
      { th: 'motivation', p: 'What makes this university\'s medical program a good fit for you?', ko: '이 대학 의대가 왜 나에게 맞는지 — 커리큘럼·임상 실습지·농촌 의료 등 대학 고유 특징을 알아야 합니다.' },
      { th: 'ethics', p: 'You are a medical student on placement. You notice another student photographing a patient\'s chart on their phone. What would you do?', ko: '실습 중 다른 학생이 환자 차트를 휴대폰으로 찍는 것을 봤다면? — 사실 확인, 환자 비밀 보장, 단계적 대응(본인과 대화 → 지도의 보고)을 보여주세요.' },
      { th: 'ethics', p: 'A patient with a serious condition refuses a blood transfusion for religious reasons. Discuss the issues involved.', ko: '종교적 이유로 수혈을 거부하는 환자 — 자율성, 판단 능력 확인, 정보 제공, 대안 치료, 존중의 균형.' },
      { th: 'ethics', p: 'A friend asks you to sign the attendance sheet for them at a compulsory tutorial. How do you respond?', ko: '친구가 필수 수업 출석 대리 서명을 부탁한다면? — 정직성과 전문직 윤리, 친구를 돕는 다른 방법.' },
      { th: 'ethics', p: 'Two patients need the last available intensive care bed. How should such decisions be made?', ko: '중환자실 마지막 병상에 환자 두 명 — 공정한 기준, 임상적 판단, 팀·지침에 따른 결정, 개인 판단의 한계.' },
      { th: 'ethics', p: 'A 16-year-old patient asks her doctor for contraception and does not want her parents to know. Discuss the issues.', ko: '16세 환자가 부모 모르게 피임 상담을 원한다면 — 미성년자의 판단 능력, 비밀 보장과 그 한계, 안전 확인.' },
      { th: 'communication', p: 'Explain to a ten-year-old what a vaccine does and why it matters, using simple words.', ko: '10살 아이에게 백신 설명하기 — 쉬운 비유, 상대 눈높이, 확인 질문.' },
      { th: 'communication', p: 'A patient is angry because they have waited three hours. You are the student who calls them in. How do you respond?', ko: '3시간 기다려 화난 환자 — 공감, 사과, 사실 설명, 해결책, 감정 받아주기.' },
      { th: 'communication', p: 'Describe a time you worked in a team where things went wrong. What was your role and what happened?', ko: '팀이 잘못됐던 경험 — 남 탓 없이 내 역할과 배운 점을 구체적으로 (STAR 구조).' },
      { th: 'communication', p: 'You realise a group deadline was missed because of your mistake. How do you tell your team?', ko: '내 실수로 팀 마감을 놓쳤을 때 — 책임 인정, 영향 설명, 회복 계획.' },
      { th: 'australia', p: 'Why do rural and remote areas of Australia have fewer doctors, and what could help?', ko: '호주 농촌·오지 의사 부족 원인과 해결책 — 거리, 근무 환경, 농촌 실습 프로그램, 원격 의료.' },
      { th: 'australia', p: 'What do you understand about the gap in health outcomes between Aboriginal and Torres Strait Islander peoples and other Australians?', ko: '원주민과 다른 호주인의 건강 격차 — 역사적·사회적 요인, 문화적 안전, 지역사회 주도 보건. 존중하는 태도가 중요합니다.' },
      { th: 'australia', p: 'Should advertising of unhealthy food to children be banned? Discuss both sides.', ko: '어린이 대상 정크푸드 광고 금지 — 양쪽 근거, 공중보건과 개인 자유의 균형, 내 결론.' },
      { th: 'australia', p: 'How might artificial intelligence change the work of doctors over the next twenty years?', ko: 'AI가 앞으로 20년간 의사의 일을 어떻게 바꿀지 — 기회, 위험, 그래도 남는 사람의 역할.' },
      { th: 'resilience', p: 'Tell us about a time you failed at something important. What did you learn?', ko: '중요한 일에 실패한 경험 — 솔직함, 원인 분석, 이후 실제로 바꾼 행동.' },
      { th: 'resilience', p: 'Medicine is demanding. How do you look after your own wellbeing during stressful periods?', ko: '스트레스 관리 — 구체적 습관, 도움 요청, 지속 가능성.' },
      { th: 'resilience', p: 'You will be living far from your family for many years. How will you manage that?', ko: '가족과 멀리 오래 떨어져 사는 것 — 국제학생에게 자주 나옵니다. 지원망, 적응 경험, 현실적인 계획.' },
      { th: 'resilience', p: 'Describe feedback you received that was difficult to hear. How did you respond?', ko: '듣기 힘들었던 피드백 — 방어하지 않고 받아들인 과정과 변화.' },
      { th: 'dentvet', p: 'Why have you chosen dentistry rather than medicine?', ko: '왜 의대가 아니라 치대인지 — 치의학 고유의 매력(손기술, 장기적 환자 관계, 예방)을 구체적으로.' },
      { th: 'dentvet', p: 'A patient is very anxious about dental treatment. How would you help them?', ko: '치료를 무서워하는 환자 — 공감, 설명, 통제감 주기, 단계적 접근.' },
      { th: 'dentvet', p: 'A pet owner cannot afford the treatment their animal needs. What issues does this raise for a veterinarian?', ko: '치료비를 감당 못하는 반려동물 보호자 — 동물 복지, 보호자 사정, 대안 치료, 안락사 논의의 윤리.' }
    ];
  }
  pick(i, list) {
    var L = list || this.filtered();
    if (!L.length) return;
    var q = L[i % L.length];
    this.reset();
    this.setState({ qi: i, q: q, fb: null, showKo: false });
  }
  filtered() { var th = this.state.theme; return this.BANK().filter(function (q) { return th === 'all' || q.th === th; }); }
  reset() {
    if (this._t) { clearInterval(this._t); this._t = null; }
    this._answer = ''; var el = document.getElementById('lab-answer'); if (el) el.value = '';
    this.setState({ phase: 'ready', left: 0, words: 0 });
  }
  tick() {
    var self = this;
    if (this._t) clearInterval(this._t);
    this._t = setInterval(function () {
      var s = self.state;
      if (s.left > 1) { self.setState({ left: s.left - 1 }); return; }
      if (s.phase === 'read') { var F = self.FORMATS()[s.fmt]; self.setState({ phase: 'answer', left: F.ans }); var el = document.getElementById('lab-answer'); if (el) el.focus(); return; }
      clearInterval(self._t); self._t = null; self.setState({ phase: 'done', left: 0 });
    }, 1000);
  }
  ask(body) {
    if (this._ctl) this._ctl.abort();
    this._ctl = new AbortController();
    return fetch('/api/ai/interview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: this._ctl.signal })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) throw { code: d.code || 'upstream' }; return d; }); })
      .catch(function (e) { if (e && e.name === 'AbortError') throw { code: 'cancelled' }; throw e && e.code ? e : { code: 'upstream' }; });
  }
  errMsg(e) {
    var c = e && e.code;
    if (c === 'cancelled') return '';
    if (c === 'login') { this.setState({ login: false }); return ''; }
    if (c === 'limit') { this.setState({ used: 3 }); return ''; }
    if (c === 'disabled') { this.setState({ ai: 'off', aiMsg: 'AI 채점을 준비하고 있습니다. 문제은행과 타이머 연습은 지금 바로 할 수 있습니다.' }); return ''; }
    if (c === 'rate_limited') return '잠시 요청이 많습니다. 조금 뒤에 다시 눌러 주세요.';
    if (c === 'invalid_json') return '채점 결과를 읽지 못했습니다. 한 번 더 눌러 주세요.';
    if (c === 'refused') return '이 내용으로는 채점할 수 없습니다. 답변을 바꿔 다시 시도해 주세요.';
    return '연결이 잠시 끊겼습니다. 다시 눌러 주세요.';
  }
  renderVals() {
    var self = this, S = this.state;
    var FM = this.FORMATS(), fm = FM[S.fmt];
    var mm = function (s) { var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; };
    var lab = function (s) { return s >= 60 ? (s / 60) + '분' : s + '초'; };
    var formats = Object.keys(FM).map(function (k) { return { label: FM[k].label, sub: FM[k].sub, on: S.fmt === k, off: S.fmt !== k, pick: function () { self.reset(); self.setState({ fmt: k }); } }; });
    var TH = [['all', '전체'], ['motivation', '지원 동기'], ['ethics', '윤리'], ['communication', '소통·팀워크'], ['australia', '호주 의료·사회'], ['resilience', '자기성찰'], ['dentvet', '치대·수의대']];
    var thLabel = {}; TH.forEach(function (t) { thLabel[t[0]] = t[1]; });
    var themes = TH.map(function (t) { return { label: t[1], on: S.theme === t[0], off: S.theme !== t[0], pick: function () { self.state.theme = t[0]; self.setState({ theme: t[0] }); self.pick(0, self.BANK().filter(function (q) { return t[0] === 'all' || q.th === t[0]; })); } }; });
    var q = S.q || { th: 'motivation', p: '', ko: '' };
    var phaseLabel = { ready: '준비', read: '읽기 시간', answer: '답변 시간', done: '시간 종료' }[S.phase];
    var clock = S.phase === 'ready' ? mm(fm.read || fm.ans) : mm(S.left);
    var timerStyle = S.phase === 'answer' && S.left <= 30 ? 'color: #F2D9DE' : (S.phase === 'done' ? 'color: #F2D9DE' : 'color: #FFFFFF');
    var fb = S.fb;
    var fbv = { overall: '', verdict: '', summary: '', bars: [], strengths: [], improve: [], outline: [], phrases: [], hasPhrases: false, follow: [] };
    if (fb) {
      var B = [['empathy', '공감·환자 중심'], ['structure', '논리 구조'], ['ethics', '윤리·판단'], ['specifics', '구체적 경험·근거'], ['delivery', '전달력·영어']];
      fbv = {
        overall: fb.overall, verdict: fb.verdict || '', summary: fb.summary || '',
        bars: B.map(function (b) { var v = Math.max(0, Math.min(5, Number((fb.scores || {})[b[0]]) || 0)); return { label: b[1], v: v, style: 'width: ' + (v * 20) + '%; background: ' + (v >= 4 ? '#0F6E5A' : v >= 3 ? '#F2D9DE' : '#8E2A3B') }; }),
        strengths: fb.strengths || [], improve: fb.improvements || [], outline: fb.outline || [], phrases: fb.phrases || [], hasPhrases: (fb.phrases || []).length > 0,
        follow: (fb.followUps || []).slice(0, 2).map(function (t) { return { text: t, go: function () { self.reset(); self.setState({ q: { th: q.th, p: t, ko: '꼬리 질문입니다. 앞 답변과 이어지게, 더 구체적으로 답해 보세요.', ai: true, parent: q.p }, fb: null }); } }; })
      };
    }
    var hist = S.hist.slice(-5).reverse();
    var avg = '', weak = '';
    if (S.hist.length) {
      var sum = 0, keys = { empathy: 0, structure: 0, ethics: 0, specifics: 0, delivery: 0 };
      S.hist.forEach(function (h) { sum += Number(h.score) || 0; Object.keys(keys).forEach(function (k) { keys[k] += Number((h.s || {})[k]) || 0; }); });
      avg = (sum / S.hist.length).toFixed(1);
      var NM = { empathy: '공감', structure: '논리 구조', ethics: '윤리·판단', specifics: '구체성', delivery: '전달력' };
      var wk = Object.keys(keys).sort(function (a, b) { return keys[a] - keys[b]; })[0]; weak = NM[wk];
    }
    return {
      formats: formats, themes: themes, fmt: { label: fm.label, sub: fm.sub, readLabel: fm.read ? lab(fm.read) : '없음', ansLabel: lab(fm.ans), target: fm.target },
      q: { prompt: q.p, ko: q.ko, themeLabel: thLabel[q.th] || '연습', ai: !!q.ai },
      showKo: S.showKo, koLabel: S.showKo ? '해설 숨기기' : '한국어 해설 보기', toggleKo: function () { self.setState({ showKo: !self.state.showKo }); },
      phaseLabel: phaseLabel, clock: clock, timerStyle: timerStyle,
      canStart: S.phase === 'ready' || S.phase === 'done', inRead: S.phase === 'read',
      start: function () { self._answer = self._answer || ''; var F = self.FORMATS()[self.state.fmt]; if (F.read) self.setState({ phase: 'read', left: F.read }); else { self.setState({ phase: 'answer', left: F.ans }); var el = document.getElementById('lab-answer'); if (el) el.focus(); } self.tick(); },
      skipRead: function () { var F = self.FORMATS()[self.state.fmt]; self.setState({ phase: 'answer', left: F.ans }); var el = document.getElementById('lab-answer'); if (el) el.focus(); },
      onAnswer: function (e) { self._answer = (e && e.target && e.target.value) || ''; var w = self._answer.trim() ? self._answer.trim().split(/\s+/).length : 0; if (w !== self.state.words) self.setState({ words: w }); },
      words: S.words,
      nextQ: function () { var L = self.filtered(); self.pick((self.state.qi + 1 + Math.floor(Math.random() * Math.max(1, L.length - 1))) % L.length); },
      aiOn: S.ai === 'on', aiOff: S.ai === 'off' && !!S.aiMsg, aiOffMsg: S.aiMsg, busy: S.busy, busyMsg: S.busyMsg,
      stop: function () { if (self._ctl) self._ctl.abort(); self.setState({ busy: false }); },
      genQ: function () {
        var th = self.state.theme, F = self.FORMATS()[self.state.fmt];
        var topic = th === 'all' ? 'any typical theme (motivation, ethics, communication, teamwork, Australian healthcare, rural or Indigenous health, resilience)' : ({ motivation: 'motivation for medicine', ethics: 'a medical ethics dilemma', communication: 'communication or teamwork, possibly a short role-play', australia: 'Australian healthcare and society, including rural or Aboriginal and Torres Strait Islander health', resilience: 'resilience and self-reflection', dentvet: 'dentistry or veterinary science' })[th];
        self.setState({ busy: true, busyMsg: 'AI 면접관이 새 문제를 만들고 있습니다…', fb: null });
        self.ask({ mode: 'question', format: F.label + ', ' + F.sub, theme: th })
          .then(function (r) { if (!r || !r.prompt) throw { code: 'invalid_json' }; self.reset(); self.setState({ busy: false, q: { th: th === 'all' ? 'motivation' : th, p: String(r.prompt), ko: String(r.ko || ''), ai: true } }); })
          .catch(function (e) { self.setState({ busy: false, aiMsg: self.errMsg(e) || self.state.aiMsg }); });
      },
      grade: function () {
        var ans = (self._answer || '').trim(); var F = self.FORMATS()[self.state.fmt]; var cq = self.state.q || {};
        if (ans.length < 20) { self.setState({ aiMsg: '답변을 조금 더 써 주세요. 몇 문장 이상이어야 채점할 수 있습니다.', ai: self.state.ai === 'on' ? 'on' : self.state.ai }); return; }
        if (self._t) { clearInterval(self._t); self._t = null; }
        self.setState({ busy: true, busyMsg: 'AI 면접관이 답변을 읽고 채점하고 있습니다… (보통 20~60초)', fb: null, phase: 'done' });
        self.ask({ mode: 'grade', format: F.label + ' (' + F.sub + ')', parent: cq.parent || '', question: cq.p || '', answer: ans.slice(0, 6000) }).then(function (r) {
          if (!r || !r.scores) throw { code: 'invalid_json' };
          var h = self.state.hist.concat([{ title: String(cq.p || '').slice(0, 48) + '…', score: Number(r.overall) || 0, s: r.scores, at: Date.now() }]).slice(-30);
          try { window.localStorage.setItem('lab-history', JSON.stringify(h)); } catch (e) {}
          var u = r._used != null ? Number(r._used) : (self.state.used || 0) + 1;
          self.setState({ busy: false, fb: r, hist: h, used: u });
        }).catch(function (e) { self.setState({ busy: false, aiMsg: self.errMsg(e) || self.state.aiMsg }); });
      },
      hasFb: !!fb, fb: fbv, freeLeft: Math.max(0, 3 - (S.used || 0)), canGrade: S.ai === 'on' && S.login && (S.used || 0) < 3, paywall: S.ai === 'on' && S.login && (S.used || 0) >= 3, needLogin: S.ai === 'on' && !S.login,
      hist: hist.map(function (h) { return { title: h.title, score: h.score }; }), noHist: S.hist.length === 0, hasAvg: S.hist.length > 0, avg: avg, weak: weak
    };
  }
}

Component.prototype.__tpl = function (v: any) {
  return (<><style dangerouslySetInnerHTML={{ __html: "html,body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}\nh1,h2,h3,h4{letter-spacing:-0.035em;line-height:1.28;text-wrap:balance}\np,li,td,th,dd,dt,span,a,button,input,textarea{letter-spacing:-0.012em}\nstrong{letter-spacing:-0.02em}\nbody{margin:0;background:#F3F3F1}\na{color:#0F6E5A}a:hover{color:#0A5546}\nbutton:focus-visible,a:focus-visible,textarea:focus-visible{outline:3px solid #9CCFC0;outline-offset:2px}\nbutton:disabled{opacity:.5;cursor:not-allowed}\n@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}\n.pulse{animation:pulse 1.4s ease-in-out infinite}" }} />
<div style={{"fontFamily": "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif", "color": "#1C1F24", "background": "#F3F3F1", "width": "100%", "fontSize": "16px", "lineHeight": "1.7", "wordBreak": "keep-all", "overflowWrap": "break-word", "minHeight": "1400px"}}>{" "}<header style={{"background": "#1C1F24", "color": "#FFFFFF"}}>{" "}<div style={{"maxWidth": "1240px", "margin": "0 auto", "padding": "14px 24px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "12px 24px"}}>{" "}<a href={"/medical"} style={{"display": "flex", "alignItems": "center", "gap": "10px", "textDecoration": "none", "color": "#FFFFFF", "marginRight": "auto"}}>{" "}<svg width={"32"} height={"32"} viewBox={"0 0 34 34"} aria-hidden={"true"}><rect width={"34"} height={"34"} rx={"9"} fill={"#FFFFFF"}></rect><path d={"M17 8v18M8 17h18"} stroke={"#F2D9DE"} strokeWidth={"3"} strokeLinecap={"round"}></path></svg>{" "}<h1 style={{"fontWeight": "800", "fontSize": "16px", "margin": "0"}}>{"AusUhak 메디컬 · 인터뷰 연습실"}</h1><span style={{"padding": "2px 8px", "borderRadius": "6px", "background": "#F2D9DE", "color": "#1C1F24", "fontSize": "11px", "fontWeight": "800", "whiteSpace": "nowrap"}}>{"AI 채점 3문제 무료"}</span>{" "}</a>{" "}<a href={"/medical/mmi"} style={{"color": "#E7E7E4", "textDecoration": "none", "fontSize": "14px"}}>{"대학별 인터뷰 형식"}</a>{" "}<a href={"/medical/interview-lab"} style={{"display": "inline-flex", "alignItems": "center", "minHeight": "40px", "padding": "0 16px", "borderRadius": "10px", "background": "#F2D9DE", "color": "#1C1F24", "textDecoration": "none", "fontWeight": "800", "fontSize": "14px"}}>{"AI 채점 연습실 열기"}</a>{" "}<a href={"/medical#consult"} style={{"display": "inline-flex", "alignItems": "center", "minHeight": "40px", "padding": "0 16px", "borderRadius": "10px", "background": "#8E2A3B", "color": "#FFFFFF", "textDecoration": "none", "fontWeight": "700", "fontSize": "14px"}}>{"1:1 모의 인터뷰"}</a>{" "}</div>{" "}</header>{" "}<div style={{"maxWidth": "1240px", "margin": "0 auto", "padding": "32px 24px 64px", "display": "flex", "flexWrap": "wrap", "gap": "24px", "alignItems": "flex-start"}}>{" "}<aside style={{"flex": "1 1 300px", "maxWidth": "380px", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "16px"}}>{" "}<div style={{"background": "#FFFFFF", "borderRadius": "18px", "border": "1px solid #E7E7E4", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "14px"}}>{" "}<strong style={{"fontSize": "15px"}}>{"1. 연습할 인터뷰 형식"}</strong>{" "}<div style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>{" "}{(v?.formats || []).map((f: any, __i0: number) => (<Fragment key={__i0}>{" "}{f?.on ? (<><button type={"button"} aria-pressed={"true"} onClick={f?.pick} style={{"minHeight": "52px", "padding": "8px 14px", "borderRadius": "12px", "border": "2px solid #0F6E5A", "background": "#E2F0EB", "color": "#1C1F24", "font": "inherit", "textAlign": "left", "cursor": "pointer", "display": "flex", "flexDirection": "column"}}><strong style={{"fontSize": "15px"}}>{f?.label}</strong><span style={{"fontSize": "12px", "color": "#454B55"}}>{f?.sub}</span></button></>) : null}{" "}{f?.off ? (<><button type={"button"} aria-pressed={"false"} onClick={f?.pick} style={{"minHeight": "52px", "padding": "8px 14px", "borderRadius": "12px", "border": "1px solid #C8C9C6", "background": "#FFFFFF", "color": "#1C1F24", "font": "inherit", "textAlign": "left", "cursor": "pointer", "display": "flex", "flexDirection": "column"}}><strong style={{"fontSize": "15px"}}>{f?.label}</strong><span style={{"fontSize": "12px", "color": "#5C6370"}}>{f?.sub}</span></button></>) : null}{" "}</Fragment>))}{" "}</div>{" "}<strong style={{"fontSize": "15px", "marginTop": "6px"}}>{"2. 주제"}</strong>{" "}<div style={{"display": "flex", "flexWrap": "wrap", "gap": "6px"}}>{" "}{(v?.themes || []).map((t: any, __i0: number) => (<Fragment key={__i0}>{" "}{t?.on ? (<><button type={"button"} aria-pressed={"true"} onClick={t?.pick} style={{"minHeight": "38px", "padding": "0 12px", "borderRadius": "999px", "border": "0", "background": "#1C1F24", "color": "#FFFFFF", "font": "inherit", "fontSize": "13px", "fontWeight": "700", "cursor": "pointer"}}>{t?.label}</button></>) : null}{" "}{t?.off ? (<><button type={"button"} aria-pressed={"false"} onClick={t?.pick} style={{"minHeight": "38px", "padding": "0 12px", "borderRadius": "999px", "border": "1px solid #C8C9C6", "background": "#FFFFFF", "color": "#1C1F24", "font": "inherit", "fontSize": "13px", "cursor": "pointer"}}>{t?.label}</button></>) : null}{" "}</Fragment>))}{" "}</div>{" "}<div style={{"display": "flex", "gap": "8px", "flexWrap": "wrap", "marginTop": "4px"}}>{" "}<button type={"button"} onClick={v?.nextQ} style={{"flex": "1", "minHeight": "48px", "borderRadius": "12px", "border": "1px solid #1C1F24", "background": "#FFFFFF", "color": "#1C1F24", "font": "inherit", "fontWeight": "700", "cursor": "pointer"}}>{"문제은행에서 뽑기"}</button>{" "}{v?.canGrade ? (<><button type={"button"} onClick={v?.genQ} disabled={!!(v?.busy)} style={{"flex": "1", "minHeight": "48px", "borderRadius": "12px", "border": "0", "background": "#0F6E5A", "color": "#FFFFFF", "font": "inherit", "fontWeight": "700", "cursor": "pointer"}}>{"AI 새 문제"}</button></>) : null}{" "}</div>{" "}</div>{" "}<div style={{"background": "#FFFFFF", "borderRadius": "18px", "border": "1px solid #E7E7E4", "padding": "22px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<strong style={{"fontSize": "15px"}}>{"내 연습 기록"}</strong>{" "}{v?.noHist ? (<><span style={{"fontSize": "14px", "color": "#5C6370"}}>{"아직 채점 기록이 없습니다. 첫 문제를 풀어 보세요."}</span></>) : null}{" "}{(v?.hist || []).map((h: any, __i0: number) => (<Fragment key={__i0}>{" "}<div style={{"display": "flex", "justifyContent": "space-between", "gap": "10px", "fontSize": "14px", "borderBottom": "1px dashed #E7E7E4", "paddingBottom": "6px"}}>{" "}<span style={{"minWidth": "0"}}>{h?.title}</span><strong style={{"color": "#0F6E5A", "whiteSpace": "nowrap"}}>{h?.score}{"/10"}</strong>{" "}</div>{" "}</Fragment>))}{" "}{v?.hasAvg ? (<><span style={{"fontSize": "13px", "color": "#454B55"}}>{"최근 평균 "}<strong >{v?.avg}</strong>{"점 · 가장 약한 항목 "}<strong style={{"color": "#8E2A3B"}}>{v?.weak}</strong></span></>) : null}{" "}</div>{" "}</aside>{" "}<main style={{"flex": "999 1 560px", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "16px"}}>{" "}<section style={{"background": "#FFFFFF", "borderRadius": "20px", "border": "1px solid #E7E7E4", "overflow": "hidden"}}>{" "}<div style={{"background": "#1C1F24", "color": "#FFFFFF", "padding": "18px 24px", "display": "flex", "flexWrap": "wrap", "gap": "10px 20px", "alignItems": "center", "justifyContent": "space-between"}}>{" "}<span style={{"display": "flex", "gap": "8px", "flexWrap": "wrap", "alignItems": "center"}}><span style={{"padding": "3px 10px", "borderRadius": "6px", "background": "#F2D9DE", "color": "#1C1F24", "fontSize": "12px", "fontWeight": "800"}}>{v?.q?.themeLabel}</span><span style={{"fontSize": "14px", "color": "#C8C9C6"}}>{v?.fmt?.label}{" · "}{v?.fmt?.sub}</span>{v?.q?.ai ? (<><span style={{"fontSize": "12px", "color": "#9CCFC0"}}>{"AI 생성 문제"}</span></>) : null}</span>{" "}<span style={{"display": "flex", "alignItems": "baseline", "gap": "8px"}}><span style={{"fontSize": "13px", "color": "#C8C9C6"}}>{v?.phaseLabel}</span><strong style={css(`font-size: 30px; font-weight: 800; font-variant-numeric: tabular-nums; ${v?.timerStyle ?? ''}`)}>{v?.clock}</strong></span>{" "}</div>{" "}<div style={{"padding": "26px 24px", "display": "flex", "flexDirection": "column", "gap": "16px"}}>{" "}<p lang={"en"} style={{"margin": "0", "fontSize": "20px", "lineHeight": "1.6", "fontWeight": "600"}}>{v?.q?.prompt}</p>{" "}{v?.showKo ? (<><p style={{"margin": "0", "fontSize": "15px", "color": "#454B55", "background": "#F3F3F1", "borderRadius": "12px", "padding": "12px 16px"}}>{v?.q?.ko}</p></>) : null}{" "}<div style={{"display": "flex", "flexWrap": "wrap", "gap": "8px"}}>{" "}<button type={"button"} onClick={v?.toggleKo} style={{"minHeight": "40px", "padding": "0 14px", "borderRadius": "10px", "border": "1px solid #C8C9C6", "background": "#FFFFFF", "color": "#1C1F24", "font": "inherit", "fontSize": "14px", "cursor": "pointer"}}>{v?.koLabel}</button>{" "}{v?.canStart ? (<><button type={"button"} onClick={v?.start} style={{"minHeight": "40px", "padding": "0 18px", "borderRadius": "10px", "border": "0", "background": "#8E2A3B", "color": "#FFFFFF", "font": "inherit", "fontSize": "14px", "fontWeight": "800", "cursor": "pointer"}}>{"▶ 시작 (읽기 "}{v?.fmt?.readLabel}{" → 답변 "}{v?.fmt?.ansLabel}{")"}</button></>) : null}{" "}{v?.inRead ? (<><button type={"button"} onClick={v?.skipRead} style={{"minHeight": "40px", "padding": "0 14px", "borderRadius": "10px", "border": "1px solid #1C1F24", "background": "#FFFFFF", "color": "#1C1F24", "font": "inherit", "fontSize": "14px", "fontWeight": "700", "cursor": "pointer"}}>{"바로 답변 시작"}</button></>) : null}{" "}</div>{" "}<label style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>{" "}<span style={{"fontSize": "14px", "fontWeight": "700"}}>{"내 답변 "}<span style={{"fontWeight": "400", "color": "#5C6370"}}>{"— 실제 인터뷰처럼 영어로 써 보세요. 말로 연습했다면 핵심만 적어도 됩니다."}</span></span>{" "}<textarea id={"lab-answer"} lang={"en"} rows={"9"} onInput={v?.onAnswer} placeholder={"Type your answer here..."} style={{"font": "inherit", "fontSize": "16px", "lineHeight": "1.6", "padding": "14px 16px", "borderRadius": "12px", "border": "1px solid #C8C9C6", "resize": "vertical", "minHeight": "200px", "boxSizing": "border-box", "width": "100%"}}></textarea>{" "}</label>{" "}<div style={{"display": "flex", "flexWrap": "wrap", "gap": "10px", "alignItems": "center", "justifyContent": "space-between"}}>{" "}<span style={{"fontSize": "13px", "color": "#5C6370"}}>{v?.words}{"단어 · 실제 답변 시간 "}{v?.fmt?.ansLabel}{"에 맞는 분량은 약 "}{v?.fmt?.target}{"단어"}</span>{" "}<span style={{"display": "flex", "gap": "8px"}}>{" "}{v?.canGrade ? (<><button type={"button"} onClick={v?.grade} disabled={!!(v?.busy)} style={{"minHeight": "52px", "padding": "0 26px", "borderRadius": "12px", "border": "0", "background": "#0F6E5A", "color": "#FFFFFF", "font": "inherit", "fontWeight": "800", "fontSize": "16px", "cursor": "pointer"}}>{"AI 면접관 채점 받기"}</button></>) : null}{" "}{v?.busy ? (<><button type={"button"} onClick={v?.stop} style={{"minHeight": "52px", "padding": "0 18px", "borderRadius": "12px", "border": "1px solid #C8C9C6", "background": "#FFFFFF", "color": "#1C1F24", "font": "inherit", "fontWeight": "700", "cursor": "pointer"}}>{"멈추기"}</button></>) : null}{" "}</span>{" "}</div>{" "}{v?.aiOn ? (<><span style={{"display": "block", "fontSize": "13px", "color": "#5C6370"}}>{"AI 채점 무료 체험 "}{v?.freeLeft}{"회 남음 · 이후 유료 플랜에서 무제한"}</span></>) : null}{" "}{v?.paywall ? (<>{" "}<div style={{"background": "#1C1F24", "color": "#FFFFFF", "borderRadius": "16px", "padding": "20px 22px", "display": "flex", "flexWrap": "wrap", "gap": "14px", "alignItems": "center", "justifyContent": "space-between"}}>{" "}<span style={{"display": "flex", "flexDirection": "column", "gap": "4px", "maxWidth": "560px"}}><strong style={{"fontSize": "18px", "color": "#F2D9DE"}}>{"무료 체험 3회를 모두 쓰셨습니다"}</strong><span style={{"fontSize": "14px", "color": "#E7E7E4"}}>{"AI 면접관 채점·꼬리 질문·약점 리포트는 유료 인터뷰 코칭에서 계속 쓸 수 있습니다. 문제은행과 타이머 연습은 계속 무료입니다."}</span></span>{" "}<a href={"/medical/services"} style={{"display": "inline-flex", "alignItems": "center", "minHeight": "48px", "padding": "0 20px", "borderRadius": "12px", "background": "#8E2A3B", "color": "#FFFFFF", "textDecoration": "none", "fontWeight": "800"}}>{"인터뷰 코칭 플랜 보기"}</a>{" "}</div>{" "}</>) : null}{" "}{v?.needLogin ? (<><div style={{"background": "#FFF8E8", "border": "1px solid #F0D9A0", "borderRadius": "12px", "padding": "14px 16px", "display": "flex", "flexWrap": "wrap", "gap": "10px", "alignItems": "center", "justifyContent": "space-between"}}><span style={{"fontSize": "15px", "color": "#1C1F24", "fontWeight": "700"}}>{"회원가입하면 AI 면접관 채점 3문제를 무료로 받을 수 있습니다."}</span><a href={"/login?next=/medical/interview-lab"} onClick={() => { try { document.cookie = "ret=/medical/interview-lab; path=/; max-age=1800; samesite=lax"; } catch (e) {} }} style={{"display": "inline-flex", "alignItems": "center", "minHeight": "44px", "padding": "0 18px", "borderRadius": "10px", "background": "#1C1F24", "color": "#FFFFFF", "textDecoration": "none", "fontWeight": "800"}}>{"로그인 · 무료 회원가입"}</a></div></>) : null}{" "}{v?.aiOff ? (<><p style={{"margin": "0", "fontSize": "14px", "color": "#6E1F2D", "background": "#FBF1F3", "borderRadius": "10px", "padding": "10px 14px"}}>{v?.aiOffMsg}</p></>) : null}{" "}</div>{" "}</section>{" "}{v?.busy ? (<>{" "}<section style={{"background": "#FFFFFF", "borderRadius": "20px", "border": "1px solid #E7E7E4", "padding": "24px", "display": "flex", "gap": "12px", "alignItems": "center"}}>{" "}<span className={"pulse"} style={{"width": "12px", "height": "12px", "borderRadius": "50%", "background": "#0F6E5A"}}></span>{" "}<span style={{"color": "#454B55"}}>{v?.busyMsg}</span>{" "}</section>{" "}</>) : null}{" "}{v?.hasFb ? (<>{" "}<section style={{"background": "#FFFFFF", "borderRadius": "20px", "border": "1px solid #E7E7E4", "overflow": "hidden"}}>{" "}<div style={{"padding": "22px 24px", "display": "flex", "flexWrap": "wrap", "gap": "20px", "alignItems": "center", "borderBottom": "1px solid #E7E7E4"}}>{" "}<div style={{"width": "96px", "height": "96px", "borderRadius": "50%", "background": "#1C1F24", "color": "#FFFFFF", "display": "flex", "flexDirection": "column", "alignItems": "center", "justifyContent": "center", "flex": "none"}}>{" "}<strong style={{"fontSize": "34px", "fontWeight": "800", "lineHeight": "1", "color": "#F2D9DE"}}>{v?.fb?.overall}</strong><span style={{"fontSize": "12px", "color": "#C8C9C6"}}>{"/ 10"}</span>{" "}</div>{" "}<div style={{"flex": "1", "minWidth": "240px", "display": "flex", "flexDirection": "column", "gap": "6px"}}>{" "}<strong style={{"fontSize": "20px", "fontWeight": "800"}}>{v?.fb?.verdict}</strong>{" "}<span style={{"fontSize": "15px", "color": "#454B55"}}>{v?.fb?.summary}</span>{" "}</div>{" "}</div>{" "}<div style={{"padding": "20px 24px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(220px, 1fr))", "gap": "12px 24px", "borderBottom": "1px solid #E7E7E4"}}>{" "}{(v?.fb?.bars || []).map((b: any, __i0: number) => (<Fragment key={__i0}>{" "}<div style={{"display": "flex", "flexDirection": "column", "gap": "4px"}}>{" "}<span style={{"display": "flex", "justifyContent": "space-between", "fontSize": "14px"}}><span >{b?.label}</span><strong >{b?.v}{"/5"}</strong></span>{" "}<span style={{"height": "8px", "borderRadius": "4px", "background": "#E9EEEC", "display": "block"}}><span style={css(`display: block; height: 8px; border-radius: 4px; ${b?.style ?? ''}`)}></span></span>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}<div style={{"padding": "20px 24px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(280px, 1fr))", "gap": "16px"}}>{" "}<div style={{"background": "#E2F0EB", "borderRadius": "14px", "padding": "16px 18px", "display": "flex", "flexDirection": "column", "gap": "8px"}}>{" "}<strong style={{"color": "#0A5546"}}>{"잘한 점"}</strong>{" "}<ul style={{"margin": "0", "paddingLeft": "18px", "fontSize": "15px", "display": "flex", "flexDirection": "column", "gap": "4px"}}>{(v?.fb?.strengths || []).map((s: any, __i0: number) => (<Fragment key={__i0}><li >{s}</li></Fragment>))}</ul>{" "}</div>{" "}<div style={{"background": "#FBF1F3", "borderRadius": "14px", "padding": "16px 18px", "display": "flex", "flexDirection": "column", "gap": "8px"}}>{" "}<strong style={{"color": "#6E1F2D"}}>{"고칠 점"}</strong>{" "}<ul style={{"margin": "0", "paddingLeft": "18px", "fontSize": "15px", "display": "flex", "flexDirection": "column", "gap": "4px"}}>{(v?.fb?.improve || []).map((s: any, __i0: number) => (<Fragment key={__i0}><li >{s}</li></Fragment>))}</ul>{" "}</div>{" "}</div>{" "}<div style={{"padding": "0 24px 20px", "display": "flex", "flexDirection": "column", "gap": "8px"}}>{" "}<strong >{"모범 답변 뼈대"}</strong>{" "}<ol lang={"en"} style={{"margin": "0", "paddingLeft": "20px", "fontSize": "15px", "color": "#454B55", "display": "flex", "flexDirection": "column", "gap": "4px"}}>{(v?.fb?.outline || []).map((s: any, __i0: number) => (<Fragment key={__i0}><li >{s}</li></Fragment>))}</ol>{" "}{v?.fb?.hasPhrases ? (<>{" "}<div style={{"background": "#F3F3F1", "borderRadius": "12px", "padding": "12px 16px", "fontSize": "14px", "display": "flex", "flexDirection": "column", "gap": "4px"}}>{" "}<strong style={{"fontSize": "13px", "color": "#5C6370"}}>{"바로 쓸 수 있는 표현"}</strong>{" "}{(v?.fb?.phrases || []).map((s: any, __i0: number) => (<Fragment key={__i0}><span lang={"en"}>{"“"}{s}{"”"}</span></Fragment>))}{" "}</div>{" "}</>) : null}{" "}</div>{" "}<div style={{"background": "#1C1F24", "color": "#FFFFFF", "padding": "20px 24px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<strong style={{"color": "#F2D9DE"}}>{"면접관 꼬리 질문"}</strong>{" "}{(v?.fb?.follow || []).map((fq: any, __i0: number) => (<Fragment key={__i0}>{" "}<div style={{"display": "flex", "flexWrap": "wrap", "gap": "10px", "alignItems": "center", "justifyContent": "space-between", "borderTop": "1px solid rgba(255,255,255,.15)", "paddingTop": "10px"}}>{" "}<span lang={"en"} style={{"flex": "1", "minWidth": "240px", "fontSize": "16px"}}>{fq?.text}</span>{" "}<button type={"button"} onClick={fq?.go} style={{"minHeight": "40px", "padding": "0 14px", "borderRadius": "10px", "border": "1px solid rgba(255,255,255,.6)", "background": "transparent", "color": "#FFFFFF", "font": "inherit", "fontSize": "14px", "fontWeight": "700", "cursor": "pointer"}}>{"이 질문에 답하기"}</button>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}</section>{" "}</>) : null}{" "}<section style={{"background": "#FFFFFF", "borderRadius": "20px", "border": "1px solid #E7E7E4", "padding": "22px 24px", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<strong >{"이렇게 쓰세요"}</strong>{" "}<ol style={{"margin": "0", "paddingLeft": "20px", "fontSize": "15px", "color": "#454B55", "display": "flex", "flexDirection": "column", "gap": "4px"}}><li >{"지원할 대학의 형식을 고르면 실제와 같은 읽기·답변 시간으로 타이머가 맞춰집니다."}</li><li >{"시작을 누르고 읽기 시간 동안 생각을 정리한 뒤, 답변 시간 안에 영어로 답을 적거나 소리 내어 말하고 핵심을 적습니다."}</li><li >{"AI 면접관이 다섯 가지 기준으로 채점하고, 고칠 점과 모범 답변 뼈대, 꼬리 질문을 줍니다. 꼬리 질문까지 답해야 실전 감각이 생깁니다."}</li><li >{"점수가 낮게 반복되는 항목은 1:1 모의 인터뷰에서 집중적으로 다룹니다."}</li></ol>{" "}<p style={{"margin": "0", "fontSize": "13px", "color": "#5C6370"}}>{"문제는 실제 시험 문제가 아니라 대학이 공개한 평가 항목을 바탕으로 새로 만든 연습 문제입니다. AI 채점은 연습용 참고이며 대학의 실제 평가와 다를 수 있습니다. AI 채점은 회원가입 후 3문제까지 무료입니다."}</p>{" "}</section>{" "}</main>{" "}</div>{" "}</div></>);
};

export default Component;
