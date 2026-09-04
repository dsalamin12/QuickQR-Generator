/* ══════════════════════════════════════════════
   QuickQR — Feedback Widget (shared, JS-injected)
   Renders into any element with id="feedback-widget-mount".
   Fully optional/non-forcing: no modal, no auto-popup,
   nothing required to dismiss.
   Reactions & written comments sent directly to GA4.
   ══════════════════════════════════════════════ */
(function () {
  function renderFeedbackWidget(mount) {
    mount.innerHTML = `
      <div class="glass-card" style="margin:24px 0;">
        <div class="card-body" style="text-align:center;">
          <p style="margin:0 0 10px;font-size:0.9rem;color:var(--text);font-weight:600;">
            Was this page helpful?
          </p>
          <div style="display:flex;justify-content:center;gap:10px;margin-bottom:6px;">
            <button type="button" class="btn btn-outline qq-fb-btn" data-reaction="love" aria-label="This helped me">❤️ Love it</button>
            <button type="button" class="btn btn-outline qq-fb-btn" data-reaction="not-helpful" aria-label="This didn't help">👎 Not helpful</button>
          </div>
          <p class="qq-fb-thanks" style="display:none;font-size:0.85rem;color:var(--success);margin:8px 0 0;">
            Thanks for letting us know! 🙏
          </p>
          <button type="button" class="qq-fb-more-toggle" style="background:none;border:none;color:var(--brand-light);font-size:0.8rem;text-decoration:underline;text-underline-offset:2px;cursor:pointer;margin-top:8px;padding:4px;">
            Add a comment (optional)
          </button>
          <div class="qq-fb-more" style="display:none;margin-top:10px;">
            <textarea class="qq-fb-text" rows="3" maxlength="500" placeholder="What worked, or what could be better? (optional)" style="width:100%;box-sizing:border-box;font-size:16px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg,transparent);color:var(--text);resize:vertical;"></textarea>
            <button type="button" class="btn btn-brand qq-fb-send" style="margin-top:8px;">Send Feedback</button>
            <p class="qq-fb-comment-thanks" style="display:none;font-size:0.85rem;color:var(--success);margin-top:8px;">
              Thank you! Your feedback has been received. 🙏
            </p>
          </div>
        </div>
      </div>
    `;

    const reactionBtns = mount.querySelectorAll('.qq-fb-btn');
    const thanksMsg = mount.querySelector('.qq-fb-thanks');
    const moreToggle = mount.querySelector('.qq-fb-more-toggle');
    const morePanel = mount.querySelector('.qq-fb-more');
    const sendBtn = mount.querySelector('.qq-fb-send');
    const textArea = mount.querySelector('.qq-fb-text');
    const commentThanks = mount.querySelector('.qq-fb-comment-thanks');

    let selectedReaction = '';

    reactionBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        selectedReaction = btn.getAttribute('data-reaction');
        if (typeof gtag === 'function') {
          gtag('event', 'page_feedback', {
            reaction: selectedReaction,
            page_path: window.location.pathname
          });
        }
        reactionBtns.forEach(b => b.disabled = true);
        thanksMsg.style.display = 'block';
      });
    });

    moreToggle.addEventListener('click', function () {
      const isOpen = morePanel.style.display === 'block';
      morePanel.style.display = isOpen ? 'none' : 'block';
      moreToggle.textContent = isOpen ? 'Add a comment (optional)' : 'Hide comment box';
    });

    sendBtn.addEventListener('click', function () {
      const text = textArea.value.trim();
      if (!text) return;

      if (typeof gtag === 'function') {
        gtag('event', 'page_feedback', {
          reaction: selectedReaction || 'comment_only',
          page_path: window.location.pathname,
          feedback_text: text
        });
      }

      sendBtn.disabled = true;
      textArea.disabled = true;
      sendBtn.style.display = 'none';
      commentThanks.style.display = 'block';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#feedback-widget-mount').forEach(renderFeedbackWidget);
  });
})();