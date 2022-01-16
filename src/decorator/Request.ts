// 框架代码
import { CONTAINER } from '../index'

type Method = 'get' | 'post'

export function RestController(constructor) {
    const key = constructor.name;
    const obj = new constructor();
    CONTAINER[key] = obj;
}

export const Service = RestController

export function RequestMapping(baseUrl: string = '') {
    return function (constructor) {
        const prototype = constructor.prototype;
        prototype['_basePath'] = baseUrl;
    }
}

export function Autowired(prototype, name){
    prototype[name] = CONTAINER[name]
}

function HTTPRequest(method: Method, path: string = '') {
    return function (proto, name, desc) {
        if (!Array.isArray(proto._routes)) {
            proto._routes = []
        }
        proto._routes.push({
            method: name,
            httpMethod: method,
            path
        })
    }
}

export const PostMapping = HTTPRequest.bind(null, 'post')
export const GetMapping = HTTPRequest.bind(null, 'get')

export function Param(type, proto, name, idx){
    if(!proto._params){
        proto._params = {}
    }
    proto._params[name] = {...proto._params[name], [type]: idx};
}

export const RequestBody = Param.bind(null, 'body');
export const RequestParam = Param.bind(null, 'param');
