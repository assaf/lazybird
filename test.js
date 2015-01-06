const assert   = require('assert');
const Lazybird = require('./');
const Promise  = require('bluebird');


describe('resolving promise', function() {

  const SIMPLE_METHODS = [ 'catch', 'done', 'error', 'finally', 'reflect', 'tap', 'then' ];

  const noop = function () {};

  function describeMethod(name, implementation) {
    describe("with '" + name + "'", function() {
      var resolving = false;
      var resolved  = false;

      const promise = new Lazybird(function(resolve) {
        resolving = true;
        const outcome = Promise.resolve()
          .then(function() {
            resolved = true;
          })
          .return([]);
        resolve(outcome);
      });

      describe('initially', function() {
        before(setTimeout);

        it('does not resolve', function() {
          assert(!resolving);
          assert(!resolved);
        });

        describe('after invocation', function() {
          before(function() {
            return implementation(promise);
          });

          it('resolves', function() {
            assert(resolving);
            assert(resolved);
          });
        });
      });
    });
  }

  // Simple methods just need a single handler argument.
  SIMPLE_METHODS.forEach(function (name) {
    describeMethod(name, function(promise) {
      return promise[name](noop);
    });
  });

  describeMethod('call', function(promise) {
    return promise.call('slice');
  });

  describeMethod('get', function(promise) {
    return promise.get(0);
  });

  describeMethod('return', function(promise) {
    return promise.return('foo');
  });

  describeMethod('throw', function(promise) {
    return promise.throw(new Error('boom')).catch(noop);
  });

});


describe('rejected promise', function() {

  var resolving = false;

  const promise = new Lazybird(function(resolve, reject) {
    resolving = true;
    reject('Some error');
  });

  describe('initially', function() {
    before(setTimeout);

    it('does not resolve', function() {
      assert(!resolving);
    });

    describe('then', function() {
      var reason;

      before(function(done) {
        promise.catch(function(error) {
          reason = error;
          done();
        });
      });

      it('rejects', function() {
        assert(resolving);
        assert.equal(reason, 'Some error');
      });
    });
  });

});


describe('errored in resolve', function() {

  var resolving = false;

  const promise = new Lazybird(function(resolve, reject) {
    resolving = true;
    throw new Error('Some error');
  });

  describe('initially', function() {
    before(setTimeout);

    it('does not resolve', function() {
      assert(!resolving);
    });

    describe('then', function() {
      var reason;

      before(function(done) {
        promise.done(done, function(error) {
          reason = error;
          done();
        });
      });

      it('rejects', function() {
        assert(resolving);
        assert.equal(reason.message, 'Some error');
      });
    });
  });

});

