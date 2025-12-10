// API URL и ключ
// Прямое подключение к API (CORS поддерживается)
const API_ORDERS_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/orders';
if (typeof window.API_KEY === 'undefined' && typeof API_KEY === 'undefined') {
    window.API_KEY = '4e072be6-7310-4570-a60f-f310f62ad707';
    var API_KEY = window.API_KEY;
} else if (typeof window.API_KEY !== 'undefined') {
    var API_KEY = window.API_KEY;
}

// Функция для проверки валидности комбо перед отправкой
function validateComboBeforeSubmit() {
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

// Функция для показа уведомления об ошибке
function showErrorNotification(message) {
    const existing = document.getElementById('error-notification');
    if (existing) existing.remove();

    const errorMsg = document.createElement('div');
    errorMsg.id = 'error-notification';
    errorMsg.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10000;';
    errorMsg.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 12px; text-align: center; max-width: 400px;">
            <p style="font-size: 18px; margin-bottom: 25px; color: #2c2c2c;">${message}</p>
            <button id="close-error-btn" style="padding: 12px 30px; background: #8B4513; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">Окей</button>
        </div>
    `;
    document.body.appendChild(errorMsg);

    const closeBtn = errorMsg.querySelector('#close-error-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            errorMsg.remove();
        });
    }
}

// Функция для отправки заказа на сервер
async function submitOrder(formData) {
    try {
        // Проверяем валидность комбо
        if (!validateComboBeforeSubmit()) {
            showErrorNotification('Состав заказа не соответствует ни одному из доступных комбо. Пожалуйста, выберите правильную комбинацию блюд.');
            return false;
        }

        // Формируем данные для отправки
        const orderData = {
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            subscribe: formData.get('subscribe') === '1' ? 1 : 0,
            phone: formData.get('phone'),
            delivery_address: formData.get('delivery_address'),
            delivery_type: formData.get('delivery_type'),
            delivery_time: formData.get('delivery_time') || null,
            comment: formData.get('comment') || '',
            soup_id: selectedDishes.soup ? selectedDishes.soup.id : null,
            main_course_id: selectedDishes.main ? selectedDishes.main.id : null,
            salad_id: selectedDishes.starter ? selectedDishes.starter.id : null,
            drink_id: selectedDishes.drink ? selectedDishes.drink.id : null,
            dessert_id: selectedDishes.dessert ? selectedDishes.dessert.id : null
        };

        // Удаляем null значения для необязательных полей
        if (!orderData.delivery_time) delete orderData.delivery_time;
        if (!orderData.comment) delete orderData.comment;
        if (!orderData.soup_id) delete orderData.soup_id;
        if (!orderData.main_course_id) delete orderData.main_course_id;
        if (!orderData.salad_id) delete orderData.salad_id;
        if (!orderData.dessert_id) delete orderData.dessert_id;

        // Проверяем время доставки, если delivery_type = by_time
        if (orderData.delivery_type === 'by_time') {
            if (!orderData.delivery_time) {
                showErrorNotification('Укажите время доставки');
                return false;
            }
            // Проверяем, что время не раньше текущего
            const now = new Date();
            const deliveryTime = new Date();
            const [hours, minutes] = orderData.delivery_time.split(':');
            deliveryTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            if (deliveryTime < now) {
                showErrorNotification('Время доставки не может быть раньше текущего времени');
                return false;
            }
        }

        // Проверяем, что API_KEY определен (проверяем и window.API_KEY и локальный API_KEY)
        const apiKey = window.API_KEY || API_KEY;
        if (typeof apiKey === 'undefined' || !apiKey) {
            console.error('API_KEY не определен!');
            showErrorNotification('Ошибка: API ключ не найден. Пожалуйста, обновите страницу.');
            return false;
        }

        console.log('Отправка заказа:', orderData);
        console.log('API_KEY:', apiKey);
        console.log('URL запроса:', `${API_ORDERS_URL}?api_key=${apiKey}`);

        // Отправляем запрос напрямую к API
        const response = await fetch(`${API_ORDERS_URL}?api_key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        console.log('Ответ от API:', response.status, response.statusText);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: `HTTP error! status: ${response.status} ${response.statusText}` };
            }
            console.error('Ошибка при создании заказа:', errorData);
            
            // Проверяем, не связана ли ошибка с API ключом
            let errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
            if (response.status === 401 || response.status === 403 || 
                (typeof errorData === 'object' && errorData.error && 
                 (errorData.error.includes('API') || errorData.error.includes('авторизац')))) {
                errorMessage = 'Ошибка авторизации API. Проверьте, что API ключ правильный.';
            }
            
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Заказ успешно создан:', result);
        console.log('ID созданного заказа:', result.id);
        console.log('Полный ответ сервера:', JSON.stringify(result, null, 2));

        // Сбрасываем выбранные блюда ПЕРЕД удалением из localStorage
        selectedDishes = {
            soup: null,
            main: null,
            starter: null,
            drink: null,
            dessert: null
        };
        
        // Удаляем данные из localStorage СРАЗУ
        localStorage.removeItem('selectedDishes');
        
        // Принудительно обновляем отображение на текущей странице (checkout.html)
        const compositionContent = document.getElementById('order-composition-content');
        if (compositionContent) {
            compositionContent.innerHTML = '<p class="no-selection">Ничего не выбрано. Чтобы добавить блюда в заказ, перейдите на страницу <a href="lunch.html">Собрать ланч</a>.</p>';
        }
        
        const orderBlock = document.getElementById('order-summary');
        if (orderBlock) {
            orderBlock.innerHTML = '<p class="no-selection">Ничего не выбрано</p>';
        }
        
        // Вызываем функцию очистки
        if (typeof clearOrderComposition === 'function') {
            clearOrderComposition();
        }
        
        // Обновляем отображение заказа
        if (typeof updateOrderDisplay === 'function') {
            updateOrderDisplay();
        }
        
        // Сбрасываем форму
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.reset();
        }
        
        // Отправляем кастомное событие для обновления на текущей вкладке
        console.log('Отправка события orderCleared');
        window.dispatchEvent(new CustomEvent('orderCleared'));

        // Показываем сообщение об успехе
        showErrorNotification('Заказ успешно оформлен! Спасибо за ваш заказ. Перенаправление на страницу заказов...');

        // Перенаправляем на страницу заказов через 2 секунды, чтобы заказ успел сохраниться на сервере
        setTimeout(() => {
            // Добавляем параметр для принудительного обновления и timestamp для избежания кэширования
            window.location.href = 'orders.html?refresh=' + Date.now() + '&orderId=' + result.id;
        }, 2000);

        return true;
    } catch (error) {
        console.error('Ошибка при отправке заказа:', error);
        showErrorNotification(`Ошибка при оформлении заказа: ${error.message}`);
        return false;
    }
}

// Обработчик отправки формы
document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Проверяем валидность комбо
            if (!validateComboBeforeSubmit()) {
                showErrorNotification('Состав заказа не соответствует ни одному из доступных комбо. Пожалуйста, выберите правильную комбинацию блюд.');
                return false;
            }

            // Создаем FormData из формы
            const formData = new FormData(this);

            // Отправляем заказ
            await submitOrder(formData);
        });
    }
});

