const { MongoClient } = require('mongodb');
const state = { db: null };

module.exports.connect = async function(done) {
    const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const dbname = 'shopping';

    try {
        const client = new MongoClient(url);
        await client.connect();
        state.db = client.db(dbname);
        done();
    } catch (err) {
        done(err);
    }
};

module.exports.get = function() {
    return state.db;
};
