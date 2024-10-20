const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}


module.exports.connect=function(done){
    const url='mongodb://localhost:27017';
    const dbname='shopping';
    const client= new mongoClient(url);

    client.connect();
    state.db=client.db(dbname)
    done()

   

}

module.exports.get=function(){
    return state.db
}