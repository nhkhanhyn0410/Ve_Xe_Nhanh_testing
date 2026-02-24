const { I } = inject();

module.exports = {


  fields: {
    name: '//label[contains(.,"Họ và tên")]/ancestor::div[contains(@class,"ant-form-item")]//input',
    phone: '//label[contains(.,"Số điện thoại")]/ancestor::div[contains(@class,"ant-form-item")]//input',
    email: '//label[contains(.,"Email")]/ancestor::div[contains(@class,"ant-form-item")]//input',
    voucherCode: '//input[contains(@placeholder,"mã giảm giá")]',
  },

  buttons: {
    continuePayment: '//button[contains(.,"Tiếp tục thanh toán")]',
    applyVoucher: '//button[contains(.,"Áp dụng")]',
    confirmBooking: '//button[contains(.,"Xác nhận đặt vé")]',
    proceedPayment: '//button[contains(.,"Tiến hành thanh toán")]',
  },

  paymentMethods: {
    cash: '//div[contains(.,"Thanh toán khi lên xe") and contains(@class,"ant-card")]',
    vnpay: '//div[contains(.,"VNPay") and contains(@class,"ant-card")]',
  },

  messages: {
    holdSuccess: 'Giữ chỗ thành công',
    bookingSuccess: 'Đặt vé thành công',
  },

  waitForPageLoad() {
    I.waitForElement(this.fields.name, 15);
  },

  fillContactInfo(name, phone, email) {
    I.fillField(this.fields.name, name);
    I.fillField(this.fields.phone, phone);
    I.fillField(this.fields.email, email);
  },

  clickContinuePayment() {
    I.click(this.buttons.continuePayment);
    I.wait(5);
  },

  selectCashPayment() {
    I.waitForElement(this.paymentMethods.cash, 10);
    I.click(this.paymentMethods.cash);
    I.wait(1);
  },

  selectVNPayPayment() {
    I.waitForElement(this.paymentMethods.vnpay, 10);
    I.click(this.paymentMethods.vnpay);
    I.wait(1);
  },

  clickConfirmBooking() {
    I.click(this.buttons.confirmBooking);
    I.wait(5);
  },


  seePassengerForm() {
    I.see('Thông tin hành khách');
    I.seeElement(this.fields.name);
  },

  seePaymentStep() {
    I.see('Phương thức thanh toán');
  },

  seeHoldSuccess() {
    I.see(this.messages.holdSuccess);
  },

  seeBookingSuccess() {
    I.waitForText('thành công', 15);
  }
};
