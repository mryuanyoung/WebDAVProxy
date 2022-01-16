// 框架代码
import { CONTAINER } from '../index'

export function DAVClient(constructor){
    const name = constructor.name;
    CONTAINER[name] = new constructor();
}