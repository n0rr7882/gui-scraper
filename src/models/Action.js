class Action {
    type = null
    context = {}

    constructor({ type=null, context={} }) {
        this.type = type
        this.context = context
    }
}

export default Action