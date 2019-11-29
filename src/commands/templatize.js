import {
  getFile,
  isFileTemplate,
  stripOutUselessObjects,
  fillerPlugin,
  filterOutClusterIp,
  filterOutMetadata,
  filterOutStatusFromObjects,
  filterOutUid,
  isStandaloneObject,
  convertToList,
  runPlugins,
  writeToFile,
} from '../utils';
import yaml from 'js-yaml';

export const action = (file, options) => {
  let jsonData = {};
  let isJson = true;
  const pluginsToRun = [
    !options.doNotStrip ? stripOutUselessObjects : fillerPlugin,
    filterOutMetadata,
    filterOutStatusFromObjects,
    filterOutUid,
    filterOutClusterIp,
  ];

  if (!/(\.json|.yaml)$/.test(file)) {
    throw new Error('Invalid file format. Only JSON and YAML files allowed.');
  }

  const fileData = getFile(file);
  try {
    // attempt to parse as json
    jsonData = JSON.parse(fileData);
  } catch (e) {
    jsonData = yaml.safeLoad(fileData);
    isJson = false;
  }

  if (isFileTemplate(jsonData)) {
    console.log('file is already a template');
    process.exit(0);
  }

  if (isStandaloneObject(jsonData)) {
    jsonData = convertToList(jsonData);
  }

  try {
    let data = runPlugins(file, pluginsToRun);

    data = convertToTemplate(data);

    const outputPath = options.path
      ? path.join(process.cwd(), options.path)
      : path.join(process.cwd(), file);

    writeToFile(data, outputPath, isJson);
    process.exit(0);
  } catch (e) {
    console.warn(e);
    process.exit(1);
  }
};
