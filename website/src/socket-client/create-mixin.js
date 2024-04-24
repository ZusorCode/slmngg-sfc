/**
 * @param {EventEmitter} GlobalEmitter
 * @return {Object}
 */
export default (GlobalEmitter) => ({
    created() {
        this.$options.sockets = this.$options.sockets || {};
        const { sockets } = this.$options;
        const addListener = GlobalEmitter.addListener.bind(null, this);
        const removeListenersByLabel = GlobalEmitter.removeListenersByLabel.bind(null, this);

        sockets && Object.keys(sockets).forEach((key) => {
            console.log("socket", key);
            addListener(key, sockets[key]);
        });

        this.$socket = this.$socket || {};
        Object.defineProperties(this.$socket, {
            $subscribe: {
                value: addListener,
                writable: false,
                enumerable: false,
                configurable: true
            },
            $unsubscribe: {
                value: removeListenersByLabel,
                writable: false,
                enumerable: false,
                configurable: true
            }
        });
    },
    beforeUnmount() {
        const { sockets = {} } = this.$options;

        Object.keys(sockets).forEach((key) => {
            GlobalEmitter.removeListenersByLabel(this, key);
        });
    },
    unmounted() {
        delete this.$socket.$subscribe;
        delete this.$socket.$unsubscribe;
    }
});
