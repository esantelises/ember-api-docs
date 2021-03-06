import Ember from 'ember';
import semverCompare from 'npm:semver-compare';
import _ from 'lodash/lodash';


const { inject } = Ember;

export default Ember.Route.extend({

  scrollPositionReset: inject.service(),

  model(params) {
    return this.store.findRecord('project', params.project, { includes: 'project-version' });
  },

  // Using redirect instead of afterModel so transition succeeds and returns 307 in fastboot
  redirect(project /*, transition */) {
    const versions = project.get('projectVersions').toArray();
    const last = versions.sort((a, b) => {
      const a_ver = this.getVersionString(a);
      const b_ver = this.getVersionString(b);
      return semverCompare(a_ver, b_ver);
    })[versions.length - 1];
    return this.transitionTo('project-version', project.get('id'), this.getVersionString(last));
  },

  getVersionString(version) {
    return _.last(version.get('id').split("-"));
  },

  actions: {

    willTransition(transition) {
      this.get('scrollPositionReset').scheduleReset(transition);
    },

    didTransition() {
      this.get('scrollPositionReset').doReset();
    }
  }
});
