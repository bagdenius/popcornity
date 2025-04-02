import WatchedMovieItem from './WatchedMovieItem';

export default function WatchedMoviesList({
  movies,
  onDeleteMovieFromWatched,
}) {
  return (
    <ul className='list'>
      {movies.map((movie) => (
        <WatchedMovieItem
          movie={movie}
          key={movie.imdbID}
          onDeleteMovieFromWatched={onDeleteMovieFromWatched}
        />
      ))}
    </ul>
  );
}
