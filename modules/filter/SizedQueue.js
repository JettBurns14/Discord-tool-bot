class SizedQueue {
    constructor(size) {
        this.size = size;
        this.inner = [];
        Object.freeze(this);
    }

    push(obj) {
        this.inner.push(obj);
        while (this.inner.length > this.size) {
            this.inner.shift();
        }
    }

    countInstances(obj) {
        return this.inner
            .filter(element => element === obj)
            .length;
    }
}

module.exports = SizedQueue;