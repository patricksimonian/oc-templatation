import fs, { writeFileSync } from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { KINDS, BLACK_LISTED_OBJECTS } from './constants';

export const isObjectBlackListed = object => {
  return BLACK_LISTED_OBJECTS[object.kind];
};

export const isFileTemplate = data => data.kind === KINDS.Template;

export const isStandaloneObject = object => !isFileTemplate(object) && !isList(object);

export const shouldKeepObject = object => !isObjectBlackListed(object);

export const isList = data => data.kind === KINDS.List;

export const getFile = filePath => fs.readFileSync(path.join(process.cwd(), filePath));

export const writeToFile = (data, filePath, isJson) => {
  let text = '';
  if (isJson) {
    text = JSON.stringify(data, null, 2);
  } else {
    text = yaml.safeDump(data);
  }
  writeFileSync(filePath, text);
};

export const filterOutStatusFromObjects = data => ({
  ...data,
  items: data.items.map(({ status, ...item }) => ({
    ...item,
  })),
});

export const fillerPlugin = data => data;

export const filterOutMetadata = data => ({
  ...data,
  items: data.items.map(
    ({
      metadata: { creationTimestamp, selfLink, namespace, resourceVersion, ...metadata },
      ...item
    }) => {
      return { ...item, metadata };
    },
  ),
});

export const filterOutUid = data => ({
  ...data,
  items: data.items.map(item => {
    delete item.metadata.uid;
    return item;
  }),
});

export const filterOutClusterIp = data => ({
  ...data,
  items: data.items.map(item => {
    if (item.spec && item.spec.clusterIP) {
      // do not delete uids from replication controllers
      delete item.spec.clusterIP;
    }
    return item;
  }),
});

export const stripOutUselessObjects = data => ({
  ...data,
  items: data.items.filter(shouldKeepObject),
});

export const convertToList = object => ({
  kind: KINDS.List,
  apiVersion: 'v1',
  items: [object],
});

export const convertToTemplate = data => {
  const template = {
    kind: KINDS.Template,
    apiVersion: 'v1',
    objects: data.items,
  };
  return template;
};

export const runPlugins = (data, plugins) => plugins.reduce((data, plugin) => plugin(data), data);
