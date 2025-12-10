// Функция для обновления панели оформления заказа на странице lunch.html
function updateCheckoutPanel() {
    const panel = document.getElementById('checkout-panel');
    const totalSpan = document.getElementById('checkout-total');
    const checkoutLink = document.getElementById('checkout-link');

    if (!panel || !totalSpan || !checkoutLink) return;

    // Загружаем актуальные данные из localStorage
    loadSelectedDishes();

    // Подсчитываем общую стоимость
    let total = 0;
    if (selectedDishes.soup) total += selectedDishes.soup.price;
    if (selectedDishes.main) total += selectedDishes.main.price;
    if (selectedDishes.starter) total += selectedDishes.starter.price;
    if (selectedDishes.drink) total += selectedDishes.drink.price;
    if (selectedDishes.dessert) total += selectedDishes.dessert.price;

    // Проверяем валидность комбо
    const isValidCombo = validateComboForPanel();

    // Показываем/скрываем панель
    if (total > 0) {
        panel.style.display = 'block';
        totalSpan.textContent = total;
    } else {
        panel.style.display = 'none';
        return;
    }

    // Активируем/деактивируем ссылку в зависимости от валидности комбо
    if (isValidCombo) {
        checkoutLink.style.pointerEvents = 'auto';
        checkoutLink.style.opacity = '1';
    } else {
        checkoutLink.style.pointerEvents = 'none';
        checkoutLink.style.opacity = '0.5';
    }
}

// Функция для проверки валидности комбо (для панели)
function validateComboForPanel() {
    const hasSoup = selectedDishes.soup !== null;
    const hasMain = selectedDishes.main !== null;
    const hasStarter = selectedDishes.starter !== null;
    const hasDrink = selectedDishes.drink !== null;

    // Варианты комбо:
    // 1. Суп + Главное блюдо + Салат + Напиток
    // 2. Суп + Главное блюдо + Напиток
    // 3. Суп + Салат + Напиток
    // 4. Главное блюдо + Салат + Напиток
    // 5. Главное блюдо + Напиток

    if (hasSoup && hasMain && hasStarter && hasDrink) return true;
    if (hasSoup && hasMain && hasDrink && !hasStarter) return true;
    if (hasSoup && hasStarter && hasDrink && !hasMain) return true;
    if (hasMain && hasStarter && hasDrink && !hasSoup) return true;
    if (hasMain && hasDrink && !hasSoup && !hasStarter) return true;

    return false;
}

// Убрали постоянное обновление панели - теперь обновление происходит только при реальных изменениях

// Инициализация панели при загрузке страницы
function initCheckoutPanel() {
    function waitForDishes() {
        if (dishes && dishes.length > 0) {
            loadSelectedDishes();
            updateCheckoutPanel();
        } else {
            setTimeout(waitForDishes, 100);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForDishes);
    } else {
        waitForDishes();
    }
    
    // Слушаем изменения в localStorage для обновления при очистке в других вкладках
    window.addEventListener('storage', function(e) {
        if (e.key === 'selectedDishes') {
            // Если данные удалены, сбрасываем selectedDishes
            if (!e.newValue || e.newValue === '') {
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
            updateCheckoutPanel();
            // Обновляем выделение на странице
            document.querySelectorAll('.dish-item').forEach(item => {
                item.classList.remove('selected');
            });
        }
    });
    
    // Слушаем кастомное событие для обновления на текущей вкладке
    window.addEventListener('orderCleared', function() {
        console.log('Событие orderCleared получено на странице lunch.html');
        selectedDishes = {
            soup: null,
            main: null,
            starter: null,
            drink: null,
            dessert: null
        };
        // Обновляем отслеживаемое значение
        lastLocalStorageValue = null;
        // Убираем выделение с блюд
        document.querySelectorAll('.dish-item').forEach(item => {
            item.classList.remove('selected');
        });
        // Обновляем панель один раз
        updateCheckoutPanel();
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
                updateCheckoutPanel();
                document.querySelectorAll('.dish-item').forEach(item => {
                    item.classList.remove('selected');
                });
            }
        } else {
            // Если localStorage не пуст, загружаем данные
            loadSelectedDishes();
            updateCheckoutPanel();
        }
    }, 1000);
}

// Запускаем инициализацию
initCheckoutPanel();

