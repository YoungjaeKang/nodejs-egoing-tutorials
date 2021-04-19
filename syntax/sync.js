var fs = require('fs');

// readFileSync

console.log('A');
var result = fs.readFileSync('syntax/sample.txt', 'utf8');
console.log(result);
console.log('C')

console.log('=======================')

// readFile
console.log('A');
fs.readFile('syntax/sample.txt', 'utf8', function(err, result) {
// readFileSync는 리턴값을 주는데 readFile은 그렇지 않다. 그래서 함수를 세번째 인자로 준다. 그럼 노드가 실행 시켜준다.
// 세번째는 콜백임.
// err가 있으면 err, 두 번째 result는 파일 내용을 리턴
    console.log(result);
});
console.log('C')
// A -> C -> B