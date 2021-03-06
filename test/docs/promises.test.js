'use strict';
const PromiseProvider = require('../../lib/promise_provider');
const assert = require('assert');
const mongoose = require('../../');

describe('promises docs', function () {
  let Band;
  let db;

  before(function (done) {
    db = mongoose.createConnection('mongodb://localhost:27017/mongoose_test');

    Band = db.model('band-promises', {name: String, members: [String]});

    done();
  });

  beforeEach(function (done) {
    Band.deleteMany({}, done);
  });

  after(function (done) {
    db.close(done);
  });

  /**
   * Mongoose async operations, like `.save()` and queries, return thenables.
   * This means that you can do things like `MyModel.findOne({}).then()` and
   * `await MyModel.findOne({}).exec()` if you're using
   * [async/await](http://thecodebarbarian.com/80-20-guide-to-async-await-in-node.js.html).
   * 
   * You can find the return type of specific operations [in the api docs](https://mongoosejs.com/docs/api.html)
   * You can also read more about [promises in Mongoose](https://masteringjs.io/tutorials/mongoose/promise).
   */
  it('Built-in Promises', function (done) {
    const gnr = new Band({
      name: "Guns N' Roses",
      members: ['Axl', 'Slash']
    });

    const promise = gnr.save();
    assert.ok(promise instanceof Promise);

    promise.then(function (doc) {
      assert.equal(doc.name, "Guns N' Roses");
      // acquit:ignore:start
      done();
      // acquit:ignore:end
    });
  });

  /**
   * [Mongoose queries](http://mongoosejs.com/docs/queries.html) are **not** promises. They have a `.then()`
   * function for [co](https://www.npmjs.com/package/co) and async/await as
   * a convenience. If you need
   * a fully-fledged promise, use the `.exec()` function.
   */
  it('Queries are not promises', function (done) {
    const query = Band.findOne({name: "Guns N' Roses"});
    assert.ok(!(query instanceof Promise));

    // acquit:ignore:start
    let outstanding = 2;
    // acquit:ignore:end

    // A query is not a fully-fledged promise, but it does have a `.then()`.
    query.then(function (doc) {
      // use doc
      // acquit:ignore:start
      assert.ok(!doc);
      --outstanding || done();
      // acquit:ignore:end
    });

    // `.exec()` gives you a fully-fledged promise
    const promise = query.exec();
    assert.ok(promise instanceof Promise);

    promise.then(function (doc) {
      // use doc
      // acquit:ignore:start
      assert.ok(!doc);
      --outstanding || done();
      // acquit:ignore:end
    });
  });

  /**
   * Although queries are not promises, queries are [thenables](https://promisesaplus.com/#terminology).
   * That means they have a `.then()` function, so you can use queries as promises with either
   * promise chaining or [async await](https://asyncawait.net)
   */
  it('Queries are thenable', function (done) {
    Band.findOne({name: "Guns N' Roses"}).then(function(doc) {
      // use doc
      // acquit:ignore:start
      assert.ok(!doc);
      done();
      // acquit:ignore:end
    });
  });

  /**
   * There are two alternatives for using `await` with queries:
   * 
   * - `await Band.findOne();`
   * - `await Band.findOne().exec();`
   * 
   * As far as functionality is concerned, these two are equivalent.
   * However, we recommend using `.exec()` because that gives you
   * better stack traces.
   */
  it('Should You Use `exec()` With `await`?', function() {
    
  });
  
  /**
   * If you're an advanced user, you may want to plug in your own promise
   * library like [bluebird](https://www.npmjs.com/package/bluebird). Just set
   * `mongoose.Promise` to your favorite
   * ES6-style promise constructor and mongoose will use it.
   */
  it('Plugging in your own Promises Library', function (done) {
    // acquit:ignore:start
    if (!global.Promise) {
      return done();
    }
    // acquit:ignore:end
    const query = Band.findOne({name: "Guns N' Roses"});

    // Use bluebird
    mongoose.Promise = require('bluebird');
    assert.equal(query.exec().constructor, require('bluebird'));

    // Use q. Note that you **must** use `require('q').Promise`.
    mongoose.Promise = require('q').Promise;
    assert.ok(query.exec() instanceof require('q').makePromise);

    // acquit:ignore:start
    done();
    // acquit:ignore:end
  });
});
