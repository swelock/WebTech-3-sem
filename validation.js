// Функция для проверки состава заказа
function validateOrder() {
    const hasSoup = selectedDishes.soup !== null;
    const hasMain = selectedDishes.main !== null;
    const hasStarter = selectedDishes.starter !== null;
    const hasDrink = selectedDishes.drink !== null;
    const hasDessert = selectedDishes.dessert !== null;

    // Проверка: ничего не выбрано
    if (!hasSoup && !hasMain && !hasStarter && !hasDrink && !hasDessert) {
        showNotification('Ничего не выбрано. Выберите блюда для заказа');
        return false;
    }

    // Варианты комбо:
    // 1. Суп + Главное блюдо + Салат + Напиток
    // 2. Суп + Главное блюдо + Напиток
    // 3. Суп + Салат + Напиток
    // 4. Главное блюдо + Салат + Напиток
    // 5. Главное блюдо + Напиток

    // Проверка варианта 1: Суп + Главное блюдо + Салат + Напиток
    if (hasSoup && hasMain && hasStarter && hasDrink) {
        return true;
    }

    // Проверка варианта 2: Суп + Главное блюдо + Напиток
    if (hasSoup && hasMain && hasDrink && !hasStarter) {
        return true;
    }

    // Проверка варианта 3: Суп + Салат + Напиток
    if (hasSoup && hasStarter && hasDrink && !hasMain) {
        return true;
    }

    // Проверка варианта 4: Главное блюдо + Салат + Напиток
    if (hasMain && hasStarter && hasDrink && !hasSoup) {
        return true;
    }

    // Проверка варианта 5: Главное блюдо + Напиток
    if (hasMain && hasDrink && !hasSoup && !hasStarter) {
        return true;
    }

    // Если не соответствует ни одному варианту, определяем что не хватает
    
    // Проверка: выбраны все необходимые блюда, кроме напитка
    if ((hasSoup && hasMain && hasStarter && !hasDrink) ||
        (hasSoup && hasMain && !hasStarter && !hasDrink) ||
        (hasSoup && hasStarter && !hasMain && !hasDrink) ||
        (hasMain && hasStarter && !hasSoup && !hasDrink) ||
        (hasMain && !hasSoup && !hasStarter && !hasDrink)) {
        showNotification('Выберите напиток');
        return false;
    }

    // Проверка: выбран суп, но не выбраны главное блюдо/салат/стартер
    if (hasSoup && !hasMain && !hasStarter) {
        showNotification('Выберите главное блюдо/салат/стартер');
        return false;
    }

    // Проверка: выбран салат/стартер, но не выбраны суп/главное блюдо
    if (hasStarter && !hasSoup && !hasMain) {
        showNotification('Выберите суп или главное блюдо');
        return false;
    }

    // Проверка: выбран только напиток/десерт
    if ((hasDrink || hasDessert) && !hasMain && !hasSoup && !hasStarter) {
        showNotification('Выберите главное блюдо');
        return false;
    }

    // Если дошли сюда, значит что-то не так с комбинацией
    showNotification('Ничего не выбрано. Выберите блюда для заказа');
    return false;
}

// Функция для показа уведомления
function showNotification(message) {
    // Удаляем существующее уведомление, если есть
    const existingNotification = document.getElementById('notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Создаем уведомление
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';

    notification.innerHTML = `
        <div class="notification-content">
            <p>${message}</p>
            <button class="notification-btn">Окей</button>
        </div>
    `;

    // Добавляем на страницу
    document.body.appendChild(notification);

    // Обработчик клика на кнопку
    const btn = notification.querySelector('.notification-btn');
    btn.addEventListener('click', function() {
        notification.remove();
    });

    // Обработчик наведения на кнопку
    btn.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#8B4513';
        this.style.color = '#fff';
    });

    btn.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#f1eee9';
        this.style.color = '#2c2c2c';
    });
}

// Обработчик отправки формы
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            if (!validateOrder()) {
                e.preventDefault();
                return false;
            }
        });
    }
});

