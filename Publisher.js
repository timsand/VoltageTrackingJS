const amqp = require('amqplib/callback_api');
const connectionString = process.env.connectionString || 'amqp://snpucpee:R1WnRCPBTgCiV01-p_L1c0_lebJScn21@mosquito.rmq.cloudamqp.com/snpucpee';


const Publisher = {
  connectToChannel: (connectionString, queue) => {
    return new Promise((resolve, reject) => {
      amqp.connect(connectionString, (err, connection) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          connection.createChannel((err, channel) => {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              channel.assertQueue(queue, {
                durable: false
              })
              resolve(channel);
            }
          })
        }
      });
    })
  },
  sendToQueue: (channel, queue, msg) => {
    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(`Sent ${msg}`);
  },
  queue: process.env.queue || "hello",
}

const Wattage = {
  watts: 1,
  getNewWattage: function () {
    //no arrow function to avoid this issues
    if (this.direction === 'increasing') {
      let rand = Math.random() * 2;
      this.watts += rand;
      if (this.watts >= 9000) {
        this.watts = 9000;
        this.direction = 'decreasing'
      }
      return this.watts;
    } else {
      let rand = Math.random() * 2;
      console.log(this);
      this.watts -= rand;
      if (this.watts <= 0) {
        this.watts = 1;
        this.direction = 'increasing';
      }
      return this.watts;
    }
  },
  direction: 'increasing'
}




//testing
if (!process.env.testing) {
  const connection = Publisher.connectToChannel(connectionString, Publisher.queue)
  connection.then((channel) => {
    setInterval(() => {
      let watts = Wattage.getNewWattage();
      Publisher.sendToQueue(channel, Publisher.queue, JSON.stringify(watts));
    }, 3000)
  })
    .catch((err) => {
      console.log(err);
    })
}