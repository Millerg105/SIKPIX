import { useCallback } from "react";

interface WatermarkedPreviewProps {
  supabaseUrl: string;
  orderId: string;
  itemId: string;
  styleName: string;
  className?: string;
  alt?: string;
}

/**
 * Displays a watermarked preview image served through the serve-preview edge function.
 * Includes CSS protections against casual image theft:
 * - pointer-events: none on the image
 * - user-select: none / -webkit-user-drag: none
 * - Transparent overlay div to intercept right-click
 * - Context menu disabled on the container
 */
export default function WatermarkedPreview({
  supabaseUrl,
  orderId,
  itemId,
  styleName,
  className = "",
  alt = "Preview",
}: WatermarkedPreviewProps) {
  const previewUrl = `${supabaseUrl}/functions/v1/serve-preview?order_id=${encodeURIComponent(orderId)}&item_id=${encodeURIComponent(itemId)}&style_name=${encodeURIComponent(styleName)}`;

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  }, []);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onContextMenu={handleContextMenu}
      style={{ userSelect: "none" }}
    >
      {/* The actual watermarked image */}
      <img
        src={previewUrl}
        alt={alt}
        className="w-full h-full object-contain"
        style={{
          pointerEvents: "none",
          userSelect: "none",
          WebkitUserDrag: "none",
        } as React.CSSProperties}
        draggable={false}
      />
      {/* Transparent overlay to block right-click "Save Image As" */}
      <div
        className="absolute inset-0"
        style={{
          background: "transparent",
          zIndex: 10,
        }}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
}
