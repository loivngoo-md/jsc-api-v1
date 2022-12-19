
const appUserResponseSerializer = (user: any) => {
  delete user.password;
  delete user.withdraw_password;
};

export default appUserResponseSerializer;
