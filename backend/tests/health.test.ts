import request from 'supertest';
import app from '../src/app';

describe('Health Endpoint', () => {
  it('should return 200 OK and status ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});
