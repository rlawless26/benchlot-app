const express = require('express');
const paymentsRouter = require('./payments');
const connectRouter = require('./connect');
const webhooksRouter = require('./webhooks');

const router = express.Router();

router.use('/payments', paymentsRouter);
router.use('/connect', connectRouter);
router.use('/webhooks', webhooksRouter);

module.exports = router;