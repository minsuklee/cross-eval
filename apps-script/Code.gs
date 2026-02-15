/**
 * ============================================================
 * 수업 과제 상호평가 시스템 - Google Apps Script Backend
 * ============================================================
 * 이 스크립트를 Google Apps Script 프로젝트에 배포합니다.
 * 배포 시: "웹 앱" → "나로 실행" → "모든 사용자 접근 가능"
 * ============================================================
 */

// ============================================================
// 전역 설정
// ============================================================
const SPREADSHEET_ID = '1IEJnG8dlF-zlPAZsXshJmihH9fPXXOWxZr5tGjypJrw';

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet(name) {
  const ss = getSpreadsheet();
  return ss.getSheetByName(name);
}

function getOrCreateSheet(name, headers) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
  }
  return sheet;
}

function ensureConfigSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName('_config');
  if (!sheet) {
    sheet = ss.insertSheet('_config');
    sheet.getRange(1, 1, 1, 2).setValues([['설정키', '설정값']]);
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  }
  return sheet;
}

function getConfig(key) {
  const sheet = ensureConfigSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === key) return data[i][1];
  }
  return null;
}

function setConfig(key, value) {
  const sheet = ensureConfigSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value]);
}

function isTestMode() {
  return getConfig('test_mode') === 'true' || getConfig('test_mode') === true;
}

function ensureCourseListSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName('과목_목록');
  if (!sheet) {
    sheet = ss.insertSheet('과목_목록');
    sheet.getRange(1, 1, 1, 7).setValues([['과목ID', '과목명', '년도', '학기', '스프레드시트ID', '생성일시', '상태']]);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
  }
  return sheet;
}

// ============================================================
// SHA-256 해싱
// ============================================================
function hashPassword(password) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);
  return rawHash.map(function(b) {
    return ('0' + ((b < 0 ? b + 256 : b).toString(16))).slice(-2);
  }).join('');
}

// ============================================================
// 로그인 실패 잠금 (PropertiesService)
// ============================================================
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 10;

function getLoginAttemptKey(studentId) {
  return 'login_attempts_' + studentId;
}

function getLoginLockKey(studentId) {
  return 'login_lock_' + studentId;
}

function checkLoginLock(studentId) {
  const props = PropertiesService.getScriptProperties();
  const lockTime = props.getProperty(getLoginLockKey(studentId));
  if (lockTime) {
    const lockDate = new Date(parseInt(lockTime));
    const now = new Date();
    const diffMinutes = (now - lockDate) / (1000 * 60);
    if (diffMinutes < LOCKOUT_MINUTES) {
      return { locked: true, remainingMinutes: Math.ceil(LOCKOUT_MINUTES - diffMinutes) };
    } else {
      // 잠금 해제
      props.deleteProperty(getLoginLockKey(studentId));
      props.deleteProperty(getLoginAttemptKey(studentId));
      return { locked: false };
    }
  }
  return { locked: false };
}

function recordLoginFailure(studentId) {
  const props = PropertiesService.getScriptProperties();
  const key = getLoginAttemptKey(studentId);
  let attempts = parseInt(props.getProperty(key) || '0');
  attempts++;
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    props.setProperty(getLoginLockKey(studentId), new Date().getTime().toString());
    props.setProperty(key, '0');
    return { locked: true, remainingMinutes: LOCKOUT_MINUTES };
  }
  props.setProperty(key, attempts.toString());
  return { locked: false, attempts: attempts };
}

function resetLoginAttempts(studentId) {
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty(getLoginAttemptKey(studentId));
  props.deleteProperty(getLoginLockKey(studentId));
}

// ============================================================
// HTTP 엔드포인트
// ============================================================
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    let result;

    switch (action) {
      // 인증
      case 'check_student': result = handleCheckStudent(payload); break;
      case 'register_password': result = handleRegisterPassword(payload); break;
      case 'login': result = handleLogin(payload); break;
      case 'admin_login': result = handleAdminLogin(payload); break;

      // 학생용
      case 'get_my_assignments': result = handleGetMyAssignments(payload); break;
      case 'get_evaluation_targets': result = handleGetEvaluationTargets(payload); break;
      case 'submit_evaluation': result = handleSubmitEvaluation(payload); break;
      case 'get_my_results': result = handleGetMyResults(payload); break;

      // 교수용
      case 'create_assignment': result = handleCreateAssignment(payload); break;
      case 'start_evaluation': result = handleStartEvaluation(payload); break;
      case 'end_evaluation': result = handleEndEvaluation(payload); break;
      case 'get_eval_status': result = handleGetEvalStatus(payload); break;
      case 'submit_professor_eval': result = handleSubmitProfessorEval(payload); break;
      case 'finalize_assignment': result = handleFinalizeAssignment(payload); break;
      case 'get_all_results': result = handleGetAllResults(payload); break;
      case 'register_students': result = handleRegisterStudents(payload); break;
      case 'get_assignments_list': result = handleGetAssignmentsList(payload); break;
      case 'reset_password': result = handleResetPassword(payload); break;
      case 'remove_student': result = handleRemoveStudent(payload); break;
      case 'get_students_list': result = handleGetStudentsList(payload); break;
      case 'change_admin_password': result = handleChangeAdminPassword(payload); break;
      case 'get_courses_list': result = handleGetCoursesList(payload); break;
      case 'delete_course': result = handleDeleteCourse(payload); break;
      case 'restore_course': result = handleRestoreCourse(payload); break;

      default:
        result = { success: false, error: '알 수 없는 action: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: '상호평가 시스템 API가 작동 중입니다.'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// 인증 핸들러
// ============================================================
function handleCheckStudent(payload) {
  const studentId = String(payload.studentId).trim();
  const sheet = getSheet('학생_마스터');
  if (!sheet) return { success: false, error: '학생_마스터 시트를 찾을 수 없습니다.' };

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === studentId) {
      return {
        success: true,
        exists: true,
        hasPassword: data[i][2] !== '' && data[i][2] !== null && data[i][2] !== undefined,
        name: data[i][1]
      };
    }
  }
  return { success: true, exists: false };
}

function handleRegisterPassword(payload) {
  const studentId = String(payload.studentId).trim();
  const password = payload.password;

  if (!password || password.length < 4) {
    return { success: false, error: '비밀번호는 최소 4자 이상이어야 합니다.' };
  }

  const sheet = getSheet('학생_마스터');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === studentId) {
      if (data[i][2] !== '' && data[i][2] !== null && data[i][2] !== undefined) {
        return { success: false, error: '이미 비밀번호가 설정되어 있습니다.' };
      }
      const hashedPw = hashPassword(password);
      sheet.getRange(i + 1, 3).setValue(hashedPw);
      resetLoginAttempts(studentId);
      return {
        success: true,
        name: data[i][1]
      };
    }
  }
  return { success: false, error: '등록되지 않은 학번입니다.' };
}

function handleLogin(payload) {
  const studentId = String(payload.studentId).trim();
  const password = payload.password;

  // 잠금 확인
  const lockStatus = checkLoginLock(studentId);
  if (lockStatus.locked) {
    return { success: false, error: lockStatus.remainingMinutes + '분 후에 다시 시도해주세요.', locked: true };
  }

  const sheet = getSheet('학생_마스터');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === studentId) {
      const storedHash = data[i][2];
      if (!storedHash || storedHash === '') {
        return { success: false, error: '비밀번호가 설정되지 않았습니다. 먼저 비밀번호를 설정해주세요.' };
      }
      const inputHash = hashPassword(password);
      if (storedHash === inputHash) {
        resetLoginAttempts(studentId);
        return {
          success: true,
          studentId: studentId,
          name: data[i][1]
        };
      } else {
        const failResult = recordLoginFailure(studentId);
        if (failResult.locked) {
          return { success: false, error: LOCKOUT_MINUTES + '분 후에 다시 시도해주세요.', locked: true };
        }
        return { success: false, error: '비밀번호가 일치하지 않습니다. (' + (MAX_LOGIN_ATTEMPTS - failResult.attempts) + '회 남음)' };
      }
    }
  }
  return { success: false, error: '등록되지 않은 학번입니다.' };
}

function handleAdminLogin(payload) {
  const password = payload.password;
  const storedHash = getConfig('admin_password');

  // 관리자 잠금 확인
  const lockStatus = checkLoginLock('admin');
  if (lockStatus.locked) {
    return { success: false, error: lockStatus.remainingMinutes + '분 후에 다시 시도해주세요.', locked: true };
  }

  // ── v2.0: 초기 비밀번호 로직 ──
  // admin_password가 빈 값(미설정)이면 초기 비밀번호 'minsuk615'로 로그인 허용
  if (!storedHash || storedHash === '') {
    if (password === 'minsuk615') {
      resetLoginAttempts('admin');
      return {
        success: true,
        role: 'admin',
        needPasswordChange: true,  // 프론트엔드에서 비밀번호 변경 강제
        courseName: getConfig('course_name'),
        semester: getConfig('semester')
      };
    } else {
      const failResult = recordLoginFailure('admin');
      if (failResult.locked) {
        return { success: false, error: LOCKOUT_MINUTES + '분 후에 다시 시도해주세요.', locked: true };
      }
      return { success: false, error: '비밀번호가 일치하지 않습니다. (' + (MAX_LOGIN_ATTEMPTS - failResult.attempts) + '회 남음)' };
    }
  }

  // ── 기존: 설정된 비밀번호와 비교 ──
  const inputHash = hashPassword(password);
  if (storedHash === inputHash) {
    resetLoginAttempts('admin');
    return {
      success: true,
      role: 'admin',
      needPasswordChange: false,
      courseName: getConfig('course_name'),
      semester: getConfig('semester')
    };
  } else {
    const failResult = recordLoginFailure('admin');
    if (failResult.locked) {
      return { success: false, error: LOCKOUT_MINUTES + '분 후에 다시 시도해주세요.', locked: true };
    }
    return { success: false, error: '비밀번호가 일치하지 않습니다. (' + (MAX_LOGIN_ATTEMPTS - failResult.attempts) + '회 남음)' };
  }
}

// ── v2.0: 교수 비밀번호 변경 ──
function handleChangeAdminPassword(payload) {
  const currentPassword = payload.currentPassword;
  const newPassword = payload.newPassword;

  if (!newPassword || newPassword.length < 4) {
    return { success: false, error: '새 비밀번호는 최소 4자 이상이어야 합니다.' };
  }

  const storedHash = getConfig('admin_password');

  // 초기 상태(빈 비밀번호)에서 변경하는 경우: 현재 비밀번호가 'minsuk615'인지 확인
  if (!storedHash || storedHash === '') {
    if (currentPassword !== 'minsuk615') {
      return { success: false, error: '현재 비밀번호가 일치하지 않습니다.' };
    }
  } else {
    // 설정된 비밀번호와 비교
    if (hashPassword(currentPassword) !== storedHash) {
      return { success: false, error: '현재 비밀번호가 일치하지 않습니다.' };
    }
  }

  // 새 비밀번호 저장
  setConfig('admin_password', hashPassword(newPassword));

  return { success: true, message: '비밀번호가 변경되었습니다.' };
}

// ============================================================
// 학생용 핸들러
// ============================================================
function handleGetMyAssignments(payload) {
  const studentId = String(payload.studentId).trim();
  const authResult = verifyStudent(studentId, payload.password);
  if (!authResult.success) return authResult;

  const assignSheet = getSheet('과제_목록');
  if (!assignSheet) return { success: true, assignments: [] };

  const data = assignSheet.getDataRange().getValues();
  const assignments = [];

  for (let i = 1; i < data.length; i++) {
    const assignmentId = data[i][0];
    const status = data[i][5];

    let myEvalStatus = 'none';
    if (status === '평가중' || status === '평가완료' || status === '확정') {
      // 평가 배정 확인
      const evalSheet = getSheet(assignmentId + '_평가배정');
      if (evalSheet) {
        const evalData = evalSheet.getDataRange().getValues();
        for (let j = 1; j < evalData.length; j++) {
          if (String(evalData[j][0]).trim() === studentId) {
            const score1 = evalData[j][5];
            const score2 = evalData[j][11];
            if (score1 !== '' && score1 !== null && score2 !== '' && score2 !== null) {
              myEvalStatus = 'completed';
            } else {
              myEvalStatus = 'pending';
            }
            break;
          }
        }
      }
    }

    assignments.push({
      assignmentId: assignmentId,
      name: data[i][1],
      description: data[i][2],
      submitDeadline: data[i][3],
      evalDeadline: data[i][4],
      status: status,
      criteria: data[i][7],
      minScore: data[i][8],
      maxScore: data[i][9],
      myEvalStatus: myEvalStatus
    });
  }

  return { success: true, assignments: assignments };
}

function handleGetEvaluationTargets(payload) {
  const studentId = String(payload.studentId).trim();
  const authResult = verifyStudent(studentId, payload.password);
  if (!authResult.success) return authResult;

  const assignmentId = payload.assignmentId;

  // 과제 상태 확인
  const assignment = getAssignmentInfo(assignmentId);
  if (!assignment) return { success: false, error: '과제를 찾을 수 없습니다.' };
  if (assignment.status !== '평가중') {
    return { success: false, error: '현재 평가 기간이 아닙니다.' };
  }

  const evalSheet = getSheet(assignmentId + '_평가배정');
  if (!evalSheet) return { success: false, error: '평가 배정 정보가 없습니다.' };

  const data = evalSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === studentId) {
      return {
        success: true,
        targets: [
          {
            targetStudentId: String(data[i][2]),
            targetName: data[i][3],
            submissionLink: data[i][4],
            score: data[i][5] !== '' ? data[i][5] : null,
            comment: data[i][6] !== '' ? data[i][6] : null,
            completedAt: data[i][7] !== '' ? data[i][7] : null
          },
          {
            targetStudentId: String(data[i][8]),
            targetName: data[i][9],
            submissionLink: data[i][10],
            score: data[i][11] !== '' ? data[i][11] : null,
            comment: data[i][12] !== '' ? data[i][12] : null,
            completedAt: data[i][13] !== '' ? data[i][13] : null
          }
        ],
        criteria: assignment.criteria,
        minScore: assignment.minScore,
        maxScore: assignment.maxScore
      };
    }
  }
  return { success: false, error: '평가 배정을 찾을 수 없습니다. 과제를 제출하지 않았을 수 있습니다.' };
}

function handleSubmitEvaluation(payload) {
  const studentId = String(payload.studentId).trim();
  const authResult = verifyStudent(studentId, payload.password);
  if (!authResult.success) return authResult;

  const assignmentId = payload.assignmentId;
  const targetStudentId = String(payload.targetStudentId).trim();
  const score = payload.score;
  const comment = payload.comment;

  // 과제 상태 확인
  const assignment = getAssignmentInfo(assignmentId);
  if (!assignment) return { success: false, error: '과제를 찾을 수 없습니다.' };
  if (assignment.status !== '평가중') {
    return { success: false, error: '현재 평가 기간이 아닙니다.' };
  }

  // 마감 확인 (테스트 모드가 아닐 때)
  if (!isTestMode() && assignment.evalDeadline) {
    const deadline = new Date(assignment.evalDeadline);
    if (new Date() > deadline) {
      return { success: false, error: '평가 마감일시가 지났습니다.' };
    }
  }

  // 점수 유효성 검사
  if (score === null || score === undefined || score === '') {
    return { success: false, error: '점수를 입력해주세요.' };
  }
  const numScore = Number(score);
  if (!Number.isInteger(numScore)) {
    return { success: false, error: '점수는 정수만 입력 가능합니다.' };
  }
  if (numScore < assignment.minScore || numScore > assignment.maxScore) {
    return { success: false, error: '점수는 ' + assignment.minScore + '~' + assignment.maxScore + ' 범위여야 합니다.' };
  }

  // 서술평 유효성
  if (!comment || comment.trim().length < 20) {
    return { success: false, error: '서술평은 최소 20자 이상이어야 합니다.' };
  }

  // 자기 자신 평가 방지
  if (studentId === targetStudentId) {
    return { success: false, error: '자기 자신을 평가할 수 없습니다.' };
  }

  // 평가 배정 확인 및 기록
  const evalSheet = getSheet(assignmentId + '_평가배정');
  if (!evalSheet) return { success: false, error: '평가 배정 시트를 찾을 수 없습니다.' };

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const data = evalSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === studentId) {
        const now = new Date().toISOString();
        if (String(data[i][2]).trim() === targetStudentId) {
          // 피평가자 1
          evalSheet.getRange(i + 1, 6).setValue(numScore);
          evalSheet.getRange(i + 1, 7).setValue(comment.trim());
          evalSheet.getRange(i + 1, 8).setValue(now);
          lock.releaseLock();
          return { success: true, message: '평가가 저장되었습니다.', targetIndex: 1 };
        } else if (String(data[i][8]).trim() === targetStudentId) {
          // 피평가자 2
          evalSheet.getRange(i + 1, 12).setValue(numScore);
          evalSheet.getRange(i + 1, 13).setValue(comment.trim());
          evalSheet.getRange(i + 1, 14).setValue(now);
          lock.releaseLock();
          return { success: true, message: '평가가 저장되었습니다.', targetIndex: 2 };
        }
        lock.releaseLock();
        return { success: false, error: '해당 학생은 귀하의 평가 대상이 아닙니다.' };
      }
    }
    lock.releaseLock();
    return { success: false, error: '평가 배정을 찾을 수 없습니다.' };
  } catch (e) {
    lock.releaseLock();
    throw e;
  }
}

function handleGetMyResults(payload) {
  const studentId = String(payload.studentId).trim();
  const authResult = verifyStudent(studentId, payload.password);
  if (!authResult.success) return authResult;

  const assignSheet = getSheet('과제_목록');
  if (!assignSheet) return { success: true, results: [] };

  const assignData = assignSheet.getDataRange().getValues();
  const results = [];

  for (let i = 1; i < assignData.length; i++) {
    const assignmentId = assignData[i][0];
    const status = assignData[i][5];

    if (status !== '확정') continue;

    const resultSheet = getSheet(assignmentId + '_결과');
    if (!resultSheet) continue;

    const resultData = resultSheet.getDataRange().getValues();
    for (let j = 1; j < resultData.length; j++) {
      if (String(resultData[j][0]).trim() === studentId) {
        // 평가자 학번은 반환하지 않음 (익명성 보장)
        const myResult = {
          assignmentId: assignmentId,
          assignmentName: assignData[i][1],
          submittedAt: resultData[j][2],
          submissionLink: resultData[j][3],
          receivedScores: [],
          givenEvaluations: [],
          professorScore: resultData[j][19] !== '' ? resultData[j][19] : null,
          professorComment: resultData[j][20] !== '' ? resultData[j][20] : null
        };

        // 받은 평가 (평가자 학번 비노출)
        if (resultData[j][5] !== '' && resultData[j][5] !== null) {
          myResult.receivedScores.push({ score: resultData[j][5], comment: resultData[j][6] });
        }
        if (resultData[j][8] !== '' && resultData[j][8] !== null) {
          myResult.receivedScores.push({ score: resultData[j][8], comment: resultData[j][9] });
        }
        if (resultData[j][11] !== '' && resultData[j][11] !== null) {
          myResult.receivedScores.push({ score: resultData[j][11], comment: resultData[j][12] });
        }

        // 내가 한 평가
        if (resultData[j][13] !== '' && resultData[j][13] !== null) {
          myResult.givenEvaluations.push({
            targetStudentId: String(resultData[j][13]),
            score: resultData[j][14],
            comment: resultData[j][15]
          });
        }
        if (resultData[j][16] !== '' && resultData[j][16] !== null) {
          myResult.givenEvaluations.push({
            targetStudentId: String(resultData[j][16]),
            score: resultData[j][17],
            comment: resultData[j][18]
          });
        }

        results.push(myResult);
        break;
      }
    }
  }

  return { success: true, results: results };
}

// ============================================================
// 교수용 핸들러
// ============================================================
function handleCreateAssignment(payload) {
  const adminAuth = verifyAdmin(payload.adminPassword);
  if (!adminAuth.success) return adminAuth;

  const assignSheet = getOrCreateSheet('과제_목록', [
    '과제ID', '과제명', '과제설명', '제출마감일시', '평가마감일시',
    '상태', 'Google_Form_URL', '채점기준_설명', '최소점수', '최대점수'
  ]);

  // 다음 과제 ID 결정
  const data = assignSheet.getDataRange().getValues();
  const nextNum = data.length; // 헤더 제외하면 data.length-1개 존재, 새로 추가하면 번호는 data.length
  const assignmentId = '과제' + nextNum;

  // 과제_목록에 행 추가
  assignSheet.appendRow([
    assignmentId,
    payload.name,
    payload.description || '',
    payload.submitDeadline || '',
    '', // 평가마감일시 (나중에 설정)
    '대기',
    '', // Google Form URL (나중에 설정 또는 자동 생성)
    payload.criteria || '',
    payload.minScore || 0,
    payload.maxScore || 100
  ]);

  // 관련 시트 생성
  getOrCreateSheet(assignmentId + '_제출', [
    '타임스탬프', '이메일', '학번', '이름', '학과', '제출파일_링크', '유효'
  ]);

  getOrCreateSheet(assignmentId + '_평가배정', [
    '평가자_학번', '평가자_이름',
    '피평가자1_학번', '피평가자1_이름', '피평가자1_제출링크', '평가1_점수', '평가1_서술평', '평가1_완료시각',
    '피평가자2_학번', '피평가자2_이름', '피평가자2_제출링크', '평가2_점수', '평가2_서술평', '평가2_완료시각'
  ]);

  getOrCreateSheet(assignmentId + '_결과', [
    '학번', '이름', '제출일', '제출파일_링크',
    '평가자1_학번', '받은점수1', '받은서술평1',
    '평가자2_학번', '받은점수2', '받은서술평2',
    '평가자3_학번', '받은점수3', '받은서술평3',
    '평가한_대상1_학번', '평가한_점수1', '평가한_서술평1',
    '평가한_대상2_학번', '평가한_점수2', '평가한_서술평2',
    '교수_점수', '교수_서술평'
  ]);

  return {
    success: true,
    assignmentId: assignmentId,
    message: assignmentId + ' 생성 완료. 관련 시트 3개가 생성되었습니다.'
  };
}

function handleStartEvaluation(payload) {
  const adminAuth = verifyAdmin(payload.adminPassword);
  if (!adminAuth.success) return adminAuth;

  const assignmentId = payload.assignmentId;
  const evalDeadline = payload.evalDeadline;

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    // 1. 중복 제출 정리
    const dedupeResult = deduplicateSubmissions(assignmentId);

    // 2. 유효 제출자 목록 추출
    const submitSheet = getSheet(assignmentId + '_제출');
    const submitData = submitSheet.getDataRange().getValues();
    const validStudents = [];

    for (let i = 1; i < submitData.length; i++) {
      if (submitData[i][6] === 'Y') {
        validStudents.push({
          studentId: String(submitData[i][2]).trim(),
          name: submitData[i][3],
          submissionLink: submitData[i][5],
          timestamp: submitData[i][0]
        });
      }
    }

    if (validStudents.length < 3) {
      lock.releaseLock();
      return {
        success: false,
        error: '유효 제출자가 ' + validStudents.length + '명입니다. 최소 3명 이상이어야 상호평가가 가능합니다.'
      };
    }

    // 3. 평가 배정
    const assignments = assignEvaluators(validStudents);

    // 4. 평가배정 시트에 기록
    const evalSheet = getSheet(assignmentId + '_평가배정');
    // 기존 데이터 클리어 (헤더 유지)
    if (evalSheet.getLastRow() > 1) {
      evalSheet.getRange(2, 1, evalSheet.getLastRow() - 1, evalSheet.getLastColumn()).clear();
    }

    const evalRows = assignments.map(function(a) {
      return [
        a.evaluator.studentId, a.evaluator.name,
        a.target1.studentId, a.target1.name, a.target1.submissionLink, '', '', '',
        a.target2.studentId, a.target2.name, a.target2.submissionLink, '', '', ''
      ];
    });
    if (evalRows.length > 0) {
      evalSheet.getRange(2, 1, evalRows.length, 14).setValues(evalRows);
    }

    // 5. 과제 상태 변경
    updateAssignmentStatus(assignmentId, '평가중');
    updateAssignmentEvalDeadline(assignmentId, evalDeadline);

    lock.releaseLock();

    return {
      success: true,
      message: '상호평가가 시작되었습니다.',
      validStudents: validStudents.length,
      totalAssignments: assignments.length,
      dedupeResult: dedupeResult
    };
  } catch (e) {
    lock.releaseLock();
    throw e;
  }
}

function handleEndEvaluation(payload) {
  const adminAuth = verifyAdmin(payload.adminPassword);
  if (!adminAuth.success) return adminAuth;

  const assignmentId = payload.assignmentId;

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    // 평가 결과 집계
    const evalSheet = getSheet(assignmentId + '_평가배정');
    const resultSheet = getSheet(assignmentId + '_결과');
    const submitSheet = getSheet(assignmentId + '_제출');

    if (!evalSheet || !resultSheet || !submitSheet) {
      lock.releaseLock();
      return { success: false, error: '필요한 시트를 찾을 수 없습니다.' };
    }

    const evalData = evalSheet.getDataRange().getValues();
    const submitData = submitSheet.getDataRange().getValues();

    // 학생별 받은 평가 수집
    const receivedEvals = {}; // studentId -> [{score, comment, evaluatorId}]
    const givenEvals = {};    // studentId -> [{targetId, score, comment}]
    const incompletelist = [];

    for (let i = 1; i < evalData.length; i++) {
      const evaluatorId = String(evalData[i][0]).trim();

      // 피평가자 1
      const target1Id = String(evalData[i][2]).trim();
      const score1 = evalData[i][5];
      const comment1 = evalData[i][6];
      if (score1 !== '' && score1 !== null && score1 !== undefined) {
        if (!receivedEvals[target1Id]) receivedEvals[target1Id] = [];
        receivedEvals[target1Id].push({ score: score1, comment: comment1, evaluatorId: evaluatorId });
        if (!givenEvals[evaluatorId]) givenEvals[evaluatorId] = [];
        givenEvals[evaluatorId].push({ targetId: target1Id, score: score1, comment: comment1 });
      } else {
        incompletelist.push({ evaluator: evaluatorId, target: target1Id, targetIndex: 1 });
      }

      // 피평가자 2
      const target2Id = String(evalData[i][8]).trim();
      const score2 = evalData[i][11];
      const comment2 = evalData[i][12];
      if (score2 !== '' && score2 !== null && score2 !== undefined) {
        if (!receivedEvals[target2Id]) receivedEvals[target2Id] = [];
        receivedEvals[target2Id].push({ score: score2, comment: comment2, evaluatorId: evaluatorId });
        if (!givenEvals[evaluatorId]) givenEvals[evaluatorId] = [];
        givenEvals[evaluatorId].push({ targetId: target2Id, score: score2, comment: comment2 });
      } else {
        incompletelist.push({ evaluator: evaluatorId, target: target2Id, targetIndex: 2 });
      }
    }

    // 결과 시트 생성
    if (resultSheet.getLastRow() > 1) {
      resultSheet.getRange(2, 1, resultSheet.getLastRow() - 1, resultSheet.getLastColumn()).clear();
    }

    // 유효 제출자 정보
    const validSubmissions = {};
    for (let i = 1; i < submitData.length; i++) {
      if (submitData[i][6] === 'Y') {
        validSubmissions[String(submitData[i][2]).trim()] = {
          name: submitData[i][3],
          timestamp: submitData[i][0],
          link: submitData[i][5]
        };
      }
    }

    const resultRows = [];
    const studentIds = Object.keys(validSubmissions);

    for (let k = 0; k < studentIds.length; k++) {
      const sid = studentIds[k];
      const sub = validSubmissions[sid];
      const received = receivedEvals[sid] || [];
      const given = givenEvals[sid] || [];

      const row = [
        sid, sub.name, sub.timestamp, sub.link,
        received.length > 0 ? received[0].evaluatorId : '', received.length > 0 ? received[0].score : '', received.length > 0 ? received[0].comment : '',
        received.length > 1 ? received[1].evaluatorId : '', received.length > 1 ? received[1].score : '', received.length > 1 ? received[1].comment : '',
        received.length > 2 ? received[2].evaluatorId : '', received.length > 2 ? received[2].score : '', received.length > 2 ? received[2].comment : '',
        given.length > 0 ? given[0].targetId : '', given.length > 0 ? given[0].score : '', given.length > 0 ? given[0].comment : '',
        given.length > 1 ? given[1].targetId : '', given.length > 1 ? given[1].score : '', given.length > 1 ? given[1].comment : '',
        '', '' // 교수 점수, 서술평 (나중에)
      ];
      resultRows.push(row);
    }

    if (resultRows.length > 0) {
      resultSheet.getRange(2, 1, resultRows.length, 21).setValues(resultRows);
    }

    // 상태 변경
    updateAssignmentStatus(assignmentId, '평가완료');

    lock.releaseLock();

    return {
      success: true,
      message: '평가가 종료되고 결과가 집계되었습니다.',
      totalStudents: studentIds.length,
      incompleteEvaluations: incompletelist
    };
  } catch (e) {
    lock.releaseLock();
    throw e;
  }
}

function handleGetEvalStatus(payload) {
  const adminAuth = verifyAdmin(payload.adminPassword);
  if (!adminAuth.success) return adminAuth;

  const assignmentId = payload.assignmentId;
  const evalSheet = getSheet(assignmentId + '_평가배정');
  if (!evalSheet) return { success: false, error: '평가 배정 시트가 없습니다.' };

  const data = evalSheet.getDataRange().getValues();
  const students = [];
  let completedCount = 0;
  let totalCount = 0;

  for (let i = 1; i < data.length; i++) {
    const eval1Done = data[i][5] !== '' && data[i][5] !== null && data[i][5] !== undefined;
    const eval2Done = data[i][11] !== '' && data[i][11] !== null && data[i][11] !== undefined;
    const allDone = eval1Done && eval2Done;

    students.push({
      studentId: String(data[i][0]),
      name: data[i][1],
      eval1Done: eval1Done,
      eval2Done: eval2Done,
      allDone: allDone
    });

    totalCount++;
    if (allDone) completedCount++;
  }

  return {
    success: true,
    students: students,
    completedCount: completedCount,
    totalCount: totalCount,
    progress: totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0
  };
}

function handleSubmitProfessorEval(payload) {
  const adminAuth = verifyAdmin(payload.adminPassword);
  if (!adminAuth.success) return adminAuth;

  const assignmentId = payload.assignmentId;
  const studentId = String(payload.studentId).trim();
  const score = Number(payload.score);
  const comment = payload.comment || '';

  const resultSheet = getSheet(assignmentId + '_결과');
  if (!resultSheet) return { success: false, error: '결과 시트를 찾을 수 없습니다.' };

  const data = resultSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === studentId) {
      resultSheet.getRange(i + 1, 20).setValue(score);
      resultSheet.getRange(i + 1, 21).setValue(comment);
      return { success: true, message: studentId + ' 교수 평가 저장 완료.' };
    }
  }
  return { success: false, error: '해당 학생을 결과 시트에서 찾을 수 없습니다.' };
}

function handleFinalizeAssignment(payload) {
  const adminAuth = verifyAdmin(payload.adminPassword);
  if (!adminAuth.success) return adminAuth;

  const assignmentId = payload.assignmentId;

  // 결과 시트에서 교수 평가 완료 여부 확인
  const resultSheet = getSheet(assignmentId + '_결과');
  if (!resultSheet) return { success: false, error: '결과 시트를 찾을 수 없습니다.' };

  const data = resultSheet.getDataRange().getValues();
  const incomplete = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][19] === '' || data[i][19] === null || data[i][19] === undefined) {
      incomplete.push({ studentId: String(data[i][0]), name: data[i][1] });
    }
  }

  if (incomplete.length > 0 && !payload.force) {
    return {
      success: false,
      error: '교수 평가가 완료되지 않은 학생이 ' + incomplete.length + '명 있습니다.',
      incomplete: incomplete
    };
  }

  // 학생_마스터에 최종 점수 기록
  const masterSheet = getSheet('학생_마스터');
  const masterData = masterSheet.getDataRange().getValues();
  const headers = masterData[0];

  // 과제 점수 열 찾기 또는 추가
  let scoreColIndex = -1;
  const colName = assignmentId + '_최종점수';
  for (let c = 0; c < headers.length; c++) {
    if (headers[c] === colName) {
      scoreColIndex = c;
      break;
    }
  }
  if (scoreColIndex === -1) {
    scoreColIndex = headers.length;
    masterSheet.getRange(1, scoreColIndex + 1).setValue(colName);
  }

  // 점수 기록
  for (let i = 1; i < data.length; i++) {
    const sid = String(data[i][0]).trim();
    const profScore = data[i][19];
    for (let j = 1; j < masterData.length; j++) {
      if (String(masterData[j][0]).trim() === sid) {
        masterSheet.getRange(j + 1, scoreColIndex + 1).setValue(profScore);
        break;
      }
    }
  }

  updateAssignmentStatus(assignmentId, '확정');

  return { success: true, message: assignmentId + ' 확정 완료. 학생에게 결과가 공개됩니다.' };
}

function handleGetAllResults(payload) {
  const adminAuth = verifyAdmin(payload.adminPassword);
  if (!adminAuth.success) return adminAuth;

  const assignmentId = payload.assignmentId;
  const resultSheet = getSheet(assignmentId + '_결과');
  if (!resultSheet) return { success: false, error: '결과 시트를 찾을 수 없습니다.' };

  const data = resultSheet.getDataRange().getValues();
  const results = [];

  for (let i = 1; i < data.length; i++) {
    results.push({
      studentId: String(data[i][0]),
      name: data[i][1],
      submittedAt: data[i][2],
      submissionLink: data[i][3],
      received: [
        { evaluatorId: String(data[i][4]), score: data[i][5], comment: data[i][6] },
        { evaluatorId: String(data[i][7]), score: data[i][8], comment: data[i][9] },
        { evaluatorId: String(data[i][10]), score: data[i][11], comment: data[i][12] }
      ].filter(function(r) { return r.score !== '' && r.score !== null && r.score !== undefined; }),
      given: [
        { targetId: String(data[i][13]), score: data[i][14], comment: data[i][15] },
        { targetId: String(data[i][16]), score: data[i][17], comment: data[i][18] }
      ].filter(function(g) { return g.score !== '' && g.score !== null && g.score !== undefined; }),
      professorScore: data[i][19],
      professorComment: data[i][20]
    });
  }

  return { success: true, results: results };
}

function handleRegisterStudents(payload) {
  const adminAuth = verifyAdmin(payload.adminPassword);
  if (!adminAuth.success) return adminAuth;

  const students = payload.students; // [{studentId, name}]
  const sheet = getOrCreateSheet('학생_마스터', ['학번', '이름', '비밀번호']);

  const existing = {};
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    existing[String(data[i][0]).trim()] = true;
  }

  let addedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const sid = String(s.studentId).trim();
    if (existing[sid]) {
      skippedCount++;
      continue;
    }
    sheet.appendRow([sid, s.name, '']);
    existing[sid] = true;
    addedCount++;
  }

  return {
    success: true,
    message: addedCount + '명 등록, ' + skippedCount + '명 중복 건너뜀.',
    addedCount: addedCount,
    skippedCount: skippedCount
  };
}

function handleGetAssignmentsList(payload) {
  const adminAuth = verifyAdmin(payload.adminPassword);
  if (!adminAuth.success) return adminAuth;

  const sheet = getSheet('과제_목록');
  if (!sheet) return { success: true, assignments: [] };

  const data = sheet.getDataRange().getValues();
  const assignments = [];
  for (let i = 1; i < data.length; i++) {
    assignments.push({
      assignmentId: data[i][0],
      name: data[i][1],
      description: data[i][2],
      submitDeadline: data[i][3],
      evalDeadline: data[i][4],
      status: data[i][5],
      formUrl: data[i][6],
      criteria: data[i][7],
      minScore: data[i][8],
      maxScore: data[i][9]
    });
  }
  return { success: true, assignments: assignments };
}

function handleResetPassword(payload) {
  const adminAuth = verifyAdmin(payload.adminPassword);
  if (!adminAuth.success) return adminAuth;

  const studentId = String(payload.studentId).trim();
  const sheet = getSheet('학생_마스터');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === studentId) {
      sheet.getRange(i + 1, 3).setValue('');
      resetLoginAttempts(studentId);
      return { success: true, message: studentId + ' 비밀번호 초기화 완료.' };
    }
  }
  return { success: false, error: '학생을 찾을 수 없습니다.' };
}

function handleRemoveStudent(payload) {
  const adminAuth = verifyAdmin(payload.adminPassword);
  if (!adminAuth.success) return adminAuth;

  const studentId = String(payload.studentId).trim();
  if (!studentId) {
    return { success: false, error: '학번이 필요합니다.' };
  }

  const sheet = getSheet('학생_마스터');
  if (!sheet) return { success: false, error: '학생_마스터 시트를 찾을 수 없습니다.' };

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === studentId) {
      sheet.deleteRow(i + 1);
      return { success: true, message: studentId + ' 학생이 제거되었습니다.' };
    }
  }
  return { success: false, error: '등록되지 않은 학번입니다.' };
}

function handleGetStudentsList(payload) {
  const adminAuth = verifyAdmin(payload.adminPassword);
  if (!adminAuth.success) return adminAuth;

  const sheet = getSheet('학생_마스터');
  if (!sheet) return { success: true, students: [] };

  const data = sheet.getDataRange().getValues();
  const students = [];
  for (let i = 1; i < data.length; i++) {
    students.push({
      studentId: String(data[i][0]),
      name: data[i][1],
      hasPassword: data[i][2] !== '' && data[i][2] !== null && data[i][2] !== undefined
    });
  }
  return { success: true, students: students };
}

function handleGetCoursesList(payload) {
  const adminAuth = verifyAdmin(payload.adminPassword);
  if (!adminAuth.success) return adminAuth;

  const sheet = ensureCourseListSheet();
  const data = sheet.getDataRange().getValues();
  const courses = [];

  for (let i = 1; i < data.length; i++) {
    courses.push({
      courseId: String(data[i][0]).trim(),
      courseName: data[i][1] || '',
      year: data[i][2] || '',
      semester: data[i][3] || '',
      spreadsheetId: data[i][4] || '',
      createdAt: data[i][5] || '',
      status: data[i][6] || '활성'
    });
  }

  return { success: true, courses: courses };
}

function handleDeleteCourse(payload) {
  const adminAuth = verifyAdmin(payload.adminPassword);
  if (!adminAuth.success) return adminAuth;

  const courseId = payload.courseId;
  if (!courseId) return { success: false, error: '과목ID가 필요합니다.' };

  const sheet = ensureCourseListSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === courseId) {
      if (data[i][6] === '삭제됨') {
        return { success: false, error: '이미 삭제된 과목입니다.' };
      }
      sheet.getRange(i + 1, 7).setValue('삭제됨');
      return { success: true, message: '\'' + data[i][1] + '\' 과목이 삭제되었습니다. (데이터는 보존됨)' };
    }
  }
  return { success: false, error: '과목을 찾을 수 없습니다.' };
}

function handleRestoreCourse(payload) {
  const adminAuth = verifyAdmin(payload.adminPassword);
  if (!adminAuth.success) return adminAuth;

  const courseId = payload.courseId;
  if (!courseId) return { success: false, error: '과목ID가 필요합니다.' };

  const sheet = ensureCourseListSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === courseId) {
      if (data[i][6] !== '삭제됨') {
        return { success: false, error: '삭제된 과목이 아닙니다.' };
      }
      sheet.getRange(i + 1, 7).setValue('활성');
      return { success: true, message: '\'' + data[i][1] + '\' 과목이 복원되었습니다.' };
    }
  }
  return { success: false, error: '과목을 찾을 수 없습니다.' };
}

// ============================================================
// 유틸리티 함수
// ============================================================
function verifyStudent(studentId, password) {
  if (!studentId || !password) {
    return { success: false, error: '학번과 비밀번호를 입력해주세요.' };
  }

  const lockStatus = checkLoginLock(studentId);
  if (lockStatus.locked) {
    return { success: false, error: lockStatus.remainingMinutes + '분 후에 다시 시도해주세요.' };
  }

  const sheet = getSheet('학생_마스터');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === studentId) {
      const storedHash = data[i][4];
      if (!storedHash) return { success: false, error: '비밀번호가 설정되지 않았습니다.' };
      if (storedHash === hashPassword(password)) {
        return { success: true };
      }
      return { success: false, error: '인증에 실패했습니다.' };
    }
  }
  return { success: false, error: '등록되지 않은 학번입니다.' };
}

function verifyAdmin(password) {
  if (!password) return { success: false, error: '관리자 비밀번호를 입력해주세요.' };
  const storedHash = getConfig('admin_password');
  // v2.0: 초기 상태(빈 비밀번호)에서는 초기 비밀번호로 인증 허용
  if (!storedHash || storedHash === '') {
    if (password === 'minsuk615') return { success: true };
    return { success: false, error: '관리자 인증에 실패했습니다.' };
  }
  if (hashPassword(password) === storedHash) return { success: true };
  return { success: false, error: '관리자 인증에 실패했습니다.' };
}

function getAssignmentInfo(assignmentId) {
  const sheet = getSheet('과제_목록');
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === assignmentId) {
      return {
        assignmentId: data[i][0],
        name: data[i][1],
        description: data[i][2],
        submitDeadline: data[i][3],
        evalDeadline: data[i][4],
        status: data[i][5],
        formUrl: data[i][6],
        criteria: data[i][7],
        minScore: data[i][8],
        maxScore: data[i][9]
      };
    }
  }
  return null;
}

function updateAssignmentStatus(assignmentId, newStatus) {
  const sheet = getSheet('과제_목록');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === assignmentId) {
      sheet.getRange(i + 1, 6).setValue(newStatus);
      return;
    }
  }
}

function updateAssignmentEvalDeadline(assignmentId, deadline) {
  const sheet = getSheet('과제_목록');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === assignmentId) {
      sheet.getRange(i + 1, 5).setValue(deadline);
      return;
    }
  }
}

// ============================================================
// 중복 제출 정리
// ============================================================
function deduplicateSubmissions(assignmentId) {
  const sheet = getSheet(assignmentId + '_제출');
  if (!sheet) return { error: '제출 시트 없음' };

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { removed: 0 };

  // 학번별로 가장 늦은 타임스탬프 찾기
  const latestByStudent = {};
  for (let i = 1; i < data.length; i++) {
    const sid = String(data[i][2]).trim();
    const ts = new Date(data[i][0]);
    if (!latestByStudent[sid] || ts > latestByStudent[sid]) {
      latestByStudent[sid] = ts;
    }
  }

  // 유효 플래그 설정
  let removedCount = 0;
  for (let i = 1; i < data.length; i++) {
    const sid = String(data[i][2]).trim();
    const ts = new Date(data[i][0]);
    if (ts.getTime() === latestByStudent[sid].getTime()) {
      sheet.getRange(i + 1, 7).setValue('Y');
    } else {
      sheet.getRange(i + 1, 7).setValue('N');
      removedCount++;
    }
  }

  return { totalRows: data.length - 1, validCount: Object.keys(latestByStudent).length, removedCount: removedCount };
}

// ============================================================
// 평가 배정 알고리즘 (Circular Offset)
// ============================================================
function assignEvaluators(students) {
  const N = students.length;
  if (N < 3) throw new Error('최소 3명 이상 제출해야 상호평가가 가능합니다.');

  // Fisher-Yates 셔플 (테스트 모드에서는 고정 시드)
  const shuffled = students.slice();

  if (isTestMode()) {
    // 고정 시드 셔플: 학번 정렬 기반
    shuffled.sort(function(a, b) {
      return String(a.studentId).localeCompare(String(b.studentId));
    });
    // 간단한 결정적 셔플
    var seed = 42;
    for (var i = N - 1; i > 0; i--) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var j = seed % (i + 1);
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
  } else {
    // 일반 Fisher-Yates
    for (var i = N - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
  }

  // 원형 배정
  const assignments = [];
  for (var i = 0; i < N; i++) {
    assignments.push({
      evaluator: shuffled[i],
      target1: shuffled[(i + 1) % N],
      target2: shuffled[(i + 2) % N]
    });
  }

  return assignments;
}

// ============================================================
// 초기 설정 (최초 1회 실행)
// ============================================================
function initializeSystem() {
  const ss = getSpreadsheet();

  // _config 시트 (자동 생성)
  ensureConfigSheet();

  // 기본 설정
  if (!getConfig('admin_password')) {
    setConfig('admin_password', hashPassword('prof2026!'));
  }
  if (!getConfig('course_name')) {
    setConfig('course_name', '소프트웨어공학개론');
  }
  if (!getConfig('semester')) {
    setConfig('semester', '2026-1');
  }
  if (!getConfig('test_mode')) {
    setConfig('test_mode', 'false');
  }

  // 학생_마스터 시트
  getOrCreateSheet('학생_마스터', ['학번', '이름', '비밀번호']);

  // 과제_목록 시트
  getOrCreateSheet('과제_목록', [
    '과제ID', '과제명', '과제설명', '제출마감일시', '평가마감일시',
    '상태', 'Google_Form_URL', '채점기준_설명', '최소점수', '최대점수'
  ]);

  return '시스템 초기화 완료';
}
