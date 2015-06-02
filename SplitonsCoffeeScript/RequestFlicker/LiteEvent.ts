interface ILiteEvent<T> {
    subscribe(handler: { (data?: T): void });
    unsubscribe(handler: { (data?: T): void });
}

class LiteEvent<T> implements ILiteEvent<T> {
    private handlers: { (data?: T): void; }[] = [];

    public subscribe(handler: { (data?: T): void }) {
        this.handlers.push(handler);
    }

    public unsubscribe(handler: { (data?: T): void }) {
        this.handlers = this.handlers.filter(h => h !== handler);
    }

    public raise(data?: T) {
        if (this.handlers) {
            this.handlers.slice(0).forEach(h => h(data));
        }
    }
}