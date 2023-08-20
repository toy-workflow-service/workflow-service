import * as bcrypt from 'bcrypt';

export const comparePassword = async (targetPassword: string, currentTargetpassword: string): Promise<boolean> => {
  return await bcrypt.compare(targetPassword, currentTargetpassword);
};
