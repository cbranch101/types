import { curry } from 'ramda'
import daggy from 'daggy'
import { liftF } from './free'
import { Map, Id } from './types'

const getLiftedMethod = curry((dispatcher, args, methodName) =>
    Id.of(args)
        .map((args) => args.length > 0)
        .map((hasArgs) =>
            hasArgs
                ? (...args) => liftF(dispatcher[methodName](...args))
                : () => liftF(dispatcher[methodName]()),
        )
        .extract(),
)

const getLiberatedMethods = (className, m) =>
    Id.of(m)
        .map((m) => m.map(({ args }) => args))
        .map((mArgs) =>
            Id.of(mArgs)
                .map((mArgs) => daggy.taggedSum(className, mArgs.toJS()))
                .map((dispatcher) =>
                    mArgs.map(getLiftedMethod(dispatcher)).toJS(),
                )
                .extract(),
        )
        .extract()

const getCataMap = (m) =>
    m
        .map(
            (_, methodName) =>
                (...args) =>
                    Id.of(`${methodName} called with ${JSON.stringify(args)}`),
        )
        .toJS()

const getInterpretter = (m) =>
    Id.of(m)
        .map(getCataMap)
        .map((cataMap) => (x) => x.cata(cataMap))
        .extract()

export const getLiberated = ({ methods, name }) =>
    Id.of(Map(methods))
        .map((m) => ({
            interpretter: getInterpretter(m),
            methods: getLiberatedMethods(name, m),
        }))
        .extract()
