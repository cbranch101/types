import { generate, Generated, random } from './generate'

describe('Generated', () => {
    test('basic implementation', () => {
        const output = generate(
            () =>
                Generated.of({
                    isAlive: random.bool(),
                    arrayOfBools: [random.bool(), random.bool()],
                    nested: {
                        biz: 'test',
                        foo: random.bool(),
                    },
                }),
            'test',
        )
        expect(output).toEqual({
            isAlive: true,
            nested: {
                foo: false,
                biz: 'test',
            },
            arrayOfBools: [true, false],
        })
    })
    test('should throw error if generated is not returned', () => {
        expect(() => generate(() => 'foo')).toThrowError(
            'Return a Generated instance from the function in generate',
        )
    })
    test('generated classes are mappable', () => {
        const output = generate(
            () =>
                Generated.of({ foo: random.bool() }).map((data) => ({
                    ...data,
                    biz: 'baz',
                })),
            'test',
        )
        expect(output).toEqual({ foo: true, biz: 'baz' })
    })
})
