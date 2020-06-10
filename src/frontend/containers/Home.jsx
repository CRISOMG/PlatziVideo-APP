import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getMyList } from '../actions';
import Header from '../components/Header';
import Carousel from '../components/Carousel';
import CarouselItem from '../components/CarouselItem';
import Categories from '../components/Categories';
import Search from '../components/Search';
import '../assets/styles/Home.scss';

const Home = (props) => {
  const { myList, trends, originals } = props;

  useEffect(() => {
    props.getMyList();
  }, []);
  return (
    <React.Fragment>
      <Header />
      <Search isHome />
      {myList.length > 0 && (
        <Categories title='Mi lista'>
          <Carousel>
            {myList.map((item) => (
              <CarouselItem key={item._id} {...item} isList />
            ))}
          </Carousel>
        </Categories>
      )}
      <Categories title='Tendencias'>
        <Carousel>
          {trends.map((item) => (
            <CarouselItem key={item._id} {...item} />
          ))}
        </Carousel>
      </Categories>
      <Categories title='Originales de Platfix'>
        <Carousel>
          {originals.map((item) => (
            <CarouselItem key={item._id} {...item} />
          ))}
        </Carousel>
      </Categories>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    myList: state.myList,
    trends: state.trends,
    originals: state.originals,
  };
};

const mapDispatchToProps = {
  getMyList,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
