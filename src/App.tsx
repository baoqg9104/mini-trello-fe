import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./contexts/AuthProvider";
import { AppRoutes } from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer position="top-center" autoClose={2000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
