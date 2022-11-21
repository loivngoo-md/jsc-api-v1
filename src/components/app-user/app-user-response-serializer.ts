import CmsUser from "../cms-user/entities/cms-user.entity";
import AppUser from "./entities/app-user.entity";

const appUserResponseSerializer = (user) => {
  delete user.password;
  delete user.withdraw_password
};

export default appUserResponseSerializer;
