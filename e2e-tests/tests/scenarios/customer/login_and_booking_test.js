const users = require('../../data/users.json');

Before(({ I }) => {
  I.clearCookie();
});

Scenario('TC_BOOKING_001: Đăng nhập và đặt vé xe hoàn chỉnh (thanh toán tiền mặt)',
  async ({ I, loginPage, tripsPage, tripDetailPage, passengerInfoPage }) => {

    const customer = users.customer.valid;
    const route = users.booking.routes.default;
    const bookingDate = users.booking.daysFromNow;
    //
    loginPage.open();
    loginPage.seeLoginForm();
    loginPage.login(customer.email, customer.password);
    //
    I.wait(3);
    I.seeInCurrentUrl('/');
    //
    tripsPage.open();
    await tripsPage.searchTrip(route.from, route.to, bookingDate);
    // 
    tripsPage.waitForTripsLoaded();
    //
    tripsPage.selectFirstTrip();
    //
    tripDetailPage.waitForPageLoad();
    tripDetailPage.seeSeatMap();
    tripDetailPage.selectFirstAvailableSeat();
    tripDetailPage.seeSeatSelected();
    //
    tripDetailPage.selectFirstPickupPoint();
    tripDetailPage.selectFirstDropoffPoint();
    //
    tripDetailPage.clickContinue();
    //
    passengerInfoPage.waitForPageLoad();
    passengerInfoPage.fillContactInfo(
      customer.fullName,
      customer.phone,
      customer.email
    );
    passengerInfoPage.clickContinuePayment();
    passengerInfoPage.seePaymentStep();
    passengerInfoPage.selectCashPayment();
    passengerInfoPage.clickConfirmBooking();
    I.waitForText('thành công', 15);
    I.seeInCurrentUrl('/booking/success');
    I.saveScreenshot('TC_BOOKING_01_success.png');
  }
);
