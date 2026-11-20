import { CreateUserPage } from "../../_components/User/UserPages";

export const metadata = {
  title: "Create user",
};

const CreateUser = () => {
  return <CreateUserPage dashboardPath="/admin-dashboard" />;
};

export default CreateUser;
