const items = document.querySelectorAll('.faq-item');

items.forEach(item => {
    item.addEventListener('click', () => {
        items.forEach(el => {
            if (el !== item) el.classList.remove('active');
        });

        item.classList.toggle('active');
    });
});