/**
 * ============================================================
 * API 통신 모듈
 * ============================================================
 * Google Apps Script Web App과 통신합니다.
 * CORS 회피를 위해 Content-Type: text/plain 사용.
 * ============================================================
 */

const API = (() => {
  // ★ 배포 후 실제 URL로 교체하세요
  const BASE_URL = 'https://script.google.com/macros/s/AKfycbyEQjSa6YwEjI7FPOHSOU6ShOey7V_aZR95-Pyc8TRoDo3uvvWvuvLhtRL2xBOdUCSZ/exec';
  const TIMEOUT_MS = 30000;

  // courseId가 필요하지 않은 액션 목록
  const NO_COURSE_ACTIONS = new Set([
    'get_active_courses', 'admin_login', 'change_admin_password',
    'create_course', 'get_courses_list', 'delete_course', 'restore_course'
  ]);

  async function call(payload) {
    // courseId가 필요한 액션인데 빠져있으면 에러
    if (!NO_COURSE_ACTIONS.has(payload.action) && !payload.courseId) {
      throw new Error('과목이 선택되지 않았습니다. 과목을 먼저 선택해주세요.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('서버 응답 오류: ' + response.status);
      }

      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error('응답 파싱 오류');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.');
      }
      throw err;
    }
  }

  // ─── 과목 (인증 불필요) ───
  function getActiveCourses() {
    return call({ action: 'get_active_courses' });
  }

  // ─── 인증 ───
  function checkStudent(studentId, courseId) {
    return call({ action: 'check_student', studentId, courseId });
  }

  function registerPassword(studentId, password, courseId) {
    return call({ action: 'register_password', studentId, password, courseId });
  }

  function login(studentId, password, courseId) {
    return call({ action: 'login', studentId, password, courseId });
  }

  function adminLogin(password) {
    return call({ action: 'admin_login', password });
  }

  function changeAdminPassword(currentPassword, newPassword) {
    return call({ action: 'change_admin_password', currentPassword, newPassword });
  }

  // ─── 학생용 ───
  function getMyAssignments(studentId, password, courseId) {
    return call({ action: 'get_my_assignments', studentId, password, courseId });
  }

  function getEvaluationTargets(studentId, password, assignmentId, courseId) {
    return call({ action: 'get_evaluation_targets', studentId, password, assignmentId, courseId });
  }

  function submitEvaluation(studentId, password, assignmentId, targetStudentId, score, comment, courseId) {
    return call({
      action: 'submit_evaluation',
      studentId, password, assignmentId, targetStudentId, score, comment, courseId
    });
  }

  function submitAssignment(studentId, password, courseId, assignmentId, link) {
    return call({ action: 'submit_assignment', studentId, password, courseId, assignmentId, link });
  }

  function getSubmission(studentId, password, courseId, assignmentId) {
    return call({ action: 'get_submission', studentId, password, courseId, assignmentId });
  }

  function getMyResults(studentId, password, courseId) {
    return call({ action: 'get_my_results', studentId, password, courseId });
  }

  // ─── 교수용 ───
  function createAssignment(adminPassword, data, courseId) {
    return call({ action: 'create_assignment', adminPassword, courseId, ...data });
  }

  function startEvaluation(adminPassword, assignmentId, evalDeadline, courseId) {
    return call({ action: 'start_evaluation', adminPassword, assignmentId, evalDeadline, courseId });
  }

  function endEvaluation(adminPassword, assignmentId, courseId) {
    return call({ action: 'end_evaluation', adminPassword, assignmentId, courseId });
  }

  function getEvalStatus(adminPassword, assignmentId, courseId) {
    return call({ action: 'get_eval_status', adminPassword, assignmentId, courseId });
  }

  function submitProfessorEval(adminPassword, assignmentId, studentId, score, comment, courseId) {
    return call({ action: 'submit_professor_eval', adminPassword, assignmentId, studentId, score, comment, courseId });
  }

  function finalizeAssignment(adminPassword, assignmentId, force, courseId) {
    return call({ action: 'finalize_assignment', adminPassword, assignmentId, force, courseId });
  }

  function getAllResults(adminPassword, assignmentId, courseId) {
    return call({ action: 'get_all_results', adminPassword, assignmentId, courseId });
  }

  function getSubmissionStatus(adminPassword, assignmentId, courseId) {
    return call({ action: 'get_submission_status', adminPassword, assignmentId, courseId });
  }

  function registerStudents(adminPassword, students, courseId) {
    return call({ action: 'register_students', adminPassword, students, courseId });
  }

  function getAssignmentsList(adminPassword, courseId) {
    return call({ action: 'get_assignments_list', adminPassword, courseId });
  }

  function resetPassword(adminPassword, studentId, courseId) {
    return call({ action: 'reset_password', adminPassword, studentId, courseId });
  }

  function getStudentsList(adminPassword, courseId) {
    return call({ action: 'get_students_list', adminPassword, courseId });
  }

  function removeStudent(adminPassword, studentId, courseId) {
    return call({ action: 'remove_student', adminPassword, studentId, courseId });
  }

  function createCourse(adminPassword, courseName, year, semester) {
    return call({ action: 'create_course', adminPassword, courseName, year, semester });
  }

  function getCoursesList(adminPassword) {
    return call({ action: 'get_courses_list', adminPassword });
  }

  function deleteCourse(adminPassword, courseId) {
    return call({ action: 'delete_course', adminPassword, courseId });
  }

  function restoreCourse(adminPassword, courseId) {
    return call({ action: 'restore_course', adminPassword, courseId });
  }

  return {
    getActiveCourses,
    checkStudent, registerPassword, login, adminLogin, changeAdminPassword,
    getMyAssignments, submitAssignment, getSubmission, getEvaluationTargets, submitEvaluation, getMyResults,
    createAssignment, startEvaluation, endEvaluation, getEvalStatus,
    submitProfessorEval, finalizeAssignment, getAllResults, getSubmissionStatus,
    registerStudents, getAssignmentsList, resetPassword, getStudentsList,
    removeStudent, createCourse, getCoursesList, deleteCourse, restoreCourse
  };
})();
