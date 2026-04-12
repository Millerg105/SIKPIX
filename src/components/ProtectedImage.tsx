import type { ImgHTMLAttributes } from "react";

interface ProtectedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
}

const ProtectedImage = ({ wrapperClassName, className, style, ...props }: ProtectedImageProps) => {
  return (
    <div
      className={wrapperClassName}
      onContextMenu={(e) => e.preventDefault()}
      style={{ position: "relative" }}
    >
      <img
        {...props}
        className={className}
        style={{
          ...style,
          userSelect: "none",
          WebkitUserDrag: "none",
          pointerEvents: "none",
        } as React.CSSProperties}
        draggable={false}
      />
      {/* Transparent overlay prevents "Save Image As" */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
        }}
      />
    </div>
  );
};

export default ProtectedImage;
