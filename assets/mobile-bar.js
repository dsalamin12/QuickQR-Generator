document.getElementById("mobile-bar-placeholder").innerHTML = `
<div id="mobile-bar">
  <div id="mobile-bar-canvas-wrap">⬛</div>
  <div id="mobile-bar-label">
    <div class="bar-title"><div class="live-dot"></div>Live Preview</div>
    <div class="bar-hints">
      📐 <strong>SVG</strong> — perfect for print<br>
      🖼️ <strong>PNG</strong> — ideal for digital<br>
      ⌨️ <strong>Ctrl+Enter</strong> = PNG
    </div>
  </div>
  <div id="mobile-bar-btns">
    <button class="mb-png" onclick="downloadQR('png')">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      PNG
    </button>
    <button class="mb-svg" onclick="downloadQR('svg')">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      SVG
    </button>
  </div>
</div>
