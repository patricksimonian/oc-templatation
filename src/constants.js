export const KINDS = {
  ReplicationController: 'ReplicationController',
  Service: 'Service',
  Template: 'Template',
  ReplicaSet: 'ReplicaSet',
  Pod: 'Pod',
  List: 'List',
  Route: 'Route',
};

export const BLACK_LISTED_OBJECTS = {
  [KINDS.ReplicaSet]: true,
  [KINDS.Pod]: true,
  [KINDS.ReplicationController]: true,
};

export const STANDARD_PARAMETERS = [
  {
    name: 'NAME',
    displayName: 'name',
    description: 'The common name shared among configuration details in the template',
  },
  {
    name: 'SUFFIX',
    displayName: 'name suffix',
    value: '',
    description:
      "a helpful suffix you apply to your NAME parameter. This is especially useful for 'released' versions of your templates",
  },
];
