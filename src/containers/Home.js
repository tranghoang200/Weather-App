import React, { useState, useEffect } from "react";
import { StyleSheet, ImageBackground } from "react-native";
import { createExample } from "../actions/Example";
import { connect } from "react-redux";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import WeatherCard from "../component/WeatherCard";
import { CITIES, getWeatherBackgroundImage } from "../utils/index";
import CitySelectionButtons from "../component/CitySelectionButtons";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [location, setLocation] = useState({
    name: "",
    main: { temp: "" },
    wind: { speed: "" },
    weather: [{ main: "", description: "" }],
  });

  useEffect(() => {
    getLocationAsync();
  }, []);

  getWeather = async (latitude, longitude, imgUrl = "https://cdn.star2.com/wp-content/uploads/2016/11/doc6s4zr9h0mdsz1srcegp.jpg") => {
    setLoading(true);
    const API_KEY = "3de6162d3745365b168ade2bbe4e1d66";
    const api = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    try {
      const response = await fetch(api);
      const jsonData = await response.json();
      setLocation({ ...jsonData, imgUrl });
    } catch (error) {
      setError(true);
    }
    setLoading(false);
  };

  getLocationAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      return;
    }

    const location = await Location.getCurrentPositionAsync();
    getWeather(location.coords.latitude, location.coords.longitude);
  };

  onChooseCity = (name) => {
    let randImg = "";
    if (name !== "") {
      const city = CITIES.find((city) => city.name === name);
      randImg = city.imgUrl[Math.floor(Math.random() * city.imgUrl.length)];
      this.getWeather(city.latitude, city.longitude, randImg);
    } else {
      this.getLocationAsync();
    }
  };

  const bgImage = {
    uri: location.imgUrl || getWeatherBackgroundImage(location.weather[0].main),
  };

  return (
    <ImageBackground source={bgImage} style={styles.bg}>
      <WeatherCard location={location} error={error} loading={loading} />
      <CitySelectionButtons onChooseCity={onChooseCity} />
    </ImageBackground>
  );
};

const mapStateToProps = (state) => {
  return { ...state.example };
};

export default connect(mapStateToProps, { createExample })(Home);

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
  },
});
