const { faker } = require('@faker-js/faker');

class DataGenerator {

  generateUser() {
    return {
      email: faker.internet.email().toLowerCase(),
      phone: '09' + faker.string.numeric(8),
      fullName: faker.person.fullName(),
      password: 'Test@' + faker.string.alphanumeric(8)
    };
  }

  generatePassenger() {
    return {
      fullName: faker.person.fullName(),
      phone: '09' + faker.string.numeric(8),
      email: faker.internet.email().toLowerCase(),
      idCard: faker.string.numeric(12)
    };
  }

  generateBooking() {
    return {
      passengers: [this.generatePassenger()],
      pickupPoint: 'Bến xe Lương Yên',
      dropoffPoint: 'Bến xe Đà Nẵng'
    };
  }
}

module.exports = new DataGenerator();
