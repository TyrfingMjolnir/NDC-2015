/// <reference path="../typings/jasmine/jasmine.d.ts" />

(() => {
    'use strict';

    describe('generator basics', () => {

        it('* 1 call next on the iterator to leverage yield in a generator', () => {

            function *generator() {
                yield 1234;
            }

            var iterator = generator(); // get the generator iterator
            var foo = iterator.next();

            expect(foo.value).toBe(1234);
            expect(foo.done).toBeFalsy();

            iterator.next();

            expect(iterator.next().done).toBeTruthy();
        });

        it('* 2 yield can be used both to return but also to pass values back into the generator', () => {

            function *generator(num) {
                var foo = yield ++num;

                return foo;
            }

            var genit = generator(1);

            var res = genit.next();

            expect(res.value).toBe(2);

            var returnedFromYield = genit.next('passed in');

            expect(returnedFromYield.value).toBe('passed in');

        });

        it('* 3 a generator can contain multiple yields', () => {
            function * multGenny() {
                var a = yield;
                var b = yield;

                return a * b;
            }

            var genit = multGenny();
            genit.next();
            genit.next(2);

            expect(genit.next(5).value).toBe(10);
        });

        it('* 4 you can compose a statement with multiple yields', () => {

            function *adderGenerator() {
                var added = (yield 'a') + (yield 'b');
                return added;
            }

            var genit = adderGenerator();
            
            //run to first yield and return
            expect(genit.next().value).toBe('a');
                   
            //write to first yield, then run to second yield and return
            expect(genit.next(2).value).toBe('b');
                
            //write to second yield and run to completion
            expect(genit.next(3).value).toBe(5);
        });

        it('* 5 the final return is ignored when iterated over', () => {

            function *generator() {
                yield 1;
                yield 2;
                yield 3;
                return 4;
            }

            for (var v of generator()){ }

            expect(v).toBe(3);
        });

        it('* 6 you can short circuit a generator with return', () => {
            function *shortCircuitGenerator() {
                yield 1;
                yield 2;
                yield 3;
            }

            var genit = shortCircuitGenerator();
            expect(genit.next().value).toBe(1);

            var returned = genit.return(1337);
            expect(returned.value).toBe(1337);
            expect(returned.done).toBe(true);
        });

        it('* 7 you can throw a spanner into the works of a generator with throw', () => {
            function *exceptionGenerator() {
                try {
                    yield 1;
                    yield 2;
                    yield 3;
                } catch (error) {
                    expect(error).toBe('oh noes');
                }
            }

            var genit = exceptionGenerator();
            expect(genit.next().value).toBe(1);

            genit.throw('oh noes');
        });


        it('* 8 generators can be lazy', () => {

            function *fibGen() {
                var a = 0, b = 1;

                while (true) {
                    b = a + b;
                    a = b - a;
                    yield  b;
                }
            }

            var genit = fibGen();

            expect(genit.next().value).toBe(1);
            expect(genit.next().value).toBe(2);
            expect(genit.next().value).toBe(3);
            expect(genit.next().value).toBe(5);
        });

    });
})();
