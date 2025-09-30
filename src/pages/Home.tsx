import { useState, useEffect } from "react";
import BoardGrid from "../components/BoardGrid";
import CreateBoardModal from "../components/CreateBoardModal";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";
import type { Board } from "../types/board";

export const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBoards = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get("/boards");
        setBoards(res.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || "Failed to load boards");
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  const handleBoardCreated = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/boards");
      setBoards(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to load boards");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-2 sm:px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex-1">
            Your Boards
          </h2>
          <button
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
            onClick={() => setShowModal(true)}
          >
            Create New Board
          </button>
        </div>
        {loading ? (
          <div className="text-center text-gray-500 py-10">
            Loading boards...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <BoardGrid boards={boards} />
        )}
      </div>
      <CreateBoardModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onBoardCreated={handleBoardCreated}
      />
    </div>
  );
};
