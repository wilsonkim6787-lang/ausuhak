import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { SAMPLE_ITEMS, SAMPLE_MOCK, findFile, hasAnySet, ownedSets, readPrivate } from "@/lib/medpay";

// Serves exam question files from /private-data.
//  - a mock set: in full to admins and buyers of that set; the sample set's first questions to everyone; otherwise 403
//  - "isat-bank" (practice bank): in full to admins and anyone who bought a set; otherwise the first
//    questions of each section in full and the rest without question text, so the list still shows them as locked.

type Item = Record<string, unknown> & { id?: string; section?: string };
const KEEP = ["id", "section", "type", "difficulty", "order", "setId", "subtest"];

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const { user, profile } = await getSession();
  const isAdmin = profile?.role === "admin";
  const owned = user && !isAdmin ? await ownedSets(user.id) : { isat: {}, ucat: {} };
  const headers = { "Cache-Control": "private, no-store" };

  if (key === "isat-bank") {
    const d = await readPrivate("isat-bank");
    if (isAdmin || hasAnySet(owned)) return NextResponse.json({ ...d, full: true }, { headers });
    for (const t of Object.values(d.tests as Record<string, { items: Item[] }>)) {
      const rank: Record<string, number> = {};
      t.items = t.items.map((it) => {
        const s = String(it.section);
        rank[s] = (rank[s] || 0) + 1;
        return rank[s] <= SAMPLE_ITEMS ? it : (Object.fromEntries(KEEP.filter((k) => k in it).map((k) => [k, it[k]])) as Item);
      });
    }
    return NextResponse.json({ ...d, full: false }, { headers });
  }

  const f = findFile(key);
  if (!f) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const d = await readPrivate(key);
  if (isAdmin || owned[f.exam][f.mockId]) return NextResponse.json({ ...d, full: true }, { headers });
  if (f.mockId !== SAMPLE_MOCK) return NextResponse.json({ error: "locked" }, { status: 403, headers });
  const SUB: Record<string, number> = { VR: 0, DM: 1, QR: 2, SJT: 3 };
  const items = [...(d.items as (Item & { order?: number })[])].sort(
    (a, b) => (SUB[String(a.subtest)] ?? 0) - (SUB[String(b.subtest)] ?? 0) || (a.order ?? 0) - (b.order ?? 0),
  );
  return NextResponse.json({ ...d, items: items.slice(0, SAMPLE_ITEMS), full: false }, { headers });
}
