process.env.testing = true;
const chai = require('chai');
const { expect } = require('chai');
const Publisher = require('../Publisher');
const Consumer = require('../Consumer');

describe('Wattage Tests', () => {
  beforeEach(() => {
    Publisher.Wattage.watts = 1;
    Publisher.Wattage.direction = 'increasing';
  })
  it('should return increasing wattage in the base case', () => {
    const wattageStorage = [];
    let prevWattage = 0;
    wattageStorage.push(Publisher.Wattage.getNewWattage());
    wattageStorage.push(Publisher.Wattage.getNewWattage());
    wattageStorage.push(Publisher.Wattage.getNewWattage());

    wattageStorage.forEach((watts) => {
      expect(watts).to.be.greaterThan(prevWattage);
      prevWattage = watts;
    });

  });

  it('should begin decreasing watts when over 9000', () => {
    Publisher.Wattage.watts = 8999.5;
    expect(Publisher.Wattage.direction).to.be.equal('increasing');
    Publisher.Wattage.getNewWattage();
    Publisher.Wattage.getNewWattage();
    Publisher.Wattage.getNewWattage();
    expect(Publisher.Wattage.direction).to.be.equal('decreasing');
  });

  it('should actually decrease wattage when direction is decreasing', () => {
    const wattageStorage = [];
    Publisher.Wattage.watts = 8000;
    Publisher.Wattage.direction = 'decreasing';
    let prevWattage = Publisher.Wattage.watts;
    wattageStorage.push(Publisher.Wattage.getNewWattage());
    wattageStorage.push(Publisher.Wattage.getNewWattage());
    wattageStorage.push(Publisher.Wattage.getNewWattage());

    wattageStorage.forEach((watts) => {
      expect(watts).to.be.lessThan(prevWattage);
      prevWattage = watts;
    })
  });
});

describe('Publisher tests', () => {
  it('should not error when trying to connect', (done) => {
    //process.env.queue could be set later to help with testing
    //future TODO
    let queue = process.env.queue || 'testing';
    let connectionString = 'amqp://snpucpee:R1WnRCPBTgCiV01-p_L1c0_lebJScn21@mosquito.rmq.cloudamqp.com/snpucpee';
    let result = Publisher.Publisher.connectToChannel(connectionString, queue);
    result.then((conn) => {
      expect(conn).to.exist;
      conn.close();
      done();
    }, (err) => {
      assert.fail(err);
      done();
    })
  })
})

describe('Consumer-PV Operations Tests', () => {
  it('should return values in the range 0-20', () => {
    for (let i = 150; i > 0; i--) {
      let value = Consumer.PVOperations.calculatePV();
      expect(value).to.be.greaterThan(0);
      expect(value).to.be.lessThan(20);
    }
  })

  it('should return the total output in kW/number format', () => {
    let pv = 18.40849;
    let meter = 538.345345;
    let total = Consumer.PVOperations.getTotalOutputInKilowatts(meter, pv);
    expect(total).to.be.a('number');
    expect(total).to.equal(0.56);
  })

  it('should return the correct format from the getOutput function', () => {
    //Format -
    //`Broker: ${broker} watts, PV: ${pv} watts, Broker/PV in kW: ${totalOutputKW}kW, timestamp: ${Date.now()} \n`
    let pv = 18.40849;
    let meter = 538.345345;
    let output = Consumer.PVOperations.getOutput(meter, pv);
    let brokerIndex = output.indexOf('Broker: 538.345345');
    let pvIndex = output.indexOf('PV: 18.40849');
    let kwIndex = output.indexOf('Broker/PV in kW: 0.56');
    expect(brokerIndex).to.be.greaterThan(-1);
    expect(pvIndex).to.be.greaterThan(-1);
    expect(kwIndex).to.be.greaterThan(-1);
  })
});

//additional tests needed for FileOperations and Consumer actions