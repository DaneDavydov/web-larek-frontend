import './scss/styles.scss';

import { AppAPI } from './components/AppAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { AppData } from './components/AppData';
import { Page } from './components/Page';
import { BasketItem, CatalogItem, DescriptionItem } from './components/Card';
import { OrderData, Contacts } from './components/OrderData';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Success } from './components/common/Succes';
import { IProduct, TOrderInfo } from './types';

const events = new EventEmitter();
const api = new AppAPI(CDN_URL, API_URL);

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

// Модель данных приложения
const appData = new AppData({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);

const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), {
  onClick: () => {
    modal.close();
  },
});

const order = new OrderData(cloneTemplate(orderTemplate), events, {
  onButtonCardClick: () => {
    appData.order.payment = 'card';
    order.switchPayment();
  },
  onButtonCashClick: () => {
    appData.order.payment = 'cash';
    order.switchPayment();
  },
});

// Изменились элементы каталога
events.on('items:changed', () => {
  page.catalog = appData.catalog.map((item) => {
    const card = new CatalogItem(cloneTemplate(cardCatalogTemplate), {
      onClick: () => events.emit('card:select', item),
    });
    return card.render({
      title: item.title,
      image: item.image,
      category: item.category,
      price: item.price,
    });
  });

  page.counter = appData.getCounter();
});

// Изменились элементы корзины
events.on('basket:changed', () => {
  page.counter = appData.getCounter();
  basket.setDisabled(basket.button, appData.getCounter() === 0);
});

// Открыть корзину
events.on('basket:open', () => {
  let basketCounter = 0;
  basket.setDisabled(basket.button, appData.getCounter() === 0);
  basket.items = appData.getBasketProducts().map((item) => {
    const card = new BasketItem(cloneTemplate(cardBasketTemplate), {
      onClick: () => {
        appData.toggleOrderedProduct(item.id, item.price);
        events.emit('basket:open');
      },
    });
    basketCounter++;
    card.setIndex(basketCounter);
    return card.render({
      title: item.title,
      price: item.price,
    });
  });
  modal.render({
    content: basket.render({
      total: appData.getTotal(),
    }),
  });
});

// Открыть карточку
events.on('card:select', (item: IProduct) => {
  appData.getProduct(item);
});

// Изменен открытый выбранный лот
events.on('preview:changed', (item: IProduct) => {
  const showItem = (item: IProduct) => {
    const card = new DescriptionItem(cloneTemplate(cardPreviewTemplate), {
      onClick: () => {
        appData.toggleOrderedProduct(item.id, item.price);
        card.toggleButtonText();
        modal.render({ content: card.render() });
      }
    });
    if (appData.isInBasket(item.id)) {
      card.toggleButtonText();
    }
    modal.render({
      content: card.render({
        title: item.title,
        category: item.category,
        image: item.image,
        description: item.description,
        price: item.price,
      }),
    });
  };

  if (item) {
    api.getProductItem(item.id)
      .then((result) => {
        item.description = result.description;
        showItem(item);
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    modal.close();
  }
});
// Открыть форму заказа
events.on('order:open', () => {
  appData.setOrderItems();
  appData.setOrderTotal();
  modal.render({
    content: order.render({
      address: '',
      valid: false,
      errors: [],
    }),
  });
});

// Изменилось одно из полей
events.on(/^order\..*:change/, (data: { field: keyof TOrderInfo; value: string }) => {
    appData.setOrderField(data.field, data.value);
});

events.on(/^contacts\..*:change/, (data: { field: keyof TOrderInfo; value: string }) => {
    appData.setOrderField(data.field, data.value);
});

// Изменилось состояние валидации формы
events.on('orderFormErrors:changed', (errors: Partial<TOrderInfo>) => {
  const { address } = errors;
  order.valid = !address;
  order.errors = Object.values({ address }).filter((i) => !!i).join('; ');
});
events.on('contactsFormErrors:changed', (errors: Partial<TOrderInfo>) => {
  const { email, phone } = errors;
  contacts.valid = !email && !phone;
  contacts.errors = Object.values({ email, phone }).filter((i) => !!i).join('; ');
});

// Отправить форму заказа
events.on('order:submit', () => {
  modal.render({
    content: contacts.render({
      email: '',
      phone: '',
      valid: false,
      errors: [],
    }),
  });
});

// Отправить форму контактов
events.on('contacts:submit', () => {
  api.orderLots(appData.order)
    .then((result) => {
      modal.render({
        content: success.render({
          total: result.total,
        }),
      });
      appData.clearBasket();
    })
    .catch((err) => {
      console.error(err);
    });``
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
  page.locked = true;
});

events.on('modal:close', () => {
  page.locked = false;
});

// Получаем карточки с сервера
api.getProductList()
  .then(appData.setCatalog.bind(appData))
  .catch((err) => {
    console.error(err);
  });