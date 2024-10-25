const { MongoClient, ServerApiVersion } = require('mongodb');
const state = { db: null };

module.exports.connect = async function() {
    const url = process.env.MONGO_URL;
    const dbname = 'shopping';

    try {
        if (!url) {
            throw new Error('MONGO_URL is not set');
        }

        const client = new MongoClient(url, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

        await client.connect();
        state.db = client.db(dbname);
    } catch (err) {
        console.error('Database connection failed', err);
        throw err; // rethrow the error to be handled elsewhere
    }
};

module.exports.get = function() {
    return state.db;
};
