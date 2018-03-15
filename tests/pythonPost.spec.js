// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const { startServer } = require('../src/express');
const { expect } = chai;

chai.use(chaiHttp);
const path = '/python';

describe('POST python', () => {
  let chaiServer;
  let expressServer;
  before(async () => {
    expressServer = await startServer();
    chaiServer = await chai.request(expressServer);
  });
  after(async () => expressServer.close());

  it('should return anything that was printed', done => {
    // identation is important in python!
    const payload = `
x = 1
while x < 5:
    print(x)
    x = x + 1
      `;
    chaiServer
      .post(path)
      .set('content-type', 'text/plain')
      .send(payload)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(JSON.parse(res.text)).to.deep.equal(['1', '2', '3', '4']);
        done();
      });
  });

  it('should report errors', done => {
    // ExecutionError:  foo is not defined
    const payload = 'foo()';
    const errorMessage = "NameError: name 'foo' is not defined";
    chaiServer
      .post(path)
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
