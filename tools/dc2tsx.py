#!/usr/bin/env python3
"""Convert a Claude Design .dc.html board into a React client component.

The .dc.html template language:
  {{path}}                    value hole (paths resolved against renderVals() result or loop vars)
  <sc-for list="{{x}}" as="p">  loop
  <sc-if value="{{c}}">         conditional
  class Component extends DCLogic { renderVals() {...} }   page logic

Output: a .tsx client component whose class extends DCLogic (a React.Component),
so state/setState/lifecycle behave the same. The template becomes JSX in __tpl(v).

Usage: dc2tsx.py <in.dc.html> <out.tsx> <linkmap.json> <assetmap.json>
"""
import json
import re
import sys

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
NO_WS_PARENTS = {"table", "thead", "tbody", "tfoot", "tr", "colgroup", "select", "ul", "ol", "dl", "svg", "g", "defs"}

ATTR_MAP = {
    "class": "className", "for": "htmlFor", "tabindex": "tabIndex", "readonly": "readOnly",
    "maxlength": "maxLength", "minlength": "minLength", "autocomplete": "autoComplete",
    "autofocus": "autoFocus", "inputmode": "inputMode", "colspan": "colSpan", "rowspan": "rowSpan",
    "srcset": "srcSet", "crossorigin": "crossOrigin", "playsinline": "playsInline", "autoplay": "autoPlay",
    "enterkeyhint": "enterKeyHint", "spellcheck": "spellCheck", "contenteditable": "contentEditable",
    "datetime": "dateTime", "accesskey": "accessKey", "novalidate": "noValidate", "formaction": "formAction",
    "referrerpolicy": "referrerPolicy", "fetchpriority": "fetchPriority", "allowfullscreen": "allowFullScreen",
    "frameborder": "frameBorder", "cellpadding": "cellPadding", "cellspacing": "cellSpacing",
    "onclick": "onClick", "onchange": "onChange", "oninput": "onInput", "onsubmit": "onSubmit",
    "onkeydown": "onKeyDown", "onkeyup": "onKeyUp", "onfocus": "onFocus", "onblur": "onBlur",
    "onmouseenter": "onMouseEnter", "onmouseleave": "onMouseLeave",
    # svg
    "viewbox": "viewBox", "stroke-width": "strokeWidth", "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin", "stroke-dasharray": "strokeDasharray", "stroke-dashoffset": "strokeDashoffset",
    "stroke-opacity": "strokeOpacity", "stroke-miterlimit": "strokeMiterlimit", "fill-rule": "fillRule", "clip-rule": "clipRule",
    "fill-opacity": "fillOpacity", "stop-color": "stopColor", "stop-opacity": "stopOpacity",
    "font-size": "fontSize", "font-weight": "fontWeight", "font-family": "fontFamily", "text-anchor": "textAnchor",
    "dominant-baseline": "dominantBaseline", "preserveaspectratio": "preserveAspectRatio",
    "gradientunits": "gradientUnits", "gradienttransform": "gradientTransform", "clip-path": "clipPath",
    "xlink:href": "xlinkHref", "xml:space": "xmlSpace", "letter-spacing": "letterSpacing",
    "vector-effect": "vectorEffect", "paint-order": "paintOrder", "pathlength": "pathLength",
}
BOOL_ATTRS = {"disabled", "checked", "selected", "hidden", "required", "readonly", "multiple", "autofocus",
              "autoplay", "muted", "loop", "playsinline", "controls", "open", "novalidate", "defer", "async"}

HOLE = re.compile(r"\{\{\s*(.*?)\s*\}\}", re.S)


def tokenize(src):
    """Yield ('open', name, attrs, selfclose) / ('close', name) / ('text', s) / ('comment', s)."""
    i, n = 0, len(src)
    attr_re = re.compile(r'\s*([^\s=/>"\']+)(?:\s*=\s*("([^"]*)"|\'([^\']*)\'|([^\s>"\']+)))?')
    while i < n:
        if src.startswith("<!--", i):
            j = src.find("-->", i)
            j = n if j < 0 else j + 3
            yield ("comment", src[i:j])
            i = j
            continue
        if src[i] == "<" and i + 1 < n and (src[i + 1].isalpha() or src[i + 1] == "/"):
            if src[i + 1] == "/":
                j = src.find(">", i)
                yield ("close", src[i + 2:j].strip())
                i = j + 1
                continue
            m = re.match(r"<([A-Za-z][A-Za-z0-9:-]*)", src[i:])
            name = m.group(1)
            k = i + m.end()
            attrs = []
            while True:
                while k < n and src[k].isspace():
                    k += 1
                if src.startswith("/>", k):
                    yield ("open", name, attrs, True)
                    k += 2
                    break
                if src[k] == ">":
                    yield ("open", name, attrs, False)
                    k += 1
                    break
                am = attr_re.match(src, k)
                if not am or am.end() == k:
                    raise ValueError("bad attr near %r" % src[k:k + 80])
                aval = am.group(3) if am.group(3) is not None else am.group(4) if am.group(4) is not None else am.group(5)
                attrs.append((am.group(1), aval))
                k = am.end()
            i = k
            # raw-text elements
            if name.lower() in ("style", "script") and not (attrs and False):
                end = src.lower().find("</%s>" % name.lower(), i)
                yield ("text_raw", src[i:end])
                i = end
            continue
        j = src.find("<", i + 1) if src[i] == "<" else src.find("<", i)
        j = n if j < 0 else j
        yield ("text", src[i:j])
        i = j


def build_tree(src):
    root = {"name": "#root", "attrs": [], "children": []}
    stack = [root]
    for tok in tokenize(src):
        kind = tok[0]
        if kind == "open":
            _, name, attrs, sc = tok
            node = {"name": name, "attrs": attrs, "children": []}
            stack[-1]["children"].append(node)
            if not sc and name.lower() not in VOID:
                stack.append(node)
        elif kind == "close":
            name = tok[1]
            # pop to matching
            for d in range(len(stack) - 1, 0, -1):
                if stack[d]["name"].lower() == name.lower():
                    del stack[d:]
                    break
        elif kind in ("text", "text_raw"):
            stack[-1]["children"].append({"text": tok[1], "raw": kind == "text_raw"})
    return root


class Conv:
    def __init__(self, linkmap, assetmap):
        self.linkmap = linkmap
        self.assetmap = assetmap

    def expr(self, e, scope):
        e = e.strip()
        if e in ("true", "false", "null", "undefined") or re.fullmatch(r"-?\d+(\.\d+)?", e):
            return e
        if len(e) >= 2 and e[0] in "'\"" and e[-1] == e[0]:
            return json.dumps(e[1:-1], ensure_ascii=False)
        if e.startswith("!"):
            return "!(" + self.expr(e[1:], scope) + ")"
        m = re.fullmatch(r"[A-Za-z_$][\w$]*(\.[\w$]+|\[\d+\])*", e)
        if not m:
            raise ValueError("unsupported hole expression: " + e)
        root = re.match(r"[A-Za-z_$][\w$]*", e).group(0)
        rest = e[len(root):]
        rest = re.sub(r"\.([\w$]+)", r"?.\1", rest)
        base = root if root in scope else "v?." + root
        return base + rest

    def fix_url(self, s):
        for k, v in self.assetmap.items():
            s = s.replace("/_blob/" + k, v)
        return s

    def fix_href(self, s):
        if s in self.linkmap:
            return self.linkmap[s]
        m = re.match(r"([A-Za-z]+\.dc\.html)(#.*)?$", s)
        if m and m.group(1) in self.linkmap:
            return self.linkmap[m.group(1)].rstrip("/") + (m.group(2) or "") if m.group(2) else self.linkmap[m.group(1)]
        for k, v in self.linkmap.items():
            if k.startswith("http") and s.startswith(k):
                return v + s[len(k):]
        return s

    def str_with_holes(self, s, scope):
        """Return JSX attribute value expression for a string possibly containing holes."""
        parts = HOLE.split(s)
        if len(parts) == 1:
            return None
        if len(parts) == 3 and parts[0] == "" and parts[2] == "":
            return self.expr(parts[1], scope)
        out = "`"
        for idx, p in enumerate(parts):
            if idx % 2 == 0:
                out += p.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
            else:
                out += "${" + self.expr(p, scope) + " ?? ''}"
        return out + "`"

    def style_obj(self, s):
        obj = {}
        for decl in split_decls(s):
            if ":" not in decl:
                continue
            k, v = decl.split(":", 1)
            k, v = k.strip(), v.strip()
            if not k:
                continue
            if k.startswith("--"):
                key = k
            else:
                key = re.sub(r"-([a-z])", lambda m: m.group(1).upper(), k)
                if key.startswith("Ms"):
                    key = "ms" + key[2:]
            obj[key] = v
        return obj

    def attrs(self, node, scope):
        out = []
        tag = node["name"]
        names = {a[0].lower() for a in node["attrs"]}
        for name, val in node["attrs"]:
            lname = name.lower()
            if lname.startswith("hint-") or lname in ("x-dc",):
                continue
            jname = ATTR_MAP.get(lname, ATTR_MAP.get(name, name))
            if lname.startswith(("aria-", "data-")):
                jname = lname
            if val is None:
                if lname in BOOL_ATTRS or True:
                    out.append(jname)
                continue
            if lname == "style":
                hv = self.str_with_holes(self.fix_url(val), scope)
                if hv is None:
                    out.append("style={%s}" % json.dumps(self.style_obj(self.fix_url(val)), ensure_ascii=False))
                else:
                    out.append("style={css(%s)}" % hv)
                continue
            if lname in ("src", "poster", "srcset"):
                val = self.fix_url(val)
            if lname == "href":
                val = self.fix_href(self.fix_url(val))
            hv = self.str_with_holes(val, scope)
            if lname == "value" and tag.lower() in ("input", "textarea", "select"):
                if hv is not None:
                    if "onchange" not in names and "oninput" not in names:
                        out.append("defaultValue={%s}" % hv)
                        continue
                    out.append("value={%s}" % hv)
                    if "onchange" not in names:
                        out.append("onChange={() => {}}")
                    continue
                out.append("defaultValue=%s" % json.dumps(val, ensure_ascii=False))
                continue
            if lname in ("checked",) and tag.lower() == "input" and hv is not None and "onchange" not in names:
                out.append("checked={!!(%s)}" % hv)
                out.append("onChange={() => {}}")
                continue
            if hv is not None:
                if lname.startswith("on"):
                    out.append("%s={%s}" % (jname, hv))
                elif lname in BOOL_ATTRS:
                    out.append("%s={!!(%s)}" % (jname, hv))
                else:
                    out.append("%s={%s}" % (jname, hv))
            else:
                if lname.startswith("on"):
                    continue  # static inline handlers are not supported/needed
                out.append("%s=%s" % (jname, jsx_str(val)))
        return out

    def select_value(self, node, scope):
        """For <select>, derive value from option[selected={{..}}] or static selected."""
        return None

    def children(self, node, scope, parent_tag):
        out = []
        kids = node["children"]
        for idx, ch in enumerate(kids):
            if "text" in ch:
                if ch.get("raw"):
                    if parent_tag.lower() == "style":
                        out.append("RAWSTYLE")
                    continue
                t = ch["text"]
                if not t.strip():
                    if parent_tag.lower() in NO_WS_PARENTS or parent_tag == "#root":
                        continue
                    # whitespace between nodes: keep a single space only if neighbours are inline-ish
                    out.append('{" "}')
                    continue
                t = re.sub(r"\s+", " ", t)
                parts = HOLE.split(t)
                for pi, p in enumerate(parts):
                    if pi % 2 == 0:
                        if p:
                            out.append("{%s}" % json.dumps(html_unescape(p), ensure_ascii=False))
                    else:
                        out.append("{%s}" % self.expr(p, scope))
            else:
                out.append(self.node(ch, scope, parent_tag))
        return out

    def node(self, node, scope, dom_parent="#root"):
        name = node["name"]
        lname = name.lower()
        attrs = dict((k.lower(), v) for k, v in node["attrs"])
        if lname == "sc-for":
            lst = HOLE.fullmatch(attrs["list"].strip()).group(1)
            var = attrs.get("as", "item")
            idx = attrs.get("index") or "__i%d" % len(scope)
            inner_scope = scope | {var, idx}
            body = "".join(self.children(node, inner_scope, dom_parent))
            return "{(%s || []).map((%s: any, %s: number) => (<Fragment key={%s}>%s</Fragment>))}" % (
                self.expr(lst, scope), var, idx, idx, body)
        if lname == "sc-if":
            cond = HOLE.fullmatch(attrs["value"].strip()).group(1)
            body = "".join(self.children(node, scope, dom_parent))
            return "{%s ? (<>%s</>) : null}" % (self.expr(cond, scope), body)
        if lname == "style":
            css_text = "".join(c.get("text", "") for c in node["children"])
            return "<style dangerouslySetInnerHTML={{ __html: %s }} />" % json.dumps(self.fix_css(css_text), ensure_ascii=False)
        if lname == "script":
            return ""
        if lname == "a" and attrs.get("href") == "#":
            txt = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", node_text(node))).strip()
            for prefix, target in TEXTLINKS:
                if txt.startswith(prefix):
                    if target == "REMOVE":
                        return ""
                    node = dict(node)
                    node["attrs"] = [(k, (target if k.lower() == "href" else v)) for k, v in node["attrs"]]
                    if target.startswith("http"):
                        node["attrs"] += [("target", "_blank"), ("rel", "noopener")]
                    break
        a = self.attrs(node, scope)
        tag = name
        if lname == "form":
            tag = "ConsultForm"
            a.append("source={%s}" % json.dumps(FORM_SOURCE[0]))
        if lname in VOID:
            return "<%s %s />" % (tag, " ".join(a))
        body = "".join(self.children(node, scope, name))
        return "<%s %s>%s</%s>" % (tag, " ".join(a), body, tag)

    def fix_css(self, css_text):
        css_text = self.fix_url(css_text)
        # drop @font-face blocks (Pretendard is loaded globally)
        css_text = re.sub(r"@font-face\s*\{[^}]*\}", "", css_text)
        css_text = css_text.replace("'Pretendard'", "'Pretendard Variable','Pretendard'")
        return css_text.strip()


TEXTLINKS = []
FORM_SOURCE = ["site"]


def node_text(node):
    out = []
    for c in node.get("children", []):
        if "text" in c:
            out.append(c["text"])
        else:
            out.append(" " + node_text(c) + " ")
    return "".join(out)


def walk(node):
    for c in node.get("children", []):
        if "name" in c:
            yield c
            yield from walk(c)


def split_decls(s):
    out, depth, cur, q = [], 0, "", None
    for ch in s:
        if q:
            cur += ch
            if ch == q:
                q = None
            continue
        if ch in "'\"":
            q = ch
        elif ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == ";" and depth == 0:
            out.append(cur)
            cur = ""
        else:
            cur += ch
    if cur.strip():
        out.append(cur)
    return out


def html_unescape(s):
    import html
    return html.unescape(s)


def jsx_str(v):
    import html
    v = html.unescape(v)
    return "{%s}" % json.dumps(v, ensure_ascii=False)


def main():
    inp, outp, linkmap_p, assetmap_p = sys.argv[1:5]
    src = open(inp, encoding="utf-8").read()
    linkmap = json.load(open(linkmap_p))
    assetmap = json.load(open(assetmap_p))
    conv = Conv(linkmap, assetmap)
    if len(sys.argv) > 5:
        TEXTLINKS.extend(json.load(open(sys.argv[5])))

    xm = re.search(r"<x-dc>(.*)</x-dc>", src, re.S)
    tpl = xm.group(1).replace("'Pretendard'", "'Pretendard Variable','Pretendard'")
    FORM_SOURCE[0] = inp.split("/")[-2].replace("project", "") + inp.split("/")[-1].replace(".dc.html", "")
    base = re.sub(r".*[/_]", "", inp).replace(".dc.html", "")
    FORM_SOURCE[0] = ("medical/" if ("/med/" in inp or "_med_" in inp) else "") + base
    sm = re.search(r'<script type="text/x-dc"[^>]*>(.*?)</script>', src, re.S)
    script = sm.group(1) if sm else "class Component extends DCLogic { renderVals() { return {}; } }"
    script = conv.fix_url(script)
    for k, v in linkmap.items():
        if k.endswith(".dc.html"):
            script = re.sub(r"(['\"])" + re.escape(k) + r"(#[^'\"]*)?(['\"])",
                            lambda m: m.group(1) + v + (m.group(2) or "") + m.group(3), script)
    script = script.replace("'Pretendard'", "'Pretendard Variable','Pretendard'")

    tree = build_tree(tpl)
    # helmet -> styles
    parts = []
    for ch in tree["children"]:
        if "name" in ch and ch["name"].lower() == "helmet":
            for h in ch["children"]:
                if "name" in h and h["name"].lower() == "style":
                    parts.append(conv.node(h, set()))
        elif "name" in ch:
            parts.append(conv.node(ch, set()))
    jsx = "\n".join(parts)

    out = []
    out.append("// @ts-nocheck")
    out.append('"use client";')
    out.append("/* eslint-disable */")
    out.append("// Generated from %s by tools/dc2tsx.py. Edit the generator input, not this file, for layout changes." % re.sub(r".*[/_]", "", inp))
    out.append('import { Fragment } from "react";')
    out.append('import { DCLogic, css } from "@/lib/dc";')
    if "<ConsultForm" in jsx:
        out.append('import ConsultForm from "@/components/ConsultForm";')
    out.append("")
    out.append(script.strip())
    out.append("")
    out.append("Component.prototype.__tpl = function (v: any) {")
    out.append("  return (<>%s</>);" % jsx)
    out.append("};")
    out.append("")
    out.append("export default Component;")
    open(outp, "w", encoding="utf-8").write("\n".join(out) + "\n")


if __name__ == "__main__":
    main()
