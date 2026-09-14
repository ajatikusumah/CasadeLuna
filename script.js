const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const toast = document.querySelector('.toast');

menuToggle?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('.filter-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach((item) => item.classList.remove('is-active'));
    tab.classList.add('is-active');
    const filter = tab.dataset.filter;
    document.querySelectorAll('.cat-card').forEach((card) => {
      card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.status !== filter);
    });
  });
});

document.querySelectorAll('.heart-button').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    button.classList.toggle('is-liked');
    button.textContent = button.classList.contains('is-liked') ? '♥' : '♡';
    const label = button.getAttribute('aria-label')?.replace('Simpan ', '') || 'anabul ini';
    showToast(button.classList.contains('is-liked') ? `${label} disimpan di daftar favorit.` : `${label} dihapus dari daftar favorit.`);
  });
});

document.querySelectorAll('a[href="#donasi"], a[href="#foster"], a[href="#volunteer"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const label = link.textContent.trim().split(/\s+/)[0];
    showToast(`Informasi ${label.toLowerCase()} akan segera tersedia. Untuk saat ini, hubungi Casa de Luna melalui WhatsApp.`);
  });
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 3600);
}

document.querySelector('#year').textContent = new Date().getFullYear();
