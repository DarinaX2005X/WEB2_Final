const Transaction = require('../models/Transaction');

// POST /transaction — добавить транзакцию
exports.createTransaction = async (req, res) => {
  const { title, description, amount, type } = req.body;
  if (!title || !amount || !type) return res.redirect('/dashboard');
  try {
    const newTx = new Transaction({ user: req.user.id, title, description, amount, type });
    await newTx.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
};

// POST /transaction/edit/:id — редактировать транзакцию
exports.editTransaction = async (req, res) => {
  const { title, description, amount, type } = req.body;
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.redirect('/dashboard');
    if (tx.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.send('Access denied.');
    tx.title = title;
    tx.description = description;
    tx.amount = amount;
    tx.type = type;
    await tx.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
};

// POST /transaction/delete/:id — удалить транзакцию
exports.deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.redirect('/dashboard');
    if (tx.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.send('Access denied.');
    await Transaction.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
};
