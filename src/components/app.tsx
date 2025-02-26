import { useEffect, useState } from "preact/hooks"
import { timingMap, useAnimation } from "../hooks/useAnimation"
import { bind } from "../math"
import "./app.css"
import { Wave } from "./wave"

enum Gender {
  female = -1,
  neutral = 0,
  male = 1,
}

enum Action {
  hate = -1,
  favor = 0,
  love = 1,
}

const targets = {
  gynocentrism: { action: Action.love, gender: Gender.female, brief: "Love women" },
  feminism: { action: Action.favor, gender: Gender.female, brief: "Favor women" },
  misoginy: { action: Action.hate, gender: Gender.female, brief: "Hate women" },
  androginy: { action: Action.love, gender: Gender.neutral, brief: "Love all equally" },
  equitism: { action: Action.favor, gender: Gender.neutral, brief: "Favor all equaly" },
  autocracy: { action: Action.hate, gender: Gender.neutral, brief: "Hate all equally - but me" },
  androcentrism: { action: Action.love, gender: Gender.male, brief: "Love men" },
  masculinism: { action: Action.favor, gender: Gender.male, brief: "Favor men" },
  misandry: { action: Action.hate, gender: Gender.male, brief: "Hate men" },
}
type TargetName = keyof typeof targets

const favorStep = 0.04
const interpolateFavor = (origin: number, target: number) => bind(origin + bind(target - origin < favorStep ? (target - origin) / 2 : target < origin ? -1 : 1, -favorStep, favorStep), 0, 1)

export function App() {
  const progress = useAnimation({ from: 0, to: 1, duration: 3, delay: 0, maxCount: Infinity }).value
  const [targetName, setTargetName] = useState<TargetName | "">("")
  const { gender, action } = targetName && targets[targetName] || { gender: 0, action: 0 }

  const [femaleFavor, setFemaleFavor] = useState(0.25)
  const [femaleFavorTarget, setFemaleFavorTarget] = useState(femaleFavor)
  const [maleFavor, setMaleFavor] = useState(0.25)
  const [maleFavorTarget, setMaleFavorTarget] = useState(maleFavor)
  const globalFavor = bind(femaleFavor + maleFavor, 0, 1)

  const [showLocalAction, setShowLocalAction] = useState(true)
  const [showLocalState, setShowLocalState] = useState(true)
  const [showGlobalAction, setShowGlobalAction] = useState(true)
  const [showGlobalState, setShowGlobalState] = useState(true)

  const onClickLabel = (name: string) => () => {
    if (name === targetName) {
      setFemaleFavorTarget(femaleFavor)
      setMaleFavorTarget(maleFavor)
      setTargetName("")
      return
    }

    setTargetName(name as TargetName)
    const { gender, action: build } = targets[name as TargetName]
    if (gender && build) {
      setFemaleFavorTarget(gender < 0 ? bind((build + 1) / 2, 0, 1 - maleFavor) : femaleFavor)
      setMaleFavorTarget(gender > 0 ? bind((build + 1) / 2, 0, 1 - femaleFavor) : maleFavor)
    } else if (gender) {
      setFemaleFavorTarget(gender < 0 ? 1 : 0)
      setMaleFavorTarget(gender > 0 ? 1 : 0)
    } else {
      setFemaleFavorTarget(build ? (build + 1) / 2 / 2 : globalFavor / 2)
      setMaleFavorTarget(build ? (build + 1) / 2 / 2 : globalFavor / 2)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setFemaleFavor(femaleFavor => interpolateFavor(femaleFavor, femaleFavorTarget))
      setMaleFavor(maleFavor => interpolateFavor(maleFavor, maleFavorTarget))
    }, 500)
    return () => clearInterval(interval)
  }, [femaleFavorTarget, maleFavorTarget, femaleFavor, maleFavor])

  return <>
    <header class="chart-header">
      <div class="chart-header-name">Sexism dynamics diagram</div>
      <div class="button" data-active={showLocalAction || null} onClick={() => setShowLocalAction(v => !v)}>Show local action</div>
      <div class="button" data-active={showGlobalAction || null} onClick={() => setShowGlobalAction(v => !v)}>Show global action</div>
      <div class="button" data-active={showLocalState || null} onClick={() => setShowLocalState(v => !v)}>Show local state</div>
      <div class="button" data-active={showGlobalState || null} onClick={() => setShowGlobalState(v => !v)}>Show global state</div>
    </header>
    <main className="chart">
      {showLocalAction ? <div className="split screen">
        {targetName && gender <= 0 && action ? <Wave angle={90 - action * 90} {...{ progress }} timing={timingMap.linear} span={0.1} count={5} color={action < 0 ? "#e552" : action > 0 ? "#5e52" : ""} /> : <div />}
        {targetName && gender >= 0 && action ? <Wave angle={90 - action * 90} {...{ progress }} timing={timingMap.linear} span={0.1} count={5} color={action < 0 ? "#e552" : action > 0 ? "#5e52" : ""} /> : <div />}
      </div> : ""}
      {showGlobalAction ? <div className="split screen">
        {targetName && gender >= 0 ? <Wave angle={90 - action * 45 + (action < 0 ? 90 : 0)} color="#fff2" {...{ progress }} /> : ""}
        {targetName && gender <= 0 ? <Wave angle={270 + action * 45 - (action < 0 ? 90 : 0)} color="#fff2" {...{ progress }} /> : ""}
      </div> : ""}
      {showLocalState ? <div className="split screen">
        <div className="bar" style={{ top: `${(1 - femaleFavor) * 100}%`, right: "50%" }}>Female favor</div>
        <div className="bar" style={{ top: `${(1 - maleFavor) * 100}%`, left: "50%" }}>Male favor</div>
      </div> : ""}
      {showGlobalState ? <div className="bar bar-global" style={{ top: `${(1 - globalFavor) * 100}%` }}>Global favor</div> : ""}
      <div>
        {Object.entries(targets).map(([name, { action: build, gender, brief }]) => <div key={name}
          className="label screen"
          data-selected={name === targetName || null}
          style={{
            alignItems: build < 0 ? "flex-end" : build > 0 ? "flex-start" : "center",
            justifyContent: gender < 0 ? "flex-start" : gender > 0 ? "flex-end" : "center",
            flexDirection: build < 0 ? "row-reverse" : "row",
            textAlign: !gender ? "center" : gender < 0 && build >= 0 || gender > 0 && build <= 0 ? "left" : "right",
          }}
          onClick={onClickLabel(name)}
        >
          <div>
            <div className="label-name">{name}</div>
            <div className="label-brief" style={{ color: build < 0 ? "#e55" : build > 0 ? "#5e5" : "" }}>"{brief}"</div>
          </div>
        </div>)}
      </div>
    </main>
  </>
}
