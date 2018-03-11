// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const { startServer, stopServer } = require('../src/express');
const { expect } = chai;

chai.use(chaiHttp);
const path = '/ruby';

describe('POST ruby', () => {
  // beforeEach(done => done());
  let chaiServer;
  before(async () => {
    const expressServer = await startServer();
    chaiServer = await chai.request(expressServer);
  });
  after(async () => stopServer());

  it('should error for requests without body', done => {
    chaiServer.post(path).end((err, res) => {
      expect(err).not.to.be.null;
      expect(res).to.have.status(400);
      expect(res.text.includes('syntax error')).to.be.true;
      done();
    });
  });

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

  it('should report errors: undefined method', done => {
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

    it('should report errors: syntax', done => {
        chaiServer
      .post(path)
      .set('content-type', 'text/plain')
      .send('****')
      .end((err, res) => {
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
      .post(path)
      .set('content-type', 'text/plain')
      .send(payload)
      .end((err, res) => {
        expect(err).not.to.be.null;
        expect(res).to.have.status(400);
        console.log(res.text, res.text.includes(errorMessage))
        expect(res.text.includes(errorMessage)).to.be.true;
        done();
      });
  });
});
