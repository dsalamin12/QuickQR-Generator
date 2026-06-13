//first script

 window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-CVL3PE1DGQ');
  
//2nd Script

// ── State ──
let qrInstance = null;
let activeTab = 'url';
let activeDotStyle = 'square';
let activeCornerStyle = 'square';
let logoDataURL = null;
let logoForced = false;
let debounceTimer = null;
let useGradient = false;

// Bulk state
let bulkRows = null;
let bulkTpl = null;
let bulkFileName = '';

// ── Sticky right col + mobile bar positioning ──
function updateStickyTop() {
  const hh = document.getElementById('site-header').offsetHeight;
  const isMobile = window.innerWidth <= 768;
  if (!isMobile) {
    // Desktop: sticky right col
    document.getElementById('right-col').style.top = (hh + 12) + 'px';
    document.getElementById('right-col').style.maxHeight = 'calc(100vh - ' + (hh + 24) + 'px)';
    document.getElementById('app-layout').style.paddingTop = '';
  } else {
    // Mobile: position fixed bar directly below fixed header
    const bar = document.getElementById('mobile-bar');
    if (bar) {
      bar.style.top = hh + 'px';
      requestAnimationFrame(() => {
        const barH = bar.offsetHeight || 90;
        document.getElementById('app-layout').style.paddingTop = (hh + barH + 8) + 'px';
      });
    }
  }
}
// Run after full paint so header height is accurate
requestAnimationFrame(() => { updateStickyTop(); });
setTimeout(updateStickyTop, 200); // second pass after fonts/images load
window.addEventListener('resize', updateStickyTop);

// ── Mirror QR canvas into mobile bar thumbnail ──
function syncMobileBar() {
  if (window.innerWidth > 768) return;
  const wrap = document.getElementById('mobile-bar-canvas-wrap');
  if (!wrap) return;
  const old = wrap.querySelector('canvas');
  if (old) old.remove();
  const src = document.getElementById('qr-container').querySelector('canvas');
  if (src && src.width > 0) {
    wrap.textContent = '';
    const c = document.createElement('canvas');
    c.width = 68; c.height = 68;
    c.getContext('2d').drawImage(src, 0, 0, 68, 68);
    wrap.appendChild(c);
  } else {
    wrap.textContent = '⬛';
  }
}

// ── Theme ──
const themeToggle = document.getElementById('theme-toggle');
let isDark = true;
document.getElementById('theme-icon').textContent = '☀️';
document.getElementById('theme-label').textContent = 'Light';
themeToggle.addEventListener('click', () => {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('theme-icon').textContent = isDark ? '☀️' : '🌙';
  document.getElementById('theme-label').textContent = isDark ? 'Light' : 'Dark';
});

// ── Tabs ──
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    activeTab = btn.dataset.tab;
    const panel = document.getElementById('tab-' + activeTab);
    if (panel) panel.classList.add('active');
    updateBulkUI();
    scheduleQR();
    // Fix: sync mobile bar after tab switch renders new QR
    setTimeout(syncMobileBar, 600);
  });
});

// Wire all inputs
const inputIds = ['input-url','input-text','wifi-ssid','wifi-pass','wa-phone','wa-msg',
  'email-to','email-subject','email-body','vcard-first','vcard-last','vcard-phone',
  'vcard-email','vcard-org','vcard-title','sms-phone','sms-msg'];
inputIds.forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', scheduleQR);
});
['wifi-sec','wa-country'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', scheduleQR);
});

// ── Accordion ──
function toggleAccordion(header) {
  const isOpen = header.classList.contains('open');
  const body = header.nextElementSibling;
  const chevron = header.querySelector('.chevron');
  header.classList.toggle('open', !isOpen);
  body.classList.toggle('open', !isOpen);
  chevron.classList.toggle('rotated', !isOpen);
}
function toggleSeoAccordion(header) {
  const body = header.nextElementSibling;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  header.querySelector('span').textContent = isOpen ? '▼' : '▲';
}

// ── Gradient UI ──
function toggleGradientUI() {
  useGradient = document.getElementById('gradient-toggle').classList.contains('on');
  document.getElementById('gradient-ui').style.display = useGradient ? 'block' : 'none';
}
document.getElementById('gradient-type').addEventListener('change', scheduleQR);
document.getElementById('color-grad-end').addEventListener('input', e => {
  document.getElementById('color-grad-end-hex').textContent = e.target.value;
});

// ── Shapes ──
function selectDot(el) {
  document.querySelectorAll('[data-dot]').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  activeDotStyle = el.dataset.dot;
  scheduleQR();
}
function selectCorner(el) {
  document.querySelectorAll('[data-corner]').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  activeCornerStyle = el.dataset.corner;
  scheduleQR();
}

// ── Color presets ──
function applyPreset(fg, bg) {
  document.getElementById('color-fg').value = fg;
  document.getElementById('color-bg').value = bg;
  document.getElementById('color-fg-hex').textContent = fg;
  document.getElementById('color-bg-hex').textContent = bg;
  document.getElementById('color-eye-outer').value = fg;
  document.getElementById('color-eye-inner').value = fg;
  document.getElementById('color-eye-outer-hex').textContent = fg;
  document.getElementById('color-eye-inner-hex').textContent = fg;
  generateQR();
  // Fix: sync mobile bar after preset colour renders
  setTimeout(syncMobileBar, 600);
}
document.getElementById('color-fg').addEventListener('input', e => { document.getElementById('color-fg-hex').textContent = e.target.value; });
document.getElementById('color-bg').addEventListener('input', e => { document.getElementById('color-bg-hex').textContent = e.target.value; });
document.getElementById('color-eye-outer').addEventListener('input', e => { document.getElementById('color-eye-outer-hex').textContent = e.target.value; });
document.getElementById('color-eye-inner').addEventListener('input', e => { document.getElementById('color-eye-inner-hex').textContent = e.target.value; });

// ── Logo ──
function handleLogoUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast('⚠️ Logo too large. Max 2MB.', '#f59e0b'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    logoDataURL = e.target.result;
    document.getElementById('logo-placeholder').style.display = 'none';
    document.getElementById('logo-preview-wrap').style.display = 'flex';
    document.getElementById('logo-preview').src = logoDataURL;
    document.getElementById('logo-name').textContent = file.name;
    document.getElementById('logo-dropzone').classList.add('has-file');
    document.getElementById('logo-controls').style.display = 'flex';
    const ecSelect = document.getElementById('ec-level');
    ecSelect.value = 'H'; ecSelect.disabled = true;
    document.getElementById('ec-locked-note').style.display = 'block';
    updateECBadge('H');
    logoForced = true;
    generateQR();
  };
  reader.readAsDataURL(file);
}
function clearLogo() {
  logoDataURL = null; logoForced = false;
  document.getElementById('logo-file').value = '';
  document.getElementById('logo-placeholder').style.display = 'block';
  document.getElementById('logo-preview-wrap').style.display = 'none';
  document.getElementById('logo-dropzone').classList.remove('has-file');
  document.getElementById('logo-controls').style.display = 'none';
  document.getElementById('ec-level').disabled = false;
  document.getElementById('ec-locked-note').style.display = 'none';
  generateQR();
}

// ── EC Badge ──
function updateECBadge(level) {
  const badge = document.getElementById('ec-badge');
  const labels = { L:'L — Low', M:'M — Medium', Q:'Q — Quartile', H:'H — High' };
  badge.textContent = labels[level] || level;
  badge.className = level === 'H' ? 'ec-badge high' : 'ec-badge normal';
}
document.getElementById('ec-level').addEventListener('change', e => { updateECBadge(e.target.value); generateQR(); });

// ── Wi-Fi pwd toggle ──
function togglePwdVis() {
  const inp = document.getElementById('wifi-pass');
  const eye = document.getElementById('pwd-eye');
  inp.type = inp.type === 'password' ? 'text' : 'password';
  eye.textContent = inp.type === 'password' ? '👁' : '🙈';
}

// ── Data builders ──
function buildQRData() {
  switch (activeTab) {
    case 'url': return document.getElementById('input-url').value.trim();
    case 'text': return document.getElementById('input-text').value.trim();
    case 'wifi': {
      const ssid = document.getElementById('wifi-ssid').value.trim();
      if (!ssid) return '';
      const pass = document.getElementById('wifi-pass').value;
      const sec = document.getElementById('wifi-sec').value;
      const hidden = document.getElementById('wifi-hidden-toggle').classList.contains('on');
      const esc = s => s.replace(/[\\";,]/g, c => '\\' + c);
      if (sec === 'nopass') return `WIFI:T:nopass;S:${esc(ssid)};P:;;H:${hidden};`;
      return `WIFI:T:${sec};S:${esc(ssid)};P:${esc(pass)};;H:${hidden};`;
    }
    case 'vcard': {
      const first = document.getElementById('vcard-first').value.trim();
      const last = document.getElementById('vcard-last').value.trim();
      if (!first && !last) return '';
      const phone = document.getElementById('vcard-phone').value.trim();
      const email = document.getElementById('vcard-email').value.trim();
      const org = document.getElementById('vcard-org').value.trim();
      const title = document.getElementById('vcard-title').value.trim();
      return `BEGIN:VCARD\nVERSION:3.0\nN:${last};${first};;;\nFN:${first} ${last}\nORG:${org}\nTITLE:${title}\nTEL;TYPE=CELL:${phone}\nEMAIL;TYPE=PREF,INTERNET:${email}\nEND:VCARD`;
    }
    case 'whatsapp': {
      const cc = document.getElementById('wa-country').value;
      const phone = document.getElementById('wa-phone').value.trim().replace(/\D/g,'');
      if (!phone) return '';
      const msg = document.getElementById('wa-msg').value.trim();
      const base = `https://wa.me/${cc}${phone}`;
      return msg ? `${base}?text=${encodeURIComponent(msg)}` : base;
    }
    case 'sms': {
      const phone = document.getElementById('sms-phone').value.trim().replace(/\D/g,'');
      if (!phone) return '';
      const msg = document.getElementById('sms-msg').value.trim();
      return msg ? `smsto:${phone}:${encodeURIComponent(msg)}` : `smsto:${phone}`;
    }
    case 'email': {
      const to = document.getElementById('email-to').value.trim();
      if (!to) return '';
      const subject = document.getElementById('email-subject').value.trim();
      const body = document.getElementById('email-body').value.trim();
      const params = [];
      if (subject) params.push('subject=' + encodeURIComponent(subject));
      if (body) params.push('body=' + encodeURIComponent(body));
      return `mailto:${to}${params.length ? '?' + params.join('&') : ''}`;
    }
    default: return '';
  }
}

function getMetaType() {
  const map = { url:'🔗 URL', text:'📝 Plain Text', wifi:'📶 Wi-Fi Network',
    vcard:'📇 vCard Contact', whatsapp:'💬 WhatsApp', sms:'💬 SMS', email:'✉️ Email' };
  return map[activeTab] || 'QR Code';
}

// ── Core QR Generator ──
function generateQR() {
  const data = buildQRData();
  const container = document.getElementById('qr-container');
  const placeholder = document.getElementById('placeholder-view');
  const qrMeta = document.getElementById('qr-meta');

  if (!data) {
    placeholder.style.display = 'flex';
    qrMeta.style.display = 'none';
    ['canvas','svg'].forEach(tag => { const el = container.querySelector(tag); if (el) el.remove(); });
    return;
  }

  placeholder.style.display = 'none';
  const size = parseInt(document.getElementById('qr-size').value);
  const fgColor = document.getElementById('color-fg').value;
  const bgColor = document.getElementById('color-bg').value;
  const ec = document.getElementById('ec-level').value;
  const logoSize = parseInt(document.getElementById('logo-size').value) / 100;
  const eyeOuter = document.getElementById('color-eye-outer').value;
  const eyeInner = document.getElementById('color-eye-inner').value;
  useGradient = document.getElementById('gradient-toggle').classList.contains('on');

  const dotsOpts = { color: fgColor, type: activeDotStyle };
  if (useGradient) {
    const gradEnd = document.getElementById('color-grad-end').value;
    const gradType = document.getElementById('gradient-type').value;
    dotsOpts.gradient = { type: gradType, rotation: gradType === 'linear' ? 0.25 : 0,
      colorStops: [{ offset:0, color:fgColor }, { offset:1, color:gradEnd }] };
  }

  const options = {
    width: size, height: size, type: 'canvas', data: data,
    margin: 24,
    dotsOptions: dotsOpts,
    cornersSquareOptions: { type: activeCornerStyle, color: eyeOuter },
    cornersDotOptions: { type: activeCornerStyle === 'dot' ? 'dot' : 'square', color: eyeInner },
    backgroundOptions: { color: bgColor },
    qrOptions: { errorCorrectionLevel: ec },
  };
  if (logoDataURL) {
    options.image = logoDataURL;
    options.imageOptions = { crossOrigin: 'anonymous', margin: 4, imageSize: logoSize };
  }

  ['canvas','svg'].forEach(tag => { const el = container.querySelector(tag); if (el) el.remove(); });

  // Guard: QRCodeStyling library may not be loaded yet on slow connections
  if (typeof QRCodeStyling === 'undefined') {
    console.warn('QRCodeStyling not loaded yet — retrying in 500ms');
    setTimeout(generateQR, 500);
    return;
  }

  try {
    qrInstance = new QRCodeStyling(options);
    qrInstance.append(container);
  } catch(err) { console.error('QR error:', err); return; }

  qrMeta.style.display = 'block';
  document.getElementById('meta-type').textContent = getMetaType();
  document.getElementById('meta-size').textContent = `${size}×${size}`;

  // Sync mobile bar thumbnail after canvas renders (~300ms for QRCodeStyling)
  setTimeout(syncMobileBar, 350);
}

function scheduleQR() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(generateQR, 180);
}

// ── Download ──
function downloadQR(format) {
  if (!qrInstance) { showToast('⚠️ Generate a QR code first.', '#f59e0b'); return; }
  const data = buildQRData();
  if (!data) { showToast('⚠️ No content to encode.', '#f59e0b'); return; }

  if (format === 'svg') {
    const size = parseInt(document.getElementById('qr-size').value);
    const fgColor = document.getElementById('color-fg').value;
    const bgColor = document.getElementById('color-bg').value;
    const ec = document.getElementById('ec-level').value;
    const logoSize = parseInt(document.getElementById('logo-size').value) / 100;
    const eyeOuter = document.getElementById('color-eye-outer').value;
    const eyeInner = document.getElementById('color-eye-inner').value;
    useGradient = document.getElementById('gradient-toggle').classList.contains('on');
    const dotsOptsSvg = { color: fgColor, type: activeDotStyle };
    if (useGradient) {
      const gradEnd = document.getElementById('color-grad-end').value;
      const gradType = document.getElementById('gradient-type').value;
      dotsOptsSvg.gradient = { type: gradType, rotation: gradType === 'linear' ? 0.25 : 0,
        colorStops: [{ offset:0, color:fgColor }, { offset:1, color:gradEnd }] };
    }
    const svgOpts = {
      width: size, height: size, type: 'svg', data: data, margin: 24,
      dotsOptions: dotsOptsSvg,
      cornersSquareOptions: { type: activeCornerStyle, color: eyeOuter },
      cornersDotOptions: { type: activeCornerStyle === 'dot' ? 'dot' : 'square', color: eyeInner },
      backgroundOptions: { color: bgColor },
      qrOptions: { errorCorrectionLevel: ec },
    };
    if (logoDataURL) { svgOpts.image = logoDataURL; svgOpts.imageOptions = { crossOrigin:'anonymous', margin:4, imageSize:logoSize }; }
    new QRCodeStyling(svgOpts).download({ name: 'quickqr-code', extension: 'svg' });
  } else {
    qrInstance.download({ name: 'quickqr-code', extension: 'png' });
  }
  showToast(`✓ ${format.toUpperCase()} downloaded!`, 'var(--success)');
}

// ── CSV Parser ──
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i+1 < line.length && line[i+1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

// ── Bulk CSV Templates per content type ──
const CSV_TEMPLATES = {
  url: {
    label: 'URL',
    headers: ['url'],
    sample: [['https://example.com'], ['https://myshop.com/product/1'], ['https://instagram.com/mybrand']],
    hint: 'Each row = one URL QR code.',
    build: row => row['url'] || ''
  },
  text: {
    label: 'Text',
    headers: ['text'],
    sample: [['Hello, welcome to our store!'], ['Table 5 — Scan for menu'], ['Wi-Fi Password: MyPass123']],
    hint: 'Each row = one plain text QR code.',
    build: row => row['text'] || ''
  },
  wifi: {
    label: 'Wi-Fi',
    headers: ['ssid','password','security','hidden'],
    sample: [['HomeNetwork','mypassword123','WPA','false'], ['OfficeWiFi','office2024','WPA','false'], ['GuestNet','','nopass','false']],
    hint: 'security: WPA, WEP, or nopass. hidden: true or false.',
    build: row => {
      const ssid = row['ssid'] || ''; if (!ssid) return '';
      const pass = row['password'] || '';
      const sec = row['security'] || 'WPA';
      const hidden = (row['hidden'] || 'false').toLowerCase() === 'true';
      const esc = s => s.replace(/[\\";,]/g, c => '\\' + c);
      return sec === 'nopass' ? `WIFI:T:nopass;S:${esc(ssid)};P:;;H:${hidden};` : `WIFI:T:${sec};S:${esc(ssid)};P:${esc(pass)};;H:${hidden};`;
    }
  },
  vcard: {
    label: 'vCard',
    headers: ['first_name','last_name','phone','email','company','job_title'],
    sample: [['John','Doe','+1555019283','john@company.com','Acme Corp','Director'], ['Jane','Smith','+44207946001','jane@firm.co','Smith Ltd','Designer']],
    hint: 'Creates a contact card QR. Phone and email are optional.',
    build: row => {
      const first = row['first_name'] || ''; const last = row['last_name'] || '';
      if (!first && !last) return '';
      const phone = row['phone'] || ''; const email = row['email'] || '';
      const org = row['company'] || ''; const title = row['job_title'] || '';
      return `BEGIN:VCARD\nVERSION:3.0\nN:${last};${first};;;\nFN:${first} ${last}\nORG:${org}\nTITLE:${title}\nTEL;TYPE=CELL:${phone}\nEMAIL;TYPE=PREF,INTERNET:${email}\nEND:VCARD`;
    }
  },
  whatsapp: {
    label: 'WhatsApp',
    headers: ['country_code','phone','message'],
    sample: [['1','5550192834','Hello! I saw your listing.'], ['44','7911123456','Hi, is this still available?'], ['880','1712345678','']],
    hint: 'country_code: digits only (e.g. 1 for US, 44 for UK, 880 for BD). message is optional.',
    build: row => {
      const cc = (row['country_code'] || '').replace(/\D/g,'');
      const phone = (row['phone'] || '').replace(/\D/g,'');
      if (!phone) return '';
      const msg = row['message'] || '';
      const base = `https://wa.me/${cc}${phone}`;
      return msg ? `${base}?text=${encodeURIComponent(msg)}` : base;
    }
  },
  sms: {
    label: 'SMS',
    headers: ['phone','message'],
    sample: [['+15550192834','Your appointment is confirmed.'], ['+447911123456','Thank you for your order!'], ['+8801712345678','']],
    hint: 'Include country code in phone. message is optional.',
    build: row => {
      const phone = (row['phone'] || '').replace(/\s/g,'');
      if (!phone) return '';
      const msg = row['message'] || '';
      return msg ? `smsto:${phone}:${encodeURIComponent(msg)}` : `smsto:${phone}`;
    }
  },
  email: {
    label: 'Email',
    headers: ['to','subject','body'],
    sample: [['alice@example.com','Hello from QuickQR','Scan this to email me!'], ['bob@firm.com','Meeting invite','Let\'s connect tomorrow.'], ['info@shop.com','','']],
    hint: 'subject and body are optional.',
    build: row => {
      const to = row['to'] || ''; if (!to) return '';
      const subject = row['subject'] || ''; const body = row['body'] || '';
      const params = [];
      if (subject) params.push('subject=' + encodeURIComponent(subject));
      if (body) params.push('body=' + encodeURIComponent(body));
      return `mailto:${to}${params.length ? '?' + params.join('&') : ''}`;
    }
  }
};

function updateBulkUI() {
  const tpl = CSV_TEMPLATES[activeTab];
  if (!tpl) return;
  document.getElementById('bulk-type-badge').textContent = tpl.label;
  document.getElementById('bulk-type-name').textContent = tpl.label;
  document.getElementById('bulk-dl-type-label').textContent = tpl.label;
  // Reset bulk loaded data
  bulkRows = null;
  bulkTpl = null;
  bulkFileName = '';
  document.getElementById('btn-generate-zip').disabled = true;
  document.getElementById('bulk-upload-status').style.display = 'none';
  // Show template preview
  const previewLines = [tpl.headers.join(','), ...tpl.sample.slice(0,2).map(r => r.join(','))];
  document.getElementById('bulk-template-preview').textContent = previewLines.join('\n');
}

function downloadCSVTemplate() {
  const tpl = CSV_TEMPLATES[activeTab];
  if (!tpl) return;
  const rows = [tpl.headers, ...tpl.sample];
  const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
  const hint = `# QuickQR CSV Template — ${tpl.label}\n# ${tpl.hint}\n# Remove these comment lines before uploading.\n`;
  const blob = new Blob([hint + csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `quickqr-template-${activeTab}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`✓ Template downloaded for ${tpl.label}!`, 'var(--success)');
}

function triggerBulkCSV() {
  document.getElementById('bulk-csv-input').click();
}

function handleBulkCSV(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    const text = e.target.result;
    const tpl = CSV_TEMPLATES[activeTab];
    if (!tpl) { showToast('⚠️ Unsupported content type for bulk.', '#f59e0b'); return; }

    const cleanLines = text.split('\n').filter(r => r.trim() && !r.trim().startsWith('#'));
    if (cleanLines.length < 2) { showToast('⚠️ CSV needs a header + at least one row.', '#f59e0b'); return; }

    const headers = parseCSVLine(cleanLines[0]).map(h => h.trim().toLowerCase().replace(/^"|"$/g,'').replace(/\s+/g,'_'));
    const dataRows = cleanLines.slice(1).map(line => {
      const cols = parseCSVLine(line).map(c => c.trim().replace(/^"|"$/g,'').replace(/""/g,'"'));
      const obj = {};
      headers.forEach((h, i) => { obj[h] = cols[i] || ''; });
      return obj;
    }).filter(row => Object.values(row).some(v => v.trim()));

    if (!dataRows.length) { showToast('⚠️ No valid data rows found.', '#f59e0b'); return; }
    if (dataRows.length > 50) { showToast('⚠️ Max 50 QR codes per export.', '#f59e0b'); return; }

    // Store for later generation
    bulkRows = dataRows;
    bulkTpl = tpl;
    bulkFileName = file.name;
    document.getElementById('btn-generate-zip').disabled = false;

    // Show uploaded content in preview box
    const previewDiv = document.getElementById('bulk-template-preview');
    previewDiv.textContent = text; // show raw file
    // Show status
    const status = document.getElementById('bulk-upload-status');
    status.style.display = 'block';
    status.textContent = `✅ ${dataRows.length} rows loaded from ${file.name}. Ready to generate.`;
    status.style.color = 'var(--success)';

    showToast(`File "${file.name}" loaded (${dataRows.length} codes).`, 'var(--success)');
    input.value = ''; // reset file input
  };
  reader.readAsText(file);
}

async function generateBulkZip() {
  if (!bulkRows || !bulkTpl) {
    showToast('⚠️ Please upload a CSV file first.', '#f59e0b'); return;
  }

  const tpl = bulkTpl;
  const dataRows = bulkRows;
  const total = dataRows.length;
  const progressDiv = document.getElementById('bulk-progress');
  const progressFill = document.getElementById('bulk-progress-fill');
  const progressText = document.getElementById('bulk-progress-text');
  progressDiv.style.display = 'block';
  progressFill.style.width = '0%';
  progressText.textContent = '0%';

  const size = parseInt(document.getElementById('qr-size').value);
  const fgColor = document.getElementById('color-fg').value;
  const bgColor = document.getElementById('color-bg').value;
  const ec = document.getElementById('ec-level').value;
  const eyeOuter = document.getElementById('color-eye-outer').value;
  const eyeInner = document.getElementById('color-eye-inner').value;
  useGradient = document.getElementById('gradient-toggle').classList.contains('on');
  const zip = new JSZip();
  let skipped = 0;

  for (let i = 0; i < total; i++) {
    const qrData = tpl.build(dataRows[i]);
    if (!qrData) { skipped++; const pct = Math.round(((i+1)/total)*100); progressFill.style.width=pct+'%'; progressText.textContent=pct+'%'; continue; }

    const opts = {
      width: size, height: size, type: 'canvas', data: qrData, margin: 24,
      dotsOptions: { color: fgColor, type: activeDotStyle },
      cornersSquareOptions: { type: activeCornerStyle, color: eyeOuter },
      cornersDotOptions: { type: activeCornerStyle === 'dot' ? 'dot' : 'square', color: eyeInner },
      backgroundOptions: { color: bgColor },
      qrOptions: { errorCorrectionLevel: ec },
    };
    if (useGradient) {
      const gradEnd = document.getElementById('color-grad-end').value;
      const gradType = document.getElementById('gradient-type').value;
      opts.dotsOptions.gradient = { type: gradType, rotation: gradType === 'linear' ? 0.25 : 0,
        colorStops: [{ offset:0, color:fgColor }, { offset:1, color:gradEnd }] };
    }
    await new Promise(resolve => {
      const div = document.createElement('div');
      div.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
      document.body.appendChild(div);
      const inst = new QRCodeStyling(opts);
      inst.append(div);
      setTimeout(() => {
        const canvas = div.querySelector('canvas');
        if (canvas) {
          const base64 = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/,'');
          zip.file(`qr-${i+1}.png`, base64, { base64: true });
        }
        document.body.removeChild(div);
        const pct = Math.round(((i+1)/total)*100);
        progressFill.style.width = pct + '%';
        progressText.textContent = pct + '%';
        resolve();
      }, 400);
    });
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `quickqr-bulk-${activeTab}.zip`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  progressDiv.style.display = 'none';
  const generated = total - skipped;
  showToast(`✅ ${generated} QR code${generated!==1?'s':''} in ZIP!${skipped?` (${skipped} skipped)`:''}`,'var(--success)');
}

// ── Toast ──
let toastTimer = null;
function showToast(msg, color = 'var(--brand-light)') {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  toast.style.color = color;
  toast.style.borderColor = color + '44';
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ── Init ──
updateECBadge('L');
document.getElementById('input-url').value = 'https://example.com';
updateBulkUI();

// Patch scheduleQR so mobile bar always syncs after every debounced render
const _origScheduleQR = scheduleQR;
scheduleQR = function() {
  _origScheduleQR.apply(this, arguments);
  setTimeout(syncMobileBar, 700);
};

// Wait for QRCodeStyling to be available (fixes console error on slow connections)
function initWhenReady(attempts) {
  if (typeof QRCodeStyling !== 'undefined') {
    generateQR();
    setTimeout(syncMobileBar, 700);
    setTimeout(updateStickyTop, 300);
  } else if (attempts > 0) {
    setTimeout(() => initWhenReady(attempts - 1), 300);
  }
}
initWhenReady(10);

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); downloadQR('png'); }
});
