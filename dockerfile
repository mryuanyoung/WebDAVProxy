FROM node:14

COPY ./node_modules ./node_modules

COPY ./dist/src ./

EXPOSE 3001

CMD ["node", "index.js"]