const { I } = inject();

module.exports = {


  elements: {
    seatMap: '.seat-available, .seat-selected, .seat-booked',
    availableSeat: '.seat-available',
    selectedSeat: '.seat-selected',
    pickupPointCard: '//div[contains(@class,"ant-card") and .//span[text()="Điểm đón"]]//div[contains(@class,"cursor-pointer")]',
    dropoffPointCard: '//div[contains(@class,"ant-card") and .//span[text()="Điểm trả"]]//div[contains(@class,"cursor-pointer")]',
    continueButton: '//button[contains(.,"Tiếp tục")]',
    selectedSeatsDisplay: '//div[contains(.,"Ghế đã chọn")]',
    totalPrice: '//div[contains(.,"Tổng cộng")]',
    backButton: '//button[contains(.,"Quay lại")]',
    loadingSpinner: '.ant-spin',
  },

  waitForPageLoad() {
    I.waitForElement('body', 15);
    I.waitForInvisible('.ant-spin', 15);
    I.wait(2);
  },

  selectFirstAvailableSeat() {
    I.waitForElement(this.elements.availableSeat, 10);
    I.click(locate(this.elements.availableSeat).first());
    I.wait(1);
  },

  selectAvailableSeats(count) {
    I.waitForElement(this.elements.availableSeat, 10);
    for (let i = 0; i < count; i++) {
      I.click(locate(this.elements.availableSeat).first());
      I.wait(0.5);
    }
  },

  selectFirstPickupPoint() {
    I.waitForElement(this.elements.pickupPointCard, 10);
    I.click(locate(this.elements.pickupPointCard).first());
    I.wait(1);
  },

  selectFirstDropoffPoint() {
    I.waitForElement(this.elements.dropoffPointCard, 10);
    I.click(locate(this.elements.dropoffPointCard).first());
    I.wait(1);
  },

  clickContinue() {
    I.click(this.elements.continueButton);
    I.wait(3);
  },

  seeTripDetail() {
    I.see('Thông tin lộ trình');
  },

  seeSeatMap() {
    I.waitForElement(this.elements.availableSeat, 10);
  },

  seeSeatSelected() {
    I.seeElement(this.elements.selectedSeat);
  }
};
