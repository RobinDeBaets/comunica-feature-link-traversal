# Comunica SPARQL Link Traversal Init Actor Using Summaries

[![npm version](https://badge.fury.io/js/%40comunica%2Fquery-sparql-link-traversal-summaries.svg)](https://www.npmjs.com/package/@comunica/query-sparql-link-traversal-summaries)
[![Docker Pulls](https://img.shields.io/docker/pulls/comunica/query-sparql-link-traversal-summaries.svg)](https://hub.docker.com/r/comunica/query-sparql-link-traversal-summaries/)

Comunica SPARQL Link Traversal is a SPARQL query engine for JavaScript that follows links according to data source summaries.

**Warning: due to the uncontrolled nature of the Web, it is recommended to always enable [lenient mode](https://comunica.dev/docs/query/advanced/context/#4--lenient-execution) when doing link traversal.**

This module is part of the [Comunica framework](https://comunica.dev/).

## Install

```bash
$ yarn add @comunica/query-sparql-link-traversal-summaries
```

or

```bash
$ npm install -g @comunica/query-sparql-link-traversal-summaries
```

## Install a prerelease

Since this package is still in testing phase, you may want to install a prerelease of this package, which you can do by appending `@next` to the package name during installation.

```bash
$ yarn add @comunica/query-sparql-link-traversal-summaries@next
```

or

```bash
$ npm install -g @comunica/query-sparql-link-traversal-summaries@next
```

## Usage

Show 100 triples from http://fragments.dbpedia.org/2015-10/en:

```bash
$ comunica-sparql-link-traversal-summaries https://www.rubensworks.net/ \
  "SELECT DISTINCT * WHERE {
       <https://www.rubensworks.net/#me> <http://xmlns.com/foaf/0.1/knows> ?p.
       <https://ruben.verborgh.org/profile/#me> <http://xmlns.com/foaf/0.1/knows> ?p.
       ?p <http://xmlns.com/foaf/0.1/name> ?name.
   }" --lenient
```

Show the help with all options:

```bash
$ comunica-sparql-link-traversal-summaries --help
```

Just like [Comunica SPARQL](https://github.com/comunica/comunica/tree/master/packages/query-sparql),
a [dynamic variant](https://github.com/comunica/comunica/tree/master/packages/query-sparql#usage-from-the-command-line) (`comunica-dynamic-sparql-link-traversal`) also exists.

_[**Read more** about querying from the command line](https://comunica.dev/docs/query/getting_started/query_cli/)._

### Usage within application

This engine can be used in JavaScript/TypeScript applications as follows, using the `@comunica/actor-rdf-resolve-hypermedia-links-queue-wrapper-summaries:summaries` to declare
initial summaries:

```javascript
import { KEY_SUMMARIES } from '@comunica/actor-rdf-resolve-hypermedia-links-queue-wrapper-summaries';
const QueryEngine = require('@comunica/query-sparql-link-traversal-summaries').QueryEngine;
const myEngine = new QueryEngine();

const bindingsStream = await myEngine.queryBindings(`
  SELECT DISTINCT * WHERE {
      <https://www.rubensworks.net/#me> <http://xmlns.com/foaf/0.1/knows> ?p.
      <https://ruben.verborgh.org/profile/#me> <http://xmlns.com/foaf/0.1/knows> ?p.
      ?p <http://xmlns.com/foaf/0.1/name> ?name.
  }`, {
    sources: ['https://www.rubensworks.net/'],
    lenient: true,
    [KEY_SUMMARIES.name]: {
    '@graph': [{
      '@id': 'http://localhost:3000/dbpedia.org/resource/Greece#summary',
      '@type': 'summary:Summary',
      'summary:bloomFilterHashFunctions': 4,
      'summary:bloomFilterSize': 128,
      summaryMode: 'summary:DiscoveryMode',
      summaryFile: 'http://localhost:8000/summary1',
      summaryOf: 'http://localhost:3000/dbpedia.org/resource/Greece',
      summaryType: 'summary:BloomFilter',
    }],
    '@id': 'urn:x-arq:DefaultGraphNode',
    '@context': {
      bloomFilterHashFunctions: {
        '@id': 'http://localhost:8000/summary#bloomFilterHashFunctions',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      bloomFilterSize: {
        '@id': 'http://localhost:8000/summary#bloomFilterSize',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      summaryOf: {
        '@id': 'http://localhost:8000/summary#summaryOf',
        '@type': '@id',
      },
      summaryFile: {
        '@id': 'http://localhost:8000/summary#summaryFile',
        '@type': '@id',
      },
      summaryType: {
        '@id': 'http://localhost:8000/summary#summaryType',
        '@type': '@id',
      },
      summaryMode: {
        '@id': 'http://localhost:8000/summary#summaryMode',
        '@type': '@id',
      },
      summary: 'http://localhost:8000/summary#',
    },
  },
});

// Consume results as a stream (best performance)
bindingsStream.on('data', (binding) => {
    console.log(binding.toString()); // Quick way to print bindings for testing

    console.log(binding.has('s')); // Will be true

    // Obtaining values
    console.log(binding.get('s').value);
    console.log(binding.get('s').termType);
    console.log(binding.get('p').value);
    console.log(binding.get('o').value);
});
bindingsStream.on('end', () => {
    // The data-listener will not be called anymore once we get here.
});
bindingsStream.on('error', (error) => {
    console.error(error);
});

// Consume results as an array (easier)
const bindings = await bindingsStream.toArray();
console.log(bindings[0].get('s').value);
console.log(bindings[0].get('s').termType);
```

_[**Read more** about querying an application](https://comunica.dev/docs/query/getting_started/query_app/)._

### Usage as a SPARQL endpoint

Start a webservice exposing https://www.rubensworks.net/ via the SPARQL protocol, i.e., a _SPARQL endpoint_.

```bash
$ comunica-sparql-link-traversal-summaries-http https://www.rubensworks.net/ --lenient
```

Show the help with all options:

```bash
$ comunica-sparql-link-traversal-summaries-http --help
```

The SPARQL endpoint can only be started dynamically.
An alternative config file can be passed via the `COMUNICA_CONFIG` environment variable.

Use `bin/http.js` when running in the Comunica monorepo development environment.

_[**Read more** about setting up a SPARQL endpoint](https://comunica.dev/docs/query/getting_started/setup_endpoint/)._
