import Ember from 'ember';
import _ from 'lodash/lodash';
import semverCompare from 'npm:semver-compare';
import getMinorVersion from "../utils/get-minor-version";

export default Ember.Controller.extend({
  classesIDs: Ember.computed('model', function() {
    return this.getRelationshipIDs('classes');
  }),

  publicClassesIDs: Ember.computed('model', function() {
    return this.getRelationshipIDs('public-classes');
  }),

  namespaceIDs: Ember.computed('model', function() {
    return this.getRelationshipIDs('namespaces');
  }),

  publicNamespaceIDs: Ember.computed('model', function() {
    return this.getRelationshipIDs('public-namespaces');
  }),

  moduleIDs: Ember.computed('model', function() {
    return this.getModuleRelationships(this.get('model.id'), 'modules');
  }),

  publicModuleIDs: Ember.computed('model', function() {
    return this.getModuleRelationships(this.get('model.id'), 'public-modules');
  }),

  getModuleRelationships(versionId, moduleType) {
    let relations = this.getRelations(moduleType);
    return relations.map(id => id.substring(versionId.length + 1))
  },

  getRelations(relationship) {
    return this.get('model').hasMany(relationship).ids().sort();
  },

  getRelationshipIDs(relationship) {
    const classes = this.get('model').hasMany(relationship);
    const sorted = Ember.A(classes.ids()).sort();
    return Ember.A(sorted).toArray().map(id => id.split('-').pop());
  },

  shownClassesIDs: Ember.computed('showPrivateClasses', 'classesIDs', 'publicClassesIDs', function() {
    return this.get('showPrivateClasses') ? this.get('classesIDs') : this.get('publicClassesIDs');
  }),

  shownModuleIDs: Ember.computed('showPrivateClasses', 'moduleIDs', 'publicModuleIDs', function() {
    return this.get('showPrivateClasses') ? this.get('moduleIDs') : this.get('publicModuleIDs');
  }),

  shownNamespaceIDs: Ember.computed('showPrivateClasses', 'namespaceIDs', 'publicNamespaceIDs', function() {
    return this.get('showPrivateClasses') ? this.get('namespaceIDs') : this.get('publicNamespaceIDs');
  }),

  projectVersionIDs: Ember.computed('model', function() {
    const projectID = this.get('model').belongsTo('project').id();
    const project = this.store.peekRecord('project', projectID);

    return project.hasMany('projectVersions').ids();
  }),

  projectVersions: Ember.computed('model', function() {
    const projectVersions = this.get('model.project.projectVersions');
    let versions = projectVersions.toArray().sort(function(a, b) {
      const a_ver = _.last(a.get('id').split("-"));
      const b_ver = _.last(b.get('id').split("-"));
      return semverCompare(b_ver, a_ver);
    });
    versions.forEach(function(version) {
      const versionString = _.last(version.get('id').split("-"));
      const minorVersion = getMinorVersion(versionString);
      version.set('minorVersion', minorVersion);
    });
    let groupedVersions = _.groupBy(versions, function(version) {
      return version.get('minorVersion');
    });
    return _.values(groupedVersions).map(function(groupedVersion) {
      return groupedVersion[0];
    });
  }),

  activeProject: Ember.computed.readOnly('model.project.id')
});
