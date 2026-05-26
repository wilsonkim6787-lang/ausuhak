import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { upsertGalleryAction, deleteGalleryAction } from "./actions";
import { SaveButton, DeleteButton } from "./GalleryFormButtons";

type GalleryRow = {
  id: string;
  image_path: string | null;
  caption: string | null;
  display_order: number;
  status: string;
  created_at: string;
};

const STATUSES: [string, string][] = [
  ["draft", "📝 draft"],
  ["published", "✅ published"],
  ["archived", "📦 archived"],
];

const ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string; err?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("gallery")
    .select("id, image_path, caption, display_order, status, created_at")
    .order("display_order")
    .order("created_at", { ascending: false });

  let editing: GalleryRow | null = null;
  if (sp.edit) {
    const { data } = await supabase
      .from("gallery")
      .select("*")
      .eq("id", sp.edit)
      .single();
    editing = data as GalleryRow | null;
  }

  const showForm = sp.new === "1" || editing;
  const items = (rows ?? []) as GalleryRow[];
  const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">갤러리 관리</h1>
        {!showForm && (
          <a href="/admin/gallery?new=1">
            <Button>+ 사진 추가</Button>
          </a>
        )}
      </div>

      {sp.err && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {sp.err}
        </p>
      )}
      {sp.ok && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          저장 완료
        </p>
      )}

      {showForm && (
        <form
          action={upsertGalleryAction}
          className="space-y-4 rounded-xl border border-cream-300 bg-white p-6"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy-900">
              사진 {editing ? "(변경 시만 선택)" : "*"}
            </label>
            <input
              type="file"
              name="file"
              accept={ACCEPT}
              required={!editing}
              className="text-sm"
            />
            <p className="mt-1 text-xs text-ink-500">JPG·PNG·WebP / 최대 5MB</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-navy-900">
              캡션 (선택)
            </label>
            <input
              type="text"
              name="caption"
              defaultValue={editing?.caption ?? ""}
              placeholder="예: 2024 시드니 졸업식"
              className="w-full rounded-lg border border-cream-300 px-4 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-navy-900">상태</label>
              <select
                name="status"
                defaultValue={editing?.status ?? "published"}
                className="w-full rounded-lg border border-cream-300 px-4 py-2 text-sm"
              >
                {STATUSES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-navy-900">순서</label>
              <input
                type="number"
                name="display_order"
                defaultValue={editing?.display_order ?? 0}
                className="w-full rounded-lg border border-cream-300 px-4 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <SaveButton />
            <a href="/admin/gallery">
              <Button type="button">취소</Button>
            </a>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-ink-500">등록된 사진이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-cream-300 bg-white shadow-sm"
            >
              {item.image_path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${storageBase}/${item.image_path}`}
                  alt={item.caption ?? "갤러리 사진"}
                  className="aspect-[4/3] w-full object-cover"
                />
              )}
              <div className="p-3">
                {item.caption && (
                  <p className="text-sm font-medium text-navy-900">{item.caption}</p>
                )}
                <p className="mt-1 text-xs text-ink-500">
                  {item.status === "published" ? "✅" : item.status === "draft" ? "📝" : "📦"}{" "}
                  순서 {item.display_order}
                </p>
                <div className="mt-2 flex gap-2">
                  <a
                    href={`/admin/gallery?edit=${item.id}`}
                    className="text-xs font-semibold text-gold-600 hover:text-gold-500"
                  >
                    수정
                  </a>
                  <form action={deleteGalleryAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <DeleteButton />
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
