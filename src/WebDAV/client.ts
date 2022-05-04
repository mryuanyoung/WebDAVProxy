import { CreateFile, GetFileReq } from "src/dto/operator";
import { AuthType, createClient, FileStat, WebDAVClient } from "webdav";
import { DAVClient } from "../decorator/webdav";

@DAVClient
class WebDAV {
  private client: WebDAVClient;

  constructor() {}

  createClient(username: string, password: string, url?: string) {
    this.client = createClient(url || "http://box.nju.edu.cn/seafdav", {
      authType: AuthType.Password,
      username,
      password,
    });
  }

  hasClient() {
    return !!this.client;
  }

  async createFile(req: CreateFile) {
    if (!this.hasClient()) {
      this.createClient(req.username, req.password);
    }

    const date = new Date();
    try {
      const res = await this.client.putFileContents(
        `/BookkeepingData/${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.json`,
        req.json,
        { overwrite: true, contentLength: false }
      );
      return res;
    } catch (err) {
      return false;
    }
  }

  async getDirContent(req: GetFileReq) {
    if (!this.hasClient()) {
      this.createClient(req.username, req.password);
    }

    const res = await this.client.getDirectoryContents(
      req.path || "/BookkeepingData/"
    );
    (res as Array<FileStat>).sort((a, b) => {
      const da = new Date(a.lastmod);
      const db = new Date(b.lastmod);
      return db.getTime() - da.getTime();
    });
    return (res as Array<FileStat>).slice(0, 5);
  }

  async getFileContent(req: GetFileReq) {
    if (!this.hasClient()) {
      this.createClient(req.username, req.password);
    }

    const res = await this.client.getFileContents(req.filename, {
      format: "text",
    });
    return res;
  }
}

export default WebDAV;
