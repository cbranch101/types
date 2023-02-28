import { Id } from './types'
import { getLiberated } from './liberated'

const interpretMap = {
    name: 'Http',
    methods: {
        Get: {
            args: ['url'],
        },
        Post: {
            args: ['body', 'url'],
        },
    },
}

describe('liberated', () => {
    test('should do stuff', () => {
        const { interpretter, methods } = getLiberated(interpretMap)
        const app = () => methods.Get('/home')
        const res = app().foldMap(interpretter, Id.of).extract()
        expect(res).toEqual('Get called with ["/home"]')
    })
})
