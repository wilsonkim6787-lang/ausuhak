import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ownedSets, payEnabled } from "@/lib/medpay";

// What the medical exam pages need to draw the set list: who is looking and what they own.
export async function GET() {
  const { user, profile } = await getSession();
  const isAdmin = profile?.role === "admin";
  const owned = user && !isAdmin ? await ownedSets(user.id) : { isat: {}, ucat: {} };
  return NextResponse.json(
    { loggedIn: !!user, admin: isAdmin, owned, payEnabled: payEnabled() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
