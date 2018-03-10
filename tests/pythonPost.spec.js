// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const { startServer, stopServer } = require('../src/express');
const { expect } = chai;

chai.use(chaiHttp);
const path = '/python';

const isSyntaxError = msg => msg.includes('SyntaxError: invalid syntax');

describe('POST python', () => {
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
      expect(isSyntaxError(res.text)).to.be.true;
      done();
    });
  });

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

  it('should report "not defined" errors', done => {
    // ExecutionError:  foo is not defined
    const payload = 'foo()';
    const errorMessage = "NameError: name 'foo' is not defined";
    chaiServer
      .post(path)
      .set('content-type', 'text/plain')
      .send(payload)
      .end((err, res) => {
        expect(err).not.to.be.null;
        // expect(res).to.have.status(400);
        expect(res.text.includes(errorMessage)).to.be.true;
        done();
      });
  });

  it('should report syntax errors', done => {
    const payload = '^$%^';
    const errorMessage = 'SyntaxError: invalid syntax';
    chaiServer
      .post(path)
      .set('content-type', 'text/plain')
      .send(payload)
      .end((err, res) => {
        expect(err).not.to.be.null;
        // expect(res).to.have.status(400);
        // console.log(res.text );
        expect(res.text.includes(errorMessage)).to.be.true;
        done();
      });
  });

  // TODO: timebox script, cut access to filesystem etc

  //   it('should not provide write access to the filesystem', done => {
  //     const payload = `
  // file = open("testfile.txt", "w")
  // file.write("This is a test")
  // file.close()
  // file = open("testfile.txt", "r")
  // print(file.read())
  //     `;
  //     chaiServer
  //       .post(path)
  //       .set('content-type', 'text/plain')
  //       .send(payload)
  //       .end((err, res) => {
  //         expect(err).not.to.be.null;
  //         expect(res).to.have.status(400);
  //         console.log(res.text );
  //         // expect(res.text.includes(errorMessage)).to.be.true;
  //         done();
  //       });
  //   });
});
