import { handleRequest } from '../server/ai.js';

export default { fetch: request => handleRequest(request, process.env, 'chat') };
