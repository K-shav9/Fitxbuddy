/*
 * @file: response.js
 * @description: It contains function layer for API response status with data.
 * @author: Sagar Dhingra
 */

const successAction = (data, message = "OK") => {
  return { statusCode: 200, data, message };
};

const failAction = (statusCode = 400, data = null, message = "Fail") => {
  return { statusCode, data, message };
};

export { successAction, failAction };
