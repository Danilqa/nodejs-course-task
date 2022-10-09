'use strict';

const scaffold = (url, structure) => {
  const clients = {
    ws: url => new WsClient(url),
    http: url => new HttpClient(url)
  };

  const [protocol] = url.split(':');

  const client = clients[protocol](url);
  const api = {};
  const services = Object.keys(structure);

  for (const serviceName of services) {
    api[serviceName] = {};
    const service = structure[serviceName];
    const methods = Object.keys(service);

    for (const methodName of methods) {
      api[serviceName][methodName] = (...args) => client.request(serviceName, methodName, args);
    }
  }
  return api;
};

const api = scaffold('ws://127.0.0.1:8001/', {
  user: {
    create: ['record'],
    read: ['id'],
    update: ['id', 'record'],
    delete: ['id'],
    find: ['mask'],
  },
  country: {
    read: ['id'],
    delete: ['id'],
    find: ['mask'],
  },
});

setTimeout(async () => {
  const data = await api.user.read(3);
  console.dir('data:', data);
}, 1000)

class WsClient {
  constructor(url) {
    this.url = url;
    this.socket = new WebSocket(this.url);
  }

  request(name, method, args) {
    return new Promise((resolve) => {
      const packet = { name, method, args };
      this.socket.send(JSON.stringify(packet));
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        resolve(data);
      };
    });
  }
}

class HttpClient {
  constructor(url) {
    this.url = url;
  }

  request(name, method, args) {
    return new Promise((resolve, reject) => fetch(
        `${this.url}/${name}/${method}`,
        {
          method: 'POST',
          body: JSON.stringify(args),
          headers: { 'Content-Type': 'application/json' },
        }
      ).then((res => {
        const { status } = res;
        if (status !== 200) {
          reject(new Error(`Status Code: ${status}`));
          return;
        }

        resolve(res.json());
      }))
    );
  }
}
