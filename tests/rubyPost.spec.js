// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const { startServer } = require('../src/express');
const { expect } = chai;

chai.use(chaiHttp);
const path = '/ruby';

describe('POST ruby', () => {
  let chaiServer;
  let expressServer;
  before(async () => {
    expressServer = await startServer();
    chaiServer = await chai.request(expressServer);
  });
  after(async () => expressServer.close());

  it('should return anything that was printed', done => {
    const payload = `
x = 1
puts x
puts x + 1
`;
    chaiServer
      .post(path)
      .set('content-type', 'text/plain')
      .send(payload)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(JSON.parse(res.text)).to.deep.equal(['1', '2']);
        done();
      });
  });

  it('should report errors', done => {
    chaiServer
      .post(path)
      .set('content-type', 'text/plain')
      .send('fooBar()')
      .end((err, res) => {
        expect(err).not.to.be.null;
        expect(res).to.have.status(400);
        expect(res.text.includes('NoMethodError')).to.be.true;
        done();
      });
  });
});
