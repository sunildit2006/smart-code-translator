import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import HistoryList from "../components/HistoryList.jsx";

import {
  getHistory,
  deleteHistoryItem,
  clearHistory,
} from "../services/historyService.js";

const ITEMS_PER_PAGE = 8;

function HistoryPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalEntries, setTotalEntries] =
    useState(0);

  const [selectedEntry, setSelectedEntry] =
    useState(null);

  const fetchHistory = async () => {
    setLoading(true);

    try {
      const result = await getHistory(
        currentPage,
        ITEMS_PER_PAGE
      );

      setEntries(result.entries || []);
      setTotalEntries(result.totalEntries || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentPage]);

  const handleView = (entry) => {
    setSelectedEntry(entry);
  };

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);

      toast.success("History deleted.");

      if (selectedEntry?._id === id) {
        setSelectedEntry(null);
      }

      await fetchHistory();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete history."
      );
    }
  };

  const handleClear = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all history?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await clearHistory();

      setEntries([]);
      setSelectedEntry(null);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalEntries(0);

      toast.success("All history cleared.");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to clear history."
      );
    }
  };

  return (
    <main className="history-page">
      <div className="history-header">
        <div>
          <h1>History</h1>
          <p>
            Your previous AI code operations.
          </p>
        </div>

        {totalEntries > 0 && (
          <button
            className="clear-history-button"
            onClick={handleClear}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="history-container">
        <section className="history-list-panel">
          {loading ? (
            <div className="history-loading">
              Loading history...
            </div>
          ) : (
            <HistoryList
              entries={entries}
              onView={handleView}
              onDelete={handleDelete}
            />
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage(
                    currentPage - 1
                  )
                }
              >
                Prev
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  className={
                    currentPage === page
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setCurrentPage(page)
                  }
                >
                  {page}
                </button>
              ))}

              <button
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    currentPage + 1
                  )
                }
              >
                Next
              </button>
            </div>
          )}
        </section>

        <section className="history-detail-panel">
          {!selectedEntry ? (
            <div className="history-detail-empty">
              <p>
                Select a history item to view
                details.
              </p>
            </div>
          ) : (
            <div>
              <div className="history-detail-header">
                <h2>
                  {selectedEntry.type}
                </h2>

                <span>
                  {new Date(
                    selectedEntry.createdAt
                  ).toLocaleString()}
                </span>
              </div>

              <div className="history-detail-section">
                <h3>Input Code</h3>

                <pre>
                  {selectedEntry.inputCode}
                </pre>
              </div>

              {selectedEntry.type ===
                "translate" && (
                <div className="history-detail-section">
                  <h3>Translated Code</h3>

                  <pre>
                    {selectedEntry.output
                      ?.translatedCode || ""}
                  </pre>
                </div>
              )}

              {selectedEntry.type ===
                "analyze" && (
                <div className="history-detail-section">
                  <h3>Complexity</h3>

                  <p>
                    Time:{" "}
                    {selectedEntry.output
                      ?.timeComplexity || "N/A"}
                  </p>

                  <p>
                    Space:{" "}
                    {selectedEntry.output
                      ?.spaceComplexity || "N/A"}
                  </p>

                  <p>
                    {selectedEntry.output
                      ?.explanation || ""}
                  </p>
                </div>
              )}

              {selectedEntry.type ===
                "optimize" && (
                <div className="history-detail-section">
                  <h3>Optimized Code</h3>

                  <pre>
                    {selectedEntry.output
                      ?.optimizedCode || ""}
                  </pre>

                  <h3>Suggestions</h3>

                  <p>
                    {selectedEntry.output
                      ?.suggestions || ""}
                  </p>
                </div>
              )}

              {selectedEntry.type ===
                "explain" && (
                <div className="history-detail-section">
                  <h3>Explanation</h3>

                  <p>
                    {selectedEntry.output
                      ?.explanation || ""}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default HistoryPage;