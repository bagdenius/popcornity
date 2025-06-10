import { useEffect, useState } from "react";
import { OMDB_GET_REQUEST_URL } from "../config";
import Loader from "./Loader";
import ErrorMessage from "./ErrorMessage";
import NavigationBar from "./NavigationBar";
import Logo from "./Logo";
import SearchInput from "./SearchInput";
import NumberResults from "./NumberResults";
import Main from "./Main";
import Box from "./Box";
import MoviesList from "./MoviesList";
import WatchedMoviesSummary from "./WatchedMoviesSummary";
import WatchedMoviesList from "./WatchedMoviesList";
import MovieDetails from "./MovieDetails";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState(() => {
    const storedWatchedMovies = localStorage.getItem(`watchedMovies`);
    return JSON.parse(storedWatchedMovies) || [];
  });
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(``);

  function handleSelectMovie(id) {
    setSelectedMovieId((selectedId) => (selectedId === id ? null : id));
  }

  function handleCloseMovieDetails() {
    setSelectedMovieId(null);
  }

  function handleAddMovieToWatched(movie) {
    setWatchedMovies((movies) => movies.concat(movie));
  }

  function handleDeleteMovieFromWatched(id) {
    setWatchedMovies((movies) => movies.filter((movie) => movie.imdbID !== id));
  }

  useEffect(() => {
    localStorage.setItem(`watchedMovies`, JSON.stringify(watchedMovies));
  }, [watchedMovies]);

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
      handleCloseMovieDetails();
      getMovies();
      return function () {
        abortController.abort();
      };
    },
    [searchQuery]
  );

  return (
    <>
      <NavigationBar>
        <Logo />
        <SearchInput query={searchQuery} setQuery={setSearchQuery} />
        <NumberResults movies={movies} />
      </NavigationBar>

      <Main>
        <Box>
          {!isLoading && !error && (
            <MoviesList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedMovieId ? (
            <MovieDetails
              id={selectedMovieId}
              onClose={handleCloseMovieDetails}
              onAddToWatched={handleAddMovieToWatched}
              watchedMovies={watchedMovies}
            />
          ) : (
            <>
              <WatchedMoviesSummary movies={watchedMovies} />
              <WatchedMoviesList
                movies={watchedMovies}
                onDeleteMovieFromWatched={handleDeleteMovieFromWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
