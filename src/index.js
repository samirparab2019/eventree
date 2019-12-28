import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';

import './index.css';
import App from './app/layout/App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';
import configureStore from './app/store/configureStore';
import ScrollToTop from "./app/common/util/ScrollToTop"
 
const store = configureStore();
 
const rootElement = document.getElementById('root');



let render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter>
      <ScrollToTop>
        <App />
      </ScrollToTop>
      </BrowserRouter>
    </Provider>,
     rootElement);
}

if (module.hot) {
  module.hot.accept('/', () => {
    setTimeout(render);
  })
}

store.firebaseAuthIsReady.then(() => {
  render();
})


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
