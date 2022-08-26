# Comunica Extract Summaries

[![npm version](https://badge.fury.io/js/%40comunica%2Factor-extract-links-summaries.svg)](https://www.npmjs.com/package/@comunica/actor-extract-links-summaries)

An [RDF Metadata Extract](https://github.com/comunica/comunica/tree/master/packages/bus-extract-links) actor that listens to 
incoming triples for declared datasource summaries and extract links to follow based from these summaries based on the current query context.

This module is part of the [Comunica framework](https://github.com/comunica/comunica),
and should only be used by [developers that want to build their own query engine](https://comunica.dev/docs/modify/).

[Click here if you just want to query with Comunica](https://comunica.dev/docs/query/).

## Install

```bash
$ yarn add @comunica/actor-extract-links-summaries
```

## Metadata entries

This actor adds the following entries to the metadata object.

* `traverse`: Array of URLs to traverse.

## Configure

After installing, this package can be added to your engine's configuration as follows:
```text
{
  "@context": [
    ...
    "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-extract-links-summaries/^0.0.0/components/context.jsonld"
  ],
  "actors": [
    ...
    {
      "@id": "urn:comunica:default:extract-links/actors#summaries",
      "@type": "ActorExtractLinksSummaries",
      "mediatorHttp": { "@id": "urn:comunica:default:http/mediators#main" }
    }
  ]
}
```

### Config Parameters

* `mediatorHttp`: A mediator over the [HTTP bus](https://github.com/comunica/comunica/tree/master/packages/bus-http).

