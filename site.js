/* =========================================================
   MYO Education — shared overlay behaviour
   Opens and closes the signs window, the slide-in info panels
   and small dialogs, one on top of another.
   - Esc or clicking outside closes the top one
   - Page behind is blurred and stops scrolling
   - Focus moves into the overlay and back to the button that opened it
   ========================================================= */
(function(){
  const stack = [];          // [{ el, opener }]
  let backdrop, scrim;

  function ensureLayers(){
    if (backdrop) return;
    backdrop = document.createElement('div');
    backdrop.className = 'backdrop';
    scrim = document.createElement('div');
    scrim.className = 'scrim';
    [backdrop, scrim].forEach(l => {
      l.setAttribute('aria-hidden', 'true');
      l.addEventListener('click', closeTop);
      document.body.appendChild(l);
    });
  }

  function layout(){
    stack.forEach((item, i) => { item.el.style.zIndex = 210 + i * 20; });
    backdrop.classList.toggle('is-open', stack.length > 0);
    scrim.classList.toggle('is-open', stack.length > 1);
    if (stack.length > 1) scrim.style.zIndex = 210 + (stack.length - 1) * 20 - 5;
    document.body.classList.toggle('no-scroll', stack.length > 0);
  }

  function open(el, opener){
    ensureLayers();
    const existing = stack.findIndex(s => s.el === el);
    if (existing !== -1) {            // already open (e.g. a different sign in the same panel)
      el.scrollTop = 0;
      return;
    }
    stack.push({ el, opener: opener || document.activeElement });
    el.removeAttribute('aria-hidden');
    el.classList.add('is-open');
    el.scrollTop = 0;
    layout();
    const focusTarget = el.querySelector('[data-autofocus]') || el.querySelector('button, a[href]');
    if (focusTarget) setTimeout(() => focusTarget.focus({ preventScroll: true }), 30);
  }

  function close(el){
    const i = stack.findIndex(s => s.el === el);
    if (i === -1) return;
    const [item] = stack.splice(i, 1);
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    layout();
    if (item.opener && document.contains(item.opener)) item.opener.focus({ preventScroll: true });
  }

  function closeTop(){ if (stack.length) close(stack[stack.length - 1].el); }
  function isOpen(el){ return stack.some(s => s.el === el); }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && stack.length) { e.preventDefault(); closeTop(); }
  });

  window.MYO = window.MYO || {};
  window.MYO.overlay = { open, close, closeTop, isOpen };

  /* the small black circled "i" used across the site */
  window.MYO.infoIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M12 10.8v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7.4" r="1.25" fill="currentColor"/></svg>';
  window.MYO.closeIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  /* keep the ⓘ on the same line as the last word of the text */
  window.MYO.withInfo = function(text, buttonHtml){
    if (!buttonHtml) return text;
    const i = text.lastIndexOf(' ');
    if (i === -1) return `<span style="white-space:nowrap">${text}${buttonHtml}</span>`;
    return `${text.slice(0, i + 1)}<span style="white-space:nowrap">${text.slice(i + 1)}${buttonHtml}</span>`;
  };

  window.MYO.esc = function(str){
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  };
})();
