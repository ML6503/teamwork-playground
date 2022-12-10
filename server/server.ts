import http from "http";
import { DataBase } from "./src/database/db";
import * as WebSocket from 'websocket';
import {IMessage } from '../interface/IMessage';
const db = new DataBase();

const server = http.createServer((req, res) => {


  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*' );
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type',);

  console.log((new Date()) + ' Received request for ' + req.url);
  // /register?name=JohnDoe&age=42
  const reqData = req.url?.split("?");
  if (!reqData) {
    throw new Error("Empty request data");
  }
  const endpoint = reqData[0];
  if (reqData.length > 1) {
    const queryParams = reqData[1].split("&").map((el) => {
      const [key, val] = el.split("=");
      return { key, val };
    });

    queryParams[0].val = queryParams[0].val.replace('%40', '@');
    console.log(endpoint, queryParams);
    if (db.checkUser(queryParams[0].val)) {
      db.getNewUser(queryParams[0].val, queryParams[1].val);
      console.log(db.getDatabase());
    } else console.log('You are already registered');
  }
  res.end("recieved");
});

server.listen(3000, () => {
  console.log((new Date()) + ' Server is listening port 3000');
});

const websocket = new  WebSocket.server({ httpServer: server });

const messages: Array<string> = [];

const clients: Array<WebSocket.connection>= [];

websocket.on('request', (e) => {
  const client = e.accept();
  clients.push(client);

  console.log('connect');

  client.on('message', msg => {
    console.log(msg);
    if (msg.type !==  'utf8') {
      return;
    }

    const parsedMsg: IMessage = JSON.parse(msg.utf8Data);
    console.log('parsedMsg', parsedMsg);

    switch (parsedMsg.type) {
      case 'chatMsg':
        {
          messages.push(parsedMsg.data);
          
          const chatMsg: IMessage = {
            type: 'chatMsg',
            data: parsedMsg.data,
            id: 1
          };

          clients.forEach( c => {
            c.sendUTF(JSON.stringify(chatMsg));
          });
          break;
        }

        case 'chatHistory' : {
          const historyChat: IMessage = {
            type: 'chatHistory',
            data: JSON.stringify(messages),
            id: 0
          };
          client.sendUTF(JSON.stringify(historyChat));
          break;
        }
        
      default:
        break;
    }
    
  
  });

  client.on('close', () => {
    clients.splice(clients.indexOf(client), 1)
  });

});