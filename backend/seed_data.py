"""
Auto-generated seed script. DO NOT EDIT MANUALLY.
Re-generate by running: python generate_seed.py
Seeds the Render SQLite DB. Uses INSERT OR IGNORE - safe to run multiple times.
"""
import sqlite3
import os

DATABASE = os.path.join(os.path.dirname(__file__), "disteasy.db")


def seed():
    conn = sqlite3.connect(DATABASE)
    conn.execute("PRAGMA foreign_keys = OFF")
    cur = conn.cursor()
    inserted = {}

    # products: 41 rows
    products_data = [
        (1, 'Layina Dates 250g', 150.0, 97),
        (2, 'Layina Dates 500g (1+1)', 284.0, 95),
        (3, 'Lion Dates Syrup 500g', 206.0, 100),
        (4, 'Lion Choco Dates With Almond 150g', 100.0, 85),
        (5, 'Lion Datenuts Bites 120g', 150.0, 100),
        (6, 'Lion Datenuts Bites 200g', 250.0, 100),
        (7, 'Lion Datenuts Bites 240g', 300.0, 100),
        (8, 'Lion Datenuts Bites 280g', 350.0, 100),
        (9, 'Lion Datenuts Bites 368g (1+1)', 400.0, 100),
        (10, 'Lion Dates Powder 500 Jar', 324.0, 99),
        (11, 'Lion Dates Syrup 250g', 107.0, 100),
        (12, 'Lion Delicacy Dates Branch 500g', 354.0, 100),
        (13, 'Lion Delicacy Dates 250g', 154.0, 100),
        (14, 'Lion Deseeded Dates 500g R', 154.0, 100),
        (15, 'Lion Deseeded Dates 200g R', 62.0, 100),
        (16, 'Lion Deseeded Dates 250g Cup', 89.0, 100),
        (17, 'Lion Deseeded Dates Cup', 162.0, 100),
        (18, 'Lion Desert King Dates 500g Cup', 299.0, 100),
        (19, 'Lion Desert King Dates 250g R', 135.0, 100),
        (20, 'Lion Desert King Dates 500g R', 279.0, 100),
        (21, 'Lion Dry Dates 500g P', 186.0, 100),
        (22, 'Lion Grape Squash 700ml', 172.0, 100),
        (23, 'Lion Healthmix 250g (1+1)', 153.0, 100),
        (24, 'Lion Honey 100g', 60.0, 100),
        (25, 'Lion Honey 18g', 10.0, 100),
        (26, 'Lion Honey 1kg SUPER SAVER', 560.0, 97),
        (27, 'Lion Honey 250g (1+1)', 160.0, 100),
        (28, 'Lion Honey 400g (1+1)', 270.0, 100),
        (29, 'Lion Honey 50g', 38.0, 100),
        (30, 'Lion Kalmi Dates 400g R', 280.0, 100),
        (31, 'Lion Kimjo Dates 500g', 240.0, 100),
        (32, 'Lion Mixed Fruit Squash 700ml', 165.0, 100),
        (33, 'Lion Mixed Fruit Jam 125g', 25.0, 100),
        (34, 'Lion Mixed Fruit Jam 250g (1+1)', 116.0, 100),
        (35, 'Lion Mixed Fruit Jam 500g (1+1)', 210.0, 100),
        (36, 'Lion Muesli 250g', 124.0, 100),
        (37, 'Lion Oats 200g R', 50.0, 100),
        (38, 'Lion Orange Squash 700ml', 192.0, 100),
        (39, 'Lion Rose Sharabath 700ml', 144.0, 100),
        (40, 'Lion Sulthan Dates 250g (1+1)', 112.0, 100),
        (41, 'Lion Sulthan Dates 500g (1+1)', 215.0, 100),
    ]
    cur.executemany(
        'INSERT OR IGNORE INTO products (id, name, price, stock) VALUES (?, ?, ?, ?)',
        products_data
    )
    inserted['products'] = cur.rowcount

    # customers: 226 rows
    customers_data = [
        (1, '\ufeff1962 BANGALORE BAKERY SWEETS', None, None, None, None, 0.0, None),
        (2, 'Abhivruddi Dry Fruits house(old)', None, None, None, None, 0.0, None),
        (3, 'ADITHYA MART', None, None, None, None, 14999.0, None),
        (4, 'ALURU ENTERPRISES bypass', None, None, None, None, 0.0, None),
        (5, 'AMARAVATHI HOME FOODS', None, None, None, None, 0.0, None),
        (6, 'AMRUTHA HYPER MART', None, None, None, None, 0.0, None),
        (7, 'ASHA PURA GENERAL STORES OLD TOWN', None, None, None, None, 0.0, None),
        (8, 'ASHOK PATEL GENERAL STORES', None, None, None, None, 0.0, None),
        (9, 'AVENUESUPERMARTS LTD', None, None, None, None, 0.0, None),
        (10, 'AVENUESUPERMARTS LTD  2', None, None, None, None, 0.0, None),
        (11, 'B B BANGALORE BAKERY   bullary road', None, None, None, None, 0.0, None),
        (12, 'B B BANGLORE BAKERY', None, None, None, None, 0.0, None),
        (13, 'B SUBRAMANYAM OLD TOWN', None, None, None, None, 0.0, None),
        (14, 'BABU PUJA STORES P.W.C', None, None, None, None, 0.0, None),
        (15, 'BADHRI PWC', None, None, None, None, 0.0, None),
        (16, 'Bangalore Ayangar Bakery', None, None, None, None, 0.0, None),
        (17, 'BANGALORE BAKERY S B ROAD', None, None, None, None, 0.0, None),
        (18, 'Bangalore Bred Bakery', None, None, None, None, 0.0, None),
        (19, 'Baskar Reddy Dmvm', None, None, None, None, 0.0, None),
        (20, 'BHAVANI FOODS', None, None, None, None, 0.0, None),
        (21, 'BHUCHAIAH SWEETS', None, None, None, None, 0.0, None),
        (22, 'BHUCHAIAH SWEETS SAPTHAGIRI CIRCLE', None, None, None, None, 0.0, None),
        (23, 'BHUVAN KUMAR AGENCIES', None, None, None, None, 0.0, None),
        (24, 'BUCHAIAH SWEET CORNER', None, None, None, None, 0.0, None),
        (25, 'CAKE MAGIC', None, None, None, None, 0.0, None),
        (26, 'CHAITHANYA TRADERS', None, None, None, None, 0.0, None),
        (27, 'Chandana Traders', None, None, None, None, 0.0, None),
        (28, 'City Bakery gooty road', None, None, None, None, 0.0, None),
        (29, 'CRAJY SUPER MART', None, None, None, None, 0.0, None),
        (30, 'D K ENTERPRISES (PAVITHRA H/M)', None, None, None, None, 0.0, None),
        (31, 'Daimand  Super Market', None, None, None, None, 0.0, None),
        (32, 'Damage', None, None, None, None, 0.0, None),
        (33, 'DEVI SRI BAKERY', None, None, None, None, 0.0, None),
        (34, 'EAT NATURALS', None, None, None, None, 0.0, None),
        (35, 'FARMERS MART', None, None, None, None, 0.0, None),
        (36, 'FARMERS MART 2', None, None, None, None, 0.0, None),
        (37, 'FRUIT SHOP', None, None, None, None, 0.0, None),
        (38, 'G G MEDICAL', None, None, None, None, 0.0, None),
        (39, 'GAMPAMALA G/S G BAZAR', None, None, None, None, 0.0, None),
        (40, 'GATIKA CHALAM', None, None, None, None, 0.0, None),
        (41, 'GOVARDHAN G/S', None, None, None, None, 0.0, None),
        (42, 'GURU RAGAVENDRA P/S  OLD TOWN', None, None, None, None, 0.0, None),
        (43, 'HANUMAN G/S 1 ST ROAD', None, None, None, None, 0.0, None),
        (44, 'Hanuman Pooja Stores', None, None, None, None, 0.0, None),
        (45, 'Hareesh Bakery Bullary Road', None, None, None, None, 0.0, None),
        (46, 'Hari Prasad', None, None, None, None, 0.0, None),
        (47, 'HARISH BAKERY', None, None, None, None, 0.0, None),
        (48, 'HINGLAJ KIRANA', None, None, None, None, 0.0, None),
        (49, 'INDIAN STORES', None, None, None, None, 0.0, None),
        (50, 'ISKCON', None, None, None, None, 0.0, None),
        (51, 'Jai Mahadev Masala Stores', None, None, None, None, 0.0, None),
        (52, 'JAI THEJ GENARAL', None, None, None, None, 0.0, None),
        (53, 'JAKEER GENERAL STORES', None, None, None, None, 0.0, None),
        (54, 'JANATHA M/S', None, None, None, None, 0.0, None),
        (55, 'Jaya Narayana G/s', None, None, None, None, 0.0, None),
        (56, 'JOSHNA  GENERAL STORE', None, None, None, None, 0.0, None),
        (57, 'K G N Bakery', None, None, None, None, 0.0, None),
        (58, 'K K  gift & noveltes', None, None, None, None, 0.0, None),
        (59, 'K RAMANJANEYULU G BAZAR', None, None, None, None, 0.0, None),
        (60, 'KAMAL  FANCY STORES KAMALA NAGAR', None, None, None, None, 0.0, None),
        (61, 'KAMAL KIRANA THILAK ROAD', None, None, None, None, 0.0, None),
        (62, 'KAREEM  GENERAL STORE', None, None, None, None, 0.0, None),
        (63, 'Kavitha Trading', None, None, None, None, 0.0, None),
        (64, 'KESHAVA  M/S', None, None, None, None, 0.0, None),
        (65, 'KETHANA PRIYA FOOD PRODUCT', None, None, None, None, 0.0, None),
        (66, 'KNC CAKE HOUSE', None, None, None, None, 0.0, None),
        (67, 'KRISHNA MEDICAL', None, None, None, None, 0.0, None),
        (68, 'KUMBA  MART', None, None, None, None, 0.0, None),
        (69, 'KUMBA  MART (OLD)', None, None, None, None, 0.0, None),
        (70, 'L J BL BAKERY RTC', None, None, None, None, 0.0, None),
        (71, 'LAKSHMI KIRANA OLD TOWN', None, None, None, None, 0.0, None),
        (72, 'LAKSHMI MEDICAL', None, None, None, None, 0.0, None),
        (73, 'Lalithambika Pathanjali Stores', None, None, None, None, 0.0, None),
        (74, 'LINGAREDDY G/S', None, None, None, None, 0.0, None),
        (75, 'M KRISHNAMOORTHY', None, None, None, None, 0.0, None),
        (76, 'M M Ali G/s', None, None, None, None, 0.0, None),
        (77, 'M R THAJA MART', None, None, None, None, 0.0, None),
        (78, 'M S R NATURALS', None, None, None, None, 0.0, None),
        (79, 'M.M.ALI STORES', None, None, None, None, 0.0, None),
        (80, 'M.T.R G BAZAR', None, None, None, None, 0.0, None),
        (81, 'M.T.R. PROVISIONAL STORES', None, None, None, None, 0.0, None),
        (82, 'MAA METRO STORES', None, None, None, None, 0.0, None),
        (83, 'MAA METRO STORES 2', None, None, None, None, 0.0, None),
        (84, 'Madhuram Home Foods', None, None, None, None, 0.0, None),
        (85, 'MAHADEV GENERAL STORES', None, None, None, None, 0.0, None),
        (86, 'MAHALAKSHMI PUJA STORES', None, None, None, None, 0.0, None),
        (87, 'MAharaja  trading', None, None, None, None, 0.0, None),
        (88, 'MAHESH TRADERS', None, None, None, None, 0.0, None),
        (89, 'Mallikarjuna Milk Dairy', None, None, None, None, 0.0, None),
        (90, 'MANIKHANTA SUPER STORES', None, None, None, None, 0.0, None),
        (91, 'Maruthi Bakery KLD', None, None, None, None, 0.0, None),
        (92, 'MARUTHI BAKERY THAPOVANAM', None, None, None, None, 0.0, None),
        (93, 'MARUTHI GENERAL STORES', None, None, None, None, 0.0, None),
        (94, 'MOURYA SUPER MART', None, None, None, None, 0.0, None),
        (95, 'MURAGAN GENERAL STORES', None, None, None, None, 0.0, None),
        (96, 'MUTHU GENERAL  G BAZAR', None, None, None, None, 0.0, None),
        (97, 'MY VAJRA HYPER MART', None, None, None, None, 0.0, None),
        (98, 'NEW CITY BAKERY  BUSTAND', None, None, None, None, 0.0, None),
        (99, 'NEW KAMAL COSMETICS', None, None, None, None, 0.0, None),
        (100, 'NISARGH MILLETS', None, None, None, None, 0.0, None),
        (101, 'OMKAR BANGALORE BAKERY', None, None, None, None, 0.0, None),
        (102, 'Orion Mart', None, None, None, None, 0.0, None),
        (103, 'P.G.R G/S', None, None, None, None, 0.0, None),
        (104, 'Padma Enterprises', None, None, None, None, 0.0, None),
        (105, 'PADMAVATHI G/S', None, None, None, None, 0.0, None),
        (106, 'PADUCHUR SWEETS', None, None, None, None, 0.0, None),
        (107, 'PASUPALA SUPER STORES', None, None, None, None, 0.0, None),
        (108, 'PASUPALA SUPER STORES RAM NAGAR', None, None, None, None, 0.0, None),
        (109, 'PATHANJALI STORES', None, None, None, None, 0.0, None),
        (110, 'Pathanjali Stores Court Road', None, None, None, None, 0.0, None),
        (111, 'Pavan Fruit Shop', None, None, None, None, 0.0, None),
        (112, 'Pavan Stores', None, None, None, None, 0.0, None),
        (113, 'PRAMOD SWAGRUHA SWEETS', None, None, None, None, 0.0, None),
        (114, 'PRASAD', None, None, None, None, 0.0, None),
        (115, 'PRASANTHI HYPER MART', None, None, None, None, 0.0, None),
        (116, 'R P SHOPPEE', None, None, None, None, 0.0, None),
        (117, 'R R BANGALORE BAKERY', None, None, None, None, 0.0, None),
        (118, 'R.K. MILK DAIRY', None, None, None, None, 0.0, None),
        (119, 'RADHA RAMANI STORES', None, None, None, None, 0.0, None),
        (120, 'RAGHAVENDRA', None, None, None, None, 0.0, None),
        (121, 'RAGHU PWC', None, None, None, None, 0.0, None),
        (122, 'RAJA RAVI G/S', None, None, None, None, 0.0, None),
        (123, 'RAMA CHITAMBER TRADERS', None, None, None, None, 0.0, None),
        (124, 'RAMDEV KIRANA', None, None, None, None, 0.0, None),
        (125, 'RANGANATHA GNARAL', None, None, None, None, 0.0, None),
        (126, 'RAYAL BAKERY', None, None, None, None, 0.0, None),
        (127, 'Renuka Genaral Stores', None, None, None, None, 0.0, None),
        (128, 'RUPA M/S', None, None, None, None, 0.0, None),
        (129, 'S L V Ayangar B L Bekary  S D', None, None, None, None, 0.0, None),
        (130, 'S L V ayangar bakery BKS', None, None, None, None, 0.0, None),
        (131, 'S S BANGALORE BAKERY', None, None, None, None, 0.0, None),
        (132, 'S.L.V  AYANGAR BAKERY', None, None, None, None, 0.0, None),
        (133, 'S.L.V  ayangar bakery  KLD', None, None, None, None, 0.0, None),
        (134, 'S.L.V GENERAL   KLD  ROAD', None, None, None, None, 0.0, None),
        (135, 'S.L.V GENERAL   thilak road', None, None, None, None, 0.0, None),
        (136, 'S.P. SUPER STORES', None, None, None, None, 0.0, None),
        (137, 'S.P. SUPER STORES  Ram nagar', None, None, None, None, 0.0, None),
        (138, 'Safa Book Stoll', None, None, None, None, 0.0, None),
        (139, 'SAHASRA ORGANIC STORES', None, None, None, None, 0.0, None),
        (140, 'SAI GOKUL SUPER BAZAR', None, None, None, None, 0.0, None),
        (141, 'SAI GOKUL SUPER BAZAR ( OLD)', None, None, None, None, 0.0, None),
        (142, 'SAI HARIKA SUPER MARKET', None, None, None, None, 0.0, None),
        (143, 'Sai Harshitha Medical', None, None, None, None, 0.0, None),
        (144, 'SAI NAGENDRA G/S P.W.C', None, None, None, None, 0.0, None),
        (145, 'Sai Vasthalya Medical', None, None, None, None, 0.0, None),
        (146, 'SAPTHAGIRI P/s STORE', None, None, None, None, 0.0, None),
        (147, 'SARATH KUMAR K NAGAR', None, None, None, None, 0.0, None),
        (148, 'Saravana Super Market', None, None, None, None, 0.0, None),
        (149, 'SASIDHAR ENTERPRISES  vidyuth nagar', None, None, None, None, 0.0, None),
        (150, 'SASIDHAR ENTERPRISES (JNTU)', None, None, None, None, 0.0, None),
        (151, 'SATHYANARAYANA G/S PWC', None, None, None, None, 0.0, None),
        (152, 'SATHYANARAYANA G/S ram nagar', None, None, None, None, 0.0, None),
        (153, 'SETHU  GENERAL STORES', None, None, None, None, 0.0, None),
        (154, 'SHABARI MALLAI PUJA STORES', None, None, None, None, 0.0, None),
        (155, 'SHANTHARAM RTO', None, None, None, None, 0.0, None),
        (156, 'SHIRDI SAI RAMNAGAR', None, None, None, None, 0.0, None),
        (157, 'Shiridi Sai  Sweets Bakers & Caterers', None, None, None, None, 0.0, None),
        (158, 'Shiva Sainath Medical jntu', None, None, None, None, 0.0, None),
        (159, 'SIDDARTH BAKERY', None, None, None, None, 0.0, None),
        (160, 'Siddi Vinayaka Medical', None, None, None, None, 0.0, None),
        (161, 'SIVA SAI TRADERS THILAK ROAD', None, None, None, None, 0.0, None),
        (162, 'SIVA SAINATH  MEDICAL STORE', None, None, None, None, 0.0, None),
        (163, 'SIVA SAKTHI  genaral stores', None, None, None, None, 0.0, None),
        (164, 'SKANDAN SUPERMARTS LLP', None, None, None, None, 0.0, None),
        (165, 'SLN BAKERY SAI NAGAR', None, None, None, None, 0.0, None),
        (166, 'SLV Supermart JNTU', None, None, None, None, 0.0, None),
        (167, 'SOMESWARA TRADERS', None, None, None, None, 0.0, None),
        (168, 'Sree Patel Chocolate Home', None, None, None, None, 0.0, None),
        (169, 'SREE SREE SETTY KONDAIAH KIRANA SHOP', None, None, None, None, 0.0, None),
        (170, 'SREE VIJAYADURGA MEDICAL AND GENARAL', None, None, None, None, 0.0, None),
        (171, 'SREE VISHNU SAAI SUPER MART', None, None, None, None, 0.0, None),
        (172, 'Sreenivasa  kirana & Genaral Stores', None, None, None, None, 0.0, None),
        (173, 'SRI  Lakshmi Venkatasai  G/S', None, None, None, None, 0.0, None),
        (174, 'SRI ANANTHALAKSHMI TRADERS', None, None, None, None, 0.0, None),
        (175, 'Sri Krishna Traders', None, None, None, None, 0.0, None),
        (176, 'SRI LAKSHMI BALAJI GENERAL STORES', None, None, None, None, 0.0, None),
        (177, 'Sri Lakshmi Bangalore Bakery', None, None, None, None, 0.0, None),
        (178, 'Sri Lakshmi Narasimha A1 Super Market', None, None, None, None, 0.0, None),
        (179, 'Sri Lakshmi Narasimha Millets', None, None, None, None, 0.0, None),
        (180, 'Sri Raghavendra  bl bakery', None, None, None, None, 0.0, None),
        (181, 'SRI RAJA RAM  KIRANA STORES', None, None, None, None, 0.0, None),
        (182, 'SRI RAMA GENARAL STORES', None, None, None, None, 0.0, None),
        (183, 'SRI RAMA GENERAL', None, None, None, None, 0.0, None),
        (184, 'Sri Sai Dhanvanthari Medical', None, None, None, None, 0.0, None),
        (185, 'SRI SAI G/S THILAK ROAD', None, None, None, None, 0.0, None),
        (186, 'SRI SAI GENARAL', None, None, None, None, 0.0, None),
        (187, 'SRI SAI HANUMAN G/S TDP', None, None, None, None, 0.0, None),
        (188, 'SRI SAI HARSHITHA MEDICAL STORE', None, None, None, None, 0.0, None),
        (189, 'SRI SAI PAVAN AGENCIES', None, None, None, None, 0.0, None),
        (190, 'Sri Sai Vatsalya Medical', None, None, None, None, 0.0, None),
        (191, 'Sri Shanmukha Traders', None, None, None, None, 0.0, None),
        (192, 'SRI TS MART', None, None, None, None, 0.0, None),
        (193, 'SRI V SUPER MART', None, None, None, None, 0.0, None),
        (194, 'SRI V.VENKATA NARAYANA', None, None, None, None, 0.0, None),
        (195, 'Sri Valli Xerox', None, None, None, None, 0.0, None),
        (196, 'SRI VANI GENERAL STORES', None, None, None, None, 0.0, None),
        (197, 'Sri Venkateswara Super Mart', None, None, None, None, 0.0, None),
        (198, 'SRI VINAYAKA SUPER MARKET', None, None, None, None, 0.0, None),
        (199, 'SRI VINAYAKA SUPER MARKET( old)', None, None, None, None, 0.0, None),
        (200, 'SRI VISWASAI TRADERS', None, None, None, None, 0.0, None),
        (201, 'SUJATHA HYPER MART', None, None, None, None, 0.0, None),
        (202, 'SULTHAN BAKERY', None, None, None, None, 0.0, None),
        (203, 'Supraja Dry Fruits Shop', None, None, None, None, 0.0, None),
        (204, 'Supraja General Stores', None, None, None, None, 0.0, None),
        (205, 'SURYA SUPER MARKET', None, None, None, None, 0.0, None),
        (206, 'SWAGRUHA FOODS RAJU ROAD', None, None, None, None, 0.0, None),
        (207, 'SWATHI HERBLE', None, None, None, None, 0.0, None),
        (208, 'T  Manthra', None, None, None, None, 0.0, None),
        (209, 'T M R SUPER MART', None, None, None, None, 0.0, None),
        (210, 'THANVIKA SUPER MARKET', None, None, None, None, 0.0, None),
        (211, 'UDAYAGIRI PROVISIONS', None, None, None, None, 0.0, None),
        (212, 'UNIVERSAL BAKERY', None, None, None, None, 0.0, None),
        (213, 'V S R HEALTHY DRY FRUITS', None, None, None, None, 0.0, None),
        (214, 'V SREENIVASA MOORTHY', None, None, None, None, 0.0, None),
        (215, 'VARAHI  SWEETS & BAKERS', None, None, None, None, 0.0, None),
        (216, 'VARAHI BAKERY', None, None, None, None, 0.0, None),
        (217, 'VIKRAM TRADERS', None, None, None, None, 0.0, None),
        (218, 'VILLAGE  SUPER STORES', None, None, None, None, 0.0, None),
        (219, 'VILLAGE SUPER MARKET', None, None, None, None, 0.0, None),
        (220, 'Vinayaka (mahesh)', None, None, None, None, 0.0, None),
        (221, 'Vishnu Home Foods', None, None, None, None, 0.0, None),
        (222, 'VISWA SAI G/S ASHOK NAGAR', None, None, None, None, 0.0, None),
        (223, 'VIYANSHI FAMILY MART', None, None, None, None, 0.0, None),
        (224, 'VRM ENTERPRISES', None, None, None, None, 0.0, None),
        (225, 'YALAKANTI SWAGRUHA FOODS', None, None, None, None, 0.0, None),
        (226, 'ZAHEER AGENCIES', None, None, None, None, 0.0, None),
    ]
    cur.executemany(
        'INSERT OR IGNORE INTO customers (id, shop_name, owner, phone, address, route, balance, last_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        customers_data
    )
    inserted['customers'] = cur.rowcount

    # orders: 3 rows
    orders_data = [
        (1, 1, '2026-07-27 21:21:25', 1870.0, 'Credit'),
        (2, 3, '2026-07-27 21:30:31', 1500.0, 'Credit'),
        (3, 20, '2026-07-28 22:37:52', 2004.0, 'Credit'),
    ]
    cur.executemany(
        'INSERT OR IGNORE INTO orders (id, customer_id, order_date, total_amount, payment_type) VALUES (?, ?, ?, ?, ?)',
        orders_data
    )
    inserted['orders'] = cur.rowcount

    # order_items: 5 rows
    order_items_data = [
        (1, 1, 1, 3, 150.0),
        (2, 1, 2, 5, 284.0),
        (3, 2, 4, 15, 100.0),
        (4, 3, 26, 3, 560.0),
        (5, 3, 10, 1, 324.0),
    ]
    cur.executemany(
        'INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
        order_items_data
    )
    inserted['order_items'] = cur.rowcount

    # payments: 2 rows
    payments_data = [
        (2, 95, 24999.0, 'UPI', '2026-07-28', '', None, '2026-07-28 21:56:08'),
        (3, 20, 3000.0, 'Cash', '2026-07-28', '', None, '2026-07-28 22:39:35'),
    ]
    cur.executemany(
        'INSERT OR IGNORE INTO payments (id, customer_id, amount, payment_method, payment_date, notes, order_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        payments_data
    )
    inserted['payments'] = cur.rowcount

    # delivery: 2 rows
    delivery_data = [
        (1, 1, 1, 'Pending', None, None, '', '', '', '2026-07-27 21:21:25'),
        (2, 2, 3, 'Pending', None, None, '', '', '', '2026-07-27 21:30:31'),
    ]
    cur.executemany(
        'INSERT OR IGNORE INTO delivery (id, order_id, customer_id, status, delivery_date, actual_delivery_date, driver_name, route, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        delivery_data
    )
    inserted['delivery'] = cur.rowcount

    # company_settings: 6 rows
    company_settings_data = [
        ('company_name', 'DistEasy Distributors'),
        ('phone', ''),
        ('email', ''),
        ('address', ''),
        ('gst_number', ''),
        ('theme', 'light'),
    ]
    cur.executemany(
        'INSERT OR IGNORE INTO company_settings (key, value) VALUES (?, ?)',
        company_settings_data
    )
    inserted['company_settings'] = cur.rowcount

    conn.execute("PRAGMA foreign_keys = ON")
    conn.commit()
    conn.close()
    for tbl, cnt in inserted.items():
        print(f"  {tbl}: {cnt} rows inserted")
    print("Seed complete.")


if __name__ == "__main__":
    seed()