// Объект для хранения выбранных блюд
let selectedDishes = {
    soup: null,
    main: null,
    drink: null
};

// Загрузка выбранных блюд из localStorage
function loadSelectedDishes() {
    const saved = localStorage.getItem('selectedDishes');
    if (saved) {
        const savedDishes = JSON.parse(saved);
        // Восстанавливаем объекты блюд из массива
        if (savedDishes.soup) {
            selectedDishes.soup = dishes.find(d => d.keyword === savedDishes.soup);
        }
        if (savedDishes.main) {
            selectedDishes.main = dishes.find(d => d.keyword === savedDishes.main);
        }
        if (savedDishes.drink) {
            selectedDishes.drink = dishes.find(d => d.keyword === savedDishes.drink);
        }
    }
}

// Сохранение выбранных блюд в localStorage
function saveSelectedDishes() {
    const toSave = {
        soup: selectedDishes.soup ? selectedDishes.soup.keyword : null,
        main: selectedDishes.main ? selectedDishes.main.keyword : null,
        drink: selectedDishes.drink ? selectedDishes.drink.keyword : null
    };
    localStorage.setItem('selectedDishes', JSON.stringify(toSave));
}

// Функция для добавления блюда в заказ
function addDishToOrder(dishKeyword) {
    // Находим блюдо в массиве
    const dish = dishes.find(d => d.keyword === dishKeyword);
    if (!dish) return;

    // Определяем категорию
    let category;
    if (dish.category === 'soup') {
        category = 'soup';
    } else if (dish.category === 'main') {
        category = 'main';
    } else if (dish.category === 'drink') {
        category = 'drink';
    }

    // Сохраняем выбранное блюдо
    selectedDishes[category] = dish;

    // Сохраняем в localStorage
    saveSelectedDishes();

    // Обновляем отображение на странице lunch.html
    updateDishSelection(dishKeyword);

    // Обновляем блок заказа на странице orders.html
    updateOrderDisplay();
}

// Функция для обновления выделения выбранного блюда на странице lunch.html
function updateDishSelection(selectedKeyword) {
    // Убираем выделение со всех блюд
    document.querySelectorAll('.dish-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Выделяем выбранное блюдо
    const selectedItem = document.querySelector(`[data-dish="${selectedKeyword}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
    }

    // Убираем выделение с других блюд той же категории
    const dish = dishes.find(d => d.keyword === selectedKeyword);
    if (dish) {
        let sectionClass;
        if (dish.category === 'soup') sectionClass = 'soups-section';
        else if (dish.category === 'main') sectionClass = 'main-dishes-section';
        else if (dish.category === 'drink') sectionClass = 'drinks-section';

        if (sectionClass) {
            document.querySelectorAll(`.${sectionClass} .dish-item`).forEach(item => {
                if (item.getAttribute('data-dish') !== selectedKeyword) {
                    item.classList.remove('selected');
                }
            });
        }
    }
}

// Функция для обновления блока заказа на странице orders.html
function updateOrderDisplay() {
    const orderBlock = document.getElementById('order-summary');
    if (!orderBlock) return;

    // Проверяем, есть ли выбранные блюда
    const hasSelectedDishes = selectedDishes.soup || selectedDishes.main || selectedDishes.drink;

    if (!hasSelectedDishes) {
        orderBlock.innerHTML = '<p class="no-selection">Ничего не выбрано</p>';
        return;
    }

    // Формируем HTML для блока заказа
    let orderHTML = '<h3>Ваш заказ</h3>';

    // Суп
    if (selectedDishes.soup) {
        orderHTML += `<p><strong>Суп:</strong> ${selectedDishes.soup.name} ${selectedDishes.soup.price}₽</p>`;
    } else {
        orderHTML += '<p><strong>Суп:</strong> Блюдо не выбрано</p>';
    }

    // Главное блюдо
    if (selectedDishes.main) {
        orderHTML += `<p><strong>Главное блюдо:</strong> ${selectedDishes.main.name} ${selectedDishes.main.price}₽</p>`;
    } else {
        orderHTML += '<p><strong>Главное блюдо:</strong> Блюдо не выбрано</p>';
    }

    // Напиток
    if (selectedDishes.drink) {
        orderHTML += `<p><strong>Напиток:</strong> ${selectedDishes.drink.name} ${selectedDishes.drink.price}₽</p>`;
    } else {
        orderHTML += '<p><strong>Напиток:</strong> Напиток не выбран</p>';
    }

    // Подсчет общей стоимости
    let total = 0;
    if (selectedDishes.soup) total += selectedDishes.soup.price;
    if (selectedDishes.main) total += selectedDishes.main.price;
    if (selectedDishes.drink) total += selectedDishes.drink.price;

    if (total > 0) {
        orderHTML += `<p class="order-total"><strong>Стоимость заказа:</strong> ${total}₽</p>`;
    }

    orderBlock.innerHTML = orderHTML;
}

// Функция для получения выбранных блюд (для отправки формы)
function getSelectedDishes() {
    return {
        soup: selectedDishes.soup ? selectedDishes.soup.keyword : '',
        main: selectedDishes.main ? selectedDishes.main.keyword : '',
        drink: selectedDishes.drink ? selectedDishes.drink.keyword : ''
    };
}

// Функция для восстановления выделения после загрузки блюд
function restoreSelection() {
    loadSelectedDishes();
    if (document.getElementById('order-summary')) {
        updateOrderDisplay();
    }
    // Восстанавливаем выделение на странице lunch.html после загрузки блюд
    setTimeout(() => {
        if (selectedDishes.soup) {
            updateDishSelection(selectedDishes.soup.keyword);
        }
        if (selectedDishes.main) {
            updateDishSelection(selectedDishes.main.keyword);
        }
        if (selectedDishes.drink) {
            updateDishSelection(selectedDishes.drink.keyword);
        }
    }, 100);
}

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreSelection);
} else {
    restoreSelection();
}

