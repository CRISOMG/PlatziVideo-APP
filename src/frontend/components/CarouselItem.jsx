import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { sendFavorite, sendDeleteFavorite } from "../actions";
import "../assets/styles/components/CarouselItem.scss";
import playIcon from "../assets/static/play-icon.png";
import plusIcon from "../assets/static/plus-icon.png";
import removeIcon from "../assets/static/remove-icon.png";

const CarouselItem = (props) => {
  const {
    _id,
    cover,
    title,
    year,
    contentRating,
    duration,
    isList,
    slug,
    source,
  } = props;
  const handlesendFavorite = () => {
    props.sendFavorite({
      _id,
      cover,
      title,
      year,
      contentRating,
      duration,
      isList,
      slug,
      source,
    });
  };
  const handleDeleteFavorite = (itemId) => {
    props.sendDeleteFavorite(itemId);
  };
  return (
    <div className="carousel-item">
      <img className="carousel-item__img" src={cover} alt={title} />
      <div className="carousel-item__details">
        <div>
          <Link to={`/player/${_id}`}>
            <img
              className="carousel-item__details--img"
              src={playIcon}
              alt="Play Icon"
            />
          </Link>
          {!isList ? (
            <img
              className="carousel-item__details--img"
              src={plusIcon}
              alt="Reproducir"
              onClick={handlesendFavorite}
            />
          ) : (
            <img
              className="carousel-item__details--img"
              src={removeIcon}
              alt="Quitar de mi lista"
              onClick={() => handleDeleteFavorite(_id)}
            />
          )}
        </div>
        <p className="carousel-item__details--title">{title}</p>
        <p className="carousel-item__details--subtitle">{`${year} ${contentRating} ${duration}`}</p>
      </div>
    </div>
  );
};

CarouselItem.propTypes = {
  title: PropTypes.string,
  year: PropTypes.number,
  contentRating: PropTypes.string,
  duration: PropTypes.number,
  cover: PropTypes.string,
  sendDeleteFavorite: PropTypes.func,
  sendFavorite: PropTypes.func,
};

const mapDispatchToProps = {
  sendFavorite,
  sendDeleteFavorite,
};

export default connect(null, mapDispatchToProps)(CarouselItem);
