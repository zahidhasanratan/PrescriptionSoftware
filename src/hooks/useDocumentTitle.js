import { useEffect } from "react";

const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title || "Prescription Application";
  }, [title]);
};

export default useDocumentTitle;
