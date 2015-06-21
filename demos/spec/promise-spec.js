/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../typings/promise/es6-promise.d.ts" />

(() => {
    'use strict';

    describe('promise basics', () => {

        it('* 1 promises are always async', () => {
            var promise = new Promise((resolve, reject) => {
                resolve();
            });

            promise.then(() => {
                hasChanged = true;
            });

            var hasChanged = false;

            expect(hasChanged).toBe(false);
        });

        it('* 2 it is easy to turn a function with callbacks into a promise', (done) => {
            function promisify(fn) {
                return new Promise((resolve, reject) => {
                    fn.call(this, resolve, reject);
                });
            }

            function takesCallbacks(success, error) {
                success('from callback');
            }

            promisify(takesCallbacks).then((res) => {
                expect(res).toBe('from callback');
                done();
            });
        });

        it('* 3 returning inside a promise yields a new promise', (done) => {
            var promise = Promise.resolve([1, 2, 3, 4]);

            promise.then((val) => {
                return val.reduce((a, b) => {
                    return a + b;
                });
            }).then((res) => {
                expect(res).toBe(10);
                done();
            });
        });

        it('* 4 resolving a promise with a promise yields a single promise', (done) => {
            var promise = Promise.resolve(Promise.resolve('hello'));
            promise.then((result) => {
                expect(result).toBe('hello');
                done();
            });
        });

        it('* 5 is possible to wait for all promises to complete before continuation', (done) => {
            var promise1 = Promise.resolve('1');
            var promise2 = Promise.resolve('2');

            Promise.all([promise1, promise2])
                .then((res) => {
                    expect(res[0]).toBe('1');
                    expect(res[1]).toBe('2');
                    done();
                });
        });

        it('* 6 is possible to reject a promise that times out', (done) => {
            var cancellationPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject('timeout');
                }, 2000);
            });

            var slowPromise = new Promise((resolve, reject) => {
                setTimeout(resolve, 5000);
            });

            var race = Promise.race([cancellationPromise, slowPromise]);
            race.catch((result) => {
                expect(result).toBe('timeout');
                done();
            });
        });

        it('* 7 in the event of an error, the result of .all() is a rejected promise', (done) => {
            var rejectingPromise = Promise.reject(':(');
            
            /*
            Note that you can pass in regular objects too and
            that they will be turned into a resolved promise instead
            */
            Promise.all([true, rejectingPromise])
                .then(() => {
                    throw 'should never be here...';
                })
                .catch((res) => { //Note res is not an array
                    expect(res).toBe(':(');
                    done();
                });
        });

        it('* 8 an exception raised inside a promise implicitely rejects the promise', (done) => {
            var promise = new Promise((resolve, reject) => {
                throw ':(';
            });

            promise.catch((err) => {
                expect(err).toBe(':(');
                done();
            });
        });

    });
})();
