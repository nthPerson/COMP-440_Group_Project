import React from 'react';

export default function CategoryPreview({ selectedCategories, allCategories }) {
  // Get the first selected category to show its icon as preview
  const previewCategory = selectedCategories.length > 0 
    ? allCategories.find(cat => cat.name === selectedCategories[0])
    : null;

  if (!previewCategory) {
    return (
      <div className="category-preview">
        <div className="preview-label">Item Icon Preview:</div>
        <div className="preview-icon-container">
          <img 
            src="https://api.iconify.design/mdi:package-variant.svg"
            alt="Default icon"
            className="preview-icon"
          />
          <div className="preview-text">
            <div className="preview-main">Default Icon</div>
            <div className="preview-sub">Select a category to see its icon</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-preview">
      <div className="preview-label">Item Icon Preview:</div>
      <div className="preview-icon-container">
        <img 
          src={`https://api.iconify.design/${previewCategory.icon_key}.svg`}
          alt={`${previewCategory.name} icon`}
          className="preview-icon"
        />
        <div className="preview-text">
          <div className="preview-main">{previewCategory.name} icon</div>
          <div className="preview-sub">
            {selectedCategories.length > 1 
              ? `First of ${selectedCategories.length} categories` 
              : 'Default icon for this item'}
          </div>
        </div>
      </div>
      
      {selectedCategories.length > 1 && (
        <div className="additional-categories-note">
          <small>
            📝 The first category ({previewCategory.name}) determines the default icon.
            {selectedCategories.length > 1 && ` ${selectedCategories.length - 1} other ${selectedCategories.length - 1 === 1 ? 'category' : 'categories'} will also be listed.`}
          </small>
        </div>
      )}
    </div>
  );
}
