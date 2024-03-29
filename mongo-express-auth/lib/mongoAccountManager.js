/*=============================================
     MongoDB Account Manager

=============================================*/

var passwordTools = require('./passwordTools.js');

var g = {
    mongoClient: null,
    mongoCollection: null
}

//===========================
//  API
//===========================

exports.init = function(config, done){
    initMongo(config.mongo, onMongoReady);

    function onMongoReady(err){
        if (err)
            throw err;
        done();
    }
}

exports.getAccount = function(username, password, done){
    g.mongoCollection.findOne(
        { 
            username: username
        }, 
        function(err, result){
            if (err)
                done(err, null)
            else if (result == null){
                done('user doesn\'t exist', null);
            }
            else if (!passwordTools.validatePassword(password, result.hashedPassword))
                done('bad password', null);
            else
                done(err, result);
        }
    );
}

exports.createAccount = function(username, password,imgURL, done){
    g.mongoCollection.insert(
        { 
            username: username, 
            hashedPassword: passwordTools.saltAndHash(password),
            imgURL: imgURL
        }, 
        function(err, result){
            if (err && err.err.indexOf('duplicate key error') !== -1)
                done('username already exists', null);
            else if (err)
                done(err, null);
            else
                done(err, result);
        }
    );
}

//===========================
//  MONGO INIT
//===========================

var mongo = require('mongodb');

var defaultMongoConfig = {
    host: 'localhost',
    port: mongo.Connection.DEFAULT_PORT
};

function initMongo(mongoConfig, done){

    var host = mongoConfig.host || defaultMongoConfig.host;
    var port = mongoConfig.port || defaultMongoConfig.port;

    var optionsWithEnableWriteAccess = { w: 1 };

    g.mongoClient = new mongo.Db(
        mongoConfig.dbName,
        new mongo.Server(host, port),
        optionsWithEnableWriteAccess
    );

    openCollection(mongoConfig.collectionName, done);
}

function openCollection(collectionName, done){
    g.mongoClient.open(onDbReady);

    function onDbReady(error){
        if (error)
            done(error)

        g.mongoClient.collection(collectionName, onCollectionReady);
    }

    function onCollectionReady(error, collection){
        if (error)
            done(error)

        g.mongoCollection = collection;

        g.mongoCollection.ensureIndex(
            'username', 
            { 'unique': true }, 
            onUniquenessEnsured
        );

    }

    function onUniquenessEnsured(err){
        done(err);

    }
}
