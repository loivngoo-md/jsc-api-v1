const config: {
    SERVICE_NAME: string,
    FIXED_TOKEN: string,
    AUTHENTICATION_HOST: string,
    ENV: string,
  
    // Postgres
    POSTGRES: {
      READ_WRITE: {
        DB: string,
        HOST: string,
        PORT: number,
        USERNAME: string,
        PASSWORD: string,
      },
      READ: {
        DB: string,
        HOST: string,
        PORT: number,
        USERNAME: string,
        PASSWORD: string,
      },
    },
  } = {
    SERVICE_NAME: process.env.SERVICE_NAME,
    FIXED_TOKEN: process.env.FIXED_TOKEN,
    AUTHENTICATION_HOST: process.env.AUTHENTICATION_HOST,
    ENV: process.env.ENV,
    
    POSTGRES: {
      READ_WRITE: {
        DB: 'hp7-stock',
        HOST: 'hp7-stock-production.cluster-ro-c0grgbnq2buq.ap-southeast-1.rds.amazonaws.com',
        PORT: 5432,
        USERNAME: 'hp7_user_root',
        PASSWORD: 'secret'
      },
      READ: {
        DB: 'hp7-stock',
        HOST: 'hp7-stock-production.cluster-ro-c0grgbnq2buq.ap-southeast-1.rds.amazonaws.com',
        PORT: 5432,
        USERNAME: 'hp7_user_root',
        PASSWORD: 'secret'
      },
    },
  };
  
  export default config;
  