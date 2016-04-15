# iot-platform
IoT platform main configuration server for application developers to on board their iot apps

# Steps to setup : 

update nodejs

https://davidwalsh.name/upgrade-nodejs

install nodemon to start nodejs server, (-g parameter to make it global, so you can start the server as "nodemon start")

## npm install nodemon -g

run the below command to install all the package dependencies mentioned in package.json 

## npm install

Mongodb

## our_database_name : iotdb

Export directory

## directory_path : repo-path/data

Exporting mongodb

## mongodump -d our_database_name -o directory_path

Importing mongodb

## mongorestore -d our_database_name directory_path

