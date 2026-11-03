// File rules for family uploads (used in the browser and in the server action).

export const UPLOAD_MAX_BYTES = 15 * 1024 * 1024;

export const UPLOAD_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  heic: "image/heic",
  heif: "image/heif",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const UPLOAD_ACCEPT = ".pdf,.jpg,.jpeg,.png,.heic,.heif,.docx";

export function extOf(name: string) {
  const m = /\.([A-Za-z0-9]+)$/.exec(name.trim());
  return m ? m[1].toLowerCase() : "";
}

export function checkUpload(name: string, size: number): string | null {
  if (!UPLOAD_TYPES[extOf(name)]) return "PDF, JPG, PNG, HEIC, Word(docx) 파일만 올릴 수 있습니다.";
  if (size <= 0) return "빈 파일입니다. 파일을 다시 골라 주세요.";
  if (size > UPLOAD_MAX_BYTES) return "15MB 이하 파일만 올릴 수 있습니다. 용량을 줄여서 다시 올려 주세요.";
  return null;
}
