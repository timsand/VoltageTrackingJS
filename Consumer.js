const amqp = require('amqplib/callback_api');
const fs = require('fs');

amqp.connect('amqp://snpucpee:R1WnRCPBTgCiV01-p_L1c0_lebJScn21@mosquito.rmq.cloudamqp.com/snpucpee', (err, connection) => {
  if (err) {
    console.log(err);
  } else {
    connection.createChannel((err, channel) => {
      if (err) {
        console.log(err);
      } else {
        var queue = 'hello';

        channel.assertQueue(queue, {
          durable: false
        })

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, (msg) => {
          let brokerValue = msg.content.toString();
          console.log(" [x] Received %s", brokerValue);
          //get additional data from helper functions
          let output = getOutput(Number(brokerValue));
          openAndWrite(output)
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


const calculatePV = () => {
  let simulatedValue = Math.random() * 20;
  return simulatedValue;
}

const getTotalOutputInKilowatts = (broker, pv) => {
  let output = broker + pv;
  output = output / 1000;
  return Number(output.toFixed(2));
}

const getOutput = (broker) => {
  let pv = calculatePV();
  let totalOutputKW = getTotalOutputInKilowatts(broker, pv);
  let output = `Broker: ${broker} watts, PV: ${pv} watts, Broker/PV in kW: ${totalOutputKW}kW, timestamp: ${Date.now()} \n`
  return output;
}

const openAndWrite = (data) => {
  return new Promise((resolve, reject) => {
    fs.open('./Data.txt', 'wx', (err, fd) => {
      if (err) {
        appendToFile(data)
          .then(() => resolve())
          .catch((err) => reject(err))
      } else {
        console.log(fd);
        writeToFile(data)
          .then(() => resolve())
          .catch((err) => reject(err))
      }
    })
  })
}


const writeToFile = (data) => {
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
};

const appendToFile = (data) => {
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
};