const { I } = inject();

module.exports = {

  fields: {
    email: '#customer-login_email',
    password: '#customer-login_password'
  },

  buttons: {
    submit: 'button[type="submit"]',
    forgotPassword: '//a[contains(.,"Quên mật khẩu")]',
    register: '//a[contains(.,"Đăng ký")]'
  },

  messages: {
    error: '.ant-message-error',
    success: '.ant-message-success'
  },

  open() {
    I.amOnPage('/login');
    I.waitForElement(this.fields.email, 10);
  },

  fillEmail(email) {
    I.fillField(this.fields.email, email);
  },

  fillPassword(password) {
    I.fillField(this.fields.password, password);
  },

  clickSubmit() {
    I.click(this.buttons.submit);
  },

  login(email, password) {
    this.fillEmail(email);
    this.fillPassword(password);
    this.clickSubmit();
  },

  loginWithValidUser() {
    const user = require('../data/users.json').customer.valid;
    this.login(user.email, user.password);
  },

  seeLoginForm() {
    I.seeElement(this.fields.email);
    I.seeElement(this.fields.password);
    I.seeElement(this.buttons.submit);
  },

  seeLoginSuccess() {
    I.wait(3);
    I.seeInCurrentUrl('/');
  },

  seeLoginError(message) {
    I.wait(2);
    if (message) {
      I.see(message);
    }
  }
};
