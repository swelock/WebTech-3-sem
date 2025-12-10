// Функция для отображения блюд на странице
function displayDishes() {
    // Проверяем, загружены ли блюда
    if (!dishes || dishes.length === 0) {
        console.warn('Блюда еще не загружены');
        return;
    }
    
    // Сортировка блюд по алфавиту
    const sortedDishes = [...dishes].sort((a, b) => {
        return a.name.localeCompare(b.name, 'ru');
    });

    // Группировка по категориям
    const dishesByCategory = {
        soup: sortedDishes.filter(dish => dish.category === 'soup'),
        main: sortedDishes.filter(dish => dish.category === 'main'),
        starter: sortedDishes.filter(dish => dish.category === 'starter'),
        drink: sortedDishes.filter(dish => dish.category === 'drink'),
        dessert: sortedDishes.filter(dish => dish.category === 'dessert')
    };

    // Отображение супов
    const soupsSection = document.querySelector('.soups-section .dishes-grid');
    if (soupsSection) {
        soupsSection.innerHTML = '';
        dishesByCategory.soup.forEach(dish => {
            const dishElement = createDishElement(dish);
            soupsSection.appendChild(dishElement);
        });
    }

    // Отображение главных блюд
    const mainDishesSection = document.querySelector('.main-dishes-section .dishes-grid');
    if (mainDishesSection) {
        mainDishesSection.innerHTML = '';
        dishesByCategory.main.forEach(dish => {
            const dishElement = createDishElement(dish);
            mainDishesSection.appendChild(dishElement);
        });
    }

    // Отображение салатов и стартеров
    const startersSection = document.querySelector('.starters-section .dishes-grid');
    if (startersSection) {
        startersSection.innerHTML = '';
        dishesByCategory.starter.forEach(dish => {
            const dishElement = createDishElement(dish);
            startersSection.appendChild(dishElement);
        });
    }

    // Отображение напитков
    const drinksSection = document.querySelector('.drinks-section .dishes-grid');
    if (drinksSection) {
        drinksSection.innerHTML = '';
        dishesByCategory.drink.forEach(dish => {
            const dishElement = createDishElement(dish);
            drinksSection.appendChild(dishElement);
        });
    }

    // Отображение десертов
    const dessertsSection = document.querySelector('.desserts-section .dishes-grid');
    if (dessertsSection) {
        dessertsSection.innerHTML = '';
        dishesByCategory.dessert.forEach(dish => {
            const dishElement = createDishElement(dish);
            dessertsSection.appendChild(dishElement);
        });
    }
}

// Функция для создания элемента блюда
function createDishElement(dish) {
    const dishItem = document.createElement('div');
    dishItem.className = 'dish-item';
    dishItem.setAttribute('data-dish', dish.keyword);

    // Используем изображение из API
    const imgSrc = dish.image || 'https://via.placeholder.com/400x300?text=Нет+изображения';
    
    dishItem.innerHTML = `
        <img src="${imgSrc}" alt="${dish.name}" onerror="this.src='https://via.placeholder.com/400x300?text=Ошибка+загрузки'">
        <p class="dish-price">${dish.price}₽</p>
        <p class="dish-name">${dish.name}</p>
        <p class="dish-weight">${dish.count}</p>
        <button type="button">Добавить</button>
    `;

    // Добавляем обработчик клика на кнопку
    const button = dishItem.querySelector('button');
    button.addEventListener('click', function() {
        addDishToOrder(dish.keyword);
    });

    return dishItem;
}

// Инициализация при загрузке страницы
function initPage() {
    // Ждем, пока все скрипты загрузятся
    if (typeof loadDishes === 'function') {
        loadDishes().catch(error => {
            console.error('Критическая ошибка при загрузке:', error);
        });
    } else {
        // Если функция еще не загружена, ждем
        setTimeout(initPage, 50);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    // Если DOM уже загружен, запускаем сразу
    setTimeout(initPage, 100);
}

