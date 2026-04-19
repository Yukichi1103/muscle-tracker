// ======================================
// IRON LOG — 筋トレ管理ツール
// ======================================

// ======================================
// 定数・設定
// ======================================

const STORAGE_KEY         = 'ironLogRecords';
const WEEKLY_GOAL_KEY     = 'ironLogWeeklyGoal';
const LAST_RANK_KEY       = 'ironLogLastRank';
const LAST_STREAK_KEY     = 'ironLogLastStreak';
const WEEKLY_NOTIFIED_KEY = 'ironLogWeeklyNotified';

// ランク定義（min: 何回以上でこのランク）
const RANKS = [
  { min: 0,   label: 'ルーキー',   icon: '🌱', color: '#78909c' },
  { min: 5,   label: 'トレーニー', icon: '💪', color: '#66bb6a' },
  { min: 20,  label: '中級者',     icon: '🔥', color: '#ffa726' },
  { min: 50,  label: '上級者',     icon: '⚡', color: '#42a5f5' },
  { min: 100, label: 'エリート',   icon: '👑', color: '#ab47bc' },
  { min: 200, label: 'レジェンド', icon: '🏆', color: '#ef5350' },
];

// 連続日数マイルストーン
const STREAK_MILESTONES = [3, 7, 14, 21, 30, 60, 100];

// 部位ごとのおすすめ種目プリセット
const EXERCISE_PRESETS = {
  '胸': [
    { name: 'ベンチプレス',      desc: '大胸筋の王道種目。バーベルを胸まで下げて押し上げる。まずこれをマスターしよう。' },
    { name: 'ダンベルフライ',    desc: '大胸筋の伸びと収縮を感じやすい。腕を広げて弧を描くように動かす。' },
    { name: 'プッシュアップ',    desc: '自重で胸を鍛える基本。道具なしでどこでもできる。' },
    { name: 'インクラインプレス', desc: '上部大胸筋に効く。ベンチを30〜45度に傾けて行う。' },
    { name: 'ディップス',        desc: '大胸筋下部と三頭筋に効く。平行棒で体を上下させる。' },
  ],
  '背中': [
    { name: 'デッドリフト',       desc: '全身を使う最強の複合種目。背中・脚・体幹を同時に鍛える。' },
    { name: 'ラットプルダウン',   desc: '広背筋の定番マシン種目。バーを胸の前に引き下ろす。' },
    { name: 'ベントオーバーロウ', desc: '背中の厚みを作る。体を前傾させてバーベルを引き上げる。' },
    { name: 'シーテッドロウ',     desc: 'マシンで背中を引く。中部背中の筋肉をしっかり収縮させる。' },
    { name: 'チンニング（懸垂）', desc: '広背筋と二頭筋を同時に鍛える自重種目。' },
  ],
  '肩': [
    { name: 'ショルダープレス', desc: '肩全体を鍛える基本種目。頭上にバーベル/ダンベルを押し上げる。' },
    { name: 'サイドレイズ',     desc: '肩の横の丸みを作る。ダンベルを真横に持ち上げる。' },
    { name: 'フロントレイズ',   desc: '肩の前側を鍛える。ダンベルを正面に持ち上げる。' },
    { name: 'リアレイズ',       desc: '肩の後ろ側を鍛える。体を前傾させてダンベルを広げる。' },
    { name: 'アーノルドプレス', desc: '肩の3部位を同時に鍛えるダンベル種目。回旋動作が特徴。' },
  ],
  '腕': [
    { name: 'バーベルカール',              desc: '上腕二頭筋（力こぶ）の基本種目。バーベルを肘で巻き上げる。' },
    { name: 'ハンマーカール',              desc: '前腕も一緒に鍛えられる。親指を上にして行うカール。' },
    { name: 'トライセップスプレスダウン', desc: '上腕三頭筋をマシンで鍛える。ロープを下に押し込む。' },
    { name: 'スカルクラッシャー',          desc: '上腕三頭筋を集中的に鍛えるバーベル種目。' },
    { name: 'コンセントレーションカール', desc: '上腕二頭筋を最大収縮させるダンベル種目。' },
  ],
  '脚': [
    { name: 'スクワット',            desc: '下半身の王様種目。太もも・お尻・ハムストを同時に鍛える。' },
    { name: 'レッグプレス',          desc: 'マシンで脚全体を安全に鍛える。初心者にも取り組みやすい。' },
    { name: 'レッグカール',          desc: 'ハムストリングス（太もも裏）を鍛えるマシン種目。' },
    { name: 'レッグエクステンション', desc: '大腿四頭筋（太もも前）を鍛えるマシン種目。' },
    { name: 'カーフレイズ',          desc: 'ふくらはぎを鍛える。つま先立ちを繰り返す。忘れがちだが重要。' },
  ],
  '腹': [
    { name: 'クランチ',         desc: '腹筋の基本種目。背中を丸めて腹直筋を収縮させる。' },
    { name: 'プランク',         desc: '体幹全体を鍛えるホールド種目。フォームを維持するだけでOK。' },
    { name: 'レッグレイズ',     desc: '下腹部に効く種目。仰向けで脚を上下に動かす。' },
    { name: 'ロシアンツイスト', desc: '腹斜筋（横腹）を鍛える。体を左右にひねる動作が特徴。' },
    { name: 'アブローラー',     desc: '腹筋ローラーで体幹全体を強化する上級向き種目。' },
  ],
  '全身': [
    { name: 'バーピー',             desc: '全身を使う高強度種目。スクワット→プランク→ジャンプを繰り返す。' },
    { name: 'ケトルベルスイング',   desc: '全身の連動性を高める。ケトルベルを股間からスイング。' },
    { name: 'クリーン',             desc: 'バーベルを床から肩まで一気に引き上げる全身種目。' },
    { name: 'ファーマーズウォーク', desc: '重いダンベルを持って歩く。全身の保持力と体幹を鍛える。' },
  ],
  'その他': [],
};

// ======================================
// トースト通知（キュー方式）
// ======================================

const toastQueue = [];
let toastRunning = false;

function showToast(icon, message) {
  toastQueue.push({ icon, message });
  if (!toastRunning) processToastQueue();
}

function processToastQueue() {
  if (toastQueue.length === 0) { toastRunning = false; return; }
  toastRunning = true;
  const { icon, message } = toastQueue.shift();
  const toast = document.getElementById('toast');
  document.getElementById('toastIcon').textContent    = icon;
  document.getElementById('toastMessage').textContent = message;
  toast.classList.add('show');
  setTimeout(function () {
    toast.classList.remove('show');
    setTimeout(processToastQueue, 400);
  }, 3000);
}

// ======================================
// ページ読み込み時の初期化
// ======================================
document.addEventListener('DOMContentLoaded', function () {
  setTodayDate();

  // 保存済みの週の目標を読み込む
  const savedGoal = localStorage.getItem(WEEKLY_GOAL_KEY);
  if (savedGoal) document.getElementById('weeklyGoalInput').value = savedGoal;

  renderAll();

  // チュートリアル（初回のみ自動表示）
  initTutorial();

  // フォームステップラベルのビーコン（初回のみ点灯）
  initBeacons();
});

// 全パーツを一括再描画する関数
function renderAll() {
  renderTable();
  updateHero();
  updateStats();
  updateRankDisplay();
  updateMaxWeights();
  updateGraphSelector();
  renderGraph(document.getElementById('graphExercise').value);
}

// ======================================
// 今日の日付をフォームにセット
// ======================================
function setTodayDate() {
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2, '0');
  const dd    = String(today.getDate()).padStart(2, '0');
  document.getElementById('date').value = `${yyyy}-${mm}-${dd}`;
}

// 今日の日付を YYYY-MM-DD で返す
function todayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
}

// ======================================
// localStorage の読み書き
// ======================================
function getRecords() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// ======================================
// ボリューム自動計算プレビュー
// ======================================
['weight', 'reps', 'sets'].forEach(function (id) {
  document.getElementById(id).addEventListener('input', updateVolumePreview);
});

function updateVolumePreview() {
  const weight  = parseFloat(document.getElementById('weight').value) || 0;
  const reps    = parseInt(document.getElementById('reps').value)     || 0;
  const sets    = parseInt(document.getElementById('sets').value)     || 0;
  const preview = document.getElementById('volumePreview');

  if (weight > 0 && reps > 0 && sets > 0) {
    const vol = weight * reps * sets;
    preview.textContent = `ボリューム: ${vol.toLocaleString()} kg　（${weight} × ${reps} × ${sets}）`;
  } else {
    preview.textContent = 'ボリューム: -- kg　（重量 × 回数 × セット数）';
  }
}

// ======================================
// 部位グリッド選択
// ======================================
document.getElementById('bpGrid').addEventListener('click', function (e) {
  const btn = e.target.closest('.bp-btn');
  if (!btn) return;

  // 選択状態を切り替える
  document.querySelectorAll('.bp-btn').forEach(function (b) { b.classList.remove('selected'); });
  btn.classList.add('selected');

  // 隠しフィールドに値をセット
  document.getElementById('bodyPart').value = btn.dataset.part;

  // エラーメッセージを消す
  document.getElementById('bpError').style.display = 'none';

  // プリセット種目を表示
  updatePresetChips(btn.dataset.part);
});

function updatePresetChips(bodyPart) {
  const area    = document.getElementById('presetArea');
  const chips   = document.getElementById('presetChips');
  const descEl  = document.getElementById('presetDesc');
  const presets = EXERCISE_PRESETS[bodyPart] || [];

  if (presets.length === 0) { area.style.display = 'none'; return; }

  area.style.display = 'block';
  descEl.textContent = '種目をタップすると説明が表示されます';

  chips.innerHTML = presets.map(function (p) {
    return `<button type="button" class="preset-chip"
      data-name="${escapeHtml(p.name)}"
      data-desc="${escapeHtml(p.desc)}">${escapeHtml(p.name)}</button>`;
  }).join('');
}

// プリセットチップのクリック
document.getElementById('presetChips').addEventListener('click', function (e) {
  const chip = e.target.closest('.preset-chip');
  if (!chip) return;
  document.getElementById('exerciseName').value = chip.dataset.name;
  document.getElementById('presetDesc').textContent = chip.dataset.desc;
  document.querySelectorAll('.preset-chip').forEach(function (c) { c.classList.remove('active'); });
  chip.classList.add('active');
});

// ======================================
// フォーム送信（記録追加）
// ======================================
document.getElementById('workoutForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // 部位のバリデーション（隠しフィールド）
  const bodyPart = document.getElementById('bodyPart').value;
  if (!bodyPart) {
    document.getElementById('bpError').style.display = 'block';
    document.getElementById('bpGrid').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const date         = document.getElementById('date').value;
  const bodyWeight   = parseFloat(document.getElementById('bodyWeight').value) || null;
  const exerciseName = document.getElementById('exerciseName').value.trim();
  const weight       = parseFloat(document.getElementById('weight').value);
  const reps         = parseInt(document.getElementById('reps').value);
  const sets         = parseInt(document.getElementById('sets').value);
  const memo         = document.getElementById('memo').value.trim();
  const volume       = weight * reps * sets;

  const newRecord = {
    id: Date.now(), date, bodyWeight, bodyPart,
    exerciseName, weight, reps, sets, volume, memo,
  };

  const records = getRecords();
  records.unshift(newRecord);
  saveRecords(records);

  // 達成チェック
  checkAchievements(records);

  // フォームリセット
  const savedDate = date;
  document.getElementById('workoutForm').reset();
  document.getElementById('date').value = savedDate;
  document.getElementById('volumePreview').textContent = 'ボリューム: -- kg　（重量 × 回数 × セット数）';
  document.getElementById('presetArea').style.display = 'none';
  document.querySelectorAll('.bp-btn').forEach(function (b) { b.classList.remove('selected'); });
  document.getElementById('bodyPart').value = '';

  renderAll();
});

// ======================================
// 達成チェック（トースト通知）
// ======================================
function checkAchievements(records) {
  const streak     = calcStreak(records);
  const total      = records.length;
  const curRank    = getRank(total);
  const weekly     = calcWeeklyAchievement(records);

  // 連続日数マイルストーン
  const prevStreak = parseInt(localStorage.getItem(LAST_STREAK_KEY)) || 0;
  STREAK_MILESTONES.forEach(function (m) {
    if (prevStreak < m && streak >= m) {
      showToast('🔥', `${m}日連続ストリーク達成！素晴らしい！`);
    }
  });
  localStorage.setItem(LAST_STREAK_KEY, streak);

  // ランクアップ
  const prevRankLabel = localStorage.getItem(LAST_RANK_KEY) || '';
  if (prevRankLabel && prevRankLabel !== curRank.label) {
    showToast(curRank.icon, `ランクアップ！「${curRank.label}」に昇格！`);
  }
  localStorage.setItem(LAST_RANK_KEY, curRank.label);

  // 週の目標達成（同じ週に1回だけ）
  const weekStr      = getCurrentWeekStr();
  const lastNotified = localStorage.getItem(WEEKLY_NOTIFIED_KEY) || '';
  if (weekly.rate >= 100 && lastNotified !== weekStr) {
    showToast('🎯', '今週の目標達成！お疲れ様でした！');
    localStorage.setItem(WEEKLY_NOTIFIED_KEY, weekStr);
  }
}

function getCurrentWeekStr() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const wk    = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${wk}`;
}

// ======================================
// テーブルに記録を描画する
// ======================================
function renderTable() {
  const records    = getRecords();
  const filterPart = document.getElementById('filterPart').value;
  const tbody      = document.getElementById('workoutTableBody');
  const emptyMsg   = document.getElementById('emptyMsg');

  const filtered = filterPart
    ? records.filter(function (r) { return r.bodyPart === filterPart; })
    : records;

  tbody.innerHTML = '';

  if (filtered.length === 0) { emptyMsg.style.display = 'block'; return; }
  emptyMsg.style.display = 'none';

  filtered.forEach(function (record) {
    const tr       = document.createElement('tr');
    const diffHtml = buildDiffHtml(records, record);

    tr.innerHTML = `
      <td>${formatDate(record.date)}</td>
      <td>${record.bodyWeight !== null ? record.bodyWeight + ' kg' : '--'}</td>
      <td><span class="badge">${escapeHtml(record.bodyPart)}</span></td>
      <td>${escapeHtml(record.exerciseName)}</td>
      <td>${record.weight} kg</td>
      <td>${record.reps} 回</td>
      <td>${record.sets} セット</td>
      <td class="volume">${record.volume.toLocaleString()} kg</td>
      <td>${diffHtml}</td>
      <td>${escapeHtml(record.memo) || '--'}</td>
      <td><button class="btn-delete" onclick="deleteRecord(${record.id})">削除</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// 前回比 HTML を組み立てる
function buildDiffHtml(allRecords, current) {
  const idx  = allRecords.findIndex(function (r) { return r.id === current.id; });
  if (idx === -1) return '<span class="diff-none">--</span>';

  const prev = allRecords.slice(idx + 1)
    .find(function (r) { return r.exerciseName === current.exerciseName; });

  if (!prev) return '<span class="diff-none">初回</span>';

  const diff = current.weight - prev.weight;
  if (diff > 0) return `<span class="diff-up">▲ +${diff.toFixed(1)} kg</span>`;
  if (diff < 0) return `<span class="diff-down">▼ ${diff.toFixed(1)} kg</span>`;
  return '<span class="diff-none">± 0 kg</span>';
}

// ======================================
// 記録の削除
// ======================================
function deleteRecord(id) {
  if (!confirm('この記録を削除しますか？')) return;
  const records = getRecords().filter(function (r) { return r.id !== id; });
  saveRecords(records);
  renderAll();
}

document.getElementById('clearAllBtn').addEventListener('click', function () {
  if (!confirm('すべての記録を削除しますか？\nこの操作は元に戻せません。')) return;
  localStorage.removeItem(STORAGE_KEY);
  renderAll();
});

document.getElementById('filterPart').addEventListener('change', renderTable);

document.getElementById('weeklyGoalInput').addEventListener('input', function () {
  const val = parseInt(this.value);
  if (val >= 1 && val <= 7) {
    localStorage.setItem(WEEKLY_GOAL_KEY, val);
    updateHero();
    updateStats();
  }
});

// ======================================
// ヒーローパネルを更新する
// ======================================
function updateHero() {
  const records = getRecords();
  const streak  = calcStreak(records);
  const weekly  = calcWeeklyAchievement(records);

  // --- ストリーク ---
  document.getElementById('streakBigNum').textContent = streak;
  document.getElementById('streakMsg').textContent    = buildStreakMessage(streak);

  // 週カレンダードット
  renderWeekDots(records);

  // --- 週の達成率リング ---
  const circumference = 226; // 2π × 36
  const offset        = circumference - (weekly.rate / 100) * circumference;
  const ring          = document.getElementById('ringProg');
  ring.style.strokeDashoffset = offset;
  ring.classList.toggle('done', weekly.rate >= 100);

  document.getElementById('ringPct').textContent           = weekly.rate + '%';
  document.getElementById('weeklyDetailLabel').textContent = weekly.achieved + ' / ' + weekly.goal + ' 日達成';
}

// 週カレンダードットを描画する
function renderWeekDots(records) {
  const container    = document.getElementById('weekDots');
  if (!container) return;

  const trainedDates = new Set(records.map(function (r) { return r.date; }));
  const today        = new Date();
  const dow          = today.getDay(); // 0=日
  const monday       = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));

  const dayLabels = ['月', '火', '水', '木', '金', '土', '日'];

  container.innerHTML = dayLabels.map(function (label, i) {
    const d    = new Date(monday);
    d.setDate(monday.getDate() + i);

    const yyyy    = d.getFullYear();
    const mm      = String(d.getMonth() + 1).padStart(2, '0');
    const dd      = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const isTrained = trainedDates.has(dateStr);
    const isToday   = dateStr === todayStr();
    const isFuture  = d > today && !isToday;

    let dotClass = 'cal-dot';
    if (isTrained) dotClass += ' trained';
    if (isToday)   dotClass += ' today';
    if (isFuture)  dotClass += ' future';

    return `<div class="cal-day">
      <div class="${dotClass}"></div>
      <div class="cal-label">${label}</div>
    </div>`;
  }).join('');
}

// ======================================
// スタッツカード（3 枚）を更新する
// ======================================
function updateStats() {
  const records  = getRecords();
  const totalVol = records.reduce(function (s, r) { return s + r.volume; }, 0);
  const bwRecord = records.find(function (r) { return r.bodyWeight !== null; });

  document.getElementById('totalCount').textContent  = records.length.toLocaleString();
  document.getElementById('totalVolume').textContent = totalVol.toLocaleString();
  document.getElementById('latestWeight').textContent = bwRecord ? bwRecord.bodyWeight : '--';
}

// ======================================
// ランク表示を更新する
// ======================================
function updateRankDisplay() {
  const records  = getRecords();
  const total    = records.length;

  // 現在のランクインデックスを求める
  let rankIdx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (total >= RANKS[i].min) rankIdx = i;
  }
  const curRank  = RANKS[rankIdx];
  const nextRank = RANKS[rankIdx + 1] || null;

  // XP バー（現ランク内での進捗）
  let xpPct = 100;
  if (nextRank) {
    xpPct = Math.min(100, ((total - curRank.min) / (nextRank.min - curRank.min)) * 100);
  }

  // ヘッダーピル
  document.getElementById('headerRankIcon').textContent = curRank.icon;
  document.getElementById('headerRankName').textContent = curRank.label;

  // ヒーローブロック
  document.getElementById('rankDiamondIcon').textContent = curRank.icon;
  document.getElementById('rankNameLg').textContent      = curRank.label;
  document.getElementById('rankSessionCount').textContent = total + ' 回';
  document.getElementById('xpBar').style.width           = xpPct + '%';
  document.getElementById('xpLabel').textContent         = nextRank
    ? `次「${nextRank.label}」まで あと ${nextRank.min - total} 回`
    : '最高ランク達成！あなたは伝説！';

  // ランク一覧ピル
  renderMilestonePills(curRank, total);
}

// ランク一覧ピルを描画する
function renderMilestonePills(curRank, total) {
  const wrap = document.getElementById('milestonePills');
  if (!wrap) return;

  wrap.innerHTML = RANKS.map(function (r) {
    const isActive  = r.label === curRank.label;
    const isCleared = total >= r.min && !isActive;
    let cls = 'ms-pill';
    if (isActive)  cls += ' active';
    if (isCleared) cls += ' cleared';
    return `<span class="${cls}">${r.icon} ${r.label}</span>`;
  }).join('');
}

// ======================================
// ランクを返すユーティリティ
// ======================================
function getRank(total) {
  let rank = RANKS[0];
  RANKS.forEach(function (r) { if (total >= r.min) rank = r; });
  return rank;
}

// ======================================
// 連続トレ日数を計算する
// ======================================
function calcStreak(records) {
  if (records.length === 0) return 0;
  const trained = new Set(records.map(function (r) { return r.date; }));
  let streak    = 0;
  const today   = new Date();

  for (let i = 0; i < 365; i++) {
    const d  = new Date(today);
    d.setDate(d.getDate() - i);
    const s  = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (trained.has(s)) { streak++; } else { break; }
  }
  return streak;
}

// 連続日数に応じたメッセージ
function buildStreakMessage(streak) {
  if (streak === 0) return '今日もジムへ行こう！';
  if (streak === 1) return '今日もよくやった！';
  if (streak < 7)   return streak + '日連続！いい流れだ！';
  if (streak < 14)  return '🔥 本物の習慣になってきた！';
  if (streak < 30)  return '🔥🔥 ' + streak + '日連続！すごい！';
  return '🔥🔥🔥 ' + streak + '日連続！伝説級！';
}

// ======================================
// 今週の達成率を計算する
// ======================================
function calcWeeklyAchievement(records) {
  const goal  = parseInt(localStorage.getItem(WEEKLY_GOAL_KEY)) || 3;
  const today = new Date();
  const dow   = today.getDay();

  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const trainedDays = new Set();
  records.forEach(function (r) {
    const d = new Date(r.date);
    if (d >= monday && d <= sunday) trainedDays.add(r.date);
  });

  const achieved = trainedDays.size;
  const rate     = Math.min(100, Math.round((achieved / goal) * 100));
  return { achieved, goal, rate };
}

// ======================================
// 種目ごとの最高重量
// ======================================
function updateMaxWeights() {
  const records   = getRecords();
  const container = document.getElementById('maxWeightList');

  if (records.length === 0) {
    container.innerHTML = '<p class="empty-msg">記録がまだありません</p>';
    return;
  }

  const maxMap = {};
  records.forEach(function (r) {
    if (!maxMap[r.exerciseName] || r.weight > maxMap[r.exerciseName]) {
      maxMap[r.exerciseName] = r.weight;
    }
  });

  const sorted = Object.entries(maxMap).sort(function (a, b) { return b[1] - a[1]; });
  container.innerHTML = sorted.map(function (e) {
    return `<div class="max-weight-item">${escapeHtml(e[0])}: <span>${e[1]} kg</span></div>`;
  }).join('');
}

// ======================================
// グラフの種目セレクターを更新する
// ======================================
function updateGraphSelector() {
  const records  = getRecords();
  const sel      = document.getElementById('graphExercise');
  const current  = sel.value;

  const exercises = [];
  records.forEach(function (r) {
    if (!exercises.includes(r.exerciseName)) exercises.push(r.exerciseName);
  });

  sel.innerHTML = '<option value="">-- 種目を選択してください --</option>';
  exercises.forEach(function (name) {
    const opt = document.createElement('option');
    opt.value = opt.textContent = name;
    sel.appendChild(opt);
  });

  if (exercises.includes(current)) sel.value = current;
}

document.getElementById('graphExercise').addEventListener('change', function () {
  renderGraph(this.value);
});

window.addEventListener('resize', function () {
  renderGraph(document.getElementById('graphExercise').value);
});

// ======================================
// 重量の伸びグラフ（Canvas）
// ======================================
function renderGraph(exerciseName) {
  const canvas   = document.getElementById('weightGraph');
  const emptyMsg = document.getElementById('graphEmptyMsg');
  const ctx      = canvas.getContext('2d');

  canvas.width  = canvas.parentElement.clientWidth;
  canvas.height = 280;

  if (!exerciseName) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display   = 'none';
    emptyMsg.style.display = 'block';
    return;
  }

  const data = getRecords()
    .filter(function (r) { return r.exerciseName === exerciseName; })
    .sort(function (a, b) { return a.date.localeCompare(b.date); });

  if (data.length < 2) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display   = 'block';
    emptyMsg.style.display = 'none';
    ctx.fillStyle    = '#606088';
    ctx.font         = '14px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('グラフには 2件以上の記録が必要です', canvas.width / 2, canvas.height / 2);
    return;
  }

  canvas.style.display   = 'block';
  emptyMsg.style.display = 'none';

  const W = canvas.width, H = canvas.height;
  const pL = 58, pR = 24, pT = 36, pB = 52;
  const cW = W - pL - pR, cH = H - pT - pB;

  const weights = data.map(function (d) { return d.weight; });
  const minW    = Math.min.apply(null, weights);
  const maxW    = Math.max.apply(null, weights);
  const range   = maxW - minW || 10;
  const yMin    = Math.max(0, minW - range * 0.3);
  const yMax    = maxW + range * 0.3;

  function toX(i) { return pL + (i / Math.max(data.length - 1, 1)) * cW; }
  function toY(w) { return pT + cH - ((w - yMin) / (yMax - yMin)) * cH; }

  // 背景
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#111124';
  ctx.fillRect(0, 0, W, H);

  // グリッドと Y ラベル
  ctx.setLineDash([3, 5]);
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y   = pT + (i / 4) * cH;
    const val = yMax - (i / 4) * (yMax - yMin);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.moveTo(pL, y); ctx.lineTo(pL + cW, y); ctx.stroke();
    ctx.fillStyle = '#606088'; ctx.font = '11px sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(val.toFixed(1), pL - 8, y);
  }
  ctx.setLineDash([]);

  // 軸線
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pL, pT); ctx.lineTo(pL, pT + cH); ctx.lineTo(pL + cW, pT + cH);
  ctx.stroke();

  // グラデーション塗りつぶし
  const grad = ctx.createLinearGradient(0, pT, 0, pT + cH);
  grad.addColorStop(0, 'rgba(124, 106, 255, 0.22)');
  grad.addColorStop(1, 'rgba(124, 106, 255, 0)');

  ctx.beginPath();
  data.forEach(function (d, i) {
    const x = toX(i), y = toY(d.weight);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.lineTo(toX(data.length - 1), pT + cH);
  ctx.lineTo(toX(0), pT + cH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // 折れ線
  ctx.strokeStyle = '#7c6aff';
  ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  ctx.beginPath();
  data.forEach(function (d, i) {
    const x = toX(i), y = toY(d.weight);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // データポイント・ラベル
  data.forEach(function (d, i) {
    const x = toX(i), y = toY(d.weight);

    ctx.shadowColor = '#7c6aff'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#7c6aff'; ctx.fill();
    ctx.strokeStyle = '#0b0b14'; ctx.lineWidth = 2; ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#e4e4f4'; ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(d.weight + 'kg', x, y - 9);

    ctx.fillStyle = '#606088'; ctx.font = '10px sans-serif';
    ctx.textBaseline = 'top';
    ctx.save();
    ctx.translate(x, pT + cH + 8);
    ctx.rotate(-Math.PI / 5);
    ctx.fillText(d.date.slice(5).replace('-', '/'), 0, 0);
    ctx.restore();
  });
}

// ======================================
// ユーティリティ
// ======================================

function formatDate(dateStr) { return dateStr.replace(/-/g, '/'); }

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ======================================
// チュートリアル
// ======================================

// localStorage のキー
const TUT_DONE_KEY = 'ironLogTutorialDone';

// ステップ定義（4ステップ）
const TUT_STEPS = [
  {
    icon:      '📅',
    iconColor: 'rgba(58, 134, 255, 0.15)',
    iconBorder:'rgba(58, 134, 255, 0.3)',
    title:     'まず日付と体重を入力',
    desc:      '今日の<b>日付</b>は自動でセットされています。<br><b>体重</b>も入力しておくと、日々の変化を追えます（任意）。',
    hint:      '↓ フォームの「STEP 1」セクション',
  },
  {
    icon:      '💪',
    iconColor: 'rgba(255, 112, 67, 0.15)',
    iconBorder:'rgba(255, 112, 67, 0.3)',
    title:     '鍛えた部位をタップして選ぶ',
    desc:      '<b>8つのボタン</b>から今日の部位を選ぶだけ。<br>選ぶと、その部位の<b>おすすめ種目</b>が自動で表示されます！',
    hint:      '↓ フォームの「STEP 2」セクション',
  },
  {
    icon:      '🏋️',
    iconColor: 'rgba(46, 204, 113, 0.15)',
    iconBorder:'rgba(46, 204, 113, 0.3)',
    title:     '種目名と重量を記録する',
    desc:      'おすすめ種目をタップするか、直接入力してください。<br><b>重量・回数・セット数</b>を入れると<b>ボリュームが自動計算</b>されます。',
    hint:      '↓ フォームの「STEP 3・4」セクション',
  },
  {
    icon:      '✅',
    iconColor: 'rgba(255, 215, 64, 0.15)',
    iconBorder:'rgba(255, 215, 64, 0.3)',
    title:     '記録ボタンを押して完了！',
    desc:      '「<b>記録を追加する</b>」ボタンを押すだけ！<br>データは<b>ブラウザに自動保存</b>されます。<br>アプリのインストールも不要です。',
    hint:      '↓ フォームの一番下のボタン',
  },
];

// 現在表示中のステップ番号（0始まり）
let tutCurrentStep = 0;

// ヘルプボタンでいつでも再表示
document.getElementById('helpBtn').addEventListener('click', function () {
  openTutorial();
});

// ======================================
// チュートリアル初期化
// ======================================
function initTutorial() {
  // localStorageに完了フラグがなければ初回として表示
  if (!localStorage.getItem(TUT_DONE_KEY)) {
    // 少しだけ遅らせて、ページの描画後に表示
    setTimeout(function () {
      openTutorial();
    }, 600);
  }
}

// モーダルを開く
function openTutorial() {
  tutCurrentStep = 0;
  renderTutStep(tutCurrentStep);
  document.getElementById('tutOverlay').classList.add('visible');
  document.body.style.overflow = 'hidden'; // 背景スクロールを止める
}

// モーダルを閉じる
function closeTutorial(markDone) {
  document.getElementById('tutOverlay').classList.remove('visible');
  document.body.style.overflow = '';

  if (markDone) {
    // 完了フラグを保存
    localStorage.setItem(TUT_DONE_KEY, '1');
    // ビーコンを消す
    removeBeacons();
    // フォームへスムーズスクロール
    setTimeout(function () {
      document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }
}

// ステップを描画する
function renderTutStep(stepIndex) {
  const step = TUT_STEPS[stepIndex];
  const total = TUT_STEPS.length;
  const isLast = stepIndex === total - 1;

  // プログレスバー（幅を %で）
  const pct = ((stepIndex + 1) / total) * 100;
  document.getElementById('tutProgressBar').style.width = pct + '%';

  // ステップ番号
  document.getElementById('tutStepNum').textContent = `STEP ${stepIndex + 1} / ${total}`;

  // アイコン（背景色と枠色をステップごとに変える）
  const circle = document.getElementById('tutIconCircle');
  circle.style.background   = step.iconColor;
  circle.style.borderColor  = step.iconBorder;
  document.getElementById('tutIcon').textContent = step.icon;

  // タイトル・説明
  document.getElementById('tutTitle').textContent  = step.title;
  document.getElementById('tutDesc').innerHTML     = step.desc;
  document.getElementById('tutHint').textContent   = step.hint;

  // ドット更新
  const dots = document.querySelectorAll('.tut-dot');
  dots.forEach(function (dot, i) {
    dot.classList.remove('active', 'done');
    if (i === stepIndex) dot.classList.add('active');
    if (i < stepIndex)   dot.classList.add('done');
  });

  // 最終ステップはボタンをゴールドに、テキストも変える
  const nextBtn = document.getElementById('tutNext');
  if (isLast) {
    nextBtn.textContent = 'さあ、はじめよう！🔥';
    nextBtn.classList.add('final');
  } else {
    nextBtn.textContent = '次へ →';
    nextBtn.classList.remove('final');
  }

  // スキップボタンのテキスト（最終ステップは「閉じる」に）
  document.getElementById('tutSkip').textContent = isLast ? '閉じる' : 'スキップ';

  // アニメーションのリセット（CSS アニメーションを再生させる）
  const animated = document.querySelectorAll('.tut-title, .tut-desc, .tut-hint');
  animated.forEach(function (el) {
    el.style.animation = 'none';
    // 強制リフロー
    void el.offsetWidth;
    el.style.animation = '';
  });

  // フォーム上のビーコン：対応するステップラベルだけ光らせる
  updateBeacons(stepIndex);
}

// 「次へ」ボタン
document.getElementById('tutNext').addEventListener('click', function () {
  if (tutCurrentStep < TUT_STEPS.length - 1) {
    tutCurrentStep++;
    renderTutStep(tutCurrentStep);
  } else {
    // 最終ステップ → 完了
    closeTutorial(true);
  }
});

// 「スキップ / 閉じる」ボタン
document.getElementById('tutSkip').addEventListener('click', function () {
  closeTutorial(true);
});

// 「✕」ボタン
document.getElementById('tutClose').addEventListener('click', function () {
  closeTutorial(true);
});

// オーバーレイ背景クリックで閉じる
document.getElementById('tutOverlay').addEventListener('click', function (e) {
  if (e.target === this) closeTutorial(true);
});

// ======================================
// フォームのビーコン（ガイド光点）
// ======================================

// 初回訪問ならビーコンを付ける
function initBeacons() {
  if (!localStorage.getItem(TUT_DONE_KEY)) {
    document.querySelectorAll('.form-step-label').forEach(function (el) {
      el.classList.add('beacon');
    });
  }
}

// チュートリアル中：現在のステップに対応するラベルだけ光らせる
function updateBeacons(stepIndex) {
  const labels = document.querySelectorAll('.form-step-label');
  labels.forEach(function (el, i) {
    // stepIndex 0→STEP1, 1→STEP2, 2→STEP3、3→STEP4
    if (i === stepIndex) {
      el.classList.add('beacon');
    } else {
      el.classList.remove('beacon');
    }
  });
}

// ビーコンをすべて消す（チュートリアル完了時）
function removeBeacons() {
  document.querySelectorAll('.form-step-label').forEach(function (el) {
    el.classList.remove('beacon');
  });
}

// 記録追加後にビーコンを消す（既存 checkAchievements の後に呼ぶ）
// ※ フォーム submit ハンドラー内で renderAll() を呼んでいるので、
//   ここで removeBeacons() を呼んでも問題ない
const _origFormSubmit = document.getElementById('workoutForm').onsubmit;
document.getElementById('workoutForm').addEventListener('submit', function () {
  // 記録が追加されたらビーコンは不要
  removeBeacons();
  localStorage.setItem(TUT_DONE_KEY, '1');
}, { once: true }); // 最初の1回だけ
