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
          let msgContent = msg.content.toString();
          console.log(" [x] Received %s", msgContent);
          writeToFile(msgContent)
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

const appendToFile = () => {
  return new Promise((resolve, reject) => {
    fs.appendFile("./Data.txt", "\nMOAR DATA", (err) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve();
      }
    })
  })
};