/**
 * MongoDB 인메모리 테스트 템플릿
 * 
 * 이 파일은 MongoDB 인메모리 서버를 사용한 테스트 작성 방법을 보여주는 템플릿입니다.
 * 실제 테스트를 작성할 때 이 파일을 복사하여 시작점으로 사용하세요.
 */

const mongoose = require('mongoose');

// 테스트용 모델 스키마 정의
const ExampleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: Number, default: 0 },
    tags: [String],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

describe('MongoDB 인메모리 테스트 템플릿', () => {
    let ExampleModel;

    beforeAll(() => {
        // 안전한 모델 초기화 - OverwriteModelError 방지
        try {
            ExampleModel = mongoose.model('Example');
        } catch (e) {
            ExampleModel = mongoose.model('Example', ExampleSchema);
        }
    });

    // 테스트 실행 전에 실행되는 코드
    beforeEach(async () => {
        // 필요한 경우 특정 테스트 데이터 초기화
        // 참고: 기본적인 DB 초기화는 global-setup.js에서 자동으로 수행됨
    });

    // 기본 CRUD 테스트 -------------------------------------------------------

    it('데이터베이스 연결 확인', () => {
        // 1 = connected, 0 = disconnected, 2 = connecting, 3 = disconnecting
        expect(mongoose.connection.readyState).toBe(1);
    });

    it('문서 생성 및 조회', async () => {
        // 테스트 데이터 생성
        const exampleData = {
            name: '테스트 아이템',
            value: 42,
            tags: ['태그1', '태그2']
        };

        // 데이터베이스에 저장
        const example = new ExampleModel(exampleData);
        await example.save();

        // ID로 조회 (findById)
        const foundById = await ExampleModel.findById(example._id);
        expect(foundById).toBeTruthy();
        expect(foundById.name).toBe('테스트 아이템');
        expect(foundById.value).toBe(42);

        // 쿼리로 조회 (findOne)
        const foundByQuery = await ExampleModel.findOne({ name: '테스트 아이템' });
        expect(foundByQuery).toBeTruthy();
        expect(foundByQuery.tags).toHaveLength(2);
        expect(foundByQuery.tags).toContain('태그1');
    }, 10000); // 타임아웃 설정 (10초)

    it('문서 업데이트', async () => {
        // 테스트 데이터 생성
        const example = new ExampleModel({
            name: '업데이트 테스트',
            value: 10
        });
        await example.save();

        // 업데이트 (updateOne)
        await ExampleModel.updateOne(
            { name: '업데이트 테스트' },
            { $set: { value: 20, tags: ['업데이트됨'] } }
        );

        // 업데이트 결과 확인
        const updated = await ExampleModel.findOne({ name: '업데이트 테스트' });
        expect(updated.value).toBe(20);
        expect(updated.tags).toContain('업데이트됨');
    }, 10000);

    it('문서 삭제', async () => {
        // 테스트 데이터 생성
        const example = new ExampleModel({
            name: '삭제 테스트',
            value: 5
        });
        await example.save();

        // 삭제 전 데이터 존재 확인
        let found = await ExampleModel.findOne({ name: '삭제 테스트' });
        expect(found).toBeTruthy();

        // 삭제 (deleteOne)
        await ExampleModel.deleteOne({ name: '삭제 테스트' });

        // 삭제 확인
        found = await ExampleModel.findOne({ name: '삭제 테스트' });
        expect(found).toBeNull();
    }, 10000);

    // 고급 쿼리 테스트 -------------------------------------------------------

    it('쿼리 필터링', async () => {
        // 여러 테스트 데이터 생성
        await ExampleModel.create([
            { name: '아이템1', value: 10, tags: ['A', 'B'] },
            { name: '아이템2', value: 20, tags: ['B', 'C'] },
            { name: '아이템3', value: 30, tags: ['A', 'C'] }
        ]);

        // 필터링 쿼리 (value >= 20)
        const highValueItems = await ExampleModel.find({ value: { $gte: 20 } });
        expect(highValueItems).toHaveLength(2);

        // 배열 요소로 필터링 (tags 배열에 'A'가 있는 항목)
        const itemsWithTagA = await ExampleModel.find({ tags: 'A' });
        expect(itemsWithTagA).toHaveLength(2);

        // 복합 쿼리 (value > 10 AND tags 배열에 'C'가 있는 항목)
        const filteredItems = await ExampleModel.find({
            value: { $gt: 10 },
            tags: 'C'
        });
        expect(filteredItems).toHaveLength(2);
    }, 10000);

    // 유효성 검사 테스트 -----------------------------------------------------

    it('필수 필드 유효성 검사', async () => {
        // 필수 필드(name)가 없는 항목 생성 시도
        const invalidExample = new ExampleModel({ value: 50 });

        // 유효성 검사 에러 확인
        let validationError;
        try {
            await invalidExample.save();
        } catch (error) {
            validationError = error;
        }

        // 에러 검증
        expect(validationError).toBeTruthy();
        expect(validationError.name).toBe('ValidationError');
        expect(validationError.errors.name).toBeDefined();
    }, 10000);

    // 인덱스 테스트 ---------------------------------------------------------

    it('고유 인덱스 테스트 (선택 사항)', async () => {
        // 참고: 인덱스 테스트 전에 스키마에 고유 인덱스를 추가해야 합니다.
        // ExampleSchema.index({ name: 1 }, { unique: true });

        // 이 테스트는 스키마에 고유 인덱스가 정의된 경우에만 작동합니다.
        // 이 템플릿에서는 예시로만 제공됩니다.

        /* 
        // 첫 번째 항목 생성
        await new ExampleModel({ name: '중복 테스트' }).save();
        
        // 동일한 name으로 두 번째 항목 생성 시도
        const duplicate = new ExampleModel({ name: '중복 테스트' });
        
        // 중복 키 에러 확인
        let duplicateError;
        try {
            await duplicate.save();
        } catch (error) {
            duplicateError = error;
        }
        
        expect(duplicateError).toBeTruthy();
        expect(duplicateError.code).toBe(11000); // MongoDB 중복 키 에러 코드
        */
    }, 10000);
}); 