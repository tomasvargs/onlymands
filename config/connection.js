require('dotenv').config(); // Add this line at the top

const { MongoClient } = require('mongodb');
const state = { db: null };

module.exports.connect = async function(done) {
    const url = process.env.MONGO_URL;
    const dbname = 'shopping';
    try {
        if (!url || !url.startsWith('mongodb://')) {
            throw new Error('MONGO_URL is not set or is invalid');
        }
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
