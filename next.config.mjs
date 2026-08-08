/**
 * GitHub Pages 公開用の設定。
 *
 * basePath とは「サイトがどのフォルダの下に置かれるか」のこと。
 * https://junei045.github.io/FAKE-CONTACT/ で公開する場合、
 * すべての画像やスクリプトの住所の先頭に /FAKE-CONTACT を付ける必要がある。
 * これを間違えると「画面が真っ白」「画像だけ出ない」になる。
 *
 * この値は GitHub Actions 側でリポジトリ名から自動的に渡している（.github/workflows/deploy.yml）。
 * 手元で本番と同じ見え方を確かめたいときは、リポジトリ名を入れて:
 *   NEXT_PUBLIC_BASE_PATH=/FAKE-CONTACT npm run build
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  // サーバーを使わず、HTML・CSS・JS だけを out/ に書き出す（GitHub Pages はこれしか置けない）
  output: 'export',

  basePath,
  assetPrefix: basePath || undefined,

  // /page → /page/index.html の形にする。GitHub Pages で404になるのを防ぐ
  trailingSlash: true,

  images: {
    // Next.js の画像最適化はサーバーが必要なため、静的公開では必ずオフにする
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // ブラウザ側のコードからも basePath を参照できるようにする（<video> のURL組み立てに使用）
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}

export default nextConfig
