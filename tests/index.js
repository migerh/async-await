let expect = require('chai').expect;

// References
//
// [1] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
// [2] https://zeit.co/blog/async-and-await


// Make calls to console.log slightly shorter.
function log(test, ...args) {
    console.log(test + ':', ...args);
}

describe('async/await', function () {
    let resolved, rejected, pending,
        testNumber = 0, test;

    beforeEach(function () {
        resolved = false;
        rejected = false;
        pending = false;

        testNumber++;
        test = '#' + testNumber;
    });

    afterEach(function(done) {
        // Mocha has a test timeout of 2s.
        // Each test is set up to be done in less than 2s so we will wait 1990ms after each test
        // to let it finish to prevent the mixing of outputs of two or more tests.
        setTimeout(() => {
            console.log('\n\n');
            done();
        }, 1990);
    });


    // This function simulates an asynchronous call using setTimeout and returns a promise.
    // The promise will transfer to state resolved as soon as the timer runs out. Note that the
    // resolve function is given the result parameter. This is how we pass on the result of the
    // asynchronous call. It can be extracted from the promise be either using its then() method
    // or await (see below tests on how to do that).
    function successfulSleep(test, result, timeout) {
        timeout = timeout || 1000;

        pending = true;

        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                pending = false;
                resolved = true;

                log(test, '  asynchronous call successfully resolved');
                resolve(result);
            }, timeout);
        });
    }


    // successfulSleep() initiates a timeout and immediately returns a promise. The promise will
    // resolve as soon as the timeout ends. Since we neither 'await' the successPromise() call
    // (see test #2) nor use the promise's then() or catch() method [1] the test is already
    // finished by the time this happens.
    it('calling an async function without await runs the rest of the function immediately', function () {
        log(test, 'call a function that initiates an asynchronous call and returns a promise without waiting');

        successfulSleep(test);

        log(test, 'the call has returned');

        expect(pending).to.be.true;
    });


    // Now we use await to wait for the timeout to finish. We now get a different outcome because
    // await causes the execution of rest of this function to be deferred until the promise
    // is resolved. Note the async in front of the test function. Every function that wants
    // to utilize await has to be flagged as async. Otherwise a parsing error will occur.
    it('await waits for an asynchronous call before running the rest of the function', async function (done) {
        log(test, 'call a function that returns a promise and await the successful execution');

        await successfulSleep('#2');

        log(test, 'the call has returned');

        expect(resolved).to.be.true;

        // Everything after the await is run asynchronously as soon as the promise returned
        // by successfulSleep() is resolved. If we do not invoke done() here the test will
        // never finish and run into a timeout.
        done();
    });


    // This function waits for the asynchronous call like the last test did. Again, note the
    // async keyword. Otherwise we would not be able to use await. Once the promise returned
    // by successfulSleep() is resolved, the second log message is printed.
    async function waitingFunction(test, result) {
        log(test, '  waitingFunction is called and awaits an asynchronous call');

        await successfulSleep(test);

        log(test, '  waitingFunction: promise returned by successfulSleep is resolved');

        return result;
    }


    // Here we see what happens if a function is called that awaits another function call. Since
    // the test itself is not awaiting the call to waitingFunction() the second log will be
    // output before the timeout finishes.
    it('a function that internally awaits another call still returns immediately when not awaited', function () {
        log(test, 'call a function that waits on an asynchronous function');

        waitingFunction(test);

        log(test, 'the call has returned');

        expect(pending).to.be.true;
    });


    // When we await a function, the result of that operation is the value that is passed to the
    // promise's resolve() callback!
    it('await automatically unpacks the result inside the promise', async function (done) {
        log(test, 'Await the call to an asynchronous function');

        let someValue = 'async/await ftw!';

        let result = await successfulSleep(test, someValue);

        log(test, 'Call has finished, result is', result);

        expect(result).to.equal(someValue);

        done();
    });


    // Not only does await automatically unpack the result stored in a promise, async also
    // wraps any non-promise results in a promise.
    it('async/await automatically packs and unpacks results', function () {
        log(test, 'Do not await the call to an async function that returns a raw value');

        let someValue = 'async/await ftw!';

        let result = waitingFunction(test, someValue);

        log(test, 'call has finished, result is', result.toString());

        expect(result).to.be.an.instanceof(Promise);
    });


    // This function is marked as async and awaits one asynchronous call but returns the
    // promise of a second asynchronous call.
    async function asyncFunctionThatReturnsAPromise(test, result) {
        log(test, '  await the first asynchronous call');
    
        await successfulSleep(test, result, 500);

        log(test, '  first asynchronous call finished, launch the second but do not await it');
    
        let promise = successfulSleep(test, result, 500);
    
        log(test, '  return the promise returned by the not-awaited async call');
    
        return promise;
    }

    
    // After the latest test one might assume that the promised returned is stored in another
    // promise so any await on this function might yield the returned promise. Fortunately,
    // this is not the case. async detects if the result is already a promise and does not wrap
    // it any further.
    it('await an async function that waits and returns a promise', async function (done) {
        log(test, 'call an async function that returns a promise as its result');

        let someValue = 'async/await ftw!';

        let result = await asyncFunctionThatReturnsAPromise(test, someValue);

        log(test, 'await finished, result is', result);

        expect(result).to.equal(someValue);

        done();
    });


    // Now let's see what happens when the promise is rejected. This is used to report errors
    // that occurred during the async operation.
    function failingSleep(test, error) {
        pending = true;

        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                pending = false;
                rejected = true;

                log(test, '    promise rejected');
                reject(error);
            }, 1000);
        });
    }


    // If await receives a rejected promise it will throw an exception. The exception
    // is the same that is given to the reject() callback of the promise.
    it('rejected promise throws', async function (done) {
        log(test, 'await a function returning a promise that is rejected');

        let error = new Error(test);
        let catchedException;
            
        try {
            await failingSleep(test, error);
            console.error(test + ': this is unexpected, we should never get here');
        } catch (e) {
            log(test, 'as expected we catched an exception because the promise failed');
            log(test, 'exception catched is', error.toString());

            catchedException = e;
        }

        try {
            expect(rejected).to.be.true;
            expect(catchedException).to.equal(error);

            done();
        } catch (e) {
            done(e);
        }
    });


    // Awaiting an undefined function will throw an exception
    it('awaiting an undefined function', async function (done) {
        log(test, 'call a function that is not defined');

        let catchedException;

        try {
            await aFunctionThatDoesNotExist();

            log(test, 'this is unexpected, we should never get here');
        } catch (e) {
            log(test, 'executing the undefined function failed:', e.toString());
            catchedException = e;
        }

        try {
            expect(catchedException).to.be.an.instanceof(ReferenceError);

            done();
        } catch (e) {
            done(e);
        }
    });


    // This function will throw an exception during resolve.
    function throwsWhileRunningAsync(test, error) {
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                log(test, '  async throw inside the promise');
                throw error;
            }, 1000);
        });
    }

    // This test will fail. Apparently catch() can not catch exceptions that are thrown
    // during an asynchronous operation before the promise is resolved. This should not affect
    // throwing errors in most Meteor methods themselves run synchronous. We will later see
    // that those exceptions can be catched properly with await/catch.
    it('promise that throws during resolve can be catched with .catch', async function (done) {
        log(test, 'run an async operation that throws during resolve');

        throwsWhileRunningAsync(test, new Error(test))
            .then((resolve) => {
                log(test, 'promise resolved', resolve);
                done();
            })
            .catch((reason) => {
                log(test, 'promise rejected', reason);
                done();
            });

        log(test, 'test done');
    });

    // This test will also fail. Await apparently is also not able to catch exceptions that are
    // thrown during asynchronous operations inside the promise.
    it('promise that throws during an async operation can be handled with await/catch', async function (done) {
        log(test, 'run an async operation that throws');

        try {
            await throwsWhileRunningAsync(test, new Error(test));
            log(test, 'we should not get here');
        } catch (e) {
            log(test, 'exception catched:', e);
        }

        log(test, 'everything is done');
        done();
    });


    // This function runs synchronous operations and throws an exception
    function throwsWhileRunningSync(test, error) {
        log(test, '  throws an exception while running synchronously');

        throw error;
    }

    // Looks like we also can await synchronous functions. Thrown exceptions are still handled
    // properly.
    it('promise that synchronically throws can be catched with await and try/catch', async function (done) {
        log(test, 'await a synchronous function');

        let error = new Error(test);
        let catchedException;

        try {
            await throwsWhileRunningSync(test, error);
            log(test, 'this should never happen');
        } catch (e) {
            log(test, 'catched an exception:', e.toString());
            catchedException = e;
        }

        try {
            expect(catchedException).to.equal(error);
            done();
        } catch (e) {
            done(e);
        }

    });


    // No-op function that returns `undefined` but is marked async
    async function doNothing() {
    }


    // Here we see that an async function always wraps its result inside a promise, also when
    // it is not even asynchronous.
    it('A synchronous function that is marked async returns a promise', function (done) {
        log(test, 'run the synchronous function');

        doNothing()
            .then(() => {
                log(test, 'then handler');
                done();
            })
            .catch((error) => {
                log(test, 'catch handler:', error);
                done(error);
            });

        log(test, 'end of test');
    });
});
