import { Navigate } from "react-router-dom";
import { useAppSelector } from "../App/hooks";
import chatRoundIcon from '@/assets/chat-round.svg'
import { Spinner } from "./ui/spinner";
import { Item, ItemContent, ItemMedia, ItemTitle } from "./ui/item";

const Protected = ({ children, authentication = true }) => {

  const { user, authChecked, loading } = useAppSelector((state) => state.auth);

  if (!authChecked) return (<div className="w-screen h-screen flex flex-col gap-2 justify-center items-center">
        <img className="size-40" src={chatRoundIcon} alt="logo" />
        <Item className="w-fit">
          <ItemMedia>
            <Spinner className="size-6" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="line-clamp-1 text-lg">Loading...</ItemTitle>
          </ItemContent>
        </Item>
      </div>)


  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col gap-2 justify-center items-center">
        <img className="size-40" src={chatRoundIcon} alt="logo" />
        <Item className="w-fit">
          <ItemMedia>
            <Spinner className="size-6" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="line-clamp-1 text-lg">Validating...</ItemTitle>
          </ItemContent>
        </Item>
      </div>
    );
  }


  if (authentication && !user) {
    return <Navigate to="/login" replace />;
  }


  return children;
};

export default Protected;
