#!/usr/bin/env node
const argv = require('minimist')(process.argv.slice(2), { boolean: true });
const path = require('path');
const { isString } = require('lodash');
const yaml = require('js-yaml');
const fs = require('fs');
const writeFile = require('write');

const OPTIONS = {
  h: {
    description: 'Lists available options',
  },
  file: {
    description:
      'Openshift template or object definition file to cleanup, usage oc-clean-template-things --file=[path to file]',
  },
  asTemplate: {
    description:
      'Converts an Object Definition file to a template, this replaces the object definition file, usage oc-clean-template-things --file=[...] --asTemplate=true',
  },
  doNotStrip: {
    description:
      'Objects not needed for a Template are typically stripped (ReplicaSet, Pods) etc, this disables this feature',
  },
};

const KINDS = {
  ReplicationController: 'ReplicationController',
  Service: 'Service',
  Template: 'Template',
  ReplicaSet: 'ReplicaSet',
  Pod: 'Pod',
  List: 'List',
  Route: 'Route',
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

const listAvailableCommands = () => {
  console.log('Version: ', require('./package.json').version);
  console.log('Available commands: \n');
  const keys = Object.keys(OPTIONS);
  const largestPadding = keys.reduce((num, key) => {
    if (key.length > num) return key.length;
    return num;
  }, 0);

  keys.forEach(key => {
    const dash = key.length === 1 ? '-' : '--';
    const padding = largestPadding - key.length + (key.length === 1 ? 1 : 0);

    console.log(`\t${dash}${key}: ${' '.repeat(padding)} ${OPTIONS[key].description}`);
  });
};

const isStandaloneObject = object => !isFileTemplate(object) && !isList(object);

const shouldKeepObject = object => !isObjectBlackListed(object);

const isFileTemplate = data => data.kind === KINDS.Template;

const isList = data => data.kind === KINDS.List;

const getFile = filePath => fs.readFileSync(path.join(process.cwd(), filePath));

const runPlugins = (data, plugins) => plugins.reduce((data, plugin) => plugin(data), data);

const filterUselessAttributes = () => {
  if (!argv.file || !isString(argv.file)) throw new Error('--file must be a valid file');
  let file = yaml.safeLoad(getFile(argv.file));
  const convertingToTemplate = !!argv.asTemplate;
  const pluginsToRun = [
    !argv.doNotStrip ? stripOutUselessObjects : fillerPlugin,
    filterOutMetadata,
    filterOutStatusFromObjects,
    filterOutUid,
    filterOutClusterIp,
  ];

  if (isStandaloneObject(file)) {
    // if standalone do not use the stripOutUlessObjects plugin
    file = convertToList(file);
  } else if (isFileTemplate(file)) {
    state = {
      ...state,
      itteratingOverTemplate: true,
      itteratingKey: 'objects',
    };
    if (convertingToTemplate) {
      console.log("asTemplate was set to 'true' but the file is already a template");
    }
  }
  try {
    let data = runPlugins(file, pluginsToRun);
    if (convertingToTemplate && !state.itteratingOverTemplate) {
      data = convertToTemplate(data);
    }
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

const fillerPlugin = data => data;

const filterOutMetadata = data => ({
  ...data,
  [state.itteratingKey]: data[state.itteratingKey].map(
    ({
      metadata: { creationTimestamp, selfLink, namespace, resourceVersion, ...metadata },
      ...item
    }) => {
      return { ...item, metadata };
    },
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

const convertToList = object => ({
  kind: KINDS.List,
  apiVersion: 'v1',
  items: [object],
});

const convertToTemplate = data => {
  const template = {
    kind: KINDS.Template,
    apiVersion: 'v1',
    objects: data.items,
  };
  return template;
};

const writeToFile = (data, filePath) => {
  const yamlText = yaml.safeDump(data);
  writeFile(filePath, yamlText);
};

const main = () => {
  if (argv.h) {
    listAvailableCommands();
  } else {
    filterUselessAttributes();
  }
};

main();
