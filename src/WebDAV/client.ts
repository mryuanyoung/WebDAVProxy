import { CreateFile } from 'src/dto/operator';
import {createClient, WebDAVClient} from 'webdav';
import {DAVClient} from '../decorator/webdav';

@DAVClient
class WebDAV {
    private client: WebDAVClient

    constructor(){
    }

    createClient(username: string, password: string, url?:string){
        this.client = createClient(
            url || "https://box.nju.edu.cn/seafdav",
            {
                username,
                password
            }
        );
    }

    hasClient(){
        return !!this.client;
    }

    async createFile(req: CreateFile){
        if(!this.hasClient()){
            this.createClient(req.username, req.password);
        }

        const date = new Date();
        const res = await this.client.putFileContents(`/BookkeepingData/${date.getUTCFullYear()}-${date.getUTCMonth()+1}-${date.getUTCDate()}.json`, req.json);
        return res;
    }
}

export default WebDAV;