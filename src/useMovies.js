import { useState, useEffect } from "react";
import { OMDB_GET_REQUEST_URL } from "./config";

export function useMovies(searchQuery) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(``);

  useEffect(
    function () {
      const abortController = new AbortController();

      async function getMovies() {
        try {
          setIsLoading(true);
          setError(``);

          const response = await fetch(
            `${OMDB_GET_REQUEST_URL}&s=${searchQuery}`,
            { signal: abortController.signal }
          );
          if (!response.ok) {
            throw new Error(
              `An error occured while movies fetching! (code ${response.status})`
            );
          }

          const data = await response.json();
          if (data.Response === `False`) throw new Error(data.Error);
          setMovies(data.Search);
          setError(``);
        } catch (error) {
          if (error.name !== `AbortError`) {
            console.log(error.message);
            setError(error.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (searchQuery.length < 3) {
        setMovies([]);
        setError(``);
        return;
      }
      //   handleCloseMovieDetails();
      getMovies();
      return function () {
        abortController.abort();
      };
    },
    [searchQuery]
  );
  return { movies, isLoading, error };
}
