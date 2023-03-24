import Chance from 'chance'
import { Task } from './types'

const chance = new Chance('test')

const getDeferred = () => {
    let resolve = null
    let reject = null
    const promise = new Promise((innerResolve, innerReject) => {
        resolve = innerResolve
        reject = innerReject
    })
    return {
        resolve,
        reject,
        promise,
    }
}

const getMessageQueue = ({
    useTaskInterface = true,
    send,
    registerReceive,
    commands = {},
}) => {
    const pending = {}

    const handleMessage = (message) => {
        const { id, response, error, command, params } = message
        if (error !== undefined) {
            const deferred = pending[id]
            deferred.reject(error)
            delete pending[id]
            return
        }
        if (response !== undefined) {
            const deferred = pending[id]
            deferred.resolve(response)
            delete pending[id]
            return
        }

        const resolve = (response) =>
            send({
                id,
                response,
            })
        const reject = (error) =>
            send({
                id,
                error,
            })
        const handler = commands[command]
        if (handler === undefined) {
            throw new Error(`${command} is not a valid command`)
        }
        const returnValue = handler(params)
        if (useTaskInterface) {
            if (returnValue.fork !== undefined) {
                returnValue.fork(reject, resolve)
                return
            }
            resolve(returnValue)
            return
        }
        if (returnValue.then !== undefined) {
            returnValue
                .then((value) => resolve(value))
                .catch((error) => reject(error))
            return
        }
        resolve(true)
    }

    registerReceive({ handleMessage })

    return {
        sendMessage: (command, params) => {
            const uuid = chance.guid()
            const message = {
                command,
                params,
                id: uuid,
            }
            const deferred = getDeferred()
            pending[uuid] = deferred
            send(message)
            return useTaskInterface
                ? Task((rej, res) =>
                      deferred.promise
                          .then((value) => res(value))
                          .catch((e) => {
                              rej(e)
                          }),
                  )
                : deferred.promise
        },
    }
}

// const WebviewMessage = ({ webview, mockWindow, commands }) => {
//     const handler = getMessageQueue({
//         send: (message) => webview.postMessage(message),
//         registerReceive: ({ handleMessage }) => {
//             mockWindow.addEventListener((message) => handleMessage(message))
//         },
//         commands,
//     })
// }

// mockWindow.addEventListener((message) => {
//     console.log({
//         location: 'client',
//         message,
//     })
// })

// const postMessageToServer = (command, params) =>
//     liftF(Message.ToServer(command, params))

// const postMessageToClient = (command, params) =>
//     liftF(Message.ToClient(command, params))

// const interpret = (x) =>
//     x.cata({
//         ToClient: (command, params) =>
//             Id.of(
//                 `Client command ${command} with params of ${JSON.stringify(
//                     params,
//                 )}`,
//             ),
//         ToServer: (command, params) =>
//             Id.of(
//                 `Server command ${command} with params of ${JSON.stringify(
//                     params,
//                 )}`,
//             ),
//     })

// const app = () =>
//     postMessageToClient('test', { foo: 'bar' }).map((item) => {
//         console.log(item)
//         return item
//     })

// const response = app().foldMap(interpret, Id.of).extract()
// console.log(response)

// const VscodeMessage = {}
export default getMessageQueue
