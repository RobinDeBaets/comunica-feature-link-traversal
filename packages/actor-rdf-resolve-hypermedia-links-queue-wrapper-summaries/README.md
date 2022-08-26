# Comunica Wrapper Summaries RDF Resolve Hypermedia Links Queue Actor

[![npm version](https://badge.fury.io/js/%40comunica%2Factor-rdf-resolve-hypermedia-links-queue-wrapper-summaries.svg)](https://www.npmjs.com/package/@comunica/actor-rdf-resolve-hypermedia-links-queue-wrapper-summaries)

An [RDF Resolve Hypermedia Links Queue](https://github.com/comunica/comunica/tree/master/packages/bus-rdf-resolve-hypermedia-links-queue) actor
that wraps over another link queue provided by the bus. 
Using the context entry `@comunica/actor-rdf-resolve-hypermedia-links-queue-wrapper-summaries:summaries`, summaries can be specified 
during the initialization of the query engine in the JSON-LD format. These summaries will be used to push new sources to discover
to the queue and prevent irrelevant sources from being added to the queue.

This module is part of the [Comunica framework](https://github.com/comunica/comunica),
and should only be used by [developers that want to build their own query engine](https://comunica.dev/docs/modify/).

[Click here if you just want to query with Comunica](https://comunica.dev/docs/query/).

## Install

```bash
$ yarn add @comunica/actor-rdf-resolve-hypermedia-links-queue-wrapper-summaries
```

## Configure

After installing, this package can be added to your engine's configuration as follows:
```text
{
  "@context": [
    ...
    "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-rdf-resolve-hypermedia-links-queue-wrapper-summaries/^0.0.0/components/context.jsonld",
  ],
  "actors": [
    ...
    {
      "@id": "urn:comunica:default:rdf-resolve-hypermedia-links-queue/actors#wrapper-summaries",
      "@type": "ActorRdfResolveHypermediaLinksQueueWrapperSummaries",
      "beforeActors": { "@id": "urn:comunica:default:rdf-resolve-hypermedia-links-queue/actors#fifo" },
      "mediatorRdfResolveHypermediaLinksQueue": { "@id": "urn:comunica:default:rdf-resolve-hypermedia-links-queue/mediators#main" },
      "mediatorHttp": { "@id": "urn:comunica:default:http/mediators#main" }
    }
  ]
}

```

### Config Parameters

* `mediatorHttp`: A mediator over the [HTTP bus](https://github.com/comunica/comunica/tree/master/packages/bus-http).
* `mediatorRdfResolveHypermediaLinksQueue`: A mediator over the [RDF Resolve Hypermedia Links Queue bus](https://github.com/comunica/comunica/tree/master/packages/bus-rdf-resolve-hypermedia-links-queue).
