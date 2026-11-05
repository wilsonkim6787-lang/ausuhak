import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { adminClient } from "@/lib/supabase/admin";

// Paid medical exam content: ISAT and UCAT ANZ mock sets sold one set at a time.
// The question files live in /private-data and are only served through /api/content/[key].

export const SET_PRICE = 30000;
export const SAMPLE_ITEMS = 5;

export type Exam = "isat" | "ucat";

export const MOCKS: Record<Exam, Record<string, string>> = {
  isat: {
    "MOCK-01": "3d327e1fd9427d54da9e26086014aa62", "MOCK-02": "dd6fb322f910d28879a32582ae298c5d",
    "MOCK-03": "7acdf978b8d1a2632c6f0ab4064bfdef", "MOCK-04": "18926eb00b1bddd013ce03b707774494",
    "MOCK-05": "ca8e1e43110401676c9c2da86b2d62d7", "MOCK-06": "d557591458957da523ea50d3c77c1ee2",
    "MOCK-07": "0feeaf855fac98cceb71ebab95ee743e", "MOCK-08": "5f81c95432649c111ff13fd4a1fa40b7",
    "MOCK-09": "6220fb6eba3b11d0b70711894ac54908", "MOCK-10": "e8731ea2551e7e8948e120ec576d76f7",
  },
  ucat: {
    "MOCK-01": "6f315da3d17ce6f0f9ca1d3bb4590264", "MOCK-02": "a06b579ab4ad979c8d9ecdf743500a5b",
    "MOCK-03": "a49cdddf9bdbbc00ffd2882d2c461421", "MOCK-04": "46586a4bfa7d00c653a15dcf0115adc8",
    "MOCK-05": "9cb26636205971528fd1ba7626de0ff8", "MOCK-06": "f20396ae9084d635f10d7324118cb9c1",
    "MOCK-07": "5c5c489183b8bf5c9e234c13ce1dd91a", "MOCK-08": "ced6c6e91607a79e8c03dff3fd54dbab",
    "MOCK-09": "09cc0704403b4c0d18810b3ad518396f", "MOCK-10": "53a5400f2024cd969345bfbdf007a18f",
  },
};

// The first set of each exam can be tried: its first SAMPLE_ITEMS questions are free.
export const SAMPLE_MOCK = "MOCK-01";

export const EXAM_NAME: Record<Exam, string> = { isat: "ISAT", ucat: "UCAT ANZ" };

export function findFile(fileId: string): { exam: Exam; mockId: string } | null {
  for (const exam of Object.keys(MOCKS) as Exam[]) {
    for (const [mockId, id] of Object.entries(MOCKS[exam])) if (id === fileId) return { exam, mockId };
  }
  return null;
}

export const payEnabled = () => !!(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY && process.env.TOSS_SECRET_KEY);

export async function readPrivate(name: string) {
  const file = path.join(process.cwd(), "private-data", name.replace(/[^a-z0-9-]/gi, "") + ".json");
  return JSON.parse(await readFile(file, "utf8"));
}

// Paid sets for one user, as { isat: { "MOCK-02": true }, ucat: {...} }.
// Returns empty sets when the orders table does not exist yet.
export async function ownedSets(userId: string): Promise<Record<Exam, Record<string, true>>> {
  const out: Record<Exam, Record<string, true>> = { isat: {}, ucat: {} };
  const admin = adminClient();
  if (!admin) return out;
  const { data, error } = await admin.from("mock_orders").select("exam, mock_id").eq("user_id", userId).eq("status", "paid");
  if (error || !data) return out;
  for (const r of data as { exam: Exam; mock_id: string }[]) if (out[r.exam]) out[r.exam][r.mock_id] = true;
  return out;
}

export function hasAnySet(owned: Record<Exam, Record<string, true>>) {
  return Object.values(owned).some((m) => Object.keys(m).length > 0);
}
