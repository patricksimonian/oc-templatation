#!/usr/bin/env node
const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const { isString } = require('lodash');
const yaml = require('js-yaml');
const fs = require('fs');
const writeFile = require('write');

if (!argv.file || !isString(argv.file)) throw new Error('--file must be a valid file');

const KINDS = {
  ReplicationController: 'ReplicationController',
  Service: 'Service',
  Template: 'Template',
  ReplicaSet: 'ReplicaSet',
  Pod: 'Pod',
};

const BLACK_LISTED_OBJECTS = {
  [KINDS.ReplicaSet]: true,
  [KINDS.Pod]: true,
  [KINDS.ReplicationController]: true,
};

let state = {
  itteratingOverTemplate: false, // if itterating over template all looping functions itterate over an objects key not items
  itteratingKey: 'items',
};

const isObjectBlackListed = object => {
  return BLACK_LISTED_OBJECTS[object.kind];
};

const shouldKeepObject = object => !isObjectBlackListed(object);

const isFileTemplate = data => data.kind === KINDS.Template;

const getFile = filePath => fs.readFileSync(path.join(process.cwd(), filePath));

const runPlugins = (data, plugins) => plugins.reduce((data, plugin) => plugin(data), data);

const filterUselessAttributes = () => {
  const file = yaml.safeLoad(getFile(argv.file));
  if (isFileTemplate(file)) {
    state = {
      ...state,
      itteratingOverTemplate: true,
      itteratingKey: 'objects',
    };
  }
  try {
    const data = runPlugins(file, [
      stripOutUselessObjects,
      filterOutMetadata,
      filterOutStatusFromObjects,
      filterOutUid,
      filterOutClusterIp,
    ]);
    writeToFile(data, argv.file);
  } catch (e) {
    console.log('ERROR!! \n\n');
    console.warn(e);
  }
};

const filterOutStatusFromObjects = data => ({
  ...data,
  [state.itteratingKey]: data[state.itteratingKey].map(({ status, ...item }) => ({
    ...item,
  })),
});

const filterOutMetadata = data => ({
  ...data,
  [state.itteratingKey]: data[state.itteratingKey].map(
    ({
      metadata: { creationTimestamp, selfLink, namespace, resourceVersion, ...metadata },
      ...item
    }) => ({ ...item, metadata }),
  ),
});

const filterOutUid = data => ({
  ...data,
  [state.itteratingKey]: data[state.itteratingKey].map(item => {
    delete item.metadata.uid;
    return item;
  }),
});

const filterOutClusterIp = data => ({
  ...data,
  [state.itteratingKey]: data[state.itteratingKey].map(item => {
    if (item.spec && item.spec.clusterIP) {
      // do not delete uids from replication controllers
      delete item.spec.clusterIP;
    }
    return item;
  }),
});

const stripOutUselessObjects = data => ({
  ...data,
  [state.itteratingKey]: data[state.itteratingKey].filter(shouldKeepObject),
});

const writeToFile = (data, filePath) => {
  const yamlText = yaml.safeDump(data);
  writeFile(filePath, yamlText);
};

filterUselessAttributes();
