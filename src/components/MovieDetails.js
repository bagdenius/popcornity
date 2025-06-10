import { useState, useEffect, useRef } from "react";
import { OMDB_GET_REQUEST_URL } from "../config";
import ErrorMessage from "./ErrorMessage";
import Loader from "./Loader";
import StarRating from "./StarRating";

export default function MovieDetails({
  id,
  onClose,
  onAddToWatched,
  watchedMovies,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(``);
  const [userRating, setUserRating] = useState(``);

  const countRatingDecisionsRef = useRef(0);

  const isWatched = watchedMovies.map((movie) => movie.imdbID).includes(id);
  const watchedUserRating = watchedMovies.find(
    (movie) => movie.imdbID === id
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAddMovieToWatched() {
    const newWatchedMovie = {
      imdbID: id,
      title,
      year,
      poster,
      imdbRating: +imdbRating,
      userRating: +userRating,
      runtime: +runtime.split(` `).at(0),
      countRatingDecisions: countRatingDecisionsRef.current,
    };
    onAddToWatched(newWatchedMovie);
    onClose();
  }

  useEffect(
    function () {
      async function getMovieDetails() {
        try {
          setIsLoading(true);
          setError(``);
          const response = await fetch(`${OMDB_GET_REQUEST_URL}&i=${id}`);
          if (!response.ok)
            throw new Error(
              `Can't get movie details! (code ${response.status})`
            );
          const data = await response.json();
          if (data.Response === `False`) {
            throw new Error(data.Error);
          }
          setMovie(data);
        } catch (error) {
          console.log(error.message);
          setError(error.message);
        } finally {
          setIsLoading(false);
          setUserRating(``);
        }
      }
      getMovieDetails();
    },
    [id]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `popcornity - ${title}`;
      return function () {
        document.title = `popcornity`;
      };
    },
    [title]
  );

  useEffect(
    function () {
      function handleEscapeKeyPress(event) {
        if (event.code === `Escape`) onClose();
      }
      document.addEventListener(`keydown`, handleEscapeKeyPress);

      return function () {
        document.removeEventListener(`keydown`, handleEscapeKeyPress);
      };
    },
    [onClose]
  );

  useEffect(() => {
    if (userRating) countRatingDecisionsRef.current++;
  }, [userRating]);

  return (
    <div className="details">
      {!isLoading && !error && (
        <>
          <header>
            <button className="btn-back" onClick={onClose}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title} movie`}></img>
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {isWatched ? (
                <p>
                  You rated this movie {watchedUserRating}
                  <span>⭐</span>
                </p>
              ) : (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating && (
                    <button
                      className="btn-add"
                      onClick={handleAddMovieToWatched}
                    >
                      Add to list
                    </button>
                  )}
                </>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
      {isLoading && <Loader />}
      {error && <ErrorMessage message={error} />}
    </div>
  );
}
