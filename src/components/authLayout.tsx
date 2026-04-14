import { Navigate } from "react-router-dom";
import { useAppSelector } from "../App/hooks";
import BouncingLoader from "./Loaders/BouncingLoader";

const Protected = ({ children, authentication = true }) => {

  const {user,authChecked,loading} = useAppSelector((state) => state.auth);
  
  if (!authChecked) return <BouncingLoader />
 

  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <BouncingLoader />
      </div>
    );
  }

 
  if (authentication && !user) {
    return <Navigate to="/login" replace />;
  }


  return children;
};

export default Protected;
