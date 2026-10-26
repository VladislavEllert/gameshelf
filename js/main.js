// Интерактивные элементы из макета. Один файл на все страницы: каждая функция
// ищет свои элементы и ничего не делает, если их на странице нет.

// Склонение слова «игра» по числу: 1 игра, 2 игры, 5 игр
function pluralGames(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} игра`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} игры`;
  return `${n} игр`;
}

// ---------- Мобильное меню (все страницы) ----------
function initMenu() {
  const nav = document.getElementById('nav');
  const openBtn = document.querySelector('.header__menu-btn');
  if (!nav || !openBtn) return;

  document.querySelectorAll('[data-menu-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      openBtn.setAttribute('aria-expanded', String(isOpen));
    });
  });
}

// ---------- Библиотека: табы, поиск, фильтры, сортировка ----------
function initLibrary() {
  const grid = document.querySelector('[data-game-grid]');
  if (!grid) return;

  const items = Array.from(grid.children);
  const tabs = document.querySelectorAll('[data-tab]');
  const search = document.getElementById('search');
  const sort = document.getElementById('sort');
  const filters = document.getElementById('filters');
  const filtersBtn = document.querySelector('[data-filters-toggle]');
  const empty = document.querySelector('[data-empty]');
  const count = document.querySelector('[data-games-count]');

  let activeTab = 'all';

  // Показывает только карточки, подходящие под таб, поиск и фильтры
  function applyFilters() {
    const query = search.value.trim().toLowerCase();
    const genre = filters.genre.value;
    const platform = filters.platform.value;
    const [yearFrom, yearTo] = filters.year.value.split('-').map(Number);
    const onlyPlayed = filters.played.checked;

    let visible = 0;
    items.forEach((item) => {
      const d = item.dataset;
      const year = Number(d.year);
      const matches =
        (activeTab === 'all' || d.status === activeTab) &&
        d.title.toLowerCase().includes(query) &&
        (!genre || d.genre === genre) &&
        (!platform || d.platforms.split(' ').includes(platform)) &&
        year >= yearFrom && year <= yearTo &&
        (!onlyPlayed || Number(d.hours) > 0);

      item.hidden = !matches;
      if (matches) visible += 1;
    });

    const isFiltered = visible !== items.length;
    count.textContent = isFiltered ? `${pluralGames(visible)} по запросу` : count.dataset.total;
    grid.hidden = visible === 0;
    empty.hidden = visible !== 0;
  }

  // Переставляет карточки в нужном порядке (исходный порядок — «недавно сыгранные»)
  function applySort() {
    const sorted = [...items];
    if (sort.value === 'title') {
      sorted.sort((a, b) => a.dataset.title.localeCompare(b.dataset.title));
    } else if (sort.value === 'hours') {
      sorted.sort((a, b) => b.dataset.hours - a.dataset.hours);
    }
    grid.append(...sorted);
  }

  function setTab(name) {
    activeTab = name;
    tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === name;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-pressed', String(isActive));
    });
    applyFilters();
  }

  function setFiltersOpen(isOpen) {
    filters.classList.toggle('is-open', isOpen);
    filtersBtn.setAttribute('aria-expanded', String(isOpen));
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => setTab(tab.dataset.tab)));
  search.addEventListener('input', applyFilters);
  sort.addEventListener('change', applySort);
  filtersBtn.addEventListener('click', () => setFiltersOpen(!filters.classList.contains('is-open')));

  // «Применить»: форма не отправляется на сервер (сервер появится только в ЛР4)
  filters.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilters();
    setFiltersOpen(false);
  });

  // «Сбросить»: браузер сам очищает поля, фильтруем после этого
  filters.addEventListener('reset', () => setTimeout(applyFilters));

  document.querySelector('[data-reset-all]').addEventListener('click', () => {
    search.value = '';
    filters.reset();
    setTab('all');
  });
}

// ---------- Карточка игры: «Мой статус» и заметки ----------
function initGamePage() {
  const statusSwitch = document.querySelector('[data-status-switch]');
  if (statusSwitch) {
    const badge = document.querySelector('[data-status-badge]');
    const buttons = statusSwitch.querySelectorAll('button');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        badge.textContent = btn.textContent;
        badge.className = 'status';
        if (btn.dataset.status !== 'progress') badge.classList.add(`status--${btn.dataset.status}`);
      });
    });
  }

  const notes = document.querySelector('[data-notes]');
  if (notes) {
    const message = notes.querySelector('[data-notes-status]');
    notes.addEventListener('submit', (event) => {
      event.preventDefault();
      message.textContent = 'Заметка сохранена';
      setTimeout(() => { message.textContent = ''; }, 2000);
    });
  }
}

// ---------- Список желаемого: поиск и сортировка ----------
function initWishlist() {
  const list = document.querySelector('[data-wishlist]');
  if (!list) return;

  const items = Array.from(list.children);
  const search = document.getElementById('wish-search');
  const sort = document.getElementById('wish-sort');
  const empty = document.querySelector('[data-empty]');
  const count = document.querySelector('[data-wish-count]');

  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    items.forEach((item) => {
      const matches = item.dataset.title.toLowerCase().includes(query);
      item.hidden = !matches;
      if (matches) visible += 1;
    });
    empty.hidden = visible !== 0;
    count.textContent = `Показано ${visible} из ${items.length} игр`;
  });

  sort.addEventListener('change', () => {
    const sorted = [...items];
    if (sort.value === 'title') {
      sorted.sort((a, b) => a.dataset.title.localeCompare(b.dataset.title));
    } else if (sort.value === 'rating') {
      sorted.sort((a, b) => b.dataset.rating - a.dataset.rating);
    }
    list.append(...sorted);
  });
}

initMenu();
initLibrary();
initGamePage();
initWishlist();
