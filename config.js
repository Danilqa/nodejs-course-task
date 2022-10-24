module.exports = {
  // http | ws
  transport: 'http',
  // native | pino
  logger: 'pino',
  servers: {
    static: {
      port: 8000
    },
    main: {
      port: 8001
    }
  },
  db: {
    host: '127.0.0.1',
    port: 5432,
    database: 'example',
    user: 'postgres',
    password: 'postgres',
  },
  moduleLoader: {
    timeout: 5000,
    displayErrors: false
  }
};
