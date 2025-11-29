/**
 * Payment Gateway Configuration
 * Supports: VNPay, MoMo, ZaloPay
 */

const crypto = require('crypto');
const moment = require('moment-timezone');

// VNPay Configuration
const vnpayConfig = {
  tmnCode: process.env.VNPAY_TMN_CODE,
  hashSecret: process.env.VNPAY_HASH_SECRET,
  url: process.env.VNPAY_URL,
  returnUrl: process.env.VNPAY_RETURN_URL,
  version: '2.1.0',
  command: 'pay',
  currencyCode: 'VND',
  locale: 'vn',
};

// MoMo Configuration
const momoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,
  endpoint: process.env.MOMO_URL,
  returnUrl: process.env.MOMO_RETURN_URL,
  notifyUrl: process.env.MOMO_NOTIFY_URL,
  requestType: 'captureWallet',
};

// ZaloPay Configuration
const zaloPayConfig = {
  appId: process.env.ZALOPAY_APP_ID,
  key1: process.env.ZALOPAY_KEY1,
  key2: process.env.ZALOPAY_KEY2,
  endpoint: process.env.ZALOPAY_URL,
  callbackUrl: process.env.ZALOPAY_CALLBACK_URL,
};

/**
 * Sort object by key (for VNPay signature)
 * @param {object} obj - Object to sort
 * @returns {object} - Sorted object
 */
const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
};

/**
 * Create VNPay payment URL
 * @param {object} params - Payment parameters
 * @returns {string} - Payment URL
 */
const createVNPayUrl = (params) => {
  const { orderId, amount, orderInfo, ipAddr, bankCode = '' } = params;

  const date = new Date();
  const createDate = moment(date).tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');
  const expireDate = moment(date)
    .tz('Asia/Ho_Chi_Minh')
    .add(15, 'minutes')
    .format('YYYYMMDDHHmmss');

  let vnpParams = {
    vnp_Version: vnpayConfig.version,
    vnp_Command: vnpayConfig.command,
    vnp_TmnCode: vnpayConfig.tmnCode,
    vnp_Locale: vnpayConfig.locale,
    vnp_CurrCode: vnpayConfig.currencyCode,
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: amount * 100, // VNPay requires amount in smallest unit
    vnp_ReturnUrl: vnpayConfig.returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  if (bankCode) {
    vnpParams.vnp_BankCode = bankCode;
  }

  // Sort params and create signature
  vnpParams = sortObject(vnpParams);
  const signData = new URLSearchParams(vnpParams).toString();
  const hmac = crypto.createHmac('sha512', vnpayConfig.hashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnpParams.vnp_SecureHash = signed;

  // Create payment URL
  const paymentUrl = `${vnpayConfig.url}?${new URLSearchParams(vnpParams).toString()}`;
  return paymentUrl;
};

/**
 * Verify VNPay callback signature
 * @param {object} vnpParams - VNPay callback parameters
 * @returns {boolean} - True if signature is valid
 */
const verifyVNPaySignature = (vnpParams) => {
  const secureHash = vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHashType;

  const sorted = sortObject(vnpParams);
  const signData = new URLSearchParams(sorted).toString();
  const hmac = crypto.createHmac('sha512', vnpayConfig.hashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return secureHash === signed;
};

/**
 * Create MoMo payment request
 * @param {object} params - Payment parameters
 * @returns {object} - MoMo payment request
 */
const createMoMoPayment = (params) => {
  const { orderId, amount, orderInfo } = params;

  const requestId = orderId;
  const extraData = '';
  const { requestType } = momoConfig;

  const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${momoConfig.notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.returnUrl}&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto
    .createHmac('sha256', momoConfig.secretKey)
    .update(rawSignature)
    .digest('hex');

  return {
    partnerCode: momoConfig.partnerCode,
    accessKey: momoConfig.accessKey,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl: momoConfig.returnUrl,
    ipnUrl: momoConfig.notifyUrl,
    requestType,
    extraData,
    signature,
    lang: 'vi',
  };
};

/**
 * Create ZaloPay payment request
 * @param {object} params - Payment parameters
 * @returns {object} - ZaloPay payment request
 */
const createZaloPayPayment = (params) => {
  const { orderId, amount, orderInfo } = params;

  const embedData = {
    redirecturl: zaloPayConfig.callbackUrl,
  };

  const appTime = Date.now();

  const data = `${zaloPayConfig.appId}|${orderId}|${amount}|${orderInfo}|${appTime}|${JSON.stringify(embedData)}|`;
  const mac = crypto.createHmac('sha256', zaloPayConfig.key1).update(data).digest('hex');

  return {
    app_id: zaloPayConfig.appId,
    app_trans_id: `${moment().format('YYMMDD')}_${orderId}`,
    app_user: 'user123',
    app_time: appTime,
    amount,
    item: JSON.stringify([]),
    embed_data: JSON.stringify(embedData),
    description: orderInfo,
    bank_code: '',
    mac,
  };
};

module.exports = {
  vnpayConfig,
  momoConfig,
  zaloPayConfig,
  createVNPayUrl,
  verifyVNPaySignature,
  createMoMoPayment,
  createZaloPayPayment,
};
