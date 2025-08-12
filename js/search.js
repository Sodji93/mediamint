document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.querySelector('.header__search.collapsible');
  const input = wrap.querySelector('.search__input');
  const btn = wrap.querySelector('.search__btn');
  const suggest = wrap.querySelector('.search__suggest');

  if (suggest) suggest.hidden = true;

  function open() {
    wrap.classList.add('is-open');
    if (suggest) suggest.hidden = false;
    setTimeout(() => input.focus(), 80);
  }

  function close() {
    wrap.classList.remove('is-open');
    if (suggest) suggest.hidden = true;
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    wrap.classList.contains('is-open') ? close() : open();
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  suggest?.addEventListener('click', (e) => {
    const item = e.target.closest('.suggest__item');
    if (!item) return;
    input.value = item.textContent.trim();
    close();
    input.focus();
  });
});