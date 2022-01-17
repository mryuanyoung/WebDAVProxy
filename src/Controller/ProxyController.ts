import { FileStat, ResponseDataDetailed } from "webdav";
import { Autowired, PostMapping, RequestBody, RestController } from "../decorator/Request"
import { CreateFile, GetFileReq } from "../dto/operator"
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

    @PostMapping('/files')
    // todo 这里引用的类型前端框架里没有怎么办
    async getFiles(@RequestBody req: GetFileReq): Promise<Response<FileStat[] | ResponseDataDetailed<FileStat[]>>>{
        const res = await this.WebDAV.getDirContent(req);
        return {
            success: !!res,
            message: !!res+'',
            res
        }
    }

    @PostMapping('/fileContent')
    async getFileContent(@RequestBody req: GetFileReq):Promise<Response<string>>{
        const res = await this.WebDAV.getFileContent(req);
        return {
            success: res !== '',
            message: (res !== '') + '',
            res: (res as string)
        }
    }

    
}   

export default ProxyController