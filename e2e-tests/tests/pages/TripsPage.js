const { I } = inject();

module.exports = {


  elements: {
    fromCityInput: '#fromCity',
    toCityInput: '#toCity',
    dateInput: '#date',
    searchButton: '//button[contains(.,"Tìm chuyến xe")]',
    selectTripButton: '//button[contains(.,"Chọn chuyến này")]',
    loadingSpinner: '.ant-spin-spinning',
  },

  _formatDate(date) {
    const d = date || new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  },

  open() {
    I.amOnPage('/trips');
    I.wait(3);
  },

  async searchTrip(from, to, date) {
    I.waitForElement(this.elements.fromCityInput, 15);
    I.click(this.elements.fromCityInput);
    I.fillField(this.elements.fromCityInput, from);
    I.wait(1);
    I.click(`//div[contains(@class,"ant-select-item-option") and contains(.,"${from}")]`);
    I.wait(0.5);

    I.click(this.elements.toCityInput);
    I.fillField(this.elements.toCityInput, to);
    I.wait(1);
    I.click(`//div[contains(@class,"ant-select-item-option") and contains(.,"${to}")]`);
    I.wait(0.5);


    const dateStr = date || this._formatDate(
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    );
    I.click(this.elements.dateInput);
    I.clearField(this.elements.dateInput);
    I.fillField(this.elements.dateInput, dateStr);
    I.pressKey('Escape');
    I.wait(0.5);
    I.click(this.elements.searchButton);
    I.wait(5);
  },

  waitForTripsLoaded() {
    I.waitForElement(this.elements.selectTripButton, 30);
  },

  selectFirstTrip() {
    I.waitForElement(this.elements.selectTripButton, 30);
    I.click(locate(this.elements.selectTripButton).first());
    I.wait(3);
  },

  seeSearchResults() {
    I.waitForElement(this.elements.selectTripButton, 30);
  },

  seeNoResults() {
    I.see('Không tìm thấy');
  }
};
