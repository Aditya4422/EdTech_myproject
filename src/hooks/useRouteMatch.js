import { useLocation, matchPath } from "react-router-dom";

export default function useRouteMatch(path){
    const loacation = useLocation();
    return matchPath(location.pathname, {path});
}
