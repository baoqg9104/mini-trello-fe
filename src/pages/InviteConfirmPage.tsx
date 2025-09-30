import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function InviteConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const boardId = searchParams.get("boardId");
  const email = searchParams.get("email");
  const response = searchParams.get("response");

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const confirmInvite = async () => {
      if (!boardId || !email || !response) {
        setError("Missing required information.");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await axiosInstance.post(
          `/boards/${boardId}/invite/respond`, 
          {
            email,
            response,
          }
        );
        setResult(res.data?.message || "Success!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch {
        setError("Failed to process invitation.");
      } finally {
        setLoading(false);
      }
    };
    confirmInvite();
  }, [boardId, email, response, navigate]);

  return (
    <Box
      minHeight="60vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error" fontSize={18} mb={2}>
          {error}
        </Typography>
      ) : (
        <>
          <Typography color="success.main" fontSize={18} mb={2}>
            {result}
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            Redirecting to boards...
          </Typography>
        </>
      )}
    </Box>
  );
}
