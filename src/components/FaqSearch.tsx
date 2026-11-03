"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Item = { id: string; q: string; c: string; a: string };

export default function FaqSearch({ items }: { items: Item[] }) {
  const [q, setQ] = useState("");

  useEffect(() => {
    const init = new URLSearchParams(window.location.search).get("q");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (init) setQ(init);
  }, []);

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return items
      .map((it) => {
        const hay = (it.q + " " + it.c).toLowerCase();
        const body = it.a.toLowerCase();
        let score = 0;
        for (const t of terms) {
          if (hay.includes(t)) score += 3;
          else if (body.includes(t)) score += 1;
          else return null;
        }
        return { it, score };
      })
      .filter((x): x is { it: Item; score: number } => !!x)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);
  }, [q, items]);

  return (
    <div style={{ marginBottom: 28 }}>
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        style={{ display: "flex", gap: 10, background: "#FFFFFF", border: "1px solid #D5DCE6", borderRadius: 999, padding: "6px 8px 6px 20px", maxWidth: 640 }}
      >
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="검정고시, 간호, 학비, IELTS…"
          aria-label="질문 검색"
          style={{ flex: 1, border: "none", outline: "none", fontSize: 16, background: "transparent", padding: "10px 0" }}
        />
        <button type="submit" style={{ background: "#0F1B2D", color: "#FFFFFF", border: "none", borderRadius: 999, padding: "10px 18px", fontWeight: 700, fontSize: 15 }}>
          검색
        </button>
      </form>
      {q.trim() ? (
        <section className="ux-card" style={{ marginTop: 14 }} aria-live="polite">
          <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>
            &ldquo;{q.trim()}&rdquo; 검색 결과 {results.length}건
          </h2>
          {results.length === 0 ? (
            <p className="ux-muted" style={{ margin: 0 }}>맞는 질문이 없습니다. 카카오톡으로 물어봐 주시면 직접 답해 드립니다.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {results.map(({ it }) => (
                <li key={it.id} style={{ borderTop: "1px solid #EEF2F7" }}>
                  <Link href={"/faq/" + it.id} style={{ display: "block", padding: "11px 0", textDecoration: "none", fontWeight: 600 }}>
                    {it.q} <span className="ux-muted" style={{ fontWeight: 400, fontSize: 14 }}>· {it.c}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
