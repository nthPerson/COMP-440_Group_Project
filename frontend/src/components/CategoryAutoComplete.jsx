/* This is logic for adding a category autocomplete component.
*/
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function CategoryAutocomplete({
  categories = [],            // array of strings, e.g. ["Animal", "Anime", "Antiques"]
  placeholder = "Search…",
  onSubmit,                   // (value: string) => void  (trigger search or navigate)
  defaultValue = "",
  maxSuggestions = 8
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = "category-autocomplete-listbox";
  const inputRef = useRef(null);
  const popRef = useRef(null);

  // Filter categories by case-insensitive "startsWith"
  const suggestions = useMemo(() => {
    const v = value.trim().toLowerCase();
    if (!v) return [];
    return categories
      .filter(c => c?.toLowerCase().startsWith(v))
      .slice(0, maxSuggestions);
  }, [categories, value, maxSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!popRef.current || !inputRef.current) return;
      if (!popRef.current.contains(e.target) && !inputRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function handleSelect(item) {
    setValue(item);
    setOpen(false);
    setActiveIndex(-1);
    if (onSubmit) onSubmit(item);
  }

  function onKeyDown(e) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!open) {
      if (e.key === "Enter" && onSubmit) onSubmit(value);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex]);
      } else if (onSubmit) {
        onSubmit(value);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="cat-ac-wrapper" style={{ position: "relative" }}>
      <input
        ref={inputRef}
        type="text"
        className="cat-ac-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => { if (suggestions.length) setOpen(true); }}
        onKeyDown={onKeyDown}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        role="combobox"
      />

      {open && suggestions.length > 0 && (
        <ul
          ref={popRef}
          id={listboxId}
          role="listbox"
          className="cat-ac-popover"
        >
          {suggestions.map((item, idx) => {
            const isActive = idx === activeIndex;
            // Bold the matched prefix
            const prefix = value;
            const rest = item.slice(prefix.length);
            return (
              <li
                key={item}
                role="option"
                aria-selected={isActive}
                className={`cat-ac-option ${isActive ? "is-active" : ""}`}
                onMouseDown={(e) => e.preventDefault()} // keep focus on input
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <strong>{item.slice(0, prefix.length)}</strong>
                {rest}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
