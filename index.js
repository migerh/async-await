function promiseFinisher(finisher, test) {
    console.log(test + ':finished promise');
    finisher(test);
}

function successfulSleep(test) {
    return new Promise(function (resolve, reject) {
        setTimeout(() => promiseFinisher(resolve, test), 1000);
    });
}

function failingSleep(test) {
    return new Promise(function (resolve, reject) {
        setTimeout(() => promiseFinisher(reject, test), 1000);
    });
}

function throwingSleep(test) {
    return new Promise(function (resolve, reject) {
        setTimeout(() => {
            throw new Error(test);
        }, 1000);
    });
}

export function successPromise(test) {
    console.log(test + ':successPromise:enter');

    let promise = successfulSleep(test);

    console.log(test + ':successPromise:leave');

    return promise;
}

export function failPromise(test) {
    console.log(test + ':failPromise:enter');

    let promise = failingSleep(test);

    console.log(test + ':failPromise:leave');

    return promise;
}

export async function waitingFunction(test) {
    console.log(test + ':waitingFunction:enter');

    await successPromise(test);

    console.log(test + ':waitingFunction:leave');
}

export async function throwingFunction(test) {
    console.log(test + ':throwingFunction:enter');

    await throwingSleep(test);

    console.log(test + ':throwingFunction:leave');
}
