export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        LOGOUT: `${API_BASE_URL}/auth/logout`,
    },
    STUDENTS: {
        LIST: `${API_BASE_URL}/students`,
        UPLOAD_BIOMETRICS: `${API_BASE_URL}/api/v1/students/upload-biometrics`,
        ENROLL_FACE: `${API_BASE_URL}/students/enroll-face`,
    },
    TEACHER: {
        PENDING_APPROVALS: `${API_BASE_URL}/api/v1/teacher/pending-approvals`,
        APPROVE_BIOMETRICS: `${API_BASE_URL}/api/v1/teacher/approve-biometrics`,
        REJECT_BIOMETRICS: `${API_BASE_URL}/api/v1/teacher/reject-biometrics`,
    },
    ATTENDANCE: {
        MATCH_FACE: `${API_BASE_URL}/api/v1/attendance/match-face`,
        MARK_FACE: `${API_BASE_URL}/attendance/mark-face`,
        STATS: `${API_BASE_URL}/attendance/stats`,
        TODAY: `${API_BASE_URL}/api/v1/attendance/today`,
        BY_CLASS: `${API_BASE_URL}/api/v1/attendance/by-class`,
    },
    REPORTS: {
        DOWNLOAD: `${API_BASE_URL}/reports/download`,
        STATS: `${API_BASE_URL}/api/v1/reports/stats`,
    },
    CLASSES: {
        LIST: `${API_BASE_URL}/api/v1/classes`,
        CREATE: `${API_BASE_URL}/api/v1/classes/create`,
        ENROLLMENTS: `${API_BASE_URL}/api/v1/classes/enrollments`,
    }
};

