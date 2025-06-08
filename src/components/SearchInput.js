import { useEffect, useRef } from "react";

export default function SearchInput({ query, setQuery }) {
  const inputElement = useRef(null);

  useEffect(() => {
    function callback(event) {
      if (document.activeElement === inputElement.current) return;
      if (event.code === `Enter`) inputElement.current.focus();
      setQuery(``);
    }

    document.addEventListener(`keydown`, callback);
    return () => document.removeEventListener(`keydown`, callback);
  }, [setQuery]);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      ref={inputElement}
    />
  );
}
