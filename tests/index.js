let aa = require('../index');

describe('async/await', function () {
    it('#1: async function without await returns immediately', function () {
        console.log('#1:enter');
        aa.successPromise('#1');
        console.log('#1:leave');
    });

    it('#2: async function with await waits', async function (done) {
        console.log('#2:enter');
        await aa.successPromise('#2');
        console.log('#2: done');
        console.log('#2:leave');

        done();
    });

    it('#3: awaiting function still returns immediately', function () {
        console.log('#3:enter');
        aa.waitingFunction('#3');
        console.log('#3:leave');
    });

    it('#4: rejected promise throws', async function (done) {
        try {
            console.log('#4:enter');
            await aa.failPromise('#4');
            console.log('#4:after:failPromise');
        } catch (e) {
            console.log('#4:exception', e);
        }

        console.log('#4:leave');
        done();
    });

    it('#5: throwing promise throws', async function (done) {
        console.log('#5:enter');

        try {
            await aa.throwingFunction('#5');
            console.log('#5:after:throwingFunction');
        } catch (e) {
            console.log('#5:exception', e);
        }

        console.log('#5:leave');
        done();
    });

    it('dummy that waits for the last test to finish', function (done) {
        // mocha has a timeout of 2s per test
        setTimeout(done, 1900);
    });
});
