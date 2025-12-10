// Функция для принудительной очистки отображения (без загрузки из localStorage)
function clearOrderComposition() {
    const compositionContent = document.getElementById('order-composition-content');
    if (compositionContent) {
        compositionContent.innerHTML = '<p class="no-selection">Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу <a href="lunch.html">Собрать ланч</a>.</p>';
    }
}

// Функция для отображения состава заказа на странице checkout.html
function displayOrderComposition() {
    const compositionContent = document.getElementById('order-composition-content');
    if (!compositionContent) return;

    // Загружаем выбранные блюда из localStorage
    loadSelectedDishes();

    // Проверяем, есть ли выбранные блюда
    const hasSelectedDishes = selectedDishes.soup || selectedDishes.main || 
                              selectedDishes.starter || selectedDishes.drink || 
                              selectedDishes.dessert;

    if (!hasSelectedDishes) {
        compositionContent.innerHTML = '<p class="no-selection">Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу <a href="lunch.html">Собрать ланч</a>.</p>';
        return;
    }

    // Создаем контейнер для карточек блюд
    let compositionHTML = '';

    // Отображаем выбранные блюда
    if (selectedDishes.soup) {
        compositionHTML += createDishCard(selectedDishes.soup, 'soup');
    }
    if (selectedDishes.main) {
        compositionHTML += createDishCard(selectedDishes.main, 'main');
    }
    if (selectedDishes.starter) {
        compositionHTML += createDishCard(selectedDishes.starter, 'starter');
    }
    if (selectedDishes.drink) {
        compositionHTML += createDishCard(selectedDishes.drink, 'drink');
    }
    if (selectedDishes.dessert) {
        compositionHTML += createDishCard(selectedDishes.dessert, 'dessert');
    }

    compositionContent.innerHTML = compositionHTML;
}

// Функция для создания карточки блюда
function createDishCard(dish, category) {
    const categoryNames = {
        soup: 'Суп',
        main: 'Главное блюдо',
        starter: 'Салат/стартер',
        drink: 'Напиток',
        dessert: 'Десерт'
    };

    return `
        <div class="dish-card" data-category="${category}">
            <img src="${dish.image || 'https://via.placeholder.com/400x300?text=Нет+изображения'}" 
                 alt="${dish.name}" 
                 onerror="this.src='https://via.placeholder.com/400x300?text=Ошибка+загрузки'">
            <p class="dish-name">${categoryNames[category]}: ${dish.name}</p>
            <p class="dish-price">${dish.price}₽</p>
            <p class="dish-weight">${dish.count}</p>
            <button type="button" class="remove-btn" onclick="removeDishFromOrder('${category}')">Удалить</button>
        </div>
    `;
}

// Функция для обновления отображения после удаления блюда
function updateCompositionDisplay() {
    displayOrderComposition();
    updateOrderDisplay();
}

// Инициализация при загрузке страницы
function initCheckoutPage() {
    // Ждем загрузки блюд
    function waitForDishes() {
        if (dishes && dishes.length > 0) {
            // Загружаем выбранные блюда из localStorage после загрузки всех блюд
            loadSelectedDishes();
            displayOrderComposition();
            updateOrderDisplay();
        } else {
            // Если блюда еще не загружены, пытаемся загрузить их
            if (typeof loadDishes === 'function') {
                loadDishes().then(() => {
                    // Даем время на обновление массива dishes и вызов всех колбэков
                    setTimeout(() => {
                        // Проверяем еще раз, что блюда загружены
                        if (dishes && dishes.length > 0) {
                            loadSelectedDishes();
                            displayOrderComposition();
                            updateOrderDisplay();
                        } else {
                            // Если все еще не загружены, ждем еще
                            setTimeout(waitForDishes, 200);
                        }
                    }, 300);
                }).catch((error) => {
                    console.error('Ошибка при загрузке блюд:', error);
                    setTimeout(waitForDishes, 100);
                });
            } else {
                setTimeout(waitForDishes, 100);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForDishes);
    } else {
        waitForDishes();
    }
}

// Запускаем инициализацию
initCheckoutPage();

// Слушаем изменения в localStorage для обновления при очистке в других вкладках
window.addEventListener('storage', function(e) {
    if (e.key === 'selectedDishes') {
        // Если данные удалены, сбрасываем selectedDishes
        if (!e.newValue) {
            selectedDishes = {
                soup: null,
                main: null,
                starter: null,
                drink: null,
                dessert: null
            };
        } else {
            loadSelectedDishes();
        }
        displayOrderComposition();
        updateOrderDisplay();
    }
});

// Также слушаем кастомные события для обновления на текущей вкладке
window.addEventListener('orderCleared', function() {
    console.log('Событие orderCleared получено на странице checkout.html');
    selectedDishes = {
        soup: null,
        main: null,
        starter: null,
        drink: null,
        dessert: null
    };
    // Обновляем отслеживаемое значение
    lastLocalStorageValue = null;
    // Используем функцию очистки вместо displayOrderComposition
    clearOrderComposition();
    updateOrderDisplay();
});

// Отслеживаем предыдущее значение localStorage для предотвращения лишних обновлений
let lastLocalStorageValue = localStorage.getItem('selectedDishes');

// Проверяем изменения localStorage на текущей вкладке только при необходимости
// (storage event срабатывает только для других вкладок)
setInterval(function() {
    const saved = localStorage.getItem('selectedDishes');
    
    // Если значение не изменилось, ничего не делаем
    if (saved === lastLocalStorageValue) {
        return;
    }
    
    lastLocalStorageValue = saved;
    
    // Проверяем, что localStorage пуст или содержит пустую строку
    if (!saved || saved === '' || saved === 'null') {
        // Если localStorage пуст, но selectedDishes заполнен - очищаем
        if (selectedDishes.soup || selectedDishes.main || selectedDishes.starter || selectedDishes.drink || selectedDishes.dessert) {
            selectedDishes = {
                soup: null,
                main: null,
                starter: null,
                drink: null,
                dessert: null
            };
            clearOrderComposition();
            updateOrderDisplay();
        }
    } else {
        // Если localStorage не пуст, загружаем данные только если они изменились
        const hasSelectedDishes = selectedDishes.soup || selectedDishes.main || selectedDishes.starter || selectedDishes.drink || selectedDishes.dessert;
        loadSelectedDishes();
        const hasSelectedDishesAfter = selectedDishes.soup || selectedDishes.main || selectedDishes.starter || selectedDishes.drink || selectedDishes.dessert;
        
        // Обновляем только если данные действительно изменились
        if (hasSelectedDishes !== hasSelectedDishesAfter || saved !== lastLocalStorageValue) {
            displayOrderComposition();
            updateOrderDisplay();
        }
    }
}, 1000);

