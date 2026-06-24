import bcrypt from 'bcryptjs';

export const verifyPassword = (
  password: string,
  passwordHash: string,
): Promise<boolean> => bcrypt.compare(password, passwordHash);
