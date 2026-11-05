"""Point the interview lab at /api/ai/interview (server-side Claude, free 3 graded answers per account)."""
import re, sys

LOGIN_NEXT = "/medical/interview-lab"


def sub1(t, pat, rep, flags=re.S):
    n = re.subn(pat, lambda m: rep, t, count=1, flags=flags)
    if n[1] != 1:
        raise SystemExit("patch_interview: pattern not found: " + pat[:60])
    return n[0]


def patch(path):
    t = open(path, encoding="utf-8").read()
    if "/api/ai/interview" in t:
        return
    # constructor: no local free counter
    t = sub1(t, r"var used = 0; try \{ used = Number\(window\.localStorage\.getItem\('lab-free-used'\) \|\| 0\) \|\| 0; \} catch \(e\) \{ used = 0; \}", "var used = 0;")
    t = sub1(t, r"this\.state = \{ used: used,", "this.state = { login: false, used: used,")
    # mount: ask the server whether AI is on and how many free answers are used
    t = sub1(t, r"    var C = null;.*?\n    \} catch \(e\) \{ this\.setState\(\{ ai: 'off' \}\); \}\n",
             "    fetch('/api/ai/interview', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {\n"
             "      self.setState({ ai: d.enabled ? 'on' : 'off', login: !!d.loggedIn, used: Number(d.used) || 0, aiMsg: d.enabled ? '' : 'AI 채점을 준비하고 있습니다. 문제은행과 타이머 연습은 지금 바로 할 수 있습니다.' });\n"
             "    }).catch(function () { self.setState({ ai: 'off', aiMsg: 'AI 채점에 연결하지 못했습니다. 문제은행과 타이머 연습은 계속할 수 있습니다.' }); });\n")
    # ask(): POST to our API
    t = sub1(t, r"  ask\(prompt, asJson\) \{.*?\n  \}\n",
             "  ask(body) {\n"
             "    if (this._ctl) this._ctl.abort();\n"
             "    this._ctl = new AbortController();\n"
             "    return fetch('/api/ai/interview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: this._ctl.signal })\n"
             "      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) throw { code: d.code || 'upstream' }; return d; }); })\n"
             "      .catch(function (e) { if (e && e.name === 'AbortError') throw { code: 'cancelled' }; throw e && e.code ? e : { code: 'upstream' }; });\n"
             "  }\n")
    # error codes from our API
    t = sub1(t, r"if \(c === 'not_granted'[^\n]*\n",
             "if (c === 'login') { this.setState({ login: false }); return ''; }\n"
             "    if (c === 'limit') { this.setState({ used: 3 }); return ''; }\n"
             "    if (c === 'disabled') { this.setState({ ai: 'off', aiMsg: 'AI 채점을 준비하고 있습니다. 문제은행과 타이머 연습은 지금 바로 할 수 있습니다.' }); return ''; }\n")
    # question generation
    t = sub1(t, r"self\.ask\('You write practice questions.*?', true\)",
             "self.ask({ mode: 'question', format: F.label + ', ' + F.sub, theme: th })")
    # grading: server builds the prompt
    t = sub1(t, r"        var prompt = 'You are an experienced interviewer.*?';\n", "")
    t = sub1(t, r"self\.ask\(prompt, true\)",
             "self.ask({ mode: 'grade', format: F.label + ' (' + F.sub + ')', parent: cq.parent || '', question: cq.p || '', answer: ans.slice(0, 6000) })")
    t = sub1(t, r"var u = \(self\.state\.used \|\| 0\) \+ 1; try \{ window\.localStorage\.setItem\('lab-free-used', String\(u\)\); \} catch \(e\) \{\}",
             "var u = r._used != null ? Number(r._used) : (self.state.used || 0) + 1;")
    # gating
    t = sub1(t, r"canGrade: S\.ai === 'on' && \(S\.used \|\| 0\) < 3, paywall: S\.ai === 'on' && \(S\.used \|\| 0\) >= 3,",
             "canGrade: S.ai === 'on' && S.login && (S.used || 0) < 3, paywall: S.ai === 'on' && S.login && (S.used || 0) >= 3, needLogin: S.ai === 'on' && !S.login,")
    # template: sign-in prompt next to the AI message
    box = ('{v?.needLogin ? (<><div style={{"background": "#FFF8E8", "border": "1px solid #F0D9A0", "borderRadius": "12px", "padding": "14px 16px", "display": "flex", "flexWrap": "wrap", "gap": "10px", "alignItems": "center", "justifyContent": "space-between"}}>'
           '<span style={{"fontSize": "15px", "color": "#0B1F3A", "fontWeight": "700"}}>{"회원가입하면 AI 면접관 채점 3문제를 무료로 받을 수 있습니다."}</span>'
           '<a href={"/login?next=' + LOGIN_NEXT + '"} onClick={() => { try { document.cookie = "ret=' + LOGIN_NEXT + '; path=/; max-age=1800; samesite=lax"; } catch (e) {} }} '
           'style={{"display": "inline-flex", "alignItems": "center", "minHeight": "44px", "padding": "0 18px", "borderRadius": "10px", "background": "#0B1F3A", "color": "#FFFFFF", "textDecoration": "none", "fontWeight": "800"}}>{"로그인 · 무료 회원가입"}</a></div></>) : null}{" "}')
    t = sub1(t, r"\{v\?\.aiOff \? \(", box + "{v?.aiOff ? (")
    t = t.replace("AI 채점을 처음 사용할 때 한 번 허용 여부를 묻습니다.", "AI 채점은 회원가입 후 3문제까지 무료입니다.")
    open(path, "w", encoding="utf-8").write(t)


if __name__ == "__main__":
    patch(sys.argv[1])
