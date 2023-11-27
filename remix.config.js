import { config } from '@netlify/remix-adapter';

export default {
  ...(process.env.NODE_ENV === 'production' ? config : undefined),
};
