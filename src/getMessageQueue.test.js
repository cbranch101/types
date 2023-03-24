import { Task } from './types'
import getMessageQueue from './getMessageQueue'

const getMockWindow = () => {
    let onMessage = null
    return {
        addEventListener: (f) => {
            onMessage = f
        },
        triggerEvent: (message) => onMessage(message),
    }
}

const getPanel = (mockWindow) => {
    let onMessage = null
    return {
        addEventListener: (f) => {
            onMessage = f
        },
        triggerEvent: (message) => onMessage(message),
        postMessage: (message) => mockWindow.triggerEvent(message),
    }
}

const getWebview = (panel) => ({
    postMessage: (message) => panel.triggerEvent(message),
})

describe('getMessageQueue', () => {
    describe('if useTaskInterface is true(default)', () => {
        const mockWindow = getMockWindow()
        const panel = getPanel(mockWindow)
        const webview = getWebview(panel)
        const client = getMessageQueue({
            useTaskInterface: true,
            send: (message) => webview.postMessage(message),
            registerReceive: ({ handleMessage }) => {
                mockWindow.addEventListener((message) => handleMessage(message))
            },
            commands: {
                open: () => true,
                errorExample: () => Task.rejected('an error'),
            },
        })

        const server = getMessageQueue({
            useTaskInterface: true,
            send: (message) => panel.postMessage(message),
            registerReceive: ({ handleMessage }) =>
                panel.addEventListener((message) => handleMessage(message)),
            commands: {
                getState: () => Task.of({ foo: 'bar' }),
            },
        })
        test('should be possible to invoke send message as a task', async () => {
            client
                .sendMessage('getState')
                .chain((state) =>
                    server.sendMessage('open').map((openValue) => ({
                        getState: state,
                        open: openValue,
                    })),
                )
                .fork(
                    () => {
                        throw new Error('should not be called')
                    },
                    (x) => {
                        expect(x).toEqual({
                            open: true,
                            getState: { foo: 'bar' },
                        })
                    },
                )
        })
        test('should be able to return errors', () => {
            server.sendMessage('errorExample').fork(
                (error) => {
                    expect(error).toEqual('an error')
                },
                () => {
                    throw new Error('should not be called')
                },
            )
        })
    })
    describe('if passed useTaskInterface false', () => {
        const mockWindow = getMockWindow()
        const panel = getPanel(mockWindow)
        const webview = getWebview(panel)
        const client = getMessageQueue({
            useTaskInterface: false,
            send: (message) => webview.postMessage(message),
            registerReceive: ({ handleMessage }) => {
                mockWindow.addEventListener((message) => handleMessage(message))
            },
            commands: {
                open: () => true,
                errorExample: () => Promise.reject(Error('an error')),
            },
        })

        const server = getMessageQueue({
            useTaskInterface: false,
            send: (message) => panel.postMessage(message),
            registerReceive: ({ handleMessage }) =>
                panel.addEventListener((message) => handleMessage(message)),
            commands: {
                getState: () => Promise.resolve({ foo: 'bar' }),
            },
        })
        test('should use promises', async () => {
            const openValue = await server.sendMessage('open')
            expect(openValue).toEqual(true)
            const getStateValue = await client.sendMessage('getState')
            expect(getStateValue).toEqual({ foo: 'bar' })
            expect(server.sendMessage('errorExample')).rejects.toEqual(
                new Error('an error'),
            )
        })
    })
})
