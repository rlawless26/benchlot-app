import React from 'react';
import ReliableImage from './ReliableImage';

/**
 * ToolImage - A simplified component for displaying tool listing images
 * with built-in error handling and fallbacks
 */
const ToolImage = ({ 
  tool, 
  index = 0, 
  className = "",
  width,
  height,
  style,
  alt
}) => {
  // Get the image URL at the specified index
  const getImageUrl = () => {
    if (!tool) return null;
    
    // If the tool has a direct images array, use that
    if (tool.images && Array.isArray(tool.images) && tool.images[index]) {
      return tool.images[index];
    }
    
    // If we have a toolImageUrl specifically for this tool
    if (tool.toolImageUrl) {
      return tool.toolImageUrl;
    }
    
    // Return null to trigger the fallback
    return null;
  };

  // Create a default placeholder based on tool name if available
  const getPlaceholder = () => {
    const toolName = tool?.name || tool?.title || 'Tool';
    const cacheBuster = Date.now();
    return `https://via.placeholder.com/${width || 300}x${height || 200}/CCCCCC/333333?text=${encodeURIComponent(toolName)}&cb=${cacheBuster}`;
  };

  // Get a description for the alt text
  const altText = alt || tool?.name || tool?.title || "Tool image";

  return (
    <ReliableImage 
      src={getImageUrl()}
      alt={altText}
      className={className || "object-cover"}
      width={width || 300}
      height={height || 200}
      style={style || {}}
      fallbackSrc={getPlaceholder()}
    />
  );
};

export default ToolImage;