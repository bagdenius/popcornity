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
import { useMovies } from "../useMovies";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [watchedMovies, setWatchedMovies] = useState(() => {
    const storedWatchedMovies = localStorage.getItem(`watchedMovies`);
    return JSON.parse(storedWatchedMovies) || [];
  });
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const { movies, isLoading, error } = useMovies(searchQuery);

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
