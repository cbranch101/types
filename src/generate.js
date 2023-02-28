import Chance from 'chance'
import daggy from 'daggy'
import { curry } from 'ramda'
import Free, { liftF } from './free'
import { Id, List, Map, Either } from './types'

const Random = daggy.taggedSum('Random', {
    chance: ['methodName', 'args'],
    valueContainer: ['value'],
})

const runChanceMethod = (methodName, ...args) =>
    liftF(Random.chance(methodName, args))

const chanceMethods = Object.getOwnPropertyNames(Chance.prototype)

const random = List(chanceMethods)
    .reduce(
        (memo, methodName) =>
            memo.set(methodName, (...args) =>
                runChanceMethod(methodName, ...args),
            ),
        Map({}),
    )
    .toJS()

const pushFreeFieldToList = curry((freeField, list) =>
    freeField.map((freeValue) => list.push(freeValue)),
)

const setFreeFieldInMap = curry((freeField, key, map) =>
    freeField.map((value) => map.set(key, value)),
)

const convertFieldToFree = (field) =>
    Free.is(field)
        ? field
        : Id.of(typeof field !== 'object' && !Array.isArray(field))
              .map(
                  (isSimpleValue) =>
                      isSimpleValue
                          ? Free.of(field)
                          : convertValueToFree(field), // eslint-disable-line no-use-before-define
              )
              .extract()

const convertObjectToFree = (fields) =>
    Map(fields)
        .reduce(
            (memo, field, fieldName) =>
                memo.chain(
                    setFreeFieldInMap(convertFieldToFree(field), fieldName),
                ),
            Free.of(Map({})),
        )
        .map((fieldMap) => fieldMap.toJS())

const convertArrayToFree = (fields) =>
    List(fields)
        .reduce(
            (memo, field) => memo.chain(pushFreeFieldToList(field)),
            Free.of(List([])),
        )
        .map((fieldList) => fieldList.toJS())

const convertValueToFree = (value) =>
    Array.isArray(value)
        ? convertArrayToFree(value)
        : convertObjectToFree(value)

const Generated = daggy.tagged('Generated', ['free'])

Generated.prototype.map = function map(f) {
    return Generated(this.free.map(f))
}

Generated.of = (fields) => Generated(convertValueToFree(fields))

const getInterpet = (chance) => (x) =>
    x.cata({
        chance: (methodName, args) => Id.of(chance[methodName](...args)),
        valueContainer: (value) => Id.of(value),
    })

const getGeneratedEither = (f) =>
    Id.of(f())
        .map((generated) =>
            Generated.is(generated)
                ? Either.Right(generated)
                : Either.Left(
                      'Return a Generated instance from the function in generate',
                  ),
        )
        .extract()

const generate = (f, seed) =>
    Id.of(new Chance(seed))
        .map(getInterpet)
        .map((interpret) =>
            getGeneratedEither(f).fold(
                (e) => {
                    throw new Error(e)
                },
                (generated) =>
                    generated.free.foldMap(interpret, Id.of).extract(),
            ),
        )
        .extract()

export { generate, random, Generated }
