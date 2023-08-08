import './App.css';
import React, { useEffect, useState, useMemo } from 'react';
import io, {Socket } from 'socket.io-client';
import axios from 'axios';
import { Layout, notification, ColorPicker,Typography, Image} from 'antd';
import { Bar } from '@antv/g2plot';
import {
  RadiusBottomleftOutlined,
  RadiusBottomrightOutlined,
  RadiusUpleftOutlined,
  RadiusUprightOutlined,
} from '@ant-design/icons';
import type { NotificationPlacement } from 'antd/es/notification/interface';
const { Title } = Typography;
const Context = React.createContext({ name: 'Default' });
const { Content } = Layout;


const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [elements, setElements] = useState<{ [key: string]: any }>({});
  const [api, contextHolder] = notification.useNotification();

  const contextValue = useMemo(() =>
   ({
    name: 'Ant Design UI',
  }), []);

  const handleConnect = () => {
    socket?.emit("browserconct", (ok: boolean) => {
      if (!ok) window.location.reload();
      ConnectopenNotification('topLeft');
    });
  };

  const handleConnectError = (err: Error) => {
    if (err.message === 'timeout') window.location.reload();
    ErroropenNotification('bottomLeft');
  };

  const handleDisconnect = () => {
    DisconnectopenNotification('bottomLeft');
  };

  const ConnectopenNotification = (placement:NotificationPlacement) => {
    api.success({
      message: `Hybrid Notification`,
      description: (
        <Context.Consumer>
          {({ name }) => `The server Started, ${name}!`}
        </Context.Consumer>
      ),
      placement,
    });
  };

  const ErroropenNotification = (placement:NotificationPlacement) => {
    api.error({
      message: `Hybrid Notification`,
      description: (
        <Context.Consumer>
          {({ name }) => `Error, ${name}!`}
        </Context.Consumer>
      ),
      placement,
    });
  };

  const DisconnectopenNotification = (placement:NotificationPlacement) => {
    api.warning({
      message: `Hybrid Notification`,
      description: (
        <Context.Consumer>
          {({ name }) => `Connection lost. Trying to reconnect, ${name}!`}
        </Context.Consumer>
      ),
      placement,
    });
  };


  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/socketio_configuration')
      .then((response) => {
        const { extra_headers, transports, query, prefix, elements } = response.data;
        
        console.log(extra_headers)
        console.log(transports)
        console.log(query)
        console.log(prefix)
        console.log('Elements data:', elements);

        // Ensure elements is not undefined
        if (elements === undefined) {
          throw new Error('Elements data is undefined.');
        }

        setElements(elements);
        console.log(elements);
        const url = window.location.protocol === 'https:' ? 'wss://' : 'ws://' + "localhost:8000";
        const path = `${prefix}/ws/socket.io/`
        const trans_ports = ['websocket', 'polling']
        const socket: Socket= io(
          url, {
            path: path, 
            transports: trans_ports,
           })
        setSocket(socket);


        return () => {
          socket.disconnect();
        };
      })
      .catch((error) => {
        console.error('Error fetching initial app data:', error);
      });
  }, []);

  useEffect(() => {
    if (socket && elements) {
      socket.on("connect", handleConnect);
      socket.on("connect_error", handleConnectError);
      socket.on("disconnect", handleDisconnect);
      return () => {
        socket.off("connect", handleConnect);
        socket.off("connect_error", handleConnectError);
        socket.off("disconnect", handleDisconnect);
      };
    }
  }, [socket, elements]);

  useEffect(() => {
    if (socket) {
      const handleDisconnect = () => {
        DisconnectopenNotification('bottomLeft');
      };
      return () => {
        socket.off("disconnect", handleDisconnect);
      };
    }
  }, [socket]);

  if (!socket || !elements) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Layout>
        <Context.Provider value={contextValue}>
          {contextHolder}
          <Title level={2}> Socket mit FastAPI und React-Typscript </Title>
          <Image src=''></Image>
          <ul>
              {Object.entries(elements).map(([key, value]) => (
              <li key={key}>
                  {key}: {value}
              </li>
              ))}
          </ul>
        </Context.Provider>
      </Layout>
    </div>
  );
};

export default App;
