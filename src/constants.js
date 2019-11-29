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
