// ============================================================
// LingoFlow Helper – background.js (Service Worker, MV3)
// ============================================================

const API_BASE_KEY = 'lingoflow_api_base';
const TOKEN_KEY = 'lingoflow_token';
const OFFLINE_QUEUE_KEY = 'lingoflow_offline_queue';
const DEFAULT_API_BASE = 'https://english-app-netspace-backend.onrender.com/api';

// ─── Khởi tạo Context Menu ───────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-to-lingoflow',
    title: '💾 Lưu "%s" vào LingoFlow',
    contexts: ['selection'],
  });

  // Tạo alarm kiểm tra offline queue mỗi 1 phút
  chrome.alarms.create('sync-offline-queue', { periodInMinutes: 1 });
});

// ─── Context Menu Click ──────────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== 'save-to-lingoflow') return;

  const selectedText = info.selectionText?.trim();
  if (!selectedText) return;

  // Chỉ xử lý từ đơn hoặc cụm từ ngắn (max 5 từ)
  const wordCount = selectedText.split(/\s+/).length;
  if (wordCount > 5) {
    await notifyAllTabs({
      type: 'LINGOFLOW_TOAST',
      toastType: 'error',
      message: 'Vui lòng chọn từ hoặc cụm từ ngắn (tối đa 5 từ).',
    });
    return;
  }

  await handleSaveWord(selectedText);
});

// ─── Message từ Content Script ───────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SAVE_WORD') {
    handleSaveWord(message.word, message.wordData).then(sendResponse);
    return true; // async response
  }

  if (message.type === 'LOOKUP_WORD') {
    lookupWord(message.word).then(sendResponse);
    return true;
  }

  if (message.type === 'GET_AUTH_STATUS') {
    getAuthStatus().then(sendResponse);
    return true;
  }

  if (message.type === 'GET_QUEUE_COUNT') {
    getQueueCount().then(sendResponse);
    return true;
  }
});

// ─── Alarm (Offline Sync) ────────────────────────────────────
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'sync-offline-queue') {
    await processSyncQueue();
  }
});

// ─── Network change detection (onStartup + online) ───────────
chrome.runtime.onStartup.addListener(async () => {
  await processSyncQueue();
});

// ─── Hàm tra nghĩa từ ────────────────────────────────────────
async function lookupWord(word) {
  try {
    const { token, apiBase } = await getCredentials();
    const url = `${apiBase}/words/lookup?word=${encodeURIComponent(word)}`;

    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      // Fallback sang Free Dictionary API trực tiếp
      return await lookupWordFallback(word);
    }

    const data = await res.json();
    return { success: true, ...data };
  } catch {
    // Offline hoặc server down → fallback
    return await lookupWordFallback(word);
  }
}

async function lookupWordFallback(word) {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );
    if (!res.ok) return { success: false, word, meaning: '', ipa: '', example: '' };

    const data = await res.json();
    const entry = data[0];
    const phonetic = entry?.phonetics?.find((p) => p.text)?.text || '';
    const firstDef =
      entry?.meanings?.[0]?.definitions?.[0];

    return {
      success: true,
      word: entry?.word || word,
      ipa: phonetic,
      meaning: firstDef?.definition || '',
      example: firstDef?.example || '',
    };
  } catch {
    return { success: false, word, meaning: '', ipa: '', example: '' };
  }
}

// ─── Hàm lưu từ ──────────────────────────────────────────────
async function handleSaveWord(word, wordData = null) {
  const { token, apiBase } = await getCredentials();

  if (!token) {
    await notifyAllTabs({
      type: 'LINGOFLOW_TOAST',
      toastType: 'auth',
      message: 'Vui lòng nhấp vào biểu tượng Extension để đăng nhập trước khi lưu từ mới.',
    });
    return { success: false, reason: 'unauthenticated' };
  }

  // Nếu chưa có wordData (tra nghĩa) → tra nghĩa trước
  if (!wordData) {
    const lookupResult = await lookupWord(word);
    wordData = lookupResult;
  }

  // Kiểm tra online
  const isOnline = navigator?.onLine !== false;
  if (!isOnline) {
    await addToOfflineQueue({ word, wordData });
    await updateBadge();
    await notifyAllTabs({
      type: 'LINGOFLOW_TOAST',
      toastType: 'offline',
      message: `Bạn đang ngoại tuyến. Từ "${word}" đã được lưu tạm thời và sẽ tự động đồng bộ khi có kết nối mạng!`,
    });
    return { success: false, reason: 'offline' };
  }

  // Gọi API
  try {
    const body = {
      word: wordData?.word || word,
      ipa: wordData?.ipa || '',
      meaning: wordData?.meaning || `[${word}]`,
      example: wordData?.example || '',
      topic: 'Extension',
    };

    const res = await fetch(`${apiBase}/words`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.status === 401) {
      // Token hết hạn
      await notifyAllTabs({
        type: 'LINGOFLOW_TOAST',
        toastType: 'auth',
        message: 'Phiên đăng nhập đã hết hạn. Vui lòng nhấp vào biểu tượng Extension để đăng nhập lại.',
      });
      // Xóa token cũ
      await chrome.storage.local.set({ [TOKEN_KEY]: null });
      return { success: false, reason: 'token_expired' };
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const savedWord = data.word;

    const displayMeaning = savedWord?.meaning || wordData?.meaning || '';
    await notifyAllTabs({
      type: 'LINGOFLOW_TOAST',
      toastType: 'success',
      message: `✅ Đã lưu "${savedWord?.word || word}"${displayMeaning ? ` (${displayMeaning.slice(0, 40)})` : ''} vào LingoFlow!`,
    });

    return { success: true, word: savedWord };
  } catch (err) {
    // Có thể mất mạng đột ngột → đưa vào offline queue
    if (!navigator?.onLine) {
      await addToOfflineQueue({ word, wordData });
      await updateBadge();
      await notifyAllTabs({
        type: 'LINGOFLOW_TOAST',
        toastType: 'offline',
        message: `Mất kết nối! Từ "${word}" đã được lưu tạm thời.`,
      });
      return { success: false, reason: 'offline' };
    }

    await notifyAllTabs({
      type: 'LINGOFLOW_TOAST',
      toastType: 'error',
      message: `Không thể lưu từ "${word}". Vui lòng thử lại.`,
    });
    return { success: false, reason: 'error' };
  }
}

// ─── Offline Queue ────────────────────────────────────────────
async function addToOfflineQueue(item) {
  const storage = await chrome.storage.local.get(OFFLINE_QUEUE_KEY);
  const queue = storage[OFFLINE_QUEUE_KEY] || [];
  queue.push({ ...item, timestamp: Date.now() });
  await chrome.storage.local.set({ [OFFLINE_QUEUE_KEY]: queue });
}

async function getQueueCount() {
  const storage = await chrome.storage.local.get(OFFLINE_QUEUE_KEY);
  const queue = storage[OFFLINE_QUEUE_KEY] || [];
  return { count: queue.length };
}

async function processSyncQueue() {
  const { token, apiBase } = await getCredentials();
  if (!token) return;

  const storage = await chrome.storage.local.get(OFFLINE_QUEUE_KEY);
  const queue = storage[OFFLINE_QUEUE_KEY] || [];
  if (queue.length === 0) return;

  const failed = [];

  for (const item of queue) {
    try {
      const body = {
        word: item.wordData?.word || item.word,
        ipa: item.wordData?.ipa || '',
        meaning: item.wordData?.meaning || `[${item.word}]`,
        example: item.wordData?.example || '',
        topic: 'Extension',
      };

      const res = await fetch(`${apiBase}/words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        if (res.status === 401) break; // Token hết hạn, dừng sync
        failed.push(item);
      }
    } catch {
      failed.push(item); // Vẫn offline
      break;
    }
  }

  await chrome.storage.local.set({ [OFFLINE_QUEUE_KEY]: failed });
  await updateBadge();

  if (failed.length < queue.length) {
    const synced = queue.length - failed.length;
    await notifyAllTabs({
      type: 'LINGOFLOW_TOAST',
      toastType: 'success',
      message: `✅ Đã đồng bộ ${synced} từ vựng chờ lên LingoFlow!`,
    });
  }
}

// ─── Badge ────────────────────────────────────────────────────
async function updateBadge() {
  const { count } = await getQueueCount();
  if (count > 0) {
    chrome.action.setBadgeText({ text: `+${count}` });
    chrome.action.setBadgeBackgroundColor({ color: '#f97316' }); // orange
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// ─── Helpers ──────────────────────────────────────────────────
async function getCredentials() {
  const storage = await chrome.storage.local.get([TOKEN_KEY, API_BASE_KEY]);
  return {
    token: storage[TOKEN_KEY] || null,
    apiBase: storage[API_BASE_KEY] || DEFAULT_API_BASE,
  };
}

async function getAuthStatus() {
  const { token, apiBase } = await getCredentials();
  if (!token) return { isAuthenticated: false };

  try {
    const res = await fetch(`${apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      await chrome.storage.local.set({ [TOKEN_KEY]: null });
      return { isAuthenticated: false };
    }
    const data = await res.json();
    return { isAuthenticated: true, user: data.user };
  } catch {
    return { isAuthenticated: false, offline: true };
  }
}

async function notifyAllTabs(message) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    for (const tab of tabs) {
      if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Tab không có content script (trang chrome://) → bỏ qua
        });
      }
    }
  } catch {
    // Silently ignore
  }
}
