/* eslint-disable prefer-spread, prefer-rest-params */
import daggy from 'daggy'

const Free = daggy.taggedSum('Free', { Impure: ['x', 'f'], Pure: ['x'] })

Free.of = Free.Pure

const kleisliComp = (f, g) => (x) => f(x).chain(g)

Free.prototype.fold = function fold() {
    return this.x.fold.apply(this.x, arguments)
}

Free.prototype.map = function map(f) {
    return this.cata({
        Impure: (x, g) => Free.Impure(x, (y) => g(y).map(f)),
        Pure: (x) => Free.Pure(f(x)),
    })
}

Free.prototype.ap = function ap(a) {
    return this.cata({
        Impure: (x, g) => Free.Impure(x, (y) => g(y).ap(a)),
        Pure: (f) => a.map(f),
    })
}

Free.prototype.chain = function chain(f) {
    return this.cata({
        Impure: (x, g) => Free.Impure(x, kleisliComp(g, f)),
        Pure: (x) => f(x),
    })
}

const liftF = (command) => Free.Impure(command, Free.Pure)

Free.prototype.foldMap = function foldMap(interpreter, of) {
    return this.cata({
        Pure: (a) => of(a),
        Impure: (instructionOfArg, next) =>
            interpreter(instructionOfArg).chain((result) =>
                next(result).foldMap(interpreter, of),
            ),
    })
}

export default Free

export { liftF }
