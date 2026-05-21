// ───────────────────────────────────────────
//  DEFAULT DATA
// ───────────────────────────────────────────
const DEFAULT_PRODUTOS = [
  "CRM Plus", "ERP Cloud", "Analytics Pro", "DataVault",
  "SecureNet", "AutoFlow", "MobileFirst", "CloudSync",
  "InsightAI", "ConnectHub"
];

const DEFAULT_CLIENTES = [
  "Banco Alfa", "Varejo Max", "TechCorp", "Logística Brasil",
  "Saúde Total", "EduFuture", "Agro Digital", "FinTech Ltda",
  "Construindo SA", "Energia Verde"
];

const BALLOON_COLORS = [
  '#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c77dff',
  '#ff9f43','#48dbfb','#ff6fd8','#a29bfe','#55efc4'
];

// ───────────────────────────────────────────
//  STATE
// ───────────────────────────────────────────
let produtos = [...DEFAULT_PRODUTOS];
let clientes = [...DEFAULT_CLIENTES];
let gameProdutos = [];
let gameClientes = [];
let pairs = [];
let currentRound = 0;
let totalRounds = 0;
let phase = 'produto';
let pickedProduto = null;
let pickedCliente = null;

// ───────────────────────────────────────────
//  SETUP
// ───────────────────────────────────────────
function renderTags(type) {
  const list = type === 'produto' ? produtos : clientes;
  const container = document.getElementById(`${type}-tags`);
  container.innerHTML = '';
  list.forEach((item, i) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `${item} <button class="remove" onclick="removeItem('${type}',${i})">×</button>`;
    container.appendChild(tag);
  });
}

function addItem(type) {
  const input = document.getElementById(`${type}-input`);
  const val = input.value.trim();
  if (!val) return;
  if (type === 'produto') produtos.push(val);
  else clientes.push(val);
  input.value = '';
  renderTags(type);
  input.focus();
}

function removeItem(type, idx) {
  if (type === 'produto') produtos.splice(idx, 1);
  else clientes.splice(idx, 1);
  renderTags(type);
}

function resetToDefaults() {
  produtos = [...DEFAULT_PRODUTOS];
  clientes = [...DEFAULT_CLIENTES];
  renderTags('produto');
  renderTags('cliente');
}

function startGame() {
  const err = document.getElementById('setup-error');
  const minLen = Math.min(produtos.length, clientes.length);
  if (minLen < 1) {
    err.textContent = 'Adicione pelo menos 1 produto e 1 cliente!';
    err.style.display = 'block';
    return;
  }
  err.style.display = 'none';

  gameProdutos = shuffle([...produtos]);
  gameClientes = shuffle([...clientes]);
  totalRounds = minLen;
  currentRound = 0;
  pairs = [];

  showScreen('game-screen');
  startRound();
}

// ───────────────────────────────────────────
//  GAME
// ───────────────────────────────────────────
function startRound() {
  phase = 'produto';
  pickedProduto = null;
  pickedCliente = null;
  currentRound++;

  updateRoundUI();
  spawnBalloons('produto');
}

function updateRoundUI() {
  document.getElementById('round-label').textContent = `Rodada ${currentRound} de ${totalRounds}`;
  setPhaseUI();
  updateProgress();
}

function setPhaseUI() {
  const title = document.getElementById('phase-title');
  const instr = document.getElementById('phase-instructions');
  const selBox = document.getElementById('selected-box');
  if (phase === 'produto') {
    title.textContent = '📦 Produtos';
    title.className = 'phase-title produtos';
    instr.textContent = 'Estoure o balão do produto desta rodada!';
    selBox.className = 'selected-box';
    selBox.textContent = 'Estoure um balão 🎈';
  } else {
    title.textContent = '🏢 Clientes';
    title.className = 'phase-title clientes';
    instr.textContent = 'Agora escolha o cliente! Estoure o balão!';
    selBox.className = 'selected-box revealed';
    selBox.innerHTML = `📦 ${pickedProduto} &nbsp;→&nbsp; Escolha o cliente`;
  }
}

function updateProgress() {
  const done = currentRound - 1;
  const pct = (done / totalRounds) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent = `${done} de ${totalRounds} rodadas concluídas`;
}

function spawnBalloons(type) {
  const arena = document.getElementById('arena');
  arena.innerHTML = '';
  const list = type === 'produto' ? gameProdutos : gameClientes;
  const shuffled = shuffle([...list]);
  const count = Math.min(shuffled.length, 10);
  const arenaW = arena.offsetWidth || 700;
  const arenaH = arena.offsetHeight || 380;

  shuffled.slice(0, count).forEach((item, i) => {
    const color = BALLOON_COLORS[i % BALLOON_COLORS.length];
    const delay = (Math.random() * 2).toFixed(2);
    const duration = (3 + Math.random() * 3).toFixed(2);
    const x = 30 + Math.random() * (arenaW - 130);
    const y = 20 + Math.random() * (arenaH - 190);

    const el = document.createElement('div');
    el.className = 'balloon';
    el.style.cssText = `left:${x}px; top:${y}px; animation-delay:-${delay}s; animation-duration:${duration}s;`;
    el.dataset.item = item;
    el.innerHTML = `
      <div class="balloon-body" style="background:${color}">
        <div class="balloon-shine"></div>
        <div class="balloon-question">?</div>
      </div>
      <div class="balloon-knot" style="background:${color}"></div>
      <div class="balloon-string"></div>
    `;
    el.addEventListener('click', () => popBalloon(el, item, type, color));
    arena.appendChild(el);
  });
}

function popBalloon(el, item, type, color) {
  if (el.classList.contains('popping')) return;
  el.classList.add('popping');

  document.querySelectorAll('.balloon').forEach(b => b.style.pointerEvents = 'none');

  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  spawnParticles(cx, cy, color);

  setTimeout(() => {
    el.remove();
    showReveal(item, type, color);
  }, 350);
}

function showReveal(item, type, color) {
  const overlay = document.getElementById('reveal-overlay');
  const card    = document.getElementById('reveal-card');
  const emoji   = document.getElementById('reveal-emoji');
  const label   = document.getElementById('reveal-label');
  const name    = document.getElementById('reveal-name');
  const hint    = document.getElementById('reveal-hint');

  emoji.textContent = type === 'produto' ? '📦' : '🏢';
  label.textContent = type === 'produto' ? 'Produto' : 'Cliente';
  label.style.color = type === 'produto' ? 'var(--accent2)' : 'var(--accent3)';
  name.textContent  = item;
  name.style.color  = type === 'produto' ? 'var(--accent1)' : 'var(--accent4)';

  const bgStart = type === 'produto' ? '#2a1a00' : '#001a2a';
  const bgEnd   = type === 'produto' ? '#1a0a00' : '#000a1a';
  card.style.background = `linear-gradient(135deg, ${bgStart}, ${bgEnd})`;

  [emoji, label, name, hint].forEach(el => {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';
  });
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'revealPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards';

  overlay.style.opacity = '1';
  overlay.classList.add('active');

  spawnRevealConfetti(color);

  function closeReveal() {
    overlay.style.opacity = '0';
    overlay.classList.remove('active');
    overlay.removeEventListener('click', closeReveal);

    if (type === 'produto') {
      pickedProduto = item;
      const idx = gameProdutos.indexOf(item);
      if (idx !== -1) gameProdutos.splice(idx, 1);

      const selBox = document.getElementById('selected-box');
      selBox.className = 'selected-box revealed';
      selBox.innerHTML = `📦 <strong>${item}</strong> &nbsp;→&nbsp; Escolha o cliente`;

      phase = 'cliente';
      setPhaseUI();
      spawnBalloons('cliente');
    } else {
      pickedCliente = item;
      const idx = gameClientes.indexOf(item);
      if (idx !== -1) gameClientes.splice(idx, 1);

      pairs.push({ round: currentRound, produto: pickedProduto, cliente: pickedCliente });

      const selBox = document.getElementById('selected-box');
      selBox.className = 'selected-box revealed';
      selBox.innerHTML = `🎉 <strong>${pickedProduto}</strong> + <strong>${pickedCliente}</strong>`;

      if (pairs.length >= totalRounds) {
        showPairResult(pickedProduto, item, true);
      } else {
        showPairResult(pickedProduto, item, false);
      }
    }
  }

  setTimeout(() => overlay.addEventListener('click', closeReveal), 800);
}

function showPairResult(produto, cliente, isLast) {
  const overlay  = document.getElementById('pair-overlay');
  const card     = overlay.querySelector('.pair-result-card');
  const btnLabel = isLast ? 'Ver Resultado Final 🏆' : 'Próxima Rodada →';

  document.getElementById('pair-produto-name').textContent = produto;
  document.getElementById('pair-cliente-name').textContent = cliente;
  document.getElementById('pair-round-info').textContent =
    `Rodada ${currentRound} de ${totalRounds}`;

  const btn = document.getElementById('btn-continue-round');
  btn.textContent = btnLabel;

  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'pairCardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards';

  overlay.classList.add('active');
  spawnRevealConfetti('#c77dff');

  btn.onclick = () => {
    overlay.classList.remove('active');
    if (isLast) {
      setTimeout(showFinal, 300);
    } else {
      setTimeout(startRound, 300);
    }
  };
}

// ───────────────────────────────────────────
//  FINAL
// ───────────────────────────────────────────
function showFinal() {
  showScreen('final-screen');
  launchConfetti();

  const grid = document.getElementById('pairs-grid');
  grid.innerHTML = '';
  pairs.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'pair-card';
    card.innerHTML = `
      <span class="pair-num">Rodada ${p.round}</span>
      <span class="pair-produto">📦 ${p.produto}</span>
      <span class="pair-arrow">↕</span>
      <span class="pair-cliente">🏢 ${p.cliente}</span>
    `;
    grid.appendChild(card);
  });
}

function goSetup() {
  showScreen('setup-screen');
}

// ───────────────────────────────────────────
//  UTILS
// ───────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function spawnParticles(cx, cy, color) {
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const angle = (Math.PI * 2 * i) / 14;
    const dist = 50 + Math.random() * 60;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    p.style.cssText = `
      left:${cx - 4}px; top:${cy - 4}px;
      background:${color};
      --dx:${dx}px; --dy:${dy}px;
      animation-duration:${0.4 + Math.random() * 0.3}s;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }
}

function spawnRevealConfetti(color) {
  const colors = [color, '#ffd93d', '#ffffff', '#ff6b6b', '#6bcb77'];
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const c = document.createElement('div');
      c.className = 'confetti-piece';
      c.style.cssText = `
        left:${20 + Math.random() * 60}vw;
        top: 30vh;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        width:${6 + Math.random() * 8}px;
        height:${6 + Math.random() * 8}px;
        animation-duration:${1.2 + Math.random() * 1}s;
        animation-delay:0s;
        opacity:1;
      `;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 2500);
    }, i * 20);
  }
}

function launchConfetti() {
  const colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9f43'];
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const c = document.createElement('div');
      c.className = 'confetti-piece';
      c.style.cssText = `
        left:${Math.random() * 100}vw;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        width:${6 + Math.random() * 10}px;
        height:${6 + Math.random() * 10}px;
        animation-duration:${2 + Math.random() * 2}s;
        animation-delay:${Math.random() * 0.5}s;
        opacity:${0.7 + Math.random() * 0.3};
      `;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }, i * 30);
  }
}

// ───────────────────────────────────────────
//  INIT
// ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderTags('produto');
  renderTags('cliente');

  document.getElementById('produto-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addItem('produto');
  });
  document.getElementById('cliente-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addItem('cliente');
  });
});
