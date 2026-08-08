/**
 * 公開フォルダ（basePath）を考慮したファイルの住所を作る。
 *
 * next/image や next/link は basePath を自動で付けてくれるが、
 * 素の <video src> や <video poster> は付けてくれない。
 * GitHub Pages のようにサブフォルダ公開のときは、ここを通さないと動画だけ 404 になる。
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function asset(path?: string): string | undefined {
  if (!path) return path
  // http(s):// や data: で始まる外部URLはそのまま
  if (!path.startsWith("/")) return path
  return `${BASE_PATH}${path}`
}
