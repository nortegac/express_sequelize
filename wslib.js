const WebSocket = require("ws");
// const Message = require('./models/message')

const clients = [];
const messages = [];
let cont = 0;

const wsConnection = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    clients.push(ws);
    sendMessages();

    ws.on("message", (message) => {
      const msg = {
        message: message,
        author: 'author' + cont,
        ts: Date.now()
      }

      messages.push(msg);
      sendMessages();
      /* Message.create(msg).then((result) =>{
        sendMessages();
        cont++;
      }) */
    });
  });

  const sendMessages = () => {
    clients.forEach((client) => client.send(JSON.stringify(messages)));
    /* Message.findAll().then((result) => {
      clients.forEach((client) => client.send(JSON.stringify(result)));
    }) */
  };
};

exports.wsConnection = wsConnection;
exports.messages = messages;
exports.clients = clients;