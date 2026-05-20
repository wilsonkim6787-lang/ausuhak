import { Fragment } from "react";

const NUM_CHARS = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮";
const NUM_RE = new RegExp(`[${NUM_CHARS}]`);

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-navy-900">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={`${keyPrefix}-t-${i}`}>{p}</Fragment>;
  });
}

export function renderAnswer(raw: string) {
  const noteSplit = raw.split(/(※[^※]*)$/);
  const main = noteSplit[0].trim();
  const note = noteSplit[1]?.trim();

  const withBreaks = main.replace(new RegExp(`(?=[${NUM_CHARS}])`, "g"), "\n");
  const lines = withBreaks
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const blocks: Array<{ type: "list" | "para"; items: string[] }> = [];
  for (const line of lines) {
    const isNum = NUM_RE.test(line.charAt(0));
    const last = blocks[blocks.length - 1];
    if (isNum && last?.type === "list") {
      last.items.push(line);
    } else if (isNum) {
      blocks.push({ type: "list", items: [line] });
    } else {
      blocks.push({ type: "para", items: [line] });
    }
  }

  return (
    <div className="space-y-3 text-[15px] leading-relaxed sm:text-base">
      {blocks.map((b, i) =>
        b.type === "list" ? (
          <ul key={`b-${i}`} className="space-y-2">
            {b.items.map((item, j) => {
              const num = item.charAt(0);
              const rest = item.slice(1).replace(/^[\s.]+/, "");
              return (
                <li
                  key={`li-${i}-${j}`}
                  className="flex gap-2.5 rounded-lg bg-white px-3 py-2 text-ink-700 shadow-sm"
                >
                  <span className="shrink-0 font-bold text-gold-600">{num}</span>
                  <span className="flex-1">{renderInline(rest, `il-${i}-${j}`)}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p key={`b-${i}`} className="text-ink-700">
            {renderInline(b.items[0], `ip-${i}`)}
          </p>
        )
      )}
      {note && (
        <div className="rounded-lg border border-cream-300 bg-cream-100/60 px-3 py-2 text-xs leading-relaxed text-ink-500">
          {note}
        </div>
      )}
    </div>
  );
}
