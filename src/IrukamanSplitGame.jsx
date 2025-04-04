import React, { useState, useEffect } from "react";

import Particles from "react-tsparticles";
import { loadStarsPreset } from "tsparticles-preset-stars";

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// 「ぴき・びき・ひき」変換
const びきへんかん = (かず) => {
  if (かず === 1 || [6, 8, 10].includes(かず)) return `${かず}ぴき`;
  if ([3].includes(かず)) return `${かず}びき`;
  return `${かず}ひき`;
};

const IrukamanGame = () => {
  const [スタートした, setスタートした] = useState(false);
  const [ぜんぶ, setぜんぶ] = useState(getRandomInt(3, 10));
  const [ひだり, setひだり] = useState(0);
  const [みぎ, setみぎ] = useState(0);
  const [けっか, setけっか] = useState("");
  const [みつけた, setみつけた] = useState(new Set());
  const [エフェクト中, setエフェクト中] = useState(false);
  const [えらばれたこ, setえらばれたこ] = useState(null);
  const [おんがく, setおんがく] = useState(true);
  const [スコア, setスコア] = useState(0);
  const [おめでとう, setおめでとう] = useState(false);

  const のこり = ぜんぶ - ひだり - みぎ;
  const こたえのかず = ぜんぶ + 1;
  const ぜんぶできた = みつけた.size === こたえのかず;

  const [bgm] = useState(() => {
    const audio = new Audio("/05.wav");
    audio.volume = 0.05;  // ✅ 初期化時に音量設定！
    return audio;
  });  

  const こたえあわせ = () => {
    if (ひだり + みぎ !== ぜんぶ) {
      setけっか("まだ ぜんぶ わけてないよ！");
      return;
    }

    const key = `${ひだり}+${みぎ}`;

    if (みつけた.has(key)) {
      const fuseikai = new Audio("/fuseikai.mp3");
      fuseikai.play();
      setけっか("そのわけかたは もうやったよ！ほかのわけかたを みつけよう！");
      return;
    }

    // ✅ 効果音再生（せいかい時のみ！）
    const audio = new Audio("/seikai.mp3");
    audio.play();

    const あたらしい = new Set(みつけた);
    あたらしい.add(key);
    setみつけた(あたらしい);
    setスコア(スコア + 1); // ✅ スコア+1！

    setけっか(`すばらしい！${ひだり}と${みぎ}で ${びきへんかん(ぜんぶ)}！`);
    setひだり(0);
    setみぎ(0);
  };

  const つぎのもんだいへ = () => {
    setおめでとう(false);
    setみつけた(new Set());
    setけっか("");
    setひだり(0);
    setみぎ(0);
    const あたらしいもんだい = Math.floor(Math.random() * 8) + 3;
    setぜんぶ(あたらしいもんだい);
  };

  const ドロップ = (どこ) => {
    if (ひだり + みぎ >= ぜんぶ) return;

    // 効果音を鳴らす
    const splash = new Audio("/splash.mp3");
    splash.play();

    // アニメーションフラグをオン
    setエフェクト中(true);
    setTimeout(() => {
      setエフェクト中(false);
      setえらばれたこ(null);
    }, 400);

    if (どこ === "ひだり") setひだり(ひだり + 1);
    else setみぎ(みぎ + 1);
  };

  const onDragStart = (e, index) => {
    setえらばれたこ(index);
    e.dataTransfer.setData("text/plain", "いるかまん");
    e.dataTransfer.setDragImage(new Image(), 0, 0);
  };
  const allowDrop = (e) => e.preventDefault();
  const onDrop = (e, side) => {
    e.preventDefault();
    ドロップ(side);
  };

  const もどす = (どこ) => {
    if (エフェクト中) return;
    if (どこ === "ひだり" && ひだり > 0) setひだり(ひだり - 1);
    else if (どこ === "みぎ" && みぎ > 0) setみぎ(みぎ - 1);
  };

  useEffect(() => {
    if (!おんがく) {
      bgm.pause();
      return;
    }

    const はじめてのクリック = () => {
      bgm.loop = true;
      bgm.currentTime = 0; // ✅ クリック後の再生位置リセット
      bgm.volume = 0.05;
      bgm.play();
      window.removeEventListener("click", はじめてのクリック);
    };

    window.addEventListener("click", はじめてのクリック);

    return () => {
      window.removeEventListener("click", はじめてのクリック);
      bgm.pause();
    };
  }, [おんがく]);

  useEffect(() => {
    if (みつけた.size === ぜんぶ + 1 && !おめでとう) {
      setおめでとう(true);
      const congrats = new Audio("/congrats.mp3");
      congrats.play();
    }
  }, [みつけた, ぜんぶ]);

  return (
    <>
      {!スタートした && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-200 to-blue-300 text-center">
          <h1 className="text-4xl font-bold text-blue-800 mb-6 drop-shadow">
            🐬 いるかまんの わけっこゲーム
          </h1>
          <img src="/irukaman.png" alt="イルカマン" className="w-24 sm:w-32 mb-6 animate-bounce" />
          <button
            onClick={() => setスタートした(true)}
            className="px-6 py-3 bg-green-400 hover:bg-green-500 text-white rounded-xl text-lg font-bold shadow-lg"
          >
            スタート！
          </button>
        </div>
      )}

      {スタートした && (
        <div className="min-h-screen bg-wave bg-cyan-50">
          <div className="flex flex-col lg:flex-row justify-center items-start gap-6 w-full max-w-5xl mx-auto px-4">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-xl flex flex-col items-center text-center gap-1">
              <h1 className="text-2xl font-bold mb-3">イルカマンの わけっこゲーム</h1>
              <p className="mb-1">
                {びきへんかん(ぜんぶ)}の イルカマンを <br />
                <strong>ひだりのうみと みぎのうみ</strong>に わけてみよう！
              </p>

              <div
                className="grid grid-cols-4 sm:grid-cols-5 gap-2 justify-items-center w-full max-w-md min-h-[140px] mx-auto mb-2"
              >
                {[...Array(のこり)].map((_, i) => (
                  <img
                    key={i}
                    src="/irukaman.png"
                    alt="いるかまん"
                    className={`w-16 h-16 object-contain cursor-pointer transition-transform hover:scale-105 
      ${えらばれたこ === i ? "ring-4 ring-yellow-400" : ""}`}
                    onClick={() => {
                      if (エフェクト中) return;
                      setえらばれたこ(i); // この子をえらんだ状態にする！
                    }}
                  />
                ))}
              </div>

              <div className="flex justify-center items-start gap-10 mb-3">
                {["ひだり", "みぎ"].map((side) => {
                  const すうじ = side === "ひだり" ? ひだり : みぎ;
                  return (
                    <div
                      key={side}
                      onClick={() => {
                        if (えらばれたこ === null) return;
                        ドロップ(side);
                        setえらばれたこ(null);
                      }}
                      className="mt-4 p-2 border-4 border-blue-300 bg-gradient-to-t from-blue-300 to-blue-100 rounded-xl w-24 h-24 sm:w-28 sm:h-28 flex flex-col items-center justify-center shadow-lg cursor-pointer hover:ring-4 hover:ring-yellow-300 transition"
                    >
                      <p className="text-2xl font-bold">{すうじ}</p>
                      <p className="text-sm">{side}のうみ</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // ボタンのクリックが親のonClickを発火しないように！
                          もどす(side);
                        }}
                        className="mt-1 text-xs px-2 py-1 bg-white/80 rounded hover:bg-white"
                      >
                        1ぴき もどす
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                className="mt-2 mb-2 px-4 py-2 bg-pink-400 text-white rounded hover:bg-pink-500"
                onClick={こたえあわせ}
              >
                こたえあわせ！
              </button>

              <p className="text-md mb-1">{けっか}</p>

              <p className="mt-2 text-sm font-semibold text-blue-800">
                {みつけた.size < ぜんぶ + 1
                  ? `あと ${ぜんぶ + 1 - みつけた.size}この わけかたがあるよ！`
                  : "すごい！ぜんぶの わけかたを みつけたよ！"}
              </p>
            </div>

            <div className="flex flex-col items-center">

              <div className="w-full max-w-xs bg-yellow-100 text-center rounded-xl p-2 shadow font-bold text-blue-800 mb-4 border border-yellow-300">
                スコア：{スコア} てん
              </div>

              <div className="w-full max-w-xs max-h-[400px] overflow-auto p-3 bg-white rounded-xl shadow-md text-sm border border-blue-200">
                <p className="font-bold mb-2 text-blue-800">みつけた わけかた：</p>
                <ul className="space-y-1">
                  {[...みつけた].map((k) => (
                    <li
                      key={k}
                      className="bg-green-100 px-2 py-1 rounded text-center shadow-sm"
                    >
                      {k}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
                <button
                  onClick={() => {
                    setみつけた(new Set());
                    setスコア(0);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-xs"
                >
                  さいしょから やりなおす
                </button>

                <button
                  onClick={() => setおんがく((prev) => !prev)}
                  className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-xs"
                >
                  おんがく：{おんがく ? "オン" : "オフ"}
                </button>
              </div>
            </div>
          </div>
          {おめでとう && (
            <div className="fixed inset-0 flex items-center justify-center bg-blue-50/80 z-50 overflow-hidden">

              {/* ⭐ パーティクル：星ふらし */}
              <Particles
                id="tsparticles"
                className="absolute inset-0"
                style={{ pointerEvents: "none" }} // ✅ ボタンにかぶらないように！
                init={async (engine) => {
                  await loadStarsPreset(engine);
                }}
                options={{
                  particles: {
                    number: { value: 50 },
                    shape: { type: "circle" },
                    size: { value: 5 },
                    color: { value: "#ff0" },
                    move: { enable: true, speed: 1 },
                  },
                  background: {
                    color: "transparent"
                  },
                  fullScreen: { enable: false }
                }}
              />

              {/* 🎊 おめでとう画面 */}
              <div className="text-center z-10">
                <p className="text-3xl font-bold text-pink-500 mb-4 animate-bounce">
                  🎉 すごい！ぜんぶの わけかたを みつけたよ！ 🎉
                </p>
                <img
                  src="/irukaman.png"
                  alt="イルカマン"
                  className="w-24 mx-auto animate-spin-slow"
                />
                <button
                  onClick={つぎのもんだいへ}
                  className="mt-6 px-4 py-2 bg-green-400 hover:bg-green-500 text-white rounded-lg font-bold shadow-md"
                >
                  つぎのもんだいへ
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default IrukamanGame;
