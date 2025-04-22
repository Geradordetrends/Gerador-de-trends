// scripts/main.js

// ─── Variáveis de Estado ─────────────────────────────────────────────────────
let essenciaisTemplates = {};
let modoEssencialAtivado = false;

// ─── Configurações e URLs ─────────────────────────────────────────────────────
const USER_TYPES = {
  guest:   { label: 'Visitante', maxReq: 5, perReq: 5, expires: null },
  logged:  { label: 'Logado',    maxReq: 5, perReq: 10, expires: null },
  donor:   { label: 'Doador',    maxReq: 5, perReq: [15,30], expiresDays: 30 },
  premium: { label: 'Premium',   maxReq: Infinity, perReq: 50, expires: null }
};
const STORAGE_KEY = 'gt_user_state';
const CSV_URLS = {
  brasil: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRl-mFrT28Kzq5TAWm89A6OqVtKOZb2FWi5zd4lpu6Xvgin7VI-1R0LQugtkDxertXxZITNRelam-O/pub?output=csv",
  mundo:  "https://dhttps://docs.google.com/spreadsheets/d/e/2PACX-1vTIDu9G79jdYgthuurSgm4YzHXkF0ydpWnNfXwDLdrNd_tC3Zdxf3HNWPhpN4L0e33p-SLXlkf4gJhY/pubhtmlocs.google.com/spreadsheets/d/e/…/pub?output=csv"
};

let termosCache = {};

// ─── Carrega State de Usuário ─────────────────────────────────────────────────
function loadUserState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { type: 'guest', reqCount: 0, lastReset: todayString(), donationUntil: null };
  const st = JSON.parse(raw);
  if (st.lastReset !== todayString()) {
    st.reqCount = 0;
    st.lastReset = todayString();
  }
  if (st.type === 'donor' && st.donationUntil && Date.now() > st.donationUntil) {
    st.type = 'logged';
    st.donationUntil = null;
  }
  return st;
}
function saveUserState(st) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
}
function todayString() {
  return new Date().toISOString().slice(0,10);
}
let userState = loadUserState();

// ─── Referências ao DOM ──────────────────────────────────────────────────────
const dom = {
  regiao:         () => document.getElementById('regiao'),
  termoSorteado:  () => document.getElementById('termoSorteado'),
  btnGerar:       () => document.getElementById('btnGerar'),
  btnCopiarTermo: () => document.getElementById('btnCopiarTermo'),
  copiarLinkBtn:  () => document.getElementById('copiarLink'),
  toolLink:       () => document.getElementById('toolLink'),
  grupo:          () => document.getElementById('grupo'),
  categoria:      () => document.getElementById('categoria'),
  gerarTitulos:   () => document.getElementById('gerar-titulos'),
  titulosGerados: () => document.getElementById('titulosGerados')  // ← reinserido
};

// ─── Atualiza UI de Usuário e Banner ─────────────────────────────────────────
function updateUserUI() {
  const cfg = USER_TYPES[userState.type];
  const banner = document.getElementById('userBanner');
  banner.className = 'user-banner';
  let text = '';
  switch (userState.type) {
    case 'premium':
      text = `🎉 Você é Premium (uso ilimitado)`;
      banner.classList.add('premium');
      break;
    case 'donor':
      const until = new Date(userState.donationUntil).toLocaleDateString();
      text = `💙 Doador até ${until} — uso diário normal`;
      banner.classList.add('donor');
      break;
    case 'logged':
      text = `👤 Logado — ${cfg.maxReq - userState.reqCount} requisições restantes hoje`;
      banner.classList.add('logged');
      break;
    default:
      text = `👋 Visitante — ${cfg.maxReq - userState.reqCount} requisições premium restantes hoje`;
      banner.classList.add('logged');
  }
  if (!canGenerate() && userState.type !== 'premium') {
    text = `⚠️ Modo Essencial Ativado — seleção reduzida e títulos mais básicos (apenas 5 por geração)`;
    banner.className = 'user-banner essential';
  }
  banner.textContent = text;

  const loginCTA = document.getElementById('loginCTA');
  if (userState.type === 'guest') loginCTA.classList.remove('hidden');
  else                  loginCTA.classList.add('hidden');
}

// ─── Funções de Ação (Login/Doar/Premium) ───────────────────────────────────
function doLogin() {
  const name = prompt('Digite seu nome ou e‑mail para login:');
  if (!name) return alert('Login cancelado.');
  const wasGuest = userState.type === 'guest';
  const welcomeBonusUsed = localStorage.getItem('gt_welcome_bonus_used');

  userState.type = 'logged';
  if (wasGuest && !welcomeBonusUsed) {
    userState.reqCount = 0;
    localStorage.setItem('gt_welcome_bonus_used', '1');
    alert('🎁 Bônus de boas‑vindas! Suas requisições foram renovadas.');
  }

  saveUserState(userState);
  updateUserUI();
  alert(`Bem‑vindo, ${name}!`);
}

const uc = {
  btnLogin:  () => document.getElementById('btnLogin'),
  btnDonate: () => document.getElementById('btnDonate'),
  btnPremium:() => document.getElementById('btnPremium')
};
uc.btnLogin().addEventListener('click', doLogin);
uc.btnDonate().addEventListener('click', () => {
  const num = parseInt(prompt('Quanto deseja doar? R$3 ou R$5:', '3'), 5);
  if (![3,5].includes(num)) return alert('Valor inválido.');
  userState.type = 'donor';
  userState.donationUntil = Date.now() + USER_TYPES.donor.expiresDays * 24*3600*1000;
  saveUserState(userState); updateUserUI();
  alert(`Obrigado pela doação de R$${num}! Até ${new Date(userState.donationUntil).toLocaleDateString()}`);
});
uc.btnPremium().addEventListener('click', () => {
  if (!confirm('Assinar Premium por R$20 mensais?')) return;
  userState.type = 'premium';
  userState.donationUntil = null;
  saveUserState(userState);
  updateUserUI();
  alert('Parabéns! Você agora é usuário Premium.');
});

// ─── Utilitários ───────────────────────────────────────────────────────────
function highlight(el, cls='highlight', dur=1000) {
  el.classList.add(cls);
  setTimeout(()=>el.classList.remove(cls), dur);
}
function showLimitMessage() {
  document.getElementById('limitMessage').classList.remove('hidden');
}
function hideLimitMessage() {
  document.getElementById('limitMessage').classList.add('hidden');
}
function resetUserState() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}
function scrollToGerador() {
  const el = document.getElementById('customTerm');
  if (!el) return;
  const topOffset = el.offsetTop - 480;
  window.scrollTo({ top: topOffset, behavior: 'smooth' });
}

// ─── CSV e Termos ────────────────────────────────────────────────────────────
async function fetchTermos(regiao) {
  if (termosCache[regiao]) return termosCache[regiao];
  const res = await fetch(CSV_URLS[regiao] || CSV_URLS.brasil);
  const txt = await res.text();
  const arr = txt.split('\n').slice(1).map(l => l.trim())
    .filter(l => l && !l.startsWith(',') && /^[\wÀ-ÿ\s\-!?]+$/i.test(l));
  termosCache[regiao] = arr;
  return arr;
}
async function sortearTermo() {
  const el = dom.termoSorteado();
  el.textContent = '🔄 Carregando...';
  try {
    const arr = await fetchTermos(dom.regiao().value);
    const t = arr[Math.floor(Math.random()*arr.length)];
    el.textContent = `🔍 ${t}`;
    highlight(el);
  } catch {
    el.textContent = 'Erro ao carregar termos.';
  }
}
function copiarTermo() {
  const t = dom.termoSorteado().textContent.replace(/^🔍\s*/,'');
  if (!t) return;
  copyText(t, dom.btnCopiarTermo(), 'Copiado!','Copiar termo');
}
async function carregarEssenciais() {
  try {
    const res = await fetch('essenciais.json');
    essenciaisTemplates = await res.json();
  } catch(err) {
    console.error('Erro ao carregar essenciais:', err);
  }
}

// ─── Renderização Unificada ─────────────────────────────────────────────────
function renderizarTitulosArray(arr) {
  const html = arr.map(r => `
    <li class="title-item">
      <span class="star">✨</span>
      <span class="title-text">${r}</span>
      <button class="copy-btn" aria-label="Copiar título">📋</button>
    </li>`).join('');
  dom.titulosGerados().innerHTML = html;
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const txt = btn.closest('.title-item').querySelector('.title-text').textContent;
      navigator.clipboard.writeText(txt);
      btn.textContent = '✅';
      setTimeout(() => btn.textContent = '📋', 1500);
    });
  });
  updateUserUI();
}

// ─── Lógica de Geração ───────────────────────────────────────────────────────
function canGenerate() {
  return userState.reqCount < USER_TYPES[userState.type].maxReq;
}
function gerarTitulos() {
  const termo = dom.termoSorteado().textContent.replace(/^🔍\s*/,'').trim();
  if (!termo) return alert('Escolha um termo.');
  const grupo = dom.grupo().value;
  const cat   = dom.categoria().value;
  const cfg   = USER_TYPES[userState.type];

  if (!canGenerate() && userState.type !== 'premium') {
    if (!modoEssencialAtivado) {
      showLimitMessage();
      modoEssencialAtivado = true;
    }
    const essCat = essenciaisTemplates[grupo]?.[cat] || [];
    const mix = [...essCat].sort(() => 0.5 - Math.random()).slice(0,5)
      .map(t => t.replace(/\[termo\]/gi, termo));
    return renderizarTitulosArray(mix);
  }

  const pool = titleTemplates[grupo]?.[cat] || [];
  if (!pool.length) {
    dom.titulosGerados().innerHTML = '<li>⚠️ Nenhum template nesta categoria.</li>';
    return;
  }
  userState.reqCount++;
  saveUserState(userState);

  const qtd = Array.isArray(cfg.perReq)
    ? Math.floor(Math.random()*(cfg.perReq[1]-cfg.perReq[0]+1)) + cfg.perReq[0]
    : cfg.perReq;

  const sel = [...pool].sort(() => 0.5 - Math.random()).slice(0, qtd)
    .map(t => t.replace(/\[termo\]/gi, termo));

  renderizarTitulosArray(sel);
}

// ─── Inicialização ─────────────────────────────────────────────────────────
async function init() {
  document.querySelector('.limit-close').addEventListener('click', hideLimitMessage);
  document.querySelectorAll('.donate-btn').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      uc.btnDonate().click();
    });
  });

  updateUserUI();
  await carregarEssenciais();

  dom.btnGerar().addEventListener('click', sortearTermo);
  dom.btnCopiarTermo().addEventListener('click', copiarTermo);
  document.getElementById('btnLoginCTA').addEventListener('click', doLogin);
  dom.regiao().addEventListener('change', sortearTermo);

  dom.copiarLinkBtn().addEventListener('click', () =>
    copyText(dom.toolLink().value, dom.copiarLinkBtn(), 'Link copiado!','Copiar link')
  );
  dom.grupo().addEventListener('change', atualizarCategorias);
  dom.gerarTitulos().addEventListener('click', gerarTitulos);

  atualizarCategorias();
  sortearTermo();
}

document.addEventListener('DOMContentLoaded', init);

// ─── Atualiza categorias dinamicamente ───────────────────────────────────────
function atualizarCategorias() {
  const grp = dom.grupo().value;
  const fonte = titleTemplates[grp] || essenciaisTemplates[grp] || {};
  const sel   = dom.categoria();
  sel.innerHTML = '';
  Object.keys(fonte).forEach(cat => {
    const o = document.createElement('option');
    o.value = cat;
    o.textContent = cat;
    sel.appendChild(o);
  });
}

// ─── Utilitário para cópia ──────────────────────────────────────────────────
function copyText(text, btnEl, success='Copiado!', fallback='Copiar') {
  if (!navigator.clipboard) return alert('Clipboard não suportado');
  navigator.clipboard.writeText(text).then(() => {
    if (btnEl) {
      btnEl.textContent = success;
      setTimeout(() => btnEl.textContent = fallback, 1500);
    }
  });
}
