module.exports = function () {
  return actor({
    loginAsCustomer() {
      const user = require('./tests/data/users.json').customer.valid;
      this.amOnPage('/login');
      this.waitForElement('#customer-login_email', 10);
      this.fillField('#customer-login_email', user.email);
      this.fillField('#customer-login_password', user.password);
      this.click('button[type="submit"]');
      this.wait(3);
    },

    seeLoggedIn() {
      this.see('Tài khoản');
    }

  });
}
