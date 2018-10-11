const request = require('supertest');
const app = require('./app');

describe('app', () => {
  describe('GET /mocks', () => {
    beforeEach(async () => {
      await request(app).delete('/mocks');
    });

    it('should return an empty response when there is no recorded requests', async () => {
      const res = await request(app)
        .get('/mocks');

      expect(res.statusCode).toEqual(200)
      expect(res.body.unexpected).toHaveLength(0);
      expect(res.body.expected).toHaveLength(0);
    });
  });
});
