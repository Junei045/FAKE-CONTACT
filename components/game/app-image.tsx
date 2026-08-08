"use client"

import Image, { type ImageProps } from "next/image"
import { asset } from "@/lib/base-path"

/**
 * next/image は basePath を自動で付けてくれない。
 * GitHub Pages のようにサブフォルダ公開のとき、そのままでは
 * /avatars/... を探しに行って画像が全部 404 になる。
 *
 * 画像はすべてこの部品を通すことで、公開先に合わせた住所に直す。
 * （直接 next/image を使わないこと）
 */
export function AppImage({ src, ...rest }: ImageProps) {
  const fixed = typeof src === "string" ? (asset(src) as string) : src
  return <Image {...rest} src={fixed} />
}
