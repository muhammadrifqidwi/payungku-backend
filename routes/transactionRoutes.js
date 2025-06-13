const express = require("express");
const router = require("express").Router();
const trxCtrl = require("../controllers/transactionController");
const Transaction = require("../models/transaction");
const { verifyToken } = require("../middleware/auth");

router.post("/rent", verifyToken, trxCtrl.createTransaction);
router.post("/confirm", verifyToken, trxCtrl.confirmTransaction);
router.post("/return", verifyToken, trxCtrl.returnTransaction);
router.post("/get-snap-token", verifyToken, trxCtrl.getSnapToken);
router.post("/return/confirm", trxCtrl.confirmReturn);
router.post("/return/late", verifyToken, trxCtrl.handleLateReturnPayment);
router.post("/penalty", verifyToken, trxCtrl.payPenalty);

router.get("/return/validate/:token", trxCtrl.validateReturn);
router.get("/user", verifyToken, trxCtrl.getUserTransactions);
router.get("/:id", trxCtrl.getTransactionById);
router.delete("/:id", trxCtrl.deleteTransaction);

module.exports = router;
