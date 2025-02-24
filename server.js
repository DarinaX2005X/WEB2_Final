require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Transaction = require("./models/Transaction");
const methodOverride = require('method-override');
const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к MongoDB
connectDB();


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // This must come first
app.use(cookieParser());
app.use(methodOverride('_method'));  // After body parsers
app.use(express.static(path.join(__dirname, "public")));

// Установка EJS в качестве шаблонизатора
app.set("view engine", "ejs");

// Подключаем маршруты
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const userRoutes = require("./routes/userRoutes");

// Mount admin routes first
app.use("/admin", adminRoutes);
app.use("/", authRoutes);
app.use("/transaction", transactionRoutes);
app.use("/users", userRoutes);
// Страница index (главная)
app.get("/", (req, res) => {
  res.render("index");
});

// Dashboard — рендер EJS-дашборда
app.get("/dashboard", async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect("/login");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    let transactions;
    if (user.role === "admin") {
      transactions = await Transaction.find({}).sort({ date: -1 });
    } else {
      transactions = await Transaction.find({ user: user._id }).sort({
        date: -1,
      });
    }
    transactions = await Transaction.populate(transactions, { path: "user" });
    const totalIncome = transactions.reduce(
      (sum, tx) => (tx.type === "income" ? sum + tx.amount : sum),
      0
    );
    const totalExpense = transactions.reduce(
      (sum, tx) => (tx.type === "expense" ? sum + tx.amount : sum),
      0
    );
    const currentBalance = totalIncome - totalExpense;
    res.render("dashboard", {
      user,
      transactions,
      currentBalance,
      totalIncome,
      totalExpense,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/login");
  }
});

// Глобальный обработчик ошибок
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
