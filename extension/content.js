// ============================================================
// LingoFlow Helper – content.js (Content Script)
// Inject floating button khi người dùng bôi đen văn bản
// ============================================================

(function () {
  'use strict';

  // ─── Constants ─────────────────────────────────────────────
  const FLOAT_BTN_ID = 'lingoflow-float-btn';
  const POPUP_ID = 'lingoflow-lookup-popup';
  const TOAST_ID = 'lingoflow-toast';

  // ─── State ─────────────────────────────────────────────────
  let currentWord = '';
  let lookupData = null;
  let toastTimer = null;

  // ─── Cleanup existing elements ─────────────────────────────
  function removeElement(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function cleanup() {
    removeElement(FLOAT_BTN_ID);
    removeElement(POPUP_ID);
  }

  // ─── Floating Button ───────────────────────────────────────
  function createFloatButton(x, y) {
    removeElement(FLOAT_BTN_ID);

    const btn = document.createElement('div');
    btn.id = FLOAT_BTN_ID;
    btn.innerHTML = `
      <span class="lf-btn-icon">📖</span>
      <span class="lf-btn-text">LingoFlow</span>
    `;

    // Đặt vị trí gần selection
    btn.style.left = `${Math.min(x, window.innerWidth - 160)}px`;
    btn.style.top = `${y - 48}px`;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLookupPopup(x, y);
    });

    document.body.appendChild(btn);
  }

  // ─── Lookup Popup ──────────────────────────────────────────
  async function openLookupPopup(x, y) {
    removeElement(POPUP_ID);

    const popup = document.createElement('div');
    popup.id = POPUP_ID;
    popup.innerHTML = `
      <div class="lf-popup-header">
        <span class="lf-popup-logo">⚡ LingoFlow</span>
        <button class="lf-popup-close" id="lf-close-popup">✕</button>
      </div>
      <div class="lf-popup-word">
        <span class="lf-word-text">${escapeHtml(currentWord)}</span>
        <span class="lf-ipa" id="lf-ipa"></span>
      </div>
      <div class="lf-popup-meaning" id="lf-meaning">
        <div class="lf-loading">
          <div class="lf-spinner"></div>
          <span>Đang tra nghĩa...</span>
        </div>
      </div>
      <div class="lf-popup-example" id="lf-example" style="display:none"></div>
      <div class="lf-popup-actions">
        <button class="lf-btn-save" id="lf-save-btn" disabled>
          💾 Lưu vào LingoFlow
        </button>
      </div>
    `;

    // Đặt vị trí popup
    const popupX = Math.min(x, window.innerWidth - 320);
    const popupY = y + 10;
    popup.style.left = `${popupX}px`;
    popup.style.top = `${popupY}px`;

    document.body.appendChild(popup);

    // Close button
    document.getElementById('lf-close-popup').addEventListener('click', (e) => {
      e.stopPropagation();
      cleanup();
    });

    // Tra nghĩa
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'LOOKUP_WORD',
        word: currentWord,
      });

      lookupData = result;

      const ipaEl = document.getElementById('lf-ipa');
      const meaningEl = document.getElementById('lf-meaning');
      const exampleEl = document.getElementById('lf-example');
      const saveBtn = document.getElementById('lf-save-btn');

      if (result?.ipa) {
        ipaEl.textContent = result.ipa;
      }

      if (result?.meaning) {
        meaningEl.innerHTML = `<p class="lf-meaning-text">${escapeHtml(result.meaning)}</p>`;
      } else {
        meaningEl.innerHTML = `<p class="lf-no-meaning">Không tìm thấy nghĩa. Từ sẽ được lưu để bạn thêm nghĩa sau.</p>`;
      }

      if (result?.example) {
        exampleEl.style.display = 'block';
        exampleEl.innerHTML = `<p class="lf-example-text">💬 <em>${escapeHtml(result.example)}</em></p>`;
      }

      saveBtn.disabled = false;
    } catch {
      const meaningEl = document.getElementById('lf-meaning');
      meaningEl.innerHTML = `<p class="lf-no-meaning">Không thể kết nối. Từ sẽ được lưu mà không có nghĩa.</p>`;
      const saveBtn = document.getElementById('lf-save-btn');
      saveBtn.disabled = false;
    }

    // Save button
    document.getElementById('lf-save-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const saveBtn = document.getElementById('lf-save-btn');
      if (!saveBtn) return;

      saveBtn.disabled = true;
      saveBtn.innerHTML = `<div class="lf-spinner-small"></div> Đang lưu...`;

      const result = await chrome.runtime.sendMessage({
        type: 'SAVE_WORD',
        word: currentWord,
        wordData: lookupData,
      });

      if (result?.success) {
        cleanup();
      } else if (result?.reason === 'unauthenticated') {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `💾 Lưu vào LingoFlow`;
      } else if (result?.reason === 'offline') {
        cleanup();
      } else {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `💾 Thử lại`;
      }
    });
  }

  // ─── Toast Notification ────────────────────────────────────
  function showToast(message, type = 'success') {
    removeElement(TOAST_ID);
    if (toastTimer) clearTimeout(toastTimer);

    const toast = document.createElement('div');
    toast.id = TOAST_ID;
    toast.className = `lf-toast lf-toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('lf-toast-visible');
    });

    toastTimer = setTimeout(() => {
      toast.classList.remove('lf-toast-visible');
      setTimeout(() => removeElement(TOAST_ID), 400);
    }, type === 'auth' || type === 'offline' ? 5000 : 3000);
  }

  // ─── Listen messages từ background ────────────────────────
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'LINGOFLOW_TOAST') {
      showToast(message.message, message.toastType);
    }
  });

  // ─── Text Selection Detection ──────────────────────────────
  document.addEventListener('mouseup', (e) => {
    // Bỏ qua click trong popup hoặc floating button của extension
    if (
      e.target.closest(`#${FLOAT_BTN_ID}`) ||
      e.target.closest(`#${POPUP_ID}`) ||
      e.target.closest(`#${TOAST_ID}`)
    ) {
      return;
    }

    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (!selectedText || selectedText.length < 1 || selectedText.length > 60) {
        cleanup();
        return;
      }

      // Chỉ cho phép ký tự latin, space, dấu gạch ngang
      if (!/^[a-zA-Z\s\-']+$/.test(selectedText)) {
        cleanup();
        return;
      }

      currentWord = selectedText;
      lookupData = null;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const x = rect.left + window.scrollX + rect.width / 2;
      const y = rect.top + window.scrollY;

      createFloatButton(x, y);
    }, 10);
  });

  // ─── Click ngoài → đóng popup ─────────────────────────────
  document.addEventListener('mousedown', (e) => {
    if (
      !e.target.closest(`#${FLOAT_BTN_ID}`) &&
      !e.target.closest(`#${POPUP_ID}`)
    ) {
      cleanup();
    }
  });

  // ─── Scroll → ẩn float button ─────────────────────────────
  document.addEventListener('scroll', () => {
    removeElement(FLOAT_BTN_ID);
  }, { passive: true });

  // ─── Utilities ─────────────────────────────────────────────
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }
})();
