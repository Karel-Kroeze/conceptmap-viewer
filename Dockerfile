FROM node:alpine

# set up directory structure
RUN mkdir /app
WORKDIR /app

# set up packages
RUN npm install -g yarn
RUN yarn global add forever
ADD package.json /app
RUN yarn install

# copy over the rest
ADD . /app

# run the app
EXPOSE 3000
CMD [ "node", "app/app.js" ]

