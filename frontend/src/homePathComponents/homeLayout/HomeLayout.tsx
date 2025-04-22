import { Outlet } from "react-router-dom";
import Protected from "../../rootPathComponents/protected/Protected";

const HomeLayout = () => {
  return (
    <Protected>
      <div>hehe</div>
      <Outlet />
    </Protected>
  )
}

export default HomeLayout