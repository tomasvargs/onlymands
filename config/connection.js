const mongoClient = require('mongodb').MongoClient;
const state = { db: null };

module.exports.connect = function(done) {
    const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const dbname = 'shopping';

    const client = new mongoClient(url);
    client.connect()
        .then(() => {
            state.db = client.db(dbname);
            done();
        })
        .catch((err) => done(err));
};

module.exports.get = function() {
    return state.db;
};
