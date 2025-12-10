// Функция для отображения блюд на странице
function displayDishes() {
    // Сортировка блюд по алфавиту
    const sortedDishes = [...dishes].sort((a, b) => {
        return a.name.localeCompare(b.name, 'ru');
    });

    // Группировка по категориям
    const dishesByCategory = {
        soup: sortedDishes.filter(dish => dish.category === 'soup'),
        main: sortedDishes.filter(dish => dish.category === 'main'),
        drink: sortedDishes.filter(dish => dish.category === 'drink')
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

    // Отображение напитков
    const drinksSection = document.querySelector('.drinks-section .dishes-grid');
    if (drinksSection) {
        drinksSection.innerHTML = '';
        dishesByCategory.drink.forEach(dish => {
            const dishElement = createDishElement(dish);
            drinksSection.appendChild(dishElement);
        });
    }
}

// Функция для создания элемента блюда
function createDishElement(dish) {
    const dishItem = document.createElement('div');
    dishItem.className = 'dish-item';
    dishItem.setAttribute('data-dish', dish.keyword);

    dishItem.innerHTML = `
        <img src="${dish.image}" alt="${dish.name}">
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
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', displayDishes);
} else {
    displayDishes();
}

