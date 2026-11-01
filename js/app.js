// PassGen — password generator, passphrase, bulk, checker + entropy meter

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const UPPER_AMB = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnpqrstuvwxyz';
const LOWER_AMB = 'abcdefghijklmnopqrstuvwxyz';
const NUMS = '23456789';
const NUMS_AMB = '0123456789';
const SYMS = '!@#$%^&*()-_+=[]{}|;:,.<>?';
const AMBIGUOUS = /[0OIl1]/g;

function rand(n) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % n;
}

function buildPool() {
  const ambig = document.getElementById('opt-ambiguous').classList.contains('on');
  let pool = '';
  if (document.getElementById('opt-upper').classList.contains('on')) pool += ambig ? UPPER : UPPER_AMB;
  if (document.getElementById('opt-lower').classList.contains('on')) pool += ambig ? LOWER : LOWER_AMB;
  if (document.getElementById('opt-numbers').classList.contains('on')) pool += ambig ? NUMS : NUMS_AMB;
  if (document.getElementById('opt-symbols').classList.contains('on')) pool += SYMS;
  return pool;
}

function entropy(len, poolSize) {
  if (!poolSize) return 0;
  return Math.round(len * Math.log2(poolSize));
}

function strengthFromEntropy(bits) {
  if (bits < 28) return { label: 'Very Weak', color: '#ef4444', pct: 10 };
  if (bits < 36) return { label: 'Weak', color: '#f97316', pct: 25 };
  if (bits < 60) return { label: 'Fair', color: '#eab308', pct: 50 };
  if (bits < 80) return { label: 'Strong', color: '#22c55e', pct: 75 };
  if (bits < 120) return { label: 'Very Strong', color: '#16a34a', pct: 90 };
  return { label: 'Extreme', color: '#059669', pct: 100 };
}

function generate() {
  const pool = buildPool();
  if (!pool.length) { document.getElementById('pass-output').textContent = 'Enable at least one option'; return; }
  const len = parseInt(document.getElementById('length-slider').value);
  let pass = '';
  for (let i = 0; i < len; i++) pass += pool[rand(pool.length)];
  document.getElementById('pass-output').textContent = pass;

  const bits = entropy(len, pool.length);
  const s = strengthFromEntropy(bits);
  document.getElementById('strength-label').textContent = s.label;
  document.getElementById('strength-label').style.color = s.color;
  document.getElementById('strength-fill').style.width = s.pct + '%';
  document.getElementById('strength-fill').style.background = s.color;
  document.getElementById('entropy-label').textContent = bits + ' bits entropy';
  document.getElementById('charset-label').textContent = pool.length + ' char pool';
}

function copyPass() {
  const t = document.getElementById('pass-output').textContent;
  if (t && t !== 'Click Generate') { navigator.clipboard.writeText(t); showCopied(document.querySelector('[onclick="copyPass()"]')); }
}

function showCopied(btn) {
  const orig = btn.textContent;
  btn.textContent = '✅';
  setTimeout(() => btn.textContent = orig, 1200);
}

function updateLength(val) {
  document.getElementById('length-val').textContent = val;
}

function toggleOpt(btn) {
  btn.classList.toggle('on');
}

function switchTab(name, el) {
  ['generator','passphrase','bulk','checker'].forEach(t => {
    document.getElementById('tab-' + t).style.display = t === name ? '' : 'none';
  });
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

// PASSPHRASE
const WORDS = ['apple','river','cloud','seven','moon','tiger','forest','music','ocean','stone','flame','arrow','silver','copper','garden','bridge','castle','valley','thunder','winter','morning','crystal','dragon','eagle','flame','honey','island','jungle','kite','lamp','marble','noble','olive','palace','queen','rainy','shade','torch','uncle','viper','water','xray','yacht','zebra','brave','crisp','delta','earth','fancy','globe','habit','inner','joint','karma','light','magic','night','order','power','quiet','radio','solar','table','ultra','voice','wheel','extra','young','zesty','amber','blaze','chess','dance','ember','frost','grace','hover','index','jewel','knife','lemon','meter','nerve','oasis','prose','quest','rebel','scout','tiger','ultra','viola','waltz','xenon','yield','zonal'];

function generatePhrase() {
  const count = parseInt(document.getElementById('word-count').value);
  const sep = document.getElementById('separator').value;
  const cap = document.getElementById('phrase-cap').classList.contains('on');
  const addNum = document.getElementById('phrase-num').classList.contains('on');
  let words = [];
  for (let i = 0; i < count; i++) {
    let w = WORDS[rand(WORDS.length)];
    if (cap) w = w[0].toUpperCase() + w.slice(1);
    words.push(w);
  }
  if (addNum) words.push(String(rand(100)));
  document.getElementById('phrase-output').textContent = words.join(sep);
}

function updateWordCount(val) {
  document.getElementById('word-count-val').textContent = val;
}

function copyPhrase() {
  const t = document.getElementById('phrase-output').textContent;
  if (t && t !== 'Click Generate') { navigator.clipboard.writeText(t); showCopied(document.querySelector('[onclick="copyPhrase()"]')); }
}

// BULK
function generateBulk() {
  const count = Math.min(100, parseInt(document.getElementById('bulk-count').value) || 10);
  const len = Math.min(64, parseInt(document.getElementById('bulk-length').value) || 16);
  const type = document.getElementById('bulk-type').value;
  const pools = {
    all: UPPER_AMB + LOWER_AMB + NUMS_AMB + SYMS,
    alphanum: UPPER_AMB + LOWER_AMB + NUMS_AMB,
    alpha: UPPER_AMB + LOWER_AMB,
    num: NUMS_AMB,
    hex: '0123456789abcdef'
  };
  const pool = pools[type] || pools.all;
  const passwords = [];
  for (let i = 0; i < count; i++) {
    let p = '';
    for (let j = 0; j < len; j++) p += pool[rand(pool.length)];
    passwords.push(p);
  }
  const out = document.getElementById('bulk-output');
  out.style.display = 'block';
  out.innerHTML = `<pre style="font-size:13px;line-height:1.8;white-space:pre-wrap;word-break:break-all;">${passwords.join('\n')}</pre>`;
  document.getElementById('bulk-copy-btn').style.display = '';
  document.getElementById('bulk-copy-btn').dataset.bulk = passwords.join('\n');
}

function copyBulk() {
  const t = document.getElementById('bulk-copy-btn').dataset.bulk;
  if (t) { navigator.clipboard.writeText(t); showCopied(document.getElementById('bulk-copy-btn')); }
}

// CHECKER
const COMMON = ['password','123456','qwerty','letmein','admin','welcome','monkey','dragon','master','sunshine','password1','abc123','iloveyou','princess','1234567890','football'];

function checkStrength(pass) {
  const len = pass.length;
  let charPool = 0;
  if (/[a-z]/.test(pass)) charPool += 26;
  if (/[A-Z]/.test(pass)) charPool += 26;
  if (/[0-9]/.test(pass)) charPool += 10;
  if (/[^a-zA-Z0-9]/.test(pass)) charPool += 32;
  const bits = entropy(len, charPool || 26);
  const s = strengthFromEntropy(bits);

  setCheck('c-len', len >= 12);
  setCheck('c-upper', /[A-Z]/.test(pass));
  setCheck('c-lower', /[a-z]/.test(pass));
  setCheck('c-num', /[0-9]/.test(pass));
  setCheck('c-sym', /[^a-zA-Z0-9]/.test(pass));
  const notCommon = !COMMON.includes(pass.toLowerCase());
  setCheck('c-nodict', notCommon);

  document.getElementById('check-label').textContent = len ? s.label : '—';
  document.getElementById('check-label').style.color = s.color;
  document.getElementById('check-fill').style.width = (len ? s.pct : 0) + '%';
  document.getElementById('check-fill').style.background = s.color;

  const crackDiv = document.getElementById('crack-time');
  if (len) {
    crackDiv.style.display = '';
    const ops = 1e10; // 10 billion guesses/sec (GPU)
    const combos = Math.pow(charPool || 26, len);
    const secs = combos / ops;
    document.getElementById('crack-val').textContent = formatTime(secs);
  } else {
    crackDiv.style.display = 'none';
  }
}

function setCheck(id, ok) {
  const el = document.getElementById(id);
  el.querySelector('.check-icon').textContent = ok ? '✅' : '⬜';
  el.style.color = ok ? '#22c55e' : '';
}

function formatTime(secs) {
  if (secs < 1) return 'Instantly';
  if (secs < 60) return Math.round(secs) + ' seconds';
  if (secs < 3600) return Math.round(secs/60) + ' minutes';
  if (secs < 86400) return Math.round(secs/3600) + ' hours';
  if (secs < 31536000) return Math.round(secs/86400) + ' days';
  if (secs < 3.15e9) return Math.round(secs/31536000) + ' years';
  if (secs < 3.15e12) return Math.round(secs/3.15e9) + ' thousand years';
  if (secs < 3.15e15) return Math.round(secs/3.15e12) + ' million years';
  return 'Billions of years';
}

// Init
generate();
generatePhrase();
