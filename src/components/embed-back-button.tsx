"use client";

export function EmbedBackButton() {
  const handleClose = () => {
    // If inside the overlay iframe, tell the parent to close it
    try {
      if (window.parent && window.parent !== window) {
        window.parent.document.getElementById("lot-card-overlay")?.remove();
        return;
      }
    } catch (_) {
      // cross-origin — fall through
    }
    history.back();
  };

  return (
    <button
      onClick={handleClose}
      className="absolute top-4 right-4 z-50 p-2 bg-white/20 backdrop-blur rounded-full text-dark-green hover:bg-white/40 transition-colors"
    >
      ✕
    </button>
  );
}
