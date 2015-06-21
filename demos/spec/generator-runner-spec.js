/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../typings/promise/es6-promise.d.ts" />

(() => {
    'use strict';

    describe('leveraging generators to run async code', () => {

        function asyncRunner(generator) {
            window.runnerDone = false;

            var genit = generator();
            //Partial function application for recursive calls
            var onResolve = continuator.bind(continuator, 'next');
            var onReject = continuator.bind(continuator, 'throw'); //genit.throw() raises error inside generator

            function continuator(verb, arg) {
                try {
                    var yielded = genit[verb](arg); //call genit next here, or throw if previous promise failed
                    
                    //Makes sure we are dealing with a promise - important if sync code is yielded
                    var promise = Promise.resolve(yielded.value);

                    if (yielded.done) {
                        window.runnerDone = true;
                        //Example of returning promise inside a promise
                        return promise;
                    } else {
                        //continues the generator to exhaustion, calling conntinuer with the correct verb and value
                        return promise.then(onResolve, onReject);
                    }
                } catch (error) {
                    return Promise.reject(error); //returns rejected promise for the chain
                }

            }

            return onResolve(); //Kicks off genit and returns the promise chain
        }

        function asyncLog(message) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log(message);
                    resolve();
                }, 100);
            });
        }

        it('* 1 we can run an empty generator', (done) => {
            function *generator() { }

            asyncRunner(generator).then(() => {
                expect(window.runnerDone).toBe(true);
                done();
            });
        });

        it('* 2 a generator can run a promise returning function', (done) => {
            function *generator() {
                yield Promise.resolve();
            }

            asyncRunner(generator).then(() => {
                expect(window.runnerDone).toBeTruthy();
                done();
            });
        });

        it('* 3 we can use the return value of a yield', (done) => {
            function *generator() {
                var foo = yield Promise.resolve(1);
                var bar = yield Promise.resolve(++foo);

                expect(bar).toBe(2);
                done();
            }

            asyncRunner(generator);
        });

        it('* 4 a generator can return a value', (done) => {
            function *generator() {
                return Promise.resolve('return');
            }

            asyncRunner(generator).then((res) => {
                expect(res).toBe('return');
                done();
            });
        });

        it('* 5 we can handle sync functions as well as async ones', (done) => {
            function *generator() {
                yield Promise.all([asyncLog('in all 1'), asyncLog('in all 2')]);
                yield console.log('sync bar');
                yield asyncLog('async baz');
            }

            asyncRunner(generator).then(() => {
                expect(window.runnerDone).toBe(true);
                done();
            });
        });

        it('* 6 exceptions can be handled in the generator', (done) => {
            function *generator() {
                try {
                    throw 'ex'
                    yield Promise.resolve();
                } catch (e) {
                    expect(e).toBe('ex');
                    done();
                }
            }

            asyncRunner(generator);
        });

        it('* 7 exceptions can be handled by the promise chain', (done) => {
            function *generator() {
                throw 'ex'
                yield Promise.resolve();
            }

            asyncRunner(generator).catch((e) => {
                expect(e).toBe('ex');
                done();
            });

        });

        it('* 8 rejected promises can be handled by the promise chain', (done) => {
            function *generator() {
                yield Promise.resolve();
                yield Promise.reject('ex');
            }

            asyncRunner(generator).catch((e) => {
                expect(e).toBe('ex');
                done();
            });

        });

    });
})();
