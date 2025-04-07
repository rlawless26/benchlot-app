import React from 'react';
import ReliableImage from './ReliableImage';

/**
 * ToolImage - A component for displaying tool listing images with proper fallbacks
 */
const ToolImage = ({ 
  tool, 
  index = 0, 
  className = "",
  width,
  height,
  style
}) => {
  // Get the image URL at the specified index
  const getImageUrl = () => {
    if (!tool || !tool.images || !Array.isArray(tool.images) || !tool.images[index]) {
      return null;
    }
    return tool.images[index];
  };

  // Create a default placeholder based on tool name if available
  const getPlaceholder = () => {
    const toolName = tool?.name || 'Tool';
    return `https://via.placeholder.com/${width || 300}x${height || 200}/CCCCCC/333333?text=${encodeURIComponent(toolName)}`;
  };

  return (
    <ReliableImage 
      src={getImageUrl()}
      alt={tool?.name || "Tool image"}
      className={className}
      width={width}
      height={height}
      style={style}
      fallbackSrc={getPlaceholder()}
    />
  );
};

export default ToolImage;