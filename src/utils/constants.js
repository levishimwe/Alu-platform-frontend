export const USER_TYPES = {
  GRADUATE: 'graduate',
  INVESTOR: 'investor',
  ADMIN: 'admin'
};

export const PROJECT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  UNDER_REVIEW: 'under_review',
  REJECTED: 'rejected'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  },
  PROJECTS: {
    ALL: '/projects',
    CREATE: '/projects',
    UPDATE: '/projects',
    DELETE: '/projects'
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/profile'
  }
};
