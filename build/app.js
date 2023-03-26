"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const product_1 = __importDefault(require("./routes/product"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const payment_1 = __importDefault(require("./routes/payment"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// app declarations
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 8000;
const clientRoot = process.env.CLIENT_URL;
// application setup equipments
app.use((0, cors_1.default)({
    origin: [`${clientRoot}`],
    methods: 'GET, POST, PUT, DELETE',
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
// application routes
app.use('/auth', auth_1.default);
app.use('/products', product_1.default);
app.use('/user', user_1.default);
app.use('/payments', payment_1.default);
// running application
app.listen(port, () => console.log(`App listening at port ${port}`));
