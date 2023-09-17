export const CONTAINER: any = {};

import Koa from "koa";
import Router from "koa-router";
import KoaBody from "koa-body";
import cors from "@koa/cors";
import "reflect-metadata";
import { getAllFiles } from "./utils/file";
const Path = require("path");

const app = new Koa();

(async function init() {
  try {
    // 引入controller
    const ControllerPath = "Controller";
    const path = Path.join(__dirname, ControllerPath);
    const filesList = [];
    await getAllFiles(path, filesList);
    filesList.forEach((path) => require(path));

    // 路由分配
    const router = new Router();
    Object.keys(CONTAINER).forEach((key) => {
      if (key.match(/controller/i)) {
        const { _routes, _basePath = "", _params } = CONTAINER[key];
        _routes.forEach((route) => {
          router[route["httpMethod"]](
            _basePath + route["path"],
            async (ctx, next) => {
              const params = [];

              const methodParam = _params[route["method"]];
              if (methodParam) {
                if (methodParam["body"] !== undefined) {
                  params[methodParam["body"]] = ctx.request.body;
                }
                if (methodParam["param"] !== undefined) {
                  params[methodParam["param"]] = ctx.request.query;
                }
              }

              const res = await CONTAINER[key][route["method"]](...params);
              ctx.response.body = res;
              next();
            }
          );
        });
      }
    });

    // 中间件
    app.use(async (ctx, next) => {
      console.log("请求开始", ctx.request, "\n\n");
      await next();
    });
    app.use(cors({origin: '*'}));
    app.use(KoaBody());
    app.use(router.routes());
    app.use(async (ctx, next) => {
      console.log(
        Date(),
        "\n请求方法: ",
        ctx.method,
        "\n请求路径: ",
        ctx.path,
        "\n请求参数: ",
        ctx.request.query,
        ctx.request.body,
        "\n返回结果: ",
        ctx.body
      );
    });

    // 启动app
    app.listen(3001);
  } catch (err) {
    console.log(err);
  }
})();
