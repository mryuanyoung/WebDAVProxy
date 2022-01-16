FROM node:14

COPY ./dist/src ./

EXPOSE 3001

CMD ["node", "index.js"]