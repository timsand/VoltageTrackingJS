const amqp = require('amqplib/callback_api');
const fs = require('fs');
const connectionString = process.env.connectionString || 'amqp://snpucpee:R1WnRCPBTgCiV01-p_L1c0_lebJScn21@mosquito.rmq.cloudamqp.com/snpucpee';

const Consumer = {
  connect: (connectionString, queue) => {
    amqp.connect(connectionString, (err, connection) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        connection.createChannel((err, channel) => {
          if (err) {
            console.log(err);
            throw (err);
          } else {
            channel.assertQueue(queue, {
              durable: false
            })
            console.log("Waiting for messages...");


            //begin consuming
            channel.consume(queue, (msg) => {
              let brokerValue = msg.content.toString();
              console.log(`Received message: ${brokerValue}`);
              //get additional data from helper functions
              let output = PVOperations.getOutput(Number(brokerValue));
              FileOperations.openAndWrite(output)
                .then(() => {
                  console.log(`Data written successfully!`);
                  channel.ack(msg);
                })
                .catch((err) => {
                  console.log(err);
                })
            }, {
              noAck: false
            });
          }
        })
      }
    });
  },
  queue: process.env.queue || "hello"
};

const PVOperations = {
  calculatePV: function () {
    let simulatedValue = Math.random() * 20;
    return simulatedValue;
  },
  getTotalOutputInKilowatts: function (broker, pv) {
    let output = broker + pv;
    output = output / 1000;
    return Number(output.toFixed(2));
  },
  getOutput: function (broker) {
    let pv = this.calculatePV();
    let totalOutputKW = this.getTotalOutputInKilowatts(broker, pv);
    let output = `Broker: ${broker} watts, PV: ${pv} watts, Broker/PV in kW: ${totalOutputKW}kW, timestamp: ${Date.now()} \n`
    return output;
  },
};

const FileOperations = {
  openAndWrite: function (data) {
    return new Promise((resolve, reject) => {
      fs.open('./Data.txt', 'wx', (err) => {
        if (err) {
          this.appendToFile(data)
            .then(() => resolve())
            .catch((err) => reject(err))
        } else {
          this.writeToFile(data)
            .then(() => resolve())
            .catch((err) => reject(err))
        }
      })
    })
  },
  writeToFile: function (data) {
    return new Promise((resolve, reject) => {
      fs.writeFile('./Data.txt', data, (err) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve();
        }
      })
    })
  },
  appendToFile: function (data) {
    return new Promise((resolve, reject) => {
      fs.appendFile("./Data.txt", data, (err) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve();
        }
      })
    })
  }
};

if (!process.env.testing) {
  Consumer.connect(connectionString, Consumer.queue);
}

module.exports = { Consumer, PVOperations, FileOperations };