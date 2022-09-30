import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import "../index.css";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import React from "react";
import ImagePopup from "./ImagePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import EditProfilePopup from "./EditProfilePopup";
import Register from "./Register";
import InfoTooltip from "./InfoTooltip";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import * as auth from "../utils/auth";
import { api } from "../utils/api";
import { CurrentUserContext } from "../contexts/CurrentUserContext";

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(
    false
  );
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(
    false
  );
  const [isImagePopupOpen, setIsImagePopupOpen] = React.useState(null);
  const [selectedCard, setSelectedCard] = React.useState({});
  const [currentUser, setCurrentUser] = React.useState({});
  const [cards, setCards] = React.useState([]);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isInfoTooltipPopupOpen, setIsInfoTooltipPopupOpen] = React.useState(
    false
  );
  const [userEmail, setUserEmail] = React.useState("");
  const [mobailOpen, setMobailOpen] = React.useState(false);
  const history = useHistory();

  React.useEffect(() => {
    if (loggedIn) {
      api
        .getUserInfo()
        .then(data => {
          setCurrentUser(data);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }, [loggedIn]);

  React.useEffect(() => {
    if (loggedIn) {
      api
        .getInitialCards()
        .then(cards => {
          setCards(cards);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }, [loggedIn]);

  const handleCardClick = card => {
    setSelectedCard(card);
    setIsImagePopupOpen(true);
  };

  const handleEditAvatarClick = () => {
    setIsEditAvatarPopupOpen(true);
  };

  const handleEditProfileClick = () => {
    setIsEditProfilePopupOpen(true);
  };

  const handleAddPlaceClick = () => {
    setIsAddPlacePopupOpen(true);
  };

  const closeAllPopup = () => {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsImagePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsInfoTooltipPopupOpen(false);
    setSelectedCard({});
  };

  const handleUpdateAvatar = avatar => {
    api
      .setUserAvatar(avatar)
      .then(data => {
        setCurrentUser(data);
        closeAllPopup();
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleAddPlaceSubmit = ({ name, link }) => {
    api
      .addCard(name, link)
      .then(newCard => {
        setCards([newCard, ...cards]);
        closeAllPopup();
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleProfileSubmit = ({ name, about }) => {
    api
      .editUserInfo(name, about)
      .then(data => {
        setCurrentUser(data);
        closeAllPopup();
      })
      .catch(err => {
        console.log(err);
      });
  };

  function handleCardLike(card) {
    // Снова проверяем, есть ли уже лайк на этой карточке
    const isLiked = card.likes.some(i => i._id === currentUser._id);

    // Отправляем запрос в API и получаем обновлённые данные карточки
    api
      .changeLikeCardStatus(card._id, isLiked)
      .then(newCard => {
        setCards(state => state.map(c => (c._id === card._id ? newCard : c)));
      })
      .catch(err => {
        console.log(err);
      });
  }
  function handleCardRemove(card) {
    api
      .deleteCard(card._id)
      .then(() => {
        setCards(state => state.filter(c => c._id !== card._id));
      })
      .catch(err => {
        console.log(err);
      });
  }

  function handleRegister(email, password) {
    auth
      .register(email, password)
      .then(() => {
        setIsSuccess(true);
        setIsInfoTooltipPopupOpen(true);
        history.push("/sign-in");
      })
      .catch(err => {
        setIsSuccess(false);
        setIsInfoTooltipPopupOpen(true);
        console.log(`Ошибка регистрации ${err}`);
      });
  }

  function handleLogin(email, password) {
    auth
      .authorize(email, password)
      .then(res => {
        if (res) {
          setLoggedIn(true);
          setMobailOpen(false);
          localStorage.setItem("jwt", res.token);
          setUserEmail(email);
          history.push("/");
        }
      })
      .catch(err => {
        setIsSuccess(false);
        setIsInfoTooltipPopupOpen(true);
        console.log(err);
      });
  }

  const handleSignOut = () => {
    setLoggedIn(false);
    localStorage.removeItem("jwt");
    history.push("/sign-in");
  };

  React.useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      auth
        .checkToken(jwt)
        .then(response => {
          setUserEmail(response.data.email);
          setLoggedIn(true);
          history.push("/");
        })
        .catch(err => {
          console.log(err);
        });
    }
  }, [loggedIn, history]);

  const handleClickMobail = () => {
    if (loggedIn) {
      setMobailOpen(!mobailOpen);
    }
  };

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <Header
          loggedIn={loggedIn}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          mobailOpen={mobailOpen}
          handleClickMobail={handleClickMobail}
        />
        <Switch>
          <ProtectedRoute
            exact
            path="/"
            loggedIn={loggedIn}
            component={Main}
            cards={cards}
            onEditProfile={handleEditProfileClick}
            onAddPlace={handleAddPlaceClick}
            onEditAvatar={handleEditAvatarClick}
            onCardClick={handleCardClick}
            onCardLike={handleCardLike}
            onCardRemove={handleCardRemove}
          />
          <Route path="/sign-up">
            <Register onRegister={handleRegister} />
          </Route>
          <Route path="/sign-in">
            <Login onLogin={handleLogin} />
          </Route>
          <Route exact path="*">
            {loggedIn ? <Redirect to="/" /> : <Redirect to="/sign-in" />}
          </Route>
        </Switch>
        <Footer />
        <AddPlacePopup
          onClose={closeAllPopup}
          isOpen={isAddPlacePopupOpen}
          onAddPlace={handleAddPlaceSubmit}
        />
        <EditProfilePopup
          onClose={closeAllPopup}
          isOpen={isEditProfilePopupOpen}
          onUpdateProfile={handleProfileSubmit}
        />
        <EditAvatarPopup
          onClose={closeAllPopup}
          isOpen={isEditAvatarPopupOpen}
          onUpdateAvatar={handleUpdateAvatar}
        />
        <ImagePopup
          onClose={closeAllPopup}
          card={selectedCard}
          isOpen={isImagePopupOpen}
        />
        <InfoTooltip
          isOpen={isInfoTooltipPopupOpen}
          isSuccess={isSuccess}
          onClose={closeAllPopup}
        />
      </div>
    </CurrentUserContext.Provider>
  );
}
export default App;
