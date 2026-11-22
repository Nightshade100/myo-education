/* Clicking any email link opens the mail app as usual, and also copies the address to the clipboard with a short "copied" message. */
(function () {
  var toast;
  function showToast(text) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'copy-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toast.classList.remove('show'); }, 2500);
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.top = '-1000px';
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!a) return;
    var email = decodeURIComponent(a.getAttribute('href').slice(7).split('?')[0]);
    // No preventDefault: the mailto link still opens the mail app.
    var done = function () { showToast('Email copied: ' + email); };
    var fail = function () { if (fallbackCopy(email)) done(); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(email).then(done, fail);
    else fail();
  });
})();
