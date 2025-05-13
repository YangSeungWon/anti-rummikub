const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

/**
 * 인메모리 MongoDB 서버를 생성하고 연결합니다.
 */
const connect = async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    const mongooseOpts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    await mongoose.connect(uri, mongooseOpts);
    console.log(`MongoDB 인메모리 서버가 시작되었습니다: ${uri}`);
};

/**
 * 데이터베이스를 삭제하고 연결을 종료한 후 서버를 중지합니다.
 */
const closeDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    console.log('MongoDB 인메모리 서버가 중지되었습니다.');
};

/**
 * 모든 컬렉션의 데이터를 삭제합니다.
 */
const clearDatabase = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};

module.exports = {
    connect,
    closeDatabase,
    clearDatabase
};
