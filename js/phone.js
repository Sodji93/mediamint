document.addEventListener('DOMContentLoaded', () => {
    const phone = document.getElementById('phone');
    const toggle = phone.querySelector('.phone__toggle');
    const dropdown = phone.querySelector('.phone__dropdown');

    const open = () => {
        phone.classList.add('is-open');
        dropdown.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
        phone.classList.remove('is-open');
        dropdown.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        phone.classList.contains('is-open') ? close() : open();
    });

    document.addEventListener('click', (e) => {
        if (!phone.contains(e.target)) close();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });
});