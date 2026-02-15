/**
 * ============================================================
 * 인증/세션 관리 모듈
 * ============================================================
 */

const Auth = (() => {
  const SESSION_KEY = 'cross_eval_session';

  function saveSession(data) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  }

  function getSession() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); }
    catch { return null; }
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function isLoggedIn() {
    return getSession() !== null;
  }

  function isAdmin() {
    const s = getSession();
    return s && s.role === 'admin';
  }

  function isStudent() {
    const s = getSession();
    return s && s.role === 'student';
  }

  function getStudentId() {
    const s = getSession();
    return s ? s.studentId : null;
  }

  function getPassword() {
    const s = getSession();
    return s ? s.password : null;
  }

  function getAdminPassword() {
    const s = getSession();
    return s ? s.adminPassword : null;
  }

  function getUserName() {
    const s = getSession();
    return s ? s.name : null;
  }

  function requireStudent() {
    if (!isStudent()) {
      window.location.href = '../index.html';
      return false;
    }
    return true;
  }

  function requireAdmin() {
    if (!isAdmin()) {
      window.location.href = '../index.html';
      return false;
    }
    return true;
  }

  function logout() {
    clearSession();
    window.location.href = '../index.html';
  }

  return {
    saveSession, getSession, clearSession,
    isLoggedIn, isAdmin, isStudent,
    getStudentId, getPassword, getAdminPassword, getUserName,
    requireStudent, requireAdmin, logout
  };
})();
