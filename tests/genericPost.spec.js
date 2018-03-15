// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const { startServer } = require('../src/express');
const { expect } = chai;

chai.use(chaiHttp);

describe('POST generic', () => {
  let chaiServer;
  let expressServer;
  before(async () => {
    expressServer = await startServer();
    chaiServer = await chai.request(expressServer);
  });
  after(async () => expressServer.close());

  it('should error for requests without body', done => {
    chaiServer.post('/ruby').end((err, res) => {
      expect(err).not.to.be.null;
      expect(res).to.have.status(400);
      expect(res.text.includes('syntax error')).to.be.true;
      done();
    });
  });

  it('should be time-boxed', done => {
    const payload = `
loop do
  puts 'loop'
end
`;
    const errorMessage = 'Time limit reached';
    chaiServer
      .post('/ruby')
      .set('content-type', 'text/plain')
      .send(payload)
      .end((err, res) => {
        expect(err).not.to.be.null;
        expect(res).to.have.status(400);
        expect(res.text.includes(errorMessage)).to.be.true;
        done();
      });
  });
});
