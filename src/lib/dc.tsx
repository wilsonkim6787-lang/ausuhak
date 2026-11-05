"use client";
import { Component } from "react";
import type { CSSProperties, ReactNode } from "react";

// Runtime for pages converted from Claude Design boards (tools/dc2tsx.py).
// A board's logic class extends DCLogic; render() feeds renderVals() into the
// generated template (__tpl).
export class DCLogic<P = Record<string, unknown>, S = Record<string, unknown>> extends Component<P, S> {
  declare __tpl: (v: Record<string, unknown>) => ReactNode;
  renderVals(): Record<string, unknown> {
    return {};
  }
  render() {
    return this.__tpl(this.renderVals() || {});
  }
}

const cache = new Map<string, CSSProperties>();

// Parse an inline CSS string ("a: b; c: d") into a React style object.
export function css(s: string | null | undefined): CSSProperties | undefined {
  if (!s) return undefined;
  const hit = cache.get(s);
  if (hit) return hit;
  const out: Record<string, string> = {};
  let depth = 0;
  let quote: string | null = null;
  let cur = "";
  const decls: string[] = [];
  for (const ch of s) {
    if (quote) {
      cur += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') quote = ch;
    else if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === ";" && depth === 0) {
      decls.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) decls.push(cur);
  for (const d of decls) {
    const i = d.indexOf(":");
    if (i < 0) continue;
    const k = d.slice(0, i).trim();
    const v = d.slice(i + 1).trim();
    if (!k) continue;
    const key = k.startsWith("--")
      ? k
      : k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()).replace(/^Ms/, "ms");
    out[key] = v;
  }
  if (cache.size > 2000) cache.clear();
  cache.set(s, out as CSSProperties);
  return out as CSSProperties;
}
