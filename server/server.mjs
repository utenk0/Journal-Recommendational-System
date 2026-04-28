import http from 'node:http'
import { URL } from 'node:url'
import { getJournalById, getJournals } from './services/journalService.mjs'

const PORT = Number(process.env.API_PORT || 8787)

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  response.end(JSON.stringify(payload))
}

const server = http.createServer(async (request, response) => {
  if (!request.url) {
    sendJson(response, 400, { error: 'Missing request URL' })
    return
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    response.end()
    return
  }

  const url = new URL(request.url, `http://${request.headers.host}`)

  try {
    if (request.method === 'GET' && url.pathname === '/api/journals') {
      const payload = await getJournals({
        title: url.searchParams.get('title') ?? '',
        abstractText: url.searchParams.get('abstractText') ?? '',
        references: url.searchParams.get('references') ?? '',
        domain: url.searchParams.get('domain') ?? 'all',
        openAccessOnly: url.searchParams.get('openAccessOnly') === 'true',
        keyword: url.searchParams.get('keyword') ?? '',
        sortBy: url.searchParams.get('sortBy') ?? 'relevance',
      })
      sendJson(response, 200, payload)
      return
    }

    if (request.method === 'GET' && url.pathname.startsWith('/api/journals/')) {
      const id = decodeURIComponent(url.pathname.replace('/api/journals/', ''))
      const journal = await getJournalById(id)

      if (!journal) {
        sendJson(response, 404, { error: `Journal ${id} not found` })
        return
      }

      sendJson(response, 200, journal)
      return
    }

    sendJson(response, 404, { error: 'Route not found' })
  } catch (error) {
    sendJson(response, 500, {
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
    })
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Journal API listening on http://127.0.0.1:${PORT}`)
})
