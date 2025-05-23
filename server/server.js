require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const error = require('./middlewares/error');
const cors = require('cors');
const ErrorHandler = require('./utils/errorHandler');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');

const supportRoute = require('./routes/supportRoute');
const userRoute = require('./routes/userRoutes');
const commandeRoute = require('./routes/commandeRoutes');
const parametreRoute = require('./routes/ParameterRoutes');
const emailConfigRoutes = require('./routes/emailConfigRoutes');
const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL, // frontend URL
  credentials: true,
}));
app.options('*', cors());
app.use(helmet());
app.use(mongoSanitize());
app.set('trust proxy', 1); // for secure cookies behind a proxy
app.use(xss());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic route to render EJS template
app.get('/', (req, res) => {
  res.render('index', { message: 'Welcome to the Express app with EJS!' });
});

app.use('/api/v1/emails/', emailConfigRoutes);
app.use('/api/v1/supports/', supportRoute);

app.use('/api/v1/users/', userRoute);
app.use('/api/v1/commandes/', commandeRoute);
app.use('/api/v1/settings/', parametreRoute);


// Handle 404 errors for undefined routes
app.all('*', (req, res, next) => {
  next(new ErrorHandler(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Use custom error handler
app.use(error);

module.exports = app;
