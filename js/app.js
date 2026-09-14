// Shared helpers for the authenticated pages (login, dashboard, admin).
window.App = (function () {
  try {
    var t = localStorage.getItem('tlss-theme');
    if (t) document.documentElement.dataset.theme = t;
  } catch (e) {}

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function busy(btn, on) {
    btn.setAttribute('aria-busy', on ? 'true' : 'false');
    btn.disabled = !!on;
  }

  function setFieldError(field, message) {
    var el = field.querySelector('.field-error > span');
    if (el) el.textContent = message || '';
    field.dataset.invalid = message ? 'true' : 'false';
  }

  function reveal(el, on, html) {
    if (html != null) el.querySelector(':scope > *').innerHTML = html;
    el.classList.toggle('on', !!on);
  }

  async function me() {
    var res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) return null;
    return (await res.json()).user;
  }

  async function logout() {
    var bye = document.querySelector('.bye');
    if (bye) {
      bye.classList.add('on');
      bye.setAttribute('aria-hidden', 'false');
    }
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var wait = new Promise(function (r) { setTimeout(r, bye && !reduced ? 900 : 0); });
    await Promise.all([
      fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(function () {}),
      wait
    ]);
    location.href = '/login.html';
  }

  function fmtWhen(start, end) {
    var s = new Date(start.replace(' ', 'T'));
    var e = new Date(end.replace(' ', 'T'));
    var day = s.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return day + ', ' + pad(s.getHours()) + ':' + pad(s.getMinutes()) + ' to ' + pad(e.getHours()) + ':' + pad(e.getMinutes());
  }

  var toastTimer;
  function toast(message) {
    var el = document.querySelector('.toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('on'); }, 2800);
  }

  function initials(name) {
    return String(name || '').trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('') || '?';
  }

  // Listing times are Thai local time with no zone; compare against local now.
  function isPast(listing) {
    return new Date(listing.end_time.replace(' ', 'T')) < new Date();
  }

  function togglePanel(panel, btn) {
    var on = !panel.classList.contains('on');
    panel.classList.toggle('on', on);
    if (btn) btn.setAttribute('aria-expanded', String(on));
    return on;
  }

  function rosterHtml(data) {
    var attendees = data.attendees || [];
    var cap = data.listing && data.listing.capacity;
    var head = '<div class="roster-head"><span><b>' + attendees.length + '</b>' + (cap ? ' of ' + cap : '') + ' booked</span></div>';
    if (!attendees.length) return head + '<div class="empty" style="padding:1rem">No bookings yet.</div>';
    return head + '<ul class="roster">' + attendees.map(function (a) {
      return '<li><div class="who"><span class="avatar">' + esc(initials(a.attendee_name)) + '</span><span>' + esc(a.attendee_name)
        + (a.attendee_phone ? ' <small>' + esc(a.attendee_phone) + '</small>' : '')
        + (a.attendee_line ? ' <small>LINE ' + esc(a.attendee_line) + '</small>' : '') + '</span></div>'
        + '<span class="tag ' + (a.payment_status === 'confirmed' ? 'tag-ok' : 'tag-warn') + '">' + esc(a.payment_method) + ' ' + esc(a.payment_status) + '</span></li>';
    }).join('') + '</ul>';
  }

  async function loadRoster(listingId, target) {
    target.innerHTML = '<div class="skeleton" style="min-height:48px"></div>';
    var res = await fetch('/api/my-listings/' + listingId + '/attendees', { credentials: 'include' });
    if (!res.ok) { target.innerHTML = '<div class="empty" style="padding:1rem">Could not load the roster.</div>'; return null; }
    var data = await res.json();
    target.innerHTML = rosterHtml(data);
    return data;
  }

  return { esc: esc, busy: busy, setFieldError: setFieldError, reveal: reveal, me: me, logout: logout, fmtWhen: fmtWhen,
    toast: toast, initials: initials, isPast: isPast, togglePanel: togglePanel, rosterHtml: rosterHtml, loadRoster: loadRoster };
})();
