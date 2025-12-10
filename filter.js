// Функция для фильтрации блюд
function filterDishes(category, kind) {
    let sectionClass;
    if (category === 'soup') sectionClass = 'soups-section';
    else if (category === 'main') sectionClass = 'main-dishes-section';
    else if (category === 'starter') sectionClass = 'starters-section';
    else if (category === 'drink') sectionClass = 'drinks-section';
    else if (category === 'dessert') sectionClass = 'desserts-section';
    
    const section = document.querySelector(`.${sectionClass} .dishes-grid`);
    if (!section) return;

    // Получаем все блюда категории
    const allDishes = dishes.filter(dish => dish.category === category);
    
    // Сортируем по алфавиту
    const sortedDishes = [...allDishes].sort((a, b) => {
        return a.name.localeCompare(b.name, 'ru');
    });

    // Фильтруем по kind, если указан
    const filteredDishes = kind 
        ? sortedDishes.filter(dish => dish.kind === kind)
        : sortedDishes;

    // Очищаем секцию
    section.innerHTML = '';

    // Отображаем отфильтрованные блюда
    filteredDishes.forEach(dish => {
        const dishElement = createDishElement(dish);
        section.appendChild(dishElement);
    });

    // Восстанавливаем выделение выбранных блюд
    restoreSelectionAfterFilter();
}

// Функция для восстановления выделения после фильтрации
function restoreSelectionAfterFilter() {
    if (selectedDishes.soup) {
        const item = document.querySelector(`[data-dish="${selectedDishes.soup.keyword}"]`);
        if (item) item.classList.add('selected');
    }
    if (selectedDishes.main) {
        const item = document.querySelector(`[data-dish="${selectedDishes.main.keyword}"]`);
        if (item) item.classList.add('selected');
    }
    if (selectedDishes.starter) {
        const item = document.querySelector(`[data-dish="${selectedDishes.starter.keyword}"]`);
        if (item) item.classList.add('selected');
    }
    if (selectedDishes.drink) {
        const item = document.querySelector(`[data-dish="${selectedDishes.drink.keyword}"]`);
        if (item) item.classList.add('selected');
    }
    if (selectedDishes.dessert) {
        const item = document.querySelector(`[data-dish="${selectedDishes.dessert.keyword}"]`);
        if (item) item.classList.add('selected');
    }
}

// Инициализация фильтров
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.closest('.filters').getAttribute('data-category');
            const kind = this.getAttribute('data-kind');
            const isActive = this.classList.contains('active');

            // Убираем активность со всех кнопок этой категории
            const categoryFilters = this.closest('.filters');
            categoryFilters.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Если кнопка была активна, снимаем фильтр, иначе применяем
            if (isActive) {
                // Показываем все блюда
                filterDishes(category, null);
            } else {
                // Применяем фильтр
                this.classList.add('active');
                filterDishes(category, kind);
            }
        });
    });
}

// Инициализация при загрузке страницы
function initFiltersOnLoad() {
    // Ждем, пока блюда загрузятся через API
    if (dishes && dishes.length > 0) {
        // Если блюда уже загружены, инициализируем фильтры
        setTimeout(initFilters, 100);
    } else {
        // Если еще не загружены, ждем
        setTimeout(initFiltersOnLoad, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Ждем загрузки блюд через API
        setTimeout(initFiltersOnLoad, 300);
    });
} else {
    setTimeout(initFiltersOnLoad, 300);
}

