// Объект для хранения выбранных блюд
let selectedDishes = {
    soup: null,
    main: null,
    starter: null,
    drink: null,
    dessert: null
};

// Загрузка выбранных блюд из localStorage (по ID)
function loadSelectedDishes() {
    const saved = localStorage.getItem('selectedDishes');
    
    // Если localStorage пуст или содержит пустую строку, очищаем selectedDishes
    if (!saved || saved === '' || saved === 'null') {
        selectedDishes = {
            soup: null,
            main: null,
            starter: null,
            drink: null,
            dessert: null
        };
        return;
    }
    
    // Если блюда еще не загружены, выходим
    if (!dishes || dishes.length === 0) {
        return;
    }
    
    try {
        const savedDishes = JSON.parse(saved);
        
        // Если это не объект или пустой объект, очищаем
        if (!savedDishes || typeof savedDishes !== 'object') {
            selectedDishes = {
                soup: null,
                main: null,
                starter: null,
                drink: null,
                dessert: null
            };
            return;
        }
        
        // Восстанавливаем объекты блюд по ID
        selectedDishes.soup = savedDishes.soup_id ? dishes.find(d => d.id === savedDishes.soup_id) : null;
        selectedDishes.main = savedDishes.main_course_id ? dishes.find(d => d.id === savedDishes.main_course_id) : null;
        selectedDishes.starter = savedDishes.salad_id ? dishes.find(d => d.id === savedDishes.salad_id) : null;
        selectedDishes.drink = savedDishes.drink_id ? dishes.find(d => d.id === savedDishes.drink_id) : null;
        selectedDishes.dessert = savedDishes.dessert_id ? dishes.find(d => d.id === savedDishes.dessert_id) : null;
    } catch (e) {
        // Если ошибка парсинга, очищаем
        console.error('Ошибка при загрузке выбранных блюд:', e);
        selectedDishes = {
            soup: null,
            main: null,
            starter: null,
            drink: null,
            dessert: null
        };
        localStorage.removeItem('selectedDishes');
    }
}

// Сохранение выбранных блюд в localStorage (только ID)
function saveSelectedDishes() {
    const toSave = {
        soup_id: selectedDishes.soup ? selectedDishes.soup.id : null,
        main_course_id: selectedDishes.main ? selectedDishes.main.id : null,
        salad_id: selectedDishes.starter ? selectedDishes.starter.id : null,
        drink_id: selectedDishes.drink ? selectedDishes.drink.id : null,
        dessert_id: selectedDishes.dessert ? selectedDishes.dessert.id : null
    };
    localStorage.setItem('selectedDishes', JSON.stringify(toSave));
}

// Функция для добавления блюда в заказ
function addDishToOrder(dishKeyword) {
    // Находим блюдо в массиве
    const dish = dishes.find(d => d.keyword === dishKeyword);
    if (!dish) return;

    // Определяем категорию
    let category = dish.category;

    // Сохраняем выбранное блюдо
    selectedDishes[category] = dish;

    // Сохраняем в localStorage
    saveSelectedDishes();

    // Обновляем отображение на странице lunch.html
    updateDishSelection(dishKeyword);

    // Обновляем блок заказа на странице checkout.html
    updateOrderDisplay();
    
    // Обновляем панель на странице lunch.html
    if (typeof updateCheckoutPanel === 'function') {
        updateCheckoutPanel();
    }
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
        else if (dish.category === 'starter') sectionClass = 'starters-section';
        else if (dish.category === 'drink') sectionClass = 'drinks-section';
        else if (dish.category === 'dessert') sectionClass = 'desserts-section';

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
    const hasSelectedDishes = selectedDishes.soup || selectedDishes.main || selectedDishes.starter || selectedDishes.drink || selectedDishes.dessert;

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

    // Салат/стартер
    if (selectedDishes.starter) {
        orderHTML += `<p><strong>Салат/стартер:</strong> ${selectedDishes.starter.name} ${selectedDishes.starter.price}₽</p>`;
    } else {
        orderHTML += '<p><strong>Салат/стартер:</strong> Блюдо не выбрано</p>';
    }

    // Напиток
    if (selectedDishes.drink) {
        orderHTML += `<p><strong>Напиток:</strong> ${selectedDishes.drink.name} ${selectedDishes.drink.price}₽</p>`;
    } else {
        orderHTML += '<p><strong>Напиток:</strong> Напиток не выбран</p>';
    }

    // Десерт
    if (selectedDishes.dessert) {
        orderHTML += `<p><strong>Десерт:</strong> ${selectedDishes.dessert.name} ${selectedDishes.dessert.price}₽</p>`;
    } else {
        orderHTML += '<p><strong>Десерт:</strong> Десерт не выбран</p>';
    }

    // Подсчет общей стоимости
    let total = 0;
    if (selectedDishes.soup) total += selectedDishes.soup.price;
    if (selectedDishes.main) total += selectedDishes.main.price;
    if (selectedDishes.starter) total += selectedDishes.starter.price;
    if (selectedDishes.drink) total += selectedDishes.drink.price;
    if (selectedDishes.dessert) total += selectedDishes.dessert.price;

    if (total > 0) {
        orderHTML += `<p class="order-total"><strong>Стоимость заказа:</strong> ${total}₽</p>`;
    }

    orderBlock.innerHTML = orderHTML;
}

// Функция для получения выбранных блюд (для отправки формы) - возвращает ID
function getSelectedDishes() {
    return {
        soup_id: selectedDishes.soup ? selectedDishes.soup.id : null,
        main_course_id: selectedDishes.main ? selectedDishes.main.id : null,
        salad_id: selectedDishes.starter ? selectedDishes.starter.id : null,
        drink_id: selectedDishes.drink ? selectedDishes.drink.id : null,
        dessert_id: selectedDishes.dessert ? selectedDishes.dessert.id : null
    };
}

// Функция для удаления блюда из заказа
function removeDishFromOrder(category) {
    selectedDishes[category] = null;
    saveSelectedDishes();
    updateOrderDisplay();
    
    // Обновляем состав заказа на странице checkout.html
    if (typeof displayOrderComposition === 'function') {
        displayOrderComposition();
    }
    
    // Обновляем панель на странице lunch.html
    if (typeof updateCheckoutPanel === 'function') {
        updateCheckoutPanel();
    }
    
    // Обновляем выделение на странице lunch.html
    if (document.querySelectorAll('.dish-item').length > 0) {
        document.querySelectorAll('.dish-item').forEach(item => {
            item.classList.remove('selected');
        });
    }
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
        if (selectedDishes.starter) {
            updateDishSelection(selectedDishes.starter.keyword);
        }
        if (selectedDishes.drink) {
            updateDishSelection(selectedDishes.drink.keyword);
        }
        if (selectedDishes.dessert) {
            updateDishSelection(selectedDishes.dessert.keyword);
        }
    }, 100);
}

// Инициализация при загрузке страницы
function waitForDishes() {
    if (dishes && dishes.length > 0) {
        restoreSelection();
    } else {
        setTimeout(waitForDishes, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        waitForDishes();
    });
} else {
    waitForDishes();
}

// Слушаем изменения в localStorage для обновления при очистке в других вкладках
window.addEventListener('storage', function(e) {
    if (e.key === 'selectedDishes') {
        // Обновляем выбранные блюда
        loadSelectedDishes();
        
        // Обновляем отображение на странице orders.html
        if (document.getElementById('order-summary')) {
            updateOrderDisplay();
        }
        
        // Обновляем выделение на странице lunch.html
        if (document.querySelectorAll('.dish-item').length > 0) {
            document.querySelectorAll('.dish-item').forEach(item => {
                item.classList.remove('selected');
            });
        }
        
        // Обновляем панель на странице lunch.html
        if (typeof updateCheckoutPanel === 'function') {
            updateCheckoutPanel();
        }
    }
});

