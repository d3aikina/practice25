--
-- PostgreSQL database dump
--

\restrict VTgekv2hklfRsueDsiNlTsrEhoelypFJWj0FCweVUao3jz9ShF1WkMYVo6brB0H

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-06-24 11:33:45

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 874 (class 1247 OID 16836)
-- Name: MaterialRequestStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MaterialRequestStatus" AS ENUM (
    'Запрошено',
    'Заказано',
    'Получено'
);


ALTER TYPE public."MaterialRequestStatus" OWNER TO postgres;

--
-- TOC entry 871 (class 1247 OID 16830)
-- Name: OrderServiceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderServiceStatus" AS ENUM (
    'Запланировано',
    'Выполнено'
);


ALTER TYPE public."OrderServiceStatus" OWNER TO postgres;

--
-- TOC entry 868 (class 1247 OID 16812)
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'Создан',
    'Диагностика',
    'Ожидает подтверждения',
    'Ожидание запчастей',
    'В работе',
    'Отменен',
    'Ожидает получения',
    'Завершен'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- TOC entry 865 (class 1247 OID 16802)
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'Client',
    'Manager',
    'Master',
    'Admin'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 232 (class 1259 OID 16916)
-- Name: material_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_requests (
    id integer NOT NULL,
    order_id integer NOT NULL,
    master_id integer NOT NULL,
    material_id integer NOT NULL,
    quantity integer NOT NULL,
    status public."MaterialRequestStatus" DEFAULT 'Запрошено'::public."MaterialRequestStatus" NOT NULL,
    manager_id integer
);


ALTER TABLE public.material_requests OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16915)
-- Name: material_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.material_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.material_requests_id_seq OWNER TO postgres;

--
-- TOC entry 5009 (class 0 OID 0)
-- Dependencies: 231
-- Name: material_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.material_requests_id_seq OWNED BY public.material_requests.id;


--
-- TOC entry 224 (class 1259 OID 16866)
-- Name: materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materials (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    unit character varying(20),
    price numeric(10,2),
    stock integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.materials OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16865)
-- Name: materials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.materials_id_seq OWNER TO postgres;

--
-- TOC entry 5010 (class 0 OID 0)
-- Dependencies: 223
-- Name: materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.materials_id_seq OWNED BY public.materials.id;


--
-- TOC entry 230 (class 1259 OID 16906)
-- Name: order_materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_materials (
    id integer NOT NULL,
    order_id integer NOT NULL,
    material_id integer NOT NULL,
    quantity_planned integer,
    quantity_used integer
);


ALTER TABLE public.order_materials OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16905)
-- Name: order_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_materials_id_seq OWNER TO postgres;

--
-- TOC entry 5011 (class 0 OID 0)
-- Dependencies: 229
-- Name: order_materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_materials_id_seq OWNED BY public.order_materials.id;


--
-- TOC entry 228 (class 1259 OID 16892)
-- Name: order_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_services (
    id integer NOT NULL,
    order_id integer NOT NULL,
    service_id integer NOT NULL,
    status public."OrderServiceStatus" DEFAULT 'Запланировано'::public."OrderServiceStatus" NOT NULL,
    actual_price numeric(10,2),
    comment text
);


ALTER TABLE public.order_services OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16891)
-- Name: order_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_services_id_seq OWNER TO postgres;

--
-- TOC entry 5012 (class 0 OID 0)
-- Dependencies: 227
-- Name: order_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_services_id_seq OWNED BY public.order_services.id;


--
-- TOC entry 226 (class 1259 OID 16877)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    client_id integer NOT NULL,
    manager_id integer,
    master_id integer,
    device_info character varying(255),
    defect_description text,
    status public."OrderStatus" DEFAULT 'Создан'::public."OrderStatus" NOT NULL,
    estimated_cost numeric(10,2),
    final_cost numeric(10,2),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at timestamp(3) without time zone
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16876)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- TOC entry 5013 (class 0 OID 0)
-- Dependencies: 225
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 222 (class 1259 OID 16855)
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    base_price numeric(10,2),
    description text
);


ALTER TABLE public.services OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16854)
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- TOC entry 5014 (class 0 OID 0)
-- Dependencies: 221
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- TOC entry 220 (class 1259 OID 16844)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    role public."UserRole" NOT NULL,
    login character varying(50),
    password_hash character varying(255),
    full_name character varying(150),
    phone character varying(20),
    email character varying(100)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16843)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5015 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4807 (class 2604 OID 16919)
-- Name: material_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests ALTER COLUMN id SET DEFAULT nextval('public.material_requests_id_seq'::regclass);


--
-- TOC entry 4799 (class 2604 OID 16869)
-- Name: materials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials ALTER COLUMN id SET DEFAULT nextval('public.materials_id_seq'::regclass);


--
-- TOC entry 4806 (class 2604 OID 16909)
-- Name: order_materials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_materials ALTER COLUMN id SET DEFAULT nextval('public.order_materials_id_seq'::regclass);


--
-- TOC entry 4804 (class 2604 OID 16895)
-- Name: order_services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_services ALTER COLUMN id SET DEFAULT nextval('public.order_services_id_seq'::regclass);


--
-- TOC entry 4801 (class 2604 OID 16880)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 4798 (class 2604 OID 16858)
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- TOC entry 4797 (class 2604 OID 16847)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5003 (class 0 OID 16916)
-- Dependencies: 232
-- Data for Name: material_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4995 (class 0 OID 16866)
-- Dependencies: 224
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.materials VALUES (3, 'Винт самонарезающий 4x16 (полукруглая головка, для ТЭНов)', 'шт', 10.00, 200);
INSERT INTO public.materials VALUES (4, 'Высокотемпературный силиконовый герметик', 'г', 4.00, 85);
INSERT INTO public.materials VALUES (5, 'Смазка силиконовая для резиновых манжет', 'г', 10.00, 20);
INSERT INTO public.materials VALUES (6, 'Симистор BTA16-600B', 'шт', 100.00, 30);
INSERT INTO public.materials VALUES (7, 'Подшипник SKF 6205-2Z', 'шт', 900.00, 10);
INSERT INTO public.materials VALUES (9, 'УБЛ / Замок люка ST-16', 'шт', 900.00, 7);
INSERT INTO public.materials VALUES (10, 'Термостат Ranco K59-L1275', 'шт', 1000.00, 5);
INSERT INTO public.materials VALUES (11, 'Пусковое реле Danfoss 103N0011', 'шт', 1050.00, 4);
INSERT INTO public.materials VALUES (12, 'Магнетрон 2M214', 'шт', 2800.00, 3);
INSERT INTO public.materials VALUES (13, 'Предохранитель высоковольтный 0.7А 5кВ', 'шт', 250.00, 8);
INSERT INTO public.materials VALUES (14, 'Впускной клапан воды 2-катушечный', 'шт', 1300.00, 2);
INSERT INTO public.materials VALUES (15, 'Слюдяная пластина (рассеиватель)', 'шт', 150.00, 25);
INSERT INTO public.materials VALUES (8, 'Сливной насос Askoll COP 422 (3 контакта, для Samsung/LG/Indesit)', 'шт', 1500.00, 4);
INSERT INTO public.materials VALUES (1, 'Клеммная колодка 2-контактная (32А, шаг 5.08мм)', 'шт', 30.00, 9);
INSERT INTO public.materials VALUES (2, 'Термоусадочная трубка с клеевым слоем (d=3-10 мм)', 'см', 1.00, 292);


--
-- TOC entry 5001 (class 0 OID 16906)
-- Dependencies: 230
-- Data for Name: order_materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.order_materials VALUES (5, 2, 12, 1, NULL);
INSERT INTO public.order_materials VALUES (6, 2, 13, 1, NULL);
INSERT INTO public.order_materials VALUES (7, 2, 15, 1, NULL);
INSERT INTO public.order_materials VALUES (1, 1, 8, 1, 1);
INSERT INTO public.order_materials VALUES (2, 1, 1, 1, 1);
INSERT INTO public.order_materials VALUES (4, 1, 2, 10, 8);


--
-- TOC entry 4999 (class 0 OID 16892)
-- Dependencies: 228
-- Data for Name: order_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.order_services VALUES (3, 2, 1, 'Запланировано', 800.00, NULL);
INSERT INTO public.order_services VALUES (2, 1, 2, 'Выполнено', 1400.00, NULL);
INSERT INTO public.order_services VALUES (4, 2, 6, 'Выполнено', 1700.00, NULL);


--
-- TOC entry 4997 (class 0 OID 16877)
-- Dependencies: 226
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.orders VALUES (2, 5, 2, 6, 'Микроволновка Samsung', 'Шумит, искрит, не греет еду', 'Диагностика', NULL, NULL, '2026-06-22 22:11:00.161', NULL);
INSERT INTO public.orders VALUES (1, 4, 2, 3, 'Стиральная машина Samsung WW70J4210NW', 'Машина зависает на этапе слива воды, на дисплее горит ошибка 5Е', 'Завершен', 3740.00, 2938.00, '2026-06-22 21:08:43.103', '2026-06-22 22:18:39.516');


--
-- TOC entry 4993 (class 0 OID 16855)
-- Dependencies: 222
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.services VALUES (1, 'Диагностика устройства', 800.00, 'Визуальный осмотр, чтение кодов ошибок, прозвонка узлов мультиметром, проверка давления и протечек. Выявление точной причины поломки.');
INSERT INTO public.services VALUES (2, 'Замена сливного насоса', 1400.00, 'Снятие нижней панели или улитки, отсоединение проводки, замена помпы, проверка герметичности соединений и тестовый слив.');
INSERT INTO public.services VALUES (3, 'Замена ТЭНа', 1800.00, 'Слив остатков воды, демонтаж старого нагревателя, механическая очистка посадочного места от накипи, установка нового ТЭНа, проверка сопротивления.');
INSERT INTO public.services VALUES (4, 'Замена подшипников и сальника барабана', 4500.00, 'Сложный ремонт. Полная разборка бака (разъединение или распил), выпрессовка старых и запрессовка новых подшипников, замена сальника, сборка, балансировка и тест на отжиме.');
INSERT INTO public.services VALUES (5, 'Замена устройства блокировки люка', 1200.00, 'Демонтаж манжеты люка (или снятие передней панели), замена замка, проверка корректной работы блокировки и запуска программы.');
INSERT INTO public.services VALUES (6, 'Замена магнетрона и слюдяной пластины', 1700.00, 'Безопасная разрядка высоковольтного конденсатора, демонтаж магнетрона, замена прогоревшего рассеивателя (слюды), установка нового узла, тест на отсутствие искрения.');
INSERT INTO public.services VALUES (7, 'Замена мотор-компрессора', 6000.00, 'Удаление старого фреона, демонтаж компрессора, пайка новых трубок, замена фильтра-осушителя, вакуумирование системы, заправка хладагентом, опрессовка.');
INSERT INTO public.services VALUES (8, 'Замена термостата / датчика температуры', 1900.00, 'Разборка камеры, аккуратное снятие сильфонной трубки (если есть), замена механического или электронного датчика, калибровка, сборка.');
INSERT INTO public.services VALUES (9, 'Замена ТЭНа водонагревателя с профилактикой', 2400.00, 'Слив воды, снятие фланца, механическая и химическая очистка бака от накипи и грязи, замена магниевых анодов, установка нового ТЭНа, замена уплотнительных прокладок.');
INSERT INTO public.services VALUES (10, 'Компонентный ремонт модуля управления', 3500.00, 'Поиск сгоревших элементов (симисторы, реле, варисторы, диодные мосты), демонтаж, пайка новых деталей, восстановление дорожек, лакировка платы для защиты от влаги.');
INSERT INTO public.services VALUES (11, 'Устранение засора сливной/наливной системы', 1300.00, 'Прочистка фильтров, патрубков и помпы от мусора, монет, шерсти, жира. Разборка и промывка лотка для порошка. Проверка прохождения воды.');
INSERT INTO public.services VALUES (12, 'Замена уплотнительной резины', 1600.00, 'Удаление старого уплотнителя, тщательное обезжиривание паза, вклейка или установка на защелки нового контура, регулировка двери для плотного прилегания.');
INSERT INTO public.services VALUES (13, 'Профилактика и чистка от накипи/жира', 1700.00, 'Разборка узлов, доступ к которым не требуется при штатной эксплуатации');


--
-- TOC entry 4991 (class 0 OID 16844)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (1, 'Admin', 'admin', '$2a$10$lXsYcaK55mmoM.HpkFDif.x0.pMaTQaqXuZ62LRgFvvSifw1OPtD.', 'Администратор Системы', '+79000000001', 'admin@repair.local');
INSERT INTO public.users VALUES (2, 'Manager', 'manager', '$2a$10$d9eBlMrFWH7gBCxUe/nykOGPu96qPGmVu1r01zkzsJW.rTB6.jJlO', 'Иванов Иван (Менеджер)', '+79000000002', 'manager@repair.local');
INSERT INTO public.users VALUES (3, 'Master', 'master', '$2a$10$uNAYvqT3Nc9fD4gL445Zz.7hq73nJKM17B4E02Crimsc5nCB0ZtvS', 'Петров Пётр (Мастер)', '+79000000003', 'master@repair.local');
INSERT INTO public.users VALUES (4, 'Client', NULL, NULL, 'Сидорова Анна Петровна', '+79001112233', NULL);
INSERT INTO public.users VALUES (5, 'Client', NULL, NULL, 'Иванов Александр Петрович', '+79050000001', NULL);
INSERT INTO public.users VALUES (6, 'Master', 'master1', '$2a$10$1Y8bxtPJ7dwjxRSSZ/OmXOBOBwvtneX7Qb3hzL.BUULLzvV1fMArO', 'Сидоров Николай (Мастер)', '+79060000001', NULL);


--
-- TOC entry 5016 (class 0 OID 0)
-- Dependencies: 231
-- Name: material_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.material_requests_id_seq', 1, false);


--
-- TOC entry 5017 (class 0 OID 0)
-- Dependencies: 223
-- Name: materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materials_id_seq', 7, true);


--
-- TOC entry 5018 (class 0 OID 0)
-- Dependencies: 229
-- Name: order_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_materials_id_seq', 7, true);


--
-- TOC entry 5019 (class 0 OID 0)
-- Dependencies: 227
-- Name: order_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_services_id_seq', 4, true);


--
-- TOC entry 5020 (class 0 OID 0)
-- Dependencies: 225
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 2, true);


--
-- TOC entry 5021 (class 0 OID 0)
-- Dependencies: 221
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 7, true);


--
-- TOC entry 5022 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- TOC entry 4830 (class 2606 OID 16928)
-- Name: material_requests material_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests
    ADD CONSTRAINT material_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4815 (class 2606 OID 16875)
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id);


--
-- TOC entry 4827 (class 2606 OID 16914)
-- Name: order_materials order_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_materials
    ADD CONSTRAINT order_materials_pkey PRIMARY KEY (id);


--
-- TOC entry 4824 (class 2606 OID 16904)
-- Name: order_services order_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_services
    ADD CONSTRAINT order_services_pkey PRIMARY KEY (id);


--
-- TOC entry 4820 (class 2606 OID 16890)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4813 (class 2606 OID 16864)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- TOC entry 4811 (class 2606 OID 16853)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4828 (class 1259 OID 16936)
-- Name: material_requests_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX material_requests_order_id_idx ON public.material_requests USING btree (order_id);


--
-- TOC entry 4831 (class 1259 OID 16937)
-- Name: material_requests_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX material_requests_status_idx ON public.material_requests USING btree (status);


--
-- TOC entry 4825 (class 1259 OID 16935)
-- Name: order_materials_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_materials_order_id_idx ON public.order_materials USING btree (order_id);


--
-- TOC entry 4822 (class 1259 OID 16934)
-- Name: order_services_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_services_order_id_idx ON public.order_services USING btree (order_id);


--
-- TOC entry 4816 (class 1259 OID 16930)
-- Name: orders_client_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_client_id_idx ON public.orders USING btree (client_id);


--
-- TOC entry 4817 (class 1259 OID 16931)
-- Name: orders_manager_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_manager_id_idx ON public.orders USING btree (manager_id);


--
-- TOC entry 4818 (class 1259 OID 16932)
-- Name: orders_master_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_master_id_idx ON public.orders USING btree (master_id);


--
-- TOC entry 4821 (class 1259 OID 16933)
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- TOC entry 4809 (class 1259 OID 16929)
-- Name: users_login_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_login_key ON public.users USING btree (login);


--
-- TOC entry 4839 (class 2606 OID 16983)
-- Name: material_requests material_requests_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests
    ADD CONSTRAINT material_requests_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4840 (class 2606 OID 16978)
-- Name: material_requests material_requests_master_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests
    ADD CONSTRAINT material_requests_master_id_fkey FOREIGN KEY (master_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4841 (class 2606 OID 16988)
-- Name: material_requests material_requests_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests
    ADD CONSTRAINT material_requests_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4842 (class 2606 OID 16973)
-- Name: material_requests material_requests_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_requests
    ADD CONSTRAINT material_requests_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4837 (class 2606 OID 16968)
-- Name: order_materials order_materials_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_materials
    ADD CONSTRAINT order_materials_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4838 (class 2606 OID 16963)
-- Name: order_materials order_materials_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_materials
    ADD CONSTRAINT order_materials_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4835 (class 2606 OID 16953)
-- Name: order_services order_services_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_services
    ADD CONSTRAINT order_services_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4836 (class 2606 OID 16958)
-- Name: order_services order_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_services
    ADD CONSTRAINT order_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4832 (class 2606 OID 16938)
-- Name: orders orders_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4833 (class 2606 OID 16943)
-- Name: orders orders_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4834 (class 2606 OID 16948)
-- Name: orders orders_master_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_master_id_fkey FOREIGN KEY (master_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


-- Completed on 2026-06-24 11:33:45

--
-- PostgreSQL database dump complete
--

\unrestrict VTgekv2hklfRsueDsiNlTsrEhoelypFJWj0FCweVUao3jz9ShF1WkMYVo6brB0H

