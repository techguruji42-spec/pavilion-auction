import 'dotenv/config';
import { PostgresStore } from './store';
const store=new PostgresStore();await store.init();await store.close();console.log('Production auction initialized. Demo users and historical transactions were not created.');
