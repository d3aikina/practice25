export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Repair Service API',
    version: '1.0.0',
    description:
      'API сервисного центра по ремонту техники.'
  },
  servers: [{ url: 'http://localhost:8080/api' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: { type: 'object', properties: { message: { type: 'string' } } },
      Credentials: {
        type: 'object',
        required: ['login', 'password'],
        properties: { login: { type: 'string' }, password: { type: 'string' } },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          role: { type: 'string', enum: ['Client', 'Manager', 'Master', 'Admin'] },
          login: { type: 'string', nullable: true },
          fullName: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true },
          hasCredentials: { type: 'boolean' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          clientId: { type: 'integer' },
          managerId: { type: 'integer', nullable: true },
          masterId: { type: 'integer', nullable: true },
          deviceInfo: { type: 'string' },
          defectDescription: { type: 'string' },
          status: {
            type: 'string',
            enum: [
              'Created',
              'Diagnostics',
              'AwaitingConfirmation',
              'AwaitingParts',
              'InProgress',
              'Cancelled',
              'AwaitingPickup',
              'Completed',
            ],
          },
          estimatedCost: { type: 'number', nullable: true },
          finalCost: { type: 'number', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Вход по логину и паролю',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Credentials' } } },
        },
        responses: {
          200: { description: 'JWT-токен и пользователь' },
          401: { description: 'Неверные данные', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/request-code': {
      post: {
        tags: ['Auth'],
        summary: 'Запрос кода по телефону (код возвращается в ответе — имитация СМС)',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['phone'], properties: { phone: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'Код отправлен (поле demoCode)' }, 404: { description: 'Не найден' } },
      },
    },
    '/auth/verify-code': {
      post: {
        tags: ['Auth'],
        summary: 'Подтверждение кода → JWT',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['phone', 'code'], properties: { phone: { type: 'string' }, code: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'JWT-токен и пользователь' }, 401: { description: 'Неверный код' } },
      },
    },
    '/auth/set-credentials': {
      post: {
        tags: ['Auth'],
        summary: 'Установка логина/пароля после входа по коду',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Credentials' } } },
        },
        responses: { 200: { description: 'Обновлённый пользователь' } },
      },
    },
    '/auth/me': {
      get: { tags: ['Auth'], summary: 'Текущий пользователь', responses: { 200: { description: 'User' } } },
    },
    '/users': {
      get: { tags: ['Users (Admin)'], summary: 'Список пользователей (?role=)', responses: { 200: { description: 'Массив User' } } },
      post: { tags: ['Users (Admin)'], summary: 'Создать пользователя', responses: { 201: { description: 'User' } } },
    },
    '/users/{id}': {
      patch: { tags: ['Users (Admin)'], summary: 'Изменить пользователя', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'User' } } },
      delete: { tags: ['Users (Admin)'], summary: 'Удалить пользователя', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Удалён' } } },
    },
    '/users/me': {
      patch: { tags: ['Users (Admin)'], summary: 'Редактировать свой профиль (любая роль)', responses: { 200: { description: 'User' } } },
    },
    '/clients': {
      get: { tags: ['Clients (Manager)'], summary: 'Поиск клиентов (?search=телефон|ФИО)', responses: { 200: { description: 'Массив клиентов' } } },
      post: { tags: ['Clients (Manager)'], summary: 'Создать клиента (без логина/пароля)', responses: { 201: { description: 'Клиент' } } },
    },
    '/services': {
      get: { tags: ['Services'], summary: 'Справочник услуг (все роли)', responses: { 200: { description: 'Массив услуг' } } },
      post: { tags: ['Services'], summary: 'Создать услугу (Admin)', responses: { 201: { description: 'Услуга' } } },
    },
    '/services/{id}': {
      patch: { tags: ['Services'], summary: 'Изменить услугу (Admin)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Услуга' } } },
      delete: { tags: ['Services'], summary: 'Удалить услугу (Admin)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Удалена' } } },
    },
    '/materials': {
      get: { tags: ['Materials'], summary: 'Склад/справочник материалов', responses: { 200: { description: 'Массив материалов' } } },
      post: { tags: ['Materials'], summary: 'Создать материал (Admin)', responses: { 201: { description: 'Материал' } } },
    },
    '/materials/{id}/stock': {
      patch: { tags: ['Materials'], summary: 'Приход на склад (Manager), body: {delta}', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Материал' } } },
    },
    '/orders': {
      get: { tags: ['Orders'], summary: 'Список заказов (по роли; ?status=)', responses: { 200: { description: 'Массив заказов' } } },
      post: { tags: ['Orders'], summary: 'Создать заказ (Manager)', responses: { 201: { description: 'Order' } } },
    },
    '/orders/free': {
      get: { tags: ['Orders'], summary: 'Свободные заказы для мастера', responses: { 200: { description: 'Массив заказов' } } },
    },
    '/orders/{id}': {
      get: { tags: ['Orders'], summary: 'Детали заказа', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Order с услугами/материалами' } } },
    },
    '/orders/{id}/take': {
      post: { tags: ['Orders'], summary: 'Мастер берёт заказ на диагностику', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Order' } } },
    },
    '/orders/{id}/estimate': {
      patch: { tags: ['Orders'], summary: 'Выставить смету (Manager) → Ожидает подтверждения', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Order' } } },
      get: { tags: ['Orders'], summary: 'Данные сметы для печати', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Order + totals' } } },
    },
    '/orders/{id}/confirm': {
      post: { tags: ['Orders'], summary: 'Клиент согласился → В работе', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Order' } } },
    },
    '/orders/{id}/reject': {
      post: { tags: ['Orders'], summary: 'Клиент отказался → Отменён', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Order' } } },
    },
    '/orders/{id}/ready': {
      post: { tags: ['Orders'], summary: 'Ремонт выполнен → Ожидает получения', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Order' } } },
    },
    '/orders/{id}/complete': {
      post: { tags: ['Orders'], summary: 'Завершить заказ (Manager), body: {finalCost}', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Order' } } },
    },
    '/orders/{orderId}/services': {
      post: { tags: ['Order Services'], summary: 'Добавить услугу в заказ (Master)', parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 201: { description: 'OrderService' } } },
    },
    '/order-services/{id}': {
      patch: { tags: ['Order Services'], summary: 'Обновить услугу (статус/цена/комментарий)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OrderService' } } },
      delete: { tags: ['Order Services'], summary: 'Удалить услугу из заказа', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Удалена' } } },
    },
    '/orders/{orderId}/materials': {
      post: { tags: ['Order Materials'], summary: 'Запланировать материал (Master)', parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 201: { description: 'OrderMaterial' } } },
    },
    '/order-materials/{id}': {
      patch: { tags: ['Order Materials'], summary: 'Указать использованное кол-во (списание склада)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OrderMaterial' } } },
      delete: { tags: ['Order Materials'], summary: 'Удалить материал из заказа', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Удалён' } } },
    },
    '/orders/{orderId}/material-requests': {
      post: { tags: ['Material Requests'], summary: 'Запросить недостающие материалы (Master)', parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 201: { description: 'MaterialRequest' } } },
    },
    '/material-requests': {
      get: { tags: ['Material Requests'], summary: 'Список заявок (Manager; ?status=)', responses: { 200: { description: 'Массив заявок' } } },
    },
    '/material-requests/{id}': {
      patch: { tags: ['Material Requests'], summary: 'Сменить статус заявки (Manager): Ordered/Received', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'MaterialRequest' } } },
    },
  },
};
