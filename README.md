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
`npm install -g oc-clean-template-things`
then
`oc-clean-template-things --file=[path to file]`

Getting options is as easy as `oc-clean-template-things -h`

### Flags

- `--file=./path to file` path to the tempalte/list file
- `--doNotStrip=true|false`  defaults to false, set to true if you do not want objects to be stripped from your manifests
- `--asTemplate=true|false` defaults to false, this will convert your cleaned List file to a template

### Roadmap

### Suggested
> pr your suggestions in here in a list

- template linting/verification
- testing setup with mocha/chai

### Planned

### Working on

- no suggestions yet! Make an [issue!](https://github.com/patricksimonian/oc-templation/issues/new)
