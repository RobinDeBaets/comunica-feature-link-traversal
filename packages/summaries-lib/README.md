# Summaries Library

This package implements the loading, parsing, and interpreting of summaries. It contains implementations for the Bloom Filter as well as the Multidimensional Histogram.
The library has methods to extract the list of triple patterns from the current query context and methods to test these triples against summaries.

The vocabulary used is declared in [vocabulary/vocabulary.ttl](vocabulary/vocabulary.ttl).

## CLI tools

The library contains commands to create summary files of the supported datastructures:

- Bloom Filters
 ```
bloom-filter-creator

Create a bloom filter summary file

Options:
  --help           Show help                                           [boolean]
  --version        Show version number                                 [boolean]
  --source         RDF datasource to create a summary of     [string] [required]
  --output         file to write the summary to              [string] [required]
  --filtersize     size of the bloom filter                  [number] [required]
  --hashfunctions  number of hashfunctions to use            [number] [required]
  --serve
```

- Multidimensional Histograms
```
multi-dimensional-table-creator

Create a multidimensional summary file

Options:
  --help         Show help                                             [boolean]
  --version      Show version number                                   [boolean]
  --sourcesfile  file with list of RDF datasources to create a summary of
                                                             [string] [required]
  --output       file to write the summary to                [string] [required]
  --tablesize    size of the table                           [number] [required]
  --maxvar       maximum number of variables                 [number] [required]
```
