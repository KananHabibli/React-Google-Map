import React, { useState, useEffect } from "react";
import { Marker, GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { Input, Button } from "@material-ui/core";

//icons
import LocationOnIcon from "@material-ui/icons/LocationOn";
import SearchIcon from "@material-ui/icons/Search";

//custom
import { constant } from "../assets";
import Loading from "./Loading";

//style
import "./CustomMap.css";

//Geocode
import Geocode from "react-geocode";
Geocode.setApiKey(constant.API_KEY);
Geocode.enableDebug();

const containerStyle = {
  width: "70vw",
  height: "70vh",
  margin: "0 auto",
};

const CustomMap = () => {
  const [location, setLocation] = useState({
    coordinates: {
      lat: 40.381335,
      lng: 49.960662,
    },
    zoom: 16,
    showCurrentLocation: true,
  });
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!("geolocation" in navigator))
      setLocation((location) => {
        return { ...location, showCurrentLocation: false };
      });

    findAddress({
      lat: location.coordinates.lat,
      lng: location.coordinates.lng,
    });
    // eslint-disable-next-line
  }, []);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: constant.API_KEY,
  });

  const findCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let { latitude, longitude } = position.coords;
        const coordinates = {
          lat: latitude,
          lng: longitude,
        };

        setLocation({
          ...location,
          coordinates,
        });
        findAddress(coordinates);
      },
      (e) => console.log(e),
      { enableHighAccuracy: true }
    );
  };

  const findGivenAddress = (e) => {
    e.preventDefault();

    Geocode.fromAddress(address).then(
      (res) => {
        let { lat, lng } = res.results[0].geometry.location;
        let address = res.results[0].formatted_address;
        setLocation({ ...location, coordinates: { lat, lng } });
        setAddress(address);
      },
      (e) => console.error(e)
    );
  };

  const findAddress = ({ lat, lng }) => {
    Geocode.fromLatLng(lat, lng).then(
      (res) => {
        const address = res.results[0].formatted_address;
        console.log(address);
        setAddress(address);
      },
      (e) => console.error(e)
    );
  };

  const onMapClick = (event) => {
    const coordinates = {
      lat: parseFloat(event.latLng.lat()),
      lng: parseFloat(event.latLng.lng()),
    };

    setLocation({
      ...location,
      coordinates,
    });
    findAddress(coordinates);
  };

  return isLoaded ? (
    <>
      <form onSubmit={findGivenAddress} className="searchForm">
        <Input
          className="searchInput"
          placeholder="Type a location"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <div className="buttonGroup">
          <Button
            type="submit"
            className="buttonItem"
            variant="contained"
            color="secondary"
            onClick={findGivenAddress}
            style={{ margin: "7px 5px" }}
          >
            <SearchIcon />
            Find Location
          </Button>
          {location.showCurrentLocation && (
            <Button
              className="buttonItem"
              variant="contained"
              color="secondary"
              onClick={findCurrentLocation}
              style={{ margin: "7px 5px" }}
            >
              <LocationOnIcon /> Your Location
            </Button>
          )}
        </div>
      </form>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={location.coordinates}
        zoom={location.zoom}
        onClick={onMapClick}
      >
        <Marker position={location.coordinates} />
      </GoogleMap>
    </>
  ) : (
    <Loading />
  );
};

export default React.memo(CustomMap);
