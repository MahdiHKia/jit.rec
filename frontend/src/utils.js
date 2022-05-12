/**
 * @param {string} emailAddr
 */
export function emailToUserName(emailAddr) {
  return emailAddr.split('@')[0].replace(/\.|_/g, ' ');
}
