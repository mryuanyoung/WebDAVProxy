export interface BaseReq {
    username: string,
    password: string
}

export interface CreateFile extends BaseReq{
    filename?: string,
    json: string
}

export interface GetFileReq extends BaseReq{
    path?: string
    filename?: string
}