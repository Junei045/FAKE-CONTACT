# GitHub Pages で公開する手順

一度この設定をしておけば、**以後は変更を push するたびに自動で公開されます。**

---

## 1. リポジトリを作って push する

GitHub で新しいリポジトリを **public** で作ります。名前は何でも構いませんが、そのままURLになります。ここでは `FAKE-CONTACT` として説明します。

このフォルダの中身をすべて push します。

```bash
cd FAKE_CONTACT
git init
git add .
git commit -m "FAKE CONTACT 初回"
git branch -M main
git remote add origin https://github.com/junei045/FAKE-CONTACT.git
git push -u origin main
```

`node_modules` と `out` は `.gitignore` で除外済みなので、そのまま実行して構いません。

---

## 2. GitHub Pages の設定を「GitHub Actions」に変える

**ここが一番間違えやすいところです。**

リポジトリの画面で
**Settings** → 左メニューの **Pages** → **Build and deployment** → **Source**

ここを **「GitHub Actions」** に変更します（初期値の「Deploy from a branch」のままだと公開されません）。

---

## 3. 待つ

push すると **Actions** タブで処理が始まります。2〜3分で緑のチェックが付き、

`https://junei045.github.io/FAKE-CONTACT/`

で公開されます。URL は Actions の結果画面にも表示されます。

以後は、ファイルを直して push するだけで自動的に更新されます。

---

## なぜこの設定が必要だったのか

**① `output: 'export'`（next.config.mjs）**
GitHub Pages は HTML・CSS・JS などの「できあがったファイル」しか置けません。Next.js は本来サーバーで動く仕組みなので、この指定で「サーバー不要の形」に書き出しています。書き出し先は `out` フォルダです。

**② basePath**
`https://junei045.github.io/FAKE-CONTACT/` のように**フォルダの下**で公開されるため、画像やスクリプトの住所すべての先頭に `/FAKE-CONTACT` を付ける必要があります。ここを忘れると**画面が真っ白**になります。

この値はワークフローがリポジトリ名から自動で決めるので、リポジトリ名を変えても手直しは不要です。手で書き換える箇所はありません。

**③ `.nojekyll`**
GitHub Pages は既定で Jekyll という仕組みを通します。Jekyll はアンダースコアで始まるフォルダを無視するため、Next.js が作る `_next` フォルダが丸ごと消えてしまいます。空の `.nojekyll` を置いて、これを止めています。

**④ 画像最適化オフ**
Next.js の画像最適化はサーバーが必要なので、静的公開では使えません（元から `unoptimized: true` になっていました）。

---

## 手元で本番と同じ見え方を確かめる

```bash
NEXT_PUBLIC_BASE_PATH=/FAKE-CONTACT npm run build
npx serve out
```

Windows のコマンドプロンプトの場合:

```
set NEXT_PUBLIC_BASE_PATH=/FAKE-CONTACT
npm run build
npx serve out
```

普段の開発は今までどおり `npm run dev` で構いません。

---

## そのほかの変更点

- **Vercel Analytics を外しました。** GitHub Pages では読み込めず、ブラウザのコンソールにエラーが出続けるためです。
- **`pnpm-lock.yaml` を削除し、`package-lock.json` に統一しました。** 2種類あるとどちらが正しいのか分からなくなるためです。npm を使う前提で揃えてあります。

---

## うまくいかないときの見どころ

| 症状 | 原因 |
|---|---|
| 画面が真っ白 | basePath か `.nojekyll` の問題。ブラウザで F12 を押し、赤い 404 が出ているファイルの住所を確認 |
| 404 ページが出る | Settings → Pages の Source が「GitHub Actions」になっているか確認 |
| Actions が赤くなる | Actions タブでログを開き、赤い行を確認。ネットワーク不調なら再実行で直ることが多い |
| 直したのに古い画面のまま | ブラウザのキャッシュ。URL の末尾に `?v=2` を付けて開く（警察官騙りのときと同じ） |
