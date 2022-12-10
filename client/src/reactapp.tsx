import React, { useEffect, useState } from "react";
import {IMessage } from '../../interface/IMessage';
interface IAppProps {
  onClick: () => void;
  text: string;
}

interface ICheckBoxProps {
  onClick: (checked: boolean) => void;
  text: string;
}

export function App(props: IAppProps) {
  return (
    <div>
      <button
        onClick={() => {
          console.log("test of the button");
          props.onClick();
        }}
      >
        click me {props.text}
      </button>
      <CheckBox onClick={() => {}} text="checkbox string" />
      <RequestServer></RequestServer>
      <RequestServer1></RequestServer1>
    </div>
  );
}

export function CheckBox(props: ICheckBoxProps) {
  const [isChecked, setChecked] = useState(false);
  return (
    <div>
      <span>{props.text}</span>
      <button
        onClick={() => {
          setChecked(!isChecked);
          props.onClick(isChecked);
        }}
      >
        {isChecked ? "+" : "-"}
      </button>
    </div>
  );
}

export function RequestServer() {
  const [response, setResponse] = useState("");
  const [socket, setSocket ] = useState<WebSocket>(null);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState<Array<string>>([]);

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:3000");
    websocket.onmessage = (msg) => {
      
      const parsedMsg: IMessage = JSON.parse(msg.data);
      console.log('parsedMsg type', parsedMsg.type);

      switch (parsedMsg.type) {
        case 'chatMsg':
          {
            console.log('parsedMsg data', parsedMsg.data);
            // messages.push(msg.data);
            setMessages((prev) => {
              return [parsedMsg.data, ...prev]
            });
            
           
           
            // clients.forEach( c => {
            //   c.sendUTF(JSON.stringify(chatMsg));
            // });
            break;
          }
  
          case 'chatHistory' : {
            const msgList: Array<string> = JSON.parse(parsedMsg.data);
            console.log('msg list: ', msgList);
            setMessages(msgList.reverse());
            break;
          }
          
        default:
          break;
      }
      
     
    }; 
    websocket.onopen = () => {
      console.log('connected');
      setSocket(websocket);

      const request: IMessage = {
        type: 'chatHistory',
        data: '',
        id: 3
      };
      websocket.send(JSON.stringify(request));
    };

    return () => {
      websocket.close();
    };

  }, []);

  return (
    <div>
      <span>{response}</span>
      <input onChange={(e) => {
       setInputMsg( e.target.value);
      }} type="text" placeholder="Write your message here" value={inputMsg}/>
      <button
        onClick={() => {

          const request: IMessage = {
            type: 'chatMsg',
            data: inputMsg,
            id: 3
          };
          socket.send(JSON.stringify(request));
          // socket.send(inputMsg);
          setInputMsg('');
          // fetch("http://localhost:3000")
          //   .then((data) => data.text())
          //   .then((data) => setResponse(data));

        }}
      >
        New button
      </button>
      <div>
        {messages.map((m , i) => (<span key={m + i}>{m}</span>))}
      </div>
    </div>
  );
}

export function RequestServer1() {
  const [response, setResponse] = useState("Loading...");
  useEffect(() => {
    const tID = setTimeout(() => {
      fetch("http://localhost:3000")
        .then((data) => data.text())
        .then((data) => setResponse(data));
    }, 2000);
    return () => {
      clearTimeout(tID);
    };
  }, []);
  return (
    <div>
      <span>{response}</span>
    </div>
  );
}
