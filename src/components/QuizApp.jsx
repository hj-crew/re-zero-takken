// Re:ゼロから始める宅建異世界RPG 完全版
// プレイヤーはマップ上を移動し、モンスターとエンカウントし、宅建クイズでバトル！

import React, { useState, useEffect } from 'react';
import monster from '../assets/monster.png';

const MAP_SIZE = 5;
const ENCOUNTER_RATE = 0.3;

const quizData = [
  {
    question: "宅建業法：重要事項説明が必要なタイミングは？",
    choices: ["契約前", "契約後", "入居後", "いつでもよい"],
    answer: 0,
  },
  {
    question: "民法：時効取得に必要な年数（原則）は？",
    choices: ["5年", "10年", "20年", "25年"],
    answer: 2,
  }
];

export default function TakkenRPG() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [encounter, setEncounter] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("→ 矢印キーで移動せよ");
  const [log, setLog] = useState([]);
  const [hp, setHp] = useState(100);
  const [exp, setExp] = useState(0);
  const [level, setLevel] = useState(1);

  const handleMove = (dir) => {
    let { x, y } = position;
    if (dir === 'up' && y > 0) y--;
    if (dir === 'down' && y < MAP_SIZE - 1) y++;
    if (dir === 'left' && x > 0) x--;
    if (dir === 'right' && x < MAP_SIZE - 1) x++;
    setPosition({ x, y });
    setMessage(`移動：(${x},${y})`);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (encounter) return;
      let { x, y } = position;
      if (e.key === 'ArrowUp' && y > 0) y--;
      if (e.key === 'ArrowDown' && y < MAP_SIZE - 1) y++;
      if (e.key === 'ArrowLeft' && x > 0) x--;
      if (e.key === 'ArrowRight' && x < MAP_SIZE - 1) x++;
      const moved = { x, y };
      setPosition(moved);
      setMessage(`移動：(${x},${y})`);
      if (Math.random() < ENCOUNTER_RATE) {
        const quiz = quizData[Math.floor(Math.random() * quizData.length)];
        setTimeout(() => {
          setCurrentQuiz(quiz);
          setEncounter(true);
          setSelected(null);
        }, 50);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position, encounter]);

  const handleAnswer = (index) => {
    const correct = index === currentQuiz.answer;
    if (correct) {
      const newExp = exp + 10;
      setExp(newExp);
      if (newExp >= level * 30) {
        setLevel(level + 1);
        setExp(0);
        setLog((prev) => [...prev, `🆙 レベル${level + 1}に上がった！`]);
      } else {
        setLog((prev) => [...prev, '✅ 正解！経験値を得た！']);
      }
    } else {
      const newHp = Math.max(hp - 10, 0);
      setHp(newHp);
      setLog((prev) => [...prev, '❌ 不正解…ダメージを受けた！']);
    }
    setEncounter(false);
    setMessage("→ 探索を続けよう");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-100 flex flex-col items-center justify-center p-6 font-mono">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Re:ゼロから始める宅建RPG</h1>

      {/* ステータスバー */}
      <div className="mb-4 text-sm text-gray-700">
        🧍 HP: {hp} / 100 | 📘 EXP: {exp} / {level * 30} | 🧠 LV: {level}
      </div>

      {/* マップ表示 */}
      <div className="grid grid-cols-5 gap-1 mb-6">
        {Array.from({ length: MAP_SIZE * MAP_SIZE }, (_, i) => {
          const x = i % MAP_SIZE;
          const y = Math.floor(i / MAP_SIZE);
          const isPlayer = x === position.x && y === position.y;
          return (
            <div
              key={`${x}-${y}`}
              className={`w-8 h-8 flex items-center justify-center border text-xs rounded ${
                isPlayer ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {isPlayer ? '◉' : ''}
            </div>
          );
        })}
      </div>

      {/* ✅ バーチャルDパッド */}
      <div className="flex flex-col items-center mt-4 space-y-2 sm:hidden">
        <button onClick={() => handleMove('up')} className="p-2 bg-blue-200 rounded shadow">⬆️</button>
        <div className="flex space-x-2">
          <button onClick={() => handleMove('left')} className="p-2 bg-blue-200 rounded shadow">⬅️</button>
          <button onClick={() => handleMove('down')} className="p-2 bg-blue-200 rounded shadow">⬇️</button>
          <button onClick={() => handleMove('right')} className="p-2 bg-blue-200 rounded shadow">➡️</button>
        </div>
      </div>

      {/* メッセージ */}
      <div className="text-sm text-gray-600 mb-4">{message}</div>

      {/* クイズ表示＋モンスター */}
      {encounter && currentQuiz && (
        <div className="bg-white border p-4 rounded-xl shadow max-w-md w-full mb-6">
          <div className="flex items-center mb-4">
            <img src={monster} alt="monster" className="w-12 h-12 mr-3" />
            <h2 className="text-lg font-bold text-blue-700">📚 問題：{currentQuiz.question}</h2>
          </div>
          {currentQuiz.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className={`block w-full text-left p-2 rounded mb-2 border ${
                selected === null
                  ? 'bg-gray-100 hover:bg-blue-200'
                  : i === currentQuiz.answer
                  ? 'bg-green-200'
                  : 'bg-red-200'
              }`}
              disabled={selected !== null}
            >
              {choice}
            </button>
          ))}
        </div>
      )}

      {/* ログ表示 */}
      <div className="bg-white border p-4 rounded-xl shadow w-full max-w-md">
        <h3 className="text-sm font-semibold mb-2 text-gray-600">ログ：</h3>
        <ul className="text-xs list-disc list-inside text-gray-700">
          {log.slice(-5).map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
