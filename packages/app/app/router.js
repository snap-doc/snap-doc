import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

// eslint-disable-next-line prefer-arrow-callback, array-callback-return
Router.map(function router() {});

export default Router;
