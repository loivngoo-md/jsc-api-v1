/**
 * Common constant
 */

export const NOT_FOUND = 'Not found';
export const NOT_FOUND_TEAM = 'Team not exist';
export const NOT_FOUND_USER = 'User not exist';
export const NOT_FOUND_REQUEST = 'Request not exist';
export const INTERNAL_SERVER_ERROR = 'Internal server error';

export const EMPTY = 'Empty';

/**-------------------------------------------------------------------- */

/**
 * Error occur when user log in by email/password failed
 */
export const INVALID_USERNAME = 'Invalid username';
export const INVALID_ID = 'Invalid id';
export const INVALID_PASSWORD = 'Invalid Password';
export const INVALID_TOKEN = 'Invalid token';
/**-------------------------------------------------------------------- */

/**
 * Error occur when user login via Google failed
 */
export const UNAUTHORIZED_MESSAGE = 'Not have permission to access it';
export const LOGIN_ERR = 'The current user is not logged in to the system';
/**-------------------------------------------------------------------- */

/**
 * Error occur user request to API User
 */

export const USER_MESSAGE = {
  INVALID_USERNAME: 'Username is invalid',
  INVALID_PASSWORD: 'Password is invalid',
  INVALID_EMAIL: 'Invalid is email',
  INVALID_FIRSTNAME: 'Firstname is invalid',
  INVALID_LASTNAME: 'Lastname is invalid',
  INVALID_ROLE: 'Role is invalid',
  INVALID_AVATAR_CODE: 'Avatar is invalid',
  USER_EXITED: 'Email or username has already existed',
};
/**-------------------------------------------------------------------- */

/**
 * Error when user request to API Team
 */

export const TEAM_MESSAGE = {
  INVALID_NAME: 'Name is invalid',
};
/**-------------------------------------------------------------------- */

/**
 * Error when user request to API Device
 */

export const DEVICE_MESSAGE = {
  INVALID_NAME: 'Invalid name',
  INVALID_DESCRIPTION: 'Invalid description',
  INVALID_GUARANTEE: 'Invalid guarantee',
  INVALID_MANUFACTURER: 'Invalid manufacturer',
  INVALID_QR_CODE: 'Invalid QR code',
  INVALID_STATUS: 'Invalid status',
  INVALID_START_DATE: 'Invalid start date',
  NOT_FOUND_DEVICE: 'Not found valid device',
  USING_DEVICE: 'Cannot delete using device',
};
/**-------------------------------------------------------------------- */

/**
 * Error when user request to API request
 */

/**-------------------------------------------------------------------- */

// export const REQUEST_ERROR = {};

export const ENUM_ERR = {
  INVALID_ROLE: 'Invalid role',
  INVALID_REQUEST_STATUS: 'Invalid request status',
  INVALID_DEVICE_USAGE_STATUS: 'Invalid device usage status',
  INVALID_REQUEST_TYPE: 'Invalid request type',
  INVALID_REQUEST_PRIORITY: 'Invalid request priority',
};

/* Exception */
export const FORDBBIDEN_MESS = {
  FORBIDDEN_UPDATE_REQUEST: 'You do not have permission to edit this request',
  APPROVED_EXCEP: `You can't edit appoved request`,
  MISSING_DEVICEID: `Please update device`,
};

export const MISSING_PARAMS = `Missing required parameters`;

export const UNAVAIL_DEVICE = `Unavailable device`;

export const FORBIDDEN = `Forbidden resource.`;
