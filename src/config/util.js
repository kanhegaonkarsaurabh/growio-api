import crypto from 'crypto';

export const uniqueObjectIdHash = (stringVal) => {
  return crypto
    .createHmac('sha256', stringVal)
    .digest('hex')
    .slice(0, 24);
}
