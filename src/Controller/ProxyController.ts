import { Autowired, PostMapping, RequestBody, RestController } from "../decorator/Request"
import { CreateFile } from "../dto/operator"
import {Response} from '../dto/response';
import WebDAV from "../WebDAV/client"


@RestController
class ProxyController {

    @Autowired
    WebDAV: WebDAV

    @PostMapping('/createFile')
    async creatFile(@RequestBody req: CreateFile): Promise<Response<boolean>>{
        const res = await this.WebDAV.createFile(req);
        return {
            success: res,
            message: res ? '√' : '×',
            res
        }
    }
}   

export default ProxyController