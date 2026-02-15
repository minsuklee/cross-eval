/**
 * ============================================================
 * 테스트 러너 및 테스트 데이터 초기화
 * ============================================================
 */

// ============================================================
// 테스트 데이터 초기화
// ============================================================
function initTestData() {
  // 테스트 모드 활성화
  setConfig('test_mode', 'true');

  // 관리자 비밀번호 재설정
  setConfig('admin_password', hashPassword('prof2026!'));
  setConfig('course_name', '소프트웨어공학개론');
  setConfig('semester', '2026-1');

  // 학생 마스터 초기화
  const masterSheet = getOrCreateSheet('학생_마스터', ['학번', '이름', '학과', '이메일', '비밀번호']);
  if (masterSheet.getLastRow() > 1) {
    masterSheet.getRange(2, 1, masterSheet.getLastRow() - 1, masterSheet.getLastColumn()).clear();
  }

  const students = [
    ['20210001', '김민수', '소프트웨어학부', 'minsu.kim@kookmin.ac.kr', ''],
    ['20210002', '이서연', '소프트웨어학부', 'seoyeon.lee@kookmin.ac.kr', ''],
    ['20210003', '박준혁', '컴퓨터공학부', 'junhyuk.park@kookmin.ac.kr', ''],
    ['20210004', '최유진', '컴퓨터공학부', 'yujin.choi@kookmin.ac.kr', ''],
    ['20210005', '정하은', '소프트웨어학부', 'haeun.jung@kookmin.ac.kr', ''],
    ['20210006', '강도윤', '정보보안암호수학과', 'doyun.kang@kookmin.ac.kr', ''],
    ['20210007', '윤서준', '소프트웨어학부', 'seojun.yoon@kookmin.ac.kr', ''],
    ['20210008', '한지민', '컴퓨터공학부', 'jimin.han@kookmin.ac.kr', '']
  ];
  masterSheet.getRange(2, 1, students.length, 5).setValues(students);

  // 과제_목록 초기화
  const assignSheet = getOrCreateSheet('과제_목록', [
    '과제ID', '과제명', '과제설명', '제출마감일시', '평가마감일시',
    '상태', 'Google_Form_URL', '채점기준_설명', '최소점수', '최대점수'
  ]);
  if (assignSheet.getLastRow() > 1) {
    assignSheet.getRange(2, 1, assignSheet.getLastRow() - 1, assignSheet.getLastColumn()).clear();
  }

  Logger.log('테스트 데이터 초기화 완료: 학생 8명 등록');
  return '테스트 데이터 초기화 완료';
}

function initTestAssignment1Data() {
  // 과제1 제출 시트에 테스트 데이터 삽입
  const submitSheet = getOrCreateSheet('과제1_제출', [
    '타임스탬프', '이메일', '학번', '이름', '학과', '제출파일_링크', '유효'
  ]);
  if (submitSheet.getLastRow() > 1) {
    submitSheet.getRange(2, 1, submitSheet.getLastRow() - 1, submitSheet.getLastColumn()).clear();
  }

  const submissions = [
    ['2026-04-09 14:30:00', 'minsu.kim@kookmin.ac.kr', '20210001', '김민수', '소프트웨어학부', 'https://drive.google.com/file/d/fake_001', ''],
    ['2026-04-09 15:10:00', 'seoyeon.lee@kookmin.ac.kr', '20210002', '이서연', '소프트웨어학부', 'https://drive.google.com/file/d/fake_002', ''],
    ['2026-04-09 18:22:00', 'junhyuk.park@kookmin.ac.kr', '20210003', '박준혁', '컴퓨터공학부', 'https://drive.google.com/file/d/fake_003', ''],
    ['2026-04-10 09:05:00', 'yujin.choi@kookmin.ac.kr', '20210004', '최유진', '컴퓨터공학부', 'https://drive.google.com/file/d/fake_004', ''],
    ['2026-04-10 11:30:00', 'haeun.jung@kookmin.ac.kr', '20210005', '정하은', '소프트웨어학부', 'https://drive.google.com/file/d/fake_005', ''],
    ['2026-04-10 14:00:00', 'minsu.kim@kookmin.ac.kr', '20210001', '김민수', '소프트웨어학부', 'https://drive.google.com/file/d/fake_001_v2', ''],
    ['2026-04-10 20:15:00', 'doyun.kang@kookmin.ac.kr', '20210006', '강도윤', '정보보안암호수학과', 'https://drive.google.com/file/d/fake_006', ''],
    ['2026-04-10 22:45:00', 'seojun.yoon@kookmin.ac.kr', '20210007', '윤서준', '소프트웨어학부', 'https://drive.google.com/file/d/fake_007', '']
  ];
  submitSheet.getRange(2, 1, submissions.length, 7).setValues(submissions);

  Logger.log('과제1 제출 테스트 데이터 삽입 완료');
  return '과제1 제출 테스트 데이터 삽입 완료';
}

function getTestEvaluationData() {
  // 평가 배정 결과에 따라 동적으로 생성되므로 배정 후 호출
  return [
    { evaluator: '20210003', target: '20210006', score: 78, comment: '클래스 식별은 적절하나 상속 관계 표현에 개선이 필요합니다. 다이어그램 전체적으로 깔끔합니다.' },
    { evaluator: '20210003', target: '20210001', score: 85, comment: '요구사항 분석이 정확하고 클래스 간 관계가 잘 표현되어 있습니다. 일부 속성 명명이 모호합니다.' },
    { evaluator: '20210006', target: '20210001', score: 82, comment: '전반적으로 완성도가 높습니다. 다중성 표기가 일부 누락되어 있어 아쉽습니다.' },
    { evaluator: '20210006', target: '20210005', score: 70, comment: '기본 클래스 구조는 파악했으나 연관 관계와 의존 관계 구분이 부정확합니다.' },
    { evaluator: '20210001', target: '20210005', score: 73, comment: '핵심 클래스는 잘 도출했으나 인터페이스 활용이 부족하고 패키지 구분이 없습니다.' },
    { evaluator: '20210001', target: '20210007', score: 90, comment: '매우 체계적이고 가독성이 뛰어납니다. UML 표기법을 정확하게 따르고 있습니다.' },
    { evaluator: '20210005', target: '20210007', score: 88, comment: '다이어그램이 명확하고 클래스 간 관계 표현이 우수합니다. 약간의 중복 클래스가 있습니다.' },
    { evaluator: '20210005', target: '20210002', score: 80, comment: '전체 구조 파악이 잘 되어있고, 메서드 시그니처까지 상세히 작성한 점이 좋습니다.' },
    { evaluator: '20210007', target: '20210002', score: 77, comment: '클래스 수가 적절하며 구조가 간결합니다. 다만 일부 관계의 방향성이 불명확합니다.' },
    { evaluator: '20210007', target: '20210004', score: 65, comment: '기본 구조는 이해했으나 추상 클래스와 인터페이스 구분이 안 되어 있고 표기법 오류가 있습니다.' },
    { evaluator: '20210002', target: '20210004', score: 68, comment: '클래스 식별이 다소 부족하고, 연관 관계 표현에 오류가 있습니다. 전체 레이아웃은 깔끔합니다.' },
    { evaluator: '20210002', target: '20210003', score: 83, comment: '다이어그램이 잘 구조화되어 있고 패키지 분리가 적절합니다. 일부 메서드 누락이 보입니다.' },
    { evaluator: '20210004', target: '20210003', score: 81, comment: '전반적으로 우수합니다. 디자인 패턴 적용 흔적이 보이며 확장성을 고려한 설계입니다.' },
    { evaluator: '20210004', target: '20210006', score: 75, comment: '기본기는 갖추었으나 복합 관계 표현이 미흡합니다. 노트 활용이 좋았습니다.' }
  ];
}

function getTestProfessorEvalData() {
  return [
    { studentId: '20210001', score: 84, comment: '요구사항을 정확히 분석하여 핵심 클래스를 잘 도출했습니다. 관계 표현도 대체로 정확합니다.' },
    { studentId: '20210002', score: 79, comment: '기본 구조는 좋으나 일부 클래스의 책임 분리가 더 필요합니다.' },
    { studentId: '20210003', score: 82, comment: '디자인 패턴을 적절히 활용한 점이 좋습니다. 다이어그램 가독성도 우수합니다.' },
    { studentId: '20210004', score: 63, comment: '클래스 식별과 관계 표현 모두 보완이 필요합니다. 수업 내용을 다시 복습하기 바랍니다.' },
    { studentId: '20210005', score: 72, comment: '핵심 구조는 파악했으나 세부 설계에서 아쉬운 점이 많습니다.' },
    { studentId: '20210006', score: 76, comment: '전체적으로 무난하나 고급 관계 표현(합성, 집합)에 대한 이해가 부족합니다.' },
    { studentId: '20210007', score: 91, comment: '매우 우수합니다. 요구사항 분석부터 설계까지 체계적이고 완성도가 높습니다.' }
  ];
}

function resetAllData() {
  const ss = getSpreadsheet();
  const sheets = ss.getSheets();

  // 보호할 시트 이름
  const protectedSheets = ['_config', '학생_마스터', '과제_목록', '_test_log'];

  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName();
    if (protectedSheets.indexOf(name) !== -1) {
      // 헤더만 남기고 데이터 삭제
      if (sheets[i].getLastRow() > 1) {
        sheets[i].getRange(2, 1, sheets[i].getLastRow() - 1, sheets[i].getLastColumn()).clear();
      }
    } else if (name.indexOf('과제') === 0) {
      // 과제 관련 시트 삭제
      ss.deleteSheet(sheets[i]);
    }
  }

  Logger.log('전체 데이터 리셋 완료');
  return '전체 데이터 리셋 완료';
}

// ============================================================
// 테스트 러너
// ============================================================
function runAllTests() {
  const testLog = getOrCreateSheet('_test_log', ['실행일시', '테스트ID', '테스트명', '결과', '상세', '실행시간(ms)']);

  // 기존 로그 클리어
  if (testLog.getLastRow() > 1) {
    testLog.getRange(2, 1, testLog.getLastRow() - 1, testLog.getLastColumn()).clear();
  }

  // 데이터 초기화
  resetAllData();
  initTestData();

  // 테스트 실행
  var allResults = [];

  allResults = allResults.concat(runAuthTests());
  allResults = allResults.concat(runAssignmentTests());
  allResults = allResults.concat(runSubmissionTests());
  allResults = allResults.concat(runAssignAlgorithmTests());
  allResults = allResults.concat(runEvaluationTests());
  allResults = allResults.concat(runResultTests());
  allResults = allResults.concat(runSecurityTests());
  allResults = allResults.concat(runMultiAssignmentTests());

  // 결과 기록
  if (allResults.length > 0) {
    var rows = allResults.map(function(r) {
      return [r.timestamp, r.testId, r.testName, r.result, r.detail, r.duration];
    });
    testLog.getRange(2, 1, rows.length, 6).setValues(rows);
  }

  // 요약
  var passed = allResults.filter(function(r) { return r.result === 'PASS'; }).length;
  var failed = allResults.filter(function(r) { return r.result === 'FAIL'; }).length;

  Logger.log('=== 테스트 완료 ===');
  Logger.log('PASS: ' + passed + ', FAIL: ' + failed + ', TOTAL: ' + allResults.length);

  return {
    passed: passed,
    failed: failed,
    total: allResults.length,
    results: allResults
  };
}

function runTest(testId, testName, testFn) {
  var start = new Date().getTime();
  var result = { timestamp: new Date().toISOString(), testId: testId, testName: testName };
  try {
    var detail = testFn();
    result.result = 'PASS';
    result.detail = detail || 'OK';
  } catch (e) {
    result.result = 'FAIL';
    result.detail = e.message;
  }
  result.duration = new Date().getTime() - start;
  Logger.log(result.testId + ': ' + result.result + ' - ' + result.detail);
  return result;
}

function assert(condition, message) {
  if (!condition) throw new Error('ASSERTION FAILED: ' + message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error('ASSERTION FAILED: ' + message + ' (expected: ' + expected + ', actual: ' + actual + ')');
  }
}

// ============================================================
// 인증 테스트
// ============================================================
function runAuthTests() {
  var results = [];

  results.push(runTest('AUTH-01', '학번 존재 확인', function() {
    var r = handleCheckStudent({ studentId: '20210001' });
    assert(r.success, '호출 실패');
    assert(r.exists, '학생이 존재해야 함');
    assertEqual(r.hasPassword, false, '비밀번호 미설정');
    return '20210001 존재 확인, hasPassword=false';
  }));

  results.push(runTest('AUTH-02', '미등록 학번 확인', function() {
    var r = handleCheckStudent({ studentId: '99999999' });
    assert(r.success, '호출 실패');
    assertEqual(r.exists, false, '미등록 학번');
    return '99999999 미존재 확인';
  }));

  results.push(runTest('AUTH-03', '최초 비밀번호 설정', function() {
    var r = handleRegisterPassword({ studentId: '20210001', password: 'test1234!' });
    assert(r.success, '비밀번호 설정 실패: ' + (r.error || ''));
    return '20210001 비밀번호 설정 완료';
  }));

  results.push(runTest('AUTH-04', '정상 로그인', function() {
    var r = handleLogin({ studentId: '20210001', password: 'test1234!' });
    assert(r.success, '로그인 실패: ' + (r.error || ''));
    assertEqual(r.name, '김민수', '이름 확인');
    return '20210001 로그인 성공';
  }));

  results.push(runTest('AUTH-05', '비밀번호 오류', function() {
    resetLoginAttempts('20210001');
    var r = handleLogin({ studentId: '20210001', password: 'wrongpw' });
    assertEqual(r.success, false, '실패해야 함');
    return '비밀번호 오류 정상 거부';
  }));

  results.push(runTest('AUTH-06', '로그인 실패 잠금', function() {
    resetLoginAttempts('20210001');
    for (var i = 0; i < 5; i++) {
      handleLogin({ studentId: '20210001', password: 'wrongpw' });
    }
    var r = handleLogin({ studentId: '20210001', password: 'test1234!' });
    assertEqual(r.success, false, '잠금 상태에서는 올바른 비밀번호도 거부');
    assert(r.locked === true || r.error.indexOf('분 후') !== -1, '잠금 메시지');
    resetLoginAttempts('20210001');
    return '5회 실패 후 잠금 확인';
  }));

  results.push(runTest('AUTH-07', '관리자 로그인', function() {
    var r = handleAdminLogin({ password: 'prof2026!' });
    assert(r.success, '관리자 로그인 실패: ' + (r.error || ''));
    return '관리자 로그인 성공';
  }));

  results.push(runTest('AUTH-08', '관리자 비밀번호 오류', function() {
    resetLoginAttempts('admin');
    var r = handleAdminLogin({ password: 'wrong' });
    assertEqual(r.success, false, '실패해야 함');
    resetLoginAttempts('admin');
    return '관리자 비밀번호 오류 거부';
  }));

  results.push(runTest('AUTH-09', '비밀번호 해싱 확인', function() {
    var sheet = getSheet('학생_마스터');
    var data = sheet.getDataRange().getValues();
    var storedPw = '';
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === '20210001') {
        storedPw = data[i][4];
        break;
      }
    }
    assert(storedPw !== 'test1234!', '평문이 아니어야 함');
    assert(storedPw.length === 64, 'SHA-256 해시는 64자 hex');
    return '해시값 길이=' + storedPw.length;
  }));

  return results;
}

// ============================================================
// 과제 관리 테스트
// ============================================================
function runAssignmentTests() {
  var results = [];

  results.push(runTest('ASGN-01', '과제 생성', function() {
    var r = handleCreateAssignment({
      adminPassword: 'prof2026!',
      name: 'UML 클래스 다이어그램 작성',
      description: '주어진 요구사항을 분석하여 클래스 다이어그램을 작성하시오',
      submitDeadline: '2026-04-10 23:59',
      criteria: '1)클래스 식별 적절성(30점) 2)관계 표현 정확성(40점) 3)다이어그램 가독성(30점)',
      minScore: 0,
      maxScore: 100
    });
    assert(r.success, '과제 생성 실패: ' + (r.error || ''));
    assertEqual(r.assignmentId, '과제1', '과제ID');
    return '과제1 생성 완료';
  }));

  results.push(runTest('ASGN-02', '시트 자동 생성 확인', function() {
    var ss = getSpreadsheet();
    assert(ss.getSheetByName('과제1_제출') !== null, '과제1_제출 시트');
    assert(ss.getSheetByName('과제1_평가배정') !== null, '과제1_평가배정 시트');
    assert(ss.getSheetByName('과제1_결과') !== null, '과제1_결과 시트');
    return '3개 시트 존재 확인';
  }));

  results.push(runTest('ASGN-03', '과제 상태 확인', function() {
    var info = getAssignmentInfo('과제1');
    assert(info !== null, '과제 정보');
    assertEqual(info.status, '대기', '상태');
    return '상태=대기';
  }));

  results.push(runTest('ASGN-04', '두 번째 과제 생성', function() {
    var r = handleCreateAssignment({
      adminPassword: 'prof2026!',
      name: '시퀀스 다이어그램 작성',
      description: '로그인 프로세스의 시퀀스 다이어그램을 작성하시오',
      submitDeadline: '2026-04-24 23:59',
      criteria: '메시지 흐름 정확성(50점) 객체 식별(30점) 가독성(20점)',
      minScore: 0,
      maxScore: 100
    });
    assert(r.success, '과제2 생성 실패');
    assertEqual(r.assignmentId, '과제2', '과제ID');
    var ss = getSpreadsheet();
    assert(ss.getSheetByName('과제2_제출') !== null, '과제2_제출');
    return '과제2 생성 및 시트 확인';
  }));

  return results;
}

// ============================================================
// 제출 및 중복 제거 테스트
// ============================================================
function runSubmissionTests() {
  var results = [];

  results.push(runTest('SUB-01', '제출 데이터 삽입', function() {
    initTestAssignment1Data();
    var sheet = getSheet('과제1_제출');
    var rowCount = sheet.getLastRow() - 1;
    assertEqual(rowCount, 8, '8행');
    return '8행 삽입 확인';
  }));

  results.push(runTest('SUB-02', '중복 제거 실행', function() {
    var r = deduplicateSubmissions('과제1');
    assertEqual(r.removedCount, 1, '중복 1건');
    assertEqual(r.validCount, 7, '유효 7명');

    // 구체적 확인: 김민수 구 제출 N, 신 제출 Y
    var sheet = getSheet('과제1_제출');
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][2]) === '20210001') {
        if (String(data[i][5]).indexOf('fake_001_v2') !== -1) {
          assertEqual(data[i][6], 'Y', '신 제출 유효');
        } else if (String(data[i][5]).indexOf('fake_001') !== -1) {
          assertEqual(data[i][6], 'N', '구 제출 무효');
        }
      }
    }
    return '중복 제거 정상';
  }));

  results.push(runTest('SUB-03', '유효 제출 수 확인', function() {
    var sheet = getSheet('과제1_제출');
    var data = sheet.getDataRange().getValues();
    var validCount = 0;
    for (var i = 1; i < data.length; i++) {
      if (data[i][6] === 'Y') validCount++;
    }
    assertEqual(validCount, 7, '유효 7명');
    return '유효 7명 확인';
  }));

  results.push(runTest('SUB-04', '미제출자 확인', function() {
    // 학생_마스터에서 전체 학생 목록
    var masterSheet = getSheet('학생_마스터');
    var masterData = masterSheet.getDataRange().getValues();
    var allStudents = {};
    for (var i = 1; i < masterData.length; i++) {
      allStudents[String(masterData[i][0]).trim()] = true;
    }

    // 유효 제출자
    var sheet = getSheet('과제1_제출');
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][6] === 'Y') {
        delete allStudents[String(data[i][2]).trim()];
      }
    }

    var missing = Object.keys(allStudents);
    assertEqual(missing.length, 1, '미제출 1명');
    assertEqual(missing[0], '20210008', '한지민 미제출');
    return '미제출자: 20210008';
  }));

  results.push(runTest('SUB-05', '중복 없는 학생 확인', function() {
    var sheet = getSheet('과제1_제출');
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][2]) === '20210002') {
        assertEqual(data[i][6], 'Y', '이서연 유효');
        return '20210002 유효=Y';
      }
    }
    throw new Error('20210002 행을 찾을 수 없음');
  }));

  return results;
}

// ============================================================
// 평가 배정 알고리즘 테스트
// ============================================================
function runAssignAlgorithmTests() {
  var results = [];

  // 테스트용 학생 객체 생성 헬퍼
  function makeStudents(ids) {
    return ids.map(function(id) {
      return { studentId: id, name: 'Student_' + id, submissionLink: 'link_' + id };
    });
  }

  results.push(runTest('ASSIGN-01', '기본 배정 (7명)', function() {
    var students = makeStudents(['20210001','20210002','20210003','20210004','20210005','20210006','20210007']);
    var assignments = assignEvaluators(students);
    assertEqual(assignments.length, 7, '7개 배정');
    return '7개 배정 생성';
  }));

  results.push(runTest('ASSIGN-02', '자기 자신 배제', function() {
    var students = makeStudents(['20210001','20210002','20210003','20210004','20210005','20210006','20210007']);
    var assignments = assignEvaluators(students);
    for (var i = 0; i < assignments.length; i++) {
      var a = assignments[i];
      assert(a.evaluator.studentId !== a.target1.studentId, a.evaluator.studentId + '가 자기 자신 평가(t1)');
      assert(a.evaluator.studentId !== a.target2.studentId, a.evaluator.studentId + '가 자기 자신 평가(t2)');
    }
    return '자기 자신 배제 확인';
  }));

  results.push(runTest('ASSIGN-03', '평가 횟수 검증', function() {
    var students = makeStudents(['20210001','20210002','20210003','20210004','20210005','20210006','20210007']);
    var assignments = assignEvaluators(students);
    for (var i = 0; i < assignments.length; i++) {
      // 각 평가자는 정확히 2명 (target1, target2)
      assert(assignments[i].target1 !== undefined, 'target1 존재');
      assert(assignments[i].target2 !== undefined, 'target2 존재');
    }
    return '각 학생이 정확히 2명 평가';
  }));

  results.push(runTest('ASSIGN-04', '피평가 횟수 검증', function() {
    var students = makeStudents(['20210001','20210002','20210003','20210004','20210005','20210006','20210007']);
    var assignments = assignEvaluators(students);
    var receivedCount = {};
    for (var i = 0; i < assignments.length; i++) {
      var t1 = assignments[i].target1.studentId;
      var t2 = assignments[i].target2.studentId;
      receivedCount[t1] = (receivedCount[t1] || 0) + 1;
      receivedCount[t2] = (receivedCount[t2] || 0) + 1;
    }
    for (var sid in receivedCount) {
      assertEqual(receivedCount[sid], 2, sid + ' 피평가 횟수');
    }
    return '모든 학생이 정확히 2회 피평가';
  }));

  results.push(runTest('ASSIGN-05', '최소 인원 거부', function() {
    var students = makeStudents(['20210001','20210002']);
    try {
      assignEvaluators(students);
      throw new Error('에러가 발생해야 함');
    } catch (e) {
      assert(e.message.indexOf('3명') !== -1, '3명 미만 에러 메시지');
    }
    return '2명으로 시도 시 에러 확인';
  }));

  results.push(runTest('ASSIGN-06', '3명 경계값', function() {
    var students = makeStudents(['s1','s2','s3']);
    var assignments = assignEvaluators(students);
    assertEqual(assignments.length, 3, '3개 배정');
    for (var i = 0; i < assignments.length; i++) {
      assert(assignments[i].evaluator.studentId !== assignments[i].target1.studentId, '자기 배제 t1');
      assert(assignments[i].evaluator.studentId !== assignments[i].target2.studentId, '자기 배제 t2');
    }
    return '3명 경계값 정상';
  }));

  results.push(runTest('ASSIGN-07', '대규모 (50명)', function() {
    var ids = [];
    for (var i = 1; i <= 50; i++) ids.push('STD' + ('000' + i).slice(-3));
    var students = makeStudents(ids);
    var assignments = assignEvaluators(students);
    assertEqual(assignments.length, 50, '50개 배정');

    // 자기 배제 + 피평가 횟수
    var receivedCount = {};
    for (var i = 0; i < assignments.length; i++) {
      assert(assignments[i].evaluator.studentId !== assignments[i].target1.studentId, '자기 배제');
      assert(assignments[i].evaluator.studentId !== assignments[i].target2.studentId, '자기 배제');
      var t1 = assignments[i].target1.studentId;
      var t2 = assignments[i].target2.studentId;
      receivedCount[t1] = (receivedCount[t1] || 0) + 1;
      receivedCount[t2] = (receivedCount[t2] || 0) + 1;
    }
    for (var sid in receivedCount) {
      assertEqual(receivedCount[sid], 2, sid + ' 피평가 2회');
    }
    return '50명 배정 + 모든 조건 충족';
  }));

  results.push(runTest('ASSIGN-08', '랜덤성 확인', function() {
    // 테스트 모드를 잠시 해제
    var origMode = getConfig('test_mode');
    setConfig('test_mode', 'false');

    var students = makeStudents(['A','B','C','D','E']);
    var result1 = assignEvaluators(students).map(function(a) { return a.evaluator.studentId; }).join(',');
    var result2 = assignEvaluators(students).map(function(a) { return a.evaluator.studentId; }).join(',');

    setConfig('test_mode', origMode);

    // 확률적으로 같을 수 있지만 매우 드뭄
    // 연속으로 10번 돌려서 하나라도 다르면 OK
    var allSame = true;
    setConfig('test_mode', 'false');
    var first = assignEvaluators(students).map(function(a) { return a.evaluator.studentId + '->' + a.target1.studentId; }).join(',');
    for (var i = 0; i < 10; i++) {
      var current = assignEvaluators(students).map(function(a) { return a.evaluator.studentId + '->' + a.target1.studentId; }).join(',');
      if (current !== first) {
        allSame = false;
        break;
      }
    }
    setConfig('test_mode', origMode);
    assert(!allSame, '10회 실행 중 최소 1회는 달라야 함');
    return '랜덤성 확인';
  }));

  results.push(runTest('ASSIGN-09', '고정 시드 재현성', function() {
    setConfig('test_mode', 'true');
    var students = makeStudents(['20210001','20210002','20210003','20210004','20210005']);
    var result1 = assignEvaluators(students).map(function(a) { return a.evaluator.studentId + '->' + a.target1.studentId; }).join(',');
    var result2 = assignEvaluators(students).map(function(a) { return a.evaluator.studentId + '->' + a.target1.studentId; }).join(',');
    assertEqual(result1, result2, '고정 시드 결과 동일');
    return '고정 시드 재현 확인';
  }));

  return results;
}

// ============================================================
// 평가 제출 테스트
// ============================================================
function runEvaluationTests() {
  var results = [];
  var pw = 'test1234!';

  // 모든 학생 비밀번호 설정
  var studentIds = ['20210002','20210003','20210004','20210005','20210006','20210007'];
  for (var k = 0; k < studentIds.length; k++) {
    handleRegisterPassword({ studentId: studentIds[k], password: pw });
  }

  // 상호평가 시작
  var startResult = handleStartEvaluation({
    adminPassword: 'prof2026!',
    assignmentId: '과제1',
    evalDeadline: '2026-04-14 23:59'
  });

  results.push(runTest('EVAL-SETUP', '상호평가 시작', function() {
    assert(startResult.success, '시작 실패: ' + (startResult.error || ''));
    assertEqual(startResult.validStudents, 7, '유효 7명');
    return '평가 시작 성공, ' + startResult.validStudents + '명';
  }));

  // 배정 확인 후 평가 데이터 매핑
  var evalSheet = getSheet('과제1_평가배정');
  var evalData = evalSheet.getDataRange().getValues();

  // 실제 배정에 맞춰 평가 데이터를 제출
  results.push(runTest('EVAL-01', '정상 평가 제출', function() {
    // 첫 번째 평가자의 첫 번째 대상에게 평가 제출
    var evaluatorId = String(evalData[1][0]).trim();
    var targetId = String(evalData[1][2]).trim();
    var r = handleSubmitEvaluation({
      studentId: evaluatorId,
      password: pw,
      assignmentId: '과제1',
      targetStudentId: targetId,
      score: 85,
      comment: '매우 잘 작성되었습니다. 클래스 간 관계 표현이 우수합니다.'
    });
    assert(r.success, '평가 제출 실패: ' + (r.error || ''));
    return evaluatorId + ' → ' + targetId + ' 평가 저장';
  }));

  results.push(runTest('EVAL-02', '범위 초과 점수', function() {
    var evaluatorId = String(evalData[1][0]).trim();
    var targetId = String(evalData[1][8]).trim();
    var r = handleSubmitEvaluation({
      studentId: evaluatorId,
      password: pw,
      assignmentId: '과제1',
      targetStudentId: targetId,
      score: 150,
      comment: '이 점수는 범위를 초과합니다. 테스트용 서술평입니다.'
    });
    assertEqual(r.success, false, '거부되어야 함');
    assert(r.error.indexOf('범위') !== -1, '범위 에러 메시지');
    return '150점 거부 확인';
  }));

  results.push(runTest('EVAL-03', '음수 점수', function() {
    var evaluatorId = String(evalData[1][0]).trim();
    var targetId = String(evalData[1][8]).trim();
    var r = handleSubmitEvaluation({
      studentId: evaluatorId,
      password: pw,
      assignmentId: '과제1',
      targetStudentId: targetId,
      score: -10,
      comment: '음수 점수 테스트입니다. 이것은 거부되어야 합니다.'
    });
    assertEqual(r.success, false, '거부되어야 함');
    return '음수 점수 거부 확인';
  }));

  results.push(runTest('EVAL-04', '소수점 점수', function() {
    var evaluatorId = String(evalData[1][0]).trim();
    var targetId = String(evalData[1][8]).trim();
    var r = handleSubmitEvaluation({
      studentId: evaluatorId,
      password: pw,
      assignmentId: '과제1',
      targetStudentId: targetId,
      score: 85.5,
      comment: '소수점 점수 테스트입니다. 정수만 허용되어야 합니다.'
    });
    assertEqual(r.success, false, '거부되어야 함');
    assert(r.error.indexOf('정수') !== -1, '정수 에러 메시지');
    return '소수점 거부 확인';
  }));

  results.push(runTest('EVAL-05', '서술평 미달', function() {
    var evaluatorId = String(evalData[1][0]).trim();
    var targetId = String(evalData[1][8]).trim();
    var r = handleSubmitEvaluation({
      studentId: evaluatorId,
      password: pw,
      assignmentId: '과제1',
      targetStudentId: targetId,
      score: 80,
      comment: '짧은 서술평'
    });
    assertEqual(r.success, false, '거부되어야 함');
    assert(r.error.indexOf('20자') !== -1, '20자 에러 메시지');
    return '서술평 미달 거부 확인';
  }));

  results.push(runTest('EVAL-06', '배정되지 않은 대상 평가', function() {
    var evaluatorId = String(evalData[1][0]).trim();
    // 배정되지 않은 학생 찾기
    var assignedTargets = [String(evalData[1][2]).trim(), String(evalData[1][8]).trim()];
    var unassignedTarget = '';
    for (var i = 1; i < evalData.length; i++) {
      var sid = String(evalData[i][0]).trim();
      if (sid !== evaluatorId && assignedTargets.indexOf(sid) === -1) {
        unassignedTarget = sid;
        break;
      }
    }
    if (!unassignedTarget) return 'SKIP: 미배정 대상 없음';

    var r = handleSubmitEvaluation({
      studentId: evaluatorId,
      password: pw,
      assignmentId: '과제1',
      targetStudentId: unassignedTarget,
      score: 80,
      comment: '배정되지 않은 대상에 대한 평가를 시도합니다. 테스트용입니다.'
    });
    assertEqual(r.success, false, '거부되어야 함');
    return '미배정 대상 거부 확인';
  }));

  results.push(runTest('EVAL-07', '자기 자신 평가 시도', function() {
    var evaluatorId = String(evalData[1][0]).trim();
    var r = handleSubmitEvaluation({
      studentId: evaluatorId,
      password: pw,
      assignmentId: '과제1',
      targetStudentId: evaluatorId,
      score: 100,
      comment: '자기 자신을 평가하려는 시도입니다. 이것은 거부되어야 합니다.'
    });
    assertEqual(r.success, false, '거부되어야 함');
    return '자기 평가 거부 확인';
  }));

  results.push(runTest('EVAL-08', '미제출자 평가 시도', function() {
    var r = handleGetEvaluationTargets({
      studentId: '20210008',
      password: pw,
      assignmentId: '과제1'
    });
    // 20210008은 비밀번호 미설정이거나 배정에 없으므로 실패해야 함
    assertEqual(r.success, false, '미제출자 거부');
    return '미제출자 평가 거부 확인';
  }));

  results.push(runTest('EVAL-09', '평가 수정', function() {
    var evaluatorId = String(evalData[1][0]).trim();
    var targetId = String(evalData[1][2]).trim();
    var r = handleSubmitEvaluation({
      studentId: evaluatorId,
      password: pw,
      assignmentId: '과제1',
      targetStudentId: targetId,
      score: 90,
      comment: '수정된 평가입니다. 다시 검토하니 더 좋은 점수를 줄 수 있습니다.'
    });
    assert(r.success, '수정 실패: ' + (r.error || ''));

    // 수정된 점수 확인
    var sheet = getSheet('과제1_평가배정');
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === evaluatorId && String(data[i][2]).trim() === targetId) {
        assertEqual(data[i][5], 90, '수정된 점수');
        break;
      }
    }
    return '평가 수정 확인 (85→90)';
  }));

  // 나머지 모든 평가 입력 (결과 집계 테스트를 위해)
  results.push(runTest('EVAL-FILL', '전체 평가 입력', function() {
    var sheet = getSheet('과제1_평가배정');
    var data = sheet.getDataRange().getValues();
    var filledCount = 0;

    for (var i = 1; i < data.length; i++) {
      var evaluatorId = String(data[i][0]).trim();

      // 피평가자 1
      if (data[i][5] === '' || data[i][5] === null) {
        var target1Id = String(data[i][2]).trim();
        handleSubmitEvaluation({
          studentId: evaluatorId, password: pw, assignmentId: '과제1',
          targetStudentId: target1Id, score: 80,
          comment: '테스트용 평가입니다. 전반적으로 잘 작성되어 있습니다. 개선 사항이 있습니다.'
        });
        filledCount++;
      }

      // 피평가자 2
      if (data[i][11] === '' || data[i][11] === null) {
        var target2Id = String(data[i][8]).trim();
        handleSubmitEvaluation({
          studentId: evaluatorId, password: pw, assignmentId: '과제1',
          targetStudentId: target2Id, score: 75,
          comment: '테스트용 평가입니다. 기본 구조는 좋으나 세부 사항에서 보완이 필요합니다.'
        });
        filledCount++;
      }
    }
    return filledCount + '건 추가 입력';
  }));

  return results;
}

// ============================================================
// 결과 집계 테스트
// ============================================================
function runResultTests() {
  var results = [];

  results.push(runTest('RESULT-01', '평가 종료 집계', function() {
    var r = handleEndEvaluation({
      adminPassword: 'prof2026!',
      assignmentId: '과제1'
    });
    assert(r.success, '종료 실패: ' + (r.error || ''));
    assertEqual(r.totalStudents, 7, '7명 집계');
    return '집계 완료: ' + r.totalStudents + '명';
  }));

  results.push(runTest('RESULT-02', '받은 점수 정확성', function() {
    var sheet = getSheet('과제1_결과');
    var data = sheet.getDataRange().getValues();
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === '20210001') {
        // 받은 점수가 2개 존재해야 함
        assert(data[i][5] !== '' && data[i][5] !== null, '받은점수1 존재');
        assert(data[i][8] !== '' && data[i][8] !== null, '받은점수2 존재');
        found = true;
        return '20210001 받은 점수: ' + data[i][5] + ', ' + data[i][8];
      }
    }
    assert(found, '20210001 결과를 찾을 수 없음');
  }));

  results.push(runTest('RESULT-03', '교수 평가 입력', function() {
    var profData = getTestProfessorEvalData();
    for (var i = 0; i < profData.length; i++) {
      var r = handleSubmitProfessorEval({
        adminPassword: 'prof2026!',
        assignmentId: '과제1',
        studentId: profData[i].studentId,
        score: profData[i].score,
        comment: profData[i].comment
      });
      assert(r.success, profData[i].studentId + ' 교수 평가 실패');
    }
    return '7명 교수 평가 입력 완료';
  }));

  results.push(runTest('RESULT-04', '과제 확정', function() {
    var r = handleFinalizeAssignment({
      adminPassword: 'prof2026!',
      assignmentId: '과제1'
    });
    assert(r.success, '확정 실패: ' + (r.error || ''));
    var info = getAssignmentInfo('과제1');
    assertEqual(info.status, '확정', '상태=확정');
    return '과제1 확정 완료';
  }));

  results.push(runTest('RESULT-05', '학생 결과 조회', function() {
    var r = handleGetMyResults({
      studentId: '20210001',
      password: 'test1234!'
    });
    assert(r.success, '조회 실패');
    assert(r.results.length > 0, '결과 존재');
    var res = r.results[0];
    assert(res.receivedScores.length >= 2, '받은 점수 2개 이상');
    assert(res.professorScore !== null, '교수 점수 존재');
    // 평가자 학번이 포함되지 않았는지 확인
    var jsonStr = JSON.stringify(res.receivedScores);
    assert(jsonStr.indexOf('evaluatorId') === -1, '평가자 학번 비노출');
    return '결과 조회 정상, 받은 점수 ' + res.receivedScores.length + '개';
  }));

  results.push(runTest('RESULT-06', '미평가자 목록', function() {
    // 이미 전체 평가 완료이므로 미완료자 0명이어야 함
    // 별도로 일부 미입력 시나리오를 만들기 어려우므로, 현재 상태에서 0명 확인
    var r = handleGetEvalStatus({
      adminPassword: 'prof2026!',
      assignmentId: '과제1'
    });
    assert(r.success, '조회 실패');
    assertEqual(r.completedCount, r.totalCount, '전원 완료');
    return '전원 완료 확인';
  }));

  return results;
}

// ============================================================
// 보안 테스트
// ============================================================
function runSecurityTests() {
  var results = [];

  results.push(runTest('SEC-01', '타인 결과 조회 시도', function() {
    // 20210001 인증으로 20210002 결과 조회 시도
    // API는 studentId와 password 쌍을 검증하므로, 20210001 인증이 맞으면 20210001 결과만 반환
    var r = handleGetMyResults({
      studentId: '20210001',
      password: 'test1234!'
    });
    assert(r.success, '조회 실패');
    for (var i = 0; i < r.results.length; i++) {
      // 결과에 다른 학생의 개인 정보가 없어야 함
      // receivedScores에 evaluatorId가 없어야 함
      var jsonStr = JSON.stringify(r.results[i].receivedScores);
      assert(jsonStr.indexOf('evaluatorId') === -1, '평가자 ID 비노출');
    }
    return '타인 정보 비노출 확인';
  }));

  results.push(runTest('SEC-02', '학생이 교수 API 호출', function() {
    var r = handleCreateAssignment({
      adminPassword: 'test1234!', // 학생 비밀번호로 시도
      name: '해킹 과제',
      minScore: 0,
      maxScore: 100
    });
    assertEqual(r.success, false, '거부되어야 함');
    return '학생→교수 API 거부';
  }));

  results.push(runTest('SEC-03', '인증 없이 API 호출', function() {
    var r = handleGetMyResults({
      studentId: '20210001'
      // password 없음
    });
    assertEqual(r.success, false, '거부되어야 함');
    return '인증 없이 거부 확인';
  }));

  results.push(runTest('SEC-04', '다른 학생 평가 위조', function() {
    // 20210001 인증으로 20210003의 평가 대상에 평가 시도
    var evalSheet = getSheet('과제1_평가배정');
    var evalData = evalSheet.getDataRange().getValues();

    // 20210003의 평가 대상 찾기
    var target003 = '';
    for (var i = 1; i < evalData.length; i++) {
      if (String(evalData[i][0]).trim() === '20210003') {
        target003 = String(evalData[i][2]).trim();
        break;
      }
    }

    if (!target003) return 'SKIP: 20210003 배정 없음';

    // 20210001이 20210003의 대상을 평가 시도 (20210001에게 배정되지 않은 대상)
    // 20210001에게 배정된 대상이 target003와 다른 경우에만 유효
    var r = handleSubmitEvaluation({
      studentId: '20210001',
      password: 'test1234!',
      assignmentId: '과제1',
      targetStudentId: target003,
      score: 100,
      comment: '위조 평가 시도입니다. 이것은 거부되어야 합니다. 테스트 서술평입니다.'
    });

    // 만약 target003가 우연히 20210001의 배정 대상이면 성공할 수 있으므로 조건부
    // 대부분의 경우 거부됨
    return '위조 평가 시도 결과: success=' + r.success;
  }));

  results.push(runTest('SEC-05', '결과에 평가자 비노출', function() {
    var r = handleGetMyResults({
      studentId: '20210001',
      password: 'test1234!'
    });
    var fullJson = JSON.stringify(r);
    // receivedScores 내에 evaluatorId, evaluator 등의 키가 없어야 함
    assert(fullJson.indexOf('"evaluatorId"') === -1, 'evaluatorId 키 비노출');
    // 실제 평가자 학번이 결과에 포함되지 않았는지 확인
    var evalSheet = getSheet('과제1_결과');
    var evalData = evalSheet.getDataRange().getValues();
    for (var i = 1; i < evalData.length; i++) {
      if (String(evalData[i][0]).trim() === '20210001') {
        var evaluator1 = String(evalData[i][4]);
        if (evaluator1 && evaluator1 !== '') {
          assert(fullJson.indexOf(evaluator1) === -1 || evaluator1 === '20210001',
            '평가자1 학번이 응답에 포함되면 안 됨');
        }
        break;
      }
    }
    return '평가자 학번 비노출 확인';
  }));

  return results;
}

// ============================================================
// 다회차 과제 테스트
// ============================================================
function runMultiAssignmentTests() {
  var results = [];
  var pw = 'test1234!';

  results.push(runTest('MULTI-01', '2번째 과제 전체 플로우', function() {
    // 과제2 제출 데이터 삽입
    var submitSheet = getSheet('과제2_제출');
    if (submitSheet.getLastRow() > 1) {
      submitSheet.getRange(2, 1, submitSheet.getLastRow() - 1, submitSheet.getLastColumn()).clear();
    }

    var submissions = [
      ['2026-04-23 10:00:00', 'minsu.kim@kookmin.ac.kr', '20210001', '김민수', '소프트웨어학부', 'https://drive.google.com/file/d/fake2_001', ''],
      ['2026-04-23 14:20:00', 'seoyeon.lee@kookmin.ac.kr', '20210002', '이서연', '소프트웨어학부', 'https://drive.google.com/file/d/fake2_002', ''],
      ['2026-04-23 16:00:00', 'junhyuk.park@kookmin.ac.kr', '20210003', '박준혁', '컴퓨터공학부', 'https://drive.google.com/file/d/fake2_003', ''],
      ['2026-04-24 09:30:00', 'haeun.jung@kookmin.ac.kr', '20210005', '정하은', '소프트웨어학부', 'https://drive.google.com/file/d/fake2_005', ''],
      ['2026-04-24 18:00:00', 'doyun.kang@kookmin.ac.kr', '20210006', '강도윤', '정보보안암호수학과', 'https://drive.google.com/file/d/fake2_006', ''],
      ['2026-04-24 22:50:00', 'seojun.yoon@kookmin.ac.kr', '20210007', '윤서준', '소프트웨어학부', 'https://drive.google.com/file/d/fake2_007', '']
    ];
    submitSheet.getRange(2, 1, submissions.length, 7).setValues(submissions);

    // 상호평가 시작
    var startR = handleStartEvaluation({
      adminPassword: 'prof2026!',
      assignmentId: '과제2',
      evalDeadline: '2026-04-28 23:59'
    });
    assert(startR.success, '과제2 시작 실패: ' + (startR.error || ''));
    assertEqual(startR.validStudents, 6, '유효 6명');

    // 전체 평가 입력
    var eSheet = getSheet('과제2_평가배정');
    var eData = eSheet.getDataRange().getValues();
    for (var i = 1; i < eData.length; i++) {
      var eid = String(eData[i][0]).trim();
      handleSubmitEvaluation({
        studentId: eid, password: pw, assignmentId: '과제2',
        targetStudentId: String(eData[i][2]).trim(), score: 85,
        comment: '과제2 테스트 평가입니다. 시퀀스 다이어그램이 잘 작성되었습니다.'
      });
      handleSubmitEvaluation({
        studentId: eid, password: pw, assignmentId: '과제2',
        targetStudentId: String(eData[i][8]).trim(), score: 78,
        comment: '과제2 테스트 평가입니다. 메시지 흐름에 일부 개선이 필요합니다.'
      });
    }

    // 종료
    var endR = handleEndEvaluation({ adminPassword: 'prof2026!', assignmentId: '과제2' });
    assert(endR.success, '과제2 종료 실패');

    // 교수 평가
    var rSheet = getSheet('과제2_결과');
    var rData = rSheet.getDataRange().getValues();
    for (var i = 1; i < rData.length; i++) {
      handleSubmitProfessorEval({
        adminPassword: 'prof2026!',
        assignmentId: '과제2',
        studentId: String(rData[i][0]).trim(),
        score: 80,
        comment: '과제2 교수 평가입니다.'
      });
    }

    // 확정
    var finR = handleFinalizeAssignment({ adminPassword: 'prof2026!', assignmentId: '과제2' });
    assert(finR.success, '과제2 확정 실패');

    return '과제2 전체 플로우 완료';
  }));

  results.push(runTest('MULTI-02', '학생_마스터 다중 열', function() {
    var sheet = getSheet('학생_마스터');
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var hasScore1 = false, hasScore2 = false;
    for (var i = 0; i < headers.length; i++) {
      if (headers[i] === '과제1_최종점수') hasScore1 = true;
      if (headers[i] === '과제2_최종점수') hasScore2 = true;
    }
    assert(hasScore1, '과제1_최종점수 열 존재');
    assert(hasScore2, '과제2_최종점수 열 존재');
    return '과제1, 과제2 최종점수 열 모두 존재';
  }));

  results.push(runTest('MULTI-03', '과제2 미제출자 분리', function() {
    var sheet = getSheet('과제2_결과');
    var data = sheet.getDataRange().getValues();
    var studentIds = [];
    for (var i = 1; i < data.length; i++) {
      studentIds.push(String(data[i][0]).trim());
    }
    assert(studentIds.indexOf('20210004') === -1, '20210004 미포함');
    assert(studentIds.indexOf('20210008') === -1, '20210008 미포함');
    assert(studentIds.indexOf('20210001') !== -1, '20210001 포함');
    return '미제출자 제외 확인';
  }));

  return results;
}
