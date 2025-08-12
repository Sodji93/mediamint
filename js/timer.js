(function () {
  const el = document.querySelector('.timer');
  if (!el) return;
  const parseDuration = (v) => {
    if (!v) return 0;
    if (/^\d+:\d{2}:\d{2}$/.test(v)) {
      const [h, m, s] = v.split(':').map(Number);
      return h * 3600 + m * 60 + s;
    }
    return Math.max(0, parseInt(v, 10) || 0);
  };

  const DURATION = parseDuration(el.dataset.duration || '05:12:35');
  const hh = el.querySelector('.hh'), mm = el.querySelector('.mm'), ss = el.querySelector('.ss');
  const pad = (n) => String(n).padStart(2, '0');

  let end = Date.now() + DURATION * 1000;

  function render(remain) {
    const h = Math.floor(remain / 3600);
    const m = Math.floor((remain % 3600) / 60);
    const s = remain % 60;
    hh.textContent = pad(h);
    mm.textContent = pad(m);
    ss.textContent = pad(s);
  }

  function tick() {
    const now = Date.now();
    let remain = Math.ceil((end - now) / 1000);
    if (remain <= 0) {
      end = now + DURATION * 1000;
      remain = DURATION;
    }
    render(remain);
  }

  render(Math.ceil((end - Date.now()) / 1000));
  setInterval(tick, 250);
})();