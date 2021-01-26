// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

chai.use(chaiHttp);
const should = chai.should();

// const
//       testPaylod = {
//         id: 'test',
//         some_int: 1,
//         some_string: 'someContent',
//       },
//       createdPayload = {
//         id: 'amazing',
//         some_int: 42,
//         some_string: 'amazingString',
//       },
//       errorSomeString = {error: '"some_string" must only contain alpha-numeric characters'},
//       errorSomeInt = {error: '"some_int" must be a number'};

describe('Settings endpoints', () => {

  afterEach(() => {
    // reset EL-mock data
    //    client = require('../modules/redis.mock.js').mockRedis.initData();
  });

  describe('test fethcing monitor version /loadMonitorVersion', () => {
    it('should return moki version', (done) => {
      chai
        .request(app)
        .get('/loadMonitorVersion')
        .end((err, res) => {
          should.exist(res.body);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.be.eql({version: '4.5'});
          done();
        });
    });
  });

  // describe('/POST data', () => {

  //   it('shoud create a dataset ', (done) => {
  //     chai
  //       .request(app)
  //       .post('/api/v1/data')
  //         .set('Content-Type', 'application/json')
  //       .send({
  //         id: 'amazing',
  //         some_string: 'amazingString',
  //         some_int: 42,
  //       })
  //       .end((err, res) => {
  //         should.exist(res.body);
  //         res.should.have.status(204);
  //         res.body.should.be.a('object');
  //         res.body.should.be.eql({});
  //         done();
  //       });
  //   });

  //   it('should fail creating a dataset with empty payload ', (done) => {
  //     chai
  //       .request(app)
  //       .post('/api/v1/data')
  //       .set('Content-Type', 'application/json')
  //       .send({})
  //       .end((err, res) => {
  //         should.exist(res.body);
  //         res.should.have.status(400);
  //         res.body.should.be.a('object');
  //         res.body.should.be.eql(idRequired);
  //         done();
  //       });
  //   });
  //   it('should fail creating a dataset with invalid payload ', (done) => {
  //       chai
  //       .request(app)
  //       .post('/api/v1/data')
  //       .set('Content-Type', 'application/json')
  //       .send('{')
  //       .end((err, res) => {
  //         should.exist(res.body);
  //         res.should.have.status(400);
  //         res.body.should.be.a('object');
  //         res.body.should.be.eql({error: 'Unexpected end of JSON input'});
  //         done();
  //       });
  //   });
  //   it('should fail creating a dataset wrong some_string content (spe char) ', (done) => {
  //     chai
  //       .request(app)
  //       .post('/api/v1/data')
  //       .set('Content-Type', 'application/json')
  //       .send({
  //         id: 'fail',
  //         some_string: 'amazingString1*',
  //         some_int: 42,
  //       })
  //       .end((err, res) => {
  //         should.exist(res.body);
  //         res.should.have.status(400);
  //         res.body.should.be.a('object');
  //         res.body.should.be.eql(errorSomeString);
  //         done();
  //       });
  //   });

  //   it('should fail creating a dataset wrong some_string content (space) ', (done) => {
  //     chai
  //       .request(app)
  //       .post('/api/v1/data')
  //       .set('Content-Type', 'application/json')
  //       .send({
  //         id: 'fail',
  //         some_string: 'amazing String',
  //         some_int: 42,
  //       })
  //       .end((err, res) => {
  //         should.exist(res.body);
  //         res.should.have.status(400);
  //         res.body.should.be.a('object');
  //         res.body.should.be.eql(errorSomeString);
  //         done();
  //       });
  //   });
  //   it('should fail creating a dataset wrong some_int content (string) ', (done) => {
  //     chai
  //       .request(app)
  //       .post('/api/v1/data')
  //       .set('Content-Type', 'application/json')
  //       .send({
  //         id: 'fail',
  //         some_string: 'amazingString',
  //         some_int: '42ee',
  //       })
  //       .end((err, res) => {
  //         should.exist(res.body);
  //         res.should.have.status(400);
  //         res.body.should.be.a('object');
  //         res.body.should.be.eql(errorSomeInt);
  //         done();
  //       });
  //   });
  //   it('should fail creating a dataset with already used id', (done) => {
  //     chai
  //       .request(app)
  //       .post('/api/v1/data')
  //       .set('Content-Type', 'application/json')
  //       .send({
  //         id: 'test',
  //         some_string: 'amazingString',
  //         some_int: 42,
  //       })
  //       .end((err, res) => {
  //         should.exist(res.body);
  //         res.should.have.status(400);
  //         res.body.should.be.a('object');
  //         res.body.should.be.eql({error: 'id test already assigned'});
  //         done();
  //         });
  //   });

  //   it('should return 2 object', (done) => {
  //       chai
  //       .request(app)
  //       .get('/api/v1/data')
  //       .end((err, res) => {
  //         should.exist(res.body);
  //         res.should.have.status(200);
  //         res.body.should.be.a('array');
  //         res.body.should.be.eql([testPaylod, createdPayload]);
  //         done();
  //       });
  //   });
  //  });
});

describe('Global', () => {
  describe('Errors', () => {
    it('404 should be json', (done) => {
      chai
        .request(app)
        .get('/api')
        .end((err, res) => {
          should.exist(res.body);
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.be.eql({ error: 'Not Found' });
          done();
        });
    });
  });

  describe('swagger', () => {
    it('/api/docs.json should be json', (done) => {
      chai
        .request(app)
        .get('/api/docs.json')
        .end((err, res) => {
          should.exist(res.body);
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    });
  });

});
