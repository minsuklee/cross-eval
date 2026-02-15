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

  async function call(payload) {
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

  // ─── 인증 ───
  function checkStudent(studentId) {
    return call({ action: 'check_student', studentId });
  }

  function registerPassword(studentId, password) {
    return call({ action: 'register_password', studentId, password });
  }

  function login(studentId, password) {
    return call({ action: 'login', studentId, password });
  }

  function adminLogin(password) {
    return call({ action: 'admin_login', password });
  }

  function changeAdminPassword(currentPassword, newPassword) {
    return call({ action: 'change_admin_password', currentPassword, newPassword });
  }

  // ─── 학생용 ───
  function getMyAssignments(studentId, password) {
    return call({ action: 'get_my_assignments', studentId, password });
  }

  function getEvaluationTargets(studentId, password, assignmentId) {
    return call({ action: 'get_evaluation_targets', studentId, password, assignmentId });
  }

  function submitEvaluation(studentId, password, assignmentId, targetStudentId, score, comment) {
    return call({
      action: 'submit_evaluation',
      studentId, password, assignmentId, targetStudentId, score, comment
    });
  }

  function getMyResults(studentId, password) {
    return call({ action: 'get_my_results', studentId, password });
  }

  // ─── 교수용 ───
  function createAssignment(adminPassword, data) {
    return call({ action: 'create_assignment', adminPassword, ...data });
  }

  function startEvaluation(adminPassword, assignmentId, evalDeadline) {
    return call({ action: 'start_evaluation', adminPassword, assignmentId, evalDeadline });
  }

  function endEvaluation(adminPassword, assignmentId) {
    return call({ action: 'end_evaluation', adminPassword, assignmentId });
  }

  function getEvalStatus(adminPassword, assignmentId) {
    return call({ action: 'get_eval_status', adminPassword, assignmentId });
  }

  function submitProfessorEval(adminPassword, assignmentId, studentId, score, comment) {
    return call({ action: 'submit_professor_eval', adminPassword, assignmentId, studentId, score, comment });
  }

  function finalizeAssignment(adminPassword, assignmentId, force) {
    return call({ action: 'finalize_assignment', adminPassword, assignmentId, force });
  }

  function getAllResults(adminPassword, assignmentId) {
    return call({ action: 'get_all_results', adminPassword, assignmentId });
  }

  function registerStudents(adminPassword, students) {
    return call({ action: 'register_students', adminPassword, students });
  }

  function getAssignmentsList(adminPassword) {
    return call({ action: 'get_assignments_list', adminPassword });
  }

  function resetPassword(adminPassword, studentId) {
    return call({ action: 'reset_password', adminPassword, studentId });
  }

  function getStudentsList(adminPassword) {
    return call({ action: 'get_students_list', adminPassword });
  }

  function removeStudent(adminPassword, studentId) {
    return call({ action: 'remove_student', adminPassword, studentId });
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
    checkStudent, registerPassword, login, adminLogin, changeAdminPassword,
    getMyAssignments, getEvaluationTargets, submitEvaluation, getMyResults,
    createAssignment, startEvaluation, endEvaluation, getEvalStatus,
    submitProfessorEval, finalizeAssignment, getAllResults,
    registerStudents, getAssignmentsList, resetPassword, getStudentsList,
    removeStudent, createCourse, getCoursesList, deleteCourse, restoreCourse
  };
})();
