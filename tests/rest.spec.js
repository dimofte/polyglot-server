// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const { server, stop } = require('../src/main');
const { expect } = chai;

chai.use(chaiHttp);
const path = '/js';

const isCompilationError = text => text.substr(0, 17) === 'CompilationError:';
const isExecutionError = text => text.substr(0, 15) === 'ExecutionError:';

describe('POST js', () => {
  // beforeEach(done => done());
  let chaiServer;
  before(async () => {
    chaiServer = await chai.request(server);
  });
  after(async() => stop());

  it('it should error for requests without body', done => {
    chaiServer
      .post(path)
      .end((err, res) => {
        expect(err).not.to.be.null;
        expect(res).to.have.status(400);
        expect(isCompilationError(res.text)).to.be.true;
        done();
      });
  });

  it('it should return the correct last value', done => {
    // plain number
    let payload = 'const x = 1; x + 1'; // '2'
    chaiServer
      .post(path)
      .set('content-type', 'text/plain')
      .send(payload)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(JSON.parse(res.text)).to.equal(2);
      });

    // a more complex object
    payload = 'const x = {foo: 1, bar: 2}; x';
    chaiServer
      .post(path)
      .set('content-type', 'text/plain')
      .send(payload)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(JSON.parse(res.text)).to.deep.equal({foo: 1, bar: 2});
        done();
      });
  });

  it('it should report execution errors', done => {
    // ExecutionError:  foo is not defined
    const payload = 'foo()';
    chaiServer
      .post(path)
      .set('content-type', 'text/plain')
      .send(payload)
      .end((err, res) => {
        expect(err).not.to.be.null;
        expect(res).to.have.status(400);
        expect(isExecutionError(res.text)).to.be.true;
        done();
      });
  });

  it('it should report compilation errors', done => {
    const payload = 'const x = 2; *#@$$';
    chaiServer
      .post(path)
      .set('content-type', 'text/plain')
      .send(payload)
      .end((err, res) => {
        expect(err).not.to.be.null;
        expect(res).to.have.status(400);
        expect(isCompilationError(res.text)).to.be.true;
        done();
      });
  });


  it('it should reject returning object literals', done => {
    const payload = '{ foo: 101, bar: 120 }';
    chaiServer
      .post(path)
      .set('content-type', 'text/plain')
      .send(payload)
      .end((err, res) => {
        expect(err).not.to.be.null;
        expect(res).to.have.status(400);
        expect(isCompilationError(res.text)).to.be.true;
        done();
      });
  });

  it('it should error the execution of long scripts (limit: 1.5s)', done => {
    const payload = 'while(true) {}';
    chaiServer
      .post(path)
      .set('content-type', 'text/plain')
      .send(payload)
      .end((err, res) => {
        expect(err).not.to.be.null;
        expect(res).to.have.status(400);
        expect(isExecutionError(res.text)).to.be.true;
        done();
      });
  });

  it('it should not provide access to node modules', done => {
    const payload = 'const fs = require(\'fs\')'; // fs would be quite dangerous :)
    chaiServer
      .post(path)
      .set('content-type', 'text/plain')
      .send(payload)
      .end((err, res) => {
        expect(err).not.to.be.null;
        expect(res).to.have.status(400);
        expect(isExecutionError(res.text)).to.be.true;
        done();
      });
  });
});
