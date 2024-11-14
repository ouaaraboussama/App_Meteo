import { Oval } from 'react-loader-spinner';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown, faStar } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function Grp204WeatherApp() {
  const [input, setInput] = useState('');
  const [weather, setWeather] = useState({
    loading: false,
    data: {},
    forecast: [],
    error: false,
  });
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Load favorite cities from localStorage on mount
    const savedFavorites = JSON.parse(localStorage.getItem('favoriteCities')) || [];
    setFavorites(savedFavorites);
  }, []);

  const toDateFunction = () => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août',
      'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const WeekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const currentDate = new Date();
    const date = `${WeekDays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
    return date;
  };

  const search = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      fetchWeather(input);
    }
  };

  const fetchWeather = async (city) => {
    setInput('');
    setWeather({ ...weather, loading: true });
    const api_key = 'f00c38e0279b7bc85480c3fe775d518c';
    const currentWeatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
    const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    try {
      const [currentWeatherRes, forecastRes] = await Promise.all([
        axios.get(currentWeatherUrl, { params: { q: city, units: 'metric', appid: api_key } }),
        axios.get(forecastUrl, { params: { q: city, units: 'metric', appid: api_key } })
      ]);

      setWeather({
        data: currentWeatherRes.data,
        forecast: forecastRes.data.list.filter((_, index) => index % 8 === 0),
        loading: false,
        error: false,
      });
    } catch (error) {
      setWeather({ ...weather, data: {}, forecast: [], error: true });
    }
  };

  const addFavorite = () => {
    if (!favorites.includes(input)) {
      const updatedFavorites = [...favorites, input];
      setFavorites(updatedFavorites);
      localStorage.setItem('favoriteCities', JSON.stringify(updatedFavorites));
      setInput('');
    }
  };

  const removeFavorite = (city) => {
    const updatedFavorites = favorites.filter(fav => fav !== city);
    setFavorites(updatedFavorites);
    localStorage.setItem('favoriteCities', JSON.stringify(updatedFavorites));
  };

  return (
    <div className="App">
      <h1 className="app-name">Application Météo grp204</h1>

      <div className="search-bar">
        <input
          type="text"
          className="city-search"
          placeholder="Entrez le nom de la ville..."
          name="query"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyPress={search}
        />
        <button onClick={addFavorite} className="favorite-btn">
          <FontAwesomeIcon icon={faStar} /> Ajouter aux Favoris
        </button>
      </div>

      <div className="favorites-list">
        <h3>Villes Favoris</h3>
        {favorites.map((city, index) => (
          <div key={index} className="favorite-item">
            <span onClick={() => fetchWeather(city)}>{city}</span>
            <button onClick={() => removeFavorite(city)}>Supprimer</button>
          </div>
        ))}
      </div>

      {weather.loading && (
        <Oval type="Oval" color="black" height={100} width={100} />
      )}
      {weather.error && (
        <span className="error-message">
          <FontAwesomeIcon icon={faFrown} />
          <span>Ville introuvable</span>
        </span>
      )}

      {weather && weather.data && weather.data.main && (
        <div>
          <h2>{weather.data.name}, {weather.data.sys.country}</h2>
          <span>{toDateFunction()}</span>
          <img
            src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`}
            alt={weather.data.weather[0].description}
          />
          <p>{Math.round(weather.data.main.temp)}°C</p>
          <p>Vitesse du vent : {weather.data.wind.speed} m/s</p>
        </div>
      )}

      {weather.forecast && weather.forecast.length > 0 && (
        <div className="forecast-section">
          <h3>Prévisions météo sur 5 jours</h3>
          <div className="forecast-cards">
            {weather.forecast.map((day, index) => {
              const date = new Date(day.dt * 1000);
              const dayOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][date.getDay()];
              const dayDate = `${dayOfWeek} ${date.getDate()}/${date.getMonth() + 1}`;
              return (
                <div key={index} className="forecast-card">
                  <span>{dayDate}</span>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt={day.weather[0].description}
                  />
                  <p>{Math.round(day.main.temp)}°C</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Grp204WeatherApp;