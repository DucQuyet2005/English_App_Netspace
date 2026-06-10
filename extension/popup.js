// ============================================================
// LingoFlow Helper – popup.js
// Logic cho Extension Popup: đăng nhập, trạng thái, server URL
// ============================================================

const TOKEN_KEY = 'lingoflow_token';
const API_BASE_KEY = 'lingoflow_api_base';
const DEFAULT_API_BASE = 'https://english-app-netspace-backend.onrender.com/api';

// ─── Elements ───────────────────────────────────────────────
const loadingSection = document.getElementById('loading-section');
const loginSection = document.getElementById('login-section');
const profileSection = document.getElementById('profile-section');

const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');

const userDisplayName = document.getElementById('user-display-name');
const userEmail = document.getElementById('user-email');
const offlineBadge = document.getElementById('offline-badge');
const offlineCount = document.getElementById('offline-count');

const serverUrlInput = document.getElementById('server-url');
const btnSetServer = document.getElementById('btn-set-server');

// ─── Helpers ────────────────────────────────────────────────
function showSection(sectionId) {
  [loadingSection, loginSection, profileSection].forEach((el) => {
    el.style.display = 'none';
  });
  document.getElementById(sectionId).style.display = 'block';
}

function showError(msg) {
  loginError.textContent = msg;
  loginError.classList.add('visible');
}

function hideError() {
  loginError.classList.remove('visible');
}

// ─── Get stored API base ─────────────────────────────────────
async function getApiBase() {
  const storage = await chrome.storage.local.get(API_BASE_KEY);
  return storage[API_BASE_KEY] || DEFAULT_API_BASE;
}

// ─── Check auth status on open ──────────────────────────────
async function init() {
  showSection('loading-section');

  // Load server URL
  const apiBase = await getApiBase();
  serverUrlInput.value = apiBase;

  // Check auth
  const result = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' });

  if (result?.isAuthenticated && result?.user) {
    showProfile(result.user);
  } else {
    showSection('login-section');
    setTimeout(() => loginEmailInput.focus(), 100);
  }
}

// ─── Show profile section ────────────────────────────────────
async function showProfile(user) {
  userDisplayName.textContent = user?.displayName || 'Người dùng';
  userEmail.textContent = user?.email || '';
  showSection('profile-section');

  // Check offline queue
  const queueResult = await chrome.runtime.sendMessage({ type: 'GET_QUEUE_COUNT' });
  const count = queueResult?.count || 0;

  if (count > 0) {
    offlineCount.textContent = count;
    offlineBadge.classList.add('visible');
  } else {
    offlineBadge.classList.remove('visible');
  }
}

// ─── Login ──────────────────────────────────────────────────
btnLogin.addEventListener('click', async () => {
  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;

  if (!email || !password) {
    showError('Vui lòng nhập email và mật khẩu.');
    return;
  }

  hideError();
  btnLogin.disabled = true;
  btnLogin.textContent = 'Đang đăng nhập...';

  try {
    const apiBase = await getApiBase();
    const res = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showError(data?.message || 'Email hoặc mật khẩu không đúng.');
      return;
    }

    // Lưu token
    await chrome.storage.local.set({ [TOKEN_KEY]: data.token });

    // Show profile
    showProfile(data.user);
    loginEmailInput.value = '';
    loginPasswordInput.value = '';
  } catch (err) {
    if (!navigator.onLine) {
      showError('Không có kết nối mạng. Vui lòng thử lại khi có Internet.');
    } else {
      showError('Không thể kết nối tới server. Kiểm tra lại API URL.');
    }
  } finally {
    btnLogin.disabled = false;
    btnLogin.textContent = '🔑 Đăng nhập';
  }
});

// Enter key để submit
loginPasswordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnLogin.click();
});

loginEmailInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loginPasswordInput.focus();
});

// ─── Logout ─────────────────────────────────────────────────
btnLogout.addEventListener('click', async () => {
  await chrome.storage.local.set({ [TOKEN_KEY]: null });
  showSection('login-section');
  setTimeout(() => loginEmailInput.focus(), 100);
});

// ─── Set Server URL ─────────────────────────────────────────
btnSetServer.addEventListener('click', async () => {
  let url = serverUrlInput.value.trim();
  if (!url) return;

  // Đảm bảo không có trailing slash
  url = url.replace(/\/+$/, '');

  await chrome.storage.local.set({ [API_BASE_KEY]: url });
  btnSetServer.textContent = '✓';
  btnSetServer.style.color = '#10b981';

  setTimeout(() => {
    btnSetServer.textContent = 'Lưu';
    btnSetServer.style.color = '';
  }, 1500);
});

// ─── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
