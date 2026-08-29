// QuickQR Blog — theme toggle
// Uses the same 'quickqr_theme' localStorage key as the generator pages,
// so a visitor's choice stays in sync across the whole site. The initial
// data-theme value is already set by the inline head script (runs before
// paint) — this file just wires up the button and persists changes.
(function () {
  function applyIcon(isDark) {
    var icon = document.getElementById('theme-icon');
    var label = document.getElementById('theme-label');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
    if (label) label.textContent = isDark ? 'Light' : 'Dark';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    var isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    applyIcon(isDark);
    toggle.addEventListener('click', function () {
      isDark = !isDark;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      applyIcon(isDark);
      localStorage.setItem('quickqr_theme', isDark ? 'dark' : 'light');
    });
  });
})();
