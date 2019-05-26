export class MessageContext {
    /**
     *
     * @param {string} msgtype
     * @param {*} context
     */
    constructor(msgtype, context = {}) {
        this.msgtype = msgtype;
        this.context = context;
    }
    static convert(message) {
        return new MessageContext(message.msgtype, message.context);
    }
}

export default MessageContext
