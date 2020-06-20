import axios from 'axios';

export const setError = (payload) => ({
  type: 'SET_ERROR',
  payload,
});

export const loginRequest = (payload) => ({
  type: 'LOGIN_REQUEST',
  payload,
});

export const logoutRequest = (payload) => ({
  type: 'LOGOUT_REQUEST',
  payload,
});

export const registerRequest = (payload) => ({
  type: 'REGISTER_REQUEST',
  payload,
});

export const setFavorite = (payload) => ({
  type: 'SET_FAVORITE',
  payload,
});

export const sendFavorite = (payload) => {
  return (dispatch) => {
    dispatch(setFavorite(payload));

    axios({
      url: '/user-movies',
      method: 'post',
      data: { movieId: payload._id },
    }).catch((err) => dispatch(setError(err)));
  };
};

export const getMyList = () => {
  return (dispatch, getState) => {
    const state = getState();
    if (state.myList.length === 0) {
      axios.get('/user-movies').then(({ data }) => {
        const { data: movieList } = data;

        movieList.forEach((userMovie) => {
          axios
            .get(`/user-movies/${userMovie.movieId}`)
            .then(({ data: item }) => {
              const movie = {
                ...item.movie,
                _id: userMovie._id,
              };

              dispatch(setFavorite(movie));
            })
            .catch((err) => dispatch(setError(err)));
        });
      });
    }
  };
};

export const deleteFavorite = (payload) => ({
  type: 'DELETE_FAVORITE',
  payload,
});

export const sendDeleteFavorite = (id) => {
  return (dispatch) => {
    axios
      .delete(`/user-movies/${id}`)
      .then((res) => dispatch(deleteFavorite(res.data.id)))
      .catch((err) => dispatch(console.error(err)));
  };
};
export const getVideoSource = (payload) => ({
  type: 'GET_VIDEO_SOURCE',
  payload,
});

export const registerUser = (payload, redirectUrl) => {
  return (dispatch) => {
    axios
      .post('/auth/sign-up', payload)
      .then(({ data }) => dispatch(registerRequest(data)))
      .then(() => {
        window.location.href = redirectUrl;
      })
      .catch((err) => dispatch(setError(err)));
  };
};

export const loginUser = ({ email, password, rememberMe }, redirectUrl) => {
  return (dispatch) => {
    const auth = {
      password,
      username: email,
    };
    console.log(auth);
    axios({
      url: '/auth/sign-in',
      method: 'post',
      auth,
      data: {
        rememberMe,
      },
    })
      .then(({ data }) => {
        document.cookie = `email=${data.user.email}`;
        document.cookie = `name=${data.user.name}`;
        document.cookie = `id=${data.user.id}`;
        dispatch(loginRequest(data.user));
      })
      .then(() => {
        window.location.href = redirectUrl;
      })
      .catch((err) => dispatch(setError(err)));
  };
};

export const loginWithGoogle = () => {
  return (dispatch, getState) => {
    axios({
      url: '/auth/google-oauth',
      method: 'get',
    })
      .then(({ data }) => {
        console.log(data);
      })
      .catch((err) => console.log('error after request', err));
  };
};

export { setFavorite as default };
