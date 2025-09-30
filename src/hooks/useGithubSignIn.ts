import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { firebaseAuth } from "../utils/firebaseConfig";
import { login } from "../store/authSlice";
import axiosInstance from "../utils/axiosInstance";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "../types/auth";

export function useGithubSignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signInWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);

      const user = result.user;
      const idToken = await user.getIdToken();

      // Send the ID token to backend
      const res = await axiosInstance.post("/auth/firebase-token", {
        firebaseToken: idToken,
      });

      const { accessToken } = res.data;

      const decoded: JwtPayload = jwtDecode<JwtPayload>(accessToken);
      if (decoded && decoded.id && decoded.email) {
        dispatch(login({ id: decoded.id, email: decoded.email, accessToken }));
      }

      toast.success("Sign in with GitHub successful!");
      navigate("/", { replace: true });
    } catch {
      toast.error("Sign in with GitHub failed");
    }
  };

  return signInWithGithub;
}
