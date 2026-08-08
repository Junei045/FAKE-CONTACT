"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import type { ActionType, RoundResult, Scenario } from "@/lib/types"
import { SCENARIOS } from "@/lib/scenarios"
import { judgeAction, roundScore } from "@/lib/game"
import { SHUFFLE_FIRST_PLAY, shuffleScenarios } from "@/lib/shuffle"
import { playSfx, unlockAudio } from "@/lib/sfx"
import { PhoneFrame } from "./phone-frame"
import { StartScreen } from "./start-screen"
import { ProgressHud } from "./progress-hud"
import { SnsScreen } from "./sns-screen"
import { ActionBar } from "./action-bar"
import { FeedbackScreen } from "./feedback-screen"
import { ResultScreen } from "./result-screen"
import { ProfileSheet } from "./profile-sheet"
import { LinkInspector } from "./link-inspector"

type Phase = "start" | "playing" | "feedback" | "result"

export function FakeContactGame() {
  const [phase, setPhase] = useState<Phase>("start")
  // 出題順。サーバー側で描いた HTML と食い違わないよう、初期値は元の並びのままにし、
  // 「はじめる」を押した瞬間（＝ブラウザ上）にシャッフルする。
  const [order, setOrder] = useState<Scenario[]>(SCENARIOS)
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<RoundResult[]>([])
  const [chosen, setChosen] = useState<ActionType | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [shake, setShake] = useState(false)

  // 各問題の開始時刻（反応速度の計測用）
  const startedAt = useRef<number>(0)
  // 前回の1問目。2回目以降で同じ問題から始まらないようにするため覚えておく
  const lastFirstId = useRef<string | undefined>(undefined)

  const scenario = order[index]
  const total = order.length
  const score = useMemo(
    () => results.reduce((sum, r) => sum + roundScore(r), 0),
    [results],
  )

  const beginPlay = useCallback((i: number) => {
    setIndex(i)
    setChosen(null)
    setProfileOpen(false)
    setLinkOpen(false)
    setPhase("playing")
    startedAt.current = Date.now()
  }, [])

  const handleStart = useCallback(() => {
    // 最初のタップで音を解禁する（iPhone / iPad の制限対策）
    unlockAudio()
    playSfx("start")

    const nextOrder = SHUFFLE_FIRST_PLAY
      ? shuffleScenarios(SCENARIOS, lastFirstId.current)
      : [...SCENARIOS]
    lastFirstId.current = nextOrder[0]?.id
    setOrder(nextOrder)
    setResults([])
    beginPlay(0)
  }, [beginPlay])

  const handleAction = useCallback(
    (action: ActionType) => {
      if (!scenario) return
      const responseSeconds =
        Math.round(((Date.now() - startedAt.current) / 1000) * 10) / 10
      const judgement = judgeAction(scenario, action)

      // ボタンの音（ActionBar 側）と判定の音が重ならないよう、少し間を置いて鳴らす
      window.setTimeout(() => playSfx(judgement), 220)

      if (judgement === "wrong") {
        setShake(true)
        window.setTimeout(() => setShake(false), 420)
      }

      const result: RoundResult = {
        scenarioId: scenario.id,
        category: scenario.category,
        chosen: action,
        correct: scenario.correctAction,
        judgement,
        isFraud: scenario.isFraud,
        responseSeconds,
        checkpoints: scenario.checkpoints,
      }
      setResults((prev) => [...prev, result])
      setChosen(action)
      setPhase("feedback")
    },
    [scenario],
  )

  const handleNext = useCallback(() => {
    const next = index + 1
    if (next >= total) {
      playSfx("result")
      setPhase("result")
    } else {
      playSfx("next")
      beginPlay(next)
    }
  }, [index, total, beginPlay])

  const closeProfile = useCallback(() => {
    playSfx("close")
    setProfileOpen(false)
  }, [])
  const closeLink = useCallback(() => {
    playSfx("close")
    setLinkOpen(false)
  }, [])

  const lastResult = results[results.length - 1]

  return (
    <PhoneFrame>
      <div className={`flex flex-1 flex-col overflow-hidden ${shake ? "animate-fake-shake" : ""}`}>
        {phase === "start" && <StartScreen onStart={handleStart} />}

        {phase === "playing" && scenario && (
          <>
            <ProgressHud index={index} total={total} score={score} />
            <SnsScreen
              key={scenario.id}
              scenario={scenario}
              onOpenProfile={() => setProfileOpen(true)}
              onOpenLink={() => setLinkOpen(true)}
            />
            <ActionBar onAction={handleAction} />
          </>
        )}

        {phase === "feedback" && scenario && chosen && lastResult && (
          <>
            <ProgressHud index={index} total={total} score={score} />
            <FeedbackScreen
              scenario={scenario}
              chosen={chosen}
              judgement={lastResult.judgement}
              isLast={index + 1 >= total}
              onNext={handleNext}
            />
          </>
        )}

        {phase === "result" && (
          <ResultScreen results={results} onRestart={handleStart} />
        )}
      </div>

      {/* オーバーレイ: プロフィール / リンク検査 */}
      {scenario && (
        <ProfileSheet
          open={profileOpen && phase === "playing"}
          onClose={closeProfile}
          profile={scenario.profile}
        />
      )}
      {scenario?.link && (
        <LinkInspector
          open={linkOpen && phase === "playing"}
          onClose={closeLink}
          link={scenario.link}
        />
      )}
    </PhoneFrame>
  )
}
