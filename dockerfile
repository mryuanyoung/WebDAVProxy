FROM node:14

COPY ./node_modules ./node_modules

COPY ./dist/src ./

EXPOSE 3001

ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

CMD ["node", "index.js"]