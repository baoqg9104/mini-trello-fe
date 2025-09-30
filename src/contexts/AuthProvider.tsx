import React, { useEffect } from "react";
import { Provider } from "react-redux";
import store from "../store";
import { hydrateAuth } from "../store/authSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Provider store={store}>
      <HydrateAuth>{children}</HydrateAuth>
    </Provider>
  );
};

function HydrateAuth({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);
  return <>{children}</>;
}

export default AuthProvider;
