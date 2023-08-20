import * as bcrypt from 'bcrypt';

export const bcryptPassword = async (password: string): Promise<any> => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
};
