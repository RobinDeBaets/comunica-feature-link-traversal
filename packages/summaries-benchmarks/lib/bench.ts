import * as fs from 'fs';
import { KEY_SUMMARIES } from '@comunica/actor-rdf-resolve-hypermedia-links-queue-wrapper-summaries';
import { QueryEngine } from '@comunica/query-sparql-link-traversal';
import { QueryEngine as QueryEngineSummaries } from '@comunica/query-sparql-link-traversal-summaries';

const regularEngine = new QueryEngine();
const summaryEngine = new QueryEngineSummaries();

async function streamToString(readable): Promise<string> {
  readable.setEncoding('utf8');
  let data = '';
  for await (const chunk of readable) {
    data += chunk;
  }
  return data;
}

async function fileToString(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, async(error, fileData) => {
      if (error) {
        reject(new Error(`Could not read file ${filePath}\n`));
      }
      resolve(fileData.toString());
    });
  });
}

async function benchmark(queryFile, queryEngine, sources, summary): Promise<void> {
  const query = await fileToString(queryFile);

  async function getResult() {
    return await queryEngine.query(query, {
      sources,
      [KEY_SUMMARIES.name]: summary || {},
    });
  }

  const startTime = performance.now();
  const statsResult = await getResult();
  const statsData = (await queryEngine.resultToString(statsResult,
    'stats')).data;
  const endTime = performance.now();

  const statsString = await streamToString(statsData);
  const statsStringSplit = statsString.split('\n');
  const statsSummary = statsStringSplit.at(-2);
  const statsSummarySplit = statsSummary.split(',');
  const numberOfHttpRequests = Number.parseInt(statsSummarySplit[2]);
  console.log(`Number of HTTP requests: ${numberOfHttpRequests}`);

  const runTime = endTime - startTime;
  console.log(`Execution time: ${runTime.toFixed(2)}ms`);

  const result = await getResult();
  const bindingsStream = await result.execute();
  const bindings = await bindingsStream.toArray();
  console.log(`Number of results: ${bindings.length}`);
}

async function run() {
  const podsData = await fileToString('example/pods.txt');
  const pods = podsData.split('\n');
  const scenarios = [
    {
      name: 'Scenario 1',
      queryFile: 'queries/1.sparql',
      engine: regularEngine,
    },
    {
      name: 'Scenario 2',
      queryFile: 'queries/1.sparql',
      engine: summaryEngine,
    },
    // {
    //   name: 'Scenario 3',
    //   queryFile: 'queries/2.sparql',
    //   engine: regularEngine,
    //   sources: pods,
    // },
    {
      name: 'Scenario 4',
      queryFile: 'queries/2.sparql',
      engine: summaryEngine,
      summary: {
        '@graph': [{
          '@id': 'http://localhost:8000/podsummary',
          '@type': 'summary:Summary',
          'summary:multiDimensionalTableSize': 2_048,
          summaryFile: 'http://localhost:8000/podsummary',
          summaryType: 'summary:MultiDimensionalTable',
        }],
        '@id': 'urn:x-arq:DefaultGraphNode',
        '@context': {
          multiDimensionalTableSize: {
            '@id': 'http://localhost:8000/summary#multiDimensionalTableSize',
            '@type': 'http://www.w3.org/2001/XMLSchema#integer',
          },
          summaryFile: {
            '@id': 'http://localhost:8000/summary#summaryFile',
            '@type': '@id',
          },
          summaryType: {
            '@id': 'http://localhost:8000/summary#summaryType',
            '@type': '@id',
          },
          summary: 'http://localhost:8000/summary#',
        },
      },
    },
    // {
    //   name: 'Scenario 5',
    //   queryFile: 'queries/3.sparql',
    //   engine: regularEngine,
    //   sources: pods,
    // },
    {
      name: 'Scenario 6',
      queryFile: 'queries/3.sparql',
      engine: summaryEngine,
      summary: {
        '@graph': [{
          '@id': 'http://localhost:8000/podsummary',
          '@type': 'summary:Summary',
          'summary:multiDimensionalTableSize': 2_048,
          summaryFile: 'http://localhost:8000/podsummary',
          summaryType: 'summary:MultiDimensionalTable',
        }],
        '@id': 'urn:x-arq:DefaultGraphNode',
        '@context': {
          multiDimensionalTableSize: {
            '@id': 'http://localhost:8000/summary#multiDimensionalTableSize',
            '@type': 'http://www.w3.org/2001/XMLSchema#integer',
          },
          summaryFile: {
            '@id': 'http://localhost:8000/summary#summaryFile',
            '@type': '@id',
          },
          summaryType: {
            '@id': 'http://localhost:8000/summary#summaryType',
            '@type': '@id',
          },
          summary: 'http://localhost:8000/summary#',
        },
      },
    },
  ];
  for (const scenario of scenarios) {
    console.log(`=== Scenario: ${scenario.name} ===`);
    try {
      await benchmark(scenario.queryFile, scenario.engine, scenario.sources, scenario.summary);
    } catch (error) {
      console.log(error);
    }
  }
}

run();

