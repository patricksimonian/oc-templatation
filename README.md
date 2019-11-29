## Template Cleaning Tool
A helper to convert `oc get [objects]` call into a template

A small node js script is provided to strip away useless defaults that are generated from a command
like `oc get all --export=true -o yaml > somefile.yaml`

This command pulls down all objects including their preset metadata which is useless in the context of a
reusable template. 

## What does the Node Script do?

Strips out:
- clusterIp references
- metadata.creationTimestamp
- metadata.selfLink
- metadata.namespace
- metadata.resourceVersion
- uids
- useless openshift objects like replica sets and replication controllers and pods

Optionally it can convert a list into a template

## How to use
> requires Node JS 10.15.3 or higher
`npx @bcgov/oc-template -h`


### Roadmap
1. Auto-parameterizing templates :fire:

### Suggested
> pr your suggestions in here in a list

- template linting/verification
- testing setup with mocha/chai

### Planned

### Working on

- no suggestions yet! Make an [issue!](https://github.com/patricksimonian/oc-templation/issues/new)